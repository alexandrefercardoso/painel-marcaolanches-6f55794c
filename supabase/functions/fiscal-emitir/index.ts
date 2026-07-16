// supabase/functions/fiscal-emitir/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import {
  onlyNumbers,
  formatCurrency,
  removeAcento,
  calcularTributosPedido,
} from "../_shared/fiscal-calculo.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}


// ============================================================
// MAPEAMENTOS
// ============================================================

const UF_TO_CUF: Record<string, number> = {
  'SP': 35, 'RJ': 33, 'MG': 31, 'PR': 41, 'SC': 42, 'RS': 43,
  'BA': 29, 'DF': 53, 'GO': 52, 'MS': 50, 'MT': 51, 'ES': 32,
  'PE': 26, 'CE': 23, 'RN': 24, 'PB': 25, 'AL': 27, 'SE': 28,
  'MA': 21, 'PI': 22, 'PA': 15, 'TO': 17, 'AM': 13, 'RR': 14,
  'RO': 11, 'AC': 12, 'AP': 16
};

const TIPO_PAGAMENTO_MAP: Record<string, string> = {
  'A VISTA': '01', 'DINHEIRO': '01', 'CHEQUE': '02',
  'CARTAO': '03', 'CREDITO': '03', 'DEBITO': '04',
  'PRAZO': '14', 'PIX': '17'
};

// ============================================================
// HELPERS
// ============================================================

// ------------------------------------------------------------
// Helpers locais (apenas os que continuam usados só aqui)
// ------------------------------------------------------------

function formatDateISO(date: Date): string {
  const offset = -3;
  const d = new Date(date.getTime() + (offset * 60 * 60 * 1000));
  return d.toISOString().replace('Z', '-03:00');
}



// ============================================================
// FUNÇÃO: getEndpoint
// ============================================================

async function getEndpoint(supabase: any, chave: string, params?: Record<string, string>): Promise<string> {
  const { data, error } = await supabase
    .from('fiscal_api_endpoints')
    .select('url')
    .eq('chave', chave)
    .eq('active', true)
    .single();

  if (error || !data) {
    throw new Error(`Endpoint não encontrado: ${chave}`);
  }

  let url = data.url;
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`{${key}}`, value);
    }
  }
  return url;
}

// ============================================================
// FUNÇÃO: getToken
// ============================================================

async function getToken(supabase: any, settings: any, scope: string = 'nfce nfe'): Promise<string> {
  const now = new Date();
  const isNfce = scope.includes('nfce');
  const tokenField = isNfce ? 'access_token_nuvemf_nfce' : 'access_token_nuvemf_nfe';
  const expireField = isNfce ? 'expire_token_nuvemf_nfce' : 'expire_token_nuvemf_nfe';
  const legacyField = isNfce ? 'access_token_nfce' : 'access_token_nfe';

  const currentToken = settings[tokenField] as string | null;
  const currentExpire = settings[expireField] as string | null;
  if (currentToken && currentExpire) {
    const expMs = new Date(currentExpire).getTime();
    if (expMs > now.getTime() + 300000) return currentToken;
  }

  const authUrl = await getEndpoint(supabase, 'auth');
  const clientId = settings.client_id;
  const clientSecret = settings.client_secret;

  if (!clientId || !clientSecret) {
    throw new Error('Credenciais fiscais não configuradas');
  }

  const response = await fetch(authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: scope
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Erro ao obter token: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  const token = data.access_token;
  const expiresIn = data.expires_in || 3600;
  const newExpiresAt = new Date(now.getTime() + Math.max(expiresIn - 60, 60) * 1000);

  await supabase
    .from('store_settings')
    .update({
      [tokenField]: token,
      [expireField]: newExpiresAt.toISOString(),
      [legacyField]: token,
    })
    .eq('id', settings.id);

  return token;
}


// Funções de cálculo (montarICMS, montarPIS, montarCOFINS, montarIBSCBS)
// foram movidas para ../_shared/fiscal-calculo.ts e são reutilizadas por
// fiscal-emitir (emissão real) e fiscal-preview (pré-visualização).



// ============================================================
// FUNÇÃO PRINCIPAL: emitirNota
// ============================================================

async function emitirNota(supabase: any, pedidoId: string, tipo: 'NFCE' | 'NFE', preview = false): Promise<any> {
  const validationWarnings: string[] = [];
  const { data: order, error: orderError } = await supabase
    .from('delivery_orders')
    .select(`*, customer:customers(*)`)
    .eq('id', pedidoId)
    .single();

  if (orderError || !order) throw new Error('Pedido não encontrado');
  if (!preview && order.status !== 'delivered') throw new Error('Pedido não finalizado/pago');

  if (!preview) {
    const { data: existingDoc } = await supabase
      .from('fiscal_documents')
      .select('id')
      .eq('pedido_id', pedidoId)
      .eq('status', 'autorizada')
      .maybeSingle();

    if (existingDoc) throw new Error('Nota já emitida para este pedido');
  }

  const { data: settings, error: settingsError } = await supabase
    .from('store_settings')
    .select('*')
    .single();

  if (settingsError || !settings) throw new Error('Configurações não encontradas');

  const { data: noteConfig, error: configError } = await supabase
    .from('fiscal_note_config')
    .select('*')
    .eq('active', true)
    .single();

  if (configError || !noteConfig) throw new Error('Configuração da nota não encontrada');

  const { data: items, error: itemsError } = await supabase
    .from('delivery_order_items')
    .select(`*, product:products(*, tax_rule:product_tax_rules(*))`)
    .eq('order_id', pedidoId);

  if (itemsError || !items || items.length === 0) throw new Error('Itens não encontrados');

  let numero: number;
  let serie: number;

  if (preview) {
    numero = 0;
    serie = tipo === 'NFCE' ? (settings.serie_nfce || 1) : (settings.serie_nfe || 1);
  } else if (tipo === 'NFCE') {
    const { data } = await supabase.rpc('reserve_fiscal_number', { tipo: 'NFCE' });
    numero = data;
    serie = settings.serie_nfce || 1;
  } else {
    const { data } = await supabase.rpc('reserve_fiscal_number', { tipo: 'NFE' });
    numero = data;
    serie = settings.serie_nfe || 1;
  }

  const cliente = order.customer || {};
  const ufEmitente = settings.state || 'SP';
  const ufCliente = cliente.estado_cli || settings.state || 'SP';
  const isInterestadual = ufCliente !== ufEmitente;
  const now = new Date();
  const dhEmi = formatDateISO(now);

  const { det, totais, warnings: calcWarnings } = calcularTributosPedido({
    items,
    settings,
    ufCliente,
    ufEmitente,
    preview,
  });
  if (calcWarnings.length) validationWarnings.push(...calcWarnings);

  const {
    total_vBC,
    total_vICMS,
    total_vProd,
    total_vPIS,
    total_vCOFINS,
    total_vIBS,
    total_vCBS,
    total_vNF,
  } = totais;

  const infNFe: any = {
    versao: noteConfig.versao || '4.00',
    ide: {
      cUF: UF_TO_CUF[ufEmitente] || 35,
      natOp: settings.natop || 'VENDA DE MERCADORIA',
      mod: tipo === 'NFCE' ? (noteConfig.mod_nfce || 65) : (noteConfig.mod_nfe || 55),
      serie: serie,
      nNF: numero,
      dhEmi: dhEmi,
      tpNF: noteConfig.tp_nf || 1,
      idDest: isInterestadual ? 2 : 1,
      cMunFG: settings.cod_municipio || '3550308',
      tpImp: noteConfig.tp_imp || 4,
      tpEmis: noteConfig.tp_emis || 1,
      tpAmb: settings.tpamb || 2,
      finNFe: noteConfig.fin_nfe || 1,
      indFinal: noteConfig.ind_final || 1,
      indPres: noteConfig.ind_pres || 1,
      indIntermed: noteConfig.ind_intermed || 0,
      procEmi: noteConfig.proc_emi || 0,
      verProc: noteConfig.ver_proc || '4.00'
    },
    emit: {
      CNPJ: onlyNumbers(settings.cnpj),
      xNome: removeAcento(settings.razao_social || settings.name || ''),
      xFant: removeAcento(settings.nome_fantasia || settings.name || ''),
      enderEmit: {
        xLgr: removeAcento(settings.address || ''),
        nro: settings.address_number || 'SN',
        xCpl: 'SC',
        xBairro: removeAcento(settings.neighborhood || ''),
        cMun: settings.cod_municipio || '3550308',
        xMun: removeAcento(settings.city || ''),
        UF: ufEmitente,
        CEP: onlyNumbers(settings.zip_code || ''),
        cPais: '1058',
        xPais: 'Brasil',
        fone: onlyNumbers(settings.whatsapp_number || '')
      },
      IE: onlyNumbers(settings.ie || ''),
      CRT: settings.crt || 1
    }
  };

  if (cliente.id && cliente.id !== 1 && cliente.id !== 0) {
    const cpf = onlyNumbers(cliente.cpf);
    const cnpj = onlyNumbers(cliente.cnpj);

    if (cpf || cnpj) {
      const dest: any = {};
      if (cnpj && cnpj.length === 14) {
        dest.CNPJ = cnpj;
        dest.indIEDest = 1;
      } else if (cpf) {
        dest.CPF = cpf;
        dest.indIEDest = 9;
      }
      dest.xNome = removeAcento(cliente.cliente || 'Consumidor Final');
      dest.enderDest = {
        xLgr: removeAcento(cliente.ende_cli || ''),
        nro: cliente.numerocli || 'SN',
        xCpl: 'SC',
        xBairro: removeAcento(cliente.bairro_cli || ''),
        cMun: cliente.id_cidadecli || settings.cod_municipio || '3550308',
        xMun: removeAcento(cliente.cidade_cli || settings.city || ''),
        UF: cliente.estado_cli || ufEmitente,
        CEP: onlyNumbers(cliente.cep_cli || settings.zip_code || ''),
        cPais: '1058',
        xPais: 'Brasil'
      };
      infNFe.dest = dest;
    }
  }

  infNFe.det = det;
  infNFe.total = {
    ICMSTot: {
      vBC: formatCurrency(total_vBC),
      vICMS: formatCurrency(total_vICMS),
      vICMSDeson: '0.00',
      vFCP: '0.00',
      vBCST: '0.00',
      vST: '0.00',
      vFCPST: '0.00',
      vFCPSTRet: '0.00',
      vProd: formatCurrency(total_vProd),
      vFrete: '0.00',
      vSeg: '0.00',
      vDesc: '0.00',
      vII: '0.00',
      vIPI: '0.00',
      vIPIDevol: '0.00',
      vPIS: formatCurrency(total_vPIS),
      vCOFINS: formatCurrency(total_vCOFINS),
      vOutro: '0.00',
      vNF: formatCurrency(total_vNF)
    }
  };

  if (total_vIBS > 0 || total_vCBS > 0) {
    infNFe.total.IBSCBSTot = {
      vBCIBSCBS: formatCurrency(total_vProd),
      vIBS: formatCurrency(total_vIBS),
      vCBS: formatCurrency(total_vCBS)
    };
  }

  infNFe.transp = { modFrete: 9 };

  const tipoVenda = order.tipo_venda?.toUpperCase() || '';
  const tPag = TIPO_PAGAMENTO_MAP[tipoVenda] || '99';
  infNFe.pag = {
    detPag: [{ indPag: 0, tPag: tPag, vPag: formatCurrency(total_vNF) }],
    vTroco: '0.00'
  };

  infNFe.infRespTec = {
    CNPJ: onlyNumbers(noteConfig.resp_tec_cnpj || '14427878000112'),
    xContato: noteConfig.resp_tec_contato || 'VLINK TECNOLOGIA LTDA',
    email: noteConfig.resp_tec_email || 'daniel.vlink@gmail.com',
    fone: onlyNumbers(noteConfig.resp_tec_fone || '15996535505')
  };

  const ambiente = settings.tpamb === 1 ? 'producao' : 'homologacao';
  const payload = { infNFe, ambiente };

  if (preview) {
    return { preview: true, tipo, serie, numero, ambiente, request_json: payload, warnings: validationWarnings };
  }

  const token = await getToken(supabase, settings, tipo === 'NFCE' ? noteConfig.scope_nfce : noteConfig.scope_nfe);
  const endpoint = tipo === 'NFCE' ? 'nfce_emitir' : 'nfe_emitir';
  const url = await getEndpoint(supabase, endpoint);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const responseData = await response.json();

  if (response.status !== 200) {
    throw new Error(`Erro HTTP: ${response.status} - ${JSON.stringify(responseData)}`);
  }

  const docData: any = {
    tipo: tipo,
    modelo: tipo === 'NFCE' ? 65 : 55,
    serie: serie,
    numero: numero,
    id_nuvemfiscal: responseData.id || '',
    chave_acesso: responseData.chave || '',
    protocolo: responseData.autorizacao?.numero_protocolo || '',
    codigo_status: responseData.autorizacao?.codigo_status || '',
    motivo_status: responseData.autorizacao?.motivo_status || '',
    status: responseData.status || 'pendente',
    pedido_id: pedidoId,
    cliente_nome: cliente.cliente || '',
    valor_produtos: total_vProd,
    valor_total: total_vNF,
    valor_icms: total_vICMS,
    valor_pis: total_vPIS,
    valor_cofins: total_vCOFINS,
    valor_ibs: total_vIBS,
    valor_cbs: total_vCBS,
    ambiente: settings.tpamb || 2,
    request_json: payload,
    response_json: responseData,
    emitido_em: new Date().toISOString()
  };

  if (responseData.autorizacao?.codigo_status === '100') {
    docData.status = 'autorizada';
  }

  const { data: doc } = await supabase
    .from('fiscal_documents')
    .insert(docData)
    .select()
    .single();

  return { document: doc, chave: responseData.chave, status: responseData.status };
}

// ============================================================
// SERVE
// ============================================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

  let pedido_id: string | undefined;
  let tipo: string | undefined;
  let preview = false;

  const logToDb = async (logTipo: string, titulo: string, mensagem: string, diagnostics: any = null, raw: any = null) => {
    if (!supabase) return;
    try {
      await supabase.from('fiscal_error_logs').insert({
        pedido_id: pedido_id ?? null,
        tipo: logTipo,
        titulo,
        mensagem,
        diagnostics,
        raw: raw ? (typeof raw === 'string' ? raw : JSON.stringify(raw)) : null,
      });
    } catch (e) {
      console.error('failed to log fiscal_error_logs:', e);
    }
  };

  try {
    const body = await req.json();
    pedido_id = body.pedido_id;
    tipo = body.tipo;

    await logToDb('info', `Chamada ${tipo ?? '?'}`, `Início da emissão de ${tipo ?? '?'} para pedido ${pedido_id ?? '?'}`, { request: body });

    if (!pedido_id || !tipo) {
      await logToDb('error', 'Parâmetros inválidos', 'pedido_id e tipo são obrigatórios', { body });
      return new Response(
        JSON.stringify({ error: 'pedido_id e tipo são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['NFCE', 'NFE'].includes(tipo)) {
      await logToDb('error', 'Tipo inválido', `tipo deve ser NFCE ou NFE (recebido: ${tipo})`, { body });
      return new Response(
        JSON.stringify({ error: 'tipo deve ser NFCE ou NFE' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!supabase) {
      return new Response(
        JSON.stringify({ success: false, error: 'Configuração do servidor ausente' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    preview = body.preview === true;
    const result = await emitirNota(supabase, pedido_id, tipo as 'NFCE' | 'NFE', preview);

    await logToDb(
      'success',
      `${tipo} emitida`,
      `Status: ${result.status ?? 'pendente'} | Chave: ${result.chave ?? '-'}`,
      { document_id: result.document?.id, chave: result.chave, status: result.status },
      result
    );

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const msg = (error as Error).message || String(error);
    const stack = (error as Error).stack;
    console.error('fiscal-emitir error:', error);
    await logToDb('error', `Falha ao emitir ${tipo ?? ''}`.trim(), msg, { stack }, msg);
    if (preview) {
      return new Response(
        JSON.stringify({ success: false, preview: true, tipo, pedido_id, error: msg, stack }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

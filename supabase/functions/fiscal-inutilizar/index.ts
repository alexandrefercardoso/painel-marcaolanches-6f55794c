// supabase/functions/fiscal-inutilizar/index.ts
// Inutilização de numeração de NFCe/NFe

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

async function getEndpoint(supabase: any, chave: string, params?: Record<string, string>): Promise<string> {
  const { data, error } = await supabase
    .from('fiscal_api_endpoints')
    .select('url')
    .eq('chave', chave)
    .eq('active', true)
    .single();

  if (error || !data) throw new Error(`Endpoint não encontrado: ${chave}`);

  let url = data.url;
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`{${key}}`, value);
    }
  }
  return url;
}

async function getToken(supabase: any, settings: any, scope: string = 'nfce nfe'): Promise<string> {
  const now = new Date();
  const expiresAt = settings.token_expires_at_fiscal ? new Date(settings.token_expires_at_fiscal) : null;

  if (settings.access_token_fiscal && expiresAt && expiresAt.getTime() > now.getTime() + 300000) {
    return settings.access_token_fiscal;
  }

  const authUrl = await getEndpoint(supabase, 'auth');
  const clientId = settings.client_id_fiscal;
  const clientSecret = settings.client_secret_fiscal;

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
      scope,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Erro ao obter token: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  const token = data.access_token;
  const expiresIn = data.expires_in || 3600;
  const newExpiresAt = new Date(now.getTime() + expiresIn * 1000);

  await supabase
    .from('store_settings')
    .update({
      access_token_fiscal: token,
      token_expires_at_fiscal: newExpiresAt.toISOString(),
    })
    .eq('id', settings.id);

  return token;
}

async function registrarLog(
  supabase: any,
  evento: string,
  tipo: string,
  pedidoId: string | null,
  fiscalDocId: string | null,
  status: string,
  mensagem: string,
  detalhes: any = null,
): Promise<void> {
  try {
    await supabase.rpc('registrar_log_fiscal', {
      p_evento: evento,
      p_tipo: tipo,
      p_pedido_id: pedidoId,
      p_fiscal_document_id: fiscalDocId,
      p_status: status,
      p_mensagem: mensagem,
      p_detalhes: detalhes,
    });
  } catch (error) {
    console.error('Erro ao registrar log:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { tipo, serie, numero_inicial, numero_final, justificativa } = await req.json();

    if (!tipo || !['NFCE', 'NFE'].includes(tipo)) {
      return new Response(JSON.stringify({ error: 'tipo deve ser NFCE ou NFE' }), { status: 400, headers: jsonHeaders });
    }
    if (!serie || serie <= 0) {
      return new Response(JSON.stringify({ error: 'Série é obrigatória e deve ser maior que 0' }), { status: 400, headers: jsonHeaders });
    }
    if (!numero_inicial || numero_inicial <= 0) {
      return new Response(JSON.stringify({ error: 'Número inicial é obrigatório e deve ser maior que 0' }), { status: 400, headers: jsonHeaders });
    }
    if (!numero_final || numero_final <= 0 || numero_final < numero_inicial) {
      return new Response(JSON.stringify({ error: 'Número final deve ser maior que o número inicial' }), { status: 400, headers: jsonHeaders });
    }
    if (!justificativa || justificativa.length < 15) {
      return new Response(JSON.stringify({ error: 'Justificativa deve ter no mínimo 15 caracteres' }), { status: 400, headers: jsonHeaders });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: settings, error: settingsError } = await (supabase as any)
      .from('store_settings')
      .select('*')
      .single();

    if (settingsError || !settings) throw new Error('Configurações não encontradas');

    const { data: noteConfig, error: configError } = await (supabase as any)
      .from('fiscal_note_config')
      .select('*')
      .eq('active', true)
      .single();

    if (configError || !noteConfig) throw new Error('Configuração da nota não encontrada');

    const { data: existingDocs, error: docsError } = await (supabase as any)
      .from('fiscal_documents')
      .select('numero, status')
      .eq('tipo', tipo)
      .eq('serie', serie)
      .gte('numero', numero_inicial)
      .lte('numero', numero_final);

    if (docsError) throw new Error('Erro ao verificar documentos existentes');

    const usedNumbers = (existingDocs as any[] | null)?.filter((d) => d.status !== 'inutilizada') || [];
    if (usedNumbers.length > 0) {
      const errorMsg = `Existem números já utilizados no intervalo: ${usedNumbers.map((d) => d.numero).join(', ')}`;
      await registrarLog(supabase, 'ERRO_INUTILIZACAO', 'INUTILIZACAO', null, null, 'erro', errorMsg, {
        tipo, serie, numero_inicial, numero_final, used_numbers: usedNumbers.map((d) => d.numero),
      });
      return new Response(
        JSON.stringify({ error: errorMsg, used_numbers: usedNumbers.map((d) => d.numero) }),
        { status: 400, headers: jsonHeaders }
      );
    }

    const scope = tipo === 'NFCE' ? noteConfig.scope_nfce : noteConfig.scope_nfe;
    const token = await getToken(supabase, settings, scope);

    const cnpj = settings.cnpj?.replace(/\D/g, '') || '';

    const payload = {
      cnpj,
      modelo: tipo === 'NFCE' ? 65 : 55,
      serie,
      numero_inicial,
      numero_final,
      justificativa,
      ambiente: settings.tpamb === 1 ? 'producao' : 'homologacao',
    };

    const endpointChave = tipo === 'NFCE' ? 'nfce_inutilizar' : 'nfe_inutilizar';
    const url = await getEndpoint(supabase, endpointChave);

    console.log('Enviando inutilização para:', url);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (response.status !== 200 && response.status !== 201) {
      const errorMsg = `Erro ao inutilizar: ${response.status} - ${JSON.stringify(responseData)}`;
      await registrarLog(supabase, 'ERRO_INUTILIZACAO', 'INUTILIZACAO', null, null, 'erro', errorMsg, {
        tipo, serie, numero_inicial, numero_final, payload, response: responseData,
      });
      throw new Error(errorMsg);
    }

    const documentsToInsert: any[] = [];
    const docIds: string[] = [];
    for (let num = numero_inicial; num <= numero_final; num++) {
      documentsToInsert.push({
        tipo,
        modelo: tipo === 'NFCE' ? 65 : 55,
        serie,
        numero: num,
        status: 'inutilizada',
        pedido_id: `INUTILIZACAO_${tipo}_${serie}_${num}`,
        pedido_tipo: 'inutilizacao',
        cliente_nome: 'INUTILIZAÇÃO',
        valor_produtos: 0,
        valor_total: 0,
        ambiente: settings.tpamb || 2,
        id_nuvemfiscal: responseData.id || null,
        chave_acesso: responseData.chave || null,
        protocolo: responseData.protocolo || null,
        codigo_status: responseData.codigo_status || 'inutilizada',
        motivo_status: justificativa,
        request_json: payload,
        response_json: responseData,
        emitido_em: new Date().toISOString(),
        created_at: new Date().toISOString(),
        cancelado_em: new Date().toISOString(),
      });
    }

    const { data: insertedDocs, error: insertError } = await (supabase as any)
      .from('fiscal_documents')
      .insert(documentsToInsert)
      .select('id');

    if (insertError) {
      console.error('Erro ao salvar registros de inutilização:', insertError);
      await registrarLog(supabase, 'ERRO_INUTILIZACAO', 'INUTILIZACAO', null, null, 'erro',
        'Erro ao salvar registros no banco: ' + insertError.message,
        { tipo, serie, numero_inicial, numero_final });
    } else {
      docIds.push(...((insertedDocs as any[] | null)?.map((d) => d.id) || []));
      await registrarLog(supabase, 'INUTILIZACAO', 'INUTILIZACAO', null, docIds[0] || null, 'sucesso',
        `Inutilização realizada: ${numero_final - numero_inicial + 1} números da ${tipo}`,
        { tipo, serie, numero_inicial, numero_final, quantidade: numero_final - numero_inicial + 1 });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Inutilização realizada com sucesso para ${numero_final - numero_inicial + 1} números`,
        data: responseData,
        quantidade: numero_final - numero_inicial + 1,
        intervalo: { inicial: numero_inicial, final: numero_final },
      }),
      { status: 200, headers: jsonHeaders }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Erro na inutilização:', message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: jsonHeaders }
    );
  }
});

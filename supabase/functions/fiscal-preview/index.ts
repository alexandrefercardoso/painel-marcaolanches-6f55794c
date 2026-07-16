// supabase/functions/fiscal-preview/index.ts
// Pré-visualização visual da nota (NFC-e/NF-e) SEM chamar o NuvemFiscal.
// Reusa o mesmo módulo de cálculo de tributos usado pela emissão real.

/* eslint-disable @typescript-eslint/no-explicit-any */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { calcularTributosPedido, formatCurrency, onlyNumbers } from "../_shared/fiscal-calculo.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// Placeholders visivelmente falsos — jamais confundidos com uma nota real.
const FAKE_CHAVE = "0".repeat(44);
const FAKE_PROTOCOLO = "PRÉVIA - NÃO EMITIDA";
const FAKE_QR = "";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const url = new URL(req.url);
    const orderId = normalizeId(
      body?.pedidoId ??
        body?.pedido_id ??
        body?.orderId ??
        url.searchParams.get("pedidoId") ??
        url.searchParams.get("pedido_id") ??
        url.searchParams.get("orderId"),
    );
    const tipo: "NFCE" | "NFE" = body?.tipo === "NFE" ? "NFE" : "NFCE";

    if (!orderId) {
      return json(
        {
          success: false,
          error: "pedidoId/orderId é obrigatório",
          received: body,
        },
        400,
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return json({ success: false, error: "Servidor mal configurado" }, 500);
    }
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // ---------- fetch pedido ----------
    const { data: order, error: orderError } = await supabase
      .from("delivery_orders")
      .select(
        "id, status, tipo_venda, total_amount, created_at, customer:customers(id, name, cpf, cnpj, address, address_number, neighborhood, city, state, zip_code, phone)",
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      // DEBUG TEMPORÁRIO — remover depois de identificar a causa raiz
      return json(
        {
          success: false,
          error: "Pedido não encontrado",
          debug: orderError,
        },
        404,
      );
    }

    const { data: settings, error: settingsError } = await supabase
      .from("store_settings")
      .select(
        "id, name, razao_social, nome_fantasia, cnpj, ie, address, address_number, neighborhood, city, state, zip_code, cod_municipio, natop, tpamb, crt, envia_ibscbs, serie_nfce, num_nfce, serie_nfe, num_nfe, whatsapp_number",
      )
      .single();

    if (settingsError || !settings) {
      // DEBUG TEMPORÁRIO — remover depois de identificar a causa raiz
      return json(
        {
          success: false,
          error: "Configurações não encontradas",
          debug: settingsError,
        },
        404,
      );
    }

    const { data: items, error: itemsError } = await supabase
      .from("delivery_order_items")
      .select(
        "id, order_id, product_id, quantity, unit_price, total_price, product:products(id, name, description, ncm, unidade, tax_rule:product_tax_rules(cst_icms_estadual, aliq_icms, red_bc, orig_icms, cst_pis, aliq_pis, cst_cofins, aliq_cofins, cst_ibscbs, aliq_ibsuf, aliq_ibsmun, aliq_cbs, cfop_estadual, cfop_interestadual))",
      )
      .eq("order_id", orderId);

    if (itemsError || !items || items.length === 0) {
      // DEBUG TEMPORÁRIO — remover depois de identificar a causa raiz
      return json(
        {
          success: false,
          error: "Itens não encontrados",
          debug: itemsError,
        },
        404,
      );
    }

    const cliente: any = order.customer || {};
    const ufEmitente = settings.state || "SP";
    const ufCliente = cliente.state || settings.state || "SP";

    // ---------- CÁLCULO (mesmo módulo da emissão real) ----------
    const { det, totais, warnings } = calcularTributosPedido({
      items,
      settings,
      ufCliente,
      ufEmitente,
      preview: true,
    });

    // ---------- monta payload de preview ----------
    const numero = tipo === "NFCE" ? settings.num_nfce || 0 : settings.num_nfe || 0;
    const serie = tipo === "NFCE" ? settings.serie_nfce || 1 : settings.serie_nfe || 1;

    const previewData = {
      preview: true,
      tipo,
      ambiente: settings.tpamb === 1 ? "producao" : "homologacao",
      // Placeholders explícitos e claramente falsos
      chNFe: FAKE_CHAVE,
      nProt: FAKE_PROTOCOLO,
      dhRecbto: new Date().toISOString(),
      qrCodeUrl: FAKE_QR,
      serie,
      numero,
      emitente: {
        cnpj: onlyNumbers(settings.cnpj || ""),
        razao_social: settings.razao_social || settings.name || "",
        nome_fantasia: settings.nome_fantasia || settings.name || "",
        ie: onlyNumbers(settings.ie || ""),
        endereco: {
          logradouro: settings.address || "",
          numero: settings.address_number || "SN",
          bairro: settings.neighborhood || "",
          municipio: settings.city || "",
          uf: ufEmitente,
          cep: onlyNumbers(settings.zip_code || ""),
        },
      },
      destinatario: cliente?.id
        ? {
            nome: cliente.name || "Consumidor Final",
            documento: onlyNumbers(cliente.cnpj || cliente.cpf || ""),
            endereco: {
              logradouro: cliente.address || "",
              numero: cliente.address_number || "SN",
              bairro: cliente.neighborhood || "",
              municipio: cliente.city || "",
              uf: cliente.state || ufEmitente,
              cep: onlyNumbers(cliente.zip_code || ""),
            },
          }
        : null,
      itens: det.map((d) => ({
        nItem: d.nItem,
        codigo: d.prod.cProd,
        descricao: d.prod.xProd,
        ncm: d.prod.NCM,
        cfop: d.prod.CFOP,
        unidade: d.prod.uCom,
        quantidade: d.prod.qCom,
        valor_unitario: d.prod.vUnCom,
        valor_total: d.prod.vProd,
        icms: d.imposto.ICMS,
        pis: d.imposto.PIS,
        cofins: d.imposto.COFINS,
        ibscbs: d.imposto.IBSCBS || null,
      })),
      totais: {
        vProd: formatCurrency(totais.total_vProd),
        vBC: formatCurrency(totais.total_vBC),
        vICMS: formatCurrency(totais.total_vICMS),
        vPIS: formatCurrency(totais.total_vPIS),
        vCOFINS: formatCurrency(totais.total_vCOFINS),
        vIBS: formatCurrency(totais.total_vIBS),
        vCBS: formatCurrency(totais.total_vCBS),
        vNF: formatCurrency(totais.total_vNF),
      },
      warnings,
    };

    return json({ success: true, data: previewData }, 200);
  } catch (error) {
    const msg = (error as Error).message || String(error);
    console.error("fiscal-preview error:", error);
    return json({ success: false, error: msg }, 500);
  }
});

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeId(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
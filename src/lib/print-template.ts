/**
 * Função central de geração de HTML para impressão.
 * Utilizada por todos os pontos de impressão do sistema
 * (delivery, mesa, cancelamento, relatórios, caixa).
 */

export interface PrintTemplateItem {
  name: string;
  quantity: number;
  price?: number;
  notes?: string;
  complements?: any[];
}

export interface PrintTemplateContent {
  order_number?: string;
  comanda_numero?: string;
  company_name?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  waiter_name?: string;
  sector_name?: string;
  notes?: string;
  total?: number;
  delivery_fee?: number;
  subtotal?: number;
  payment_method?: string;
  created_at?: string;
  items?: PrintTemplateItem[];
  payment_summary?: Array<{ label: string; value: string; strong?: boolean }>;
}

export interface GerarHtmlImpressaoParams {
  titulo: string;
  content: PrintTemplateContent;
  formato: "a4" | "thermal_80mm";
  rodapePersonalizado?: string;
}

const RODAPE_PADRAO_LINK =
  '<a href="https://www.meupedix.com.br" target="_blank" style="color: #888; text-decoration: none; font-size: 10px;">www.meupedix.com.br</a>';

function formatCurrency(value?: number): string {
  const n = Number(value || 0);
  return `R$ ${n.toFixed(2).replace(".", ",")}`;
}

function formatDate(value?: string): string {
  try {
    const d = value ? new Date(value) : new Date();
    return d.toLocaleString("pt-BR");
  } catch {
    return "";
  }
}

function getComplementName(c: any): string {
  if (!c) return "";
  if (typeof c === "string") return c;
  return c.name || c.nome || "";
}

function renderThermal(params: GerarHtmlImpressaoParams): string {
  const { titulo, content, rodapePersonalizado } = params;

  const itemsHtml = (content.items || [])
    .map(
      (item) => {
        const priceStr =
          item.price !== undefined
            ? formatCurrency(Number(item.price) * Number(item.quantity || 1))
            : "";
        return `
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 4px; font-size: 12px;">
        <tr>
          <td style="font-weight: bold; word-break: break-word; padding-right: 4px;">${item.quantity}x ${item.name}</td>
          <td style="font-weight: bold; text-align: right; white-space: nowrap; vertical-align: top; width: 1%;">${priceStr}</td>
        </tr>
        ${item.notes ? `<tr><td colspan="2" style="font-size: 10px; font-style: italic;">Obs: ${item.notes}</td></tr>` : ""}
        ${
          item.complements && item.complements.length > 0
            ? `<tr><td colspan="2" style="padding-left: 8px; font-size: 10px;">
                ${item.complements.map((c) => `+ ${getComplementName(c)}`).join("<br/>")}
              </td></tr>`
            : ""
        }
      </table>
    `;
      },
    )
    .join("");

  return `<html>
  <head>
    <title>${titulo} ${content.order_number || ""}</title>
    <style>
      @page { size: 80mm auto; margin: 0; }
      * { box-sizing: border-box; }
      html, body { width: 72mm; }
      body { font-family: 'Courier New', Courier, monospace; padding: 2mm; margin: 0; font-size: 12px; word-wrap: break-word; overflow-wrap: break-word; }
      .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 5px; margin-bottom: 5px; }
      .header h1 { margin: 0 0 4px 0; font-size: 14px; text-transform: uppercase; word-break: break-word; }
      .header h2 { margin: 0; font-size: 13px; word-break: break-all; }
      .header p { margin: 2px 0; font-size: 11px; }
      .items { font-size: 12px; }
      .total { margin-top: 8px; border-top: 1px dashed #000; padding-top: 5px; text-align: right; font-weight: bold; font-size: 13px; }
      .footer { margin-top: 10px; border-top: 1px dashed #000; padding-top: 5px; text-align: center; font-size: 10px; }
    </style>
  </head>
  <body>
    <div class="header">
      ${content.company_name ? `<h1>${content.company_name}</h1>` : ""}
      <h2>${titulo}${content.order_number && !titulo.includes(String(content.order_number)) ? `: ${content.order_number}` : ""}</h2>
      ${content.comanda_numero ? `<p style="font-size: 14px; font-weight: bold; text-align: center; background: #000; color: #fff; padding: 2px 8px; border-radius: 3px; letter-spacing: 2px;">🎫 COMANDA ${content.comanda_numero}</p>` : ""}
      <p>${formatDate(content.created_at)}</p>
      ${content.sector_name ? `<p>SETOR: ${content.sector_name}</p>` : ""}
      ${content.customer_name ? `<p style="font-weight: bold;">Cliente: ${content.customer_name}</p>` : ""}
      ${content.customer_phone ? `<p>Tel: ${content.customer_phone}</p>` : ""}
      ${content.customer_address ? `<p>End: ${content.customer_address}</p>` : ""}
      ${content.waiter_name ? `<p>${content.waiter_name}</p>` : ""}
    </div>

    <div class="items">
      ${itemsHtml}
    </div>
    ${content.total !== undefined ? `<div class="total">TOTAL: ${formatCurrency(content.total)}</div>` : ""}
    ${content.payment_summary && content.payment_summary.length > 0 ? `
      <div style="margin-top: 6px; border-top: 1px dashed #000; padding-top: 5px; font-size: 12px;">
        ${content.payment_summary.map(r => `
          <div style="display:flex; justify-content:space-between; ${r.strong ? 'font-weight:bold; font-size:13px;' : ''}">
            <span>${r.label}</span><span>${r.value}</span>
          </div>`).join("")}
      </div>` : ""}
    ${content.notes ? `<div style="margin-top: 8px; font-size: 11px; border-top: 1px dashed #888; padding-top: 5px;"><strong>OBS:</strong> ${content.notes}</div>` : ""}
    <div class="footer">
      ${rodapePersonalizado ? `<p>${rodapePersonalizado}</p>` : ""}
      <div style="margin-top: 8px; border-top: 1px dashed #888; padding-top: 5px;">
        ${RODAPE_PADRAO_LINK}
      </div>
    </div>
    <script>
      window.onload = () => window.print();
    </script>
  </body>
</html>`;
}

function renderA4(params: GerarHtmlImpressaoParams): string {
  const { titulo, content, rodapePersonalizado } = params;

  const rowsHtml = (content.items || [])
    .map((item) => {
      const obs = [
        item.notes ? item.notes : "",
        item.complements && item.complements.length > 0
          ? item.complements.map((c) => `+ ${getComplementName(c)}`).join("<br/>")
          : "",
      ]
        .filter(Boolean)
        .join("<br/>");

      const valor =
        item.price !== undefined
          ? formatCurrency(Number(item.price) * Number(item.quantity || 1))
          : "";

      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e5e5; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e5e5;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e5e5; font-size: 12px; color: #555;">${obs}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e5e5; text-align: right;">${valor}</td>
        </tr>
      `;
    })
    .join("");

  return `<html>
  <head>
    <title>${titulo} ${content.order_number || ""}</title>
    <style>
      @page { size: A4; margin: 15mm; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #222; margin: 0; padding: 0; }
      .header { border-bottom: 2px solid #222; padding-bottom: 12px; margin-bottom: 20px; }
      .header h1 { margin: 0 0 4px 0; font-size: 22px; }
      .header h2 { margin: 0; font-size: 16px; color: #555; font-weight: 500; }
      .meta { display: flex; flex-wrap: wrap; gap: 16px; margin: 16px 0; font-size: 13px; color: #444; }
      .meta div { min-width: 160px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
      thead th { background: #f5f5f5; padding: 10px 8px; text-align: left; border-bottom: 2px solid #ccc; }
      thead th.center { text-align: center; }
      thead th.right { text-align: right; }
      .total { margin-top: 18px; text-align: right; font-size: 18px; font-weight: bold; border-top: 2px solid #222; padding-top: 10px; }
      .notes { margin-top: 16px; padding: 10px; background: #fafafa; border-left: 3px solid #888; font-size: 13px; }
      .footer { margin-top: 32px; padding-top: 12px; border-top: 1px dashed #aaa; text-align: center; font-size: 11px; color: #666; }
    </style>
  </head>
  <body>
    <div class="header">
      ${content.company_name ? `<div style="font-size: 13px; color: #555; text-transform: uppercase; letter-spacing: 1px;">${content.company_name}</div>` : ""}
      <h1>${titulo}</h1>
      ${content.order_number ? `<h2>Nº ${content.order_number}</h2>` : ""}
      ${content.comanda_numero ? `<div style="display:inline-block; background:#f97316; color:#fff; font-weight:bold; padding:4px 16px; border-radius:20px; font-size:13px; margin:4px 0; letter-spacing:1px;">🎫 Comanda ${content.comanda_numero}</div>` : ""}
    </div>

    <div class="meta">
      <div><strong>Data:</strong> ${formatDate(content.created_at)}</div>
      ${content.customer_name ? `<div><strong>Cliente:</strong> ${content.customer_name}</div>` : ""}
      ${content.customer_phone ? `<div><strong>Telefone:</strong> ${content.customer_phone}</div>` : ""}
      ${content.customer_address ? `<div><strong>Endereço:</strong> ${content.customer_address}</div>` : ""}
      ${content.waiter_name ? `<div><strong>Atendente:</strong> ${content.waiter_name}</div>` : ""}
      ${content.sector_name ? `<div><strong>Setor:</strong> ${content.sector_name}</div>` : ""}
    </div>

    <table>
      <thead>
        <tr>
          <th class="center" style="width: 60px;">Qtd</th>
          <th>Item</th>
          <th>Obs</th>
          <th class="right" style="width: 120px;">Valor</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    ${content.total !== undefined ? `<div class="total">TOTAL: ${formatCurrency(content.total)}</div>` : ""}

    ${content.payment_summary && content.payment_summary.length > 0 ? `
      <div style="margin-top: 12px; padding: 12px 16px; background: #fafafa; border: 1px solid #e5e5e5; border-radius: 6px;">
        <div style="font-weight:bold; text-transform:uppercase; font-size:12px; color:#555; margin-bottom:8px; letter-spacing:1px;">Resumo do Pagamento</div>
        ${content.payment_summary.map(r => `
          <div style="display:flex; justify-content:space-between; padding:4px 0; ${r.strong ? 'font-weight:bold; font-size:15px; border-top:1px solid #ccc; margin-top:4px; padding-top:8px;' : 'font-size:13px;'}">
            <span>${r.label}</span><span>${r.value}</span>
          </div>`).join("")}
      </div>` : ""}

    ${content.notes ? `<div class="notes"><strong>Observações:</strong><br/>${content.notes}</div>` : ""}

    <div class="footer">
      ${rodapePersonalizado ? `<p style="margin: 0 0 6px 0;">${rodapePersonalizado}</p>` : ""}
      ${RODAPE_PADRAO_LINK}
    </div>

    <script>
      window.onload = () => window.print();
    </script>
  </body>
</html>`;
}

export function gerarHtmlImpressao(params: GerarHtmlImpressaoParams): string {
  if (params.formato === "a4") return renderA4(params);
  return renderThermal(params);
}

// ============================================================
// Template: danfce_preview  (pré-visualização visual — SEM valor fiscal)
// ============================================================

export interface DanfePreviewItem {
  nItem: number;
  codigo: string;
  descricao: string;
  ncm: string;
  cfop?: string | number;
  unidade: string;
  quantidade: number;
  valor_unitario: string;
  valor_total: string;
}

export interface DanfePreviewData {
  tipo: "NFCE" | "NFE";
  ambiente: string;
  chNFe: string;
  nProt: string;
  dhRecbto: string;
  qrCodeUrl?: string;
  serie: number;
  numero: number;
  emitente: {
    cnpj: string;
    razao_social: string;
    nome_fantasia?: string;
    ie: string;
    endereco: {
      logradouro: string;
      numero: string;
      bairro: string;
      municipio: string;
      uf: string;
      cep: string;
    };
  };
  destinatario?: {
    nome: string;
    documento: string;
    endereco?: {
      logradouro: string;
      numero: string;
      bairro: string;
      municipio: string;
      uf: string;
      cep: string;
    };
  } | null;
  itens: DanfePreviewItem[];
  totais: {
    vProd: string;
    vBC: string;
    vICMS: string;
    vPIS: string;
    vCOFINS: string;
    vIBS: string;
    vCBS: string;
    vNF: string;
  };
  warnings?: string[];
}

const WATERMARK_CSS = `
  .watermark {
    position: fixed; inset: 0; pointer-events: none; z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
  }
  .watermark span {
    transform: rotate(-30deg);
    font-size: 42px; font-weight: 900; letter-spacing: 4px;
    color: rgba(220, 38, 38, 0.18);
    border: 6px solid rgba(220, 38, 38, 0.18);
    padding: 12px 32px; border-radius: 8px;
    text-align: center; white-space: nowrap;
  }
`;

const WATERMARK_HTML = `
  <div class="watermark"><span>PRÉVIA — SEM VALOR FISCAL — NÃO EMITIDA</span></div>
`;

export function gerarHtmlDanfePreview(
  data: DanfePreviewData,
  formato: "a4" | "thermal_80mm",
): string {
  const thermal = formato === "thermal_80mm";
  const titulo = data.tipo === "NFCE" ? "DANFE NFC-e (PRÉVIA)" : "DANFE NF-e (PRÉVIA)";

  const itensRows = data.itens
    .map(
      (it) => `
      <tr>
        <td>${it.nItem}</td>
        <td>${it.descricao}<br/><small>NCM ${it.ncm}${it.cfop ? ` · CFOP ${it.cfop}` : ""}</small></td>
        <td style="text-align:right;">${it.quantidade} ${it.unidade}</td>
        <td style="text-align:right;">${it.valor_unitario}</td>
        <td style="text-align:right;">${it.valor_total}</td>
      </tr>`,
    )
    .join("");

  const warningsHtml =
    data.warnings && data.warnings.length
      ? `<div style="margin:10px 0;padding:8px;background:#fff7ed;border:1px solid #fdba74;color:#9a3412;font-size:11px;">
           <strong>Avisos:</strong>
           <ul style="margin:4px 0 0 16px;padding:0;">${data.warnings.map((w) => `<li>${w}</li>`).join("")}</ul>
         </div>`
      : "";

  const pageCss = thermal
    ? `@page { size: 80mm auto; margin: 0; } body { width: 72mm; padding: 2mm; font-family: 'Courier New', monospace; font-size: 11px; }`
    : `@page { size: A4; margin: 12mm; } body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; color: #222; }`;

  return `<!doctype html><html><head><meta charset="utf-8"><title>${titulo}</title>
<style>
  ${pageCss}
  * { box-sizing: border-box; }
  body { margin: 0; }
  h1 { font-size: 15px; margin: 0 0 4px; text-align: center; }
  .sub { text-align:center; font-size: 11px; color:#555; margin-bottom: 6px; }
  .box { border: 1px solid #333; padding: 6px; margin-bottom: 6px; font-size: 11px; }
  table.itens { width: 100%; border-collapse: collapse; margin-top: 4px; font-size: 11px; }
  table.itens th, table.itens td { border-bottom: 1px solid #ddd; padding: 4px; text-align: left; vertical-align: top; }
  table.itens th { background: #f3f4f6; }
  .totais { margin-top: 6px; font-size: 12px; }
  .totais div { display: flex; justify-content: space-between; padding: 2px 0; }
  .totais .grand { font-size: 14px; font-weight: bold; border-top: 1px solid #333; margin-top: 4px; padding-top: 4px; }
  .fake { font-family: monospace; word-break: break-all; }
  .banner { background:#fee2e2; color:#991b1b; border:1px solid #ef4444; padding:6px; text-align:center; font-weight:bold; margin-bottom:6px; font-size:11px; }
  ${WATERMARK_CSS}
</style></head>
<body>
  ${WATERMARK_HTML}
  <div class="banner">PRÉVIA — DOCUMENTO NÃO EMITIDO NA SEFAZ — SEM VALOR FISCAL</div>
  <h1>${titulo}</h1>
  <div class="sub">Série ${data.serie} · Nº ${data.numero || "—"} · Ambiente: ${data.ambiente}</div>

  <div class="box">
    <strong>${data.emitente.razao_social}</strong>${data.emitente.nome_fantasia ? ` (${data.emitente.nome_fantasia})` : ""}<br/>
    CNPJ: ${data.emitente.cnpj || "—"} · IE: ${data.emitente.ie || "—"}<br/>
    ${data.emitente.endereco.logradouro}, ${data.emitente.endereco.numero} — ${data.emitente.endereco.bairro}<br/>
    ${data.emitente.endereco.municipio}/${data.emitente.endereco.uf} · CEP ${data.emitente.endereco.cep}
  </div>

  ${
    data.destinatario
      ? `<div class="box"><strong>Destinatário:</strong> ${data.destinatario.nome}<br/>Doc: ${data.destinatario.documento || "—"}</div>`
      : `<div class="box">Consumidor não identificado</div>`
  }

  ${warningsHtml}

  <table class="itens">
    <thead><tr><th>#</th><th>Descrição</th><th>Qtd</th><th>V.Unit</th><th>V.Total</th></tr></thead>
    <tbody>${itensRows}</tbody>
  </table>

  <div class="totais">
    <div><span>Produtos</span><span>R$ ${data.totais.vProd}</span></div>
    <div><span>Base ICMS</span><span>R$ ${data.totais.vBC}</span></div>
    <div><span>ICMS</span><span>R$ ${data.totais.vICMS}</span></div>
    <div><span>PIS</span><span>R$ ${data.totais.vPIS}</span></div>
    <div><span>COFINS</span><span>R$ ${data.totais.vCOFINS}</span></div>
    ${Number(data.totais.vIBS) > 0 ? `<div><span>IBS</span><span>R$ ${data.totais.vIBS}</span></div>` : ""}
    ${Number(data.totais.vCBS) > 0 ? `<div><span>CBS</span><span>R$ ${data.totais.vCBS}</span></div>` : ""}
    <div class="grand"><span>TOTAL DA NOTA</span><span>R$ ${data.totais.vNF}</span></div>
  </div>

  <div class="box" style="margin-top:8px;">
    <div>Chave: <span class="fake">${data.chNFe}</span></div>
    <div>Protocolo: <span class="fake">${data.nProt}</span></div>
    <div>Emissão (simulada): ${new Date(data.dhRecbto).toLocaleString("pt-BR")}</div>
  </div>

  <script>window.onload = () => window.print();</script>
</body></html>`;
}


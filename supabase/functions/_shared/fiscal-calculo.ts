// supabase/functions/_shared/fiscal-calculo.ts
// Módulo compartilhado: cálculo puro de tributos (sem chamadas de rede).
// Usado tanto por fiscal-emitir (emissão real) quanto por fiscal-preview
// (pré-visualização sem NuvemFiscal).

/* eslint-disable @typescript-eslint/no-explicit-any */

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

export function onlyNumbers(str: string): string {
  return str?.replace(/\D/g, "") || "";
}

export function padZero(num: number | string, length: number): string {
  return String(num).padStart(length, "0");
}

export function formatCurrency(val: number): string {
  return val?.toFixed(2) || "0.00";
}

export function formatCurrency4(val: number): string {
  return val?.toFixed(4) || "0.0000";
}

export function removeAcento(str: string): string {
  if (!str) return "";
  const map: Record<string, string> = {
    á: "a", à: "a", ã: "a", â: "a", ä: "a",
    é: "e", è: "e", ê: "e", ë: "e",
    í: "i", ì: "i", î: "i", ï: "i",
    ó: "o", ò: "o", õ: "o", ô: "o", ö: "o",
    ú: "u", ù: "u", û: "u", ü: "u",
    ç: "c", ñ: "n",
  };
  return str.replace(/[áàãâäéèêëíìîïóòõôöúùûüçñ]/gi, (m) => map[m] || m);
}

// ------------------------------------------------------------
// montarICMS
// ------------------------------------------------------------

export function montarICMS(
  taxRule: any,
  item: any,
  _clienteUF: string,
  _filialUF: string,
): any {
  const cst = taxRule.cst_icms_estadual || "102";
  const aliqICMS = Number(taxRule.aliq_icms) || 0;
  const redBC = Number(taxRule.red_bc) || 0;
  const orig = Number(taxRule.orig_icms) || 0;
  const total = Number(item.total_price) || 0;

  switch (cst) {
    case "00": {
      const vBC00 = total;
      const vICMS00 = vBC00 * (aliqICMS / 100);
      return { ICMS00: { orig, CST: "00", modBC: 3, vBC: formatCurrency(vBC00), pICMS: aliqICMS, vICMS: formatCurrency(vICMS00) } };
    }
    case "20": {
      const vBC20 = total * (1 - redBC / 100);
      const vICMS20 = vBC20 * (aliqICMS / 100);
      return { ICMS20: { orig, CST: "20", modBC: 3, pRedBC: redBC, vBC: formatCurrency(vBC20), pICMS: aliqICMS, vICMS: formatCurrency(vICMS20) } };
    }
    case "40":
      return { ICMS40: { orig, CST: "40" } };
    case "41":
      return { ICMS41: { orig, CST: "41" } };
    case "51": {
      const vBC51 = total * (1 - redBC / 100);
      const vICMSOp = vBC51 * (aliqICMS / 100);
      return { ICMS51: { orig, CST: "51", modBC: 3, pRedBC: redBC, vBC: formatCurrency(vBC51), pICMS: aliqICMS, vICMSOp: formatCurrency(vICMSOp), pDif: 100.0, vICMSDif: formatCurrency(vICMSOp), vICMS: "0.00" } };
    }
    case "60":
      return { ICMS60: { orig, CST: "60", vBCSTRet: "0.00", pST: "0.00", vICMSSTRet: "0.00" } };
    case "90": {
      const vBC90 = total;
      const vICMS90 = vBC90 * (aliqICMS / 100);
      return { ICMS90: { orig, CST: "90", modBC: 3, vBC: formatCurrency(vBC90), pICMS: aliqICMS, vICMS: formatCurrency(vICMS90) } };
    }
    case "101": {
      const vICMS101 = total * (aliqICMS / 100);
      return { ICMSSN101: { orig, CSOSN: "101", pCredSN: aliqICMS, vCredICMSSN: formatCurrency(vICMS101) } };
    }
    case "102":
    case "103":
    case "300":
    case "400":
      return { [`ICMSSN${cst}`]: { orig, CSOSN: cst } };
    case "500":
      return { ICMSSN500: { orig, CSOSN: "500", vBCSTRet: "0.00", pST: "0.00", vICMSSTRet: "0.00" } };
    case "900": {
      const vBC900 = total;
      const vICMS900 = vBC900 * (aliqICMS / 100);
      return { ICMSSN900: { orig, CSOSN: "900", modBC: 3, vBC: formatCurrency(vBC900), pICMS: aliqICMS, vICMS: formatCurrency(vICMS900) } };
    }
    default:
      return {};
  }
}

// ------------------------------------------------------------
// montarPIS
// ------------------------------------------------------------

export function montarPIS(taxRule: any, item: any, valorICMS: number): any {
  const cst = taxRule.cst_pis || "49";
  const aliq = Number(taxRule.aliq_pis) || 0;
  const total = Number(item.total_price) || 0;
  const base = total - valorICMS;

  switch (cst) {
    case "49": return { PISSN: { CST: "49" } };
    case "04": return { PISSN: { CST: "04" } };
    case "06": case "07": case "08": case "09": return { PISNT: { CST: cst } };
    case "01": case "02": case "05":
      return { PISAliq: { CST: cst, vBC: formatCurrency(base), pPIS: aliq, vPIS: formatCurrency(base * aliq / 100) } };
    case "99":
      return { PISOutr: { CST: "99", vBC: formatCurrency(base), pPIS: aliq, vPIS: formatCurrency(base * aliq / 100) } };
    default: return {};
  }
}

// ------------------------------------------------------------
// montarCOFINS
// ------------------------------------------------------------

export function montarCOFINS(taxRule: any, item: any, valorICMS: number): any {
  const cst = taxRule.cst_cofins || "49";
  const aliq = Number(taxRule.aliq_cofins) || 0;
  const total = Number(item.total_price) || 0;
  const base = total - valorICMS;

  switch (cst) {
    case "49": return { COFINSSN: { CST: "49" } };
    case "04": return { COFINSSN: { CST: "04" } };
    case "06": case "07": case "08": case "09": return { COFINSNT: { CST: cst } };
    case "01": case "02": case "05":
      return { COFINSAliq: { CST: cst, vBC: formatCurrency(base), pCOFINS: aliq, vCOFINS: formatCurrency(base * aliq / 100) } };
    case "99":
      return { COFINSOutr: { CST: "99", vBC: formatCurrency(base), pCOFINS: aliq, vCOFINS: formatCurrency(base * aliq / 100) } };
    default: return {};
  }
}

// ------------------------------------------------------------
// montarIBSCBS
// ------------------------------------------------------------

export function montarIBSCBS(taxRule: any, item: any): any {
  const total = Number(item.total_price) || 0;
  const base = total;
  const cst = taxRule.cst_ibscbs || "000";

  const aliqIBSUF = Number(taxRule.aliq_ibsuf) || 0;
  const aliqIBSMun = Number(taxRule.aliq_ibsmun) || 0;
  const aliqCBS = Number(taxRule.aliq_cbs) || 0;

  const resultado: any = { CST: cst.padStart(3, "0") };

  const gIBSUF: any = { pIBSUF: aliqIBSUF, vIBSUF: formatCurrency(base * (aliqIBSUF / 100)) };
  const gIBSMun: any = { pIBSMun: aliqIBSMun, vIBSMun: formatCurrency(base * (aliqIBSMun / 100)) };
  const gCBS: any = { pCBS: aliqCBS, vCBS: formatCurrency(base * (aliqCBS / 100)) };

  const totalIBS = (gIBSUF.vIBSUF || 0) + (gIBSMun.vIBSMun || 0);

  resultado.gTributo = {
    gIBSCBS: {
      vBC: base,
      gIBSUF,
      gIBSMun,
      vIBS: totalIBS,
      gCBS,
    },
  };

  return resultado;
}

// ------------------------------------------------------------
// calcularTributosPedido — totalizadores + montagem do array `det`
// (mesmo comportamento antes inline em fiscal-emitir)
// ------------------------------------------------------------

export interface CalculoTotais {
  total_vBC: number;
  total_vICMS: number;
  total_vProd: number;
  total_vPIS: number;
  total_vCOFINS: number;
  total_vIBS: number;
  total_vCBS: number;
  total_vNF: number;
}

export interface CalcularTributosResult {
  det: any[];
  totais: CalculoTotais;
  warnings: string[];
}

export function calcularTributosPedido(params: {
  items: any[];
  settings: any;
  ufCliente: string;
  ufEmitente: string;
  preview?: boolean;
}): CalcularTributosResult {
  const { items, settings, ufCliente, ufEmitente, preview = false } = params;
  const isInterestadual = ufCliente !== ufEmitente;

  const warnings: string[] = [];
  const det: any[] = [];

  let total_vBC = 0,
    total_vICMS = 0,
    total_vProd = 0,
    total_vPIS = 0,
    total_vCOFINS = 0,
    total_vIBS = 0,
    total_vCBS = 0;

  let itemIndex = 1;

  for (const item of items) {
    const product = item.product || {};
    const taxRule = product.tax_rule || {};

    const ncm = padZero(onlyNumbers(product.ncm || ""), 8);
    if (ncm.length !== 8) {
      if (preview) {
        warnings.push(`NCM inválido no item "${product.name || product.id}": "${ncm}"`);
      } else {
        throw new Error(`NCM inválido: ${ncm}`);
      }
    }

    const total = Number(item.total_price) || 0;
    const unitPrice = Number(item.unit_price) || 0;
    const quantity = Number(item.quantity) || 0;

    const icmsData = montarICMS(taxRule, item, ufCliente, ufEmitente);
    // Extrai vICMS/vBC de qualquer variante presente (ICMS00/20/51/90, ICMSSN101/900, etc.)
    const icmsGroup = Object.values(icmsData)[0] as any || {};
    const valorICMS = parseFloat(icmsGroup.vICMS || icmsGroup.vCredICMSSN || "0") || 0;
    const baseICMS = parseFloat(icmsGroup.vBC || "0") || 0;

    total_vBC += baseICMS;
    total_vICMS += valorICMS;
    total_vProd += total;

    const pisData = montarPIS(taxRule, item, valorICMS);
    const valorPIS = parseFloat(pisData.PISAliq?.vPIS || pisData.PISOutr?.vPIS || "0");
    total_vPIS += valorPIS;

    const cofinsData = montarCOFINS(taxRule, item, valorICMS);
    const valorCOFINS = parseFloat(
      cofinsData.COFINSAliq?.vCOFINS || cofinsData.COFINSOutr?.vCOFINS || "0",
    );
    total_vCOFINS += valorCOFINS;

    let ibscbsData: any = null;
    if (settings.crt === 3 && settings.envia_ibscbs) {
      ibscbsData = montarIBSCBS(taxRule, item);
      const ibsValor = parseFloat(ibscbsData.gTributo?.gIBSCBS?.vIBS || "0");
      const cbsValor = parseFloat(ibscbsData.gTributo?.gIBSCBS?.gCBS?.vCBS || "0");
      total_vIBS += ibsValor;
      total_vCBS += cbsValor;
    }

    const detItem: any = {
      nItem: itemIndex,
      prod: {
        cProd: String(product.id || ""),
        cEAN: product.barcode || "SEM GTIN",
        xProd: removeAcento(product.description || product.name || ""),
        NCM: ncm,
        CFOP: isInterestadual ? taxRule.cfop_interestadual : taxRule.cfop_estadual,
        uCom: product.unidade || "UN",
        qCom: quantity,
        vUnCom: formatCurrency4(unitPrice),
        vProd: formatCurrency(total),
        cEANTrib: product.barcode || "SEM GTIN",
        uTrib: product.unidade || "UN",
        qTrib: quantity,
        vUnTrib: formatCurrency4(unitPrice),
        indTot: 1,
      },
      imposto: {
        ICMS: icmsData,
        PIS: pisData,
        COFINS: cofinsData,
      },
    };

    if (ibscbsData) {
      detItem.imposto.IBSCBS = ibscbsData;
    }

    det.push(detItem);
    itemIndex++;
  }

  return {
    det,
    totais: {
      total_vBC,
      total_vICMS,
      total_vProd,
      total_vPIS,
      total_vCOFINS,
      total_vIBS,
      total_vCBS,
      total_vNF: total_vProd,
    },
    warnings,
  };
}

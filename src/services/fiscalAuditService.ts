import { supabase } from "@/integrations/supabase/client";

export interface FiscalAuditProductRow {
  id: string;
  name: string;
  ncm: string | null;
  category_id: string | null;
  tax_rule_id: string | null;
  active: boolean | null;
}

export interface FiscalAuditCategoryRow {
  id: string;
  name: string;
}

export interface FiscalAuditTaxRuleRow {
  id: string;
  nome: string;
  cfop: string | null;
  cst_ibscbs: string | null;
  cclass_trib: string | null;
  active: boolean;
}

export interface FiscalAuditData {
  products: FiscalAuditProductRow[];
  categories: FiscalAuditCategoryRow[];
  rules: FiscalAuditTaxRuleRow[];
}

async function loadTaxRules(): Promise<FiscalAuditTaxRuleRow[]> {
  const client = supabase as any;
  const attempts = [
    { table: "product_tax_rules_view", select: "id, nome, cfop, cst_ibscbs, active" },
    { table: "product_tax_rules_view", select: "id, nome, cfop, active" },
  ];

  let lastError: unknown = null;

  for (const attempt of attempts) {
    const { data, error } = await client
      .from(attempt.table)
      .select(attempt.select)
      .eq("active", true)
      .order("nome");

    if (!error) {
      return (data || []).map((row: any) => ({
        id: row.id,
        nome: row.nome,
        cfop: row.cfop ?? row.cfop_estadual ?? null,
        cst_ibscbs: row.cst_ibscbs ?? null,
        cclass_trib: row.cclass_trib ?? null,
        active: row.active,
      })) as FiscalAuditTaxRuleRow[];
    }

    lastError = error;
    console.warn(`[FiscalAudit] Falha ao carregar ${attempt.table} (${attempt.select}).`, error);
  }

  throw lastError;
}

export async function loadFiscalAuditData(): Promise<FiscalAuditData> {
  const [productsResult, categoriesResult, rulesResult] = await Promise.allSettled([
    supabase
      .from("products")
      .select("id, name, ncm, category_id, tax_rule_id, active")
      .eq("active", true)
      .order("name"),
    supabase.from("categories").select("id, name").order("name"),
    loadTaxRules(),
  ]);

  const productsResponse = productsResult.status === "fulfilled" ? productsResult.value : null;
  const categoriesResponse = categoriesResult.status === "fulfilled" ? categoriesResult.value : null;
  const rules = rulesResult.status === "fulfilled" ? rulesResult.value : [];

  if (productsResult.status === "rejected" || productsResponse?.error) {
    console.error("[FiscalAudit] Erro ao carregar produtos.", productsResult.status === "rejected" ? productsResult.reason : productsResponse?.error);
  }
  if (categoriesResult.status === "rejected" || categoriesResponse?.error) {
    console.error("[FiscalAudit] Erro ao carregar categorias.", categoriesResult.status === "rejected" ? categoriesResult.reason : categoriesResponse?.error);
  }
  if (rulesResult.status === "rejected") {
    console.error("[FiscalAudit] Erro ao carregar perfis tributários.", rulesResult.reason);
  }

  return {
    products: (productsResponse?.data || []) as FiscalAuditProductRow[],
    categories: (categoriesResponse?.data || []) as FiscalAuditCategoryRow[],
    rules,
  };
}
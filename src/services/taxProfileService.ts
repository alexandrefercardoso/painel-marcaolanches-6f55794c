import { supabase } from "@/integrations/supabase/client";

export interface TaxProfile {
  id: string;
  nome: string;
  cst_icms_estadual: string | null;
  cfop_estadual: string | null;
  cfop_interestadual: string | null;
  orig_icms: number | null;
  aliq_icms: number | null;
  red_bc: number | null;
  cst_pis: string | null;
  aliq_pis: number | null;
  cst_cofins: string | null;
  aliq_cofins: number | null;
  aliq_ibsuf: number | null;
  aliq_ibsmun: number | null;
  aliq_cbs: number | null;
  cst_ibscbs: string | null;
  active: boolean;
  created_at?: string;
}

export interface TaxProfileInput {
  nome: string;
  cst_icms_estadual: string;
  cfop_estadual: string;
  cfop_interestadual?: string;
  orig_icms?: number;
  aliq_icms?: number;
  red_bc?: number;
  cst_pis?: string;
  aliq_pis?: number;
  cst_cofins?: string;
  aliq_cofins?: number;
  aliq_ibsuf?: number;
  aliq_ibsmun?: number;
  aliq_cbs?: number;
  cst_ibscbs?: string;
  active: boolean;
}

const COLUMNS =
  "id, nome, cst_icms_estadual, cfop_estadual, cfop_interestadual, orig_icms, aliq_icms, red_bc, cst_pis, aliq_pis, cst_cofins, aliq_cofins, aliq_ibsuf, aliq_ibsmun, aliq_cbs, cst_ibscbs, active, created_at";

function buildPayload(input: TaxProfileInput) {
  return {
    nome: input.nome,
    cst_icms_estadual: input.cst_icms_estadual,
    cst_icms_interestadual: input.cst_icms_estadual,
    cfop_estadual: input.cfop_estadual,
    cfop_interestadual: input.cfop_interestadual || input.cfop_estadual,
    orig_icms: input.orig_icms ?? 0,
    aliq_icms: input.aliq_icms ?? 0,
    red_bc: input.red_bc ?? 0,
    cst_pis: input.cst_pis || "49",
    aliq_pis: input.aliq_pis ?? 0,
    cst_cofins: input.cst_cofins || "49",
    aliq_cofins: input.aliq_cofins ?? 0,
    aliq_ibsuf: input.aliq_ibsuf ?? 0,
    aliq_ibsmun: input.aliq_ibsmun ?? 0,
    aliq_cbs: input.aliq_cbs ?? 0,
    cst_ibscbs: input.cst_ibscbs || "000",
    active: input.active ?? true,
  };
}

export const taxProfileService = {
  async getTaxProfiles(): Promise<TaxProfile[]> {
    const { data, error } = await supabase
      .from("product_tax_rules" as any)
      .select(COLUMNS)
      .order("nome", { ascending: true });
    if (error) {
      console.error("Erro Supabase:", error);
      throw error;
    }
    return ((data as unknown) as TaxProfile[]) || [];
  },

  async createTaxProfile(input: TaxProfileInput) {
    const { data, error } = await supabase
      .from("product_tax_rules" as any)
      .insert(buildPayload(input) as any)
      .select(COLUMNS)
      .single();
    if (error) throw error;
    return data;
  },

  async updateTaxProfile(id: string, input: TaxProfileInput) {
    const { data, error } = await supabase
      .from("product_tax_rules" as any)
      .update(buildPayload(input) as any)
      .eq("id", id)
      .select(COLUMNS)
      .single();
    if (error) throw error;
    return data;
  },

  async deleteTaxProfile(id: string) {
    const { error } = await supabase
      .from("product_tax_rules" as any)
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  },
};

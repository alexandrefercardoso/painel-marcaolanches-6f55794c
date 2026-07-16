import { useMemo } from "react";
import type { ModuleId } from "./useModulePermissions";

export type FieldId =
  | "caixa_inicio"
  | "caixa_entradas"
  | "caixa_taxas_motoqueiros"
  | "caixa_outras_saidas"
  | "caixa_saldo"
  | "caixa_historico"
  | "caixa_resumo_fechamento"
  | "pedidos_filtro_periodo";

export interface FieldDef {
  id: FieldId;
  label: string;
  module: ModuleId; // módulo ao qual o campo pertence (para agrupar e condicionar visibilidade)
  group: string;    // rótulo do subgrupo exibido no modal (ex: "Caixa", "Pedidos")
}

export const ALL_FIELDS: FieldDef[] = [
  { id: "caixa_inicio",             label: "Card Início",                   module: "atendimento", group: "Caixa" },
  { id: "caixa_entradas",           label: "Card Entradas (Vendas)",        module: "atendimento", group: "Caixa" },
  { id: "caixa_taxas_motoqueiros",  label: "Card Taxas Motoqueiros",        module: "atendimento", group: "Caixa" },
  { id: "caixa_outras_saidas",      label: "Card Outras Saídas",            module: "atendimento", group: "Caixa" },
  { id: "caixa_saldo",              label: "Card Saldo em Caixa",           module: "atendimento", group: "Caixa" },
  { id: "caixa_historico",          label: "Histórico de Fechamentos",      module: "atendimento", group: "Caixa" },
  { id: "caixa_resumo_fechamento",  label: "Resumo no Fechar Caixa",        module: "atendimento", group: "Caixa" },
  { id: "pedidos_filtro_periodo",   label: "Filtro de período (De/Até)",    module: "atendimento", group: "Pedidos" },
];

// NOTE: por padrão, ao criar novo Funcionário, todos os campos sensíveis começam DESMARCADOS.
export const DEFAULT_FUNCIONARIO_VISIBLE_FIELDS: FieldId[] = [];

function readSessionProfile(): any | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("admin_session");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Retorna true se o usuário atual pode ver o campo `fieldId`.
 * Master/Admin sempre veem tudo. Funcionário só vê o que estiver em `visible_fields`.
 *
 * IMPORTANTE: essa checagem é apenas VISUAL. Se o valor vier de uma query que traz
 * tudo junto num único payload, ele ainda pode ser inspecionado via aba Network.
 * Para blindar de verdade, seria preciso mover a filtragem para RLS/edge function.
 */
export function useFieldVisibility(fieldId: FieldId, userProfile?: any): boolean {
  return useMemo(() => {
    const profile = userProfile ?? readSessionProfile();
    const role: string = profile?.role || "funcionario";
    if (role === "master" || role === "administrador") return true;
    const list: string[] = Array.isArray(profile?.visible_fields) ? profile.visible_fields : [];
    return list.includes(fieldId);
  }, [fieldId, userProfile]);
}

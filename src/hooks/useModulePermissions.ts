import { useMemo } from "react";

export type ModuleId =
  | "dashboard"
  | "atendimento"
  | "cadastros"
  | "gestao_mesas"
  | "financeiro"
  | "fiscal"
  | "marketing"
  | "configuracoes";

export const ALL_MODULES: { id: ModuleId; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "atendimento", label: "Atendimento" },
  { id: "cadastros", label: "Cadastros" },
  { id: "gestao_mesas", label: "Gestão de Mesas" },
  { id: "financeiro", label: "Financeiro" },
  { id: "fiscal", label: "Fiscal" },
  { id: "marketing", label: "Marketing" },
  { id: "configuracoes", label: "Configurações" },
];

export const DEFAULT_FUNCIONARIO_MODULES: ModuleId[] = [
  "atendimento",
  "cadastros",
  "gestao_mesas",
];

// Mapeia cada tab do painel para o módulo correspondente.
export const TAB_TO_MODULE: Record<string, ModuleId> = {
  dashboard: "dashboard",
  // Atendimento
  delivery_module: "atendimento",
  tables_quick_view: "atendimento",
  history_module: "atendimento",
  kitchen_dashboard: "atendimento",
  cashier: "atendimento",
  waiters_module: "atendimento",
  // Gestão de Mesas
  tables_module: "gestao_mesas",
  // Cadastros
  categories: "cadastros",
  company: "cadastros",
  products: "cadastros",
  insumos: "cadastros",
  estoque: "cadastros",
  complements_admin: "cadastros",
  customers_tab: "cadastros",
  users: "cadastros",
  drivers: "cadastros",
  suppliers_tab: "cadastros",
  delivery_zones: "cadastros",
  // Financeiro
  finance: "financeiro",
  receivables: "financeiro",
  payables: "financeiro",
  payment_methods_tab: "financeiro",
  // Fiscal
  tax_rules: "fiscal",
  note_type: "fiscal",
  cclass_trib: "fiscal",
  fiscal_audit: "fiscal",
  fiscal_documents: "fiscal",
  fiscal_logs: "fiscal",
  api_endpoints: "fiscal",
  // Marketing
  weekly_campaigns: "marketing",
  // Configurações
  printer_config: "configuracoes",
  whatsapp_bot: "configuracoes",
};

export function useModulePermissions(userProfile: any) {
  return useMemo(() => {
    const role: string = userProfile?.role || "funcionario";
    const isPrivileged = role === "master" || role === "administrador";
    const allowedModules: ModuleId[] = Array.isArray(userProfile?.allowed_modules)
      ? (userProfile.allowed_modules as ModuleId[])
      : [];

    const hasModule = (moduleId?: ModuleId | null) => {
      if (isPrivileged) return true;
      if (!moduleId) return true;
      return allowedModules.includes(moduleId);
    };

    const hasTabAccess = (tabId: string) => {
      if (isPrivileged) return true;
      const mod = TAB_TO_MODULE[tabId];
      if (!mod) return true;
      return allowedModules.includes(mod);
    };

    return { role, isPrivileged, allowedModules, hasModule, hasTabAccess };
  }, [userProfile]);
}

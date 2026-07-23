import React from "react";
import { 
  LayoutDashboard, 
  Truck, 
  Search, 
  CheckCircle2, 
  LayoutGrid, 
  Users, 
  Package, 
  Plus, 
  List, 
  Building2, 
  Wallet, 
  DollarSign, 
  Bike, 
  Target, 
  Megaphone, 
  Printer, 
  UserPlus,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Utensils,
  ChefHat,
  FileText,
  Receipt,
  Percent,
  Globe,
  ShieldCheck,
  MessageCircle,
  Boxes,
  LogOut,
} from "lucide-react";
import { 
  Sidebar as SidebarUI, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useCompany } from "@/hooks/useCompany";
import { useModulePermissions } from "@/hooks/useModulePermissions";

interface AppSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  storeSettings?: any;
  userProfile?: any;
}

export function AppSidebar({ activeTab, setActiveTab, storeSettings, userProfile }: AppSidebarProps) {
  const { setOpenMobile, isMobile, state } = useSidebar();
  const { data: company } = useCompany();
  const isKdsOnly = userProfile?.is_kds_only && userProfile?.role !== 'master';
  const isAdmin = userProfile?.role === 'master' || userProfile?.role === 'administrador';
  const [openGroups, setOpenGroups] = React.useState<string[]>(["atendimento"]);

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => 
      prev.includes(group) ? [] : [group]
    );
  };

  // Auto-expande o grupo que contém a aba ativa (garante visibilidade após salvar/navegar)
  React.useEffect(() => {
    const group = menuGroups.find(g => g.items.some(i => i.id === activeTab));
    if (group && !openGroups.includes(group.id)) {
      setOpenGroups([group.id]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    window.location.href = "/login";
  };

  const menuGroups = [
    ...(isKdsOnly ? [] : [
      {
        id: "dashboard",
        label: "Dashboard",
        items: [
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        ]
      }
    ]),
    ...(isKdsOnly ? [] : [
      {
        id: "engenharia",
        label: "Engenharia Cardápio",
        items: [
          { id: "engenharia_cardapio", label: "Engenharia Cardápio", icon: ChefHat },
        ]
      }
    ]),
    {
      id: "atendimento",
      label: "Atendimento",
      items: [
        ...(isKdsOnly ? [] : [
          { id: "delivery_module", label: "Atendimento", icon: Truck },
          { id: "tables_quick_view", label: "Mesas", icon: LayoutGrid },
          { id: "history_module", label: "Pedidos", icon: Search },
          { id: "live_deliveries", label: "Entregas em Andamento", icon: Bike },
        ]),
        ...((storeSettings?.kds_enabled !== false && (userProfile?.is_kds_only || userProfile?.role === 'master')) ? [
          { id: "kitchen_dashboard", label: "Produção (KDS)", icon: Utensils }
        ] : []),
        ...(isKdsOnly ? [] : [
          { id: "cashier", label: "Caixa", icon: CheckCircle2 },
          { id: "tables_module", label: "Gestão de Mesas", icon: LayoutGrid },
          { id: "waiters_module", label: "Garçons", icon: Users },
        ])
      ]
    },
    ...(isKdsOnly ? [] : [
      {
        id: "cadastros",
        label: "Cadastros",
        items: [
          { id: "categories", label: "Categorias", icon: List },
          { id: "company", label: "Empresa", icon: Building2 },
          { id: "products", label: "Cardápio", icon: Package },
          { id: "insumos", label: "Insumos", icon: Package },
          { id: "estoque", label: "Estoque", icon: Boxes },
          { id: "complements_admin", label: "Complementos", icon: Plus },
          { id: "customers_tab", label: "Clientes", icon: Users },
          ...(isAdmin ? [{ id: "users", label: "Usuários", icon: UserPlus }] : []),
          { id: "drivers", label: "Motoqueiros", icon: Bike },
          { id: "suppliers_tab", label: "Fornecedores", icon: Truck },
          { id: "delivery_zones", label: "Áreas de Ação", icon: Target },
        ]
      },
      {
        id: "financeiro",
        label: "Financeiro",
        items: [
          { id: "finance", label: "Financeiro", icon: Wallet },
          { id: "receivables", label: "Contas a Receber", icon: ArrowUpRight },
          { id: "payables", label: "Contas a Pagar", icon: ArrowDownRight },
          { id: "payment_methods_tab", label: "Forma de Pagamento", icon: DollarSign },
        ]
      },
      {
        id: "fiscal",
        label: "Fiscal",
        items: [
          { id: "tax_rules", label: "Perfis Tributários", icon: Percent },
          { id: "note_type", label: "Tipo de Nota", icon: FileText },
          { id: "cclass_trib", label: "Classificação IBS/CBS", icon: FileText },
          { id: "fiscal_audit", label: "Auditoria Fiscal", icon: ShieldCheck },
          { id: "fiscal_documents", label: "Documentos Fiscais", icon: Receipt },
          { id: "fiscal_logs", label: "Logs Fiscais", icon: FileText },
          { id: "api_endpoints", label: "Endpoints API", icon: Globe },
        ]
      },
      {
        id: "marketing",
        label: "Marketing",
        items: [
          { id: "weekly_campaigns", label: "Campanhas Semanais", icon: Megaphone },
        ]
      },
      {
        id: "configuracoes",
        label: "Configurações",
        items: [
          { id: "printer_config", label: "Impressoras", icon: Printer },
          { id: "whatsapp_bot", label: "WhatsApp Bot", icon: MessageCircle },
        ]
      }
    ])
  ];

  const { hasTabAccess, isPrivileged } = useModulePermissions(userProfile);
  const filteredMenuGroups = isPrivileged
    ? menuGroups
    : menuGroups
        .map((g) => ({ ...g, items: g.items.filter((i) => hasTabAccess(i.id)) }))
        .filter((g) => g.items.length > 0);


  return (
    <SidebarUI collapsible="icon" className="border-r border-orange-100 dark:border-slate-800 shadow-xl bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="h-32 flex items-center justify-center border-b border-orange-50 dark:border-slate-800 bg-sidebar px-2 py-4">
        <div className="flex flex-col items-center justify-center w-full gap-2 bg-sidebar">
          <div className={cn(
            "flex items-center justify-center transition-all duration-300 bg-white rounded-xl p-1 overflow-hidden",
            state === "collapsed" ? "w-14 h-14" : "w-full px-2"
          )}>
            <img 
              src="/logo.png" 
              alt="Logo" 
              className={cn(
                "object-contain transition-all duration-300",
                state === "collapsed" ? "max-h-12" : "max-h-20"
              )}
            />
          </div>
          <div className={cn(
            "flex flex-col items-center transition-all duration-300 w-full px-2 overflow-hidden",
            state === "collapsed" ? "hidden" : "block"
          )}>
            <span className="font-black text-[12px] text-orange-600 uppercase whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
              {company?.name || "Painel Admin"}
            </span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="bg-sidebar px-2 py-4">
        <SidebarMenu>
          {filteredMenuGroups.map((group) => (
            <Collapsible
              key={group.id}
              open={openGroups.includes(group.id)}
              onOpenChange={() => toggleGroup(group.id)}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton 
                    tooltip={group.label}
                    className={cn(
                      "w-full justify-between hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-slate-800 dark:hover:text-orange-400 transition-all",
                      openGroups.includes(group.id) && "bg-orange-50/50 dark:bg-slate-800/50 text-orange-600 dark:text-orange-400 font-bold"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {React.createElement(group.items[0].icon, { className: "w-4 h-4" })}
                      <span className="group-data-[collapsible=icon]:hidden">{group.label}</span>
                    </div>
                    <ChevronDown className={cn(
                      "ml-auto h-4 w-4 transition-transform group-data-[collapsible=icon]:hidden",
                      openGroups.includes(group.id) && "rotate-180"
                    )} />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {group.items.map((item) => (
                      <SidebarMenuSubItem key={item.id}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={activeTab === item.id}
                          className={cn(
                            "cursor-pointer transition-all border-l-2 border-transparent hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-slate-800",
                            activeTab === item.id && "bg-orange-100 dark:bg-slate-800 text-orange-700 dark:text-orange-400 font-black border-orange-600"
                          )}
                          onClick={() => handleTabChange(item.id)}
                        >
                          <div className="flex items-center gap-2 w-full">
                            {React.createElement(item.icon, { className: "w-4 h-4 shrink-0" })}
                            <span>{item.label}</span>
                          </div>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
          <SidebarMenuItem className="mt-2 pt-2 border-t border-orange-100 dark:border-slate-800">
            <SidebarMenuButton
              tooltip="Sair"
              onClick={handleLogout}
              className="w-full justify-start hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 text-red-600 dark:text-red-400 transition-all"
            >
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">Sair</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </SidebarUI>
  );
}

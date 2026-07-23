import React from "react";
import {
  Headphones,
  Plus,
  Wallet,
  LayoutGrid,
  RefreshCw,
  Smartphone,
  Bike,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface QuickActionsBarProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  onNewOrder: () => void;
  storeSettings?: any;
  pendingReconciliationCount?: number;
}

type ActionItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tab?: string;
  variant?: "default" | "outline" | "secondary";
  onClick?: () => void;
  iconColor: string;
  activeIconColor: string;
  activeBg: string;
  badgeCount?: number;
};

export function QuickActionsBar({
  activeTab,
  onChangeTab,
  onNewOrder,
  storeSettings,
  pendingReconciliationCount = 0,
}: QuickActionsBarProps) {
  const handleOpenDigitalMenu = () => {
    const url = storeSettings?.digital_menu_url?.trim();
    if (!url) {
      toast.error("Cadastre o Link do Cardápio Digital em Gestão de Mesas → Configurações.");
      return;
    }
    const finalUrl = url.startsWith("http") ? url : `https://${url}`;
    window.open(finalUrl, "_blank", "noopener,noreferrer");
  };

  const actions: ActionItem[] = [
    {
      id: "delivery_module",
      label: "Atendimento",
      icon: Headphones,
      tab: "delivery_module",
      variant: "outline",
      iconColor: "text-emerald-500",
      activeIconColor: "text-emerald-700",
      activeBg: "bg-emerald-50 border-emerald-300 text-emerald-800 ring-emerald-200",
    },
    {
      id: "new-order",
      label: "Novo Pedido",
      icon: Plus,
      onClick: onNewOrder,
      variant: "default",
      iconColor: "text-white",
      activeIconColor: "text-white",
      activeBg: "",
    },
    {
      id: "cashier",
      label: "Caixa",
      icon: Wallet,
      tab: "cashier",
      variant: "outline",
      iconColor: "text-green-500",
      activeIconColor: "text-green-700",
      activeBg: "bg-green-50 border-green-300 text-green-800 ring-green-200",
    },
    {
      id: "tables_quick_view",
      label: "Mesas",
      icon: LayoutGrid,
      tab: "tables_quick_view",
      variant: "outline",
      iconColor: "text-blue-500",
      activeIconColor: "text-blue-700",
      activeBg: "bg-blue-50 border-blue-300 text-blue-800 ring-blue-200",
    },
    {
      id: "reconciliation",
      label: "Conciliar Caixa",
      icon: RefreshCw,
      tab: "cashier",
      variant: "outline",
      iconColor: "text-teal-500",
      activeIconColor: "text-teal-700",
      activeBg: "bg-teal-50 border-teal-300 text-teal-800 ring-teal-200",
    },
    {
      id: "motoboy-voltou",
      label: "Motoboy Voltou",
      icon: Bike,
      tab: "cashier",
      variant: "outline",
      iconColor: "text-cyan-500",
      activeIconColor: "text-cyan-700",
      activeBg: "bg-cyan-50 border-cyan-300 text-cyan-800 ring-cyan-200",
      badgeCount: pendingReconciliationCount,
    },
    {
      id: "digital-menu",
      label: "Cardápio Digital",
      icon: Smartphone,
      onClick: handleOpenDigitalMenu,
      variant: "outline",
      iconColor: "text-indigo-500",
      activeIconColor: "text-indigo-700",
      activeBg: "bg-indigo-50 border-indigo-300 text-indigo-800 ring-indigo-200",
    },
    {
      id: "live_deliveries",
      label: "Entregas em Andamento",
      icon: Bike,
      tab: "live_deliveries",
      variant: "outline",
      iconColor: "text-amber-500",
      activeIconColor: "text-amber-700",
      activeBg: "bg-amber-50 border-amber-300 text-amber-800 ring-amber-200",
    },
    {
      id: "history_module",
      label: "Pedidos",
      icon: ClipboardList,
      tab: "history_module",
      variant: "outline",
      iconColor: "text-slate-500",
      activeIconColor: "text-slate-700",
      activeBg: "bg-slate-100 border-slate-300 text-slate-800 ring-slate-200",
    },
  ];

  const handleClick = (action: ActionItem) => {
    if (action.onClick) {
      action.onClick();
    } else if (action.tab) {
      onChangeTab(action.tab);
    }
  };

  const isActive = (action: ActionItem) => {
    if (action.id === "new-order" || action.id === "digital-menu") return false;
    return action.tab === activeTab;
  };

  return (
    <div className="w-full">
      <div className="flex md:grid md:grid-cols-4 lg:grid-cols-8 gap-2 overflow-x-auto pb-2 md:pb-0">
        {actions.map((action) => {
          const Icon = action.icon;
          const active = isActive(action);
          const isActionButton = action.id === "new-order";
          return (
            <Button
              key={action.id}
              type="button"
              variant={action.variant}
              onClick={() => handleClick(action)}
              className={cn(
                "flex-shrink-0 flex-col items-center justify-center gap-1 h-auto py-2.5 px-2 rounded-xl border-2 font-bold transition-all active:scale-95 min-w-[72px] md:min-w-0",
                isActionButton &&
                  "bg-orange-600 hover:bg-orange-700 text-white border-orange-600 hover:border-orange-700 shadow-md",
                !isActionButton &&
                  "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300",
                active && !isActionButton && action.activeBg,
                active && isActionButton && "ring-2 ring-orange-300"
              )}
              title={action.label}
            >
              <span
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  active ? action.activeIconColor : action.iconColor,
                  active && !isActionButton && "bg-white/60"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "scale-110")} />
              </span>
              <span
                className={cn(
                  "text-[10px] leading-tight text-center hidden md:block",
                  isActionButton ? "text-white" : active ? "text-current" : "text-slate-600"
                )}
              >
                {action.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

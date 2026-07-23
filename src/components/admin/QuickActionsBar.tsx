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
  onOpenReconciliationOnly?: () => void;
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
  onOpenReconciliationOnly,
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
      activeIconColor: "text-emerald-700 dark:text-emerald-300",
      activeBg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 ring-emerald-200 dark:ring-emerald-900",
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
      activeIconColor: "text-green-700 dark:text-green-300",
      activeBg: "bg-green-50 dark:bg-green-950/40 border-green-300 dark:border-green-800 text-green-800 dark:text-green-300 ring-green-200 dark:ring-green-900",
    },
    {
      id: "tables_quick_view",
      label: "Mesas",
      icon: LayoutGrid,
      tab: "tables_quick_view",
      variant: "outline",
      iconColor: "text-blue-500",
      activeIconColor: "text-blue-700 dark:text-blue-300",
      activeBg: "bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300 ring-blue-200 dark:ring-blue-900",
    },
    {
      id: "motoboy-voltou",
      label: "Motoboy Voltou",
      icon: Bike,
      onClick: () => (onOpenReconciliationOnly ? onOpenReconciliationOnly() : onChangeTab("cashier")),
      variant: "outline",
      iconColor: "text-cyan-500",
      activeIconColor: "text-cyan-700 dark:text-cyan-300",
      activeBg: "bg-cyan-50 dark:bg-cyan-950/40 border-cyan-300 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300 ring-cyan-200 dark:ring-cyan-900",
      badgeCount: pendingReconciliationCount,
    },

    {
      id: "digital-menu",
      label: "Cardápio Digital",
      icon: Smartphone,
      onClick: handleOpenDigitalMenu,
      variant: "outline",
      iconColor: "text-indigo-500",
      activeIconColor: "text-indigo-700 dark:text-indigo-300",
      activeBg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 ring-indigo-200 dark:ring-indigo-900",
    },
    {
      id: "live_deliveries",
      label: "Entregas em Andamento",
      icon: Bike,
      tab: "live_deliveries",
      variant: "outline",
      iconColor: "text-amber-500",
      activeIconColor: "text-amber-700 dark:text-amber-300",
      activeBg: "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 ring-amber-200 dark:ring-amber-900",
    },
    {
      id: "history_module",
      label: "Pedidos",
      icon: ClipboardList,
      tab: "history_module",
      variant: "outline",
      iconColor: "text-slate-500",
      activeIconColor: "text-slate-700 dark:text-slate-300",
      activeBg: "bg-slate-100 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300 ring-slate-200 dark:ring-slate-800",
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
                  "relative p-1.5 rounded-lg transition-colors",
                  active ? action.activeIconColor : action.iconColor,
                  active && !isActionButton && "bg-white/60"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "scale-110")} />
                {(action.badgeCount ?? 0) > 0 && (
                  <Badge
                    className={cn(
                      "absolute -top-2 -right-2 h-4 min-w-[1rem] px-1 text-[9px] font-black text-white flex items-center justify-center rounded-full border-2 border-white",
                      active ? "bg-red-600" : "bg-red-500"
                    )}
                  >
                    {action.badgeCount}
                  </Badge>
                )}
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

import React from "react";
import {
  Home,
  Plus,
  Wallet,
  LayoutGrid,
  RefreshCw,
  Smartphone,
  Bike,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface QuickActionsBarProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  onNewOrder: () => void;
  storeSettings?: any;
}

type ActionItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tab?: string;
  variant?: "default" | "outline" | "secondary";
  onClick?: () => void;
};

export function QuickActionsBar({
  activeTab,
  onChangeTab,
  onNewOrder,
  storeSettings,
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
      id: "dashboard",
      label: "Menu Principal",
      icon: Home,
      tab: "dashboard",
      variant: "outline",
    },
    {
      id: "new-order",
      label: "Novo Pedido",
      icon: Plus,
      onClick: onNewOrder,
      variant: "default",
    },
    {
      id: "cashier",
      label: "Caixa",
      icon: Wallet,
      tab: "cashier",
      variant: "outline",
    },
    {
      id: "tables_quick_view",
      label: "Mesas",
      icon: LayoutGrid,
      tab: "tables_quick_view",
      variant: "outline",
    },
    {
      id: "reconciliation",
      label: "Conciliar Caixa",
      icon: RefreshCw,
      tab: "cashier",
      variant: "outline",
    },
    {
      id: "digital-menu",
      label: "Cardápio Digital",
      icon: Smartphone,
      onClick: handleOpenDigitalMenu,
      variant: "outline",
    },
    {
      id: "live_deliveries",
      label: "Entregas em Andamento",
      icon: Bike,
      tab: "live_deliveries",
      variant: "outline",
    },
    {
      id: "history_module",
      label: "Pedidos",
      icon: ClipboardList,
      tab: "history_module",
      variant: "outline",
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
          return (
            <Button
              key={action.id}
              type="button"
              variant={action.variant}
              onClick={() => handleClick(action)}
              className={cn(
                "flex-shrink-0 flex-col items-center justify-center gap-1 h-auto py-2.5 px-2 rounded-xl border-2 font-bold transition-all active:scale-95 min-w-[72px] md:min-w-0",
                action.id === "new-order" &&
                  "bg-orange-600 hover:bg-orange-700 text-white border-orange-600 hover:border-orange-700 shadow-md",
                action.id !== "new-order" &&
                  "border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 bg-white",
                active &&
                  action.id !== "new-order" &&
                  "bg-orange-100 border-orange-400 text-orange-800 ring-2 ring-orange-200",
                active &&
                  action.id === "new-order" &&
                  "ring-2 ring-orange-300"
              )}
              title={action.label}
            >
              <Icon className={cn("h-5 w-5", active && "scale-110")} />
              <span className="text-[10px] leading-tight text-center hidden md:block">
                {action.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

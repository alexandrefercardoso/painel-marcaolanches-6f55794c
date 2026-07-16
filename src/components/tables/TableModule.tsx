
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TableDashboard } from "./TableDashboard";
import { WaiterManagement } from "./WaiterManagement";
import { TableManagement } from "./TableManagement";
import { TableReports } from "./TableReports";
import { LayoutGrid, Users, Settings as SettingsIcon, PieChart, Trophy, Ticket } from "lucide-react";
import { SalesGamification } from "./SalesGamification";
import { ComandaManager } from "./ComandaManager";

export function TableModule() {
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase text-foreground tracking-tighter bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
            Gestão de Mesas
          </h1>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">Módulo Restaurante / Bar</p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-full border">
          <TabsTrigger value="dashboard" className="rounded-full font-black uppercase text-[10px] data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            <LayoutGrid className="h-3.5 w-3.5 mr-2" />
            Mapa de Mesas
          </TabsTrigger>
          <TabsTrigger value="waiters" className="rounded-full font-black uppercase text-[10px] data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            <Users className="h-3.5 w-3.5 mr-2" />
            Garçons
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-full font-black uppercase text-[10px] data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            <SettingsIcon className="h-3.5 w-3.5 mr-2" />
            Configuração
          </TabsTrigger>
          <TabsTrigger value="comandas" className="rounded-full font-black uppercase text-[10px] data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            <Ticket className="h-3.5 w-3.5 mr-2" />
            Comandas
          </TabsTrigger>
          <TabsTrigger value="reports" className="rounded-full font-black uppercase text-[10px] data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            <PieChart className="h-3.5 w-3.5 mr-2" />
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="gamification" className="rounded-full font-black uppercase text-[10px] data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            <Trophy className="h-3.5 w-3.5 mr-2" />
            Performance & Gamificação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <TableDashboard />
        </TabsContent>

        <TabsContent value="waiters" className="space-y-6">
          <WaiterManagement />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <TableManagement />
        </TabsContent>

        <TabsContent value="comandas" className="space-y-6">
          <ComandaManager />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <TableReports />
        </TabsContent>

        <TabsContent value="gamification" className="space-y-6">
          <SalesGamification />
        </TabsContent>
      </Tabs>
    </div>
  );
}

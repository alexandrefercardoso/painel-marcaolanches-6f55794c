
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw, Check, DollarSign, AlertCircle, Coffee, User, Clock, Lock } from "lucide-react";
import { TableSessionDialog } from "./TableSessionDialog";

export function TableDashboardOnly() {
  const [tables, setTables] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [storeSettings, setStoreSettings] = useState<any>(null);
  const [activeCashierSession, setActiveCashierSession] = useState<any>(null);
  const [filterOccupied, setFilterOccupied] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: tablesData } = await supabase.from("restaurant_tables").select("*").order("number");
      const { data: sessionsData } = await supabase.from("table_sessions").select(`
        *,
        restaurant_tables(*),
        waiters(*),
        table_order_items(*)
      `).in("status", ["open", "bill_requested"]);

      
      const { data: settings } = await supabase.from("store_settings").select("*").single();
      
      const { data: cashierData } = await supabase
        .from("cashier_sessions")
        .select("*")
        .is("closed_at", null)
        .maybeSingle();
        
      setTables(tablesData || []);
      setSessions(sessionsData || []);
      setStoreSettings(settings);
      setActiveCashierSession(cashierData || null);
    } catch (error: any) {
      toast.error("Erro ao carregar dashboard: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);

    const channel = supabase
      .channel('table_dashboard_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'table_sessions' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'table_order_items' }, () => fetchData())
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const getTableStatus = (tableId: string) => {
    const session = sessions.find(s => s.table_id === tableId);
    if (!session) return { color: "bg-green-500", label: "Disponível", status: "free" };
    if (session.status === 'bill_requested') return { color: "bg-orange-500", label: "Pediu Conta", status: "bill_requested", session };
    
    const openedAt = new Date(session.opened_at).getTime();
    const nowStr = new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"});
    const now = new Date(nowStr).getTime();
    const minutesOpen = (now - openedAt) / 60000;
    const idleTime = storeSettings?.idle_table_time_minutes || 50;
    
    if (minutesOpen > idleTime) {
      return { color: "bg-red-500", label: "Mesa Ociosa", status: "idle", session };
    }

    return { color: "bg-blue-500", label: "Em Consumo", status: "occupied", session };
  };

  const handleTableClick = (table: any) => {
    if (!activeCashierSession) {
      toast.info("O caixa está fechado! Peça ao gerente para abrir antes de iniciar um atendimento. 🔒");
      return;
    }
    setSelectedTable(table);
    setIsDialogOpen(true);
  };

  // Keep selected session in sync when sessions data updates
  useEffect(() => {
    if (selectedTable) {
      const session = sessions.find(s => s.table_id === selectedTable.id);
      setSelectedSession(session || null);
    }
  }, [sessions, selectedTable]);

  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-card p-3 rounded-2xl border shadow-sm">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-[9px] font-black uppercase text-muted-foreground">Livre</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-[9px] font-black uppercase text-muted-foreground">Consumo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-orange-500" />
            <span className="text-[9px] font-black uppercase text-muted-foreground">Conta</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-[9px] font-black uppercase text-muted-foreground">Ociosa</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={filterOccupied ? "default" : "outline"} 
            size="sm" 
            onClick={() => setFilterOccupied(!filterOccupied)}
            className="h-8 rounded-full font-black uppercase text-[10px]"
          >
            {filterOccupied ? "Ver Todas" : "Ver Apenas Abertas"}
          </Button>
          <Button variant="ghost" size="sm" onClick={fetchData} className="h-8 rounded-full font-black uppercase text-[10px] hover:bg-orange-50 hover:text-orange-600 transition-colors">
            <RefreshCw className={`h-3 w-3 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {filterOccupied && sessions.length === 0 && (
        <div className="p-10 text-center border-2 border-dashed rounded-3xl bg-muted/30">
          <Coffee className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-xs font-black uppercase text-muted-foreground">Nenhuma mesa em uso no momento</p>
          <p className="text-[10px] text-muted-foreground mt-1">Clique em "Ver Todas" para abrir uma nova mesa</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {tables.filter(table => !filterOccupied || sessions.some(s => s.table_id === table.id)).map((table) => {
          const { color, status, session } = getTableStatus(table.id);
          const openedAt = session ? new Date(session.opened_at) : null;
          const nowStr = new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"});
          const timeOpen = openedAt ? Math.floor((new Date(nowStr).getTime() - openedAt.getTime()) / 60000) : 0;

          // Re-calculate session total from items to ensure accuracy on the map
          const calculatedTotal = session?.table_order_items?.reduce((acc: number, item: any) => acc + (Number(item.total_price) || 0), 0) || 0;
          const totalWithCouvert = calculatedTotal + (Number(session?.couvert_value) || 0);


          return (
            <button 
              key={table.id} 
              onClick={() => handleTableClick(table)}
              className={`group relative text-left p-4 border-2 rounded-3xl transition-all shadow-sm ${
                !activeCashierSession 
                  ? 'bg-zinc-200/50 dark:bg-zinc-900/50 border-zinc-300 dark:border-zinc-800 grayscale-[0.5]' 
                  : 'hover:scale-[1.02] active:scale-[0.98]'
              } ${
                status === 'free' && activeCashierSession ? 'bg-green-50/50 border-green-100 hover:border-green-400' : 
                status === 'bill_requested' && activeCashierSession ? 'bg-orange-50 border-orange-200 hover:border-orange-400' : 
                status === 'idle' && activeCashierSession ? 'bg-red-50 border-red-200 hover:border-red-400' :
                activeCashierSession ? 'bg-blue-50/50 border-blue-100 hover:border-blue-400' :
                'border-zinc-300 dark:border-zinc-800'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                  <span className="text-xl font-black text-foreground leading-none">{table.number}</span>
                  <span className="text-[8px] font-black uppercase text-muted-foreground tracking-tighter">{table.sector}</span>
                </div>
                <div className={`p-1 rounded-full ${!activeCashierSession ? 'bg-zinc-400' : color}`}>
                  {!activeCashierSession ? <Lock className="h-3 w-3 text-white" /> :
                   status === 'free' ? <Check className="h-3 w-3 text-white" /> : 
                   status === 'bill_requested' ? <DollarSign className="h-3 w-3 text-white" /> :
                   status === 'idle' ? <AlertCircle className="h-3 w-3 text-white animate-pulse" /> :
                   <Coffee className="h-3 w-3 text-white" />}
                </div>
              </div>
              
              {session ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] font-black uppercase truncate">{session.client_name || "Cliente"}</span>
                  </div>
                  {status === 'bill_requested' && (
                    <div className="flex items-center justify-center gap-1 bg-orange-500 text-white rounded-md px-1.5 py-0.5 animate-pulse">
                      <DollarSign className="h-2.5 w-2.5" />
                      <span className="text-[8px] font-black uppercase tracking-tight">Cliente pediu a conta</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] font-bold">{timeOpen}m</span>
                    </div>
                    <span className="text-xs font-black text-primary">R$ {Number(totalWithCouvert || 0).toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <div className={`h-10 flex items-center justify-center border-t border-dashed ${!activeCashierSession ? 'border-zinc-300 dark:border-zinc-700' : 'border-green-200 dark:border-emerald-900/30'} mt-2`}>
                  <span className={`text-[10px] font-black uppercase ${!activeCashierSession ? 'text-zinc-500' : 'text-green-600/50 dark:text-emerald-400/50'}`}>
                    {!activeCashierSession ? 'Caixa Fechado' : 'Livre'}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedTable && (
        <TableSessionDialog 
          isOpen={isDialogOpen}
          table={selectedTable}
          session={selectedSession}
          onClose={() => setIsDialogOpen(false)}
          onSuccess={() => {
            fetchData();
          }}
        />
      )}
    </div>
  );
}


import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, Clock, User, DollarSign, Coffee, AlertCircle, RefreshCw, Check, Lock } from "lucide-react";
import { TableSessionDialog } from "./TableSessionDialog";

export function TableDashboard() {
  const [tables, setTables] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [storeSettings, setStoreSettings] = useState<any>(null);
  const [activeCashierSession, setActiveCashierSession] = useState<any>(null);

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const { data: tablesData, error: tablesError } = await supabase.from("restaurant_tables").select("*").order("number");
      if (tablesError) {
        console.error("Erro ao buscar mesas:", tablesError);
        toast.error("Erro ao buscar mesas: " + tablesError.message);
      }

      const { data: sessionsData, error: sessionsError } = await supabase.from("table_sessions").select(`
        *,
        restaurant_tables(*),
        waiters(*),
        table_order_items(*)
      `).in("status", ["open", "bill_requested"]);
      if (sessionsError) {
        console.error("Erro ao buscar sessões:", sessionsError);
        toast.error("Erro ao buscar sessões: " + sessionsError.message);
      }
      
      const { data: settings, error: settingsError } = await supabase.from("store_settings").select("*").single();
      if (settingsError) {
        console.error("Erro ao buscar store_settings:", settingsError);
        toast.error("Erro ao carregar configurações da empresa: " + settingsError.message);
      }
      
      const { data: cashierData } = await supabase
        .from("cashier_sessions")
        .select("*")
        .is("closed_at", null)
        .maybeSingle();
      
      setTables(tablesData || []);
      setSessions(sessionsData || []);
      setStoreSettings(settings || null);
      setActiveCashierSession(cashierData || null);
    } catch (error: any) {
      console.error("Erro crítico ao carregar dashboard:", error);
      toast.error("Erro crítico ao carregar dashboard: " + error.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Configurar Realtime para atualizações instantâneas do mapa de mesas
    const channel = supabase
      .channel('table_dashboard_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'table_sessions'
      }, () => {
        console.log("🔄 Sessão de mesa alterada, atualizando mapa...");
        fetchData(false);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'table_order_items'
      }, () => {
        console.log("🔄 Itens da mesa alterados, atualizando mapa...");
        fetchData(false);
      })
      .subscribe();

    // Increased polling interval as Realtime is active
    const interval = setInterval(() => fetchData(false), 60000);
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const getTableStatus = (tableId: string) => {
    const session = sessions.find(s => s.table_id === tableId);
    if (!session) return { color: "bg-green-500", label: "Disponível", status: "free" };
    
    if (session.status === 'bill_requested') return { color: "bg-orange-500", label: "Pediu Conta", status: "bill_requested", session };
    
    // Check for Ociosa
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
    // Bloqueia acesso a mesas se o usuário for KDS Only
    const sessionStr = localStorage.getItem('admin_session');
    const user = sessionStr ? JSON.parse(sessionStr) : null;
    if (user?.is_kds_only && user?.role !== 'master') {
      toast.error("Acesso restrito à produção (KDS).");
      return;
    }

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black uppercase text-foreground">Mapa de Mesas</h2>
          <div className="flex gap-4 mt-1">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-[9px] font-bold uppercase text-muted-foreground">Livre</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-[9px] font-bold uppercase text-muted-foreground">Consumo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-orange-500" />
              <span className="text-[9px] font-bold uppercase text-muted-foreground">Conta</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-[9px] font-bold uppercase text-muted-foreground">Ociosa</span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchData(true)} className="rounded-full font-black uppercase text-[10px]">
          <RefreshCw className={`h-3 w-3 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {tables.map((table) => {
          const { color, label, status, session } = getTableStatus(table.id);
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
                status === 'free' && activeCashierSession ? 'bg-green-50/50 dark:bg-emerald-950/30 border-green-100 dark:border-emerald-800/50 hover:border-green-400' : 
                status === 'bill_requested' && activeCashierSession ? 'bg-orange-50 dark:bg-amber-950/40 border-orange-200 dark:border-amber-800/50 hover:border-orange-400' : 
                status === 'idle' && activeCashierSession ? 'bg-red-50 dark:bg-rose-950/40 border-red-200 dark:border-rose-800/50 hover:border-red-400' :
                activeCashierSession ? 'bg-blue-50/50 dark:bg-sky-950/30 border-blue-100 dark:border-sky-800/50 hover:border-blue-400' :
                'border-zinc-300 dark:border-zinc-800'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                  <span className="text-xl font-black text-foreground dark:text-white leading-none">{table.number}</span>
                  <span className="text-[8px] font-black uppercase text-muted-foreground dark:text-zinc-400 tracking-tighter">{table.sector}</span>
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
                    <span className="text-[10px] font-black uppercase truncate dark:text-zinc-200">{session.client_name || "Cliente"}</span>
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
                      <span className="text-[10px] font-bold dark:text-zinc-300">{timeOpen}m</span>
                    </div>
                    {session.table_order_items?.some((i: any) => (['ready', 'finished'].includes(i.production_status) || i.status === 'ready')) ? (
                      <Badge className="bg-green-600 animate-bounce h-4 text-[8px] px-1 font-black">
                        PRONTO
                      </Badge>
                    ) : null}
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

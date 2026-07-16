
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, TrendingUp, Users } from "lucide-react";
import { gerarHtmlImpressao } from "@/lib/print-template";


export function TableReports() {
  const [reportData, setReportData] = useState<any[]>([]);
  const [sessionList, setSessionList] = useState<any[]>([]);
  const [cashierSessions, setCashierSessions] = useState<any[]>([]);
  const [selectedCashierSessionId, setSelectedCashierSessionId] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"summary" | "sessions">("summary");
  const [dateRange, setDateRange] = useState(() => {
    const today = new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
    return { start: today, end: today };
  });

  const fetchCashierSessions = async () => {
    const { data } = await supabase
      .from("cashier_sessions")
      .select("*")
      .order("opened_at", { ascending: false })
      .limit(50);
    
    if (data) {
      setCashierSessions(data);
      const active = data.find(s => s.status === 'open');
      if (active) {
        setSelectedCashierSessionId(active.id);
      }
    }
  };

  useEffect(() => {
    fetchCashierSessions();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      // Fetch closed sessions in range with waiter info
      let query = supabase
        .from("table_sessions")
        .select(`
          *,
          waiters(*),
          restaurant_tables(*),
          financial_transactions(*)
        `)
        .eq("status", "closed");

      if (selectedCashierSessionId !== "all") {
        query = query.eq("cashier_session_id", selectedCashierSessionId);
      } else {
        query = query.gte("closed_at", dateRange.start + "T00:00:00-03:00")
                     .lte("closed_at", dateRange.end + "T23:59:59-03:00");
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setSessionList(data || []);

      // Group by waiter
      const grouped = (data || []).reduce((acc: any, session: any) => {
        const waiterId = session.waiter_id;
        const waiterName = session.waiters?.name || "Desconhecido";
        
        if (!acc[waiterId]) {
          acc[waiterId] = {
            name: waiterName,
            totalSales: 0,
            totalCommission: 0,
            tableCount: 0
          };
        }
        
        const total = Number(session.total_amount || 0);
        // Only count as commission if the waiter has commission enabled
        const hasCommission = session.waiters?.has_commission !== false;
        const commission = hasCommission ? Number(session.service_tax_value || 0) : 0;

        acc[waiterId].totalSales += total;
        acc[waiterId].totalCommission += commission;
        acc[waiterId].tableCount += 1;
        
        return acc;
      }, {});

      setReportData(Object.values(grouped));
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [dateRange, selectedCashierSessionId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-end gap-4 bg-muted/30 p-4 rounded-2xl border">
        <div className="flex flex-col gap-4 w-full sm:w-auto">
          <div className="flex gap-2 mb-2">
            <Button 
              variant={view === 'summary' ? "default" : "outline"} 
              size="sm" 
              className="font-black uppercase text-[10px] rounded-full"
              onClick={() => setView('summary')}
            >
              Resumo Garçom
            </Button>
            <Button 
              variant={view === 'sessions' ? "default" : "outline"} 
              size="sm" 
              className="font-black uppercase text-[10px] rounded-full"
              onClick={() => setView('sessions')}
            >
              Lista de Atendimentos
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-muted-foreground">Filtrar por Sessão de Caixa</span>
              <Select value={selectedCashierSessionId} onValueChange={setSelectedCashierSessionId}>
                <SelectTrigger className="h-9 text-xs font-bold">
                  <SelectValue placeholder="Selecione o caixa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas (Por Data)</SelectItem>
                  {cashierSessions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {new Date(s.opened_at).toLocaleString('pt-BR')} - {s.status === 'open' ? 'Aberto' : 'Fechado'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedCashierSessionId === "all" && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-muted-foreground">Início</span>
                  <Input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} className="h-9 text-xs font-bold" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-muted-foreground">Fim</span>
                  <Input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} className="h-9 text-xs font-bold" />
                </div>
              </div>
            )}
          </div>
        </div>
        <Button 
          variant="outline" 
          className="font-black uppercase text-[10px] rounded-full gap-2"
          onClick={async () => {
            const { data: storeSettings } = await supabase
              .from('store_settings')
              .select('print_paper_format,name')
              .maybeSingle();

            const printWindow = window.open('', '_blank');
            if (!printWindow) return;

            const formato = ((storeSettings as any)?.print_paper_format || 'a4') as 'a4' | 'thermal_80mm';

            const totalVendas = sessionList.reduce((acc, s) => acc + Number(s.total_amount || 0), 0);
            const totalComissao = reportData.reduce((acc, r) => acc + r.totalCommission, 0);

            const items = sessionList.map((s) => ({
              name: `Mesa ${s.restaurant_tables?.number || '-'} — ${s.waiters?.name || '-'} (${s.payment_method || '-'})`,
              quantity: 1,
              price: Number(s.total_amount || 0),
              notes: s.closed_at ? new Date(s.closed_at).toLocaleString('pt-BR') : '',
            }));

            const html = gerarHtmlImpressao({
              titulo: `RELATÓRIO DE ATENDIMENTOS - ${(storeSettings as any)?.name || 'MESAS'}`,
              formato,
              content: {
                order_number: `${dateRange.start} a ${dateRange.end}`,
                sector_name: `Mesas atendidas: ${sessionList.length} | Comissões: R$ ${totalComissao.toFixed(2)}`,
                created_at: new Date().toISOString(),
                total: totalVendas,
                items,
              },
              rodapePersonalizado: `Relatório gerado em ${new Date().toLocaleString('pt-BR')}`,
            });

            printWindow.document.write(html);
            printWindow.document.close();
          }}

        >
          <Download className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-lg bg-blue-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase text-blue-900 flex items-center gap-2">
              Vendas Totais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-blue-700">
              R$ {sessionList.reduce((acc, s) => acc + Number(s.total_amount || 0), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-lg bg-green-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase text-green-900 flex items-center gap-2">
              Total Comissões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-green-700">
              R$ {reportData.reduce((acc, r) => acc + r.totalCommission, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-orange-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase text-orange-900 flex items-center gap-2">
              Mesas Atendidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-orange-700">
              {sessionList.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl overflow-hidden">
        {view === 'summary' ? (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-[10px] font-black uppercase">Garçom</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-center">Mesas</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-right">Total Vendas</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-right">Comissão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-bold">{row.name}</TableCell>
                  <TableCell className="text-center font-bold">{row.tableCount}</TableCell>
                  <TableCell className="text-right font-bold">R$ {row.totalSales.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Badge className="bg-green-600 text-white font-black text-[10px]">
                      R$ {row.totalCommission.toFixed(2)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {reportData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 text-muted-foreground uppercase text-[10px] font-black">
                    Nenhum dado para o período selecionado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-[10px] font-black uppercase">Data/Hora</TableHead>
                <TableHead className="text-[10px] font-black uppercase">Mesa</TableHead>
                <TableHead className="text-[10px] font-black uppercase">Garçom</TableHead>
                <TableHead className="text-[10px] font-black uppercase">Pagamento</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessionList.map((session, idx) => (
                <TableRow key={idx}>
                  <TableCell className="text-xs font-bold">
                    {new Date(session.closed_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell className="text-xs font-bold">
                    Mesa {session.restaurant_tables?.number}
                  </TableCell>
                  <TableCell className="text-xs font-bold">{session.waiters?.name}</TableCell>
                  <TableCell className="text-xs font-bold">
                    <Badge variant="outline" className="text-[8px] uppercase font-black">
                      {session.payment_method || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-black text-blue-600">
                    R$ {Number(session.total_amount || 0).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              {sessionList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground uppercase text-[10px] font-black">
                    Nenhum atendimento fechado no período
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

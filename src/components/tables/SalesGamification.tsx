
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Flame, 
  TrendingUp, 
  Star, 
  Clock, 
  Zap,
  Target,
  Crown
} from "lucide-react";
import { toast } from "sonner";

export function SalesGamification() {
  const [loading, setLoading] = useState(true);
  const [topWaiters, setTopWaiters] = useState<any[]>([]);
  const [stats, setStats] = useState({
    avgServiceTime: 0,
    peakHour: "19:00",
    totalToday: 0
  });

  const fetchGamificationData = async () => {
    try {
      setLoading(true);
      
      // Fetch waiter rankings (mock logic for now based on sessions)
      const { data: rankingsData, error: rankingsError } = await supabase
        .from("table_sessions")
        .select(`
          total_amount,
          waiter_id,
          waiters(name, avatar_url)
        `)
        .in("status", ["closed"])
        .gte("opened_at", new Date(new Date().setHours(0,0,0,0)).toISOString());

      if (rankingsError) throw rankingsError;

      // Group by waiter
      const waiterStats = (rankingsData || []).reduce((acc: any, session: any) => {
        if (!session.waiter_id) return acc;
        const name = session.waiters?.name || "Desconhecido";
        if (!acc[name]) {
          acc[name] = { name, total: 0, count: 0, avatar: session.waiters?.avatar_url };
        }
        acc[name].total += Number(session.total_amount || 0);
        acc[name].count += 1;
        return acc;
      }, {});

      const sortedWaiters = Object.values(waiterStats)
        .sort((a: any, b: any) => b.total - a.total)
        .slice(0, 3);

      setTopWaiters(sortedWaiters);
      
      // Calculate total today
      const totalToday = (rankingsData || []).reduce((sum, s) => sum + Number(s.total_amount || 0), 0);
      setStats(prev => ({ ...prev, totalToday }));

    } catch (error: any) {
      console.error("Erro no gamification:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGamificationData();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Ranking de Estrelas */}
      <Card className="col-span-1 md:col-span-2 border-none shadow-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 text-white overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Trophy className="w-32 h-32 text-yellow-500 rotate-12" />
        </div>
        
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-5 h-5 text-yellow-500 animate-bounce" />
            <CardTitle className="text-xl font-black uppercase italic tracking-tighter">
              Hall da Fama: Garçons
            </CardTitle>
          </div>
          <CardDescription className="text-zinc-400 font-bold uppercase text-[10px]">
            Os heróis do salão que estão dominando as vendas hoje
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {topWaiters.length > 0 ? (
            topWaiters.map((waiter, index) => (
              <div key={index} className="relative flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                    index === 0 ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.4)]' :
                    index === 1 ? 'bg-zinc-300 text-black' :
                    'bg-orange-700 text-white'
                  }`}>
                    {index + 1}º
                  </div>
                  <div>
                    <h4 className="font-black uppercase text-sm">{waiter.name}</h4>
                    <div className="flex items-center gap-2">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">{waiter.count} Atendimentos</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-yellow-500">R$ {waiter.total.toFixed(2)}</p>
                  <Badge variant="outline" className="text-[8px] border-white/20 text-zinc-400 uppercase">Superstar</Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 text-center text-zinc-500 font-bold uppercase text-xs italic">
              Aguardando a primeira grande venda do dia...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metas e Insights */}
      <div className="space-y-6">
        <Card className="border-none shadow-xl bg-orange-600 text-white overflow-hidden relative">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-black uppercase tracking-widest">Meta Diária</CardTitle>
              <Target className="w-4 h-4 opacity-50" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <span className="text-3xl font-black italic">82%</span>
              <p className="text-[10px] font-bold uppercase opacity-80">R$ {stats.totalToday.toFixed(2)} / R$ 5.000,00</p>
            </div>
            <Progress value={82} className="h-2 bg-orange-800" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
              <Flame className="w-3 h-3 text-orange-600" />
              Power Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-black uppercase">Giro de Mesa</span>
              </div>
              <span className="text-xs font-black">42 min</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-[10px] font-black uppercase">Ticket Médio</span>
              </div>
              <span className="text-xs font-black text-green-600">R$ 84,50</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <span className="text-[10px] font-black uppercase">Pico Previsto</span>
              </div>
              <span className="text-xs font-black">20:30</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

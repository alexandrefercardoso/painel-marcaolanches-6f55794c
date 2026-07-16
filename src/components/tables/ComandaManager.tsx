import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket, Unlock, RefreshCw, AlertTriangle, CheckCircle2, XCircle, Plus, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ComandaRow = {
  id: string;
  numero: number;
  identificacao: string | null;
  status: "disponivel" | "em_uso" | string;
  table_session_id: string | null;
  session_status: string | null;
  table_number: number | string | null;
  total_consumido: number | null;
  opened_at: string | null;
};

type Filter = "todas" | "disponivel" | "em_uso" | "presas";

function isPresa(c: ComandaRow) {
  return c.status === "em_uso" && (!c.session_status || c.session_status === "closed");
}

export function ComandaManager() {
  const [comandas, setComandas] = useState<ComandaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("todas");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<{ inicio: string; quantidade: string }>({ inicio: "", quantidade: "10" });
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("v_comandas_status")
      .select("*")
      .order("numero", { ascending: true });
    if (error) {
      toast.error("Erro ao carregar comandas: " + error.message);
      setComandas([]);
    } else {
      setComandas((data || []) as ComandaRow[]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const disponiveis = comandas.filter(c => c.status === "disponivel");
  const emUso = comandas.filter(c => c.status === "em_uso");
  const presas = comandas.filter(isPresa);

  const filtered = comandas.filter(c => {
    if (filter === "disponivel") return c.status === "disponivel";
    if (filter === "em_uso") return c.status === "em_uso";
    if (filter === "presas") return isPresa(c);
    return true;
  });

  const liberar = async (id: string) => {
    const c = comandas.find(x => x.id === id);
    const { error } = await (supabase as any).rpc("admin_liberar_comanda_forcado", { p_comanda_id: id });
    if (error) {
      toast.error("Erro ao liberar: " + error.message);
      return;
    }
    toast.success(`Comanda #${String(c?.numero || "").padStart(3, "0")} liberada com sucesso!`);
    await load();
  };

  const liberarTodasPresas = async () => {
    for (const c of presas) {
      await (supabase as any).rpc("admin_liberar_comanda_forcado", { p_comanda_id: c.id });
    }
    toast.success(`${presas.length} comanda(s) presa(s) liberada(s)!`);
    await load();
  };

  const maxNumero = comandas.reduce((m, c) => Math.max(m, Number(c.numero) || 0), 0);

  const openCreateDialog = () => {
    setCreateForm({ inicio: String(maxNumero + 1), quantidade: "10" });
    setCreateOpen(true);
  };

  const criarComandas = async () => {
    const inicio = parseInt(createForm.inicio, 10);
    const qtd = parseInt(createForm.quantidade, 10);
    if (!Number.isFinite(inicio) || inicio < 1) return toast.error("Número inicial inválido.");
    if (!Number.isFinite(qtd) || qtd < 1 || qtd > 500) return toast.error("Quantidade deve ser entre 1 e 500.");

    const existentes = new Set(comandas.map(c => Number(c.numero)));
    const rows: { numero: number; status: string }[] = [];
    for (let i = 0; i < qtd; i++) {
      const n = inicio + i;
      if (!existentes.has(n)) rows.push({ numero: n, status: "disponivel" });
    }
    if (rows.length === 0) {
      toast.error("Todos os números desse intervalo já existem.");
      return;
    }

    setCreating(true);
    const { error } = await (supabase as any).from("comandas").insert(rows);
    setCreating(false);
    if (error) {
      toast.error("Erro ao criar: " + error.message);
      return;
    }
    toast.success(`${rows.length} comanda(s) criada(s)! 🎉`);
    setCreateOpen(false);
    await load();
  };

  const excluir = async (id: string) => {
    const c = comandas.find(x => x.id === id);
    if (c && c.status === "em_uso" && !isPresa(c)) {
      toast.error("Não é possível excluir uma comanda em uso.");
      return;
    }
    const { error } = await (supabase as any).from("comandas").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir: " + error.message);
      return;
    }
    toast.success(`Comanda #${String(c?.numero || "").padStart(3, "0")} excluída.`);
    await load();
  };



  return (
    <div className="space-y-4">
      {/* Header cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-green-500/40">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black uppercase text-muted-foreground">Disponíveis</div>
              <div className="text-3xl font-black text-green-600">{disponiveis.length}</div>
            </div>
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </CardContent>
        </Card>
        <Card className="border-2 border-red-500/40">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black uppercase text-muted-foreground">Em Uso</div>
              <div className="text-3xl font-black text-red-600">{emUso.length}</div>
            </div>
            <XCircle className="h-10 w-10 text-red-500" />
          </CardContent>
        </Card>
        <Card className="border-2 border-yellow-500/40">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black uppercase text-muted-foreground">Presas (suspeitas)</div>
              <div className="text-3xl font-black text-yellow-600">{presas.length}</div>
            </div>
            <AlertTriangle className="h-10 w-10 text-yellow-500" />
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {(["todas","disponivel","em_uso","presas"] as Filter[]).map(f => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              className="rounded-full font-black uppercase text-[10px]"
            >
              {f === "todas" ? "Todas" : f === "disponivel" ? "Disponíveis" : f === "em_uso" ? "Em Uso" : "Presas"}
            </Button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={load} className="rounded-full">
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Atualizar
          </Button>
          <Button size="sm" onClick={openCreateDialog} className="rounded-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-black uppercase text-[10px] shadow-lg shadow-orange-500/30">
            <Plus className="h-3.5 w-3.5 mr-1" /> Nova Comanda
          </Button>
          {presas.length > 0 && (
            <Button size="sm" onClick={() => setConfirmAll(true)} className="rounded-full bg-yellow-500 hover:bg-yellow-600 text-black font-black uppercase text-[10px]">
              <Unlock className="h-3.5 w-3.5 mr-1" /> Liberar Todas Presas ({presas.length})
            </Button>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Carregando comandas...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Nenhuma comanda nesse filtro.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map(c => {
            const presa = isPresa(c);
            const color = presa
              ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
              : c.status === "disponivel"
              ? "border-green-500 bg-green-50 dark:bg-green-950/20"
              : "border-red-500 bg-red-50 dark:bg-red-950/20";
            return (
              <Card key={c.id} className={`border-2 ${color} transition-all hover:scale-[1.02]`}>
                <CardContent className="p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1">
                      <Ticket className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xl font-black">#{String(c.numero).padStart(3, "0")}</span>
                    </div>
                    {presa ? (
                      <Badge className="bg-yellow-500 text-black text-[9px] font-black">⚠️ PRESA</Badge>
                    ) : c.status === "disponivel" ? (
                      <Badge className="bg-green-600 text-[9px] font-black">Livre</Badge>
                    ) : (
                      <Badge className="bg-red-600 text-[9px] font-black">Em uso</Badge>
                    )}
                  </div>
                  {c.status === "em_uso" && (
                    <div className="space-y-1 text-[11px]">
                      {c.table_number != null && (
                        <div className="font-bold">Mesa {c.table_number}</div>
                      )}
                      {c.identificacao && (
                        <div className="text-muted-foreground truncate">{c.identificacao}</div>
                      )}
                      <div className="font-black text-primary">
                        R$ {Number(c.total_consumido || 0).toFixed(2)}
                      </div>
                      {c.opened_at && (
                        <div className="text-[9px] text-muted-foreground">
                          {new Date(c.opened_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                    </div>
                  )}
                  {c.status === "em_uso" && (
                    <Button
                      size="sm"
                      onClick={() => setConfirmId(c.id)}
                      className="w-full h-7 rounded-full text-[10px] font-black uppercase bg-orange-600 hover:bg-orange-700"
                    >
                      <Unlock className="h-3 w-3 mr-1" /> Liberar
                    </Button>
                  )}
                  {c.status === "disponivel" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteId(c.id)}
                      className="w-full h-7 rounded-full text-[10px] font-black uppercase border-red-500/40 text-red-600 hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> Excluir
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Liberar comanda?</AlertDialogTitle>
            <AlertDialogDescription>
              A comanda voltará ao pool como disponível. Esta ação é forçada e não fecha a sessão da mesa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (confirmId) liberar(confirmId); setConfirmId(null); }}>
              Liberar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmAll} onOpenChange={setConfirmAll}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Liberar todas as comandas presas?</AlertDialogTitle>
            <AlertDialogDescription>
              {presas.length} comanda(s) serão devolvidas ao pool. Ação irreversível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { liberarTodasPresas(); setConfirmAll(false); }}>
              Liberar todas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir comanda?</AlertDialogTitle>
            <AlertDialogDescription>
              A comanda será removida permanentemente do pool. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (deleteId) excluir(deleteId); setDeleteId(null); }}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-black uppercase">
              <Sparkles className="h-5 w-5 text-orange-500" /> Criar Comandas em Lote
            </DialogTitle>
            <DialogDescription>
              Gera uma sequência de comandas disponíveis. Números já existentes são pulados automaticamente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase">Nº Inicial</Label>
              <Input
                type="number"
                min={1}
                value={createForm.inicio}
                onChange={(e) => setCreateForm(f => ({ ...f, inicio: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase">Quantidade</Label>
              <Input
                type="number"
                min={1}
                max={500}
                value={createForm.quantidade}
                onChange={(e) => setCreateForm(f => ({ ...f, quantidade: e.target.value }))}
              />
            </div>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-[11px]">
            Serão criadas comandas de <span className="font-black">#{String(parseInt(createForm.inicio || "0", 10) || 0).padStart(3, "0")}</span> até{" "}
            <span className="font-black">
              #{String((parseInt(createForm.inicio || "0", 10) || 0) + (parseInt(createForm.quantidade || "0", 10) || 0) - 1).padStart(3, "0")}
            </span>.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button
              onClick={criarComandas}
              disabled={creating}
              className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-black uppercase"
            >
              <Plus className="h-4 w-4 mr-1" /> {creating ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

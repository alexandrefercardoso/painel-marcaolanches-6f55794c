import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { formatDisplayDate } from "@/lib/dateUtils";

interface Product {
  id: string;
  name: string;
  unit: string | null;
  current_stock: number | null;
  minimum_stock: number | null;
  cost_per_unit: number | null;
  product_type: string | null;
  control_inventory: boolean | null;
}

interface Movement {
  id: string;
  product_id: string;
  movement_type: string;
  quantity: number;
  unit_cost: number | null;
  reason: string | null;
  reference_type: string | null;
  notes: string | null;
  created_at: string;
}

const PT_META: Record<string, { label: string; color: string }> = {
  INGREDIENTE: { label: "Insumo",  color: "bg-blue-100 text-blue-700 border-blue-200" },
  VENDA:       { label: "Produto", color: "bg-orange-100 text-orange-700 border-orange-200" },
  AMBOS:       { label: "Ambos",   color: "bg-purple-100 text-purple-700 border-purple-200" },
};

const MOV_LABEL: Record<string, string> = {
  IN: "Entrada", OUT: "Saída", ADJUST: "Ajuste", LOSS: "Perda", SAIDA: "Venda",
};

function situationOf(stock: number, min: number) {
  if (stock <= 0) return { key: "zerado", label: "Zerado",  color: "bg-red-100 text-red-700 border-red-200" };
  if (stock <= min) return { key: "atencao", label: "Atenção", color: "bg-yellow-100 text-yellow-700 border-yellow-200" };
  return { key: "normal", label: "Normal", color: "bg-green-100 text-green-700 border-green-200" };
}

function toCSV(rows: (string | number)[][]) {
  return rows.map(r => r.map(c => {
    const s = String(c ?? "");
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(";")).join("\n");
}

function download(filename: string, content: string) {
  const blob = new Blob(["\ufeff" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function RelatorioEstoque() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(false);

  // filtros posição
  const [fType, setFType] = useState<string>("all");
  const [fSit, setFSit] = useState<string>("all");

  // filtros movimentações
  const [mFrom, setMFrom] = useState<string>(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [mTo, setMTo] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [mType, setMType] = useState<string>("all");
  const [mProduct, setMProduct] = useState<string>("all");
  const [mSearch, setMSearch] = useState<string>("");

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id,name,unit,current_stock,minimum_stock,cost_per_unit,product_type,control_inventory")
      .eq("control_inventory", true)
      .order("name")
      .limit(500);
    if (error) { toast.error("Erro ao carregar posição"); return; }
    setProducts((data || []) as any);
  };

  const loadMovements = async () => {
    setLoading(true);
    let q = supabase
      .from("stock_movements")
      .select("id,product_id,movement_type,quantity,unit_cost,reason,reference_type,notes,created_at")
      .gte("created_at", `${mFrom}T00:00:00`)
      .lte("created_at", `${mTo}T23:59:59`)
      .order("created_at", { ascending: true }) // asc para running total
      .limit(500);
    if (mType !== "all") q = q.eq("movement_type", mType);
    if (mProduct !== "all") q = q.eq("product_id", mProduct);
    const { data, error } = await q;
    if (error) toast.error("Erro ao carregar movimentações");
    else setMovements((data || []) as any);
    setLoading(false);
  };

  useEffect(() => { loadProducts(); }, []);
  useEffect(() => { loadMovements(); }, [mFrom, mTo, mType, mProduct]);

  // ===== Posição =====
  const posRows = useMemo(() => {
    return products
      .filter(p => {
        const pt = (p.product_type || "").toUpperCase();
        if (fType === "INGREDIENTE" && !(pt === "INGREDIENTE" || pt === "AMBOS")) return false;
        if (fType === "VENDA" && !(pt === "VENDA" || pt === "AMBOS")) return false;
        const s = situationOf(Number(p.current_stock || 0), Number(p.minimum_stock || 0));
        if (fSit !== "all" && s.key !== fSit) return false;
        return true;
      });
  }, [products, fType, fSit]);

  const totals = useMemo(() => {
    let alert = 0, value = 0;
    for (const p of posRows) {
      const s = situationOf(Number(p.current_stock || 0), Number(p.minimum_stock || 0));
      if (s.key !== "normal") alert++;
      value += Number(p.current_stock || 0) * Number(p.cost_per_unit || 0);
    }
    return { count: posRows.length, alert, value };
  }, [posRows]);

  const exportPosCSV = () => {
    const header = ["Produto","Tipo","Unidade","Saldo Atual","Estoque Mín.","Situação","Custo Unit.","Valor em Estoque"];
    const rows: (string | number)[][] = [header];
    for (const p of posRows) {
      const st = Number(p.current_stock || 0);
      const min = Number(p.minimum_stock || 0);
      const cost = Number(p.cost_per_unit || 0);
      rows.push([
        p.name,
        PT_META[(p.product_type || "").toUpperCase()]?.label || "-",
        p.unit || "",
        st.toFixed(2).replace(".", ","),
        min.toFixed(2).replace(".", ","),
        situationOf(st, min).label,
        cost.toFixed(4).replace(".", ","),
        (st * cost).toFixed(2).replace(".", ","),
      ]);
    }
    download(`posicao_estoque_${new Date().toISOString().slice(0,10)}.csv`, toCSV(rows));
  };

  // ===== Movimentações com saldo após =====
  const productMap = useMemo(() => {
    const m: Record<string, Product> = {};
    for (const p of products) m[p.id] = p;
    return m;
  }, [products]);

  const movementsWithBalance = useMemo(() => {
    const running: Record<string, number> = {};
    // saldo inicial = current_stock - soma(delta das movs do período) — para reconstruir saldo antes
    const deltaSign = (t: string) => (t === "IN" ? 1 : t === "OUT" || t === "SAIDA" || t === "LOSS" ? -1 : 0);
    const totalDelta: Record<string, number> = {};
    for (const m of movements) {
      const s = deltaSign(m.movement_type);
      totalDelta[m.product_id] = (totalDelta[m.product_id] || 0) + s * Number(m.quantity);
    }
    for (const pid of Object.keys(totalDelta)) {
      const curr = Number(productMap[pid]?.current_stock || 0);
      running[pid] = curr - totalDelta[pid]; // saldo antes do primeiro movimento no período
    }
    return movements.map(m => {
      const s = deltaSign(m.movement_type);
      let after: number;
      if (m.movement_type === "ADJUST") {
        after = Number(m.quantity);
      } else {
        running[m.product_id] = (running[m.product_id] || 0) + s * Number(m.quantity);
        after = running[m.product_id];
      }
      if (m.movement_type === "ADJUST") running[m.product_id] = after;
      return { ...m, balance_after: after };
    });
  }, [movements, productMap]);

  const filteredMovs = useMemo(() => {
    const s = mSearch.trim().toLowerCase();
    const arr = [...movementsWithBalance].reverse(); // exibe do mais recente
    if (!s) return arr;
    return arr.filter(m => {
      const p = productMap[m.product_id];
      return (
        p?.name?.toLowerCase().includes(s) ||
        m.reason?.toLowerCase().includes(s) ||
        m.notes?.toLowerCase().includes(s)
      );
    });
  }, [movementsWithBalance, mSearch, productMap]);

  const exportMovCSV = () => {
    const header = ["Data","Movimento","Produto","Qtd","Unidade","Custo Un.","Saldo após","Motivo","Origem"];
    const rows: (string | number)[][] = [header];
    for (const m of filteredMovs) {
      const p = productMap[m.product_id];
      rows.push([
        formatDisplayDate(m.created_at),
        MOV_LABEL[m.movement_type] || m.movement_type,
        p?.name || "-",
        Number(m.quantity).toFixed(4).replace(".", ","),
        p?.unit || "",
        m.unit_cost != null ? Number(m.unit_cost).toFixed(4).replace(".", ",") : "",
        Number((m as any).balance_after).toFixed(2).replace(".", ","),
        m.reason || "",
        m.reference_type || "",
      ]);
    }
    download(`movimentacoes_${mFrom}_a_${mTo}.csv`, toCSV(rows));
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-black uppercase tracking-tighter bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
          Relatório / Posição
        </h2>
        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">
          Posição atual e movimentações de estoque
        </p>
      </div>

      <Tabs defaultValue="posicao">
        <TabsList>
          <TabsTrigger value="posicao">Posição Atual</TabsTrigger>
          <TabsTrigger value="movimentacoes">Movimentações do Período</TabsTrigger>
        </TabsList>

        {/* ================= POSIÇÃO ================= */}
        <TabsContent value="posicao" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Filtros</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs">Tipo</Label>
                <Select value={fType} onValueChange={setFType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="INGREDIENTE">Insumos</SelectItem>
                    <SelectItem value="VENDA">Produtos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Situação</Label>
                <Select value={fSit} onValueChange={setFSit}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="atencao">Atenção</SelectItem>
                    <SelectItem value="zerado">Zerado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 flex items-end justify-end gap-2">
                <Button variant="outline" onClick={loadProducts}>
                  <RefreshCw className="w-3 h-3 mr-1" /> Atualizar
                </Button>
                <Button className="bg-orange-600 hover:bg-orange-700" onClick={exportPosCSV}>
                  <Download className="w-3 h-3 mr-1" /> Exportar CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Posição ({posRows.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs uppercase font-bold">
                    <tr>
                      <th className="text-left p-3">Produto</th>
                      <th className="text-left p-3">Tipo</th>
                      <th className="text-left p-3">Unidade</th>
                      <th className="text-right p-3">Saldo Atual</th>
                      <th className="text-right p-3">Estoque Mín.</th>
                      <th className="text-left p-3">Situação</th>
                      <th className="text-right p-3">Custo Unit.</th>
                      <th className="text-right p-3">Valor em Estoque</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posRows.length === 0 && (
                      <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">Nenhum produto com controle de estoque.</td></tr>
                    )}
                    {posRows.map(p => {
                      const st = Number(p.current_stock || 0);
                      const min = Number(p.minimum_stock || 0);
                      const cost = Number(p.cost_per_unit || 0);
                      const sit = situationOf(st, min);
                      const pt = PT_META[(p.product_type || "").toUpperCase()];
                      return (
                        <tr key={p.id} className="border-t hover:bg-muted/30">
                          <td className="p-3 font-medium">{p.name}</td>
                          <td className="p-3">{pt ? <Badge variant="outline" className={pt.color}>{pt.label}</Badge> : "—"}</td>
                          <td className="p-3 text-xs">{p.unit || "—"}</td>
                          <td className="p-3 text-right font-mono">{st.toFixed(2)}</td>
                          <td className="p-3 text-right font-mono">{min.toFixed(2)}</td>
                          <td className="p-3"><Badge variant="outline" className={sit.color}>{sit.label}</Badge></td>
                          <td className="p-3 text-right font-mono text-xs">R$ {cost.toFixed(4)}</td>
                          <td className="p-3 text-right font-mono font-bold">R$ {(st * cost).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-muted/40 text-xs font-bold">
                    <tr>
                      <td className="p-3" colSpan={3}>Total de itens: {totals.count} — Em alerta: {totals.alert}</td>
                      <td className="p-3 text-right" colSpan={5}>
                        Valor total em estoque: <span className="text-orange-600">R$ {totals.value.toFixed(2)}</span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= MOVIMENTAÇÕES ================= */}
        <TabsContent value="movimentacoes" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Filtros</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <div>
                <Label className="text-xs">De</Label>
                <Input type="date" value={mFrom} onChange={e => setMFrom(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Até</Label>
                <Input type="date" value={mTo} onChange={e => setMTo(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Tipo</Label>
                <Select value={mType} onValueChange={setMType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="IN">Entrada</SelectItem>
                    <SelectItem value="OUT">Saída</SelectItem>
                    <SelectItem value="ADJUST">Ajuste</SelectItem>
                    <SelectItem value="LOSS">Perda</SelectItem>
                    <SelectItem value="SAIDA">Venda (auto)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Produto</Label>
                <Select value={mProduct} onValueChange={setMProduct}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {products.map(p => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Buscar</Label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-2 top-2.5 text-muted-foreground" />
                  <Input className="pl-8" placeholder="Nome, motivo..." value={mSearch} onChange={e => setMSearch(e.target.value)} />
                </div>
              </div>
              <div className="flex items-end gap-2">
                <Button variant="outline" onClick={loadMovements} disabled={loading}>
                  <RefreshCw className={`w-3 h-3 mr-1 ${loading ? "animate-spin" : ""}`} />
                </Button>
                <Button className="bg-orange-600 hover:bg-orange-700" onClick={exportMovCSV}>
                  <Download className="w-3 h-3 mr-1" /> CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Movimentações ({filteredMovs.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs uppercase font-bold">
                    <tr>
                      <th className="text-left p-3">Data</th>
                      <th className="text-left p-3">Movimento</th>
                      <th className="text-left p-3">Produto</th>
                      <th className="text-right p-3">Qtd</th>
                      <th className="text-right p-3">Custo Un.</th>
                      <th className="text-right p-3">Saldo após</th>
                      <th className="text-left p-3">Motivo</th>
                      <th className="text-left p-3">Origem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMovs.length === 0 && (
                      <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">Nenhuma movimentação no período.</td></tr>
                    )}
                    {filteredMovs.map(m => {
                      const p = productMap[m.product_id];
                      return (
                        <tr key={m.id} className="border-t hover:bg-muted/30">
                          <td className="p-3 text-xs">{formatDisplayDate(m.created_at)}</td>
                          <td className="p-3 text-xs">{MOV_LABEL[m.movement_type] || m.movement_type}</td>
                          <td className="p-3 font-medium">{p?.name || "—"}</td>
                          <td className="p-3 text-right font-mono">{Number(m.quantity).toFixed(4)} {p?.unit || ""}</td>
                          <td className="p-3 text-right font-mono text-xs">{m.unit_cost != null ? `R$ ${Number(m.unit_cost).toFixed(4)}` : "—"}</td>
                          <td className="p-3 text-right font-mono font-bold">{Number((m as any).balance_after).toFixed(2)}</td>
                          <td className="p-3 text-xs">{m.reason || "—"}</td>
                          <td className="p-3 text-xs text-muted-foreground">{m.reference_type || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

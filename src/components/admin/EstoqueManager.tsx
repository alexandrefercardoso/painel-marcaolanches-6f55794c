import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowDownCircle, ArrowUpCircle, RefreshCw, Boxes, TrendingDown, Search } from "lucide-react";
import { formatDisplayDate } from "@/lib/dateUtils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RelatorioEstoque } from "./RelatorioEstoque";

type MovementType = "IN" | "OUT" | "ADJUST" | "LOSS";

interface Product {
  id: string;
  name: string;
  unit: string | null;
  current_stock: number | null;
  minimum_stock: number | null;
  cost_per_unit: number | null;
  product_type?: string | null;
}

const PRODUCT_TYPE_META: Record<string, { label: string; short: string; color: string }> = {
  INGREDIENTE: { label: "Insumo",  short: "Insumo",  color: "bg-blue-100 text-blue-700 border-blue-200" },
  VENDA:       { label: "Produto", short: "Produto", color: "bg-orange-100 text-orange-700 border-orange-200" },
  AMBOS:       { label: "Ambos",   short: "Ambos",   color: "bg-purple-100 text-purple-700 border-purple-200" },
};

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
  products?: { name: string; unit: string | null; product_type?: string | null } | null;
}

const TYPE_META: Record<string, { label: string; color: string; icon: any; sign: number }> = {
  IN:     { label: "Entrada", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: ArrowDownCircle, sign: 1 },
  OUT:    { label: "Saída",   color: "bg-red-100 text-red-700 border-red-200",             icon: ArrowUpCircle,   sign: -1 },
  ADJUST: { label: "Ajuste",  color: "bg-blue-100 text-blue-700 border-blue-200",          icon: RefreshCw,       sign: 0 },
  LOSS:   { label: "Perda",   color: "bg-orange-100 text-orange-700 border-orange-200",    icon: TrendingDown,    sign: -1 },
  SAIDA:  { label: "Venda",   color: "bg-slate-100 text-slate-700 border-slate-200",       icon: ArrowUpCircle,   sign: -1 },
};

export function EstoqueManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // filters
  const [fProduct, setFProduct] = useState<string>("all");
  const [fType, setFType] = useState<string>("all");
  const [fProductType, setFProductType] = useState<string>("all");
  const [fFrom, setFFrom] = useState<string>(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [fTo, setFTo] = useState<string>(() => new Date().toISOString().slice(0, 10));

  // dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    product_id: "",
    movement_type: "IN" as MovementType,
    quantity: "",
    unit_cost: "",
    reason: "",
    notes: "",
  });

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id,name,unit,current_stock,minimum_stock,cost_per_unit,product_type,control_inventory")
      .or("product_type.eq.INGREDIENTE,and(product_type.in.(VENDA,AMBOS),control_inventory.eq.true)")
      .order("name");
    if (error) { toast.error("Erro ao carregar produtos"); return; }
    setProducts((data || []) as any);
  };

  const loadMovements = async () => {
    setLoading(true);
    let q = supabase
      .from("stock_movements")
      .select("id,product_id,movement_type,quantity,unit_cost,reason,reference_type,notes,created_at")
      .gte("created_at", `${fFrom}T00:00:00`)
      .lte("created_at", `${fTo}T23:59:59`)
      .order("created_at", { ascending: false })
      .limit(500);

    if (fProduct !== "all") q = q.eq("product_id", fProduct);
    if (fType !== "all") q = q.eq("movement_type", fType);

    const { data, error } = await q;

    if (error) {
      console.error("Erro Supabase:", error);
      toast.error("Erro ao carregar movimentações");
    } else {
      const movementsWithProducts = (data || []).map((m: any) => ({
        ...m,
        products: products.find(p => p.id === m.product_id) || null,
      }));
      setMovements(movementsWithProducts as any);
    }
    setLoading(false);
  };

  useEffect(() => { loadProducts(); }, []);
  useEffect(() => { loadMovements(); }, [fProduct, fType, fFrom, fTo]);

  const submitMovement = async () => {
    if (!form.product_id) { toast.error("Selecione um insumo"); return; }
    const qty = parseFloat(form.quantity);
    if (!qty || qty <= 0) { toast.error("Quantidade inválida"); return; }

    const prod = products.find(p => p.id === form.product_id);
    if (!prod) return;

    const meta = TYPE_META[form.movement_type];
    const current = Number(prod.current_stock || 0);
    let newStock = current;
    if (form.movement_type === "ADJUST") newStock = qty;
    else newStock = current + meta.sign * qty;

    const { error: mErr } = await (supabase.from("stock_movements") as any).insert({
      product_id: form.product_id,
      movement_type: form.movement_type,
      quantity: qty,
      unit_cost: form.unit_cost ? parseFloat(form.unit_cost) : prod.cost_per_unit || 0,
      reason: form.reason || meta.label + " manual",
      reference_type: "MANUAL",
      notes: form.notes || null,
    });
    if (mErr) { toast.error("Erro ao registrar: " + mErr.message); return; }

    const { error: pErr } = await (supabase.from("products") as any)
      .update({ current_stock: newStock })
      .eq("id", form.product_id);
    if (pErr) { toast.error("Movimento salvo, mas falha ao atualizar estoque: " + pErr.message); }

    toast.success(`${meta.label} registrada`);
    setDialogOpen(false);
    setForm({ product_id: "", movement_type: "IN", quantity: "", unit_cost: "", reason: "", notes: "" });
    loadProducts();
    loadMovements();
  };

  const productTypeById = useMemo(() => {
    const m: Record<string, string> = {};
    for (const p of products) m[p.id] = (p.product_type || "").toUpperCase();
    return m;
  }, [products]);

  const filteredMovements = useMemo(() => {
    const s = search.trim().toLowerCase();
    return movements.filter(m => {
      if (fProductType !== "all") {
        const pt = productTypeById[m.product_id];
        if (fProductType === "INGREDIENTE" && !(pt === "INGREDIENTE" || pt === "AMBOS")) return false;
        if (fProductType === "VENDA" && !(pt === "VENDA" || pt === "AMBOS")) return false;
      }
      if (!s) return true;
      return (
        m.products?.name?.toLowerCase().includes(s) ||
        m.reason?.toLowerCase().includes(s) ||
        m.notes?.toLowerCase().includes(s)
      );
    });
  }, [movements, search, fProductType, productTypeById]);

  const totals = useMemo(() => {
    const t = { in: 0, out: 0, adjust: 0, loss: 0 };
    for (const m of movements) {
      if (m.movement_type === "IN") t.in += Number(m.quantity);
      else if (m.movement_type === "OUT" || m.movement_type === "SAIDA") t.out += Number(m.quantity);
      else if (m.movement_type === "ADJUST") t.adjust += 1;
      else if (m.movement_type === "LOSS") t.loss += Number(m.quantity);
    }
    return t;
  }, [movements]);

  const lowStock = products.filter(p =>
    p.minimum_stock != null && Number(p.current_stock || 0) <= Number(p.minimum_stock)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
            Estoque
          </h1>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">
            Movimentações e ajustes de insumos
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Boxes className="w-4 h-4 mr-2" /> Nova Movimentação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nova Movimentação de Estoque</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Tipo</Label>
                <Select value={form.movement_type} onValueChange={(v) => setForm({ ...form, movement_type: v as MovementType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN">Entrada (Compra / Reposição)</SelectItem>
                    <SelectItem value="OUT">Saída (Consumo manual)</SelectItem>
                    <SelectItem value="ADJUST">Ajuste (Definir saldo)</SelectItem>
                    <SelectItem value="LOSS">Perda / Quebra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Produto / Insumo</Label>
                <Select value={form.product_id} onValueChange={(v) => setForm({ ...form, product_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {products.map(p => {
                      const meta = PRODUCT_TYPE_META[(p.product_type || "").toUpperCase()] || PRODUCT_TYPE_META.INGREDIENTE;
                      return (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({meta.short}) — saldo: {Number(p.current_stock || 0).toFixed(2)} {p.unit || ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{form.movement_type === "ADJUST" ? "Saldo final" : "Quantidade"}</Label>
                  <Input type="number" step="0.0001" value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                </div>
                <div>
                  <Label>Custo unitário (R$)</Label>
                  <Input type="number" step="0.0001" value={form.unit_cost}
                    onChange={(e) => setForm({ ...form, unit_cost: e.target.value })}
                    placeholder="opcional" />
                </div>
              </div>
              <div>
                <Label>Motivo</Label>
                <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Ex: NF 1234, Contagem, Descarte..." />
              </div>
              <div>
                <Label>Observações</Label>
                <Textarea rows={2} value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={submitMovement} className="bg-orange-600 hover:bg-orange-700">Registrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="mov" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mov">Movimentações</TabsTrigger>
          <TabsTrigger value="rel">Relatório / Posição</TabsTrigger>
        </TabsList>

        <TabsContent value="mov" className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4">
          <p className="text-xs font-bold uppercase text-muted-foreground">Entradas</p>
          <p className="text-2xl font-black text-emerald-600">{totals.in.toFixed(2)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-bold uppercase text-muted-foreground">Saídas</p>
          <p className="text-2xl font-black text-red-600">{totals.out.toFixed(2)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-bold uppercase text-muted-foreground">Perdas</p>
          <p className="text-2xl font-black text-orange-600">{totals.loss.toFixed(2)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-bold uppercase text-muted-foreground">Insumos c/ estoque baixo</p>
          <p className="text-2xl font-black text-amber-600">{lowStock.length}</p>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Filtros</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div>
            <Label className="text-xs">De</Label>
            <Input type="date" value={fFrom} onChange={(e) => setFFrom(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Até</Label>
            <Input type="date" value={fTo} onChange={(e) => setFTo(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Tipo</Label>
            <Select value={fType} onValueChange={setFType}>
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
            <Label className="text-xs">Categoria</Label>
            <Select value={fProductType} onValueChange={setFProductType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="INGREDIENTE">Insumos</SelectItem>
                <SelectItem value="VENDA">Produtos de Venda</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Insumo</Label>
            <Select value={fProduct} onValueChange={setFProduct}>
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
              <Input className="pl-8" placeholder="Nome, motivo..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Movements table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Movimentações ({filteredMovements.length})</CardTitle>
          <Button size="sm" variant="outline" onClick={loadMovements} disabled={loading}>
            <RefreshCw className={`w-3 h-3 mr-1 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase font-bold">
                <tr>
                  <th className="text-left p-3">Data</th>
                  <th className="text-left p-3">Movimento</th>
                  <th className="text-left p-3">Produto</th>
                  <th className="text-left p-3">Tipo</th>
                  <th className="text-right p-3">Qtd</th>
                  <th className="text-right p-3">Custo Un.</th>
                  <th className="text-left p-3">Motivo</th>
                  <th className="text-left p-3">Origem</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.length === 0 && (
                  <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">Nenhuma movimentação no período.</td></tr>
                )}
                {filteredMovements.map(m => {
                  const meta = TYPE_META[m.movement_type] || TYPE_META.ADJUST;
                  const Icon = meta.icon;
                  const pt = (m.products?.product_type || "").toUpperCase();
                  const ptMeta = PRODUCT_TYPE_META[pt];
                  return (
                    <tr key={m.id} className="border-t hover:bg-muted/30">
                      <td className="p-3 text-xs">{formatDisplayDate(m.created_at)}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={meta.color}>
                          <Icon className="w-3 h-3 mr-1" />{meta.label}
                        </Badge>
                      </td>
                      <td className="p-3 font-medium">{m.products?.name || "—"}</td>
                      <td className="p-3">
                        {ptMeta ? (
                          <Badge variant="outline" className={ptMeta.color}>{ptMeta.label}</Badge>
                        ) : "—"}
                      </td>
                      <td className="p-3 text-right font-mono">
                        {Number(m.quantity).toFixed(4)} {m.products?.unit || ""}
                      </td>
                      <td className="p-3 text-right font-mono text-xs">
                        {m.unit_cost != null ? `R$ ${Number(m.unit_cost).toFixed(4)}` : "—"}
                      </td>
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

      {/* Low stock */}
      {lowStock.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm text-amber-700">⚠ Insumos abaixo do estoque mínimo</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {lowStock.map(p => (
                <div key={p.id} className="p-3 border rounded-lg flex justify-between items-center">
                  <span className="font-medium text-sm">{p.name}</span>
                  <span className="text-xs text-amber-700 font-bold">
                    {Number(p.current_stock || 0).toFixed(2)} / min {Number(p.minimum_stock || 0).toFixed(2)} {p.unit}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
        </TabsContent>

        <TabsContent value="rel">
          <RelatorioEstoque />
        </TabsContent>
      </Tabs>
    </div>
  );
}

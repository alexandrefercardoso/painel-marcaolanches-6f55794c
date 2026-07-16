import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, Search, Package, Trash2 } from "lucide-react";
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

const COLS = "id,name,category_id,unit,purchase_price,yield_quantity,loss_percentage,supplier_name,current_stock,minimum_stock,cost_per_unit,product_type";
const PAGE_SIZE = 100;

type Ingredient = {
  id: string;
  name: string;
  category_id: string | null;
  unit: string | null;
  purchase_price: number | null;
  yield_quantity: number | null;
  loss_percentage: number | null;
  supplier_name: string | null;
  current_stock: number | null;
  minimum_stock: number | null;
  cost_per_unit: number | null;
  product_type: string;
};

type Category = { id: string; name: string };

const UNITS = ["UN", "KG", "G", "L", "ML", "CX", "PCT", "DZ"];

function computeCost(purchase: number | null, yieldQ: number | null, loss: number | null) {
  const p = Number(purchase || 0);
  const y = Number(yieldQ || 0);
  const l = Number(loss || 0);
  if (!p || !y) return 0;
  const effective = y * (1 - l / 100);
  if (effective <= 0) return 0;
  return p / effective;
}

export function IngredientesManager() {
  const [rows, setRows] = useState<Ingredient[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Ingredient | null>(null);
  const [dirty, setDirty] = useState<Record<string, Partial<Ingredient>>>({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const load = async (p = 0, q = "") => {
    setLoading(true);
    const from = p * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    let query = supabase
      .from("products")
      .select(COLS, { count: "exact" })
      .in("product_type", ["INGREDIENTE", "AMBOS"])
      .order("name", { ascending: true })
      .range(from, to);
    if (q.trim()) query = query.ilike("name", `%${q.trim()}%`);
    const { data, error, count } = await query;
    if (error) {
      toast.error("Erro ao carregar insumos: " + error.message);
    } else {
      setRows((data as any) || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    supabase
      .from("categories")
      .select("id,name")
      .order("name")
      .then(({ data }) => setCategories((data as any) || []));
    load(0, "");
  }, []);

  const merged = useMemo(
    () => rows.map((r) => ({ ...r, ...(dirty[r.id] || {}) } as Ingredient)),
    [rows, dirty]
  );

  const setField = (id: string, field: keyof Ingredient, value: any) => {
    setDirty((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: value } }));
  };

  const save = async (id: string) => {
    const patch = dirty[id];
    if (!patch) return;
    setSaving(id);
    const current = rows.find((r) => r.id === id);
    const merged = { ...current, ...patch } as Ingredient;
    const cost = computeCost(
      Number(merged.purchase_price),
      Number(merged.yield_quantity),
      Number(merged.loss_percentage)
    );
    const payload: any = { ...patch, cost_per_unit: cost };
    const numFields = [
      "purchase_price",
      "yield_quantity",
      "loss_percentage",
      "current_stock",
      "minimum_stock",
    ];
    for (const k of numFields) {
      if (k in payload) {
        const v = payload[k];
        payload[k] = v === "" || v == null ? 0 : Number(v);
      }
    }
    const { error } = await supabase.from("products").update(payload).eq("id", id);
    setSaving(null);
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? ({ ...r, ...payload } as Ingredient) : r)));
    setDirty((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
    toast.success("Insumo atualizado");
  };

  const requestDelete = async (r: Ingredient) => {
    const { count, error } = await supabase
      .from("product_recipe")
      .select("id", { count: "exact", head: true })
      .eq("ingredient_id", r.id);
    if (error) {
      toast.error("Erro ao verificar vínculos: " + error.message);
      return;
    }
    if ((count || 0) > 0) {
      toast.error(
        `Não é possível excluir: "${r.name}" está em ${count} ficha(s) técnica(s). Remova-o das receitas primeiro.`
      );
      return;
    }
    setConfirmDelete(r);
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    const id = confirmDelete.id;
    setDeleting(id);
    // Re-check to evitar corrida
    const { count } = await supabase
      .from("product_recipe")
      .select("id", { count: "exact", head: true })
      .eq("ingredient_id", id);
    if ((count || 0) > 0) {
      setDeleting(null);
      setConfirmDelete(null);
      toast.error("Insumo passou a ter vínculos. Exclusão cancelada.");
      return;
    }
    const { error } = await supabase.from("products").delete().eq("id", id);
    setDeleting(null);
    setConfirmDelete(null);
    if (error) {
      toast.error("Erro ao excluir: " + error.message);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
    setTotalCount((c) => Math.max(0, c - 1));
    toast.success("Insumo excluído");
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <Card className="border-orange-100 dark:border-slate-800 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
        <CardTitle className="flex items-center gap-2 text-orange-600">
          <Package className="h-5 w-5" /> Insumos / Matéria-prima
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar insumo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(0);
                  load(0, search);
                }
              }}
              className="pl-9 w-64"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setPage(0);
              load(0, search);
            }}
          >
            Buscar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin inline mr-2" /> Carregando insumos...
          </div>
        ) : merged.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Nenhum insumo cadastrado. Cadastre um produto com tipo <b>Ingrediente</b> ou <b>Ambos</b> no Cardápio.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="text-xs [&_th]:px-2 [&_td]:px-2 [&_th]:h-9 [&_td]:py-1">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[140px]">Nome</TableHead>
                  <TableHead className="w-[110px]">Categoria</TableHead>
                  <TableHead className="w-[64px]">Un.</TableHead>
                  <TableHead className="w-[80px]">Preço</TableHead>
                  <TableHead className="w-[80px]">Rend.</TableHead>
                  <TableHead className="w-[64px]">Perda%</TableHead>
                  <TableHead className="w-[90px]">Custo/un</TableHead>
                  <TableHead className="w-[120px]">Fornecedor</TableHead>
                  <TableHead className="w-[80px]">Estoque</TableHead>
                  <TableHead className="w-[64px]">Mín.</TableHead>
                  <TableHead className="w-[120px] text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {merged.map((r) => {
                  const isDirty = !!dirty[r.id];
                  const low =
                    Number(r.current_stock || 0) < Number(r.minimum_stock || 0) &&
                    Number(r.minimum_stock || 0) > 0;
                  const cost = computeCost(
                    Number(r.purchase_price),
                    Number(r.yield_quantity),
                    Number(r.loss_percentage)
                  );
                  return (
                    <TableRow
                      key={r.id}
                      className={low ? "bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50" : ""}
                    >
                      <TableCell className="font-medium">
                        <Input
                          value={r.name || ""}
                          onChange={(e) => setField(r.id, "name", e.target.value)}
                          className="h-8 text-xs"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={r.category_id || ""}
                          onValueChange={(v) => setField(r.id, "category_id", v || null)}
                        >
                          <SelectTrigger className="h-8 w-full text-xs">
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={r.unit || ""}
                          onValueChange={(v) => setField(r.id, "unit", v)}
                        >
                          <SelectTrigger className="h-8 w-full text-xs">
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent>
                            {UNITS.map((u) => (
                              <SelectItem key={u} value={u}>
                                {u}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={r.purchase_price ?? ""}
                          onChange={(e) => setField(r.id, "purchase_price", e.target.value)}
                          className="h-8 w-full text-xs"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.001"
                          value={r.yield_quantity ?? ""}
                          onChange={(e) => setField(r.id, "yield_quantity", e.target.value)}
                          className="h-8 w-full text-xs"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={r.loss_percentage ?? ""}
                          onChange={(e) => setField(r.id, "loss_percentage", e.target.value)}
                          className="h-8 w-full text-xs"
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs whitespace-nowrap">
                        R$ {cost.toFixed(4)}
                      </TableCell>
                      <TableCell>
                        <Input
                          value={r.supplier_name || ""}
                          onChange={(e) => setField(r.id, "supplier_name", e.target.value)}
                          className="h-8 w-full text-xs"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.001"
                          value={r.current_stock ?? ""}
                          onChange={(e) => setField(r.id, "current_stock", e.target.value)}
                          className={`h-8 w-full text-xs ${low ? "border-red-500 text-red-700 font-bold" : ""}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.001"
                          value={r.minimum_stock ?? ""}
                          onChange={(e) => setField(r.id, "minimum_stock", e.target.value)}
                          className="h-8 w-full text-xs"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            disabled={!isDirty || saving === r.id}
                            onClick={() => save(r.id)}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            {saving === r.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <Save className="h-3 w-3 mr-1" /> Salvar
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={deleting === r.id}
                            onClick={() => requestDelete(r)}
                            className="h-9 w-9 p-0 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            title="Excluir insumo"
                          >
                            {deleting === r.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {totalCount > PAGE_SIZE && (
              <div className="flex items-center justify-between mt-4 text-sm">
                <span className="text-muted-foreground">
                  {totalCount} insumos • página {page + 1} de {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => {
                      const p = page - 1;
                      setPage(p);
                      load(p, search);
                    }}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page + 1 >= totalPages}
                    onClick={() => {
                      const p = page + 1;
                      setPage(p);
                      load(p, search);
                    }}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir insumo?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <b>{confirmDelete?.name}</b>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={doDelete}
              disabled={!!deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export default IngredientesManager;

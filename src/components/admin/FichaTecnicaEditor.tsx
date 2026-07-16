import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Loader2, Plus, Trash2, ChefHat, Search, DollarSign, Target } from "lucide-react";

const UNITS = ["UN", "KG", "G", "L", "ML", "CX", "PCT", "DZ"];
const INGR_COLS = "id,name,unit,cost_per_unit,product_type";

type Ingredient = {
  id: string;
  name: string;
  unit: string | null;
  cost_per_unit: number | null;
  product_type: string;
};

type RecipeRow = {
  id?: string;
  _tempId?: string;
  product_id: string;
  ingredient_id: string;
  quantity: number | string;
  unit: string;
  waste_percentage?: number | string | null;
  notes?: string | null;
  variant_label?: string | null;
};

type Props = {
  productId: string | null;
  productType?: string;
  packagingCost?: number | null;
  energyCost?: number | null;
  laborCost?: number | null;
  enabled?: boolean;
  salePrice?: number | string | null;
  onApplySuggestedPrice?: (price: number) => void;
  onCostsChange?: (patch: { packaging_cost?: number; energy_cost?: number; labor_cost?: number }) => void;
};

export function FichaTecnicaEditor({
  productId,
  productType,
  packagingCost = 0,
  energyCost = 0,
  laborCost = 0,
  enabled = true,
  salePrice,
  onApplySuggestedPrice,
  onCostsChange,
}: Props) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [rows, setRows] = useState<RecipeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [variant, setVariant] = useState<string>("__default__");
  const [variantLabels, setVariantLabels] = useState<string[]>([]);
  const [newVariant, setNewVariant] = useState("");
  const [ingredientSearch, setIngredientSearch] = useState("");
  const loadedRef = useRef(false);

  const applicable = productType === "VENDA" || productType === "AMBOS" || !productType;

  useEffect(() => {
    if (!enabled || !applicable || !productId) return;
    if (loadedRef.current) return;
    loadedRef.current = true;
    (async () => {
      setLoading(true);
      const [ingRes, recRes] = await Promise.all([
        supabase
          .from("products")
          .select(INGR_COLS)
          .in("product_type", ["INGREDIENTE", "AMBOS"])
          .order("name")
          .limit(500),
        supabase
          .from("product_recipe")
          .select("id,product_id,ingredient_id,quantity,unit,waste_percentage,notes,variant_label")
          .eq("product_id", productId),
      ]);
      if (ingRes.error) toast.error("Erro ao carregar insumos: " + ingRes.error.message);
      if (recRes.error) toast.error("Erro ao carregar ficha: " + recRes.error.message);
      setIngredients((ingRes.data as any) || []);
      const recipe = (recRes.data as any as RecipeRow[]) || [];
      setRows(recipe);
      const labels = Array.from(
        new Set(recipe.map((r) => r.variant_label).filter((v): v is string => !!v))
      );
      setVariantLabels(labels);
      setLoading(false);
    })();
  }, [enabled, applicable, productId]);

  const ingredientById = useMemo(() => {
    const m: Record<string, Ingredient> = {};
    ingredients.forEach((i) => (m[i.id] = i));
    return m;
  }, [ingredients]);

  const filteredIngredients = useMemo(() => {
    const q = ingredientSearch.trim().toLowerCase();
    if (!q) return ingredients;
    return ingredients.filter((i) => i.name.toLowerCase().includes(q));
  }, [ingredients, ingredientSearch]);

  const currentVariant = variant === "__default__" ? null : variant;
  const visibleRows = rows.filter((r) => (r.variant_label || null) === currentVariant);

  const lineCost = (r: RecipeRow) => {
    const ing = ingredientById[r.ingredient_id];
    if (!ing) return 0;
    const qty = Number(r.quantity || 0);
    const waste = Number(r.waste_percentage || 0) / 100;
    const cost = Number(ing.cost_per_unit || 0);
    return qty * cost * (1 + waste);
  };

  const rawMaterialTotal = visibleRows.reduce((s, r) => s + lineCost(r), 0);
  const totalCost =
    rawMaterialTotal +
    Number(packagingCost || 0) +
    Number(energyCost || 0) +
    Number(laborCost || 0);

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        _tempId: crypto.randomUUID(),
        product_id: productId!,
        ingredient_id: "",
        quantity: 0,
        unit: "UN",
        waste_percentage: 0,
        variant_label: currentVariant,
      },
    ]);
  };

  const updateRow = (idx: number, patch: Partial<RecipeRow>) => {
    setRows((prev) => {
      // idx is index in visibleRows; map back to full array
      const visibleIndexes = prev
        .map((r, i) => ((r.variant_label || null) === currentVariant ? i : -1))
        .filter((i) => i >= 0);
      const realIdx = visibleIndexes[idx];
      if (realIdx == null) return prev;
      const next = [...prev];
      next[realIdx] = { ...next[realIdx], ...patch };
      if (patch.ingredient_id) {
        const ing = ingredientById[patch.ingredient_id];
        if (ing && ing.unit && !next[realIdx].unit) next[realIdx].unit = ing.unit;
      }
      return next;
    });
  };

  const removeRow = async (idx: number) => {
    const target = visibleRows[idx];
    if (!target) return;
    if (target.id) {
      const { error } = await supabase.from("product_recipe").delete().eq("id", target.id);
      if (error) {
        toast.error("Erro ao remover: " + error.message);
        return;
      }
    }
    setRows((prev) => prev.filter((r) => (target.id ? r.id !== target.id : r._tempId !== target._tempId)));
    toast.success("Linha removida");
  };

  const saveAll = async () => {
    if (!productId) return;
    setSaving(true);
    const toUpsert = rows
      .filter((r) => r.ingredient_id)
      .map((r) => ({
        ...(r.id ? { id: r.id } : {}),
        product_id: productId,
        ingredient_id: r.ingredient_id,
        quantity: Number(r.quantity || 0),
        unit: r.unit || "UN",
        waste_percentage: Number(r.waste_percentage || 0),
        notes: r.notes || null,
        variant_label: r.variant_label || null,
      }));
    if (toUpsert.length === 0) {
      setSaving(false);
      toast.info("Nada para salvar.");
      return;
    }
    const { data, error } = await supabase
      .from("product_recipe")
      .upsert(toUpsert as any)
      .select("id,product_id,ingredient_id,quantity,unit,waste_percentage,notes,variant_label");
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
      return;
    }
    // Refresh from server for canonical IDs
    setRows((data as any) || []);
    toast.success("Ficha técnica salva");
  };

  if (!applicable) return null;

  if (!productId) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-sm text-muted-foreground">
          Salve o produto primeiro para editar a ficha técnica.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2 border-orange-100 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-orange-600 text-base">
            <ChefHat className="h-5 w-5" /> Ficha Técnica
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={variant} onValueChange={setVariant}>
              <SelectTrigger className="h-9 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__default__">Padrão (sem variante)</SelectItem>
                {variantLabels.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Nova variante (ex: P, M, G)"
              value={newVariant}
              onChange={(e) => setNewVariant(e.target.value)}
              className="h-9 w-40"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const v = newVariant.trim();
                if (!v) return;
                if (!variantLabels.includes(v)) setVariantLabels((p) => [...p, v]);
                setVariant(v);
                setNewVariant("");
              }}
            >
              + Variante
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">
              <Loader2 className="h-4 w-4 inline animate-spin mr-2" /> Carregando...
            </div>
          ) : (
            <>
              <div className="relative mb-3">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Filtrar insumos por nome no dropdown..."
                  value={ingredientSearch}
                  onChange={(e) => setIngredientSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[220px]">Insumo</TableHead>
                      <TableHead className="w-24">Qtd.</TableHead>
                      <TableHead className="w-20">Un.</TableHead>
                      <TableHead className="w-20">Perda %</TableHead>
                      <TableHead className="w-28">Custo</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground text-sm py-6">
                          Nenhuma linha nesta ficha. Ficha técnica é opcional.
                        </TableCell>
                      </TableRow>
                    ) : (
                      visibleRows.map((r, idx) => (
                        <TableRow key={r.id || r._tempId}>
                          <TableCell>
                            <Select
                              value={r.ingredient_id || ""}
                              onValueChange={(v) => updateRow(idx, { ingredient_id: v })}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                              <SelectContent className="max-h-64">
                                {filteredIngredients.map((i) => (
                                  <SelectItem key={i.id} value={i.id}>
                                    {i.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.001"
                              value={r.quantity ?? ""}
                              onChange={(e) => updateRow(idx, { quantity: e.target.value })}
                              className="h-9"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={r.unit || "UN"}
                              onValueChange={(v) => updateRow(idx, { unit: v })}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue />
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
                              value={r.waste_percentage ?? 0}
                              onChange={(e) => updateRow(idx, { waste_percentage: e.target.value })}
                              className="h-9"
                            />
                          </TableCell>
                          <TableCell className="font-mono text-xs whitespace-nowrap">
                            R$ {lineCost(r).toFixed(4)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeRow(idx)}
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between mt-4">
                <Button variant="outline" size="sm" onClick={addRow}>
                  <Plus className="h-4 w-4 mr-1" /> Adicionar insumo
                </Button>
                <Button
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700"
                  disabled={saving}
                  onClick={saveAll}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar ficha"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4 lg:sticky lg:top-4 lg:self-start z-10">
        <Card className="border-orange-100 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base">Resumo de Custos</CardTitle>
            {currentVariant && (
              <p className="text-xs text-muted-foreground">Variante: {currentVariant}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Matéria-prima" value={rawMaterialTotal} />
            <CostInput
              label="Embalagem"
              value={Number(packagingCost || 0)}
              onChange={(v) => onCostsChange?.({ packaging_cost: v })}
              disabled={!onCostsChange}
            />
            <CostInput
              label="Energia"
              value={Number(energyCost || 0)}
              onChange={(v) => onCostsChange?.({ energy_cost: v })}
              disabled={!onCostsChange}
            />
            <CostInput
              label="Mão de obra"
              value={Number(laborCost || 0)}
              onChange={(v) => onCostsChange?.({ labor_cost: v })}
              disabled={!onCostsChange}
            />
            <div className="border-t pt-2 mt-2 flex justify-between font-bold text-orange-600">
              <span>Custo Total</span>
              <span className="font-mono">R$ {totalCost.toFixed(4)}</span>
            </div>
          </CardContent>
        </Card>

        <PrecificacaoCard
          totalCost={totalCost}
          salePrice={salePrice}
          onApplySuggestedPrice={onApplySuggestedPrice}
        />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">R$ {Number(value || 0).toFixed(4)}</span>
    </div>
  );
}

function CostInput({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex justify-between items-center gap-2">
      <span className="text-muted-foreground">{label}</span>
      {disabled ? (
        <span className="font-mono">R$ {Number(value || 0).toFixed(4)}</span>
      ) : (
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">R$</span>
          <Input
            type="number"
            step="0.0001"
            value={value}
            onChange={(e) => onChange(Number(e.target.value || 0))}
            className="h-8 w-24 font-mono text-right"
          />
        </div>
      )}
    </div>
  );
}


function PrecificacaoCard({
  totalCost,
  salePrice,
  onApplySuggestedPrice,
}: {
  totalCost: number;
  salePrice?: number | string | null;
  onApplySuggestedPrice?: (price: number) => void;
}) {
  const [margin, setMargin] = useState<string>("60");
  const [autoCalc, setAutoCalc] = useState(true);
  const [otherCostsPct, setOtherCostsPct] = useState<string>("5");
  const [manualPrice, setManualPrice] = useState<string>("");
  const lastWarnedRef = useRef<number | null>(null);

  const marginNum = Math.min(99.99, Math.max(0, Number(margin || 0)));
  const otherCosts = Math.max(0, Number(otherCostsPct || 0));
  const effectiveMargin = marginNum + otherCosts;
  const safeEffective = Math.min(99.99, Math.max(0, effectiveMargin));

  // Preço sugerido já considera Outros Custos + Margem Desejada
  const suggested = safeEffective >= 100 ? 0 : totalCost / (1 - safeEffective / 100);

  const priceNum = Number(
    typeof salePrice === "string" ? String(salePrice).replace(",", ".") : salePrice || 0
  );
  const manualPriceNum = Number(manualPrice.replace(",", ".")) || 0;
  const finalPrice = autoCalc ? priceNum : manualPriceNum;

  // Propaga o preço manual para o pai imediatamente quando Cálculo Automático está desligado
  useEffect(() => {
    if (!autoCalc && manualPriceNum > 0 && manualPriceNum !== priceNum) {
      onApplySuggestedPrice?.(manualPriceNum);
    }
  }, [autoCalc, manualPriceNum]);
  const profit = finalPrice - totalCost;
  const realMargin = finalPrice > 0 ? profit / finalPrice : 0;

  useEffect(() => {
    if (!priceNum || !totalCost) return;
    if (priceNum >= totalCost) {
      lastWarnedRef.current = null;
      return;
    }
    if (lastWarnedRef.current === priceNum) return;
    lastWarnedRef.current = priceNum;
    toast.warning(
      `Preço abaixo do custo — lucro negativo de R$ ${(totalCost - priceNum).toFixed(2)}`
    );
  }, [priceNum, totalCost]);

  let dot = "bg-red-500";
  let label = "Margem baixa";
  if (finalPrice > 0 && totalCost > 0) {
    if (realMargin > 0.7) {
      dot = "bg-green-500";
      label = "Excelente";
    } else if (realMargin >= 0.4) {
      dot = "bg-yellow-500";
      label = "Aceitável";
    }
  }

  return (
    <Card className="border-orange-100 dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-orange-600" />
          Precificação
        </CardTitle>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground cursor-pointer select-none flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={autoCalc}
              onChange={(e) => setAutoCalc(e.target.checked)}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            Cálculo Automático
          </label>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {/* Custos (readonly) */}
        <div className="grid grid-cols-2 gap-2 bg-muted/30 rounded-lg p-3">
          <div className="text-xs text-muted-foreground">Custo Unitário</div>
          <div className="text-xs font-mono text-right">R$ {(totalCost > 0 ? (totalCost / (1 + (otherCosts / 100)) || 0) : 0).toFixed(4)}</div>
          <div className="text-xs text-muted-foreground">Custo Total Real</div>
          <div className="text-xs font-mono text-right font-semibold">R$ {totalCost.toFixed(4)}</div>
        </div>

        {/* Parâmetros de precificação */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 space-y-1">
              <label className="text-xs text-muted-foreground">Margem Desejada (%)</label>
              <Input
                type="number"
                step="0.1"
                value={margin}
                onChange={(e) => setMargin(e.target.value)}
                className="h-8"
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs text-muted-foreground">Outros Custos (%)</label>
              <Input
                type="number"
                step="0.1"
                value={otherCostsPct}
                onChange={(e) => setOtherCostsPct(e.target.value)}
                className="h-8"
              />
            </div>
          </div>

          <div className="flex justify-between items-center bg-orange-50 dark:bg-orange-950/20 rounded-lg px-3 py-2">
            <span className="text-xs text-muted-foreground">Preço Sugerido</span>
            <span className="font-mono font-bold text-orange-600 text-sm">R$ {suggested.toFixed(2)}</span>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950/30"
          disabled={!suggested || !onApplySuggestedPrice}
          onClick={() => onApplySuggestedPrice?.(Number(suggested.toFixed(2)))}
        >
          <Target className="h-3.5 w-3.5 mr-1.5" />
          Aplicar preço sugerido
        </Button>

        {/* Preço final e resultado */}
        <div className="border-t pt-3 space-y-2.5">
          {!autoCalc ? (
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Preço de Venda (manual)</label>
              <Input
                type="text"
                value={manualPrice}
                onChange={(e) => setManualPrice(e.target.value)}
                placeholder="0,00"
                className="h-9 font-mono text-base"
              />
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Preço de Venda</span>
              <div className="flex items-center gap-2">
                <span className={`inline-block h-2.5 w-2.5 rounded-full ${dot}`} />
                <span className="font-mono font-semibold">R$ {priceNum.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Lucro Estimado</span>
            <span className={`font-mono font-medium ${profit < 0 ? "text-red-600" : profit > 0 ? "text-green-600" : ""}`}>
              {profit < 0 ? "−" : "+"}R$ {Math.abs(profit).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-xs pt-1 border-t border-dashed">
            <span className="text-muted-foreground">Margem Real</span>
            <span className={`font-mono ${realMargin < 0.4 ? "text-red-600" : ""}`}>
              {(realMargin * 100).toFixed(1)}%
              <span className="ml-1.5 text-xs">{label}</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default FichaTecnicaEditor;


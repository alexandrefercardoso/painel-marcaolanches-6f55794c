import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Loader2, AlertTriangle, ChefHat, TrendingUp, Activity, PieChart,
  DollarSign, Target, TrendingDown, ThumbsUp, ThumbsDown, Minus,
  AlertCircle, ArrowUpRight, ArrowDownRight, RefreshCw,
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number | null;
  product_type: string;
  control_inventory: boolean | null;
  current_stock: number | null;
  minimum_stock: number | null;
  cost_per_unit: number | null;
  packaging_cost: number | null;
  energy_cost: number | null;
  labor_cost: number | null;
  desired_margin_percentage: number | null;
  loss_percentage: number | null;
};

type RecipeLine = {
  product_id: string;
  quantity: number | null;
  waste_percentage: number | null;
  ingredient_id: string;
};

const PROD_COLS =
  "id,name,price,product_type,control_inventory,current_stock,minimum_stock,cost_per_unit,packaging_cost,energy_cost,labor_cost,desired_margin_percentage,loss_percentage";

type MarginBucket = "green" | "yellow" | "red";

function marginBucket(price: number, cost: number): MarginBucket {
  if (!price || price <= 0) return "red";
  const m = (price - cost) / price;
  if (m > 0.7) return "green";
  if (m >= 0.4) return "yellow";
  return "red";
}

function marginColor(bucket: MarginBucket): string {
  switch (bucket) {
    case "green": return "text-green-600 bg-green-50 dark:bg-green-950/20 border-green-200";
    case "yellow": return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200";
    case "red": return "text-red-600 bg-red-50 dark:bg-red-950/20 border-red-200";
  }
}

function marginLabel(bucket: MarginBucket): string {
  switch (bucket) {
    case "green": return "Excelente";
    case "yellow": return "Aceitável";
    case "red": return "Baixa";
  }
}

function healthColor(score: number): string {
  if (score >= 70) return "text-green-600 border-green-500";
  if (score >= 40) return "text-yellow-600 border-yellow-500";
  return "text-red-600 border-red-500";
}

function healthBg(score: number): string {
  if (score >= 70) return "bg-green-50 dark:bg-green-950/10";
  if (score >= 40) return "bg-yellow-50 dark:bg-yellow-950/10";
  return "bg-red-50 dark:bg-red-950/10";
}

function healthIcon(score: number) {
  if (score >= 70) return <ThumbsUp className="h-5 w-5 text-green-600" />;
  if (score >= 40) return <Minus className="h-5 w-5 text-yellow-600" />;
  return <ThumbsDown className="h-5 w-5 text-red-600" />;
}

export function EngenhariaCardapioDashboard({ active = true }: { active?: boolean }) {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [recipeByProduct, setRecipeByProduct] = useState<Record<string, RecipeLine[]>>({});
  const [ingredientCost, setIngredientCost] = useState<Record<string, number>>({});
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!active) return;
    setLoading(true);
    const [prodRes, recRes, ingRes] = await Promise.all([
      supabase
        .from("products")
        .select(PROD_COLS)
        .order("name")
        .limit(1000),
      supabase
        .from("product_recipe")
        .select("product_id,ingredient_id,quantity,waste_percentage")
        .limit(5000),
      supabase
        .from("products")
        .select("id,cost_per_unit")
        .in("product_type", ["INGREDIENTE", "AMBOS"])
        .limit(1000),
    ]);
    if (prodRes.error) toast.error("Erro produtos: " + prodRes.error.message);
    if (recRes.error) toast.error("Erro fichas: " + recRes.error.message);
    setProducts((prodRes.data as any) || []);
    const byP: Record<string, RecipeLine[]> = {};
    ((recRes.data as any) || []).forEach((r: RecipeLine) => {
      (byP[r.product_id] ||= []).push(r);
    });
    setRecipeByProduct(byP);
    const costMap: Record<string, number> = {};
    ((ingRes.data as any) || []).forEach((i: any) => {
      costMap[i.id] = Number(i.cost_per_unit || 0);
    });
    setIngredientCost(costMap);
    setLoading(false);
  };

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    (async () => {
      await loadData();
      if (cancelled) return;
    })();
    return () => { cancelled = true; };
  }, [active]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success("Dados da engenharia atualizados!");
  };

  const { sellables, productCost, withoutRecipe, lowMargin, withoutPricing } = useMemo(() => {
    const sell = products.filter(
      (p) => p.product_type === "VENDA" || p.product_type === "AMBOS"
    );

    const calcCost = (p: Product) => {
      const lines = recipeByProduct[p.id] || [];
      const raw = lines.reduce((s, l) => {
        const c = ingredientCost[l.ingredient_id] || 0;
        const waste = Number(l.waste_percentage || 0) / 100;
        return s + Number(l.quantity || 0) * c * (1 + waste);
      }, 0);
      return (
        raw +
        Number(p.packaging_cost || 0) +
        Number(p.energy_cost || 0) +
        Number(p.labor_cost || 0)
      );
    };

    const noRecipe = sell.filter((p) => !(recipeByProduct[p.id]?.length));

    const lowMarg = sell
      .map((p) => ({ ...p, _cost: calcCost(p) }))
      .filter((p) => {
        const cost = p._cost;
        const price = Number(p.price || 0);
        if (!price || price <= 0) return false;
        const m = (price - cost) / price;
        return m < 0.4;
      })
      .sort((a, b) => {
        const ma = Number(a.price || 0) > 0 ? (Number(a.price || 0) - a._cost) / Number(a.price || 0) : 0;
        const mb = Number(b.price || 0) > 0 ? (Number(b.price || 0) - b._cost) / Number(b.price || 0) : 0;
        return ma - mb;
      });

    const noPrice = sell.filter((p) => !p.price || Number(p.price) <= 0);

    return { sellables: sell, productCost: calcCost, withoutRecipe: noRecipe, lowMargin: lowMarg, withoutPricing: noPrice };
  }, [products, recipeByProduct, ingredientCost]);

  const {
    buckets, total, withRecipePct, healthScore,
    lowStock, topCost, pricingGapItems,
  } = useMemo(() => {
    const b = { green: 0, yellow: 0, red: 0 };
    sellables.forEach((p) => {
      const c = productCost(p);
      b[marginBucket(Number(p.price || 0), c)]++;
    });

    const t = sellables.length || 1;
    const withRecipe = t - withoutRecipe.length;
    const withRecipePctVal = (withRecipe / t) * 100;
    const notRedPct = ((t - b.red) / t) * 100;

    // Score mais inteligente: pondera ficha técnica (40%), margem não-vermelha (40%), precificação (20%)
    const pricingScore = ((t - withoutPricing.length) / t) * 100;
    const score = Math.round(withRecipePctVal * 0.4 + notRedPct * 0.4 + pricingScore * 0.2);

    // Insumos em alerta
    const lowStk = products
      .filter(
        (p) =>
          p.control_inventory &&
          Number(p.minimum_stock || 0) > 0 &&
          Number(p.current_stock || 0) < Number(p.minimum_stock || 0)
      )
      .map((p) => ({
        ...p,
        deficit: Number(p.minimum_stock || 0) - Number(p.current_stock || 0),
      }))
      .sort((a, b) => b.deficit - a.deficit)
      .slice(0, 20);

    // Top 5 maior custo
    const topCst = sellables
      .map((p) => ({ ...p, _cost: productCost(p) }))
      .sort((a, b) => b._cost - a._cost)
      .slice(0, 5);

    // Itens com gap entre margem atual e desejada
    const pricingGap = sellables
      .map((p) => {
        const cost = productCost(p);
        const price = Number(p.price || 0);
        const currentMargin = price > 0 ? (price - cost) / price : 0;
        const desiredMargin = Number(p.desired_margin_percentage || 0) / 100;
        const gap = desiredMargin > 0 ? currentMargin - desiredMargin : 0;
        return { ...p, _cost: cost, _currentMargin: currentMargin, _desiredMargin: desiredMargin, _gap: gap };
      })
      .filter((p) => p._desiredMargin > 0 && p.price && Number(p.price) > 0)
      .sort((a, b) => a._gap - b._gap);

    return {
      buckets: b, total: t, withRecipePct: withRecipePctVal,
      healthScore: score,
      lowStock: lowStk, topCost: topCst, pricingGapItems: pricingGap,
    };
  }, [sellables, productCost, withoutRecipe, withoutPricing, products]);

  if (loading) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin inline mr-2" /> Carregando engenharia de cardápio...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Score + Refresh */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Card className={`flex-1 border-orange-100 dark:border-slate-800 shadow-lg ${healthBg(healthScore)}`}>
          <CardContent className="p-6 flex items-center gap-6 flex-wrap">
            <div
              className={`h-24 w-24 rounded-full border-8 ${healthColor(healthScore)} flex items-center justify-center bg-background shadow-sm`}
            >
              <span className={`text-3xl font-black ${healthColor(healthScore).split(" ")[0]}`}>{healthScore}</span>
            </div>
            <div className="flex-1 min-w-[220px]">
              <div className="flex items-center gap-2 mb-1">
                {healthIcon(healthScore)}
                <h2 className="text-xl font-bold flex items-center gap-2">
                  Score de Saúde do Cardápio
                </h2>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {Math.round(withRecipePct)}% com ficha técnica •{" "}
                {Math.round(((total - buckets.red) / total) * 100)}% fora da faixa 🔴 •{" "}
                {total - withoutPricing.length}/{total} precificados
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> Ficha técnica: 40%</span>
                <span className="flex items-center gap-1"><PieChart className="h-3 w-3" /> Margem: 40%</span>
                <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> Precificação: 20%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="shrink-0"
        >
          <RefreshCw className={`h-4 w-4 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Cards de Alerta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Produtos sem precificação */}
        <Card className="border-orange-100 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              Sem Preço Definido
              <Badge variant="outline" className="ml-auto text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20">
                {withoutPricing.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {withoutPricing.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todos os produtos têm preço.</p>
            ) : (
              <ul className="space-y-1.5 text-sm max-h-56 overflow-y-auto">
                {withoutPricing.slice(0, 15).map((p) => (
                  <li key={p.id} className="flex items-center gap-2 border-b pb-1 last:border-0">
                    <span className="text-red-500">•</span>
                    <span className="truncate flex-1">{p.name}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">R$ 0,00</span>
                  </li>
                ))}
                {withoutPricing.length > 15 && (
                  <li className="text-xs text-muted-foreground text-center pt-1">
                    +{withoutPricing.length - 15} produtos sem preço
                  </li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Margem baixa */}
        <Card className="border-orange-100 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-yellow-600 text-sm">
              <TrendingDown className="h-4 w-4" />
              Margem Baixa (&lt;40%)
              <Badge variant="outline" className="ml-auto text-xs bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20">
                {lowMargin.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowMargin.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum produto com margem crítica.</p>
            ) : (
              <ul className="space-y-1.5 text-sm max-h-56 overflow-y-auto">
                {lowMargin.slice(0, 15).map((p: any) => {
                  const m = Number(p.price || 0) > 0 ? ((Number(p.price || 0) - p._cost) / Number(p.price || 0)) * 100 : 0;
                  return (
                    <li key={p.id} className="flex justify-between gap-2 border-b pb-1 last:border-0">
                      <span className="truncate">{p.name}</span>
                      <span className="font-mono text-xs text-yellow-600 whitespace-nowrap">
                        {m.toFixed(1)}%
                      </span>
                    </li>
                  );
                })}
                {lowMargin.length > 15 && (
                  <li className="text-xs text-muted-foreground text-center pt-1">
                    +{lowMargin.length - 15} produtos
                  </li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Sem ficha técnica */}
        <Card className="border-orange-100 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-600 text-sm">
              <ChefHat className="h-4 w-4" />
              Sem Ficha Técnica
              <Badge variant="outline" className="ml-auto text-xs bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20">
                {withoutRecipe.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {withoutRecipe.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todos os produtos têm ficha técnica.</p>
            ) : (
              <ul className="space-y-1.5 text-sm max-h-56 overflow-y-auto">
                {withoutRecipe.slice(0, 15).map((p) => (
                  <li key={p.id} className="flex items-center gap-2 border-b pb-1 last:border-0">
                    <span className="text-orange-500">•</span>
                    <span className="truncate flex-1">{p.name}</span>
                    <span className="text-xs text-muted-foreground">sem custo</span>
                  </li>
                ))}
                {withoutRecipe.length > 15 && (
                  <li className="text-xs text-muted-foreground text-center pt-1">
                    +{withoutRecipe.length - 15} produtos
                  </li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distribuição de margem */}
        <Card className="border-orange-100 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChart className="h-5 w-5 text-orange-600" /> Distribuição de Margem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <MarginBar label="🟢 Excelente (>70%)" count={buckets.green} total={total} color="bg-green-500" />
            <MarginBar label="🟡 Aceitável (40-70%)" count={buckets.yellow} total={total} color="bg-yellow-500" />
            <MarginBar label="🔴 Baixa (<40%)" count={buckets.red} total={total} color="bg-red-500" />
            <p className="text-xs text-muted-foreground pt-2">Total avaliado: {total} produtos.</p>
          </CardContent>
        </Card>

        {/* Top 5 maior custo */}
        <Card className="border-orange-100 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-orange-600" /> Top 5 Maior Custo de Produção
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCost.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem dados de custo.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {topCost.map((p: any) => (
                  <li key={p.id} className="flex justify-between gap-2 border-b pb-1">
                    <span className="truncate">{p.name}</span>
                    <span className="font-mono whitespace-nowrap">R$ {p._cost.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Insumos em alerta */}
        <Card className="border-orange-100 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 text-base">
              <AlertTriangle className="h-5 w-5" /> Insumos em Alerta ({lowStock.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum insumo abaixo do mínimo.</p>
            ) : (
              <ul className="space-y-2 text-sm max-h-64 overflow-y-auto">
                {lowStock.map((p) => (
                  <li key={p.id} className="flex justify-between gap-2 border-b pb-1">
                    <span className="truncate">{p.name}</span>
                    <span className="font-mono text-red-600 whitespace-nowrap">
                      {Number(p.current_stock || 0)} / {Number(p.minimum_stock || 0)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Custo desatualizado */}
        <Card className="border-orange-100 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-5 w-5 text-orange-600" /> Produtos sem Custo de Insumo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const noCost = sellables.filter((p) => {
                const lines = recipeByProduct[p.id] || [];
                if (lines.length === 0) return false;
                const hasCost = lines.some((l) => (ingredientCost[l.ingredient_id] || 0) > 0);
                return !hasCost;
              });
              return noCost.length === 0 ? (
                <p className="text-sm text-muted-foreground">Todos os insumos com custo registrado.</p>
              ) : (
                <>
                  <ul className="space-y-1.5 text-sm max-h-64 overflow-y-auto">
                    {noCost.slice(0, 10).map((p) => (
                      <li key={p.id} className="flex items-center gap-2 border-b pb-1">
                        <span className="text-yellow-500">•</span>
                        <span className="truncate">{p.name}</span>
                      </li>
                    ))}
                    {noCost.length > 10 && (
                      <li className="text-xs text-muted-foreground text-center pt-1">
                        +{noCost.length - 10} produtos
                      </li>
                    )}
                  </ul>
                  <p className="text-xs text-muted-foreground mt-2">
                    Esses produtos têm ficha técnica mas os insumos não têm custo cadastrado.
                  </p>
                </>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Tabela comparativa: Margem Atual vs Desejada */}
      {pricingGapItems.length > 0 && (
        <Card className="border-orange-100 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5 text-orange-600" />
              Margem Atual vs Desejada
              <Badge variant="outline" className="ml-2 text-xs font-normal">
                {pricingGapItems.length} produtos
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-right">Custo</TableHead>
                  <TableHead className="text-right">Margem Atual</TableHead>
                  <TableHead className="text-right">Margem Desejada</TableHead>
                  <TableHead className="text-right">Gap</TableHead>
                  <TableHead className="text-right">Preço Ideal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricingGapItems.slice(0, 30).map((p: any) => {
                  const idealPrice = p._desiredMargin > 0 && p._desiredMargin < 1
                    ? p._cost / (1 - p._desiredMargin)
                    : 0;
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">{p.name}</TableCell>
                      <TableCell className="text-right font-mono">R$ {Number(p.price || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-right font-mono text-xs">R$ {p._cost.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-mono text-xs px-1.5 py-0.5 rounded ${
                          p._currentMargin >= 0.7 ? "text-green-600 bg-green-50 dark:bg-green-950/20" :
                          p._currentMargin >= 0.4 ? "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20" :
                          "text-red-600 bg-red-50 dark:bg-red-950/20"
                        }`}>
                          {(p._currentMargin * 100).toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {(p._desiredMargin * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`inline-flex items-center gap-0.5 font-mono text-xs ${
                          p._gap >= 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          {p._gap >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {(Math.abs(p._gap) * 100).toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-orange-600 font-medium">
                        {idealPrice > 0 ? `R$ ${idealPrice.toFixed(2)}` : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {pricingGapItems.length > 30 && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Mostrando 30 de {pricingGapItems.length} produtos.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MarginBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span>{label}</span>
        <span className="font-mono">
          {count} ({pct.toFixed(0)}%)
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default EngenhariaCardapioDashboard;

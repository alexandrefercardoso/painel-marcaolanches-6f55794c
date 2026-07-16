import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDisplayDate } from "@/lib/dateUtils";

interface Movement {
  id: string;
  movement_type: string;
  quantity: number;
  unit_cost: number | null;
  reason: string | null;
  reference_type: string | null;
  notes: string | null;
  created_at: string;
}

const META: Record<string, { label: string; color: string }> = {
  IN:     { label: "Entrada", color: "bg-green-100 text-green-700 border-green-200" },
  OUT:    { label: "Saída",   color: "bg-orange-100 text-orange-700 border-orange-200" },
  ADJUST: { label: "Ajuste",  color: "bg-blue-100 text-blue-700 border-blue-200" },
  LOSS:   { label: "Perda",   color: "bg-red-100 text-red-700 border-red-200" },
  SAIDA:  { label: "Venda",   color: "bg-purple-100 text-purple-700 border-purple-200" },
};

interface Props { productId: string | null; unit?: string | null; }

export function ProductMovementsView({ productId, unit }: Props) {
  const [rows, setRows] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!productId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("stock_movements")
      .select("id,movement_type,quantity,unit_cost,reason,reference_type,notes,created_at")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .limit(500);
    if (!error) setRows((data || []) as any);
    setLoading(false);
  };

  useEffect(() => { load(); }, [productId]);

  if (!productId) {
    return (
      <div className="p-6 text-sm text-muted-foreground text-center">
        Salve o produto primeiro para ver o histórico de movimentações.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Somente leitura. Registre novas movimentações no módulo <b>Estoque</b>.
        </p>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`w-3 h-3 mr-1 ${loading ? "animate-spin" : ""}`} /> Atualizar
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase font-bold">
                <tr>
                  <th className="text-left p-3">Data</th>
                  <th className="text-left p-3">Tipo</th>
                  <th className="text-right p-3">Qtd</th>
                  <th className="text-right p-3">Custo un.</th>
                  <th className="text-left p-3">Motivo</th>
                  <th className="text-left p-3">Origem</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">
                    Nenhuma movimentação registrada.
                  </td></tr>
                )}
                {rows.map(m => {
                  const meta = META[m.movement_type] || { label: m.movement_type, color: "bg-gray-100 text-gray-700" };
                  return (
                    <tr key={m.id} className="border-t hover:bg-muted/30">
                      <td className="p-3 text-xs">{formatDisplayDate(m.created_at)}</td>
                      <td className="p-3"><Badge variant="outline" className={meta.color}>{meta.label}</Badge></td>
                      <td className="p-3 text-right font-mono">{Number(m.quantity).toFixed(4)} {unit || ""}</td>
                      <td className="p-3 text-right font-mono text-xs">{m.unit_cost != null ? `R$ ${Number(m.unit_cost).toFixed(4)}` : "—"}</td>
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
    </div>
  );
}

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, MessageSquare, Save } from "lucide-react";

const LABELS: Record<string, string> = {
  greeting_new: "Saudação inicial (novo cliente)",
  greeting_returning: "Saudação (cliente recorrente)",
  ask_delivery_type: "Pergunta entrega ou retirada",
  ask_address: "Solicitar endereço",
  delivery_saved_address: "Confirmar endereço salvo",
  city_out_of_range: "Cidade fora da área de entrega",
  menu_link: "Envio do link do cardápio",
  order_summary: "Resumo do pedido antes de confirmar",
  order_confirmed: "Pedido confirmado",
  order_cancelled: "Pedido cancelado",
  ask_payment_method: "Pergunta forma de pagamento",
  closed_store: "Loja fechada",
  fallback: "Mensagem quando não entende",
};

const PLACEHOLDERS: Record<string, string> = {
  greeting_new: "Use {loja} para o nome da loja",
  greeting_returning: "Use {nome} para o nome do cliente",
  delivery_saved_address: "Use {endereco} para o endereço salvo",
  city_out_of_range: "Use {cidade_loja} para a cidade da loja",
  order_summary: "Use {itens}, {endereco}, {taxa}, {total}",
  order_confirmed: "Use {total} para o valor total",
  menu_link: "Use {link} para o link do cardápio",
};

type Row = { key: string; message: string };

export function BotMessagesEditor() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await (supabase as any)
        .from("whatsapp_bot_messages")
        .select("key,message")
        .order("key");
      if (error) toast.error("Erro ao carregar mensagens: " + error.message);
      setRows((data as Row[]) || []);
      setLoading(false);
    })();
  }, []);

  const updateLocal = (key: string, message: string) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, message } : r)));

  const saveOne = async (key: string) => {
    const row = rows.find((r) => r.key === key);
    if (!row) return;
    setSavingKey(key);
    const { error } = await (supabase as any)
      .from("whatsapp_bot_messages")
      .update({ message: row.message })
      .eq("key", key);
    setSavingKey(null);
    if (error) return toast.error("Erro: " + error.message);
    toast.success("Mensagem salva");
  };

  const saveAll = async () => {
    setSavingAll(true);
    for (const r of rows) {
      const { error } = await (supabase as any)
        .from("whatsapp_bot_messages")
        .update({ message: r.message })
        .eq("key", r.key);
      if (error) {
        setSavingAll(false);
        return toast.error(`Erro em ${r.key}: ${error.message}`);
      }
    }
    setSavingAll(false);
    toast.success("Todas as mensagens salvas");
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-6 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando mensagens...
      </div>
    );
  }

  return (
    <Card className="border-green-100">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-green-700">
          <MessageSquare className="h-5 w-5" /> Mensagens do Bot
        </CardTitle>
        <Button onClick={saveAll} disabled={savingAll} size="sm" className="bg-green-600 hover:bg-green-700">
          {savingAll ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Salvar todas
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma mensagem cadastrada.</p>
        )}
        {rows.map((row) => (
          <div key={row.key} className="space-y-2 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-bold">{LABELS[row.key] || row.key}</Label>
                <p className="text-[10px] text-muted-foreground font-mono">{row.key}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => saveOne(row.key)}
                disabled={savingKey === row.key}
              >
                {savingKey === row.key ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Save className="h-3 w-3 mr-1" />
                )}
                Salvar
              </Button>
            </div>
            <Textarea
              value={row.message}
              onChange={(e) => updateLocal(row.key, e.target.value)}
              rows={3}
              className="font-mono text-sm"
            />
            {PLACEHOLDERS[row.key] && (
              <p className="text-xs text-muted-foreground">💡 {PLACEHOLDERS[row.key]}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

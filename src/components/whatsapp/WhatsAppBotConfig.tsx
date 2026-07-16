import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Eye, EyeOff, MessageCircle, AlertTriangle, Loader2 } from "lucide-react";
import { BotMessagesEditor } from "./BotMessagesEditor";

export function WhatsAppBotConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [rowId, setRowId] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [instance, setInstance] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("store_settings").select("*").limit(1).maybeSingle();
      if (data) {
        setRowId((data as any).id);
        setEnabled(!!(data as any).whatsapp_bot_enabled);
        setApiUrl((data as any).whatsapp_api_url || "");
        setApiKey((data as any).whatsapp_api_key || "");
        setInstance((data as any).whatsapp_instance_name || "");
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    if (!rowId) return;
    setSaving(true);
    const { error } = await supabase
      .from("store_settings")
      .update({
        whatsapp_bot_enabled: enabled,
        whatsapp_api_url: apiUrl || null,
        whatsapp_api_key: apiKey || null,
        whatsapp_instance_name: instance || null,
      } as any)
      .eq("id", rowId);
    setSaving(false);
    if (error) return toast.error("Erro ao salvar: " + error.message);
    toast.success("Configurações do WhatsApp salvas");
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-6 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
      </div>
    );
  }

  const disconnected = !enabled || !apiUrl;
  const enabledSemConfig = enabled && (!apiUrl || !apiKey);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tighter bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
          WhatsApp Bot
        </h1>
        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">
          Integração de atendimento automático
        </p>
      </div>

      <Card className="border-green-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <MessageCircle className="h-5 w-5" /> Configuração da API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {disconnected && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Bot desconectado — configure a URL e chave para ativar.</span>
            </div>
          )}
          {enabledSemConfig && !disconnected && (
            <div className="flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Bot ativo mas sem conexão configurada.</span>
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label className="font-bold">Bot do WhatsApp ativo</Label>
              <p className="text-xs text-muted-foreground">Habilita o atendimento automático via WhatsApp</p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} className="data-[state=checked]:bg-green-600" />
          </div>

          <div className="space-y-2">
            <Label>URL da API</Label>
            <Input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="https://api.exemplo.com" />
          </div>

          <div className="space-y-2">
            <Label>Chave da API</Label>
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="••••••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nome da instância</Label>
            <Input value={instance} onChange={(e) => setInstance(e.target.value)} placeholder="minha-instancia" />
          </div>

          <div className="flex justify-end">
            <Button onClick={save} disabled={saving} className="bg-green-600 hover:bg-green-700">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Salvar configurações
            </Button>
          </div>
        </CardContent>
      </Card>

      <BotMessagesEditor />
    </div>
  );
}

// src/components/admin/CompanyForm/FiscalTab.tsx
// Aba Fiscal nas Configurações da Empresa

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, AlertCircle, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";

interface FiscalTabProps {
  settings: any;
  onUpdate: () => void;
}

export function FiscalTab({ settings, onUpdate }: FiscalTabProps) {
  const [loading, setLoading] = useState(false);
  const [testingToken, setTestingToken] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [credsUnlocked, setCredsUnlocked] = useState(false);
  const [unlockPin, setUnlockPin] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [verifyingPin, setVerifyingPin] = useState(false);
  const [formData, setFormData] = useState<any>({
    client_id_fiscal: "",
    client_secret_fiscal: "",
    fiscal_nfe_enabled: false,
    fiscal_nfce_enabled: false,
    tpamb: 2,
    ie: "",
    crt: 1,
    cod_municipio: "",
    natop: "VENDA DE MERCADORIA",
    serie_nfce: 1,
    num_nfce: 1,
    serie_nfe: 1,
    num_nfe: 1,
    envia_ibscbs: false,
    aliq_ibsuf: 0,
    aliq_ibsmun: 0,
    aliq_cbs: 0,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        client_id_fiscal: settings.client_id_fiscal || "",
        client_secret_fiscal: settings.client_secret_fiscal || "",
        fiscal_nfe_enabled: settings.fiscal_nfe_enabled ?? false,
        fiscal_nfce_enabled: settings.fiscal_nfce_enabled ?? false,
        tpamb: settings.tpamb || 2,
        ie: settings.ie || "",
        crt: settings.crt || 1,
        cod_municipio: settings.cod_municipio || "",
        natop: settings.natop || "VENDA DE MERCADORIA",
        serie_nfce: settings.serie_nfce || 1,
        num_nfce: settings.num_nfce || 1,
        serie_nfe: settings.serie_nfe || 1,
        num_nfe: settings.num_nfe || 1,
        envia_ibscbs: settings.envia_ibscbs || false,
        aliq_ibsuf: settings.aliq_ibsuf || 0,
        aliq_ibsmun: settings.aliq_ibsmun || 0,
        aliq_cbs: settings.aliq_cbs || 0,
      });
    }
  }, [settings]);

  async function handleSave() {
    setLoading(true);
    const { error } = await (supabase as any)
      .from("store_settings")
      .update({
        client_id_fiscal: formData.client_id_fiscal,
        client_secret_fiscal: formData.client_secret_fiscal,
        fiscal_nfe_enabled: formData.fiscal_nfe_enabled,
        fiscal_nfce_enabled: formData.fiscal_nfce_enabled,
        tpamb: formData.tpamb,
        ie: formData.ie,
        crt: formData.crt,
        cod_municipio: formData.cod_municipio,
        natop: formData.natop,
        serie_nfce: formData.serie_nfce,
        num_nfce: formData.num_nfce,
        serie_nfe: formData.serie_nfe,
        num_nfe: formData.num_nfe,
        envia_ibscbs: formData.envia_ibscbs,
        aliq_ibsuf: formData.aliq_ibsuf,
        aliq_ibsmun: formData.aliq_ibsmun,
        aliq_cbs: formData.aliq_cbs,
      })
      .eq("id", settings.id);

    if (error) {
      toast.error("Erro ao salvar: " + error.message);
    } else {
      toast.success("Configurações fiscais salvas!");
      onUpdate();
    }
    setLoading(false);
  }

  async function testarConexao() {
    if (!formData.client_id_fiscal || !formData.client_secret_fiscal) {
      toast.error("Preencha Client ID e Client Secret");
      return;
    }

    setTestingToken(true);
    setTokenStatus('idle');

    try {
      const response = await supabase.functions.invoke("fiscal-token", {
        body: { scope: "nfce nfe" },
      });

      if (response.error) {
        setTokenStatus('error');
        toast.error("❌ Erro: " + response.error.message);
      } else {
        setTokenStatus('success');
        toast.success("✅ Conexão OK! Token obtido com sucesso.");
      }
    } catch (error: any) {
      setTokenStatus('error');
      toast.error("❌ Erro: " + error.message);
    }
    setTestingToken(false);
  }

  async function verifyFiscalPin(pin: string) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Backend não configurado para verificar o PIN");
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/verify-fiscal-pin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ pin }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.error || "Falha ao verificar PIN");
    }

    return data;
  }

  const isCrtNormal = formData.crt === 3;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔑 Credenciais NuvemFiscal
          </CardTitle>
          <CardDescription>
            Configure as credenciais para comunicação com a API da NuvemFiscal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!credsUnlocked ? (
            <div className="rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Credenciais técnicas protegidas</p>
                  <p className="text-xs text-muted-foreground">
                    {formData.client_id_fiscal && formData.client_secret_fiscal
                      ? "✓ Configuradas — gerenciadas pelo suporte técnico"
                      : "⚠ Não configuradas — solicite ao suporte técnico"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="PIN técnico para editar"
                  value={unlockPin}
                  onChange={(e) => setUnlockPin(e.target.value)}
                  className="max-w-[220px]"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={verifyingPin || !unlockPin}
                  onClick={async () => {
                    setVerifyingPin(true);
                    try {
                      const data = await verifyFiscalPin(unlockPin);
                      if (data?.ok) {
                        setCredsUnlocked(true);
                        setUnlockPin("");
                      } else {
                        toast.error("PIN incorreto");
                      }
                    } catch (e: any) {
                      toast.error("Erro ao verificar PIN: " + (e.message || e));
                    } finally {
                      setVerifyingPin(false);
                    }
                  }}
                >
                  {verifyingPin ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Lock className="h-4 w-4 mr-1" />}
                  Desbloquear
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Client ID</Label>
                <Input
                  value={formData.client_id_fiscal}
                  onChange={(e) => setFormData({ ...formData, client_id_fiscal: e.target.value })}
                  placeholder="Digite o Client ID"
                />
              </div>
              <div>
                <Label>Client Secret</Label>
                <div className="relative">
                  <Input
                    type={showSecret ? "text" : "password"}
                    value={formData.client_secret_fiscal}
                    onChange={(e) => setFormData({ ...formData, client_secret_fiscal: e.target.value })}
                    placeholder="Digite o Client Secret"
                    className="pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="col-span-2 rounded-lg border bg-muted/40 p-4 space-y-3">
                <p className="text-sm font-semibold">Emissão habilitada no sistema</p>
                <p className="text-xs text-muted-foreground">
                  Quando desativado, os botões de emissão nos pedidos e o módulo Fiscal ficam bloqueados.
                </p>
                <div className="flex items-center justify-between rounded-md border bg-background p-3">
                  <div>
                    <Label className="font-semibold">Emitir NFC-e</Label>
                    <p className="text-xs text-muted-foreground">Nota Fiscal de Consumidor Eletrônica</p>
                  </div>
                  <Switch
                    checked={!!formData.fiscal_nfce_enabled}
                    onCheckedChange={(v) => setFormData({ ...formData, fiscal_nfce_enabled: v })}
                  />
                </div>
                <div className="flex items-center justify-between rounded-md border bg-background p-3">
                  <div>
                    <Label className="font-semibold">Emitir NF-e</Label>
                    <p className="text-xs text-muted-foreground">Nota Fiscal Eletrônica</p>
                  </div>
                  <Switch
                    checked={!!formData.fiscal_nfe_enabled}
                    onCheckedChange={(v) => setFormData({ ...formData, fiscal_nfe_enabled: v })}
                  />
                </div>
              </div>
              <div className="col-span-2 flex justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={() => setCredsUnlocked(false)}>
                  <Lock className="h-3 w-3 mr-1" /> Bloquear novamente
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Label>Ambiente:</Label>
              <Select
                value={String(formData.tpamb)}
                onValueChange={(v) => setFormData({ ...formData, tpamb: Number(v) })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Produção
                    </span>
                  </SelectItem>
                  <SelectItem value="2">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      Homologação
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" onClick={testarConexao} disabled={testingToken}>
              {testingToken ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Testar Conexão
            </Button>

            {tokenStatus === 'success' && (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                Conectado
              </span>
            )}
            {tokenStatus === 'error' && (
              <span className="flex items-center gap-1 text-red-600">
                <XCircle className="h-4 w-4" />
                Falha na conexão
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📋 Dados Fiscais do Emitente</CardTitle>
          <CardDescription>
            Informações da empresa para emissão de notas fiscais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Inscrição Estadual (IE)</Label>
              <Input
                value={formData.ie}
                onChange={(e) => setFormData({ ...formData, ie: e.target.value })}
                placeholder="Digite a IE"
              />
            </div>
            <div>
              <Label>CRT - Regime Tributário</Label>
              <Select
                value={String(formData.crt)}
                onValueChange={(v) => setFormData({ ...formData, crt: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Simples Nacional</SelectItem>
                  <SelectItem value="2">2 - Simples Nacional - Excesso</SelectItem>
                  <SelectItem value="3">3 - Regime Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Código IBGE do Município</Label>
              <Input
                value={formData.cod_municipio}
                onChange={(e) => setFormData({ ...formData, cod_municipio: e.target.value })}
                placeholder="Ex: 3550308"
              />
            </div>
            <div>
              <Label>Natureza da Operação</Label>
              <Input
                value={formData.natop}
                onChange={(e) => setFormData({ ...formData, natop: e.target.value })}
                placeholder="Ex: VENDA DE MERCADORIA"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🔢 Numeração</CardTitle>
          <CardDescription>
            Controle de numeração para NFCe e NFe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label>Série NFCe</Label>
              <Input
                type="number"
                value={formData.serie_nfce}
                onChange={(e) => setFormData({ ...formData, serie_nfce: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Próximo Nº NFCe</Label>
              <Input
                type="number"
                value={formData.num_nfce}
                onChange={(e) => setFormData({ ...formData, num_nfce: Number(e.target.value) })}
                className="border-yellow-500 focus-visible:ring-yellow-500"
              />
            </div>
            <div>
              <Label>Série NFe</Label>
              <Input
                type="number"
                value={formData.serie_nfe}
                onChange={(e) => setFormData({ ...formData, serie_nfe: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Próximo Nº NFe</Label>
              <Input
                type="number"
                value={formData.num_nfe}
                onChange={(e) => setFormData({ ...formData, num_nfe: Number(e.target.value) })}
                className="border-yellow-500 focus-visible:ring-yellow-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
            <AlertCircle className="h-4 w-4" />
            ⚠️ Alterar o próximo número pode causar rejeição na SEFAZ
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🏛️ Reforma Tributária (IBS/CBS)</CardTitle>
          <CardDescription>
            Configurações para envio de IBS e CBS na nota fiscal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Switch
              checked={formData.envia_ibscbs}
              onCheckedChange={(checked) => setFormData({ ...formData, envia_ibscbs: checked })}
              disabled={!isCrtNormal}
            />
            <div>
              <Label className="text-base">Enviar IBS/CBS na nota</Label>
              <p className="text-sm text-muted-foreground">
                {isCrtNormal
                  ? "Disponível para CRT=3 (Regime Normal)"
                  : "🔒 Disponível apenas para CRT=3 (Regime Normal)"}
              </p>
            </div>
          </div>

          {formData.envia_ibscbs && (
            <div className="grid grid-cols-3 gap-4 pt-2 border-t">
              <div>
                <Label>Alíquota IBS Estadual (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.aliq_ibsuf}
                  onChange={(e) => setFormData({ ...formData, aliq_ibsuf: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Alíquota IBS Municipal (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.aliq_ibsmun}
                  onChange={(e) => setFormData({ ...formData, aliq_ibsmun: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Alíquota CBS (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.aliq_cbs}
                  onChange={(e) => setFormData({ ...formData, aliq_cbs: Number(e.target.value) })}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading} className="w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Salvar Configurações Fiscais
      </Button>
    </div>
  );
}

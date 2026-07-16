import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, FileSignature, Send, Printer, User, Wrench, Save, Sparkles } from "lucide-react";

type Cfg = {
  id?: string;
  versao: string;
  ver_proc: string;
  tp_nf: number;          // 0 Entrada / 1 Saída
  id_dest: number;        // 1 Interna / 2 Interestadual / 3 Exterior
  tp_imp: number;         // 1 Retrato / 2 Paisagem / 4 DANFE NFC-e
  tp_emis: number;        // 1 Normal / 9 Contingência off-line NFC-e
  fin_nfe: number;        // 1 Normal / 2 Complementar / 3 Ajuste / 4 Devolução
  ind_final: number;      // 0 Não / 1 Consumidor final
  ind_pres: number;       // 0..9
  ind_intermed: number;   // 0 sem / 1 com intermediador
  proc_emi: number;       // 0 app contribuinte
  mod_nfce: number;       // 65
  mod_nfe: number;        // 55
  scope_nfce: string;
  scope_nfe: string;
  resp_tec_cnpj: string;
  resp_tec_contato: string;
  resp_tec_email: string;
  resp_tec_fone: string;
  active: boolean;
};

const DEFAULTS: Cfg = {
  versao: "4.00", ver_proc: "MeuPedix 1.0",
  tp_nf: 1, id_dest: 1, tp_imp: 4, tp_emis: 1, fin_nfe: 1,
  ind_final: 1, ind_pres: 1, ind_intermed: 0, proc_emi: 0,
  mod_nfce: 65, mod_nfe: 55, scope_nfce: "nfce", scope_nfe: "nfe",
  resp_tec_cnpj: "", resp_tec_contato: "", resp_tec_email: "", resp_tec_fone: "",
  active: true,
};

const IND_PRES = [
  ["0", "Não se aplica"],
  ["1", "Presencial"],
  ["2", "Internet"],
  ["3", "Teleatendimento"],
  ["4", "NFC-e em entrega a domicílio"],
  ["5", "Presencial fora do estabelecimento"],
  ["9", "Outros"],
];

export function FiscalNoteConfigManager() {
  const [cfg, setCfg] = useState<Cfg>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("fiscal_note_config").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (error) toast.error("Erro ao carregar: " + error.message);
    if (data) setCfg({ ...DEFAULTS, ...data });
    setLoading(false);
  }

  async function save() {
    setSaving(true);
    const payload = { ...cfg };
    const { error } = cfg.id
      ? await (supabase as any).from("fiscal_note_config").update(payload).eq("id", cfg.id)
      : await (supabase as any).from("fiscal_note_config").insert(payload);
    if (error) toast.error("Erro ao salvar: " + error.message);
    else { toast.success("✨ Tipo de Nota salvo!"); load(); }
    setSaving(false);
  }

  const set = <K extends keyof Cfg>(k: K, v: Cfg[K]) => setCfg((c) => ({ ...c, [k]: v }));

  if (loading) return <div className="flex items-center gap-2 p-8 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-gradient-to-br from-primary/10 via-background to-background p-6 flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold flex items-center gap-2">Tipo de Nota</h2>
          <p className="text-sm text-muted-foreground">Defina como suas notas fiscais serão emitidas — finalidade, presença do consumidor, impressão e modelo padrão.</p>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={cfg.active} onCheckedChange={(v) => set("active", v)} />
          <span className="text-sm">{cfg.active ? "Ativa" : "Inativa"}</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileSignature className="h-4 w-4" /> Identificação</CardTitle>
          <CardDescription>Versão do layout e do sistema emissor</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><Label>Versão Layout</Label><Input value={cfg.versao} onChange={(e) => set("versao", e.target.value)} /></div>
          <div><Label>Versão Emissor</Label><Input value={cfg.ver_proc} onChange={(e) => set("ver_proc", e.target.value)} /></div>
          <div><Label>Modelo NFC-e</Label><Input type="number" value={cfg.mod_nfce} onChange={(e) => set("mod_nfce", Number(e.target.value))} /></div>
          <div><Label>Modelo NF-e</Label><Input type="number" value={cfg.mod_nfe} onChange={(e) => set("mod_nfe", Number(e.target.value))} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Send className="h-4 w-4" /> Operação</CardTitle>
          <CardDescription>Como a nota se comporta na SEFAZ</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <Label>Tipo (tpNF)</Label>
            <Select value={String(cfg.tp_nf)} onValueChange={(v) => set("tp_nf", Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 — Entrada</SelectItem>
                <SelectItem value="1">1 — Saída</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Destino (idDest)</Label>
            <Select value={String(cfg.id_dest)} onValueChange={(v) => set("id_dest", Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 — Operação Interna</SelectItem>
                <SelectItem value="2">2 — Interestadual</SelectItem>
                <SelectItem value="3">3 — Exterior</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Finalidade (finNFe)</Label>
            <Select value={String(cfg.fin_nfe)} onValueChange={(v) => set("fin_nfe", Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 — Normal</SelectItem>
                <SelectItem value="2">2 — Complementar</SelectItem>
                <SelectItem value="3">3 — Ajuste</SelectItem>
                <SelectItem value="4">4 — Devolução</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Forma de Emissão (tpEmis)</Label>
            <Select value={String(cfg.tp_emis)} onValueChange={(v) => set("tp_emis", Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 — Normal</SelectItem>
                <SelectItem value="9">9 — Contingência off-line NFC-e</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Processo de Emissão</Label>
            <Select value={String(cfg.proc_emi)} onValueChange={(v) => set("proc_emi", Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 — App do contribuinte</SelectItem>
                <SelectItem value="3">3 — App fornecido pelo fisco</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Intermediador</Label>
            <Select value={String(cfg.ind_intermed)} onValueChange={(v) => set("ind_intermed", Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 — Sem intermediador</SelectItem>
                <SelectItem value="1">1 — Com intermediador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-4 w-4" /> Consumidor & Impressão</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <Label>Consumidor Final</Label>
            <Select value={String(cfg.ind_final)} onValueChange={(v) => set("ind_final", Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 — Não</SelectItem>
                <SelectItem value="1">1 — Sim</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Presença (indPres)</Label>
            <Select value={String(cfg.ind_pres)} onValueChange={(v) => set("ind_pres", Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {IND_PRES.map(([v, l]) => <SelectItem key={v} value={v}>{v} — {l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="flex items-center gap-1"><Printer className="h-3 w-3" /> Impressão (tpImp)</Label>
            <Select value={String(cfg.tp_imp)} onValueChange={(v) => set("tp_imp", Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 — Sem DANFE</SelectItem>
                <SelectItem value="1">1 — Retrato</SelectItem>
                <SelectItem value="2">2 — Paisagem</SelectItem>
                <SelectItem value="4">4 — DANFE NFC-e</SelectItem>
                <SelectItem value="5">5 — DANFE NFC-e em mensagem eletrônica</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Scope NFC-e</Label><Input value={cfg.scope_nfce} onChange={(e) => set("scope_nfce", e.target.value)} /></div>
          <div><Label>Scope NF-e</Label><Input value={cfg.scope_nfe} onChange={(e) => set("scope_nfe", e.target.value)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wrench className="h-4 w-4" /> Responsável Técnico</CardTitle>
          <CardDescription>Dados informados no grupo infRespTec do XML</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><Label>CNPJ</Label><Input value={cfg.resp_tec_cnpj} onChange={(e) => set("resp_tec_cnpj", e.target.value)} placeholder="00000000000000" /></div>
          <div><Label>Contato</Label><Input value={cfg.resp_tec_contato} onChange={(e) => set("resp_tec_contato", e.target.value)} /></div>
          <div><Label>E-mail</Label><Input value={cfg.resp_tec_email} onChange={(e) => set("resp_tec_email", e.target.value)} /></div>
          <div><Label>Telefone</Label><Input value={cfg.resp_tec_fone} onChange={(e) => set("resp_tec_fone", e.target.value)} /></div>
        </CardContent>
      </Card>

      <Button onClick={save} disabled={saving} className="w-full">
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
        Salvar Tipo de Nota
      </Button>
    </div>
  );
}

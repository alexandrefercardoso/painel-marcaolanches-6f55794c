import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Pencil, Plus, RefreshCw, Search, Globe } from "lucide-react";

interface Endpoint {
  id?: string;
  chave: string;
  label: string;
  url: string;
  method: string;
  active: boolean;
}

const TABLE = "fiscal_api_endpoints";
const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-blue-100 text-blue-700 border-blue-200",
  POST: "bg-green-100 text-green-700 border-green-200",
  PUT: "bg-amber-100 text-amber-700 border-amber-200",
  DELETE: "bg-red-100 text-red-700 border-red-200",
  PATCH: "bg-purple-100 text-purple-700 border-purple-200",
};

const DEFAULT_ENDPOINTS: Endpoint[] = [
  { chave: "nfe_emitir", label: "Emitir NF-e", url: "/nfe/emitir", method: "POST", active: true },
  { chave: "nfe_cancelar", label: "Cancelar NF-e", url: "/nfe/cancelar", method: "POST", active: true },
  { chave: "nfe_consultar", label: "Consultar NF-e", url: "/nfe/consultar", method: "GET", active: true },
  { chave: "nfce_emitir", label: "Emitir NFC-e", url: "/nfce/emitir", method: "POST", active: true },
  { chave: "nfce_cancelar", label: "Cancelar NFC-e", url: "/nfce/cancelar", method: "POST", active: true },
  { chave: "status_servico", label: "Status do Serviço", url: "/status", method: "GET", active: true },
];

const empty: Endpoint = { chave: "", label: "", url: "", method: "POST", active: true };

export function FiscalApiEndpointsManager() {
  const [rows, setRows] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Endpoint>(empty);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).from(TABLE).select("*").order("label");
    if (error) toast.error("Erro ao carregar endpoints: " + error.message);
    setRows((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter(r =>
      !q || r.chave.toLowerCase().includes(q) || r.label.toLowerCase().includes(q) || r.url.toLowerCase().includes(q)
    );
  }, [rows, search]);

  const save = async () => {
    if (!form.chave || !form.label || !form.url) {
      toast.error("Preencha chave, label e URL");
      return;
    }
    const payload: any = { ...form };
    delete payload.id;
    const { error } = form.id
      ? await (supabase as any).from(TABLE).update(payload).eq("id", form.id)
      : await (supabase as any).from(TABLE).insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Endpoint salvo");
    setOpen(false);
    setForm(empty);
    load();
  };

  const restoreDefaults = async () => {
    if (!confirm("Recriar endpoints padrão da ACBr API?")) return;
    const { error } = await (supabase as any)
      .from(TABLE)
      .upsert(DEFAULT_ENDPOINTS as any, { onConflict: "chave" });
    if (error) { toast.error(error.message); return; }
    toast.success("Endpoints padrão restaurados");
    load();
  };

  const edit = (r: Endpoint) => { setForm(r); setOpen(true); };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-orange-600" />
          <h2 className="text-xl font-bold">Endpoints da API Fiscal</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={restoreDefaults}>
            <RefreshCw className="w-4 h-4 mr-2" /> Restaurar Padrões
          </Button>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(empty); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setForm(empty)}>
                <Plus className="w-4 h-4 mr-2" /> Novo Endpoint
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{form.id ? "Editar" : "Novo"} Endpoint</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3">
                <div>
                  <Label>Chave</Label>
                  <Input value={form.chave} onChange={e => setForm({ ...form, chave: e.target.value })} />
                </div>
                <div>
                  <Label>Label</Label>
                  <Input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} />
                </div>
                <div>
                  <Label>URL</Label>
                  <Input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
                </div>
                <div>
                  <Label>Método</Label>
                  <Select value={form.method} onValueChange={v => setForm({ ...form, method: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.active} onCheckedChange={v => setForm({ ...form, active: v })} />
                  <Label>Ativo</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={save}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar por chave, label ou URL..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Chave</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">Carregando...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">Nenhum endpoint encontrado</TableCell></TableRow>
            ) : filtered.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs">{r.chave}</TableCell>
                <TableCell>{r.label}</TableCell>
                <TableCell className="font-mono text-xs">{r.url}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={METHOD_COLORS[r.method] || ""}>{r.method}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={r.active ? "default" : "secondary"}>
                    {r.active ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="icon" variant="ghost" onClick={() => edit(r)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default FiscalApiEndpointsManager;

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Plus, Search, FileText, Trash2 } from "lucide-react";

interface CClass {
  id?: string;
  cst?: string | null;
  cst_ibs_cbs: string;
  cclass_trib: string;
  nome_cclass_trib: string;
  descr_cclass_trib?: string | null;
  pred_ibs: number;
  pred_cbs: number;
  aliquota_cbs: number;
  ind_g_trib_regular: boolean;
  ind_nfe: boolean;
  ind_nfce: boolean;
}

const empty: CClass = {
  cst: "", cst_ibs_cbs: "", cclass_trib: "", nome_cclass_trib: "", descr_cclass_trib: "",
  pred_ibs: 0, pred_cbs: 0, aliquota_cbs: 0,
  ind_g_trib_regular: true, ind_nfe: true, ind_nfce: true,
};

export function FiscalCClassTribManager() {
  const [rows, setRows] = useState<CClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CClass>(empty);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("fiscal_cclass_trib")
      .select("*")
      .order("cst_ibs_cbs", { ascending: true });
    if (error) toast.error("Erro ao carregar classificações");
    setRows((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter(r =>
      !q ||
      (r.cst_ibs_cbs || "").toLowerCase().includes(q) ||
      (r.cclass_trib || "").toLowerCase().includes(q) ||
      (r.nome_cclass_trib || "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  const save = async () => {
    if (!form.cst_ibs_cbs || !form.cclass_trib || !form.nome_cclass_trib) {
      toast.error("Preencha CST IBS/CBS, classificação e nome");
      return;
    }
    const payload: any = {
      cst_ibs_cbs: form.cst_ibs_cbs,
      cclass_trib: form.cclass_trib,
      nome_cclass_trib: form.nome_cclass_trib,
      descr_cclass_trib: form.descr_cclass_trib || null,
      pred_ibs: Number(form.pred_ibs) || 0,
      pred_cbs: Number(form.pred_cbs) || 0,
      aliquota_cbs: Number(form.aliquota_cbs) || 0,
      ind_g_trib_regular: form.ind_g_trib_regular,
      ind_nfe: form.ind_nfe,
      ind_nfce: form.ind_nfce,
    };
    const { error } = form.id
      ? await supabase.from("fiscal_cclass_trib").update(payload).eq("id", form.id)
      : await supabase.from("fiscal_cclass_trib").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Classificação salva");
    setOpen(false);
    setForm(empty);
    load();
  };

  const edit = (r: CClass) => { setForm(r); setOpen(true); };

  const remove = async (r: CClass) => {
    if (!r.id) return;
    if (!confirm(`Excluir classificação "${r.nome_cclass_trib}"?`)) return;
    const { error } = await supabase.from("fiscal_cclass_trib").delete().eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Classificação excluída");
    load();
  };

  const docsBadges = (r: CClass) => (
    <div className="flex gap-1">
      {r.ind_nfe && <Badge variant="outline" className="text-xs">NFe</Badge>}
      {r.ind_nfce && <Badge variant="outline" className="text-xs">NFCe</Badge>}
      {r.ind_g_trib_regular && <Badge variant="outline" className="text-xs">Reg</Badge>}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-orange-600" />
          <h2 className="text-xl font-bold">Classificação Tributária IBS/CBS</h2>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(empty); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setForm(empty)}>
              <Plus className="w-4 h-4 mr-2" /> Nova Classificação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{form.id ? "Editar" : "Nova"} Classificação</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>CST IBS/CBS</Label>
                <Input maxLength={3} value={form.cst_ibs_cbs} onChange={e => setForm({ ...form, cst_ibs_cbs: e.target.value.replace(/\D/g, "") })} />
              </div>
              <div>
                <Label>cClassTrib</Label>
                <Input value={form.cclass_trib} onChange={e => setForm({ ...form, cclass_trib: e.target.value })} />
              </div>
              <div>
                <Label>Nome</Label>
                <Input value={form.nome_cclass_trib} onChange={e => setForm({ ...form, nome_cclass_trib: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Label>Descrição</Label>
                <Textarea value={form.descr_cclass_trib || ""} onChange={e => setForm({ ...form, descr_cclass_trib: e.target.value })} />
              </div>
              <div>
                <Label>pRedIBS (%)</Label>
                <Input type="number" step="0.0001" value={form.pred_ibs} onChange={e => setForm({ ...form, pred_ibs: Number(e.target.value) })} />
              </div>
              <div>
                <Label>pRedCBS (%)</Label>
                <Input type="number" step="0.0001" value={form.pred_cbs} onChange={e => setForm({ ...form, pred_cbs: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Alíquota CBS (%)</Label>
                <Input type="number" step="0.0001" value={form.aliquota_cbs} onChange={e => setForm({ ...form, aliquota_cbs: Number(e.target.value) })} />
              </div>
              <div className="col-span-2 flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2">
                  <Switch checked={form.ind_g_trib_regular} onCheckedChange={v => setForm({ ...form, ind_g_trib_regular: v })} />
                  gTribRegular
                </label>
                <label className="flex items-center gap-2">
                  <Switch checked={form.ind_nfe} onCheckedChange={v => setForm({ ...form, ind_nfe: v })} />
                  NF-e
                </label>
                <label className="flex items-center gap-2">
                  <Switch checked={form.ind_nfce} onCheckedChange={v => setForm({ ...form, ind_nfce: v })} />
                  NFC-e
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={save}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar por CST, classificação ou nome..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CST IBS/CBS</TableHead>
              <TableHead>cClassTrib</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>pRedIBS</TableHead>
              <TableHead>pRedCBS</TableHead>
              <TableHead>CBS %</TableHead>
              <TableHead>Documentos</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-6">Carregando...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-6">Nenhuma classificação cadastrada</TableCell></TableRow>
            ) : filtered.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-mono">{r.cst_ibs_cbs}</TableCell>
                <TableCell>{r.cclass_trib}</TableCell>
                <TableCell>{r.nome_cclass_trib}</TableCell>
                <TableCell>{Number(r.pred_ibs).toFixed(2)}</TableCell>
                <TableCell>{Number(r.pred_cbs).toFixed(2)}</TableCell>
                <TableCell>{Number(r.aliquota_cbs).toFixed(2)}</TableCell>
                <TableCell>{docsBadges(r)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => edit(r)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(r)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default FiscalCClassTribManager;

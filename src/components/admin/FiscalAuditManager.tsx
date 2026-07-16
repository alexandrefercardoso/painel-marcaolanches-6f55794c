import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  loadFiscalAuditData,
  type FiscalAuditCategoryRow,
  type FiscalAuditProductRow,
  type FiscalAuditTaxRuleRow,
} from "@/services/fiscalAuditService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertTriangle, CheckCircle2, FilterX, Package, RefreshCw,
  Search, ShieldCheck, ShoppingBag, XCircle,
} from "lucide-react";

// ---------- Types ----------
type ProductRow = FiscalAuditProductRow;
type CategoryRow = FiscalAuditCategoryRow;
type TaxRuleRow = FiscalAuditTaxRuleRow;

type Status = "complete" | "missing" | "inconsistent";
type StatusFilter = "all" | Status;
const PAGE_SIZE = 10;

// ---------- Validation ----------
const isValidNcm = (v?: string | null) => !!v && /^\d{8}$/.test(v.replace(/\D/g, ""));
const isValidCfop = (v?: string | null) => !!v && /^\d{4}$/.test(v);

function getStatus(p: ProductRow, ruleById: Map<string, TaxRuleRow>): Status {
  if (!p.tax_rule_id) return "missing";
  const rule = ruleById.get(p.tax_rule_id);
  if (!rule) return "missing";
  const ncmOk = isValidNcm(p.ncm);
  const cfopOk = isValidCfop(rule.cfop);
  if (!ncmOk || !cfopOk) return "inconsistent";
  return "complete";
}

const statusMeta: Record<Status, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  complete: {
    label: "Completo",
    className: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300 border-transparent",
    icon: CheckCircle2,
  },
  missing: {
    label: "Sem Perfil",
    className: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300 border-transparent",
    icon: XCircle,
  },
  inconsistent: {
    label: "Inconsistente",
    className: "bg-yellow-100 text-yellow-900 dark:bg-yellow-500/15 dark:text-yellow-300 border-transparent",
    icon: AlertTriangle,
  },
};

// ---------- Component ----------
export function FiscalAuditManager() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [rules, setRules] = useState<TaxRuleRow[]>([]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loadFiscalAuditData();
      setProducts(data.products);
      setCategories(data.categories);
      setRules(data.rules);
    } catch (err: any) {
      toast.error("Erro ao carregar auditoria: " + (err?.message || err));
      setProducts([]);
      setCategories([]);
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const ruleById = useMemo(() => new Map(rules.map(r => [r.id, r])), [rules]);
  const categoryById = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);

  const enriched = useMemo(
    () => products.map(p => ({ ...p, _status: getStatus(p, ruleById) })),
    [products, ruleById]
  );

  const stats = useMemo(() => {
    const s = { total: enriched.length, withProfile: 0, complete: 0, missing: 0, inconsistent: 0 };
    for (const p of enriched) s[p._status]++;
    s.withProfile = s.complete + s.inconsistent;
    return s;
  }, [enriched]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enriched.filter(p => {
      if (categoryFilter !== "all" && p.category_id !== categoryFilter) return false;
      if (statusFilter !== "all" && p._status !== statusFilter) return false;
      if (q && !p.name.toLowerCase().includes(q) && !(p.id || "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [enriched, search, categoryFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, categoryFilter, statusFilter]);

  const clearFilters = () => {
    setSearch(""); setCategoryFilter("all"); setStatusFilter("all");
  };

  const toggleAllOnPage = (checked: boolean) => {
    const next = new Set(selected);
    pageRows.forEach(p => checked ? next.add(p.id) : next.delete(p.id));
    setSelected(next);
  };
  const toggleOne = (id: string, checked: boolean) => {
    const next = new Set(selected);
    checked ? next.add(id) : next.delete(id);
    setSelected(next);
  };

  const assignRule = async (productIds: string[], taxRuleId: string | null) => {
    if (productIds.length === 0) return;
    setSavingId(productIds[0]);
    try {
      const { error } = await supabase
        .from("products")
        .update({ tax_rule_id: taxRuleId })
        .in("id", productIds);
      if (error) throw error;
      toast.success(`${productIds.length} produto(s) atualizado(s).`);
      setEditing(null); setBulkOpen(false); setSelected(new Set());
      await load();
    } catch (err: any) {
      toast.error("Erro ao salvar: " + (err?.message || err));
    } finally {
      setSavingId(null);
    }
  };

  const allOnPageSelected = pageRows.length > 0 && pageRows.every(p => selected.has(p.id));

  // ---------- Render ----------
  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-bold">Auditoria Fiscal</h2>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Total de produtos" value={stats.total} loading={loading}
            icon={<ShoppingBag className="w-5 h-5" />} tone="default"
          />
          <StatCard
            title="Com perfil tributário" value={stats.withProfile} loading={loading}
            icon={<CheckCircle2 className="w-5 h-5" />} tone="green"
          />
          <StatCard
            title="Sem perfil tributário" value={stats.missing} loading={loading}
            icon={<XCircle className="w-5 h-5" />} tone="red"
          />
          <StatCard
            title="Com inconsistências" value={stats.inconsistent} loading={loading}
            icon={<AlertTriangle className="w-5 h-5" />} tone="yellow"
          />
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-5">
              <Label className="text-xs">Buscar produto</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Nome ou ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="md:col-span-3">
              <Label className="text-xs">Categoria</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <Label className="text-xs">Situação</Label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="complete">Completo</SelectItem>
                  <SelectItem value="missing">Sem Perfil</SelectItem>
                  <SelectItem value="inconsistent">Inconsistente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-1">
              <Button variant="outline" className="w-full" onClick={clearFilters} title="Limpar filtros">
                <FilterX className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bulk bar */}
        {selected.size > 0 && (
          <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/40 px-3 py-2">
            <span className="text-sm">{selected.size} selecionado(s)</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setSelected(new Set())}>
                Limpar seleção
              </Button>
              <Button size="sm" onClick={() => setBulkOpen(true)}>
                Atribuir perfil em lote
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allOnPageSelected}
                      onCheckedChange={(v) => toggleAllOnPage(!!v)}
                      aria-label="Selecionar página"
                    />
                  </TableHead>
                  <TableHead>Nome do produto</TableHead>
                  <TableHead>NCM</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7}><Skeleton className="h-6 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : pageRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      Nenhum produto encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  pageRows.map(p => {
                    const meta = statusMeta[p._status];
                    const Icon = meta.icon;
                    const rule = p.tax_rule_id ? ruleById.get(p.tax_rule_id) : null;
                    const ncmInvalid = p.ncm && !isValidNcm(p.ncm);
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <Checkbox
                            checked={selected.has(p.id)}
                            onCheckedChange={(v) => toggleOne(p.id, !!v)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="font-mono">
                          <span className="inline-flex items-center gap-1">
                            {p.ncm || <span className="text-muted-foreground">—</span>}
                            {ncmInvalid && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertTriangle className="w-3.5 h-3.5 text-yellow-600" />
                                </TooltipTrigger>
                                <TooltipContent>NCM deve ter 8 dígitos</TooltipContent>
                              </Tooltip>
                            )}
                          </span>
                        </TableCell>
                        <TableCell>{p.category_id ? categoryById.get(p.category_id) || "—" : "—"}</TableCell>
                        <TableCell>{rule?.nome || <span className="text-muted-foreground">—</span>}</TableCell>
                        <TableCell>
                          <Badge className={meta.className}>
                            <Icon className="w-3 h-3 mr-1" />
                            {meta.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => setEditing(p)}>
                            {p.tax_rule_id ? "Editar" : "Atribuir"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="text-muted-foreground">
              Página {currentPage} de {totalPages} · {filtered.length} produto(s)
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
                Anterior
              </Button>
              <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>
                Próxima
              </Button>
            </div>
          </div>
        )}

        {/* Single assign modal */}
        <AssignDialog
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
          title={editing ? `Perfil tributário — ${editing.name}` : ""}
          currentRuleId={editing?.tax_rule_id || null}
          rules={rules}
          saving={savingId === editing?.id}
          onConfirm={(ruleId) => editing && assignRule([editing.id], ruleId)}
        />

        {/* Bulk assign modal */}
        <AssignDialog
          open={bulkOpen}
          onOpenChange={setBulkOpen}
          title={`Atribuir perfil para ${selected.size} produto(s)`}
          currentRuleId={null}
          rules={rules}
          saving={!!savingId}
          onConfirm={(ruleId) => assignRule(Array.from(selected), ruleId)}
        />
      </div>
    </TooltipProvider>
  );
}

// ---------- Subcomponents ----------
function StatCard({
  title, value, icon, tone, loading,
}: {
  title: string; value: number; icon: React.ReactNode;
  tone: "default" | "green" | "red" | "yellow"; loading: boolean;
}) {
  const toneClass = {
    default: "text-foreground",
    green: "text-green-600 dark:text-green-400",
    red: "text-red-600 dark:text-red-400",
    yellow: "text-yellow-600 dark:text-yellow-400",
  }[tone];
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <span className={toneClass}>{icon}</span>
      </CardHeader>
      <CardContent>
        {loading
          ? <Skeleton className="h-8 w-16" />
          : <div className={`text-2xl font-bold ${toneClass}`}>{value}</div>}
      </CardContent>
    </Card>
  );
}

function AssignDialog({
  open, onOpenChange, title, currentRuleId, rules, saving, onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  currentRuleId: string | null;
  rules: TaxRuleRow[];
  saving: boolean;
  onConfirm: (ruleId: string | null) => void;
}) {
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    if (open) setValue(currentRuleId || "");
  }, [open, currentRuleId]);

  const selectedRule = rules.find(r => r.id === value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Selecione um perfil tributário existente para associar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label className="text-xs">Perfil tributário</Label>
            <Select value={value || "__none__"} onValueChange={(v) => setValue(v === "__none__" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Nenhum (remover)</SelectItem>
                {rules.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedRule && (
            <div className="grid grid-cols-2 gap-2 text-xs rounded-md border p-3 bg-muted/30">
              <div><div className="text-muted-foreground">CFOP</div><div className="font-mono">{selectedRule.cfop || "—"}</div></div>
              <div><div className="text-muted-foreground">CST IBS/CBS</div><div className="font-mono">{selectedRule.cst_ibscbs || "—"}</div></div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={() => onConfirm(value || null)}
            disabled={saving}
          >
            {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default FiscalAuditManager;

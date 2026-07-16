import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Building2,
  Plus,
  Search,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MapPin,
  User,
  Truck,
} from "lucide-react";

type Supplier = {
  id: string;
  name: string;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  address_number?: string | null;
  zip_code?: string | null;
  city?: string | null;
  state?: string | null;
  cnpj?: string | null;
  cpf?: string | null;
};

const emptyForm = {
  name: "",
  contact_name: "",
  email: "",
  phone: "",
  address: "",
  address_number: "",
  zip_code: "",
  city: "",
  state: "",
  cnpj: "",
  cpf: "",
  person_type: "juridica" as "juridica" | "fisica",
};

export default function SuppliersManager() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const fetchSuppliers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .order("name");
    setLoading(false);
    if (error) return toast.error(error.message);
    setSuppliers((data ?? []) as Supplier[]);
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    if (!s) return suppliers;
    return suppliers.filter((x) =>
      [x.name, x.contact_name, x.cnpj, x.cpf, x.city, x.phone, x.email]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(s)),
    );
  }, [suppliers, search]);

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setOpen(true);
  };

  const openEdit = (s: Supplier) => {
    setEditing(s);
    setForm({
      name: s.name || "",
      contact_name: s.contact_name || "",
      email: s.email || "",
      phone: s.phone || "",
      address: s.address || "",
      address_number: s.address_number || "",
      zip_code: s.zip_code || "",
      city: s.city || "",
      state: s.state || "",
      cnpj: s.cnpj || "",
      cpf: s.cpf || "",
      person_type: s.cpf && !s.cnpj ? "fisica" : "juridica",
    });
    setOpen(true);
  };

  const handleCnpjLookup = async (val: string) => {
    if (val.length !== 14) return;
    const toastId = toast.loading("Buscando CNPJ...");
    try {
      const res = await fetch(`https://publica.cnpj.ws/cnpj/${val}`);
      const data = await res.json();
      toast.dismiss(toastId);
      if (data?.estabelecimento) {
        const est = data.estabelecimento;
        setForm((prev) => ({
          ...prev,
          name: data.razao_social || prev.name,
          email: est.email || prev.email,
          phone:
            est.ddd1 && est.telefone1
              ? `${est.ddd1}${est.telefone1}`
              : prev.phone,
          zip_code: est.cep || prev.zip_code,
          address: est.logradouro || prev.address,
          address_number: est.numero || prev.address_number,
          city: est.cidade?.nome || prev.city,
          state: est.estado?.sigla || prev.state,
        }));
        toast.success("Dados do CNPJ carregados!");
      } else {
        toast.error("CNPJ não encontrado");
      }
    } catch {
      toast.dismiss(toastId);
      toast.error("Erro ao buscar CNPJ");
    }
  };

  const handleCepLookup = async (val: string) => {
    if (val.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${val}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm((prev) => ({
          ...prev,
          address: data.logradouro || prev.address,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
        }));
        toast.success("Endereço encontrado!");
      }
    } catch {}
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error("Nome/Razão Social obrigatório");
    const { person_type, ...payload } = form;
    if (editing) {
      const { error } = await supabase
        .from("suppliers")
        .update(payload)
        .eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Fornecedor atualizado!");
    } else {
      const { error } = await supabase.from("suppliers").insert([payload]);
      if (error) return toast.error(error.message);
      toast.success("Fornecedor cadastrado!");
    }
    setOpen(false);
    fetchSuppliers();
  };

  const remove = async (s: Supplier) => {
    if (!confirm(`Excluir fornecedor "${s.name}"?`)) return;
    const { error } = await supabase.from("suppliers").delete().eq("id", s.id);
    if (error) return toast.error(error.message);
    toast.success("Fornecedor excluído!");
    fetchSuppliers();
  };

  const stats = useMemo(() => {
    const total = suppliers.length;
    const pj = suppliers.filter((s) => !!s.cnpj).length;
    const pf = suppliers.filter((s) => !!s.cpf && !s.cnpj).length;
    const cities = new Set(
      suppliers.map((s) => s.city).filter(Boolean) as string[],
    ).size;
    return { total, pj, pf, cities };
  }, [suppliers]);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-indigo-500/10 via-background to-emerald-500/10 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white shadow-lg">
              <Truck className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Fornecedores</h2>
              <p className="text-sm text-muted-foreground">
                Cadastre e gerencie seus parceiros comerciais
              </p>
            </div>
          </div>
          <Button onClick={openNew} className="gap-2 rounded-full shadow-md">
            <Plus className="h-4 w-4" /> Novo Fornecedor
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total", value: stats.total, icon: Building2, color: "from-indigo-500 to-violet-500" },
            { label: "Pessoa Jurídica", value: stats.pj, icon: Building2, color: "from-blue-500 to-cyan-500" },
            { label: "Pessoa Física", value: stats.pf, icon: User, color: "from-emerald-500 to-teal-500" },
            { label: "Cidades", value: stats.cities, icon: MapPin, color: "from-amber-500 to-orange-500" },
          ].map((s) => (
            <Card key={s.label} className="border-none shadow-sm bg-background/70 backdrop-blur">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <div className="text-xl font-bold">{s.value}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Search + Table */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CNPJ, cidade, contato..."
              className="pl-10 rounded-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      <Truck className="h-10 w-10 mx-auto mb-2 opacity-40" />
                      Nenhum fornecedor encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((s) => (
                    <TableRow key={s.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-500 text-white flex items-center justify-center font-bold uppercase">
                            {s.name?.[0] || "?"}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold">{s.name}</span>
                            {s.contact_name && (
                              <span className="text-[11px] text-muted-foreground">
                                {s.contact_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {s.cnpj ? (
                          <Badge variant="secondary">CNPJ {s.cnpj}</Badge>
                        ) : s.cpf ? (
                          <Badge variant="outline">CPF {s.cpf}</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs">
                          {s.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {s.phone}
                            </span>
                          )}
                          {s.email && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="h-3 w-3" /> {s.email}
                            </span>
                          )}
                          {!s.phone && !s.email && (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {s.city ? (
                          <span className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {s.city}/{s.state || ""}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-blue-600"
                            onClick={() => openEdit(s)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-600"
                            onClick={() => remove(s)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar Fornecedor" : "Novo Fornecedor"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do fornecedor. CNPJ e CEP são pesquisados automaticamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={form.person_type === "juridica"}
                  onChange={() => setForm({ ...form, person_type: "juridica" })}
                />
                <span>Pessoa Jurídica</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={form.person_type === "fisica"}
                  onChange={() => setForm({ ...form, person_type: "fisica" })}
                />
                <span>Pessoa Física</span>
              </label>
            </div>

            {form.person_type === "juridica" ? (
              <div className="space-y-1">
                <Label className="text-indigo-600 font-semibold">
                  CNPJ (pesquisa automática)
                </Label>
                <Input
                  placeholder="00000000000000"
                  value={form.cnpj}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").substring(0, 14);
                    setForm({ ...form, cnpj: val });
                    if (val.length === 14) handleCnpjLookup(val);
                  }}
                  className="border-indigo-300 focus-visible:ring-indigo-500 bg-indigo-50/30 font-medium"
                />
              </div>
            ) : (
              <div className="space-y-1">
                <Label>CPF</Label>
                <Input
                  placeholder="00000000000"
                  value={form.cpf}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").substring(0, 11);
                    setForm({ ...form, cpf: val });
                  }}
                />
              </div>
            )}

            <div className="space-y-1">
              <Label>Nome / Razão Social *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Telefone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-blue-600 font-semibold">
                  CEP (pesquisa automática)
                </Label>
                <Input
                  placeholder="00000000"
                  value={form.zip_code}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").substring(0, 8);
                    setForm({ ...form, zip_code: val });
                    if (val.length === 8) handleCepLookup(val);
                  }}
                  className="border-blue-300 focus-visible:ring-blue-500 bg-blue-50/30"
                />
              </div>
              <div className="space-y-1">
                <Label>Contato (nome)</Label>
                <Input
                  value={form.contact_name}
                  onChange={(e) =>
                    setForm({ ...form, contact_name: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-1">
                <Label>Endereço</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Número</Label>
                <Input
                  value={form.address_number}
                  onChange={(e) =>
                    setForm({ ...form, address_number: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Cidade</Label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Estado</Label>
                <Input
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={save}>
                {editing ? "Salvar Alterações" : "Cadastrar Fornecedor"}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// src/components/admin/FiscalDocumentsPanel.tsx
// Painel de Documentos Fiscais

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFiscalEnabled } from "@/hooks/useFiscalEnabled";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Download,
  Loader2,
  RefreshCw,
  Ban,
  Printer,
  Search,
  Eye,
} from "lucide-react";

interface FiscalDocument {
  id: string;
  tipo: string;
  modelo: number;
  serie: number;
  numero: number;
  status: string;
  chave_acesso: string;
  cliente_nome: string;
  valor_total: number;
  valor_icms: number;
  valor_pis: number;
  valor_cofins: number;
  valor_ibs: number;
  valor_cbs: number;
  ambiente: number;
  emitido_em: string;
  created_at: string;
  pedido_id: string;
}

const ALL = "all";

export function FiscalDocumentsPanel() {
  const [documents, setDocuments] = useState<FiscalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const { nfeEnabled, nfceEnabled, anyEnabled } = useFiscalEnabled();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ status: ALL, tipo: ALL });
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [cancelJustificativa, setCancelJustificativa] = useState("");
  const [visualizandoId, setVisualizandoId] = useState<string | null>(null);

  async function visualizarDanfe(docId: string) {
    setVisualizandoId(docId);
    try {
      const { data, error } = await supabase.functions.invoke("fiscal-visualizar", {
        body: { fiscal_document_id: docId, acao: "visualizar" },
      });
      if (error) {
        toast.error("Erro: " + error.message);
        return;
      }
      const pdfBase64 = (data as any).content;
      const blob = new Blob(
        [Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0))],
        { type: "application/pdf" }
      );
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err: any) {
      toast.error("Erro: " + err.message);
    } finally {
      setVisualizandoId(null);
    }
  }

  async function imprimirDanfe(docId: string) {
    setVisualizandoId(docId);
    try {
      const { data, error } = await supabase.functions.invoke("fiscal-visualizar", {
        body: { fiscal_document_id: docId, acao: "imprimir" },
      });
      if (error) {
        toast.error("Erro: " + error.message);
        return;
      }
      const pdfBase64 = (data as any).content;
      const blob = new Blob(
        [Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0))],
        { type: "application/pdf" }
      );
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank");
      win?.print();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err: any) {
      toast.error("Erro: " + err.message);
    } finally {
      setVisualizandoId(null);
    }
  }
  const [totalizadores, setTotalizadores] = useState({
    total: 0,
    autorizadas: 0,
    rejeitadas: 0,
    canceladas: 0,
    pendentes: 0,
    valor_total: 0,
  });
  const [inutilizarOpen, setInutilizarOpen] = useState(false);
  const [inutilizarLoading, setInutilizarLoading] = useState(false);
  const [inutilizarData, setInutilizarData] = useState({
    tipo: "NFCE" as "NFCE" | "NFE",
    serie: 1,
    numero_inicial: 1,
    numero_final: 1,
    justificativa: "",
  });

  async function inutilizarNumeros() {
    if (inutilizarData.justificativa.length < 15) {
      toast.error("Justificativa deve ter no mínimo 15 caracteres");
      return;
    }
    setInutilizarLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("fiscal-inutilizar", {
        body: inutilizarData,
      });
      if (error) {
        toast.error("Erro: " + error.message);
        return;
      }
      toast.success(`✅ ${(data as any)?.quantidade ?? ""} números inutilizados com sucesso!`);
      setInutilizarOpen(false);
      loadDocuments();
    } catch (err: any) {
      toast.error("Erro: " + err.message);
    } finally {
      setInutilizarLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  async function loadDocuments() {
    setLoading(true);
    let query: any = (supabase as any)
      .from("fiscal_documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters.status && filters.status !== ALL) query = query.eq("status", filters.status);
    if (filters.tipo && filters.tipo !== ALL) query = query.eq("tipo", filters.tipo);

    const { data, error } = await query;

    if (error) {
      toast.error("Erro ao carregar documentos: " + error.message);
    } else {
      const docs = (data as FiscalDocument[]) || [];
      setDocuments(docs);

      setTotalizadores({
        total: docs.length,
        autorizadas: docs.filter((d) => d.status === "autorizada").length,
        rejeitadas: docs.filter((d) => d.status === "rejeitada").length,
        canceladas: docs.filter((d) => d.status === "cancelada").length,
        pendentes: docs.filter((d) => d.status === "pendente").length,
        valor_total: docs.reduce((sum, d) => sum + (d.valor_total || 0), 0),
      });
    }
    setLoading(false);
  }

  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      autorizada: "bg-green-500 text-white",
      rejeitada: "bg-red-500 text-white",
      cancelada: "bg-gray-500 text-white",
      pendente: "bg-yellow-500 text-white",
      inutilizada: "bg-gray-400 text-white",
    };
    return <Badge className={styles[status] || "bg-gray-500"}>{status}</Badge>;
  }

  function getAmbienteBadge(ambiente: number) {
    return ambiente === 1 ? (
      <Badge className="bg-red-500 text-white">PROD</Badge>
    ) : (
      <Badge className="bg-yellow-500 text-white">HOM</Badge>
    );
  }

  function formatCurrency(value: number): string {
    return value ? `R$ ${value.toFixed(2)}` : "R$ 0,00";
  }

  function formatDate(dateStr: string): string {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return (
      date.toLocaleDateString("pt-BR") +
      " " +
      date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    );
  }

  async function baixarArquivo(docId: string, tipo: "xml" | "pdf") {
    try {
      const response = await supabase.functions.invoke("fiscal-baixar", {
        body: { fiscal_document_id: docId, tipo_arquivo: tipo },
      });

      if (response.error) {
        toast.error("Erro: " + response.error.message);
        return;
      }

      const data: any = response.data;
      const link = document.createElement("a");
      link.href = `data:application/${tipo === "xml" ? "xml" : "pdf"};base64,${data.content}`;
      link.download = data.filename || `${docId}.${tipo}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Download iniciado");
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    }
  }

  async function cancelarDocumento() {
    if (!selectedDocId) return;
    if (cancelJustificativa.length < 15) {
      toast.error("Justificativa deve ter no mínimo 15 caracteres");
      return;
    }

    try {
      const response = await supabase.functions.invoke("fiscal-cancelar", {
        body: {
          fiscal_document_id: selectedDocId,
          justificativa: cancelJustificativa,
        },
      });

      if (response.error) {
        toast.error("Erro: " + response.error.message);
        return;
      }

      toast.success("✅ Documento cancelado com sucesso!");
      setCancelDialogOpen(false);
      setCancelJustificativa("");
      setSelectedDocId(null);
      loadDocuments();
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    }
  }

  async function reemitirDocumento(doc: FiscalDocument) {
    try {
      const response = await supabase.functions.invoke("fiscal-emitir", {
        body: { pedido_id: doc.pedido_id, tipo: doc.tipo },
      });

      if (response.error) {
        toast.error("Erro: " + response.error.message);
        return;
      }

      const data: any = response.data;
      if (data?.codigo_status === "100" || data?.status === "autorizada") {
        toast.success(`✅ ${doc.tipo} reemitida com sucesso!`);
        loadDocuments();
      } else {
        toast.error(`❌ Rejeitada: ${data?.motivo_status || data?.status}`);
      }
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    }
  }

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.chave_acesso?.includes(searchTerm) ||
      String(doc.numero).includes(searchTerm)
  );

  return (
    <div className="space-y-4">
      {!anyEnabled && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          ⚠️ Emissão fiscal desabilitada. Ative NF-e/NFC-e em <b>Empresa → Fiscal → Credenciais técnicas</b> para liberar as funções.
        </div>
      )}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">📄 Documentos Fiscais</h2>
          <p className="text-sm text-muted-foreground">
            Histórico de emissões de NFCe e NFe
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={inutilizarOpen} onOpenChange={setInutilizarOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-orange-500 border-orange-200">
                <Ban className="h-4 w-4 mr-2" />
                Inutilizar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Inutilizar Numeração</DialogTitle>
                <DialogDescription>
                  Inutilize uma faixa de números de NFCe ou NFe que não serão utilizados.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo</Label>
                    <Select
                      value={inutilizarData.tipo}
                      onValueChange={(v) =>
                        setInutilizarData({ ...inutilizarData, tipo: v as "NFCE" | "NFE" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NFCE">NFCe</SelectItem>
                        <SelectItem value="NFE">NFe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Série</Label>
                    <Input
                      type="number"
                      value={inutilizarData.serie}
                      onChange={(e) =>
                        setInutilizarData({ ...inutilizarData, serie: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <Label>Número Inicial</Label>
                    <Input
                      type="number"
                      value={inutilizarData.numero_inicial}
                      onChange={(e) =>
                        setInutilizarData({ ...inutilizarData, numero_inicial: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <Label>Número Final</Label>
                    <Input
                      type="number"
                      value={inutilizarData.numero_final}
                      onChange={(e) =>
                        setInutilizarData({ ...inutilizarData, numero_final: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label>Justificativa (mínimo 15 caracteres)</Label>
                  <Input
                    value={inutilizarData.justificativa}
                    onChange={(e) =>
                      setInutilizarData({ ...inutilizarData, justificativa: e.target.value })
                    }
                    placeholder="Descreva o motivo da inutilização..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInutilizarOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={inutilizarNumeros} disabled={inutilizarLoading}>
                  {inutilizarLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Confirmar Inutilização
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={loadDocuments} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Atualizar
          </Button>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, chave ou número..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={filters.status}
          onValueChange={(v) => setFilters({ ...filters, status: v })}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            <SelectItem value="autorizada">Autorizada</SelectItem>
            <SelectItem value="rejeitada">Rejeitada</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.tipo}
          onValueChange={(v) => setFilters({ ...filters, tipo: v })}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            <SelectItem value="NFCE">NFCe</SelectItem>
            <SelectItem value="NFE">NFe</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-5 gap-3">
        <div className="bg-muted/50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold">{totalizadores.total}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg text-center border border-green-200">
          <div className="text-2xl font-bold text-green-600">{totalizadores.autorizadas}</div>
          <div className="text-xs text-muted-foreground">Autorizadas</div>
        </div>
        <div className="bg-red-50 p-3 rounded-lg text-center border border-red-200">
          <div className="text-2xl font-bold text-red-600">{totalizadores.rejeitadas}</div>
          <div className="text-xs text-muted-foreground">Rejeitadas</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-200">
          <div className="text-2xl font-bold text-gray-600">{totalizadores.canceladas}</div>
          <div className="text-xs text-muted-foreground">Canceladas</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg text-center border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-600">{totalizadores.pendentes}</div>
          <div className="text-xs text-muted-foreground">Pendentes</div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Série/Nº</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Ambiente</TableHead>
              <TableHead>Emitido em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Nenhum documento fiscal encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.tipo}</TableCell>
                  <TableCell>
                    {doc.serie}/{doc.numero}
                  </TableCell>
                  <TableCell>{getStatusBadge(doc.status)}</TableCell>
                  <TableCell className="max-w-[150px] truncate" title={doc.cliente_nome || ""}>
                    {doc.cliente_nome || "-"}
                  </TableCell>
                  <TableCell>{formatCurrency(doc.valor_total)}</TableCell>
                  <TableCell>{getAmbienteBadge(doc.ambiente)}</TableCell>
                  <TableCell className="text-sm">
                    {formatDate(doc.emitido_em || doc.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 flex-wrap">
                      {doc.status === "autorizada" && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => visualizarDanfe(doc.id)}
                            disabled={visualizandoId === doc.id}
                            title="Visualizar DANFE"
                          >
                            {visualizandoId === doc.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => imprimirDanfe(doc.id)}
                            disabled={visualizandoId === doc.id}
                            title="Imprimir DANFE"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => baixarArquivo(doc.id, "xml")} title="XML">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500"
                            onClick={() => {
                              setSelectedDocId(doc.id);
                              setCancelDialogOpen(true);
                            }}
                            title="Cancelar"
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {doc.status === "rejeitada" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-500"
                          onClick={() => reemitirDocumento(doc)}
                          title={
                            (doc.tipo === "NFE" && !nfeEnabled) || (doc.tipo === "NFCE" && !nfceEnabled)
                              ? "Emissão desabilitada nas configurações fiscais"
                              : "Reemitir"
                          }
                          disabled={(doc.tipo === "NFE" && !nfeEnabled) || (doc.tipo === "NFCE" && !nfceEnabled)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center text-sm text-muted-foreground border-t pt-4">
        <span>Total de documentos: {filteredDocuments.length}</span>
        <span>Valor total: {formatCurrency(totalizadores.valor_total)}</span>
      </div>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Documento Fiscal</DialogTitle>
            <DialogDescription>
              Informe a justificativa para o cancelamento da nota fiscal.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Justificativa (mínimo 15 caracteres)</Label>
            <Input
              value={cancelJustificativa}
              onChange={(e) => setCancelJustificativa(e.target.value)}
              placeholder="Descreva o motivo do cancelamento..."
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={cancelarDocumento}>
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

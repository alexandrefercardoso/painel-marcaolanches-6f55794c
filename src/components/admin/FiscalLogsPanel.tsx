// src/components/admin/FiscalLogsPanel.tsx
// Painel de Logs Fiscais

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, RefreshCw, Search, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface FiscalLog {
  id: string;
  evento: string;
  tipo: string;
  pedido_id: string;
  status: string;
  mensagem: string;
  detalhes: any;
  usuario_nome: string;
  created_at: string;
  doc_tipo: string;
  doc_serie: number;
  doc_numero: number;
  doc_chave: string;
  doc_cliente: string;
}

const ALL = "all";

export function FiscalLogsPanel() {
  const [logs, setLogs] = useState<FiscalLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ tipo: ALL, status: ALL });
  const [selectedLog, setSelectedLog] = useState<FiscalLog | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  async function loadLogs() {
    setLoading(true);
    let query: any = (supabase as any)
      .from("fiscal_logs_view")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (filters.tipo && filters.tipo !== ALL) query = query.eq("tipo", filters.tipo);
    if (filters.status && filters.status !== ALL) query = query.eq("status", filters.status);

    const { data, error } = await query;

    if (error) {
      toast.error("Erro ao carregar logs: " + error.message);
    } else {
      setLogs((data as FiscalLog[]) || []);
    }
    setLoading(false);
  }

  async function clearLogs() {
    setLoading(true);
    const { error } = await (supabase as any)
      .from("fiscal_logs")
      .delete()
      .not("id", "is", null);
    if (error) {
      toast.error("Erro ao limpar logs: " + error.message);
    } else {
      toast.success("Logs excluídos com sucesso");
      setLogs([]);
    }
    setLoading(false);
  }

  function getTipoBadge(tipo: string) {
    const styles: Record<string, string> = {
      NFCE: "bg-blue-500 text-white",
      NFE: "bg-indigo-500 text-white",
      INUTILIZACAO: "bg-orange-500 text-white",
      CANCELAMENTO: "bg-red-500 text-white",
      ERRO: "bg-red-700 text-white",
    };
    return <Badge className={styles[tipo] || "bg-gray-500"}>{tipo}</Badge>;
  }

  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      sucesso: "bg-green-500 text-white",
      erro: "bg-red-500 text-white",
      pendente: "bg-yellow-500 text-white",
      autorizada: "bg-green-500 text-white",
      rejeitada: "bg-red-500 text-white",
      cancelada: "bg-gray-500 text-white",
      inutilizada: "bg-gray-400 text-white",
    };
    return <Badge className={styles[status] || "bg-gray-500"}>{status}</Badge>;
  }

  function formatDate(dateStr: string): string {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return (
      date.toLocaleDateString("pt-BR") +
      " " +
      date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    );
  }

  const filteredLogs = logs.filter(
    (log) =>
      log.evento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.mensagem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.doc_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.doc_chave?.includes(searchTerm)
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">📋 Logs Fiscais</h2>
          <p className="text-sm text-muted-foreground">
            Histórico de todas as operações fiscais realizadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadLogs} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Atualizar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={loading || logs.length === 0}>
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Logs
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Limpar todos os logs fiscais?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação excluirá permanentemente todos os registros da tabela de logs fiscais. Não é possível desfazer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={clearLogs}>Excluir tudo</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por evento, mensagem, cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filters.tipo} onValueChange={(v) => setFilters({ ...filters, tipo: v })}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            <SelectItem value="NFCE">NFCe</SelectItem>
            <SelectItem value="NFE">NFe</SelectItem>
            <SelectItem value="INUTILIZACAO">Inutilização</SelectItem>
            <SelectItem value="CANCELAMENTO">Cancelamento</SelectItem>
            <SelectItem value="ERRO">Erros</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            <SelectItem value="sucesso">Sucesso</SelectItem>
            <SelectItem value="erro">Erro</SelectItem>
            <SelectItem value="autorizada">Autorizada</SelectItem>
            <SelectItem value="rejeitada">Rejeitada</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
            <SelectItem value="inutilizada">Inutilizada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Mensagem</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Usuário</TableHead>
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
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Nenhum log encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm whitespace-nowrap">{formatDate(log.created_at)}</TableCell>
                  <TableCell className="font-medium max-w-[150px] truncate" title={log.evento}>
                    {log.evento}
                  </TableCell>
                  <TableCell>{getTipoBadge(log.tipo)}</TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={log.mensagem}>
                    {log.mensagem || "-"}
                  </TableCell>
                  <TableCell>
                    {log.doc_tipo && log.doc_numero ? (
                      <span className="text-sm">
                        {log.doc_tipo} {log.doc_serie}/{log.doc_numero}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="max-w-[100px] truncate" title={log.usuario_nome || ""}>
                    {log.usuario_nome || "Sistema"}
                  </TableCell>
                  <TableCell className="text-right">
                    {log.detalhes && Object.keys(log.detalhes).length > 0 && (
                      <Dialog
                        open={detailOpen && selectedLog?.id === log.id}
                        onOpenChange={(open) => {
                          setDetailOpen(open);
                          if (!open) setSelectedLog(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedLog(log);
                              setDetailOpen(true);
                            }}
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Detalhes do Log</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div><strong>Evento:</strong> {selectedLog?.evento}</div>
                              <div><strong>Tipo:</strong> {selectedLog?.tipo}</div>
                              <div><strong>Status:</strong> {selectedLog?.status}</div>
                              <div><strong>Data:</strong> {selectedLog && formatDate(selectedLog.created_at)}</div>
                              <div><strong>Usuário:</strong> {selectedLog?.usuario_nome || "Sistema"}</div>
                              {selectedLog?.doc_tipo && (
                                <div>
                                  <strong>Documento:</strong> {selectedLog.doc_tipo} {selectedLog.doc_serie}/
                                  {selectedLog.doc_numero}
                                </div>
                              )}
                              {selectedLog?.doc_chave && (
                                <div className="col-span-2">
                                  <strong>Chave:</strong>{" "}
                                  <span className="break-all">{selectedLog.doc_chave}</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <strong>Mensagem:</strong>
                              <p className="text-sm bg-muted p-2 rounded mt-1">{selectedLog?.mensagem || "-"}</p>
                            </div>
                            {selectedLog?.detalhes && (
                              <div>
                                <strong>Detalhes:</strong>
                                <pre className="text-sm bg-muted p-2 rounded mt-1 overflow-auto max-h-60 whitespace-pre-wrap">
                                  {JSON.stringify(selectedLog.detalhes, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center text-sm text-muted-foreground border-t pt-4">
        <span>Total de logs: {filteredLogs.length}</span>
        <span>Últimos 100 registros</span>
      </div>
    </div>
  );
}

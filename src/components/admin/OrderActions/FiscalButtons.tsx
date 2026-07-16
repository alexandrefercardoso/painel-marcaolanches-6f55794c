// src/components/admin/OrderActions/FiscalButtons.tsx
// Botões de Emissão Fiscal nos Pedidos
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, lazy, Suspense } from "react";

const DanfePreviewModal = lazy(() => import("@/components/fiscal/DanfePreviewModal"));

import { useFiscalEnabled } from "@/hooks/useFiscalEnabled";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  FileText,
  Loader2,
  Download,
  Ban,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Printer,
  Eye,
} from "lucide-react";

interface FiscalButtonsProps {
  orderId: string;
  orderStatus: string;
  hasDocument: boolean;
  documentType?: string;
  documentId?: string;
  documentStatus?: string;
  onEmit: () => void;
}

type DiagnosticStatus = "ok" | "warning" | "error";

type DiagnosticItem = {
  status: DiagnosticStatus;
  title: string;
  detail: string;
  action?: string;
};

export function FiscalButtons({
  orderId,
  orderStatus,
  hasDocument,
  documentType,
  documentId,
  documentStatus,
  onEmit,
}: FiscalButtonsProps) {
  const [loading, setLoading] = useState(false);
  const { nfeEnabled, nfceEnabled } = useFiscalEnabled();
  const [visualizando, setVisualizando] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelJustificativa, setCancelJustificativa] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [showAllDiagnostics, setShowAllDiagnostics] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsSearch, setLogsSearch] = useState("");
  const [logsDateFrom, setLogsDateFrom] = useState("");
  const [logsDateTo, setLogsDateTo] = useState("");
  const [logsTimeFrom, setLogsTimeFrom] = useState("");
  const [logsTimeTo, setLogsTimeTo] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [jsonLog, setJsonLog] = useState<any | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTipo, setPreviewTipo] = useState<"NFCE" | "NFE">("NFCE");


  async function carregarLogs() {
    setLogsLoading(true);
    try {
      const { data, error } = await (supabase
        .from("fiscal_error_logs" as any)
        .select("id,created_at,tipo,titulo,mensagem,diagnostics,raw")
        .eq("pedido_id", orderId)
        .order("created_at", { ascending: false })
        .limit(100) as any);
      if (error) {
        toast.error("Erro ao carregar logs: " + error.message);
        setLogs([]);
      } else {
        setLogs(data || []);
      }
    } catch (e: any) {
      toast.error("Erro ao carregar logs: " + e.message);
    } finally {
      setLogsLoading(false);
    }
  }

  async function limparLogs() {
    if (!confirm("Excluir todos os logs fiscais deste pedido? Esta ação não pode ser desfeita.")) return;
    setLogsLoading(true);
    try {
      const { error } = await (supabase
        .from("fiscal_error_logs" as any)
        .delete()
        .eq("pedido_id", orderId) as any);
      if (error) {
        toast.error("Erro ao limpar logs: " + error.message);
      } else {
        setLogs([]);
        toast.success("Logs excluídos");
      }
    } catch (e: any) {
      toast.error("Erro ao limpar logs: " + e.message);
    } finally {
      setLogsLoading(false);
    }
  }

  async function abrirLogs() {
    setLogsOpen(true);
    await carregarLogs();
  }

  const filteredLogs = logs.filter((log) => {
    const dt = log.created_at ? new Date(log.created_at) : null;
    if (dt) {
      const ymd = dt.toISOString().slice(0, 10);
      const hm = dt.toTimeString().slice(0, 5);
      if (logsDateFrom && ymd < logsDateFrom) return false;
      if (logsDateTo && ymd > logsDateTo) return false;
      if (logsTimeFrom && hm < logsTimeFrom) return false;
      if (logsTimeTo && hm > logsTimeTo) return false;
    }
    if (!logsSearch.trim()) return true;
    const q = logsSearch.toLowerCase();
    return [
      log.titulo,
      log.tipo,
      log.mensagem,
      log.raw,
      JSON.stringify(log.diagnostics || {}),
    ]
      .filter(Boolean)
      .some((v: string) => String(v).toLowerCase().includes(q));
  });

  async function gravarErro(
    titulo: string,
    message: string,
    raw?: string,
    diagnostics?: DiagnosticItem[],
    tipo?: string,
  ) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      await (supabase.from("fiscal_error_logs" as any).insert({
        pedido_id: orderId,
        tipo: tipo || null,
        titulo,
        mensagem: message,
        diagnostics: diagnostics ? (diagnostics as any) : null,
        raw: raw || null,
        usuario_id: userData?.user?.id || null,
      }) as any);
    } catch {
      // ignora falha de gravação para não esconder o erro original
    }
  }


  const [errorDetails, setErrorDetails] = useState<{
    title: string;
    message: string;
    raw?: string;
    diagnostics?: DiagnosticItem[];
  }>({
    title: "",
    message: "",
  });

  function addDiagnostic(
    list: DiagnosticItem[],
    status: DiagnosticStatus,
    title: string,
    detail: string,
    action?: string,
  ) {
    list.push({ status, title, detail, action });
  }

  function isFilled(value: unknown) {
    return value !== null && value !== undefined && String(value).trim() !== "";
  }

  function validNcm(value: unknown) {
    return String(value || "").replace(/\D/g, "").length === 8;
  }

  function isFunctionFetchError(error: any) {
    const text = `${error?.name || ""} ${error?.message || ""}`;
    return text.includes("FunctionsFetchError") || text.includes("Failed to send a request");
  }

  async function getFunctionErrorMessage(error: any) {
    const response = error?.context;
    if (response?.clone) {
      try {
        const payload = await response.clone().json();
        return payload?.error || payload?.message || JSON.stringify(payload);
      } catch {
        try {
          const text = await response.clone().text();
          if (text) return text;
        } catch {
          // mantém mensagem padrão abaixo
        }
      }
    }
    return error?.message || "erro desconhecido";
  }

  async function buildFiscalDiagnostics(tipo: "NFCE" | "NFE"): Promise<DiagnosticItem[]> {
    const diagnostics: DiagnosticItem[] = [];

    try {
      const { data: settings, error: settingsError } = await (supabase
        .from("store_settings" as any)
        .select("*")
        .limit(1)
        .maybeSingle() as any);

      if (settingsError || !settings) {
        addDiagnostic(
          diagnostics,
          "error",
          "Configuração da empresa",
          settingsError?.message || "Nenhuma linha encontrada em store_settings.",
          "Preencha os dados fiscais da empresa antes de emitir a nota.",
        );
      } else {
        const missingCompany = [
          ["CNPJ", settings.cnpj],
          ["Razão social/nome", settings.razao_social || settings.name],
          ["UF", settings.state],
          ["Código do município", settings.cod_municipio],
          [`Série ${tipo}`, tipo === "NFCE" ? settings.serie_nfce : settings.serie_nfe],
          ["Client ID fiscal", settings.client_id_fiscal],
          ["Client Secret fiscal", settings.client_secret_fiscal],
        ].filter(([, value]) => !isFilled(value));

        addDiagnostic(
          diagnostics,
          missingCompany.length ? "error" : "ok",
          "Configuração da empresa",
          missingCompany.length
            ? `Campos faltando: ${missingCompany.map(([label]) => label).join(", ")}.`
            : "Dados fiscais principais encontrados.",
          missingCompany.length
            ? "Abra Empresa/Fiscal e complete os campos obrigatórios."
            : undefined,
        );
      }

      const { data: noteConfig, error: noteConfigError } = await (supabase
        .from("fiscal_note_config" as any)
        .select("*")
        .eq("active", true)
        .limit(1)
        .maybeSingle() as any);

      addDiagnostic(
        diagnostics,
        noteConfigError || !noteConfig ? "error" : "ok",
        "Configuração da nota fiscal",
        noteConfigError?.message ||
          (noteConfig
            ? "Configuração fiscal ativa encontrada."
            : "Nenhuma configuração ativa em fiscal_note_config."),
        noteConfigError || !noteConfig ? "Ative uma configuração fiscal para NFCe/NFe." : undefined,
      );

      const { data: endpoints, error: endpointsError } = await (supabase
        .from("fiscal_api_endpoints" as any)
        .select("*")
        .eq("active", true) as any);

      if (endpointsError || !Array.isArray(endpoints)) {
        addDiagnostic(
          diagnostics,
          "error",
          "Endpoints fiscais",
          endpointsError?.message || "Não foi possível ler fiscal_api_endpoints.",
          "Confira se os endpoints de autenticação e emissão estão cadastrados.",
        );
      } else {
        const keys = new Set(endpoints.map((endpoint: any) => endpoint.chave));
        const needed = ["auth", tipo === "NFCE" ? "nfce_emitir" : "nfe_emitir"];
        const missing = needed.filter((key) => !keys.has(key));
        addDiagnostic(
          diagnostics,
          missing.length ? "error" : "ok",
          "Endpoints fiscais",
          missing.length
            ? `Endpoints ativos faltando: ${missing.join(", ")}.`
            : "Endpoints de autenticação e emissão encontrados.",
          missing.length ? "Cadastre/ative os endpoints em Fiscal > Endpoints da API." : undefined,
        );
      }

      const { data: order, error: orderError } = await (supabase
        .from("delivery_orders" as any)
        .select("id,status,tipo_venda,total")
        .eq("id", orderId)
        .maybeSingle() as any);

      if (orderError || !order) {
        addDiagnostic(
          diagnostics,
          "error",
          "Pedido",
          orderError?.message || "Pedido não encontrado.",
          "Reabra a tela de pedidos e tente novamente.",
        );
      } else {
        addDiagnostic(
          diagnostics,
          order.status === "delivered" ? "ok" : "error",
          "Pedido",
          order.status === "delivered"
            ? "Pedido finalizado/pago."
            : `Status atual: ${order.status || "sem status"}.`,
          order.status === "delivered"
            ? undefined
            : "Finalize/pague o pedido antes de emitir a nota.",
        );
      }

      const { data: items, error: itemsError } = await (supabase
        .from("delivery_order_items" as any)
        .select(
          "id,product_id,quantity,unit_price,total_price,product:products(id,name,description,ncm,tax_rule_id,active)",
        )
        .eq("order_id", orderId) as any);

      if (itemsError || !Array.isArray(items) || items.length === 0) {
        addDiagnostic(
          diagnostics,
          "error",
          "Cardápio/itens do pedido",
          itemsError?.message || "O pedido não possui itens para emitir a nota.",
          "Confira se o pedido tem produtos vinculados ao cardápio.",
        );
        return diagnostics;
      }

      const productIssues = items.flatMap((item: any) => {
        const product = item.product || {};
        const name = product.name || product.description || item.product_id || "produto sem nome";
        const issues: string[] = [];
        if (!product.id) issues.push(`${name}: produto não encontrado`);
        if (!validNcm(product.ncm)) issues.push(`${name}: NCM inválido/ausente`);
        if (!isFilled(product.tax_rule_id)) issues.push(`${name}: perfil de imposto ausente`);
        return issues;
      });

      addDiagnostic(
        diagnostics,
        productIssues.length ? "error" : "ok",
        "Cardápio/itens do pedido",
        productIssues.length
          ? productIssues.slice(0, 6).join("; ")
          : `${items.length} item(ns) com produto, NCM e perfil fiscal vinculados.`,
        productIssues.length ? "Ajuste os produtos do cardápio antes de emitir." : undefined,
      );

      const taxRuleIds = Array.from(
        new Set(
          items.map((item: any) => item.product?.tax_rule_id).filter((id: unknown) => isFilled(id)),
        ),
      );

      if (taxRuleIds.length === 0) {
        addDiagnostic(
          diagnostics,
          "error",
          "Impostos dos produtos",
          "Nenhum produto do pedido possui perfil fiscal vinculado.",
          "Vincule um perfil fiscal em cada produto do cardápio.",
        );
        return diagnostics;
      }

      const { data: taxRules, error: taxRulesError } = await (supabase
        .from("product_tax_rules_view" as any)
        .select("*")
        .in("id", taxRuleIds) as any);

      if (taxRulesError || !Array.isArray(taxRules)) {
        addDiagnostic(
          diagnostics,
          "error",
          "Impostos dos produtos",
          taxRulesError?.message || "Não foi possível ler product_tax_rules_view.",
          "Confira se a view product_tax_rules_view existe e está acessível pelo app.",
        );
        return diagnostics;
      }

      const taxRuleMap = new Map(taxRules.map((rule: any) => [String(rule.id), rule]));
      const taxIssues = items.flatMap((item: any) => {
        const product = item.product || {};
        const name = product.name || product.description || item.product_id || "produto sem nome";
        const rule = taxRuleMap.get(String(product.tax_rule_id));
        const issues: string[] = [];
        if (!rule) {
          issues.push(`${name}: perfil fiscal não encontrado na view`);
          return issues;
        }
        if (rule.active === false) issues.push(`${name}: perfil fiscal inativo`);
        if (!isFilled(rule.cfop || rule.cfop_estadual)) issues.push(`${name}: CFOP ausente`);
        if (!isFilled(rule.cst_icms_estadual)) issues.push(`${name}: CST/CSOSN ICMS ausente`);
        if (!isFilled(rule.cst_pis)) issues.push(`${name}: CST PIS ausente`);
        if (!isFilled(rule.cst_cofins)) issues.push(`${name}: CST COFINS ausente`);
        return issues;
      });

      addDiagnostic(
        diagnostics,
        taxIssues.length ? "error" : "ok",
        "Impostos dos produtos",
        taxIssues.length
          ? taxIssues.slice(0, 6).join("; ")
          : `${taxRules.length} perfil(is) fiscal(is) válido(s) encontrados na view.`,
        taxIssues.length ? "Complete CFOP, ICMS, PIS e COFINS nos perfis fiscais." : undefined,
      );
    } catch (diagnosticError: any) {
      addDiagnostic(
        diagnostics,
        "warning",
        "Diagnóstico automático",
        diagnosticError?.message || "Não foi possível concluir o diagnóstico automático.",
      );
    }

    return diagnostics;
  }

  async function extractEdgeError(
    error: any,
    data: any,
  ): Promise<{ message: string; raw: string }> {
    let raw = "";
    let message = error?.message || "Erro desconhecido";
    if (isFunctionFetchError(error)) {
      message =
        "Não foi possível acessar a função fiscal. Veja abaixo o diagnóstico de configuração, cardápio e impostos.";
    }
    try {
      if (error?.context && typeof error.context.text === "function") {
        const body = await error.context.text();
        raw = body;
        try {
          const parsed = JSON.parse(body);
          message = parsed.error || parsed.message || parsed.motivo_status || message;
        } catch {
          if (body) message = body.slice(0, 300);
        }
      } else if (data) {
        raw = JSON.stringify(data, null, 2);
      }
    } catch (e: any) {
      raw = `Falha ao ler corpo do erro: ${e.message}`;
    }
    if (!raw)
      raw = JSON.stringify(
        { error: error?.message, name: error?.name, stack: error?.stack },
        null,
        2,
      );
    return { message, raw };
  }

  function showError(title: string, message: string, raw?: string, diagnostics?: DiagnosticItem[]) {
    setErrorDetails({ title, message, raw, diagnostics });
    setErrorDialogOpen(true);
    toast.error(message);
    const tipoMatch = title.match(/NFCE|NFE/i);
    void gravarErro(title, message, raw, diagnostics, tipoMatch ? tipoMatch[0].toUpperCase() : undefined);
  }


  async function visualizarDanfe() {
    if (!documentId) {
      toast.error("Documento não identificado");
      return;
    }
    setVisualizando(true);
    try {
      const response = await supabase.functions.invoke("fiscal-visualizar", {
        body: { fiscal_document_id: documentId, acao: "visualizar" },
      });
      if (response.error) {
        toast.error("Erro: " + response.error.message);
        return;
      }
      const pdfBase64 = (response.data as any).content;
      const blob = new Blob([Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0))], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    } finally {
      setVisualizando(false);
    }
  }

  async function imprimirDanfe() {
    if (!documentId) {
      toast.error("Documento não identificado");
      return;
    }
    try {
      const response = await supabase.functions.invoke("fiscal-visualizar", {
        body: { fiscal_document_id: documentId, acao: "imprimir" },
      });
      if (response.error) {
        toast.error("Erro: " + response.error.message);
        return;
      }
      const pdfBase64 = (response.data as any).content;
      const blob = new Blob([Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0))], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank");
      win?.print();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    }
  }

  async function emitirNota(tipo: "NFCE" | "NFE") {
    if (orderStatus !== "delivered") {
      toast.error("Pedido não finalizado/pago");
      return;
    }

    setLoading(true);
    try {
      const response = await supabase.functions.invoke("fiscal-emitir", {
        body: { pedido_id: orderId, tipo },
      });

      if (response.error) {
        const { message, raw } = await extractEdgeError(response.error, response.data);
        const diagnostics = await buildFiscalDiagnostics(tipo);
        if (isFunctionFetchError(response.error)) {
          addDiagnostic(
            diagnostics,
            "error",
            "Comunicação com a função fiscal",
            "O navegador não conseguiu concluir a chamada para fiscal-emitir. Isso costuma indicar falha de rede, CORS, função indisponível ou bloqueio antes da resposta chegar ao app.",
            "Tente novamente após recarregar a página. Se persistir, verifique se a função fiscal está implantada e respondendo.",
          );
        }
        showError(`Falha ao emitir ${tipo}`, message, raw, diagnostics);
        setLoading(false);
        return;
      }

      const data: any = response.data;
      if (data?.codigo_status === "100" || data?.status === "autorizada") {
        toast.success(`✅ ${tipo} autorizada! Chave: ${data.chave}`);
        onEmit();
      } else {
        showError(
          `${tipo} rejeitada pela SEFAZ`,
          `${data?.codigo_status || ""} - ${data?.motivo_status || data?.status || "Motivo não informado"}`,
          JSON.stringify(data, null, 2),
        );
      }
    } catch (error: any) {
      const { message, raw } = await extractEdgeError(error, null);
      const diagnostics = await buildFiscalDiagnostics(tipo);
      if (isFunctionFetchError(error)) {
        addDiagnostic(
          diagnostics,
          "error",
          "Comunicação com a função fiscal",
          "O navegador não conseguiu concluir a chamada para fiscal-emitir. Isso costuma indicar falha de rede, CORS, função indisponível ou bloqueio antes da resposta chegar ao app.",
          "Tente novamente após recarregar a página. Se persistir, verifique se a função fiscal está implantada e respondendo.",
        );
      }
      showError(`Falha ao emitir ${tipo}`, message, raw, diagnostics);
    }
    setLoading(false);
  }

  async function baixarArquivo(tipo: "xml" | "pdf") {
    if (!documentId) {
      toast.error("Documento não identificado");
      return;
    }

    try {
      const response = await supabase.functions.invoke("fiscal-baixar", {
        body: { fiscal_document_id: documentId, tipo_arquivo: tipo },
      });

      if (response.error) {
        toast.error("Erro: " + response.error.message);
        return;
      }

      const data: any = response.data;
      const link = document.createElement("a");
      link.href = `data:application/${tipo === "xml" ? "xml" : "pdf"};base64,${data.content}`;
      link.download = data.filename || `${documentId}.${tipo}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Download iniciado");
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    }
  }

  async function cancelarNota() {
    if (!documentId) {
      toast.error("Documento não identificado");
      return;
    }

    if (cancelJustificativa.length < 15) {
      toast.error("Justificativa deve ter no mínimo 15 caracteres");
      return;
    }

    setLoading(true);
    try {
      const response = await supabase.functions.invoke("fiscal-cancelar", {
        body: {
          fiscal_document_id: documentId,
          justificativa: cancelJustificativa,
        },
      });

      if (response.error) {
        toast.error("Erro: " + response.error.message);
        return;
      }

      toast.success("✅ Nota cancelada com sucesso!");
      setCancelDialogOpen(false);
      setCancelJustificativa("");
      onEmit();
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    }
    setLoading(false);
  }

  async function reemitirNota() {
    if (!documentType) return;
    await emitirNota(documentType as "NFCE" | "NFE");
  }

  const ErrorDialog = (() => {
    const diagnostics = errorDetails.diagnostics || [];
    const problems = diagnostics.filter((d) => d.status !== "ok");
    const okCount = diagnostics.length - problems.length;
    const visible = showAllDiagnostics ? diagnostics : problems;
    return (
      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto p-4 gap-3">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-destructive flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4" />
              {errorDetails.title || "Erro"}
            </DialogTitle>
            <DialogDescription className="text-xs">{errorDetails.message}</DialogDescription>
          </DialogHeader>
          {diagnostics.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">
                  {problems.length > 0
                    ? `${problems.length} problema(s) encontrado(s)`
                    : "Tudo configurado"}
                </span>
                {okCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAllDiagnostics((v) => !v)}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    {showAllDiagnostics ? "Ocultar OK" : `Ver ${okCount} OK`}
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {visible.map((item, index) => (
                  <div
                    key={`${item.title}-${index}`}
                    className="rounded border px-2 py-1.5 text-xs"
                  >
                    <div className="flex items-start gap-1.5">
                      {item.status === "ok" ? (
                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      ) : item.status === "warning" ? (
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      ) : (
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium leading-tight">{item.title}</p>
                        <p className="text-muted-foreground leading-snug">{item.detail}</p>
                        {item.action && item.status !== "ok" && (
                          <p className="mt-0.5 text-[11px] font-medium text-foreground/80">
                            → {item.action}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {errorDetails.raw && (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Detalhes técnicos
              </summary>
              <pre className="mt-1 max-h-40 overflow-auto rounded border bg-muted p-2 text-[11px] whitespace-pre-wrap break-all">
                {errorDetails.raw}
              </pre>
            </details>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${errorDetails.title}\n${errorDetails.message}\n\n${errorDetails.raw || ""}`,
                );
                toast.success("Erro copiado");
              }}
            >
              Copiar
            </Button>
            <Button size="sm" onClick={() => setErrorDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  })();

  const LogsDialog = (
    <Dialog open={logsOpen} onOpenChange={setLogsOpen}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-4 gap-3">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Logs fiscais do pedido
          </DialogTitle>
          <DialogDescription className="text-xs">
            Últimos 100 eventos registrados para este pedido.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Pesquisar (evento, status, mensagem, JSON)..."
            value={logsSearch}
            onChange={(e) => setLogsSearch(e.target.value)}
            className="h-8 text-xs"
          />
          <Button size="sm" variant="outline" onClick={carregarLogs} disabled={logsLoading}>
            {logsLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Atualizar"}
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-muted-foreground">Data de</label>
            <Input type="date" value={logsDateFrom} onChange={(e) => setLogsDateFrom(e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-muted-foreground">Data até</label>
            <Input type="date" value={logsDateTo} onChange={(e) => setLogsDateTo(e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-muted-foreground">Hora de</label>
            <Input type="time" value={logsTimeFrom} onChange={(e) => setLogsTimeFrom(e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-muted-foreground">Hora até</label>
            <Input type="time" value={logsTimeTo} onChange={(e) => setLogsTimeTo(e.target.value)} className="h-8 text-xs" />
          </div>
          {(logsDateFrom || logsDateTo || logsTimeFrom || logsTimeTo) && (
            <Button
              size="sm"
              variant="ghost"
              className="col-span-2 sm:col-span-4 h-7 text-xs justify-self-start"
              onClick={() => {
                setLogsDateFrom("");
                setLogsDateTo("");
                setLogsTimeFrom("");
                setLogsTimeTo("");
              }}
            >
              Limpar filtros
            </Button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {logsLoading ? (
            <p className="text-xs text-muted-foreground">Carregando...</p>
          ) : filteredLogs.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              {logs.length === 0 ? "Nenhum log encontrado para este pedido." : "Nenhum resultado."}
            </p>
          ) : (
            filteredLogs.map((log) => {
              const diagArr: any[] = Array.isArray(log.diagnostics) ? log.diagnostics : [];
              const problems = diagArr.filter((d) => d?.status && d.status !== "ok").length;
              return (
                <details key={log.id} className="rounded border text-xs">
                  <summary className="cursor-pointer px-2 py-1.5 flex items-start gap-2 hover:bg-muted/50">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{log.titulo || "Erro"}</span>
                        {log.tipo && (
                          <Badge variant="outline" className="text-[10px] py-0">
                            {log.tipo}
                          </Badge>
                        )}
                        {problems > 0 && (
                          <Badge variant="destructive" className="text-[10px] py-0">
                            {problems} problema(s)
                          </Badge>
                        )}
                        <span className="ml-auto text-[10px] text-muted-foreground">
                          {new Date(log.created_at).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      {log.mensagem && (
                        <p className="text-muted-foreground truncate">{log.mensagem}</p>
                      )}
                    </div>
                  </summary>
                  <div className="m-2 space-y-2">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-6 text-[10px] px-2"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setJsonLog(log);
                        }}
                      >
                        Ver JSON completo
                      </Button>
                    </div>
                    {diagArr.length > 0 && (
                      <pre className="max-h-40 overflow-auto rounded bg-muted p-2 text-[11px] whitespace-pre-wrap break-all">
                        {JSON.stringify(diagArr, null, 2)}
                      </pre>
                    )}
                    {log.raw && (
                      <pre className="max-h-60 overflow-auto rounded bg-muted p-2 text-[11px] whitespace-pre-wrap break-all">
                        {log.raw}
                      </pre>
                    )}
                  </div>
                </details>
              );
            })
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-2 flex-wrap sm:flex-wrap sm:justify-end">
          <Button
            size="sm"
            variant="destructive"
            onClick={limparLogs}
            disabled={logsLoading || logs.length === 0}
          >
            Limpar logs
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              const { data, error } = await (supabase as any)
                .from("fiscal_documents")
                .select("tipo,serie,numero,chave_acesso,status,request_json,response_json,emitido_em")
                .eq("pedido_id", orderId)
                .order("emitido_em", { ascending: false })
                .limit(1)
                .maybeSingle();
              if (error || !data) {
                toast.error("Nenhuma NFe/NFCe encontrada para este pedido");
                return;
              }
              setJsonLog({
                _kind: "nfe_payload",
                tipo: data.tipo,
                serie: data.serie,
                numero: data.numero,
                chave: data.chave_acesso,
                status: data.status,
                emitido_em: data.emitido_em,
                request_json: data.request_json,
                response_json: data.response_json,
              });
            }}
          >
            Ver JSON NFe/NFCe
          </Button>
          {(["NFCE", "NFE"] as const).map((t) => (
            <Button
              key={t}
              size="sm"
              variant="outline"
              onClick={async () => {
                const { data, error } = await supabase.functions.invoke("fiscal-emitir", {
                  body: { pedido_id: orderId, tipo: t, preview: true },
                });
                if (error) {
                  const message = await getFunctionErrorMessage(error);
                  toast.error("Erro ao gerar JSON: " + message);
                  setJsonLog({ _kind: "nfe_preview_error", tipo: t, error: message });
                  return;
                }
                const d: any = data;
                if (d?.success === false) {
                  toast.error("Erro ao gerar JSON: " + (d.error || "desconhecido"));
                  return;
                }
                setJsonLog({
                  _kind: "nfe_preview",
                  tipo: d.tipo,
                  serie: d.serie,
                  numero: d.numero,
                  ambiente: d.ambiente,
                  warnings: d.warnings,
                  request_json: d.request_json,
                });
                if (d.warnings?.length) {
                  toast.warning(`JSON gerado com ${d.warnings.length} aviso(s)`);
                } else {
                  toast.success("JSON gerado");
                }
              }}
            >
              Gerar JSON {t} (preview)
            </Button>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(filteredLogs, null, 2));
              toast.success("Logs copiados");
            }}
          >
            Copiar
          </Button>
          <Button size="sm" onClick={() => setLogsOpen(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const JsonLogDialog = (
    <Dialog open={!!jsonLog} onOpenChange={(o) => !o && setJsonLog(null)}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-4 gap-3">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-base">JSON completo do log</DialogTitle>
          <DialogDescription className="text-xs">
            Payload bruto para reproduzir o teste fora do sistema.
          </DialogDescription>
        </DialogHeader>
        <pre className="flex-1 overflow-auto rounded bg-muted p-3 text-[11px] whitespace-pre-wrap break-all">
          {jsonLog ? JSON.stringify(jsonLog, null, 2) : ""}
        </pre>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(jsonLog, null, 2));
              toast.success("JSON copiado");
            }}
          >
            Copiar JSON
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const blob = new Blob([JSON.stringify(jsonLog, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `fiscal-log-${jsonLog?.id || "log"}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Baixar .json
          </Button>
          <Button size="sm" onClick={() => setJsonLog(null)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );


  if (hasDocument && documentStatus === "autorizada") {
    return (
      <>
        <TooltipProvider>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-green-500 text-white gap-1">
              <CheckCircle className="h-3 w-3" />
              {documentType} Emitida ✓
            </Badge>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={() => baixarArquivo("xml")}>
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Baixar XML</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={() => baixarArquivo("pdf")}>
                  <Printer className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Baixar DANFe</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={visualizarDanfe}
                  disabled={visualizando}
                >
                  {visualizando ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Visualizar DANFe</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={imprimirDanfe}>
                  <Printer className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Imprimir DANFe</TooltipContent>
            </Tooltip>

            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-500 border-red-200 hover:bg-red-50"
                >
                  <Ban className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancelar {documentType}</DialogTitle>
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
                  <Button variant="destructive" onClick={cancelarNota} disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Confirmar Cancelamento
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </TooltipProvider>
        {ErrorDialog}
        {LogsDialog}
        {JsonLogDialog}
      </>
    );
  }

  if (hasDocument && documentStatus === "rejeitada") {
    return (
      <>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            {documentType} Rejeitada
          </Badge>

          <Button
            size="sm"
            variant="outline"
            className="text-blue-600 border-blue-200"
            onClick={reemitirNota}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Reemitir
          </Button>
        </div>
        {ErrorDialog}
        {LogsDialog}
        {JsonLogDialog}
      </>
    );
  }

  if (hasDocument && documentStatus === "cancelada") {
    return (
      <>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="gap-1">
            <Ban className="h-3 w-3" />
            {documentType} Cancelada
          </Badge>
        </div>
        {ErrorDialog}
        {LogsDialog}
        {JsonLogDialog}
      </>
    );
  }

  if (orderStatus !== "delivered") {
    return (
      <>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-muted-foreground">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Aguardando finalização
          </Badge>
        </div>
        {ErrorDialog}
        {LogsDialog}
        {JsonLogDialog}
      </>
    );
  }

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant="outline"
          className="text-green-600 border-green-600 hover:bg-green-50"
          onClick={() => emitirNota("NFCE")}
          disabled={loading || !nfceEnabled}
          title={!nfceEnabled ? "NFC-e desabilitada nas configurações fiscais" : undefined}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <FileText className="h-4 w-4 mr-1" />
          )}
          Emitir NFCe
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="text-blue-600 border-blue-600 hover:bg-blue-50"
          onClick={() => emitirNota("NFE")}
          disabled={loading || !nfeEnabled}
          title={!nfeEnabled ? "NF-e desabilitada nas configurações fiscais" : undefined}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <FileText className="h-4 w-4 mr-1" />
          )}
          Emitir NFe
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="text-purple-600 border-purple-600 hover:bg-purple-50"
          onClick={() => {
            setPreviewTipo("NFCE");
            setPreviewOpen(true);
          }}
          title="Pré-visualizar o layout da nota sem emitir na SEFAZ"
        >
          <Eye className="h-4 w-4 mr-1" />
          Pré-visualizar Nota
        </Button>

        <Button size="sm" variant="ghost" onClick={abrirLogs} title="Ver logs de erros">
          <FileText className="h-4 w-4 mr-1" />
          Logs
        </Button>
      </div>
      {ErrorDialog}
        {LogsDialog}
        {JsonLogDialog}
        {previewOpen && (
          <Suspense fallback={null}>
            <DanfePreviewModal
              orderId={orderId}
              tipo={previewTipo}
              open={previewOpen}
              onOpenChange={setPreviewOpen}
            />
          </Suspense>
        )}
    </>
  );
}

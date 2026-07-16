import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Users, Clock, User, DollarSign, Plus, Trash2, Printer, Check, Search, ShoppingCart, CreditCard, Wallet, Banknote, Landmark, Minus, LayoutGrid, FileText, ReceiptText, Hash, Ticket } from "lucide-react";
import { processPrintingForTableOrder, printFullBill, forceTestPrint, printPaymentReceiptForOrder } from "@/lib/table-printing";
import { showCancellationPreview } from "@/lib/cancellation-preview";
import { toSupabaseDateTime } from "@/lib/dateUtils";


interface TableSessionDialogProps {
  table: any;
  session: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TableSessionDialog({ table, session, isOpen, onClose, onSuccess }: TableSessionDialogProps) {
  const user = React.useMemo(() => {
    const sessionStr = localStorage.getItem('admin_session');
    return sessionStr ? JSON.parse(sessionStr) : null;
  }, []);
  const [view, setView] = useState<"opening" | "ordering" | "closing">("opening");
  const [waiters, setWaiters] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [storeSettings, setStoreSettings] = useState<any>(null);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [finCategories, setFinCategories] = useState<any[]>([]);
  const [chartAccounts, setChartAccounts] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>("all");
  const [complementGroups, setComplementGroups] = useState<any[]>([]);
  const [categoryComplementGroups, setCategoryComplementGroups] = useState<any[]>([]);
  const [productComplementGroups, setProductComplementGroups] = useState<any[]>([]);
  const [selectedComplements, setSelectedComplements] = useState<any[]>([]);
  const [complementProduct, setComplementProduct] = useState<any | null>(null);
  const printingRef = useRef(false);

  // Opening form state
  const [openForm, setOpenForm] = useState({
    waiter_id: "",
    customer_id: "none",
    client_name: "",
    people_count: "1",
    comanda_id: "",
    observations: ""
  });

  // Comandas (pool)
  const [availableComandas, setAvailableComandas] = useState<{ id: string; numero: number }[]>([]);
  const [sessionComandas, setSessionComandas] = useState<any[]>([]);
  const [activeComandaId, setActiveComandaId] = useState<string | null>(null);
  const [showNewComandaDialog, setShowNewComandaDialog] = useState(false);
  const [newComandaForm, setNewComandaForm] = useState<{ comanda_id: string; identificacao: string }>({ comanda_id: "", identificacao: "" });
  const [selectedClosingComandaIds, setSelectedClosingComandaIds] = useState<Set<string>>(new Set());

  // Closing form state
  const [payments, setPayments] = useState<{method: string, amount: number}[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [receivingAmount, setReceivingAmount] = useState<number>(0);
  const [discount, setDiscount] = useState(0);
  const [serviceTaxEnabled, setServiceTaxEnabled] = useState(true);

  // Checkout options (comprovante + NFC-e)
  const [checkoutOptionsOpen, setCheckoutOptionsOpen] = useState(false);
  const [optPrintReceipt, setOptPrintReceipt] = useState(true);
  const [optEmitFiscal, setOptEmitFiscal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
      if (session) {
        setView(session.status === 'bill_requested' ? 'closing' : 'ordering');
        setServiceTaxEnabled(true);
      } else {
        setView("opening");
        setOpenForm({
          waiter_id: "",
          customer_id: "none",
          client_name: "",
          people_count: "1",
          comanda_id: "",
          observations: ""
        });
      }
    }
  }, [isOpen, session?.id]); // Only re-run when dialog opens or session ID changes

  useEffect(() => {
    if (view === 'closing') {
      const totals = calculateClosingTotals();
      setReceivingAmount(totals.remaining);
    }
  }, [view, payments.length]);

  const fetchInitialData = async () => {
    const [
      waitersRes, 
      customersRes, 
      productsRes, 
      settingsRes, 
      activeSessionRes, 
      finCatsRes, 
      chartAccountsRes, 
      paymentMethodsRes, 
      categoriesRes,
      compGroupsRes,
      catCompGroupsRes,
      prodCompGroupsRes
    ] = await Promise.all([
      supabase.from("waiters").select("*").eq("active", true),
      supabase.from("customers").select("*"),
      supabase.from("products").select("*").eq("active", true),
      supabase.from("store_settings").select("*").single(),
      supabase.from("cashier_sessions").select("*").eq("status", "open").maybeSingle(),
      supabase.from("financial_categories").select("*"),
      supabase.from("chart_of_accounts").select("*"),
      supabase.from("payment_methods").select("*"),
      supabase.from("categories").select("*").order("name"),
      supabase.from("complement_groups").select("*, complements(*)"),
      supabase.from("category_complement_groups").select("*"),
      supabase.from("product_complement_groups").select("*")
    ]);
    
    setActiveSession(activeSessionRes.data);



    setWaiters(waitersRes.data || []);
    setCustomers(customersRes.data || []);
    setProducts(productsRes.data || []);
    setStoreSettings(settingsRes.data);
    setFinCategories(finCatsRes.data || []);
    setChartAccounts(chartAccountsRes.data || []);
    setPaymentMethods(paymentMethodsRes.data || []);
    const sortedCategories = (categoriesRes.data || []).sort((a: any, b: any) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA.includes('lanche')) return -1;
      if (nameB.includes('lanche')) return 1;
      return nameA.localeCompare(nameB);
    });

    setCategories(sortedCategories);
    setComplementGroups(compGroupsRes.data || []);
    setCategoryComplementGroups(catCompGroupsRes.data || []);
    setProductComplementGroups(prodCompGroupsRes.data || []);

    if (session?.id) {
      const { data: items } = await supabase.from("table_order_items").select("id, product_id, product_name, quantity, unit_price, total_price, status, production_status, observations, waiter_id, printed, session_id, selected_complements, comanda_id").eq("session_id", session.id);
      setOrderItems(items || []);
      await loadSessionComandas(session.id);
    } else {
      await loadAvailableComandas(true);
    }
  };

  const loadAvailableComandas = async (autoSelectFirst = false) => {
    const { data } = await supabase
      .from("comandas" as any)
      .select("id, numero")
      .eq("status", "disponivel")
      .order("numero", { ascending: true });
    const list = (data as any) || [];
    setAvailableComandas(list);
    if (autoSelectFirst && list.length > 0) {
      setOpenForm(prev => prev.comanda_id ? prev : { ...prev, comanda_id: list[0].id });
    }
    return list;
  };

  const loadSessionComandas = async (sessionId: string) => {
    const { data } = await supabase
      .from("comandas" as any)
      .select("id, numero, identificacao")
      .eq("table_session_id", sessionId)
      .eq("status", "em_uso")
      .order("numero", { ascending: true });
    const list = (data as any) || [];
    setSessionComandas(list);
    setActiveComandaId(prev => (prev && list.some((c: any) => c.id === prev)) ? prev : (list[0]?.id ?? null));
    setSelectedClosingComandaIds(new Set(list.map((c: any) => c.id)));
    return list;
  };

  const handleOpenTable = async () => {
    if (!openForm.waiter_id) {
      toast.error("Selecione um garçom.");
      return;
    }
    if (!openForm.comanda_id) {
      toast.error("Selecione uma comanda disponível.");
      return;
    }
    const chosen = availableComandas.find(c => c.id === openForm.comanda_id);
    if (!chosen) {
      toast.error("Comanda selecionada não está mais disponível.");
      await loadAvailableComandas(true);
      return;
    }

    try {
      setLoading(true);

      // Calculate initial couvert
      let initialCouvert = 0;
      const couvertValue = parseFloat(storeSettings?.couvert_artistico_value) || 0;
      if (storeSettings?.couvert_artistico_enabled && couvertValue > 0) {
        initialCouvert = couvertValue * parseInt(openForm.people_count);
      }

      const { data: newSession, error } = await supabase.from("table_sessions").insert([{
        table_id: table.id,
        waiter_id: openForm.waiter_id,
        customer_id: openForm.customer_id === "none" ? null : openForm.customer_id,
        client_name: openForm.client_name,
        command_number: String(chosen.numero).padStart(3, '0'),
        people_count: parseInt(openForm.people_count),
        couvert_value: initialCouvert,
        total_amount: initialCouvert,
        status: 'open',
        observations: openForm.observations,
        cashier_session_id: activeSession?.id,
        opened_at: toSupabaseDateTime()
      }]).select().single();

      if (error) throw error;

      // Vincular comanda via RPC (pool)
      const { error: rpcErr } = await supabase.rpc('abrir_comanda' as any, {
        p_numero: chosen.numero,
        p_table_session_id: newSession.id
      });

      if (rpcErr) {
        // Rollback: outra sessão pegou essa comanda antes
        await supabase.from("table_sessions").delete().eq("id", newSession.id);
        await loadAvailableComandas(true);
        toast.error("Comanda já foi ocupada por outro atendimento. Escolha outra.");
        return;
      }

      // Persistir identificação (opcional) na própria comanda
      if (openForm.client_name) {
        await supabase.from("comandas" as any).update({ identificacao: openForm.client_name }).eq("id", chosen.id);
      }

      toast.success(`Mesa aberta com comanda #${String(chosen.numero).padStart(3, '0')}!`);
      onSuccess();
    } catch (error: any) {
      toast.error("Erro ao abrir mesa: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getProductComplements = (product: any) => {
    const categoryId = product.category_id;
    const productId = product.id;
    
    const productGroupIds = productComplementGroups
      .filter(pg => pg.group_id && pg.product_id === productId)
      .map(pg => pg.group_id);

    const categoryGroupIds = categoryId ? categoryComplementGroups
      .filter(cg => cg.group_id && cg.category_id === categoryId)
      .map(cg => cg.group_id) : [];

    const relevantGroupIds = [...new Set([...productGroupIds, ...categoryGroupIds])];
      
    return complementGroups.filter(g => {
      if (relevantGroupIds.includes(g.id)) return true;
      const isManual = productComplementGroups.some(pg => pg.group_id === g.id) || 
                       categoryComplementGroups.some(cg => cg.group_id === g.id);
      return !isManual;
    });
  };

  const handleAddProduct = async (product: any, complements: any[] = []) => {
    if (!session) return;

    // Bloqueia lançamento de pedidos se o usuário for KDS Only
    if (user?.is_kds_only && user?.role !== 'master') {
      toast.error("Usuários com acesso apenas ao KDS não podem lançar pedidos.");
      return;
    }


    // Check if product has complements and we haven't selected them yet
    const groups = getProductComplements(product);
    console.log(`[handleAddProduct] Produto: ${product.name}, Grupos encontrados:`, groups.length);
    
    if (groups.length > 0 && complements.length === 0 && !complementProduct) {
      console.log(`[handleAddProduct] Abrindo modal de complementos para ${product.name}`);
      setComplementProduct(product);
      setSelectedComplements([]);
      return;
    }



    try {
      const isKDSEnabled = storeSettings?.kds_enabled !== false;
      const isGroupedMode = storeSettings?.table_print_mode === 'grouped';
      const shouldShowInProduction = isKDSEnabled && (
        (product as any).send_to_kds !== false ||
        (product as any).send_to_production !== false
      );
      const shouldPrintKitchen = (product as any).send_to_production !== false;
      const needsProduction = shouldShowInProduction || shouldPrintKitchen || (isGroupedMode && !isKDSEnabled);
      const status = needsProduction ? 'pending' : 'ready';
      const now = toSupabaseDateTime();
      const sentAt = needsProduction ? null : now;



      const complementsTotal = complements.reduce((acc, c) => acc + (Number(c.price) || 0), 0);
      const unitPrice = Number(product.price) + complementsTotal;

      const newItem = {
        session_id: session.id,
        comanda_id: activeComandaId || sessionComandas[0]?.id || null,
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: unitPrice,
        total_price: unitPrice,
        waiter_id: session.waiter_id,
        status: status,
        production_status: shouldShowInProduction ? 'new' : 'finished',
        sent_at: sentAt,
        selected_complements: complements.length > 0 ? complements : null
      } as any;


      const { data, error } = await supabase.from("table_order_items").insert([newItem]).select().single();
      if (error) throw error;

      setOrderItems(prev => [...prev, data]);
      
      const currentTotal = Number(session?.total_amount || 0);
      const productPrice = unitPrice;
      const newTotal = currentTotal + productPrice;
      
      const { error: updateError } = await supabase
        .from("table_sessions")
        .update({ total_amount: newTotal })
        .eq("id", session.id);
        
      if (updateError) throw updateError;
      
      if (session) {
        session.total_amount = newTotal;
      }
      
      onSuccess();
      
      if (!isKDSEnabled && !isGroupedMode) {
        // Trigger printing automatically if KDS and Grouped mode are disabled
        if (shouldPrintKitchen) processPrintingForTableOrder(session.id, [data.id]);
        toast.success(`${product.name} adicionado!`);
      } else if (isGroupedMode && !isKDSEnabled) {
        toast.success(`${product.name} adicionado! Clique em "Lançar Pedidos" para imprimir.`);
      } else {
        toast.success(`${product.name} adicionado ao rascunho!`);
      }

    } catch (error: any) {
      toast.error("Erro ao adicionar: " + error.message);
    }
  };

  const handleSendToProduction = async () => {
    if (printingRef.current) return;
    
    const isKDSEnabled = storeSettings?.kds_enabled !== false;

    if (!isKDSEnabled && storeSettings?.table_print_mode !== 'grouped') {
      toast.error("KDS desativado.");
      return;
    }

    printingRef.current = true;
    
    console.log("[TableSessionDialog] Iniciando handleSendToProduction");
    const pendingItems = orderItems.filter(item => item.status === 'pending');
    
    if (pendingItems.length === 0) {
      toast.error("Não há itens pendentes para enviar.");
      printingRef.current = false;
      return;
    }

    try {
      setLoading(true);
      
      // Verificar se existem impressoras configuradas para alertar o usuário
      const { data: printers } = await supabase
        .from("printers")
        .select("id")
        .eq("is_active", true);

      if (!printers || printers.length === 0) {
        toast.warning("Atenção: Nenhuma impressora ativa configurada. O pedido será enviado para produção, mas não será impresso.");
      }

      const batchId = crypto.randomUUID();
      const now = toSupabaseDateTime();
      const productionItemIds = pendingItems
        .filter(item => {
          const product = products.find(p => p.id === item.product_id || p.name === item.product_name);
          return isKDSEnabled && product && (
            (product as any).send_to_kds !== false ||
            (product as any).send_to_production !== false
          );
        })
        .map(item => item.id);
      const printOnlyItemIds = pendingItems
        .filter(item => !productionItemIds.includes(item.id))
        .map(item => item.id);

      const updates = [];

      if (productionItemIds.length > 0) {
        updates.push(
          supabase
            .from("table_order_items")
            .update({ 
              status: 'preparing',
              production_status: 'new',
              batch_id: batchId,
              sent_at: now
            })
            .in('id', productionItemIds)
        );
      }

      if (printOnlyItemIds.length > 0) {
        updates.push(
          supabase
            .from("table_order_items")
            .update({ 
              status: 'ready',
              production_status: 'finished',
              batch_id: batchId,
              sent_at: now
            })
            .in('id', printOnlyItemIds)
        );
      }

      const updateResults = await Promise.all(updates);
      const error = updateResults.find(result => result.error)?.error;

      if (error) throw error;

      // Update local state
      setOrderItems(prev => prev.map(item => 
        item.status === 'pending'
          ? {
              ...item,
              status: productionItemIds.includes(item.id) ? 'preparing' : 'ready',
              production_status: productionItemIds.includes(item.id) ? 'new' : 'finished',
              batch_id: batchId,
              sent_at: now
            }
          : item
      ));

      // Trigger printing for these items
      processPrintingForTableOrder(session.id, pendingItems.map(i => i.id));
      
      toast.success("Pedido enviado para produção!");
      onSuccess();
    } catch (error: any) {
      toast.error("Erro ao enviar pedido: " + error.message);
    } finally {
      setLoading(false);
      printingRef.current = false;
    }
  };

  const handleRemoveProduct = async (itemId: string, price: number) => {
    // Check for deletion permission
    if (user && !user.can_cancel && user.role !== 'master') {
      toast.error("Você não tem permissão para excluir itens lançados.");
      return;
    }

    if (!confirm("⚠️ Deseja realmente EXCLUIR este item? Um relatório de cancelamento será enviado para a produção.")) {
      return;
    }

    try {
      // Find the item first to get its details for printing
      const itemToDelete = orderItems.find(i => i.id === itemId);
      
      const { error } = await supabase.from("table_order_items").delete().eq("id", itemId);
      if (error) throw error;

      // Update local order items state
      const updatedItems = orderItems.filter(i => i.id !== itemId);
      setOrderItems(updatedItems);
      
      // Calculate new total based on current session total minus the removed item's price
      const currentTotal = Number(session?.total_amount || 0);
      const itemPrice = Number(price || 0);
      const newTotal = Math.max(0, currentTotal - itemPrice);
      
      const { error: updateError } = await supabase
        .from("table_sessions")
        .update({ total_amount: newTotal })
        .eq("id", session.id);
        
      if (updateError) throw updateError;

      // Sync local session state
      if (session) {
        session.total_amount = newTotal;
      }

      // If item was already sent to production, print a cancellation report
      if (itemToDelete && (itemToDelete.status === 'preparing' || itemToDelete.status === 'ready' || itemToDelete.production_status === 'preparing' || itemToDelete.production_status === 'ready')) {
        processPrintingForTableOrder(session.id, [itemId], true);
        
        // Show cancellation preview for production items
        showCancellationPreview({
          orderNumber: `MESA ${table.number}`,
          customerName: session.client_name || "Mesa",
          waiterName: session.waiters?.name || user?.full_name,
          items: [{
            name: itemToDelete.product_name,
            quantity: itemToDelete.quantity,
            notes: itemToDelete.observations,
            complements: itemToDelete.selected_complements
          }],
          type: 'table'
        });
        
        toast.info("Relatório de cancelamento enviado para produção.");
      }
      
      // Notify parent to refresh tables map
      onSuccess();
      
      toast.info("Produto removido.");
    } catch (error: any) {
      toast.error("Erro ao remover: " + error.message);
    }
  };

  const handleCancelSession = async () => {
    if (!session?.id) return;
    
    // Check for deletion permission
    if (user && !user.can_cancel && user.role !== 'master') {
      toast.error("Você não tem permissão para cancelar atendimentos.");
      return;
    }
    
    if (!confirm("⚠️ ATENÇÃO: Deseja realmente CANCELAR este atendimento?\n\nIsso excluirá permanentemente todos os itens lançados e liberará a mesa sem gerar histórico financeiro.")) {
      return;
    }

    try {
      setLoading(true);
      
      // 1. Relatório de cancelamento para todos os itens em produção
      const itemsInProduction = orderItems.filter(i => 
        i.status === 'preparing' || 
        i.status === 'ready' || 
        i.production_status === 'preparing' || 
        i.production_status === 'ready'
      );

      if (itemsInProduction.length > 0) {
        processPrintingForTableOrder(session.id, itemsInProduction.map(i => i.id), true);
        
        showCancellationPreview({
          orderNumber: `MESA ${table.number}`,
          customerName: session.client_name || "Mesa",
          waiterName: session.waiters?.name || user?.full_name,
          items: itemsInProduction.map(i => ({
            name: i.product_name,
            quantity: i.quantity,
            notes: i.observations,
            complements: i.selected_complements
          })),
          type: 'table'
        });
      }

      // 2. Excluir itens
      const { error: itemsError } = await supabase
        .from("table_order_items")
        .delete()
        .eq("session_id", session.id);
      
      if (itemsError) throw itemsError;

      // 2. Excluir sessão
      const { error: sessionError } = await supabase
        .from("table_sessions")
        .delete()
        .eq("id", session.id);
      
      if (sessionError) throw sessionError;

      toast.success("Atendimento cancelado e mesa liberada!");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error("Erro ao cancelar atendimento: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestBill = async () => {
    try {
      const itemsTotal = orderItems.reduce((acc, i) => acc + Number(i.total_price || 0), 0);
      const totalWithCouvert = itemsTotal + Number(session?.couvert_value || 0);
      if (totalWithCouvert <= 0) {
        toast.error("Não é possível pedir a conta com total zerado. Adicione itens primeiro.");
        return;
      }
      const { error } = await supabase.from("table_sessions").update({ status: 'bill_requested' }).eq("id", session.id);
      if (error) throw error;
      toast.success("Conta solicitada!");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const calculateClosingTotals = (filterComandaIds?: Set<string>) => {
    // Se estamos na tela de fechamento e não foi passado filtro, usa a seleção do usuário
    const effectiveFilter = filterComandaIds ?? (view === 'closing' ? selectedClosingComandaIds : undefined);
    const useFilter = effectiveFilter && sessionComandas.length > 0 && effectiveFilter.size > 0;
    // Itens SEM comanda_id são sempre incluídos (itens legados antes do sistema de comandas)
    const filteredItems = useFilter
      ? orderItems.filter(i => !i.comanda_id || effectiveFilter!.has(i.comanda_id))
      : orderItems;
    const subtotal = filteredItems.reduce((acc, i) => acc + Number(i.total_price), 0);
    // Couvert só é cobrado quando TODAS as comandas são fechadas
    const isFullClose = !useFilter || (effectiveFilter!.size === sessionComandas.length);
    const couvert = isFullClose ? Number(session?.couvert_value || 0) : 0;

    // Determine if service tax (commission) should be applied
    const currentWaiter = waiters.find(w => w.id === session?.waiter_id);
    const isCommissionEnabled = currentWaiter ? currentWaiter.has_commission : true;

    const taxPercent = Number(storeSettings?.service_tax_percent) || 0;
    const serviceTax = (serviceTaxEnabled && isCommissionEnabled && taxPercent > 0)
      ? subtotal * (taxPercent / 100)
      : 0;

    const total = subtotal + couvert + serviceTax - discount;
    const paid = payments.reduce((acc, p) => acc + p.amount, 0);
    const remaining = total - paid;
    const change = paid > total ? paid - total : 0;

    return { subtotal, couvert, serviceTax, total, remaining: remaining > 0 ? remaining : 0, paid, change, filteredItems, isFullClose };
  };

  const handleAddPayment = (method: string, amount: number) => {
    if (amount <= 0) return;
    
    const totals = calculateClosingTotals();
    const remaining = totals.remaining;
    
    if (remaining <= 0.01) {
      toast.error("A conta já está totalmente paga.");
      return;
    }

    let finalAmount = amount;
    // Apenas 'Dinheiro' permite valores maiores que o restante para cálculo de troco
    if (method !== 'Dinheiro' && amount > remaining + 0.01) {
      finalAmount = remaining;
      toast.info(`Valor ajustado para o saldo restante: R$ ${remaining.toFixed(2)}`);
    }

    const newPayments = [...payments, { method, amount: finalAmount }];
    setPayments(newPayments);
    setSelectedPaymentMethod(method);
    
    // Atualiza o valor recebido para o próximo pagamento parcial
    const paidAfter = newPayments.reduce((acc, p) => acc + p.amount, 0);
    const newRemaining = Math.max(0, totals.total - paidAfter);
    setReceivingAmount(newRemaining);
  };

  const handleFinishClosing = async () => {
    const { total, remaining } = calculateClosingTotals();
    
    if (remaining > 0.01) {
      toast.error(`Faltam R$ ${remaining.toFixed(2)} para fechar a conta.`);
      return;
    }

    try {
      setLoading(true);
      
      // Usar a data de abertura do caixa para o financeiro e pedidos
      // Isso garante que se o caixa foi aberto dia 04, todos os lançamentos fiquem no dia 04
      // mesmo que o fechamento ocorra após a meia-noite (dia 05)
      const cashierDate = activeSession?.opened_at ? new Date(activeSession.opened_at) : new Date();
      const brDateStr = new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Sao_Paulo' }).format(cashierDate);
      let today = brDateStr;
      
      // Use the actual opened_at timestamp for created_at to ensure it stays on the same day in DB queries
      const orderCreatedAt = activeSession?.opened_at ? activeSession.opened_at : toSupabaseDateTime(new Date());

      
      // 1. Transactions will be created during reconciliation in the Cashier module (admin.tsx)
      // This ensures dine-in orders follow the same verification flow as delivery orders.
      // If payment was already selected at the table, we'll store it in the order record.
      for (const pay of payments) {
        if (pay.method === 'Caderneta/Fiado' && session.customer_id) {
          // Update customer balance immediately for debt control
          const customer = customers.find(c => c.id === session.customer_id);
          const newBalance = (Number(customer.current_balance) || 0) + pay.amount;
          await supabase.from("customers").update({ current_balance: newBalance }).eq("id", session.customer_id);
          
          // Add to customer ledger
          await supabase.from("customer_ledgers").insert([{
            customer_id: session.customer_id,
            amount: pay.amount,
            type: 'debt',
            description: `Consumo Mesa ${table.number} - Sessão ${session.id}`
          }]);
        }
      }
      
      // Get all payment methods used (Dinheiro, PIX, etc.)
      const paymentMethodsStr = Array.from(new Set(payments.map(p => p.method))).join(', ');
      
      // 2. Sync record for reports
      // Registramos na tabela de delivery_orders para aparecer nos relatórios e lista de pedidos do admin
      const { data: order, error: orderError } = await supabase.from("delivery_orders").insert({
        customer_id: session.customer_id,
        customer_name: session.client_name || `Mesa ${table.number}`,
        customer_phone: '',
        customer_address: `Atendimento Local - Mesa ${table.number}`,
        total_amount: total,
        order_type: 'dine_in',
        status: 'delivered',
        cashier_session_id: activeSession?.id,
        created_at: orderCreatedAt,
        reconciled_at: orderCreatedAt // Já marcar como conciliado para não duplicar no financeiro do admin
      }).select().single();

      if (order && !orderError) {
        const itemsToInvoice = calculateClosingTotals().filteredItems;
        const orderItemsToInsert = itemsToInvoice.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          selected_complements: item.selected_complements
        }));
        if (orderItemsToInsert.length > 0) {
          await supabase.from("delivery_order_items").insert(orderItemsToInsert);
        }
      }

      
      // FIX: Better income distribution for financial transactions to correctly handle 'change'
      let remainingIncomeToLog = total;
      for (const pay of payments) {
        if (remainingIncomeToLog <= 0.01) break;
        
        // This ensures we only log up to the session total, correctly handling 'change'
        const amountToLog = Math.min(pay.amount, remainingIncomeToLog);
        remainingIncomeToLog -= amountToLog;

        const selectedPaymentMethodObj = paymentMethods.find((m: any) => m.name === pay.method);
        const incomeCategory = finCategories.find((c: any) => c.id === (selectedPaymentMethodObj as any)?.financial_category_id) || 
                              finCategories.find((c: any) => c.name.toLowerCase().includes('venda') && c.type === 'income') ||
                              finCategories.find((c: any) => c.type === 'income');

        let incomeDreAccount = chartAccounts.find((ca: any) => ca.id === (incomeCategory as any)?.chart_account_id) ||
                                chartAccounts.find((ca: any) => ca.id === (selectedPaymentMethodObj as any)?.chart_account_id);
        
        if (pay.method !== 'Caderneta/Fiado') {
          await supabase.from("financial_transactions").insert([{
            description: `Mesa ${table.number} - ${session.client_name || 'Consumo'} (${pay.method})`,
            amount: amountToLog, // Log the actual income, not the payment with change
            type: 'income',
            date: today,
            due_date: today,
            status: 'paid',
            payment_date: today,
            category_id: incomeCategory?.id || null,
            chart_account_id: incomeDreAccount?.id || null,
            cashier_session_id: activeSession?.id
          }]);
        } else {
           // For Caderneta, it's already handled in the loop above (customer_ledgers)
           // But we still need the financial transaction as 'pending'
           const dueDateObj = new Date();
           dueDateObj.setDate(dueDateObj.getDate() + 30);
           const dueDate = new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Sao_Paulo' }).format(dueDateObj);

           await supabase.from("financial_transactions").insert([{
             description: `Mesa ${table.number} - ${session.client_name || 'Consumo'} (Caderneta)`,
             amount: amountToLog,
             type: 'income',
             date: today,
             due_date: dueDate,
             status: 'pending',
             customer_id: session.customer_id,
             category_id: incomeCategory?.id || null,
             chart_account_id: incomeDreAccount?.id || null,
             cashier_session_id: activeSession?.id
           }]);
        }
      }
      
      // 3. Liberar comandas selecionadas (devolve ao pool) e apagar seus itens da sessão
      const selectedIds = Array.from(selectedClosingComandaIds);
      for (const comandaId of selectedIds) {
        await supabase.rpc('liberar_comanda' as any, { p_comanda_id: comandaId });
        await (supabase.from("table_order_items") as any).delete().eq("session_id", session.id).eq("comanda_id", comandaId);
      }

      // 4. Recarregar comandas remanescentes da sessão
      const { data: remaining } = await supabase
        .from("comandas" as any)
        .select("id")
        .eq("table_session_id", session.id)
        .eq("status", "em_uso");
      const remainingCount = (remaining as any)?.length || 0;

      if (remainingCount === 0) {
        // 5a. Fechamento total: encerra sessão
        const { error } = await supabase.from("table_sessions").update({
          status: 'closed',
          closed_at: toSupabaseDateTime(new Date()),
          service_tax_value: calculateClosingTotals().serviceTax,
          total_amount: total,
          payment_method: paymentMethodsStr,
          cashier_session_id: activeSession?.id
        } as any).eq("id", session.id);

        if (error) throw error;

        // Comprovante de pagamento / Emissão fiscal (conforme opções escolhidas)
        try {
          if (order?.id && optPrintReceipt) {
            const totals = calculateClosingTotals();
            const changeTotal = payments.reduce((acc, p) => acc + Math.max(0, Number(p.amount) - 0), 0) - total;
            await printPaymentReceiptForOrder(order.id, {
              payments,
              service_tax_value: totals.serviceTax,
              couvert_value: Number(session.couvert_value || 0),
              people_count: session.people_count || 1,
              change_amount: changeTotal > 0.01 ? changeTotal : 0,
            });
          }
        } catch (e) {
          console.error("Erro comprovante:", e);
        }

        if (order?.id && optEmitFiscal) {
          try {
            sessionStorage.setItem('pending_fiscal_order', order.id);
          } catch {}
          toast.success("Mesa fechada! Redirecionando para emissão da NFC-e...");
          onSuccess();
          onClose();
          setTimeout(() => { window.location.href = '/admin'; }, 400);
          return;
        }

        toast.success("Mesa fechada com sucesso!");
        onSuccess();
        onClose();
      } else {
        // 5b. Fechamento parcial: mesa continua aberta com as comandas restantes
        setPayments([]);
        setSelectedPaymentMethod(null);
        setReceivingAmount(0);
        await loadSessionComandas(session.id);
        const { data: items } = await supabase.from("table_order_items")
          .select("id, product_id, product_name, quantity, unit_price, total_price, status, production_status, observations, waiter_id, printed, session_id, selected_complements, comanda_id")
          .eq("session_id", session.id);
        setOrderItems(items || []);
        toast.success(`${selectedIds.length} comanda(s) liberadas! Mesa continua aberta.`);
        setView('ordering');
        onSuccess();
      }

    } catch (error: any) {
      toast.error("Erro ao fechar mesa: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategoryId && selectedCategoryId !== "all" 
      ? p.category_id === selectedCategoryId 
      : true;
    return matchesSearch && matchesCategory;
  });

  const isDrink = (item: any) => {
    const product = products.find(p => p.id === item.product_id);
    const category = product ? categories.find(c => c.id === product.category_id) : null;
    const catName = category?.name?.toLowerCase() || '';
    const prodName = (item.product_name || '').toLowerCase();
    
    return catName.includes('bebida') || 
           catName.includes('suco') || 
           catName.includes('refrigerante') || 
           catName.includes('cerveja') ||
           catName.includes('vinho') ||
           prodName.includes('coca') ||
           prodName.includes('fanta') ||
           prodName.includes('cerveja') ||
           prodName.includes('suco') ||
           prodName.includes('água') ||
           prodName.includes('agua');
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className={`max-w-4xl max-h-[90vh] overflow-hidden p-0 gap-0 dark:bg-zinc-950 dark:border-zinc-800`}>
          <DialogHeader className={view === 'ordering' ? 'p-6 pb-2 border-b' : 'p-6 pb-0'}>
            <DialogTitle className="text-2xl font-black uppercase flex items-center gap-3">
              <LayoutGrid className="h-6 w-6 text-orange-600" />
              Mesa {table?.number} {table?.prefix ? `- ${table.prefix}` : ''}
            </DialogTitle>
            <DialogDescription className="font-bold uppercase text-[10px]">
              {view === 'opening' ? 'Iniciando novo atendimento' : 
               view === 'ordering' ? 'Lançamento de produtos' : 'Fechamento de conta'}
            </DialogDescription>
          </DialogHeader>

          {view === 'opening' && (
            <div className="space-y-6 p-6 pt-4">
              {!activeSession ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4 bg-orange-50/50 dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-orange-200 dark:border-zinc-800">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-950 rounded-full flex items-center justify-center text-3xl animate-bounce">
                    🔒
                  </div>
                  <h3 className="text-xl font-black text-orange-900 dark:text-orange-200 uppercase">Caixa Dorminhoco! 😴</h3>
                  <p className="text-xs text-orange-800/70 dark:text-orange-300/70 font-bold uppercase leading-relaxed">
                    Ops! O caixa está tirando um cochilo. <br/>
                    Abra o caixa no painel administrativo para começar a festa e abrir mesas!
                  </p>
                  <Button variant="outline" onClick={onClose} className="rounded-full font-black uppercase text-[10px] border-orange-200 hover:bg-orange-100">
                    Entendi, vou aguardar
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase">Garçom Responsável</Label>
                      <Select value={openForm.waiter_id} onValueChange={(val) => setOpenForm({...openForm, waiter_id: val})}>
                        <SelectTrigger className="font-bold">
                          <SelectValue placeholder="Selecione o garçom" />
                        </SelectTrigger>
                        <SelectContent>
                          {waiters.map(w => (
                            <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase">Quantidade de Pessoas</Label>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => setOpenForm({...openForm, people_count: Math.max(1, parseInt(openForm.people_count) - 1).toString()})}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input type="number" className="text-center font-bold" value={openForm.people_count} onChange={(e) => setOpenForm({...openForm, people_count: e.target.value})} />
                        <Button variant="outline" size="icon" onClick={() => setOpenForm({...openForm, people_count: (parseInt(openForm.people_count) + 1).toString()})}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase">Identificação do Cliente (Opcional)</Label>
                      <Input value={openForm.client_name} onChange={(e) => setOpenForm({...openForm, client_name: e.target.value})} placeholder="Ex: João Silva" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase flex items-center gap-1">
                        <Ticket className="h-3 w-3 text-orange-600" />
                        Comanda <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={openForm.comanda_id}
                        onValueChange={(val) => setOpenForm({ ...openForm, comanda_id: val })}
                        disabled={availableComandas.length === 0}
                      >
                        <SelectTrigger className="font-bold">
                          <SelectValue placeholder={availableComandas.length === 0 ? "Nenhuma disponível" : "Selecione a comanda"} />
                        </SelectTrigger>
                        <SelectContent className="max-h-64">
                          {availableComandas.map(c => (
                            <SelectItem key={c.id} value={c.id}>
                              #{String(c.numero).padStart(3, '0')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">
                        {availableComandas.length} disponíveis no pool
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase">Observações</Label>
                    <Input value={openForm.observations} onChange={(e) => setOpenForm({...openForm, observations: e.target.value})} />
                  </div>

                  {storeSettings?.couvert_artistico_enabled && (
                    <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-xl flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Landmark className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase text-orange-900">Couvert Artístico</p>
                          <p className="text-[10px] font-bold text-orange-600">Lançamento automático: R$ {storeSettings.couvert_artistico_value} x {openForm.people_count} pessoas</p>
                        </div>
                      </div>
                      <div className="text-xl font-black text-orange-700">
                        R$ {((parseFloat(storeSettings.couvert_artistico_value) || 0) * parseInt(openForm.people_count)).toFixed(2)}
                      </div>
                    </div>
                  )}

                  {availableComandas.length === 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-center">
                      <p className="text-xs font-black uppercase text-red-700">Nenhuma comanda disponível no momento</p>
                      <p className="text-[10px] font-bold text-red-600 mt-1">Aguarde outra mesa liberar comandas para continuar.</p>
                    </div>
                  )}

                  <Button
                    onClick={handleOpenTable}
                    disabled={loading || availableComandas.length === 0 || !openForm.comanda_id}
                    className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-lg font-black uppercase rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Carregando..." : "Abrir Atendimento"}
                  </Button>

                </>
              )}
            </div>
          )}

          {view === 'ordering' && (
            <div className="flex h-[70vh]">
              {/* Lado Esquerdo: Pedidos Atuais */}
              <div className="w-1/2 border-r flex flex-col">
                <div className="px-3 py-2 border-b bg-muted/20 dark:bg-zinc-900/50 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-black uppercase text-[11px]">Itens da Mesa</span>
                    <Badge className="bg-blue-600 text-[9px] font-black h-4 px-1.5">{orderItems.length} Itens</Badge>
                  </div>

                  {/* Comandas vinculadas à sessão */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {sessionComandas.map(c => {
                      const items = orderItems.filter(i => i.comanda_id === c.id);
                      const total = items.reduce((acc, i) => acc + Number(i.total_price || 0), 0);
                      const isActive = activeComandaId === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setActiveComandaId(c.id)}
                          className={`flex flex-col items-start px-1.5 py-1 rounded-md border transition-all min-w-[76px] ${isActive ? 'bg-orange-600 border-orange-600 text-white shadow-md' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 hover:border-orange-300'}`}
                          title={c.identificacao || `Comanda ${c.numero}`}
                        >
                          <span className={`text-[8px] font-black uppercase leading-none ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
                            <Ticket className="inline h-2 w-2 mr-0.5" />
                            #{String(c.numero).padStart(3, '0')}
                          </span>
                          <span className={`text-[8px] font-bold uppercase truncate max-w-[70px] ${isActive ? 'text-white/90' : 'text-foreground'}`}>
                            {c.identificacao || '—'}
                          </span>
                          <span className={`text-[8px] font-black ${isActive ? 'text-white' : 'text-primary'}`}>
                            {items.length}it · R$ {total.toFixed(2)}
                          </span>
                        </button>
                      );
                    })}
                    <button
                      onClick={async () => {
                        await loadAvailableComandas();
                        setNewComandaForm({ comanda_id: "", identificacao: "" });
                        setShowNewComandaDialog(true);
                      }}
                      className="flex items-center gap-1 px-1.5 py-1 rounded-md border border-dashed border-orange-300 text-orange-600 hover:bg-orange-50 font-black text-[9px] uppercase min-h-[42px]"
                    >
                      <Plus className="h-3 w-3" /> Nova
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase"><Clock className="inline h-2.5 w-2.5 mr-1" />15 min</span>
                    <span className="text-base font-black text-primary">R$ {calculateClosingTotals().total.toFixed(2)}</span>
                  </div>
                </div>

                
                <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl shadow-sm animate-in fade-in slide-in-from-left-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm leading-tight">{item.product_name}</p>
                          {item.status === 'pending' && <Badge className="bg-slate-400 text-[8px] h-4 uppercase">Rascunho</Badge>}
                          {(item.status === 'preparing' || (item.production_status && !['ready', 'finished'].includes(item.production_status) && item.status !== 'pending')) && (
                            <Badge className={`${storeSettings?.kds_enabled === false ? 'bg-blue-400' : 'bg-blue-500 animate-pulse'} text-[8px] h-4 uppercase`}>
                              {storeSettings?.kds_enabled === false ? 'Enviado' : (isDrink(item) ? 'Preparando' : 'Cozinhando')}
                            </Badge>
                          )}
                          {(item.status === 'ready' || item.production_status === 'ready' || item.production_status === 'finished') && (
                            <Badge className="bg-green-500 text-[8px] h-4 uppercase">Pronto</Badge>
                          )}
                          {item.status === 'delivered' && <Badge className="bg-slate-500 text-[8px] h-4 uppercase">Entregue</Badge>}
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{item.quantity}x R$ {Number(item.unit_price).toFixed(2)}</p>
                        {item.selected_complements && item.selected_complements.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.selected_complements.map((c: any, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-[8px] py-0 px-1 border-orange-200 text-orange-600 bg-orange-50/50">
                                + {c.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {item.observations && (
                          <div className="mt-1 text-[10px] text-yellow-900 bg-yellow-100 border border-yellow-300 rounded px-2 py-0.5 italic">
                            <span className="font-bold not-italic">Obs:</span> {item.observations}
                          </div>
                        )}
                        {(item.status === 'pending' || item.production_status === 'new') && (
                          <button
                            type="button"
                            onClick={async () => {
                              const current = item.observations || "";
                              const value = window.prompt("Observação do item (ex: sem cebola, ponto da carne):", current);
                              if (value === null) return;
                              const trimmed = value.trim();
                              const { error } = await supabase
                                .from("table_order_items")
                                .update({ observations: trimmed || null })
                                .eq("id", item.id);
                              if (error) {
                                toast.error("Erro ao salvar observação");
                                return;
                              }
                              setOrderItems(prev => prev.map(i => i.id === item.id ? { ...i, observations: trimmed || null } : i));
                              toast.success("Observação salva!");
                            }}
                            className="mt-1 text-[10px] text-yellow-800 hover:text-yellow-900 underline underline-offset-2 font-semibold"
                          >
                            {item.observations ? "Editar observação" : "+ Adicionar observação"}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* REGRA: Mostrar botão de excluir se estiver pendente OU se o usuário tiver permissão de cancelamento */}
                        {(item.status === 'pending' || (storeSettings?.kds_enabled === false && item.status === 'preparing') || (user?.can_cancel || user?.role === 'master')) ? (
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveProduct(item.id, item.total_price)} className="h-8 w-8 text-red-500 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : null}

                        {/* Botão de Entregar (apenas se estiver pronto) */}
                        {(item.status === 'ready' || item.production_status === 'ready' || item.production_status === 'finished') && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={async () => {
                              await supabase.from('table_order_items').update({ status: 'delivered' }).eq('id', item.id);
                              setOrderItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'delivered' } : i));
                              toast.success("Item marcado como entregue!");
                            }} 
                            className="h-8 w-8 text-green-600 hover:bg-green-50"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}

                        {storeSettings?.kds_enabled === false && item.status === 'preparing' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={async () => {
                              await supabase.from('table_order_items').update({ status: 'ready' }).eq('id', item.id);
                              setOrderItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'ready' } : i));
                              toast.success("Item marcado como pronto!");
                            }} 
                            className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {session?.couvert_value > 0 && (
                    <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-xl">
                      <span className="font-black text-[10px] uppercase text-orange-800">Couvert Artístico ({session.people_count}x)</span>
                      <span className="font-black text-sm text-orange-800">R$ {session.couvert_value}</span>
                    </div>
                  )}
                </div>

                <div className="p-2.5 border-t bg-muted/5 space-y-2 shrink-0">
                  {orderItems.some(i => i.status === 'pending') && (storeSettings?.kds_enabled !== false || storeSettings?.table_print_mode === 'grouped') && (
                    <Button 
                      onClick={handleSendToProduction} 
                      className="w-full h-9 bg-orange-600 hover:bg-orange-700 text-white font-black uppercase rounded-lg shadow-md animate-pulse text-[10px]"
                    >
                      <Printer className="h-3.5 w-3.5 mr-1.5" />
                      {storeSettings?.kds_enabled === false ? "Lançar Pedidos" : "Enviar Produção"} ({orderItems.filter(i => i.status === 'pending').length})
                    </Button>
                  )}

                  <div className="grid grid-cols-2 gap-1.5">
                    <Button 
                      onClick={() => setView('closing')} 
                      className="h-8 bg-[#0055ff] hover:bg-blue-700 text-white font-black uppercase rounded-lg shadow-sm transition-all active:scale-95 text-[9px]"
                    >
                      Fechar Conta
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={handleRequestBill} 
                      disabled={(orderItems.reduce((acc, i) => acc + Number(i.total_price || 0), 0) + Number(session?.couvert_value || 0)) <= 0}
                      className="h-8 border-orange-200 bg-orange-50/30 text-orange-600 hover:bg-orange-50 font-black uppercase rounded-lg transition-all active:scale-95 text-[9px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Pedir Conta
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <Button 
                      variant="outline" 
                      onClick={async () => {
                        const success = await printFullBill(session.id);
                        if (success) {
                          toast.success("Conferência enviada!");
                        } else {
                          toast.error("Erro na impressora.");
                        }
                      }} 
                      className="h-8 text-slate-700 border-slate-200 hover:bg-slate-50 font-black uppercase rounded-lg transition-all active:scale-95 text-[8px]"
                    >
                      <ReceiptText className="h-3 w-3 mr-1" />
                      Conferência
                    </Button>

                    <Button 
                      variant="outline" 
                      onClick={async () => {
                        if (confirm("Forçar teste de impressão?")) {
                          const ok = await forceTestPrint();
                          if (ok) toast.success("Teste enviado!");
                        }
                      }}
                      className="h-8 text-[8px] font-black uppercase text-slate-600 border-slate-200 border-dashed rounded-lg hover:bg-slate-50"
                    >
                      <Printer className="h-3 w-3 mr-1" />
                      Testar
                    </Button>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button 
                      variant="ghost" 
                      disabled={loading}
                      onClick={handleCancelSession} 
                      className="w-auto h-5 text-[7.5px] font-black uppercase text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg px-2"
                    >
                      <Trash2 className="h-2.5 w-2.5 mr-1" />
                      Limpar Mesa
                    </Button>
                  </div>
                </div>
                
                <div className="p-2.5 border-t bg-slate-50/50 shrink-0">
                  <Button 
                    onClick={onClose} 
                    className="w-full h-9 bg-[#1a2332] hover:bg-slate-900 text-white font-black uppercase rounded-lg shadow-lg transition-all active:scale-95 text-[9.5px] tracking-wider"
                  >
                    Continuar Atendimento
                  </Button>
                </div>
              </div>

              {/* Lado Direito: Seleção de Produtos */}
              <div className="w-1/2 flex flex-col bg-muted/5">
                <div className="p-4 border-b space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Buscar produtos..." 
                      className="pl-10 font-bold" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                    <Button
                      variant={selectedCategoryId === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategoryId("all")}
                      className={`text-[10px] font-black uppercase h-8 px-2 transition-all ${selectedCategoryId === "all" ? "bg-primary shadow-md scale-95" : "bg-white border-zinc-200"}`}
                    >
                      🚀 Todos
                    </Button>
                    {categories.map((cat) => (
                      <Button
                        key={cat.id}
                        variant={selectedCategoryId === cat.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={`text-[10px] font-black uppercase h-8 px-2 transition-all truncate ${selectedCategoryId === cat.id ? "bg-primary shadow-md scale-95" : "bg-white border-zinc-200"}`}
                        title={cat.name}
                      >
                        {cat.name}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 auto-rows-max">
                    {filteredProducts.map(product => {
                      const groups = getProductComplements(product);
                      const hasComplements = groups.length > 0;
                      
                      return (
                        <button 
                          key={product.id} 
                          onClick={() => handleAddProduct(product)}
                          className="flex flex-col text-left p-2 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl hover:border-primary hover:shadow-md transition-all group h-20 relative overflow-hidden"
                        >
                          {hasComplements && (
                            <Badge className="absolute top-0.5 right-0.5 h-3 px-1 text-[7px] leading-none bg-orange-500 font-bold rounded-sm">
                              +
                            </Badge>
                          )}
                          <p className="font-black text-[10px] uppercase group-hover:text-primary line-clamp-2 mb-1 leading-tight">{product.name}</p>
                          <p className="mt-auto font-black text-primary text-xs">R$ {product.price}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === 'closing' && (
            <div className="flex h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
              {/* Lado Esquerdo: Itens da Mesa (Creative Receipt Style) */}
              <div className="w-1/3 border-r bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col overflow-hidden">
                <div className="p-4 border-b bg-white dark:bg-zinc-900/50 flex items-center justify-between">
                  <h3 className="font-black uppercase text-xs flex items-center gap-2">
                    <ReceiptText className="h-4 w-4 text-primary" />
                    Itens do Pedido
                  </h3>
                  <Badge variant="outline" className="text-[9px] font-black border-primary/20 text-primary">
                    {orderItems.length}
                  </Badge>
                </div>

                {/* Seletor de comandas para fechamento parcial */}
                {sessionComandas.length > 0 && (
                  <div className="p-3 border-b bg-orange-50/60 dark:bg-orange-950/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase text-orange-800 dark:text-orange-300 flex items-center gap-1">
                        <Ticket className="h-3 w-3" /> Comandas para fechar
                      </p>
                      <button
                        onClick={() => {
                          if (selectedClosingComandaIds.size === sessionComandas.length) {
                            setSelectedClosingComandaIds(new Set());
                          } else {
                            setSelectedClosingComandaIds(new Set(sessionComandas.map(c => c.id)));
                          }
                        }}
                        className="text-[9px] font-black uppercase text-orange-700 hover:underline"
                      >
                        {selectedClosingComandaIds.size === sessionComandas.length ? 'Nenhuma' : 'Todas'}
                      </button>
                    </div>
                    <div className="space-y-1">
                      {sessionComandas.map(c => {
                        const items = orderItems.filter(i => i.comanda_id === c.id);
                        const total = items.reduce((acc, i) => acc + Number(i.total_price || 0), 0);
                        const checked = selectedClosingComandaIds.has(c.id);
                        return (
                          <label
                            key={c.id}
                            className={`flex items-center justify-between gap-2 p-2 rounded-lg border cursor-pointer transition-all ${checked ? 'bg-white dark:bg-zinc-900 border-orange-400 shadow-sm' : 'bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-700 opacity-70'}`}
                          >
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(v) => {
                                  const next = new Set(selectedClosingComandaIds);
                                  if (v) next.add(c.id); else next.delete(c.id);
                                  setSelectedClosingComandaIds(next);
                                }}
                              />
                              <div className="flex flex-col leading-tight">
                                <span className="text-[10px] font-black uppercase">#{String(c.numero).padStart(3, '0')}</span>
                                <span className="text-[9px] font-bold text-muted-foreground truncate max-w-[100px]">
                                  {c.identificacao || '—'} · {items.length} it
                                </span>
                              </div>
                            </div>
                            <span className="text-[11px] font-black text-primary">R$ {total.toFixed(2)}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}


                
                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide no-scrollbar bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex flex-col p-4 bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/10 group-hover:bg-primary transition-colors" />
                      
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <span className="font-black text-xs leading-tight uppercase tracking-tight">{item.product_name}</span>
                        <span className="font-black text-xs text-primary">R$ {Number(item.total_price).toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                          {item.quantity}x <span className="text-[8px]">@</span> R$ {Number(item.unit_price).toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {item.status === 'delivered' ? (
                            <div className="flex items-center gap-1 text-[8px] font-black text-green-600 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded-full uppercase">
                              <Check className="h-2 w-2" /> Entregue
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-[8px] font-black text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded-full uppercase">
                              <Clock className="h-2 w-2" /> Em preparo
                            </div>
                          )}
                        </div>
                      </div>

                      {item.selected_complements && item.selected_complements.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2 border-t border-dashed border-zinc-100 dark:border-zinc-800 pt-2">
                          {item.selected_complements.map((c: any, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-[8px] h-4 py-0 px-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold border-none uppercase">
                              + {c.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {session?.couvert_value > 0 && (
                    <div className="flex justify-between items-center p-4 bg-orange-50/50 dark:bg-orange-900/10 border border-dashed border-orange-200 dark:border-orange-900/30 rounded-xl relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400" />
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-orange-600" />
                        <span className="font-black text-[10px] uppercase text-orange-800">Couvert Artístico</span>
                      </div>
                      <span className="font-black text-xs text-orange-800">R$ {session.couvert_value.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Visual Bottom of Receipt */}
                  <div className="flex justify-center py-4">
                    <div className="w-full border-t border-dashed border-zinc-300 dark:border-zinc-700 relative">
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-zinc-50 dark:bg-zinc-950 px-3">
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(i => <div key={i} className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white dark:bg-zinc-900 border-t shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Subtotal Bruto</span>
                    <span className="font-black text-sm">R$ {orderItems.reduce((acc, i) => acc + Number(i.total_price), 0).toFixed(2)}</span>
                  </div>
                  <p className="text-[8px] text-muted-foreground uppercase font-bold">* Verifique todos os itens antes de prosseguir</p>
                </div>
              </div>

              {/* Lado Direito: Resumo e Pagamento */}
              <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                  {/* Resumo da Conta */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b pb-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="font-black uppercase text-sm tracking-tight">Resumo do Demonstrativo</h3>
                    </div>
                    
                    <div className="space-y-4">
                    {(() => {
                      const totals = calculateClosingTotals();
                      return (
                        <>
                          <div className="flex justify-between text-sm font-bold">
                            <span className="text-muted-foreground uppercase text-[10px]">Produtos</span>
                            <span>R$ {totals.subtotal.toFixed(2)}</span>
                          </div>
                          {totals.couvert > 0 && (
                            <div className="flex justify-between text-sm font-bold">
                              <span className="text-muted-foreground uppercase text-[10px]">Couvert Artístico</span>
                              <span>R$ {totals.couvert.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-sm font-bold">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground uppercase text-[10px]">Taxa de Serviço ({storeSettings?.service_tax_percent || 10}%)</span>
                              <Badge variant="outline" onClick={() => setServiceTaxEnabled(!serviceTaxEnabled)} className="cursor-pointer hover:bg-muted p-0 border-none">
                                {serviceTaxEnabled ? <Check className="h-3 w-3 text-green-600" /> : <Plus className="h-3 w-3 text-red-500" />}
                              </Badge>
                            </div>
                            <span className={!serviceTaxEnabled ? 'line-through text-muted-foreground' : ''}>
                              R$ {totals.serviceTax.toFixed(2)}
                            </span>
                          </div>
                          
                          <div className="pt-2 border-t space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-black uppercase text-foreground">Total Geral</span>
                              <span className="text-2xl font-black text-primary">R$ {totals.total.toFixed(2)}</span>
                            </div>
                            
                            {(session?.people_count > 1 || true) && (
                              <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex items-center justify-between animate-in zoom-in-95 duration-300">
                                <div className="flex items-center gap-2">
                                  <div className="bg-primary/10 p-2 rounded-full">
                                    <Users className="h-4 w-4 text-primary" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black uppercase text-primary/70 leading-none">Divisão por pessoa</p>
                                    <p className="text-xs font-bold text-muted-foreground mt-1">({Math.max(1, session?.people_count || 1)} pessoas na mesa)</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <span className="text-lg font-black text-primary">R$ {(totals.total / Math.max(1, session?.people_count || 1)).toFixed(2)}</span>
                                    <p className="text-[8px] font-bold uppercase text-muted-foreground">Cada um</p>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    className="h-8 px-2 bg-primary hover:bg-primary/90 text-[10px] font-black uppercase"
                                    onClick={() => {
                                      const amountPerPerson = totals.total / Math.max(1, session?.people_count || 1);
                                      const input = document.getElementById('custom_amount') as HTMLInputElement;
                                      if (input) input.value = amountPerPerson.toFixed(2);
                                      toast.info("Valor por pessoa aplicado ao campo de pagamento.");
                                    }}
                                  >
                                    Usar
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>

                          {payments.length > 0 && (
                            <div className="pt-4 space-y-2">
                              <p className="text-[10px] font-black uppercase text-muted-foreground">Pagamentos realizados</p>
                              {payments.map((p, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs font-bold p-2 bg-green-50 dark:bg-emerald-950/30 dark:text-emerald-400 rounded-lg">
                                  <span className="uppercase">{p.method}</span>
                                  <div className="flex items-center gap-2">
                                    <span>R$ {p.amount.toFixed(2)}</span>
                                    <button onClick={() => setPayments(payments.filter((_, i) => i !== idx))} className="text-red-500">
                                      <Minus className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              <div className={`flex justify-between pt-2 text-sm font-black ${totals.change > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                                <span className="uppercase">{totals.change > 0 ? 'Troco' : 'Saldo Restante'}</span>
                                <span>R$ {totals.change > 0 ? totals.change.toFixed(2) : totals.remaining.toFixed(2)}</span>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Recebimento */}
                <div className="space-y-6">
                  <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1 flex-1 mr-4">
                        <Label className="text-[10px] font-black uppercase text-primary">Valor Recebido (R$)</Label>
                        <Input 
                          type="number" 
                          value={receivingAmount} 
                          onChange={(e) => setReceivingAmount(parseFloat(e.target.value) || 0)}
                          className="text-2xl font-black h-14 bg-white border-primary/20"
                        />
                      </div>
                      {(() => {
                        const totals = calculateClosingTotals();
                        const change = receivingAmount > totals.remaining ? receivingAmount - totals.remaining : 0;
                        return (
                          <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-muted-foreground">Troco Calculado</p>
                            <p className={`text-3xl font-black ${change > 0 ? 'text-green-600' : 'text-muted-foreground/30'}`}>
                              R$ {change.toFixed(2)}
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-black uppercase text-xs text-muted-foreground border-b pb-2">Selecione a Forma de Pagamento</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant={selectedPaymentMethod === 'Dinheiro' ? "default" : "outline"} 
                        className={`h-16 flex flex-col gap-1 font-black uppercase text-[10px] ${selectedPaymentMethod === 'Dinheiro' ? 'bg-primary text-white ring-2 ring-primary ring-offset-2' : ''}`} 
                        onClick={() => handleAddPayment('Dinheiro', receivingAmount)}
                      >
                        <Banknote className="h-5 w-5" /> Dinheiro
                      </Button>
                      <Button 
                        variant={selectedPaymentMethod === 'PIX' ? "default" : "outline"} 
                        className={`h-16 flex flex-col gap-1 font-black uppercase text-[10px] ${selectedPaymentMethod === 'PIX' ? 'bg-primary text-white ring-2 ring-primary ring-offset-2' : ''}`} 
                        onClick={() => handleAddPayment('PIX', receivingAmount)}
                      >
                        <Landmark className="h-5 w-5" /> PIX
                      </Button>
                      <Button 
                        variant={selectedPaymentMethod === 'Cartão Crédito' ? "default" : "outline"} 
                        className={`h-16 flex flex-col gap-1 font-black uppercase text-[10px] ${selectedPaymentMethod === 'Cartão Crédito' ? 'bg-primary text-white ring-2 ring-primary ring-offset-2' : ''}`} 
                        onClick={() => handleAddPayment('Cartão Crédito', receivingAmount)}
                      >
                        <CreditCard className="h-5 w-5" /> Crédito
                      </Button>
                      <Button 
                        variant={selectedPaymentMethod === 'Cartão Débito' ? "default" : "outline"} 
                        className={`h-16 flex flex-col gap-1 font-black uppercase text-[10px] ${selectedPaymentMethod === 'Cartão Débito' ? 'bg-primary text-white ring-2 ring-primary ring-offset-2' : ''}`} 
                        onClick={() => handleAddPayment('Cartão Débito', receivingAmount)}
                      >
                        <CreditCard className="h-5 w-5" /> Débito
                      </Button>
                      <Button 
                        variant={selectedPaymentMethod === 'Caderneta/Fiado' ? "default" : "outline"} 
                        className={`h-16 flex flex-col gap-1 font-black uppercase text-[10px] border-orange-200 dark:border-orange-900/50 ${selectedPaymentMethod === 'Caderneta/Fiado' ? 'bg-orange-600 text-white ring-2 ring-orange-600 ring-offset-2' : 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20'}`} 
                        onClick={() => {
                          const selector = document.getElementById('caderneta-customer-selector');
                          if (selector) selector.classList.toggle('hidden');
                        }}
                      >
                        <FileText className="h-5 w-5" /> Caderneta
                      </Button>
                    </div>

                    <div id="caderneta-customer-selector" className="hidden space-y-2 p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 rounded-xl animate-in fade-in slide-in-from-top-2">
                      <Label className="text-[10px] font-black uppercase text-orange-800">Selecione o Cliente para Caderneta</Label>
                      <Select onValueChange={async (val) => {
                        if (val === "none") return;
                        
                        const customer = customers.find(c => c.id === val);
                        const canUseFiado = customer && (customer.allow_fiado === true);
                        
                        if (!canUseFiado) {
                          toast.error("Este cliente não tem permissão para usar Caderneta.");
                          return;
                        }

                        const { error } = await supabase.from("table_sessions").update({ customer_id: val }).eq("id", session.id);
                        if (error) {
                          toast.error("Erro ao vincular cliente: " + error.message);
                          return;
                        }
                        
                        session.customer_id = val;
                        handleAddPayment('Caderneta/Fiado', receivingAmount);
                        document.getElementById('caderneta-customer-selector')?.classList.add('hidden');
                      }}>
                        <SelectTrigger className="font-bold border-orange-200">
                          <SelectValue placeholder="Buscar cliente..." />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                </div>
                </div>
                </div>
                {/* Footer fixo com botão Finalizar Venda */}
                <div className="shrink-0 border-t bg-white dark:bg-zinc-950 p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
                  <Button onClick={() => { setOptPrintReceipt(true); setOptEmitFiscal(false); setCheckoutOptionsOpen(true); }} disabled={calculateClosingTotals().remaining > 0.01} className="w-full bg-green-600 hover:bg-green-700 h-14 text-xl font-black uppercase rounded-full gap-3">
                    <Check className="h-6 w-6" />
                    Finalizar Venda
                  </Button>
                </div>
              </div>
            </div>
          )}
      </DialogContent>
      </Dialog>

      {/* Dialog: Nova Comanda para mesa já aberta */}
      <Dialog open={showNewComandaDialog} onOpenChange={setShowNewComandaDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase flex items-center gap-2">
              <Ticket className="h-5 w-5 text-orange-600" />
              Nova Comanda
            </DialogTitle>
            <DialogDescription className="text-[10px] font-bold uppercase">
              Adicionar comanda extra à Mesa {table?.number}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase">Identificação (opcional)</Label>
              <Input
                value={newComandaForm.identificacao}
                onChange={(e) => setNewComandaForm({ ...newComandaForm, identificacao: e.target.value })}
                placeholder="Ex: Amigo do João"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase">
                Comanda disponível <span className="text-red-500">*</span>
              </Label>
              <Select
                value={newComandaForm.comanda_id}
                onValueChange={(val) => setNewComandaForm({ ...newComandaForm, comanda_id: val })}
                disabled={availableComandas.length === 0}
              >
                <SelectTrigger className="font-bold">
                  <SelectValue placeholder={availableComandas.length === 0 ? "Nenhuma disponível" : "Selecione"} />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {availableComandas.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      #{String(c.numero).padStart(3, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableComandas.length === 0 && (
                <p className="text-[10px] font-black uppercase text-red-600">Nenhuma comanda disponível no momento</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowNewComandaDialog(false)} className="font-black uppercase text-[10px]">
              Cancelar
            </Button>
            <Button
              disabled={!newComandaForm.comanda_id || availableComandas.length === 0}
              onClick={async () => {
                const chosen = availableComandas.find(c => c.id === newComandaForm.comanda_id);
                if (!chosen || !session?.id) return;
                const { error: rpcErr } = await supabase.rpc('abrir_comanda' as any, {
                  p_numero: chosen.numero,
                  p_table_session_id: session.id
                });
                if (rpcErr) {
                  await loadAvailableComandas();
                  toast.error("Comanda já foi ocupada. Escolha outra.");
                  return;
                }
                if (newComandaForm.identificacao) {
                  await supabase.from("comandas" as any).update({ identificacao: newComandaForm.identificacao }).eq("id", chosen.id);
                }
                await loadSessionComandas(session.id);
                setActiveComandaId(chosen.id);
                setShowNewComandaDialog(false);
                toast.success(`Comanda #${String(chosen.numero).padStart(3, '0')} adicionada!`);
              }}
              className="bg-orange-600 hover:bg-orange-700 font-black uppercase text-[10px]"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      <Dialog open={!!complementProduct} onOpenChange={(open) => { 
        if (!open) { 
          setComplementProduct(null); 
          setSelectedComplements([]); 
        } 
      }}>
        <DialogContent className="max-w-[90vw] sm:max-w-[380px] p-0 overflow-hidden border-none rounded-xl sm:rounded-2xl max-h-[85vh]">
          {complementProduct && (() => {
            const groups = getProductComplements(complementProduct);
            return (
              <div className="flex flex-col max-h-[90vh]">
                {complementProduct.image_url && (
                  <div className="relative h-24 sm:h-28 shrink-0">
                    <img loading="lazy" src={complementProduct.image_url} alt={complementProduct.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                      <DialogTitle className="text-white text-xl font-black drop-shadow">{complementProduct.name}</DialogTitle>
                    </div>
                  </div>
                )}
                {!complementProduct.image_url && (
                  <DialogHeader className="p-4 pb-0">
                    <DialogTitle className="text-xl font-black">{complementProduct.name}</DialogTitle>
                  </DialogHeader>
                )}
                <div className="overflow-y-auto flex-1 p-4 space-y-3">
                  {groups.map((group: any) => (
                    <div key={group.id} className="space-y-1.5">
                      <div className="flex items-center justify-between px-1">
                        <p className="text-[10px] font-black uppercase text-orange-600 tracking-wide">{group.name}</p>
                        <span className="text-[9px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {group.min_choices > 0 ? `Mín: ${group.min_choices} · ` : ''}Máx: {group.max_choices}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {(group.complements || []).map((comp: any) => {
                          const isSelected = selectedComplements.some(c => c.id === comp.id);
                          return (
                            <button
                              key={comp.id}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedComplements(prev => prev.filter(c => c.id !== comp.id));
                                } else {
                                  const currentInGroup = selectedComplements.filter(c => c.group_id === group.id).length;
                                  if (currentInGroup >= group.max_choices) {
                                    if (group.max_choices === 1) {
                                      setSelectedComplements(prev => [...prev.filter(c => c.group_id !== group.id), comp]);
                                    } else {
                                      toast.error(`Máximo de ${group.max_choices} opções para ${group.name}`);
                                    }
                                  } else {
                                    setSelectedComplements(prev => [...prev, comp]);
                                  }
                                }
                              }}
                              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${isSelected ? 'bg-orange-600 border-orange-600 text-white shadow-sm scale-[0.98]' : 'bg-white border-zinc-200 text-foreground hover:border-orange-200 hover:bg-orange-50/20'}`}
                            >
                              <span className="truncate pr-2">{comp.name}</span>
                              <span className={`text-[10px] shrink-0 font-black ${isSelected ? 'text-white' : 'text-zinc-500'}`}>
                                {comp.price > 0 ? `+ R$ ${Number(comp.price).toFixed(2)}` : 'Grátis'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t shrink-0 bg-white">
                  <button
                    onClick={() => {
                      const missingGroup = groups.find((g: any) => {
                        const selected = selectedComplements.filter(c => c.group_id === g.id).length;
                        return selected < g.min_choices;
                      });
                      if (missingGroup) {
                        toast.error(`Selecione pelo menos ${missingGroup.min_choices} opção em "${missingGroup.name}"`);
                        return;
                      }
                      
                      // Regra extra: Se o produto tiver um grupo chamado "Tipo de Pão", deve ter pelo menos 1 selecionado
                      const paoGroup = groups.find((g: any) => g.name.toLowerCase().includes('pão') || g.name.toLowerCase().includes('pao'));
                      if (paoGroup) {
                        const selectedPao = selectedComplements.filter(c => c.group_id === paoGroup.id).length;
                        if (selectedPao === 0) {
                          toast.error(`Por favor, selecione o ${paoGroup.name}`);
                          return;
                        }
                      }

                      handleAddProduct(complementProduct, [...selectedComplements]);
                      setComplementProduct(null);
                      setSelectedComplements([]);
                    }}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-3 rounded-lg text-xs uppercase shadow-lg transition-all active:scale-95"
                  >
                    ADICIONAR AO PEDIDO
                  </button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Dialog: Opções ao finalizar venda (comprovante / NFC-e) */}
      <Dialog open={checkoutOptionsOpen} onOpenChange={setCheckoutOptionsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase flex items-center gap-2">
              <ReceiptText className="h-5 w-5 text-green-600" />
              Finalizar Venda
            </DialogTitle>
            <DialogDescription className="text-[11px] font-bold uppercase">
              Escolha o que deseja gerar para este fechamento.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-green-100 bg-green-50/40 hover:bg-green-50 cursor-pointer transition-all">
              <Checkbox
                checked={optPrintReceipt}
                onCheckedChange={(v) => setOptPrintReceipt(v === true)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-black text-sm uppercase text-green-800 flex items-center gap-2">
                  <Printer className="h-4 w-4" /> Imprimir Comprovante de Pagamento
                </div>
                <div className="text-[11px] text-green-900/70 mt-1">
                  Cupom com itens, totais e forma de pagamento (não fiscal).
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-blue-100 bg-blue-50/40 hover:bg-blue-50 cursor-pointer transition-all">
              <Checkbox
                checked={optEmitFiscal}
                onCheckedChange={(v) => setOptEmitFiscal(v === true)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-black text-sm uppercase text-blue-800 flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Emitir Nota Fiscal (NFC-e)
                </div>
                <div className="text-[11px] text-blue-900/70 mt-1">
                  Após finalizar, você será redirecionado para o módulo <b>Pedidos</b> com o pedido aberto para emissão.
                </div>
              </div>
            </label>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCheckoutOptionsOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                setCheckoutOptionsOpen(false);
                await handleFinishClosing();
              }}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white font-black uppercase"
            >
              <Check className="h-4 w-4 mr-1" /> Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

import React, { useState, useEffect, useCallback, useMemo } from "react";
import ReactDOM from 'react-dom';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Clock, Check, Utensils, Flame, Timer, 
  ChefHat, AlertCircle, CheckCircle, 
  Maximize2, Minimize2, Volume2, VolumeX,
  Search, Filter, Smartphone, Monitor, Tv,
  MapPin, ShoppingBag, Store, Star,
  ArrowRight, Pizza, Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { format } from "date-fns";

// --- Types ---
type ProductionStatus = 'new' | 'preparing' | 'oven' | 'ready' | 'finished';

interface KDSItem {
  id: string;
  product_id?: string;
  product_name: string;
  quantity: number;
  observations?: string;
  production_status: ProductionStatus;
  priority: number;
  sent_at?: string;
  created_at: string;
  source: 'table' | 'delivery';
  client_name: string;
  display_location: string;
  order_id?: string;
  order_type: 'delivery' | 'takeaway' | 'table';
  total_value?: number;
  payment_method?: string;
  sector_id?: string;
  order_number?: string;
  [key: string]: any;
}

// --- Constants ---
const COLUMNS: { id: ProductionStatus; title: string; color: string; icon: any }[] = [
  { id: 'new', title: 'Novos Pedidos', color: 'bg-blue-600', icon: AlertCircle },
  { id: 'preparing', title: 'Em Preparo', color: 'bg-yellow-500', icon: ChefHat },
  { id: 'oven', title: 'No Forno', color: 'bg-orange-500', icon: Flame },
  { id: 'ready', title: 'Pronto', color: 'bg-green-600', icon: CheckCircle },
  { id: 'finished', title: 'Finalizado', color: 'bg-slate-500', icon: Check },
];

export function KitchenDashboard() {
  const [items, setItems] = useState<KDSItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isTvMode, setIsTvMode] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [readyAlert, setReadyAlert] = useState<{name: string, client: string} | null>(null);
  const [isKdsActive, setIsKdsActive] = useState(true);


  // Audio for new orders
  const playNewOrderSound = useCallback(() => {
    if (!isSoundEnabled) return;
    try {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audio.play();
    } catch (e) {
      console.error("Audio play failed", e);
    }
  }, [isSoundEnabled]);

  const fetchItems = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      setError(null);

      // KDS sempre busca itens. O bloqueio "não enviar ao KDS" é feito
      // por usuário no momento do lançamento (TableSessionDialog), gravando
      // production_status='finished' para quem não tem acesso ao KDS.
      const { data: settings } = await supabase
        .from("store_settings")
        .select("kds_enabled")
        .single();
      setIsKdsActive(settings?.kds_enabled !== false);


      const { data: tableData, error: tableError } = await supabase
        .from("table_order_items")
        .select(`*, products(send_to_kds, send_to_production), table_sessions!inner (table_id, client_name, status, restaurant_tables (number))`)
        .in("production_status", ["new", "preparing", "oven", "ready"])
        .in("table_sessions.status", ["open", "bill_requested"]);

      if (tableError) throw tableError;

      const { data: deliveryData, error: deliveryError } = await supabase
        .from("delivery_order_items")
        .select(`*, products(send_to_kds, send_to_production), delivery_orders!inner (customer_name, order_type, status)`)
        .in("delivery_orders.status", ["pending", "production", "ready"]);

      if (deliveryError) throw deliveryError;




      const shouldShowInKitchen = (item: any) => {
        const product = item.products;
        if (!product) return true;
        return product.send_to_production !== false || product.send_to_kds !== false;
      };

      const normalizedTableItems: KDSItem[] = (tableData || []).map((item: any) => ({

        ...item,
        id: `table:${item.id}`,
        source: 'table',
        display_location: `Mesa ${item.table_sessions?.restaurant_tables?.number || "S/N"}`,
        client_name: item.table_sessions?.client_name || "Cliente",
        order_type: 'table',
        order_number: item.id.slice(0, 4).toUpperCase(),
        production_status: (item.production_status as ProductionStatus) || (item.status === 'ready' ? 'ready' : 'new')
      })).filter((item: any) => item.production_status !== 'finished' && shouldShowInKitchen(item));

      const normalizedDeliveryItems: KDSItem[] = (deliveryData || []).map((item: any) => ({
        ...item,
        id: `delivery:${item.id}`,
        source: 'delivery',
        display_location: item.delivery_orders?.order_type === 'delivery' ? 'Delivery' : 'Retirada',
        client_name: item.delivery_orders?.customer_name || "Cliente",
        sent_at: item.created_at,
        order_type: item.delivery_orders?.order_type || 'delivery',
        observations: item.notes || item.observations || '',
        order_number: item.id.slice(0, 4).toUpperCase(),
        production_status: (item.production_status as ProductionStatus) || 'new'
      })).filter((item: any) => item.production_status !== 'finished' && shouldShowInKitchen(item));

      const finalItems = [...normalizedTableItems, ...normalizedDeliveryItems];
      
      if (items.length > 0 && finalItems.length > items.length) {
        const hasNewIncoming = finalItems.some(ni => ni.production_status === 'new' && !items.find(oi => oi.id === ni.id));
        if (hasNewIncoming) playNewOrderSound();
      }

      setItems(finalItems);

    } catch (error: any) {
      console.error("KDS Fetch Error:", error);
      setError(error.message || "Erro desconhecido ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(false);
    const refreshInterval = setInterval(() => fetchItems(true), 30000);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(refreshInterval);
      clearInterval(timer);
    };
  }, []);

  const handleUpdateStatus = async (item: KDSItem, newStatus: ProductionStatus) => {
    try {
      const dbTable = item.source === 'delivery' ? 'delivery_order_items' : 'table_order_items';
      const dbId = item.id.split(':')[1];
      
      // Map production_status back to the legacy 'status' if needed for compatibility
      const legacyStatus = newStatus === 'ready' || newStatus === 'finished' ? 'ready' : 'preparing';

      const updateData: any = { 
        production_status: newStatus,
        status: legacyStatus 
      };

      // If it's a table item being finished, we also need to update the table_sessions or relevant fields
      // but usually finishing an item just means it's done in the kitchen.
      // The user wants it to "show at the table" when finished in kitchen.
      // Looking at TableDashboard.tsx, it checks for i.production_status === 'ready' or i.status === 'ready'.

      const { error } = await supabase
        .from(dbTable)
        .update(updateData)
        .eq("id", dbId);

      if (error) throw error;
      
      setItems(prev => prev.map(p => 
        p.id === item.id ? { ...p, production_status: newStatus } : p
      ));

      if (newStatus === 'ready') {
        toast.success(`✅ ${item.product_name} — ${item.client_name} está PRONTO!`, {
          duration: 8000,
          position: "top-center",
          style: { fontSize: '16px', fontWeight: 'bold' }
        });

        setReadyAlert({ name: item.product_name, client: item.client_name });
        setTimeout(() => setReadyAlert(null), 8000);

        // Som de notificação
        try {
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
          audio.volume = 1.0;
          audio.play().catch(() => {});
        } catch(e) {}
      }
    } catch (error: any) {
      toast.error("Erro ao atualizar status: " + error.message);
    }
  };

  const handleUpdatePriority = async (item: KDSItem, delta: number) => {
    try {
      const dbTable = item.source === 'delivery' ? 'delivery_order_items' : 'table_order_items';
      const dbId = item.id.split(':')[1];
      const newPriority = (item.priority || 0) + delta;

      const { error } = await supabase
        .from(dbTable)
        .update({ priority: newPriority } as any)
        .eq("id", dbId);

      if (error) throw error;
      
      setItems(prev => prev.map(p => 
        p.id === item.id ? { ...p, priority: newPriority } : p
      ));
    } catch (error: any) {
      toast.error("Erro ao atualizar prioridade");
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const { draggableId, destination } = result;
    const item = items.find(i => i.id === draggableId);
    if (!item) return;

    const newStatus = destination.droppableId as ProductionStatus;
    if (item.production_status !== newStatus) {
      handleUpdateStatus(item, newStatus);
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  // --- Filtering Logic ---
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Exclude drinks based on keywords
      const nameLower = item.product_name?.toLowerCase() || "";
      const drinkKeywords = ['coca', 'fanta', 'suco', 'refrigerante', 'cerveja', 'água', 'agua', 'heineken', 'skol', 'chopp', 'lata', '600ml', '2l', '1.5l', 'bebida'];
      const isDrink = drinkKeywords.some(kw => nameLower.includes(kw));
      if (isDrink) return false;

      // Filter by type
      if (filterType !== 'all' && item.order_type !== filterType) return false;

      // Search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          item.product_name?.toLowerCase().includes(term) ||
          item.client_name?.toLowerCase().includes(term) ||
          item.order_number?.toLowerCase().includes(term)
        );
      }

      return true;
    }).sort((a, b) => (b.priority || 0) - (a.priority || 0) || new Date(a.sent_at || a.created_at).getTime() - new Date(b.sent_at || b.created_at).getTime());
  }, [items, searchTerm, filterType]);

  // --- Stats ---
  const stats = useMemo(() => {
    const active = filteredItems.filter(i => i.production_status !== 'finished');
    const ready = filteredItems.filter(i => i.production_status === 'ready').length;
    const overdue = active.filter(i => {
      const elapsed = Math.floor((new Date().getTime() - new Date(i.sent_at || i.created_at).getTime()) / 60000);
      return elapsed > 25;
    }).length;
    
    // Avg prep time (dummy calculation for now based on finished items or typical values)
    const avgPrep = active.length > 0 ? 18 : 0;

    return { total: active.length, ready, overdue, avgPrep };
  }, [filteredItems]);

  const getElapsedTime = (time: string) => {
    if (!time) return 0;
    return Math.floor((new Date().getTime() - new Date(time).getTime()) / 60000);
  };

  const getCardColor = (minutes: number) => {
    if (minutes > 25) return "border-red-500 bg-red-50 animate-pulse-slow";
    if (minutes > 15) return "border-yellow-400 bg-yellow-50";
    return "border-slate-200 bg-white";
  };

  if (error && items.length === 0) {
    const isLongError = error.length > 150;
    const displayError = isLongError ? `${error.substring(0, 150)}...` : error;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-red-100 flex flex-col items-center text-center max-w-md w-full">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Falha na Sincronização</h2>
          
          <div className="bg-red-50 p-4 rounded-2xl mb-6 text-left border border-red-100 w-full">
            <p className="text-xs font-bold text-red-700 uppercase mb-1">Causa do Erro:</p>
            <p className="text-sm text-red-600 font-medium break-words">
              {displayError}
            </p>
            {isLongError && (
              <button 
                onClick={() => toast.error(error, { duration: 10000 })}
                className="text-[10px] font-bold text-red-800 uppercase mt-2 underline"
              >
                Ver erro completo
              </button>
            )}
          </div>

          <div className="text-slate-500 text-sm font-medium mb-8 space-y-2">
            <p>• Verifique sua conexão com a internet.</p>
            <p>• Certifique-se de que a sessão não expirou.</p>
          </div>

          <Button 
            onClick={() => fetchItems()}
            className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest rounded-2xl gap-3 text-lg"
          >
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!isKdsActive) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-orange-100 flex flex-col items-center text-center max-w-md w-full">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
            <Utensils className="h-10 w-10 text-orange-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">KDS Desativado</h2>
          <p className="text-sm text-slate-500 font-medium mb-8">
            O módulo de produção (KDS) está desativado nas configurações da empresa. 
            Ative-o para começar a receber pedidos na cozinha.
          </p>
          <Button 
            onClick={() => fetchItems()}
            className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest rounded-2xl gap-3 text-lg"
          >
            Verificar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(

      "min-h-screen flex flex-col transition-all duration-300",
      isTvMode ? "bg-slate-900 p-2" : "bg-slate-50 p-4",
      isFullScreen && "fixed inset-0 z-50 overflow-auto"
    )}>
      {/* --- Top Bar --- */}
      <div className={cn(
        "flex flex-wrap items-center justify-between gap-4 mb-4 p-4 rounded-2xl shadow-sm border",
        isTvMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-100 text-slate-900"
      )}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-xl">
              <ChefHat className="h-6 w-6 text-orange-600" />
            </div>
            <h1 className="text-xl font-black uppercase tracking-tighter">KDS Profissional</h1>
          </div>
          
          <div className="hidden md:flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
            <div className="flex flex-col">
              <span className={isTvMode ? "text-slate-400" : "text-slate-500"}>Pedidos</span>
              <span className="text-lg">{stats.total}</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-200/20" />
            <div className="flex flex-col">
              <span className="text-red-500">Atrasados</span>
              <span className="text-lg text-red-500">{stats.overdue}</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-200/20" />
            <div className="flex flex-col">
              <span className={isTvMode ? "text-slate-400" : "text-slate-500"}>Média</span>
              <span className="text-lg">{stats.avgPrep} min</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-200/20" />
            <div className="flex flex-col">
              <span className="text-green-500">Prontos</span>
              <span className="text-lg text-green-500">{stats.ready}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl font-mono text-lg font-bold">
            <Clock className="h-4 w-4" />
            {format(currentTime, "HH:mm:ss")}
          </div>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-xl"
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
          >
            {isSoundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>

          <Button 
            variant={isTvMode ? "secondary" : "outline"} 
            className="rounded-xl gap-2 font-bold uppercase text-xs"
            onClick={() => setIsTvMode(!isTvMode)}
          >
            <Tv className="h-4 w-4" /> {isTvMode ? "Sair Modo TV" : "Modo TV"}
          </Button>

          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-xl"
            onClick={toggleFullScreen}
          >
            {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-2 bg-orange-50 border-b border-orange-100 animate-pulse">
          <div className="h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-2" />
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Sincronizando...</span>
        </div>
      )}

      {/* --- Filters & Search (Hidden in TV Mode if preferred, or compact) --- */}
      {!isTvMode && (
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar por pedido, cliente..."
              className="w-full pl-10 pr-4 h-12 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 p-1 bg-white border border-slate-200 rounded-xl">
            {[
              { id: 'all', label: 'Todos', icon: Filter },
              { id: 'delivery', label: 'Delivery', icon: MapPin },
              { id: 'takeaway', label: 'Retirada', icon: ShoppingBag },
              { id: 'table', label: 'Mesa', icon: Store },
            ].map(type => (
              <Button
                key={type.id}
                variant={filterType === type.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilterType(type.id)}
                className={cn(
                  "rounded-lg gap-2 font-bold uppercase text-[10px] px-4",
                  filterType === type.id ? "bg-slate-900 text-white" : "text-slate-500"
                )}
              >
                <type.icon className="h-3 w-3" />
                {type.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {readyAlert && ReactDOM.createPortal(
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-top duration-500">
          <div className="bg-green-600 text-white px-8 py-4 rounded-2xl shadow-2xl border-4 border-green-300 flex items-center gap-4 min-w-[400px]">
            <div className="text-4xl animate-bounce">🔔</div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest opacity-80">Pronto para servir!</p>
              <p className="text-xl font-black leading-tight">{readyAlert.name}</p>
              <p className="text-sm font-bold opacity-90">Cliente: {readyAlert.client}</p>
            </div>
            <button onClick={() => setReadyAlert(null)} className="ml-auto text-white/70 hover:text-white text-2xl font-black">✕</button>
          </div>
        </div>,
        document.body
      )}

      {/* --- Kanban Board --- */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className={cn(
          "flex-1 grid gap-4 overflow-x-auto pb-4",
          "grid-cols-1 md:grid-cols-3 lg:grid-cols-5"
        )}>
          {COLUMNS.map(column => (
            <div key={column.id} className="flex flex-col min-w-[300px] h-full">
              <div className={cn(
                "p-4 rounded-t-2xl flex items-center justify-between text-white shadow-sm mb-2",
                column.color
              )}>
                <div className="flex items-center gap-2">
                  <column.icon className="h-5 w-5" />
                  <h2 className="font-black uppercase tracking-tight text-sm">{column.title}</h2>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-none font-bold">
                  {filteredItems.filter(i => i.production_status === column.id).length}
                </Badge>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "flex-1 rounded-b-2xl p-2 transition-colors flex flex-col gap-3 overflow-y-auto",
                      snapshot.isDraggingOver ? "bg-slate-200/50" : "bg-slate-100/30",
                      isTvMode && "bg-slate-800/20"
                    )}
                    style={{ minHeight: '200px' }}
                  >
                    {filteredItems
                      .filter(item => item.production_status === column.id)
                      .map((item, index) => {
                        const elapsed = getElapsedTime(item.sent_at || item.created_at);
                        
                        return (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={cn(
                                  "group relative",
                                  snapshot.isDragging && "z-50"
                                )}
                              >
                                <Card className={cn(
                                  "border-2 transition-all duration-200",
                                  getCardColor(elapsed),
                                  snapshot.isDragging ? "shadow-2xl ring-2 ring-orange-400 rotate-1" : "shadow-sm",
                                  isTvMode && "border-slate-700 bg-slate-800 text-white"
                                )}>
                                  <CardContent className="p-4 flex flex-col gap-3">
                                    {/* Header */}
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-[10px] font-black uppercase text-slate-400">#{item.order_number || (item.id.includes(':') ? item.id.split(':')[1].slice(0, 4) : item.id.slice(0, 4))}</span>
                                          {item.priority > 0 && (
                                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none px-1.5 py-0 text-[10px] flex gap-1">
                                              <Star className="h-2 w-2 fill-current" /> PRIORIDADE
                                            </Badge>
                                          )}
                                        </div>
                                        <h3 className="font-black uppercase text-base leading-tight">
                                          {item.client_name}
                                        </h3>
                                      </div>
                                      
                                      <div className={cn(
                                        "px-2 py-1 rounded-lg flex items-center gap-1.5 font-mono font-bold text-xs",
                                        elapsed > 25 ? "bg-red-600 text-white" : 
                                        elapsed > 15 ? "bg-yellow-400 text-yellow-900" : 
                                        "bg-slate-100 text-slate-600"
                                      )}>
                                        <Timer className="h-3 w-3" />
                                        {elapsed < 10 ? `0${elapsed}` : elapsed}:00
                                      </div>
                                    </div>

                                    {/* Item Content */}
                                    <div className="py-2 border-y border-slate-100/50">
                                      <div className="flex justify-between items-center mb-1">
                                        <p className="font-bold text-lg text-orange-600 uppercase flex items-center gap-2">
                                          <Pizza className="h-4 w-4" />
                                          {item.product_name}
                                        </p>
                                        <span className="bg-slate-900 text-white px-2 py-0.5 rounded text-xs font-black">{item.quantity}X</span>
                                      </div>
                                      
                                      {item.observations && (
                                        <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-lg">
                                          <p className="text-[10px] font-black text-amber-600 uppercase flex items-center gap-1 mb-0.5">
                                            <AlertCircle className="h-3 w-3" /> Observação:
                                          </p>
                                          <p className="text-xs font-bold italic text-slate-700 dark:text-amber-200">
                                            "{item.observations}"
                                          </p>
                                        </div>
                                      )}
                                    </div>

                                    {/* Footer Info */}
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                                      <div className="flex items-center gap-2 text-slate-500">
                                        {item.order_type === 'delivery' ? <MapPin className="h-3 w-3" /> : 
                                         item.order_type === 'takeaway' ? <ShoppingBag className="h-3 w-3" /> : 
                                         <Store className="h-3 w-3" />}
                                        {item.display_location}
                                      </div>
                                      <div className="text-slate-400">
                                        {format(new Date(item.sent_at || item.created_at), "HH:mm")}
                                      </div>
                                    </div>

                                    {/* Quick Controls */}
                                    <div className="flex gap-2 pt-2">
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 flex-1 rounded-lg text-[10px] font-black uppercase bg-slate-100 hover:bg-slate-200 text-slate-600"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdatePriority(item, 1);
                                        }}
                                      >
                                        Priorizar
                                      </Button>
                                      
                                      {column.id === 'new' && (
                                        <Button 
                                          size="sm" 
                                          className="h-8 flex-1 rounded-lg text-[10px] font-black uppercase bg-yellow-500 hover:bg-yellow-600 text-white"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdateStatus(item, 'preparing');
                                          }}
                                        >
                                          Preparar
                                        </Button>
                                      )}
                                      
                                      {column.id === 'preparing' && (
                                        <Button 
                                          size="sm" 
                                          className="h-8 flex-1 rounded-lg text-[10px] font-black uppercase bg-orange-500 hover:bg-orange-600 text-white"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdateStatus(item, 'oven');
                                          }}
                                        >
                                          Para o Forno
                                        </Button>
                                      )}
                                      
                                      {column.id === 'oven' && (
                                        <Button 
                                          size="sm" 
                                          className="h-8 flex-1 rounded-lg text-[10px] font-black uppercase bg-green-600 hover:bg-green-700 text-white"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdateStatus(item, 'ready');
                                          }}
                                        >
                                          Pronto
                                        </Button>
                                      )}

                                      {column.id === 'ready' && (
                                        <Button 
                                          size="sm" 
                                          className="h-8 flex-1 rounded-lg text-[10px] font-black uppercase bg-slate-600 hover:bg-slate-700 text-white"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdateStatus(item, 'finished');
                                          }}
                                        >
                                          Finalizar
                                        </Button>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Empty State */}
      {filteredItems.length === 0 && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
          <Utensils className="h-24 w-24 mb-6 text-slate-300" />
          <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-400">Cozinha Limpa!</h3>
          <p className="font-bold text-slate-300 uppercase text-xs mt-2">Nenhum pedido pendente de produção</p>
        </div>
      )}
      

      {/* Styles for animation */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(0.99); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}

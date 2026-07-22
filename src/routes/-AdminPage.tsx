import React, { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from "react";
import { cn } from "@/lib/utils";

import { 
  Plus, 
  Check,
  LayoutDashboard, 
  Package, 
  List, 
  LogOut, 
  Loader2, 
  Wallet,
  TrendingUp as TrendingUpIcon,

  ArrowUpCircle, 
  ArrowDownCircle, 
  DollarSign,
  CreditCard,
  PieChart as PieIcon,
  LineChart as LineIcon,
  Maximize2,
  Minimize2,
  Users,
  Trash2,
  Mail,
  UserPlus,
  Pencil,
  Upload,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Truck,
  MapPin,
  Building2,
  Phone,
  Settings,
  Bike,
  Archive,
  ArrowRightLeft,
  Calendar,
  Sparkles,
  Lock,
  Unlock,
  Store,
  Search,
  User,
  Printer, 
  Share2,
  ExternalLink,
  Clock,
  CalendarDays,
  Play,
  Pause,
  Eye,
  Info,
  Navigation,
  Circle as CircleIcon,
  Target,
  RotateCcw,
  Save,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Clock3,
  CheckCircle,
  XCircle as XCircleIcon,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  Timer,
  ShoppingBag,
  Target as TargetIcon,
  FileText,
  ShoppingCart,
  Copy,
  Megaphone,
  LayoutGrid,
  Utensils,
  FileDown,
  ReceiptText
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { processPrintingForOrder } from "@/lib/printing";
import { processPrintingForDeliveryOrder } from "@/lib/delivery-printing";
import { showCancellationPreview } from "@/lib/cancellation-preview";
import { gerarHtmlImpressao } from "@/lib/print-template";


import { useTheme } from "@/components/ThemeProvider";
import { WaiterManagement } from "@/components/tables/WaiterManagement";
const WeeklyCampaignsManager = lazy(() => import("@/components/WeeklyCampaignsManager").then(m => ({ default: m.WeeklyCampaignsManager })));
const PrinterConfigManager = lazy(() => import("@/components/PrinterConfigManager").then(m => ({ default: m.PrinterConfigManager })));
const WhatsAppBotConfig = lazy(() => import("@/components/whatsapp/WhatsAppBotConfig").then(m => ({ default: m.WhatsAppBotConfig })));
const WhatsAppSidePanel = lazy(() => import("@/components/whatsapp/WhatsAppSidePanel").then(m => ({ default: m.WhatsAppSidePanel })));
const TableModule = lazy(() => import("@/components/tables/TableModule").then(m => ({ default: m.TableModule })));
const TableDashboardOnly = lazy(() => import("@/components/tables/TableDashboardOnly").then(m => ({ default: m.TableDashboardOnly })));
const KitchenDashboard = lazy(() => import("@/components/admin/KitchenDashboard").then(m => ({ default: m.KitchenDashboard })));
import { useCompany } from "@/hooks/useCompany";
import { useModulePermissions, ALL_MODULES, DEFAULT_FUNCIONARIO_MODULES, TAB_TO_MODULE } from "@/hooks/useModulePermissions";
import { useFieldVisibility, ALL_FIELDS, DEFAULT_FUNCIONARIO_VISIBLE_FIELDS, type FieldId } from "@/hooks/useFieldVisibility";
import { geocodeAddress } from "@/lib/geocoding";
import { supabase } from "@/integrations/supabase/client";
import { toSupabaseDateTime, fromSupabaseDateTime, formatDisplayDate } from "@/lib/dateUtils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { CompanyForm } from "@/components/admin/CompanyForm";

import { AppSidebar } from "@/components/admin/AppSidebar";
import { AssignDriverButton } from "@/components/delivery/AssignDriverButton";
import { LiveDeliveriesPanel } from "@/components/delivery/LiveDeliveriesPanel";
import { ProductMovementsView } from "@/components/admin/ProductMovementsView";
import { Clock as HeaderClock } from "@/components/admin/Clock";
const TaxRulesManager = lazy(() => import("@/components/admin/TaxRulesManager").then(m => ({ default: m.TaxRulesManager })));
const FiscalDocumentsPanel = lazy(() => import("@/components/admin/FiscalDocumentsPanel").then(m => ({ default: m.FiscalDocumentsPanel })));
const FiscalLogsPanel = lazy(() => import("@/components/admin/FiscalLogsPanel").then(m => ({ default: m.FiscalLogsPanel })));
const IngredientesManager = lazy(() => import("@/components/admin/IngredientesManager").then(m => ({ default: m.IngredientesManager })));
const EstoqueManager = lazy(() => import("@/components/admin/EstoqueManager").then(m => ({ default: m.EstoqueManager })));
import { FichaTecnicaEditor } from "@/components/admin/FichaTecnicaEditor";
const EngenhariaCardapioDashboard = lazy(() => import("@/components/admin/EngenhariaCardapioDashboard").then(m => ({ default: m.EngenhariaCardapioDashboard })));
const FiscalApiEndpointsManager = lazy(() => import("@/components/admin/FiscalApiEndpointsManager").then(m => ({ default: m.FiscalApiEndpointsManager })));
const FiscalCClassTribManager = lazy(() => import("@/components/admin/FiscalCClassTribManager").then(m => ({ default: m.FiscalCClassTribManager })));
const FiscalAuditManager = lazy(() => import("@/components/admin/FiscalAuditManager").then(m => ({ default: m.FiscalAuditManager })));
const FiscalNoteConfigManager = lazy(() => import("@/components/admin/FiscalNoteConfigManager").then(m => ({ default: m.FiscalNoteConfigManager })));
const SuppliersManager = lazy(() => import("@/components/admin/SuppliersManager"));

const FiscalButtons = lazy(() => import("@/components/admin/OrderActions/FiscalButtons").then(m => ({ default: m.FiscalButtons })));
const DeliveryZonesPanel = lazy(() => import("@/components/delivery/DeliveryZonesPanel").then(m => ({ default: m.DeliveryZonesPanel })));
const OrderProductsGrid = lazy(() => import("@/components/delivery/OrderProductsGrid").then(m => ({ default: m.OrderProductsGrid })));
import { Menu, ChevronDown, MessageCircle, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar
} from 'recharts';

//  Helper for location tracking
let trackingWatchId: number | null = null;
let lastTrackingTime = 0;

const MAX_STANDARD_IMAGE_UPLOAD_BYTES = 6 * 1024 * 1024;

function getSafeImageExtension(contentType: string): string {
  const fromType = contentType.split('/')[1] || 'jpg';
  const normalized = fromType.replace(/[^a-z0-9]/gi, '').toLowerCase();
  if (normalized === 'jpeg' || normalized === 'pjpeg') return 'jpg';
  return normalized.slice(0, 5) || 'jpg';
}

// Aplica transformação Cloudinary on-the-fly para servir a imagem já redimensionada
// (evita imagens gigantes no cardápio). Se não for URL Cloudinary, retorna a original.
function cldThumb(url?: string | null, width = 400): string {
  if (!url) return "";
  if (!/res\.cloudinary\.com\/.+\/image\/upload\//.test(url)) return url;
  if (/\/upload\/(?:[a-z]_[^/]+\/)*w_\d+/.test(url)) return url; // já tem transform de largura
  return url.replace('/image/upload/', `/image/upload/w_${width},c_limit,q_auto,f_auto/`);
}

// Comprime imagem no cliente sem converter para base64, evitando estouro de memória em fotos grandes de celular.
async function compressImage(file: File, maxDim = 1000, quality = 0.82): Promise<Blob> {
  if (!file.type.startsWith('image/')) return file;
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file;
  const objectUrl = URL.createObjectURL(file);
  try {
    const img: HTMLImageElement = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('Falha ao ler a imagem'));
      i.src = objectUrl;
    });
    let { width, height } = img;
    if (!width || !height) return file;
    if (width > maxDim || height > maxDim) {
      const ratio = Math.min(maxDim / width, maxDim / height);
      width = Math.max(1, Math.round(width * ratio));
      height = Math.max(1, Math.round(height * ratio));
    } else if (file.size <= 900 * 1024) {
      return file;
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', quality),
    );
    return blob && blob.size > 0 ? blob : file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function uploadMenuImage(file: File, prefix: 'prod' | 'cat' | 'logo', maxDim = 1000): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Selecione um arquivo de imagem válido.');
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    console.error('Configurações do Cloudinary ausentes no .env');
    throw new Error('Erro de configuração no servidor de imagens.');
  }

  let toUpload: Blob = file;
  try {
    const compressed = await compressImage(file, maxDim, 0.82);
    if (compressed && compressed.size > 0) {
      toUpload = compressed;
    }
  } catch (compErr) {
    console.warn('[compressImage falhou]', compErr);
  }

  try {
    const formData = new FormData();
    formData.append('file', toUpload);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', `menu/${prefix}`);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Falha no upload para o Cloudinary');
    }

    const data = await response.json();
    console.log('CLOUDINARY UPLOAD SUCCESS:', data.secure_url);
    return data.secure_url;
  } catch (error: any) {
    console.error('CLOUDINARY UPLOAD ERROR:', error);
    alert('Erro ao carregar imagem: ' + (error.message || 'Erro desconhecido'));
    throw error;
  }
}

interface Category { id: string; name: string; order?: number | null; image_url?: string | null; }
interface FinancialCategory { id: string; name: string; type: 'income' | 'expense'; chart_account_id?: string | null; }
interface ChartAccount {
  id: string;
  code: string;
  name: string;
  parent_id: string | null;
  type: 'revenue' | 'cost' | 'expense';
  level: number;
  active: boolean;
}
interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string | null;
  image_url: string | null;
  active: boolean | null;
  sell_delivery?: boolean | null;
  sell_dine_in?: boolean | null;
  sell_digital_menu?: boolean | null;
  categories?: { name: string } | null;
  size_prices?: Record<string, number> | any;
  allow_half_half?: boolean | null;
  is_pizza_flavor?: boolean | null;
  is_available?: boolean | null;
  price_2?: number | null;
    send_to_production?: boolean | null;
    send_to_kds?: boolean | null;
    is_promotional?: boolean | null;
    allow_crust?: boolean | null;
    suggested_products?: string[] | null;
    discount_percent?: number | null;
    discount_price?: number | null;
  }
declare global {
  interface Window {
    allProducts: Product[];
  }
}
interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  due_date?: string | null;
  category_id: string;
  chart_account_id?: string | null;
  financial_categories?: { name: string };
  chart_of_accounts?: ChartAccount;
  cashier_session_id?: string | null;
  payment_date?: string | null;
  status?: string;
  customer_id?: string | null;
  supplier_id?: string | null;
}
interface CashierSession {
  id: string;
  opened_at: string;
  closed_at: string | null;
  opening_balance: number;
  closing_balance: number | null;
  status: 'open' | 'closed';
  notes: string | null;
  created_at: string;
}
interface DriverTrip {
  id: string;
  cashier_session_id: string;
  driver_id: string;
  trip_count: number;
  fee_per_trip: number;
  total_fee: number;
  notes: string | null;
  drivers?: { name: string };
}
interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  can_delete?: boolean;
  can_cancel?: boolean;
  is_kds_only?: boolean;
  active?: boolean;
}
interface DeliveryOrder {
  id: string;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_cep?: string;
  customer_city?: string;
  customer_state?: string;
  total_amount: number;
  status: 'pending' | 'production' | 'ready' | 'delivering' | 'delivered' | 'cancelled' | 'awaiting_reconciliation';
  tracking_status?: 'pending' | 'preparing' | 'ready_for_pickup' | 'on_the_way' | 'delivered' | 'cancelled';
  order_type: 'delivery' | 'pickup' | 'counter' | 'dine_in';
  driver_id?: string;
  notes?: string;
  observation?: string;
  neighborhood?: string;
  estimated_delivery_time?: string;
  payment_method?: string;
  payment_split_details?: any;
  is_on_account?: boolean;
  cashier_session_id?: string;
  
  created_at: string;
  delivery_order_items?: {
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
}
const getTodayDate = () => {
  return new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
};

export default function AdminPage({ user }: { user: any }) {

  const todayDate = useMemo(() => getTodayDate(), []);
  const [loading, setLoading] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);

  const { hasTabAccess, isPrivileged, allowedModules } = useModulePermissions(user);
  // Visibilidade granular por campo (configurável por Master no cadastro do usuário).
  // NOTA: essa checagem é APENAS VISUAL. Os valores continuam vindo no mesmo payload
  // de queries agregadas (transactions, cashierSessions, etc.) e podem ser vistos via Network.
  // Se precisarmos blindar de verdade, mover a filtragem para RLS/edge function.
  const showCaixaInicio            = useFieldVisibility("caixa_inicio", user);
  const showCaixaEntradas          = useFieldVisibility("caixa_entradas", user);
  const showCaixaTaxasMotoqueiros  = useFieldVisibility("caixa_taxas_motoqueiros", user);
  const showCaixaOutrasSaidas      = useFieldVisibility("caixa_outras_saidas", user);
  const showCaixaSaldo             = useFieldVisibility("caixa_saldo", user);
  const showCaixaHistorico         = useFieldVisibility("caixa_historico", user);
  const showCaixaResumoFechamento  = useFieldVisibility("caixa_resumo_fechamento", user);
  const showPedidosFiltroPeriodo   = useFieldVisibility("pedidos_filtro_periodo", user);
  const [closeCashierConfirmOpen, setCloseCashierConfirmOpen] = useState(false);
  const getSessionProfileFallback = useCallback((): Profile | null => {
    if (!user?.id || !(user?.role === 'master' || user?.role === 'administrador')) return null;
    return {
      id: user.id,
      email: user.email || '',
      full_name: user.full_name || user.fullName || user.email || 'Usuário logado',
      role: user.role || 'master',
      can_delete: user.can_delete ?? user.canDelete ?? true,
      can_cancel: user.can_cancel ?? user.canCancel ?? true,
      is_kds_only: !!(user.is_kds_only ?? user.isKdsOnly),
      active: user.active !== false,
    };
  }, [user]);
  const firstAllowedTab = useMemo(() => {
    if (user?.is_kds_only) return "kitchen_dashboard";
    if (isPrivileged) return "delivery_module";
    if (allowedModules.includes("atendimento" as any)) return "delivery_module";
    const entry = Object.entries(TAB_TO_MODULE).find(([, mod]) => allowedModules.includes(mod as any));
    return entry ? entry[0] : "delivery_module";
  }, [isPrivileged, allowedModules, user?.is_kds_only]);

  const [activeTab, setActiveTab] = useState<string>(
    (user?.is_kds_only === true && user?.role !== 'master') ? "kitchen_dashboard" : firstAllowedTab
  );
  const handleSetActiveTab = (tab: string) => {
    if (user?.is_kds_only && user?.role !== 'master' && tab !== "kitchen_dashboard") return;
    if (tab === "kitchen_dashboard" && user?.role !== 'master' && !user?.is_kds_only) return;
    if (!hasTabAccess(tab)) {
      toast.error("Acesso não permitido a este módulo");
      return;
    }
    setActiveTab(tab);
  };

  // Se veio do fechamento de mesa pedindo emissão de NFC-e, abre a aba de Histórico/Pedidos.
  useEffect(() => {
    try {
      const pendingFiscal = sessionStorage.getItem('pending_fiscal_order');
      if (pendingFiscal) {
        sessionStorage.removeItem('pending_fiscal_order');
        setActiveTab('history_module');
        setTimeout(() => {
          toast.info("Localize o pedido e clique no botão fiscal para emitir a NFC-e.", { duration: 6000 });
        }, 300);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: currentCompany } = useCompany();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [deliveryAreas, setDeliveryAreas] = useState<any[]>([]);
  const [storeSettings, setStoreSettings] = useState<any>(null);
  const [formCompany, setFormCompany] = useState<any>(null);
  const formCompanyInitialized = React.useRef(false);
  const activeTabRef = useRef(activeTab);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dataCacheRef = useRef<{
    static: any;
    lastFetch: number;
  }>({
    static: null,
    lastFetch: 0
  });

  const updateCompanyDraft = useCallback((updater: any) => {
    setFormCompany((prev: any) => {
      const base = prev || {};
      const next = typeof updater === "function" ? updater(base) : { ...base, ...updater };
      return next;
    });
  }, []);
  const [finCategories, setFinCategories] = useState<FinancialCategory[]>([]);
  const [chartAccounts, setChartAccounts] = useState<ChartAccount[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [cashierSessions, setCashierSessions] = useState<CashierSession[]>([]);
  const [activeSession, setActiveSession] = useState<CashierSession | null>(null);
  const [driverTrips, setDriverTrips] = useState<DriverTrip[]>([]);
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>([]);
  const deliveryOrdersRef = useRef<DeliveryOrder[]>([]);
  const isRefreshingOrdersRef = useRef(false);
  const lastOrdersSnapshotRef = useRef("");

  // Debounced refresh function
  const debouncedRefresh = useCallback((type: 'orders' | 'all' | 'financial' | 'operational' = 'orders') => {
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    refreshTimeoutRef.current = setTimeout(() => {
      if (type === 'all') fetchData(false);
      else if (type === 'financial') loadFinancialData();
      else if (type === 'operational') loadOperationalData();
      else refreshDeliveryOrders();
    }, 1500);
  }, []);
  const [historyOrders, setHistoryOrders] = useState<DeliveryOrder[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyFilters, setHistoryFilters] = useState({
    startDate: todayDate,
    endDate: todayDate,
  });
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const soundEnabledRef = useRef(true);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);


  useEffect(() => {
    // Inicialização segura: se já temos storeSettings mas formCompany está nulo, inicializamos.
    // Se o usuário já começou a digitar (formCompany não nulo), NUNCA sobrescrevemos automaticamente.
    if (storeSettings && !formCompanyInitialized.current && !formCompany) {
      setFormCompany(storeSettings);
      formCompanyInitialized.current = true;
    }
  }, [storeSettings, formCompany]);

  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_sound_enabled');
      const val = saved !== 'false';
      soundEnabledRef.current = val;
      return val;
    }
    return true;
  });

  const toggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    soundEnabledRef.current = enabled;
    localStorage.setItem('admin_sound_enabled', String(enabled));
    if (enabled) {
      toast.info("Som de notificações ativado");
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.5; // Som de teste mais baixo
      audio.play().catch(() => {
        toast.error("Erro ao reproduzir som. Por favor, clique em qualquer lugar da tela para permitir áudio.");
      });
    } else {
      toast.info("Som de notificações desativado");
    }
  };


  const playNotificationSound = () => {
    if (!soundEnabledRef.current) return;
    
    try {
      // Usando uma URL de som de notificação padrão do sistema ou uma URL externa estável
      // Mixkit URL pode ser instável em alguns casos, vamos tentar garantir o carregamento
      const audioUrl = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
      const audio = new Audio(audioUrl);
      audio.volume = 1.0;
      
      console.log("🔔 Iniciando reprodução do som...");
      
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log("✅ Som reproduzido com sucesso!");
        }).catch(e => {
          console.warn("⚠️ Som bloqueado:", e);
          toast.error("🔔 Novo pedido! (Clique na tela para ativar o som)", {
            duration: 8000,
          });
        });
      }
    } catch (e) {
      console.error("❌ Erro ao tocar som:", e);
    }
  };

  const refreshDeliveryOrders = async () => {
    if (activeTabRef.current === 'company') return;
    if (isRefreshingOrdersRef.current) return;
    isRefreshingOrdersRef.current = true;
    try {
      const { data: ordersData, error } = await supabase
        .from("delivery_orders")
        .select("*, delivery_order_items(*)")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      const nextOrders = (ordersData || []) as any;
      deliveryOrdersRef.current = nextOrders;
      setDeliveryOrders(nextOrders);
      lastOrdersSnapshotRef.current = nextOrders
        .slice(0, 20)
        .map((order: any) => `${order.id}:${order.status}:${order.updated_at || order.created_at}`)
        .join("|");
    } catch (error) {
      console.error("Erro ao atualizar pedidos:", error);
    } finally {
      isRefreshingOrdersRef.current = false;
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel('admin_delivery_orders_realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'delivery_orders'
      }, (payload) => {
        console.log("🚀 NOVO PEDIDO DETECTADO VIA REALTIME:", payload);
        try {
          toast.success("🔔 NOVO PEDIDO RECEBIDO!", {
            description: `Cliente: ${(payload.new as any)?.customer_name || ''}`,
            duration: 10000,
          });
          playNotificationSound();
          processPrintingForDeliveryOrder((payload.new as any).id).catch(err => {
            console.error("Erro ao processar impressão de delivery via Realtime:", err);
          });
        } catch (e) {
          console.error("Erro ao notificar novo pedido:", e);
        }
        refreshDeliveryOrders();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'delivery_orders'
      }, () => {
        refreshDeliveryOrders();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'delivery_order_items'
      }, () => {
        refreshDeliveryOrders();
      })
      .subscribe((status) => {
        console.log("📡 Realtime delivery_orders status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);



  const [newDeliveryArea, setNewDeliveryArea] = useState<any>({ center_lat: null, center_lng: null, radius_km: 1, polygon_coords: null });
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [editingDeliveryArea, setEditingDeliveryArea] = useState<any>(null);
  const [isDeliveryAreaDialogOpen, setIsDeliveryAreaDialogOpen] = useState(false);
  const [isMapMaximized, setIsMapMaximized] = useState(false);
  const [mapSearch, setMapSearch] = useState("");
  const [areaForm, setAreaForm] = useState({ name: "", fee: "", radius_km: 1 });
  const [AdminDeliveryMapComponent, setAdminDeliveryMapComponent] = useState<any>(null);

  // Carregar AdminDeliveryMap apenas no cliente
  useEffect(() => {
    if (typeof window === 'undefined') return;
    import("@/components/AdminDeliveryMap").then((mod) => {
      setAdminDeliveryMapComponent(() => mod.AdminDeliveryMap);
    }).catch((err) => {
      console.warn("Erro ao carregar AdminDeliveryMap:", err);
    });
  }, []);

  const [complementGroups, setComplementGroups] = useState<any[]>([]);
  const [categoryComplementGroups, setCategoryComplementGroups] = useState<any[]>([]);
  const [productComplementGroups, setProductComplementGroups] = useState<any[]>([]);
  const [selectedCompGroupCategoryIds, setSelectedCompGroupCategoryIds] = useState<string[]>([]);
  const [selectedCompGroupProductIds, setSelectedCompGroupProductIds] = useState<string[]>([]);

  const fetchComplements = async () => {
    const [
      { data: compGroups },
      { data: catCompGroups },
      { data: prodCompGroups }
    ] = await Promise.all([
      supabase.from("complement_groups").select("*, complements(*)").order("name"),
      supabase.from("category_complement_groups").select("*"),
      supabase.from("product_complement_groups").select("*")
    ]);

    if (compGroups) setComplementGroups(compGroups);
    if (catCompGroups) setCategoryComplementGroups(catCompGroups);
    if (prodCompGroups) setProductComplementGroups(prodCompGroups);
  };

  const isBeverageProduct = (product: any) => {
    const categoryName = categories.find(c => c.id === product?.category_id)?.name?.toLowerCase() || product?.categories?.name?.toLowerCase() || "";
    const productName = product?.name?.toLowerCase() || "";
    return categoryName.includes('bebida') || categoryName.includes('suco') || categoryName.includes('refrigerante') || categoryName.includes('cerveja') || categoryName.includes('vinho') ||
      productName.includes('bebida') || productName.includes('suco') || productName.includes('refrigerante') || productName.includes('coca') || productName.includes('guarana') || productName.includes('cerveja');
  };

  const isBeverageComplementGroup = (groupName: string) => {
    const name = groupName.toLowerCase();
    return name.includes('bebida') || name.includes('gelo') || name.includes('limão') || name.includes('limao');
  };

  const getOrderProductComplementGroups = useCallback((product: any) => {
    if (!product) return [];
    const categoryId = product.category_id;
    const productId = product.id;

    const productGroupIds = productComplementGroups
      .filter(pg => pg.group_id && pg.product_id === productId)
      .map(pg => pg.group_id);

    const categoryGroupIds = categoryId
      ? categoryComplementGroups
          .filter(cg => cg.group_id && cg.category_id === categoryId)
          .map(cg => cg.group_id)
      : [];

    const relevantGroupIds = [...new Set([...productGroupIds, ...categoryGroupIds])];

    return complementGroups.filter(group => {
      if (relevantGroupIds.includes(group.id)) return true;

      const hasAnyManualLink =
        productComplementGroups.some(pg => pg.group_id === group.id) ||
        categoryComplementGroups.some(cg => cg.group_id === group.id);

      if (hasAnyManualLink) return false;

      return true;
    });
  }, [complementGroups, categoryComplementGroups, productComplementGroups]);

  const toggleCompGroupCategory = (categoryId: string) => {
    setSelectedCompGroupCategoryIds(prev => 
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    );
  };

  const toggleCompGroupProduct = (productId: string) => {
    setSelectedCompGroupProductIds(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  // Update map search and trigger search when dialog opens for a NEW area
  useEffect(() => {
    if (isDeliveryAreaDialogOpen && !editingDeliveryArea && storeSettings?.city) {
      setMapSearch(storeSettings.city);
      // Trigger search automatically
      setTimeout(() => {
        const btn = document.getElementById('btn-search-map');
        if (btn) (btn as HTMLButtonElement).click();
      }, 500);
    }
  }, [isDeliveryAreaDialogOpen, editingDeliveryArea, storeSettings?.city]);

  // Map state is handled by the AdminDeliveryMap component now.

  const [isCashierDialogOpen, setIsCashierDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [cashierNotes, setCashierNotes] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [tripData, setTripData] = useState({ driver_id: "", trip_count: "1", fee_per_trip: "0", notes: "" });
  const [newDeliveryOrder, setNewDeliveryOrder] = useState({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    address_number: "",
    address_complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zip_code: "",
    order_type: "counter" as "delivery" | "pickup" | "counter",
    delivery_fee: 0,
    notes: "",
    observation: "",
    items: [] as any[],
    activeItem: null as {
      size?: string;
      flavorCount?: string;
      flavors?: any[];
      selectedComplements?: any[];
    } | null,
    search_value: "",
    tipo_venda: "",
    frete: 0 as number
  });
  const [newChartAccount, setNewChartAccount] = useState<any>({
    id: "",
    code: "",
    name: "",
    parent_id: "",
    type: "revenue" as any,
    level: 1
  });
  const [isChartAccountDialogOpen, setIsChartAccountDialogOpen] = useState(false);
  const [isEditChartAccountMode, setIsEditChartAccountMode] = useState(false);
  const [productTaxRules, setProductTaxRules] = useState<Array<{ id: string; nome: string }>>([]);
  const [newProduct, setNewProduct] = useState<any>({ 
    name: "", 
    description: "", 
    price: "", 
    price_2: "",
    discount_percent: "",
    discount_price: "",
    category_id: "", 
    image_url: "", 
    active: true, 
    is_available: true,
    sell_delivery: true,
    sell_dine_in: true,
    sell_digital_menu: true,
    allow_half_half: false, 
    send_to_production: true,
    send_to_kds: true,
    is_pizza_flavor: false,
    is_promotional: false,
    allow_crust: false,
    suggested_products: [],
    size_prices: { "Broto": "", "Grande": "" },
    cest: "",
    cst: "",
    ncm: "",
    unidade: "UN",
    tipo_produto: "MERCADORIA",
    tax_rule_id: ""
  });
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [productStatusFilter, setProductStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>("all");
  const [newTransaction, setNewTransaction] = useState<any>({ 
    id: "", 
    description: "", 
    amount: "", 
    type: "income", 
    category_id: "", 
    chart_account_id: "",
    date: todayDate, 
    due_date: "", 
    payment_date: "", 
    status: "pending", 
    customer_id: "", 
    supplier_id: "" 
  });
  const [isEditTransactionMode, setIsEditTransactionMode] = useState(false);
  const [isViewTransactionMode, setIsViewTransactionMode] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [customers, setCustomers] = useState<{id: string, name: string, phone?: string, email?: string, address?: string, address_number?: string, neighborhood?: string, city?: string, state?: string, zip_code?: string, cnpj?: string, cpf?: string, person_type?: string}[]>([]);
  const [suppliers, setSuppliers] = useState<{id: string, name: string, contact_name?: string, phone?: string, email?: string, address?: string, address_number?: string, city?: string, state?: string, zip_code?: string, cnpj?: string, cpf?: string}[]>([]);
  const [newUser, setNewUser] = useState<any>({ email: "", password: "", fullName: "", role: "funcionario", canDelete: false, isKdsOnly: false, active: true });
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", order: "", image_url: "" });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productDialogTab, setProductDialogTab] = useState<string>("geral");
  const [drivers, setDrivers] = useState<{id: string; name: string; phone: string; daily_rate: number; is_active: boolean; active?: boolean; login?: string; password?: string; auth_user_id?: string | null; has_fixed_fee?: boolean; fixed_fee?: number}[]>([]);
  const [appMotoqueiros, setAppMotoqueiros] = useState<{id: string; full_name: string | null; email: string | null; pedidos_ativos: number | null; profile_id?: string | null}[]>([]);
  // Seleção local do motoqueiro por pedido — só vira atribuição real
  // ao clicar em "Enviar ao entregador".
  const [pendingDriverByOrder, setPendingDriverByOrder] = useState<Record<string, string>>({});
  const [newDriver, setNewDriver] = useState({ name: "", phone: "", daily_rate: "", login: "", password: "", has_fixed_fee: false, fixed_fee: "", active: true });
  const [editingDriver, setEditingDriver] = useState<any | null>(null);
  const [isDriverDialogOpen, setIsDriverDialogOpen] = useState(false);
  const FIXED_DOMAIN = "@meupedix.com.br";
  const [newFinCategory, setNewFinCategory] = useState({ id: "", name: "", type: "income" as "income" | "expense", chart_account_id: "" });
  const [isFinCategoryDialogOpen, setIsFinCategoryDialogOpen] = useState(false);
  const [isOrderComplementDialogOpen, setIsOrderComplementDialogOpen] = useState(false);
  const [suggestionDialog, setSuggestionDialog] = useState<{ open: boolean; products: any[] }>({ open: false, products: [] });
  const [browseCustomerOpen, setBrowseCustomerOpen] = useState(false);
  const [browseCustomerSearch, setBrowseCustomerSearch] = useState("");
  const [editingFinCategory, setEditingFinCategory] = useState<any | null>(null);
  const [isCompGroupDialogOpen, setIsCompGroupDialogOpen] = useState(false);
  const [editingCompGroup, setEditingCompGroup] = useState<any | null>(null);
  const [newCompGroup, setNewCompGroup] = useState({ name: "", min_choices: 0, max_choices: 1 });
  const [isComplementDialogOpen, setIsComplementDialogOpen] = useState(false);
  const [editingComplement, setEditingComplement] = useState<any | null>(null);
  const [newComplement, setNewComplement] = useState({ name: "", price: "0", group_id: "" });
  const [orderProductCategory, setOrderProductCategory] = useState<string>("all");
  const [orderProductSearch, setOrderProductSearch] = useState("");
  const [clientFormExpanded, setClientFormExpanded] = useState(false);
  const [orderPizzaCategory, setOrderPizzaCategory] = useState<string>("all");
  const [selectedSessionDetails, setSelectedSessionDetails] = useState<CashierSession | null>(null);
  const [isSessionDetailsOpen, setIsSessionDetailsOpen] = useState(false);
  
  const [newCustomer, setNewCustomer] = useState({ 
    name: "", email: "", phone: "", address: "", address_number: "", neighborhood: "", city: "", state: "", zip_code: "", address_complement: "",
    person_type: "fisica" as "fisica" | "juridica", cpf: "", cnpj: "", allow_fiado: false
  });
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [customerFilter, setCustomerFilter] = useState({ search: "", person_type: "all" });

  const [newPayMethod, setNewPayMethod] = useState({ name: "", chart_account_id: "" });
  const [editingPayMethod, setEditingPayMethod] = useState<any | null>(null);
  const [isPayMethodDialogOpen, setIsPayMethodDialogOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ 
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
    person_type: "juridica" as "fisica" | "juridica"
  });
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [contactType, setContactType] = useState<"customer" | "supplier">("customer");
  const [financeFilters, setFinanceFilters] = useState({ 
    startDate: todayDate,
    endDate: todayDate, 
    dueStartDate: "2026-01-01", 
    dueEndDate: "", 
    paymentStartDate: "", 
    paymentEndDate: "",
    customerId: "all",
    supplierId: "all",
    search: ""
  });
  // Dashboard stats memoization to avoid expensive calculations on every render
  const dashboardStats = useMemo(() => {
    // Só calcula se estivermos em abas que precisam desses dados ou se for o carregamento inicial
    const today = todayDate;
    const start = financeFilters?.startDate || today;
    const end = financeFilters?.endDate || today;
    
    const periodOrders = deliveryOrders.filter(o => {
      if (activeSession && (!financeFilters.startDate || financeFilters.startDate === today) && (!financeFilters.endDate || financeFilters.endDate === today)) {
        return o.cashier_session_id === activeSession.id && o.status !== 'cancelled';
      }
      const orderDate = o.created_at.split('T')[0];
      return orderDate >= start && orderDate <= end && o.status !== 'cancelled';
    });

    const pendingCount = deliveryOrders.filter(o => o.status === 'pending').length;
    const productionCount = deliveryOrders.filter(o => o.status === 'production').length;
    const readyCount = deliveryOrders.filter(o => o.status === 'ready').length;
    const deliveringCount = deliveryOrders.filter(o => o.status === 'delivering').length;
    const cancelledCount = deliveryOrders.filter(o => o.status === 'cancelled').length;
    
    const totalAmount = periodOrders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);
    const avgTicket = periodOrders.length > 0 ? totalAmount / periodOrders.length : 0;
    
    return {
      periodOrders,
      pendingCount,
      productionCount,
      readyCount,
      deliveringCount,
      cancelledCount,
      totalAmount,
      avgTicket,
      orderVolume: periodOrders.length
    };
  }, [deliveryOrders, financeFilters, activeSession, todayDate]);

  const [financialView, setFinancialView] = useState("all");
  const [editingSupplier, setEditingSupplier] = useState<any | null>(null);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);
  const [isQuickCustomerDialogOpen, setIsQuickCustomerDialogOpen] = useState(false);
  const [isVisualCustomizerOpen, setIsVisualCustomizerOpen] = useState(false);
  const [receivingTransaction, setReceivingTransaction] = useState<any>(null);
  const [receiveData, setReceiveData] = useState({
    payment_date: todayDate,
    payment_method_id: "",
    amount: 0
  });

  const parseMoney = (value: any) => Number.parseFloat(String(value ?? "0").replace(",", ".")) || 0;

  useEffect(() => {
    fetchData();
    
    // Carregar perfis tributários
    (async () => {
      try {
        const { data } = await supabase
          .from('product_tax_rules' as any)
          .select('id, nome')
          .eq('active', true)
          .order('nome');
        if (data) setProductTaxRules(data as any);
      } catch (e) { console.warn('Falha ao carregar perfis tributários', e); }
    })();
    
    // Configurar intervalo para gestão automática do cardápio (checa a cada minuto)
    const intervalId = setInterval(checkAutoMenuManagement, 60000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  useEffect(() => {
    if (storeSettings?.fixed_delivery_fee !== null && storeSettings?.fixed_delivery_fee !== undefined && Number(storeSettings.fixed_delivery_fee) >= 0) {
      setNewDeliveryOrder(prev => ({
        ...prev,
        delivery_fee: prev.order_type === 'counter' ? 0 : Number(storeSettings.fixed_delivery_fee)
      }));
    }
  }, [storeSettings?.fixed_delivery_fee]);


  const checkAutoMenuManagement = async () => {
    try {
      const { data: settings } = await supabase.from("store_settings").select("*").single();
      if (!settings || !settings.auto_manage_menu || !settings.opening_hours) return;

      const now = new Date();
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const currentDay = days[now.getDay()];
      const openingHours = settings.opening_hours as Record<string, any>;
      const daySettings = openingHours?.[currentDay];

      if (!daySettings || !daySettings.active) {
        // Se não está ativo para hoje, garante que fecha
        if (settings.is_menu_active) {
          await supabase.from("store_settings").update({ is_menu_active: false }).eq("id", settings.id);
          setIsMenuOpen(false);
        }
        return;
      }

      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [openH, openM] = daySettings.open.split(':').map(Number);
      const [closeH, closeM] = daySettings.close.split(':').map(Number);
      
      const openTime = openH * 60 + openM;
      const closeTime = closeH * 60 + closeM;

      let shouldBeOpen = false;
      if (closeTime > openTime) {
        // Horário normal (ex: 18:00 às 23:00)
        shouldBeOpen = currentTime >= openTime && currentTime < closeTime;
      } else {
        // Horário que vira a noite (ex: 18:00 às 02:00)
        shouldBeOpen = currentTime >= openTime || currentTime < closeTime;
      }

      if (shouldBeOpen !== !!settings.is_menu_active) {
        await supabase.from("store_settings").update({ is_menu_active: shouldBeOpen }).eq("id", settings.id);
        setIsMenuOpen(shouldBeOpen);
        console.log(`Gestão Automática: Cardápio ${shouldBeOpen ? 'Aberto' : 'Fechado'} automaticamente.`);
      }
    } catch (error) {
      console.error("Erro na gestão automática do cardápio:", error);
    }
  };

  const loadFinancialData = async () => {
    try {
      const { data: trans } = await supabase
        .from("financial_transactions")
        .select("*, financial_categories(name), chart_of_accounts(name, code, type), customers(name), suppliers(name)")
        .order("date", { ascending: false })
        .limit(200);
      if (trans) setTransactions(trans as any);
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
    }
  };

  const loadOperationalData = async () => {
    try {
      const [
        { data: sessions },
        { data: trips },
        { data: custs },
        { data: supps }
      ] = await Promise.all([
        // NOTA: cashier_sessions é buscado sempre para saber a sessão ATIVA (necessária
        // para o funcionamento do caixa em si). A exibição do Histórico é controlada
        // apenas visualmente via `showCaixaHistorico`. Para blindagem real (evitar exposição
        // via Network) seria preciso mover para RLS/edge function.
        supabase.from("cashier_sessions").select("*").order("opened_at", { ascending: false }).limit(50),
        supabase.from("driver_trips").select("*, drivers(name)").order("created_at", { ascending: false }).limit(50),
        supabase.from("customers").select("*").order("name").limit(100),
        supabase.from("suppliers").select("*").order("name").limit(100)
      ]);

      if (sessions) {
        setCashierSessions(sessions as any);
        setActiveSession((sessions as any).find((s: any) => s.status === 'open') || null);
      }
      if (trips) setDriverTrips(trips as any);
      if (custs) setCustomers(custs as any);
      if (supps) setSuppliers(supps as any);
    } catch (error) {
      console.error("Erro ao carregar dados operacionais:", error);
    }
  };

  const fetchData = async (showLoading = true, forceRefresh = false) => {
    try {
      if (showLoading && !initialLoading) setLoading(true);

      const now = Date.now();
      const CACHE_TTL = 300000; // 5 minutes for truly static data

      let staticData = dataCacheRef.current.static;
      
      if (forceRefresh || !staticData || (now - dataCacheRef.current.lastFetch > CACHE_TTL)) {
        console.log("📦 Buscando dados estáticos (Cache expirado ou inexistente)");
        const results = await Promise.all([
          supabase.from("products").select("*, categories(name)").in("product_type" as any, ["VENDA","AMBOS"]).order("created_at", { ascending: false }).limit(200),
          supabase.from("categories").select("*").order("order", { ascending: true }),
          supabase.from("delivery_areas").select("*").order("name"),
          supabase.from("store_settings").select("*").single(),
          supabase.from("financial_categories").select("*").order("name"),
          supabase.from("chart_of_accounts").select("*").order("code"),
          supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(100),
          (supabase.from as any)("drivers").select("*").order("name"),
          supabase.from("payment_methods").select("*").order("name"),
          supabase.from("complement_groups").select("*, complements(*)").order("name"),
          supabase.from("category_complement_groups").select("*"),
          supabase.from("product_complement_groups").select("*")
        ]);
        
        staticData = results;
        dataCacheRef.current = { static: results, lastFetch: now };
      }

      const [
        { data: prods }, 
        { data: cats }, 
        { data: delAreas },
        { data: settings },
        { data: finCats }, 
        { data: charts },
        { data: profs },
        { data: drvs },
        { data: payMethods },
        { data: compGroups },
        { data: catCompGroups },
        { data: prodCompGroups }
      ] = staticData;

      if (prods) setProducts(prods as any);
      if (typeof window !== 'undefined' && prods) {
        window.allProducts = prods as any;
      }
      if (cats) setCategories(cats as any);
      if (delAreas) setDeliveryAreas(delAreas as any);
      if (settings) {
        console.log("⚙️ Configurações da loja carregadas:", settings.kds_enabled);
        setStoreSettings((prev: any) => {
          if (activeTabRef.current === 'company' && prev && prev.id === settings.id) {
            return prev;
          }
          return settings;
        });
        setIsMenuOpen(!!(settings as any).is_menu_active);
      }

      if (finCats) setFinCategories(finCats as any);
      if (charts) setChartAccounts(charts as any);
      if (drvs) setDrivers(Array.isArray(drvs) ? drvs.map((d: any) => ({ ...d, active: d.is_active })) : []);
      if (Array.isArray(profs) && profs.length > 0) {
        setProfiles(profs as any);
      } else {
        const sessionProfile = getSessionProfileFallback();
        setProfiles(sessionProfile ? [sessionProfile] : []);
      }
      if (compGroups) setComplementGroups(compGroups);
      if (catCompGroups) setCategoryComplementGroups(catCompGroups);
      if (prodCompGroups) setProductComplementGroups(prodCompGroups);
      if (payMethods) setPaymentMethods(payMethods as any);

      // Dados Transacionais/Operacionais (Sempre carregados no mount ou refresh total)
      await loadOperationalData();

      if (activeTabRef.current !== 'company' && activeTabRef.current !== 'users') {
        refreshDeliveryOrders();
        loadFinancialData();
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados fundamentais.");
    } finally {
      if (showLoading) setLoading(false);
      setInitialLoading(false);
    }
  };

  const loadLargeData = async () => {
    try {
      const { data: trans } = await supabase.from("financial_transactions").select("*, financial_categories(name), chart_of_accounts(name, code, type), customers(name), suppliers(name)").order("date", { ascending: false }).limit(200);
      const { data: ordersData } = await supabase.from("delivery_orders").select("*, delivery_order_items(*)").order("created_at", { ascending: false }).limit(200);

      if (trans) setTransactions(trans as any);
      if (ordersData) {
        const nextOrders = ordersData as any;
        deliveryOrdersRef.current = nextOrders;
        setDeliveryOrders(nextOrders);
        lastOrdersSnapshotRef.current = nextOrders
          .slice(0, 20)
          .map((order: any) => `${order.id}:${order.status}:${order.updated_at || order.created_at}`)
          .join("|");
      }
      
      // Não chame fetchData aqui: loadLargeData já é chamado por fetchData e isso criava um loop de recarregamento.
    } catch (error) {
      console.error("Erro ao carregar dados volumosos:", error);
    }
  };

  const fetchHistoryOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("delivery_orders")
        .select("*, delivery_order_items(*)")
        .gte("created_at", `${historyFilters.startDate}T00:00:00-03:00`)
        .lte("created_at", `${historyFilters.endDate}T23:59:59-03:00`)
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;
      setHistoryOrders((data as any) || []);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      toast.error("Erro ao buscar histórico de pedidos.");
    } finally {
      setLoading(false);
    }
  };

  const exportOrdersReport = () => {
    if (historyOrders.length === 0) {
      toast.error("Não há pedidos no período selecionado para exportar.");
      return;
    }

    const headers = ["Data", "Hora", "Cliente", "Status", "Tipo", "Pagamento", "Subtotal", "Taxa Entrega", "Total"];
    const rows = historyOrders.map(order => [
      formatDisplayDate(order.created_at, 'dd/MM/yyyy'),
      formatDisplayDate(order.created_at, 'HH:mm'),

      order.customer_name,
      order.status,
      order.order_type === 'delivery' ? 'Entrega' : order.order_type === 'pickup' ? 'Retirada' : 'Balcão',
      order.payment_method || "Não inf.",
      (order.total_amount - ((order as any).delivery_fee || 0)).toFixed(2),
      ((order as any).delivery_fee || 0).toFixed(2),
      order.total_amount.toFixed(2)
    ]);

    const csvContent = [
      headers.join(";"),
      ...rows.map(row => row.join(";"))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_pedidos_${historyFilters.startDate}_a_${historyFilters.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Relatório exportado com sucesso!");
  };

  const printOrdersReport = () => {
    if (historyOrders.length === 0) {
      toast.error("Não há pedidos no período selecionado.");
      return;
    }

    const totalPedidos = historyOrders.length;
    const totalValor = historyOrders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
    const totalEntrega = historyOrders.reduce(
      (acc, o) => acc + Number((o as any).delivery_fee || 0),
      0,
    );
    const ticketMedio = totalValor / totalPedidos;

    const byStatus: Record<string, { qtd: number; valor: number }> = {};
    const byTipo: Record<string, { qtd: number; valor: number }> = {};
    const byPagto: Record<string, { qtd: number; valor: number }> = {};
    historyOrders.forEach((o) => {
      const v = Number(o.total_amount || 0);
      const s = o.status || "—";
      const t =
        o.order_type === "delivery"
          ? "Entrega"
          : o.order_type === "pickup"
            ? "Retirada"
            : "Balcão";
      const p = o.payment_method || "Não inf.";
      byStatus[s] = byStatus[s] || { qtd: 0, valor: 0 };
      byStatus[s].qtd++;
      byStatus[s].valor += v;
      byTipo[t] = byTipo[t] || { qtd: 0, valor: 0 };
      byTipo[t].qtd++;
      byTipo[t].valor += v;
      byPagto[p] = byPagto[p] || { qtd: 0, valor: 0 };
      byPagto[p].qtd++;
      byPagto[p].valor += v;
    });

    const fmt = (n: number) => `R$ ${Number(n || 0).toFixed(2).replace(".", ",")}`;

    const summaryBlock = (
      title: string,
      data: Record<string, { qtd: number; valor: number }>,
    ) => `
      <div style="flex:1; min-width:200px;">
        <h3 style="font-size:13px; margin:0 0 6px 0; color:#444; border-bottom:1px solid #ddd; padding-bottom:4px;">${title}</h3>
        <table style="width:100%; border-collapse:collapse; font-size:11px;">
          ${Object.entries(data)
            .map(
              ([k, v]) => `
            <tr>
              <td style="padding:3px 4px; border-bottom:1px dotted #eee;">${k}</td>
              <td style="padding:3px 4px; border-bottom:1px dotted #eee; text-align:center;">${v.qtd}</td>
              <td style="padding:3px 4px; border-bottom:1px dotted #eee; text-align:right;">${fmt(v.valor)}</td>
            </tr>`,
            )
            .join("")}
        </table>
      </div>`;

    const rowsHtml = historyOrders
      .map((o, i) => {
        const tipo =
          o.order_type === "delivery"
            ? "Entrega"
            : o.order_type === "pickup"
              ? "Retirada"
              : "Balcão";
        const subtotal =
          Number(o.total_amount || 0) - Number((o as any).delivery_fee || 0);
        return `
        <tr style="background:${i % 2 ? "#fafafa" : "#fff"};">
          <td style="padding:6px 4px; border-bottom:1px solid #eee;">${formatDisplayDate(o.created_at, "dd/MM/yyyy")}</td>
          <td style="padding:6px 4px; border-bottom:1px solid #eee;">${formatDisplayDate(o.created_at, "HH:mm")}</td>
          <td style="padding:6px 4px; border-bottom:1px solid #eee;">#${(o as any).order_number || String(o.id || "").slice(0, 6)}</td>
          <td style="padding:6px 4px; border-bottom:1px solid #eee;">${o.customer_name || "—"}</td>
          <td style="padding:6px 4px; border-bottom:1px solid #eee;">${tipo}</td>
          <td style="padding:6px 4px; border-bottom:1px solid #eee;">${o.status || "—"}</td>
          <td style="padding:6px 4px; border-bottom:1px solid #eee;">${o.payment_method || "—"}</td>
          <td style="padding:6px 4px; border-bottom:1px solid #eee; text-align:right;">${fmt(subtotal)}</td>
          <td style="padding:6px 4px; border-bottom:1px solid #eee; text-align:right;">${fmt(Number((o as any).delivery_fee || 0))}</td>
          <td style="padding:6px 4px; border-bottom:1px solid #eee; text-align:right; font-weight:bold;">${fmt(Number(o.total_amount || 0))}</td>
        </tr>`;
      })
      .join("");

    const html = `<html>
<head>
  <title>Relatório de Pedidos</title>
  <style>
    @page { size: A4 landscape; margin: 10mm; }
    body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:#222; margin:0; padding:0; }
    .header { border-bottom:2px solid #ea580c; padding-bottom:10px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:flex-end; }
    .header h1 { margin:0; font-size:20px; color:#ea580c; }
    .header p { margin:2px 0 0 0; font-size:12px; color:#666; }
    .kpis { display:flex; gap:10px; margin-bottom:14px; }
    .kpi { flex:1; background:#fff7ed; border:1px solid #fed7aa; border-radius:8px; padding:10px; text-align:center; }
    .kpi .label { font-size:11px; color:#9a3412; text-transform:uppercase; letter-spacing:.5px; }
    .kpi .value { font-size:18px; font-weight:bold; color:#c2410c; margin-top:4px; }
    .breakdown { display:flex; gap:14px; margin-bottom:14px; flex-wrap:wrap; }
    table.main { width:100%; border-collapse:collapse; font-size:11px; }
    table.main thead th { background:#ea580c; color:white; padding:8px 4px; text-align:left; font-size:11px; }
    table.main thead th.right { text-align:right; }
    .footer { margin-top:14px; padding-top:8px; border-top:1px dashed #aaa; font-size:10px; color:#666; display:flex; justify-content:space-between; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Relatório de Pedidos</h1>
      <p>Período: ${historyFilters.startDate} a ${historyFilters.endDate}</p>
    </div>
    <div style="text-align:right; font-size:11px; color:#666;">
      Gerado em ${new Date().toLocaleString("pt-BR")}
    </div>
  </div>

  <div class="kpis">
    <div class="kpi"><div class="label">Total de Pedidos</div><div class="value">${totalPedidos}</div></div>
    <div class="kpi"><div class="label">Faturamento</div><div class="value">${fmt(totalValor)}</div></div>
    <div class="kpi"><div class="label">Taxa de Entrega</div><div class="value">${fmt(totalEntrega)}</div></div>
    <div class="kpi"><div class="label">Ticket Médio</div><div class="value">${fmt(ticketMedio)}</div></div>
  </div>

  <div class="breakdown">
    ${summaryBlock("Por Status", byStatus)}
    ${summaryBlock("Por Tipo", byTipo)}
    ${summaryBlock("Por Pagamento", byPagto)}
  </div>

  <table class="main">
    <thead>
      <tr>
        <th>Data</th><th>Hora</th><th>Nº</th><th>Cliente</th><th>Tipo</th>
        <th>Status</th><th>Pagamento</th>
        <th class="right">Subtotal</th><th class="right">Entrega</th><th class="right">Total</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
    <tfoot>
      <tr style="background:#fff7ed; font-weight:bold;">
        <td colspan="7" style="padding:8px 4px; text-align:right;">TOTAIS</td>
        <td style="padding:8px 4px; text-align:right;">${fmt(totalValor - totalEntrega)}</td>
        <td style="padding:8px 4px; text-align:right;">${fmt(totalEntrega)}</td>
        <td style="padding:8px 4px; text-align:right; color:#c2410c;">${fmt(totalValor)}</td>
      </tr>
    </tfoot>
  </table>

  <div class="footer">
    <span>${totalPedidos} pedido(s) listado(s)</span>
    <span>www.meupedix.com.br</span>
  </div>

  <script>window.onload = () => window.print();</script>
</body>
</html>`;

    const w = window.open("", "_blank", "width=1200,height=800");
    if (!w) {
      toast.error("Permita pop-ups para imprimir o relatório.");
      return;
    }
    w.document.write(html);
    w.document.close();
  };

  const printOrdersReportPrinter = async () => {
    if (historyOrders.length === 0) {
      toast.error("Não há pedidos no período selecionado.");
      return;
    }

    const { data: cfg } = await supabase
      .from("store_settings")
      .select("print_paper_format,name")
      .maybeSingle();
    const isThermal = (cfg as any)?.print_paper_format !== "a4";
    const companyName = (cfg as any)?.name || "";

    const totalPedidos = historyOrders.length;
    const totalValor = historyOrders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
    const totalEntrega = historyOrders.reduce(
      (acc, o) => acc + Number((o as any).delivery_fee || 0),
      0,
    );
    const ticketMedio = totalValor / totalPedidos;

    const byStatus: Record<string, { qtd: number; valor: number }> = {};
    const byTipo: Record<string, { qtd: number; valor: number }> = {};
    const byPagto: Record<string, { qtd: number; valor: number }> = {};
    historyOrders.forEach((o) => {
      const v = Number(o.total_amount || 0);
      const s = o.status || "—";
      const t =
        o.order_type === "delivery"
          ? "Entrega"
          : o.order_type === "pickup"
            ? "Retirada"
            : "Balcão";
      const p = o.payment_method || "Não inf.";
      byStatus[s] = byStatus[s] || { qtd: 0, valor: 0 };
      byStatus[s].qtd++;
      byStatus[s].valor += v;
      byTipo[t] = byTipo[t] || { qtd: 0, valor: 0 };
      byTipo[t].qtd++;
      byTipo[t].valor += v;
      byPagto[p] = byPagto[p] || { qtd: 0, valor: 0 };
      byPagto[p].qtd++;
      byPagto[p].valor += v;
    });

    const fmt = (n: number) => `R$ ${Number(n || 0).toFixed(2).replace(".", ",")}`;

    let html = "";

    if (isThermal) {
      const linhaItem = (label: string, q: number, v: number) =>
        `<tr><td style="padding:1px 0;">${label}</td><td style="text-align:center;padding:1px 4px;">${q}</td><td style="text-align:right;padding:1px 0;white-space:nowrap;">${fmt(v)}</td></tr>`;

      const pedidosHtml = historyOrders
        .map((o) => {
          const num = (o as any).order_number || String(o.id || "").slice(0, 6);
          const hora = formatDisplayDate(o.created_at, "dd/MM HH:mm");
          return `<tr>
            <td style="padding:1px 0;">${hora} #${num}<br/><span style="font-size:10px;">${o.customer_name || "—"} · ${o.payment_method || "—"}</span></td>
            <td style="text-align:right;padding:1px 0;white-space:nowrap;font-weight:bold;">${fmt(Number(o.total_amount || 0))}</td>
          </tr>`;
        })
        .join("");

      html = `<html><head><title>Relatório de Pedidos</title>
<style>
@page { size: 80mm auto; margin: 0; }
* { box-sizing: border-box; }
html, body { width: 72mm; }
body { font-family: 'Courier New', monospace; padding: 2mm; margin:0; font-size: 11px; }
h2 { font-size: 13px; text-align:center; margin: 2px 0; text-transform:uppercase; }
.hdr { text-align:center; border-bottom:1px dashed #000; padding-bottom:4px; margin-bottom:4px; }
.sec { font-weight:bold; text-transform:uppercase; border-top:1px dashed #000; margin-top:6px; padding-top:4px; font-size:11px; }
table { width:100%; border-collapse:collapse; font-size:11px; }
.tot { border-top:1px dashed #000; margin-top:6px; padding-top:4px; font-weight:bold; font-size:12px; }
.tot div { display:flex; justify-content:space-between; }
.foot { text-align:center; border-top:1px dashed #000; margin-top:6px; padding-top:4px; font-size:10px; }
</style></head>
<body>
<div class="hdr">
  ${companyName ? `<div style="font-weight:bold;">${companyName}</div>` : ""}
  <h2>Relatório de Pedidos</h2>
  <div>${historyFilters.startDate} a ${historyFilters.endDate}</div>
  <div style="font-size:10px;">Gerado em ${new Date().toLocaleString("pt-BR")}</div>
</div>

<div class="tot">
  <div><span>Pedidos:</span><span>${totalPedidos}</span></div>
  <div><span>Faturamento:</span><span>${fmt(totalValor)}</span></div>
  <div><span>Tx. Entrega:</span><span>${fmt(totalEntrega)}</span></div>
  <div><span>Ticket Médio:</span><span>${fmt(ticketMedio)}</span></div>
</div>

<div class="sec">Por Status</div>
<table>${Object.entries(byStatus).map(([k, v]) => linhaItem(k, v.qtd, v.valor)).join("")}</table>

<div class="sec">Por Tipo</div>
<table>${Object.entries(byTipo).map(([k, v]) => linhaItem(k, v.qtd, v.valor)).join("")}</table>

<div class="sec">Por Pagamento</div>
<table>${Object.entries(byPagto).map(([k, v]) => linhaItem(k, v.qtd, v.valor)).join("")}</table>

<div class="sec">Pedidos</div>
<table>${pedidosHtml}</table>

<div class="tot"><div><span>TOTAL:</span><span>${fmt(totalValor)}</span></div></div>

<div class="foot">www.meupedix.com.br</div>
<script>window.onload = () => window.print();</script>
</body></html>`;
    } else {
      const summaryBlock = (
        title: string,
        data: Record<string, { qtd: number; valor: number }>,
      ) => `
        <div style="flex:1; min-width:200px;">
          <h3 style="font-size:13px; margin:0 0 6px 0; color:#444; border-bottom:1px solid #ddd; padding-bottom:4px;">${title}</h3>
          <table style="width:100%; border-collapse:collapse; font-size:11px;">
            ${Object.entries(data)
              .map(
                ([k, v]) => `<tr>
                <td style="padding:3px 4px; border-bottom:1px dotted #eee;">${k}</td>
                <td style="padding:3px 4px; border-bottom:1px dotted #eee; text-align:center;">${v.qtd}</td>
                <td style="padding:3px 4px; border-bottom:1px dotted #eee; text-align:right;">${fmt(v.valor)}</td>
              </tr>`,
              )
              .join("")}
          </table>
        </div>`;

      const rowsHtml = historyOrders
        .map((o, i) => {
          const tipo =
            o.order_type === "delivery"
              ? "Entrega"
              : o.order_type === "pickup"
                ? "Retirada"
                : "Balcão";
          const subtotal =
            Number(o.total_amount || 0) - Number((o as any).delivery_fee || 0);
          return `<tr style="background:${i % 2 ? "#fafafa" : "#fff"};">
            <td style="padding:6px 4px; border-bottom:1px solid #eee;">${formatDisplayDate(o.created_at, "dd/MM/yyyy HH:mm")}</td>
            <td style="padding:6px 4px; border-bottom:1px solid #eee;">#${(o as any).order_number || String(o.id || "").slice(0, 6)}</td>
            <td style="padding:6px 4px; border-bottom:1px solid #eee;">${o.customer_name || "—"}</td>
            <td style="padding:6px 4px; border-bottom:1px solid #eee;">${tipo}</td>
            <td style="padding:6px 4px; border-bottom:1px solid #eee;">${o.status || "—"}</td>
            <td style="padding:6px 4px; border-bottom:1px solid #eee;">${o.payment_method || "—"}</td>
            <td style="padding:6px 4px; border-bottom:1px solid #eee; text-align:right;">${fmt(subtotal)}</td>
            <td style="padding:6px 4px; border-bottom:1px solid #eee; text-align:right;">${fmt(Number((o as any).delivery_fee || 0))}</td>
            <td style="padding:6px 4px; border-bottom:1px solid #eee; text-align:right; font-weight:bold;">${fmt(Number(o.total_amount || 0))}</td>
          </tr>`;
        })
        .join("");

      html = `<html><head><title>Relatório de Pedidos</title>
<style>
@page { size: A4; margin: 12mm; }
body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:#222; margin:0; padding:0; }
.header { border-bottom:2px solid #ea580c; padding-bottom:10px; margin-bottom:12px; }
.header .empresa { font-size:11px; color:#666; text-transform:uppercase; letter-spacing:1px; }
.header h1 { margin:4px 0 0 0; font-size:20px; color:#ea580c; }
.header p { margin:2px 0 0 0; font-size:12px; color:#666; }
.kpis { display:flex; gap:10px; margin-bottom:14px; }
.kpi { flex:1; background:#fff7ed; border:1px solid #fed7aa; border-radius:8px; padding:10px; text-align:center; }
.kpi .label { font-size:11px; color:#9a3412; text-transform:uppercase; letter-spacing:.5px; }
.kpi .value { font-size:18px; font-weight:bold; color:#c2410c; margin-top:4px; }
.breakdown { display:flex; gap:14px; margin-bottom:14px; flex-wrap:wrap; }
table.main { width:100%; border-collapse:collapse; font-size:11px; }
table.main thead th { background:#ea580c; color:white; padding:8px 4px; text-align:left; font-size:11px; }
table.main thead th.right { text-align:right; }
.footer { margin-top:14px; padding-top:8px; border-top:1px dashed #aaa; font-size:10px; color:#666; display:flex; justify-content:space-between; }
</style></head>
<body>
<div class="header">
  ${companyName ? `<div class="empresa">${companyName}</div>` : ""}
  <h1>Relatório de Pedidos</h1>
  <p>Período: ${historyFilters.startDate} a ${historyFilters.endDate} · Gerado em ${new Date().toLocaleString("pt-BR")}</p>
</div>

<div class="kpis">
  <div class="kpi"><div class="label">Pedidos</div><div class="value">${totalPedidos}</div></div>
  <div class="kpi"><div class="label">Faturamento</div><div class="value">${fmt(totalValor)}</div></div>
  <div class="kpi"><div class="label">Tx. Entrega</div><div class="value">${fmt(totalEntrega)}</div></div>
  <div class="kpi"><div class="label">Ticket Médio</div><div class="value">${fmt(ticketMedio)}</div></div>
</div>

<div class="breakdown">
  ${summaryBlock("Por Status", byStatus)}
  ${summaryBlock("Por Tipo", byTipo)}
  ${summaryBlock("Por Pagamento", byPagto)}
</div>

<table class="main">
  <thead><tr>
    <th>Data/Hora</th><th>Nº</th><th>Cliente</th><th>Tipo</th><th>Status</th><th>Pagamento</th>
    <th class="right">Subtotal</th><th class="right">Entrega</th><th class="right">Total</th>
  </tr></thead>
  <tbody>${rowsHtml}</tbody>
  <tfoot><tr style="background:#fff7ed; font-weight:bold;">
    <td colspan="6" style="padding:8px 4px; text-align:right;">TOTAIS</td>
    <td style="padding:8px 4px; text-align:right;">${fmt(totalValor - totalEntrega)}</td>
    <td style="padding:8px 4px; text-align:right;">${fmt(totalEntrega)}</td>
    <td style="padding:8px 4px; text-align:right; color:#c2410c;">${fmt(totalValor)}</td>
  </tr></tfoot>
</table>

<div class="footer">
  <span>${totalPedidos} pedido(s) listado(s)</span>
  <span>www.meupedix.com.br</span>
</div>
<script>window.onload = () => window.print();</script>
</body></html>`;
    }

    const w = window.open("", "_blank", "width=1000,height=800");
    if (!w) {
      toast.error("Permita pop-ups para imprimir o relatório.");
      return;
    }
    w.document.write(html);
    w.document.close();
  };



  useEffect(() => {
    if (isHistoryOpen) {
      fetchHistoryOrders();
    }
  }, [isHistoryOpen, historyFilters.startDate, historyFilters.endDate]);

  // Ao acessar o módulo de Pedidos (aba "history_module"), garante filtro do dia de hoje e dispara a busca
  useEffect(() => {
    if (activeTab === 'history_module') {
      const today = getTodayDate();
      setHistoryFilters({ startDate: today, endDate: today });
      // pequena espera para garantir que o state atualizou antes do fetch
      setTimeout(() => { fetchHistoryOrders(); }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Realtime: sincroniza current_stock/minimum_stock/unit da tabela products sem precisar de F5
  useEffect(() => {
    const channel = supabase
      .channel('products-stock-sync')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, (payload: any) => {
        const updated = payload.new;
        if (!updated?.id) return;
        setProducts((prev: any[]) => prev.map(p => p.id === updated.id
          ? { ...p, current_stock: updated.current_stock, minimum_stock: updated.minimum_stock, unit: updated.unit, control_inventory: updated.control_inventory }
          : p));
        if (typeof window !== 'undefined' && Array.isArray((window as any).allProducts)) {
          (window as any).allProducts = (window as any).allProducts.map((p: any) => p.id === updated.id
            ? { ...p, current_stock: updated.current_stock, minimum_stock: updated.minimum_stock, unit: updated.unit, control_inventory: updated.control_inventory }
            : p);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleCalcDeliveryFee = async (orderData?: any) => {
    // GPS/geocoding removido a pedido do usuário.
    // Aplica somente a taxa fixa cadastrada nas configurações da empresa (se houver).
    try {
      if (storeSettings?.fixed_delivery_fee !== null && storeSettings?.fixed_delivery_fee !== undefined && Number(storeSettings.fixed_delivery_fee) >= 0) {
        const fixedFee = Number(storeSettings.fixed_delivery_fee);
        setNewDeliveryOrder(prev => ({ ...prev, delivery_fee: fixedFee }));
      }
    } catch {}
  };


  const handleLogout = async () => {
    localStorage.removeItem('admin_session');
    window.location.href = "/login";
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password) {
      toast.error("Preencha e-mail e senha.");
      return;
    }

    // Regra de segurança: Somente master ou administrador pode alterar acessos
    // Se não houver nenhum admin/master no sistema ainda (profiles vazio ou todos roles funcionario), permitimos a primeira criação
    const hasAdmin = profiles.some(p => p.role === 'master' || p.role === 'administrador');
    const isCurrentUserAdmin = user?.role === 'master' || user?.role === 'administrador';

    if (hasAdmin && !isCurrentUserAdmin) {
      toast.error("Somente administradores ou master podem alterar os acessos.");
      return;
    }

    try {
      setLoading(true);
      let emailToCreate = newUser.email.trim();
      if (!emailToCreate.includes("@")) {
        emailToCreate = `${emailToCreate}${FIXED_DOMAIN}`;
      }
      
      let error;
      let savedProfileId: string | undefined = newUser.id;
      const allowedModules = newUser.role === 'funcionario' ? (newUser.allowedModules || []) : [];
      const profilePayload = {
        email: emailToCreate,
        password: newUser.password,
        full_name: newUser.fullName,
        role: newUser.role || 'funcionario',
        can_delete: newUser.canDelete,
        can_cancel: newUser.canCancel,
        is_kds_only: newUser.isKdsOnly,
        allowed_modules: allowedModules,
        visible_fields: newUser.role === 'funcionario' ? (newUser.visibleFields || []) : [],
        active: newUser.active
      } as any;

      if (newUser.id) {
        const { error: updateError } = await supabase.from("profiles").update(profilePayload).eq("id", newUser.id);
        error = updateError;
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("profiles")
          .insert(profilePayload)
          .select("id")
          .single();
        error = insertError;
        savedProfileId = (inserted as any)?.id;
      }

      if (error) throw error;

      // Sincroniza com a tabela drivers quando o módulo "entregador" está habilitado
      if (savedProfileId && allowedModules.includes('entregador')) {
        const driverPayload: any = {
          id: savedProfileId,
          name: newUser.fullName || emailToCreate,
          login: emailToCreate,
          password: newUser.password || '',
          phone: newUser.phone || '',
          active: newUser.active !== false,
          is_active: newUser.active !== false,
          daily_rate: 40,
          has_fixed_fee: false,
          fixed_fee: 0,
          auth_user_id: savedProfileId,
        };
        const { error: driverError } = await (supabase.from as any)("drivers").upsert(driverPayload, { onConflict: 'id' });
        if (driverError) {
          console.warn('[drivers] erro ao sincronizar entregador:', driverError);
          toast.warning('Usuário salvo, mas houve um erro ao sincronizar o entregador: ' + driverError.message);
        }
      } else if (savedProfileId && !allowedModules.includes('entregador') && newUser.role === 'funcionario') {
        // Se o módulo foi removido, desativa o driver correspondente (não remove para preservar histórico)
        await (supabase.from as any)("drivers").update({ active: false, is_active: false }).eq('id', savedProfileId);
      }

      toast.success(newUser.id ? "Usuário atualizado com sucesso!" : "Usuário cadastrado com sucesso!");
      setNewUser({ email: "", password: "", fullName: "", role: "funcionario", canDelete: false, canCancel: false, isKdsOnly: false, active: true });
      setIsUserDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar acesso.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error("Digite o nome da categoria.");
      return;
    }
    try {
      setLoading(true);
      const payload = { 
        name: newCategory.name.trim(),
        order: parseInt(newCategory.order) || 0,
        image_url: newCategory.image_url
      };
      
      let error;
      if (editingCategory) {
        console.log("Updating category:", editingCategory.id, payload);
        const { error: updateError } = await supabase.from("categories").update(payload).eq("id", editingCategory.id);
        error = updateError;
      } else {
        console.log("Inserting category:", payload);
        const { error: insertError } = await supabase.from("categories").insert(payload);
        error = insertError;
      }

      if (error) {
        console.error("Erro detalhado do Supabase:", error);
        throw error;
      }
      
      toast.success(editingCategory ? "Categoria atualizada!" : "Categoria criada!");
      setNewCategory({ name: "", order: "", image_url: "" });
      setEditingCategory(null);
      await fetchData(true, true);
    } catch (error: any) {
      console.error("Catch handleAddCategory:", error);
      toast.error(error.message || "Erro ao salvar categoria.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.category_id) {
      toast.error("Preencha todos os campos.");
      return;
    }
    try {
      const { error } = await supabase.from("financial_transactions").insert([{
        description: newTransaction.description,
        amount: parseFloat(newTransaction.amount),
        type: newTransaction.type as any,
        category_id: newTransaction.category_id,
        date: newTransaction.date
      }]);
      if (error) throw error;
      toast.success("Lançamento realizado!");
      setNewTransaction({ description: "", amount: "", type: "income", category_id: "", date: todayDate });
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAddFinCategory = async () => {
    if (!newFinCategory.name.trim()) {
      toast.error("Digite o nome da categoria.");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        name: newFinCategory.name.trim(),
        type: newFinCategory.type,
        chart_account_id: newFinCategory.chart_account_id || null
      };

      let error;
      if (editingFinCategory) {
        const { error: updateError } = await supabase.from("financial_categories").update(payload).eq("id", editingFinCategory.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from("financial_categories").insert([payload]);
        error = insertError;
      }

      if (error) throw error;
      toast.success(editingFinCategory ? "Categoria financeira atualizada!" : "Categoria financeira criada!");
      setNewFinCategory({ id: "", name: "", type: "income", chart_account_id: "" });
      setEditingFinCategory(null);
      await fetchData(true, true);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  const calculateDRE = () => {
    const dre: any = {};
    
    const filteredTrans = transactions.filter(t => {
      const matchesStartDate = !financeFilters.startDate || t.date >= financeFilters.startDate;
      const matchesEndDate = !financeFilters.endDate || t.date <= financeFilters.endDate;
      return matchesStartDate && matchesEndDate && (t as any).status === 'paid';
    });

    chartAccounts.forEach(account => {
      const amount = filteredTrans
        .filter(t => t.chart_account_id === account.id)
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      dre[account.id] = {
        ...account,
        amount
      };
    });

    // Subir os valores para os pais
    const sortedLevels = [...new Set(chartAccounts.map(a => a.level))].sort((a, b) => b - a);
    sortedLevels.forEach(level => {
      chartAccounts.filter(a => a.level === level).forEach(account => {
        if (account.parent_id) {
          if (!dre[account.parent_id]) {
            const parent = chartAccounts.find(p => p.id === account.parent_id);
            if (parent) dre[account.parent_id] = { ...parent, amount: 0 };
          }
          if (dre[account.parent_id]) {
            dre[account.parent_id].amount += dre[account.id]?.amount || 0;
          }
        }
      });
    });

    return Object.values(dre).sort((a: any, b: any) => a.code.localeCompare(b.code));
  };
  const handleAddChartAccount = async () => {
    if (!newChartAccount.code || !newChartAccount.name) {
      toast.error("Preencha código e nome.");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        code: newChartAccount.code,
        name: newChartAccount.name,
        parent_id: newChartAccount.parent_id === "none" || !newChartAccount.parent_id ? null : newChartAccount.parent_id,
        type: newChartAccount.type,
        level: newChartAccount.level || 1
      };

      if (isEditChartAccountMode && newChartAccount.id) {
        const { error } = await supabase.from("chart_of_accounts").update(payload).eq("id", newChartAccount.id);
        if (error) throw error;
        toast.success("Conta atualizada!");
      } else {
        const { error } = await supabase.from("chart_of_accounts").insert([payload]);
        if (error) throw error;
        toast.success("Conta criada!");
      }

      setNewChartAccount({ id: "", code: "", name: "", parent_id: "", type: "revenue", level: 1 });
      setIsEditChartAccountMode(false);
      setIsChartAccountDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const syncDriverProfile = async (
    driverId: string,
    loginToSave: string,
    driverName: string,
    driverPassword = "",
    driverActive = true
  ) => {
    if (!loginToSave) return;

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, allowed_modules")
      .eq("email", loginToSave)
      .maybeSingle();

    const currentModules = Array.isArray((existingProfile as any)?.allowed_modules)
      ? ((existingProfile as any).allowed_modules as string[])
      : [];
    const allowedModules = Array.from(new Set([...currentModules, "entregador"]));

    const profilePayload = {
      email: loginToSave,
      password: driverPassword.trim(),
      full_name: driverName.trim(),
      role: "funcionario",
      active: driverActive,
      allowed_modules: allowedModules,
      visible_fields: []
    } as any;

    let profileId = (existingProfile as any)?.id as string | undefined;

    if (profileId) {
      const { error } = await supabase.from("profiles").update(profilePayload).eq("id", profileId);
      if (error) throw error;
    } else {
      const { data: insertedProfile, error } = await supabase
        .from("profiles")
        .insert(profilePayload)
        .select("id")
        .single();
      if (error) throw error;
      profileId = (insertedProfile as any)?.id;
    }

    if (profileId) {
      await (supabase.from as any)("drivers").update({ auth_user_id: profileId }).eq("id", driverId);
    }

    return profileId;
  };

  const loadAppMotoqueiros = async () => {
    // 1) tenta buscar direto da tabela drivers
    let validDrivers: any[] = [];
    try {
      const { data: localDrivers, error: driversError } = await (supabase.from as any)("drivers")
        .select("id, name, login, active, is_active, auth_user_id")
        .order("name");
      if (driversError) {
        console.warn("[motoqueiros] erro ao ler drivers:", driversError);
      }
      validDrivers = ((localDrivers as any[]) || []).filter(
        (d) => d.active !== false && d.is_active !== false
      );
    } catch (e) {
      console.warn("[motoqueiros] exceção ao ler drivers:", e);
    }

    // 2) fallback: usa o state `drivers` já carregado pelo fetchData
    if (validDrivers.length === 0 && Array.isArray(drivers) && drivers.length > 0) {
      validDrivers = drivers
        .filter((d: any) => d.active !== false && d.is_active !== false)
        .map((d: any) => ({
          id: d.id,
          name: d.name,
          login: d.login,
          auth_user_id: d.auth_user_id,
        }));
    }

    if (validDrivers.length > 0) {
      const { data: activeOrders } = await supabase
        .from("delivery_orders")
        .select("driver_id, status")
        .in("status", ["delivering", "ready"])
        .not("driver_id", "is", null);

      const activeCount = ((activeOrders as any[]) || []).reduce<Record<string, number>>((acc, o) => {
        if (o.driver_id) acc[o.driver_id] = (acc[o.driver_id] || 0) + 1;
        return acc;
      }, {});

      const options = validDrivers.map((d) => ({
        id: d.id,
        full_name: d.name || "Motoqueiro",
        email: d.login || null,
        pedidos_ativos: activeCount[d.id] || 0,
        profile_id: d.auth_user_id || null,
      }));

      setAppMotoqueiros(options);
      return options;
    }

    // 3) último fallback: RPC do app MeuPedix
    try {
      const { data, error } = await (supabase as any).rpc("listar_motoqueiros_loja");
      if (error) throw error;
      const options = ((data as any[]) || []).map((m) => ({
        id: m.id,
        full_name: m.full_name || m.name || "Motoqueiro",
        email: m.email || m.login || null,
        pedidos_ativos: typeof m.pedidos_ativos === "number" ? m.pedidos_ativos : 0,
        profile_id: m.profile_id || m.auth_user_id || null,
      }));
      setAppMotoqueiros(options);
      return options;
    } catch (e) {
      console.warn("[motoqueiros] RPC listar_motoqueiros_loja falhou:", e);
      setAppMotoqueiros([]);
      return [];
    }
  };

  // Carrega os motoqueiros disponíveis para o seletor de entrega
  useEffect(() => {
    loadAppMotoqueiros().catch((e) =>
      console.warn("[motoqueiros] loadAppMotoqueiros falhou:", e)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drivers]);




  const assignMotoqueiroToOrder = async (orderId: string, driverId: string) => {
    const selectedDriver = appMotoqueiros.find((m) => m.id === driverId);
    const localDriver = drivers.find((d) => d.id === driverId);
    const panelDriverId = selectedDriver?.id || localDriver?.id || driverId;
    let rpcDriverId = selectedDriver?.profile_id || localDriver?.auth_user_id || driverId;

    if (!selectedDriver?.profile_id && !localDriver?.auth_user_id && localDriver?.login) {
      const syncedProfileId = await syncDriverProfile(
        driverId,
        localDriver.login,
        localDriver.name,
        localDriver.password || "",
        localDriver.active !== false
      );
      if (syncedProfileId) rpcDriverId = syncedProfileId;
    }

    let rpcOk = false;
    try {
      const { error } = await (supabase as any).rpc("atribuir_entregador", {
        p_pedido_id: orderId,
        p_entregador_id: rpcDriverId,
        p_admin_profile_id: user?.id,
      });
      if (error) throw error;
      rpcOk = true;
    } catch (rpcError) {
      console.warn("RPC atribuir_entregador indisponível, aplicando vínculo direto:", rpcError);
    }

    // IMPORTANTE: só vinculamos o motoqueiro e marcamos como "aguardando".
    // O campo `status` NÃO é alterado aqui — só muda para "delivering" quando o
    // motoqueiro tocar em "Iniciar Entrega" no app, ou ao finalizar pelo painel.
    const patch: any = {
      driver_id: panelDriverId,
      driver_status: "aguardando",
    };

    const { error: updErr } = await supabase
      .from("delivery_orders")
      .update(patch)
      .eq("id", orderId);
    if (updErr) {
      console.error("Falha ao vincular motoqueiro ao pedido:", updErr);
      toast.error("Não foi possível vincular o motoqueiro ao pedido.");
      return;
    }


    toast.success("Motoqueiro vinculado. Aguardando início da entrega.");
    await refreshDeliveryOrders();
  };


  const handleSaveDriver = async () => {
    if (!newDriver.name.trim() || !newDriver.phone.trim()) {
      toast.error("Preencha nome e celular.");
      return;
    }
    try {
      let loginToSave = newDriver.login.trim();
      if (loginToSave && !loginToSave.includes("@")) {
        loginToSave = `${loginToSave}${FIXED_DOMAIN}`;
      }

      const payload = {
        name: newDriver.name.trim(),
        phone: newDriver.phone.trim(),
        daily_rate: parseFloat(newDriver.daily_rate) || 0,
        login: loginToSave,
        password: newDriver.password.trim(),
        active: newDriver.active
      };
      let savedDriverId = editingDriver?.id as string | undefined;
      if (editingDriver) {
        const { error } = await supabase.from("drivers").update(payload).eq("id", editingDriver.id);
        if (error) throw error;
        toast.success("Motoqueiro atualizado!");
      } else {
        const { data, error } = await supabase.from("drivers").insert([payload]).select("id").single();
        if (error) throw error;
        savedDriverId = (data as any)?.id;
        toast.success("Motoqueiro cadastrado!");
      }

      if (savedDriverId && loginToSave) {
        await syncDriverProfile(savedDriverId, loginToSave, newDriver.name, newDriver.password, newDriver.active);
      }

      setNewDriver({ name: "", phone: "", daily_rate: "", login: "", password: "", has_fixed_fee: false, fixed_fee: "", active: true });
      setEditingDriver(null);
      setIsDriverDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

   const handleDeleteDriver = async (id: string) => {
    if (!user?.can_delete) {
      toast.error("Você não tem permissão para remover entregadores.");
      return;
    }
    if (false) return;
    try {
      const { error } = await (supabase.from as any)("drivers").delete().eq("id", id);
      if (error) throw error;
      toast.success("Motoqueiro removido!");
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleDriverActive = async (d: any) => {
    try {
      const { error } = await (supabase.from as any)("drivers").update({ is_active: !d.is_active }).eq("id", d.id);
      if (error) throw error;
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!user?.can_delete) {
      toast.error("Você não tem permissão para excluir pedidos.");
      return;
    }

    const targetOrder = deliveryOrders.find(o => o.id === orderId);
    const isSentToProduction = targetOrder?.status !== 'pending' && targetOrder?.status !== 'cancelled';
    
    if (isSentToProduction && !user?.can_cancel && user?.role !== 'master') {
      toast.error("Você não tem permissão para excluir pedidos já enviados para produção.");
      return;
    }

    if (isSentToProduction) {
      if (!confirm("⚠️ Este pedido já foi enviado para a produção. Deseja realmente EXCLUIR? Um relatório de cancelamento será enviado para a cozinha.")) {
        return;
      }
    } else {
      if (!confirm("⚠️ Deseja realmente excluir este pedido?")) {
        return;
      }
    }

    // Regra: Bloquear exclusão se o caixa estiver fechado
    if (!activeSession) {
      toast.error("Não é possível excluir pedidos com o caixa fechado. Abra o caixa primeiro.");
      return;
    }
    
    try {
      setLoading(true);
      
      const shortId = orderId.slice(0, 8);
      console.log(`Iniciando exclusão do pedido: ${orderId} (Short ID: ${shortId})`);

      // Se o pedido foi enviado para produção, notifica a cozinha do cancelamento ANTES de deletar os itens
      if (isSentToProduction) {
        processPrintingForDeliveryOrder(orderId, true).catch(err => {
          console.error("Erro ao imprimir cancelamento de delivery:", err);
        });

        // Show cancellation preview
        if (targetOrder) {
          showCancellationPreview({
            orderNumber: (targetOrder as any).order_number || `PEDIDO #${orderId.slice(0, 8)}`,
            customerName: targetOrder.customer_name,
            items: (targetOrder.delivery_order_items || []).map((i: any) => ({
              name: i.product_name,
              quantity: i.quantity,
              notes: i.notes || i.observations,
              complements: i.selected_complements
            })),
            type: 'delivery'
          });
        }
      }

      // 1. Remover lançamentos financeiros vinculados
      // Tenta várias formas de match na descrição para garantir que limpa tudo
      const { error: finError } = await supabase.from("financial_transactions")
        .delete()
        .or(`description.ilike.%#${shortId}%,description.ilike.%Pedido ${shortId}%,description.ilike.%#${orderId}%`);
      
      if (finError) {
        console.warn("Aviso ao excluir transações financeiras:", finError);
      }

      // 2. Remover viagens de motoqueiro vinculadas
      const { error: tripError } = await supabase.from("driver_trips")
        .delete()
        .or(`notes.ilike.%#${shortId}%,notes.ilike.%#${orderId}%`);
      
      if (tripError) {
        console.warn("Aviso ao excluir viagens:", tripError);
      }

      // 3. Remover trabalhos de impressão vinculados (FK)
      const { error: printError } = await supabase.from("printing_jobs" as any)
        .delete()
        .eq("order_id", orderId);
      if (printError) {
        console.warn("Aviso ao excluir trabalhos de impressão:", printError);
      }

      // 4. Remover lançamentos do livro do cliente vinculados (FK)
      const { error: ledgerError } = await supabase.from("customer_ledgers" as any)
        .delete()
        .eq("order_id", orderId);
      if (ledgerError) {
        console.warn("Aviso ao excluir lançamentos do cliente:", ledgerError);
      }

      // 5. Remover itens do pedido (Essencial para FK)
      const { error: itemsError } = await supabase.from("delivery_order_items")
        .delete()
        .eq("order_id", orderId);
      
      if (itemsError) {
        console.error("Erro crítico ao excluir itens do pedido:", itemsError);
        throw new Error("Não foi possível excluir os itens do pedido.");
      }
      
      // 4. Remover o pedido principal
      const { error: orderError } = await supabase.from("delivery_orders")
        .delete()
        .eq("id", orderId);
      
      if (orderError) {
        console.error("Erro crítico ao excluir pedido principal:", orderError);
        throw orderError;
      }
      
      toast.success("Pedido excluído com sucesso!");
      
      // Atualizar todas as listas possíveis
      await refreshDeliveryOrders();
      await fetchData(true, true);
      if (typeof fetchHistoryOrders === 'function') {
        await fetchHistoryOrders();
      }
      
    } catch (error: any) {
      console.error("Falha na exclusão do pedido:", error);
      toast.error("Erro ao excluir: " + (error.message || "Erro desconhecido"));
    } finally {
      setLoading(false);
    }
  };

  const printDriverReceipt = async (order: any, driverId?: string) => {
    const items = (order.delivery_order_items || []).map((it: any) => ({
      name: it.product_name || 'Produto',
      quantity: it.quantity,
      price: it.unit_price,
      notes: it.notes || it.observations || '',
      complements: it.selected_complements || [],
    }));

    const driverName = driverId
      ? (drivers.find(d => d.id === driverId)?.name || '')
      : (order.drivers?.name || '');

    const fee = Number((order as any).delivery_fee || 0);
    const subtotal = Number(order.total_amount || 0) - fee;

    const content: any = {
      order_number: order.order_number || `DELIVERY-${String(order.id).slice(0, 6).toUpperCase()}`,
      receipt_type: 'driver',
      sector_name: 'ENTREGA / MOTOQUEIRO',
      company_name: storeSettings?.name || '',
      customer_name: order.customer_name || 'Cliente',
      customer_phone: order.customer_phone || '',
      customer_address: (order as any).delivery_address || order.customer_address || '',
      driver_name: driverName,
      notes: order.notes || '',
      total: order.total_amount || 0,
      delivery_fee: fee,
      subtotal,
      payment_method: (order as any).payment_method || '',
      change_for: (order as any).change_for || 0,
      created_at: new Date().toISOString(),
      items,
      waiter_name: driverName ? `🏍️ Entregador: ${driverName}` : '🏍️ ENTREGADOR',
    };

    // Busca impressora preferencial (Caixa/Entrega/PDF) ou primeira ativa
    const { data: printers } = await supabase
      .from('printers')
      .select('*')
      .eq('is_active', true);

    if (!printers || printers.length === 0) {
      console.warn('[DriverReceipt] Nenhuma impressora ativa');
      return;
    }

    const target =
      printers.find((p: any) => /entrega|motoqueiro|driver/i.test(p.name)) ||
      printers.find((p: any) => /caixa|pdf|virtual/i.test(p.name)) ||
      printers[0];

    // Dedup: evita múltiplas vias do cupom do motoqueiro quando o status muda
    // várias vezes ou várias abas do admin recebem o evento.
    const sinceIso = new Date(Date.now() - 60_000).toISOString();
    const { data: recentJobs } = await supabase
      .from('printing_jobs')
      .select('id, content, created_at, printer_id')
      .eq('printer_id', target.id)
      .gte('created_at', sinceIso);

    const dup = (recentJobs || []).some((j: any) => {
      const c = j.content || {};
      return c.order_number === content.order_number && c.receipt_type === 'driver';
    });

    if (dup) {
      console.log('[DriverReceipt] Cupom já enfileirado recentemente. Ignorando duplicata.');
      return;
    }

    await supabase.from('printing_jobs').insert([{
      printer_id: target.id,
      status: 'pending',
      content,
    }]);
  };

  const printMenuReport = async () => {
    try {
      const { data: printers } = await supabase
        .from('printers')
        .select('id, name, is_active, type, paper_width, is_default')
        .order('name');

      const { data: storeSettings } = await supabase
        .from('store_settings')
        .select('print_paper_format, thermal_printer_model')
        .single();

      const formatoA4 = (storeSettings?.print_paper_format || 'a4') === 'a4';

      const fmtMoney = (n: any) => `R$ ${Number(n || 0).toFixed(2).replace('.', ',')}`;
      const dot = (on: boolean, color: string) =>
        `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${on ? color : '#ddd'};margin-right:4px;"></span>`;
      const badge = (on: boolean, label: string, color: string) =>
        on
          ? `<span style="display:inline-block;padding:2px 6px;border-radius:10px;background:${color}20;color:${color};font-size:10px;font-weight:600;margin-right:3px;">${label}</span>`
          : `<span style="display:inline-block;padding:2px 6px;border-radius:10px;background:#f3f3f3;color:#aaa;font-size:10px;margin-right:3px;text-decoration:line-through;">${label}</span>`;

      const grupos = new Map<string, { nome: string; itens: Product[] }>();
      const lista = [...products].sort((a, b) =>
        (a.categories?.name || 'zzz').localeCompare(b.categories?.name || 'zzz') ||
        a.name.localeCompare(b.name)
      );
      lista.forEach((p) => {
        const key = p.category_id || 'sem';
        const nome = p.categories?.name || 'Sem categoria';
        if (!grupos.has(key)) grupos.set(key, { nome, itens: [] });
        grupos.get(key)!.itens.push(p);
      });

      const totalProdutos = products.length;
      const totalAtivos = products.filter((p) => p.active).length;
      const ticketMedio =
        products.reduce((s, p) => s + Number(p.price || 0), 0) / Math.max(1, products.length);

      const printersHtml = (printers || [])
        .map(
          (p: any) => `
            <tr>
              <td style="padding:6px 8px;border-bottom:1px solid #eee;">
                ${dot(p.is_active, '#16a34a')}<strong>${p.name}</strong>
                ${p.is_default ? '<span style="font-size:10px;color:#ea580c;margin-left:6px;">PADRÃO</span>' : ''}
              </td>
              <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:12px;color:#555;">${p.type || '-'}</td>
              <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:12px;color:#555;">${p.paper_width || '-'}</td>
              <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:12px;">${p.is_active ? '<span style="color:#16a34a;">Ativa</span>' : '<span style="color:#999;">Inativa</span>'}</td>
            </tr>`
        )
        .join('');

      const gruposHtml = Array.from(grupos.values())
        .map(
          (g) => `
            <div style="margin-top:18px;">
              <div style="background:linear-gradient(90deg,#ea580c,#f97316);color:#fff;padding:6px 12px;border-radius:6px 6px 0 0;font-weight:bold;font-size:13px;">
                ${g.nome} <span style="opacity:.8;font-weight:400;">(${g.itens.length})</span>
              </div>
              <table style="width:100%;border-collapse:collapse;font-size:12px;border:1px solid #eee;border-top:none;">
                <thead>
                  <tr style="background:#fafafa;">
                    <th style="text-align:left;padding:6px 8px;width:90px;">Código</th>
                    <th style="text-align:left;padding:6px 8px;">Produto</th>
                    <th style="text-align:left;padding:6px 8px;width:220px;">Canais</th>
                    <th style="text-align:center;padding:6px 8px;width:70px;">Ativo</th>
                    <th style="text-align:right;padding:6px 8px;width:100px;">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  ${g.itens
                    .map(
                      (p) => `
                        <tr>
                          <td style="padding:6px 8px;border-top:1px solid #f1f1f1;font-family:monospace;color:#666;">${String(p.id).slice(0, 8)}</td>
                          <td style="padding:6px 8px;border-top:1px solid #f1f1f1;">${p.name}</td>
                          <td style="padding:6px 8px;border-top:1px solid #f1f1f1;">
                            ${badge(!!p.sell_delivery, 'Delivery', '#0ea5e9')}
                            ${badge(!!p.sell_dine_in, 'Mesa', '#8b5cf6')}
                            ${badge(!!p.sell_digital_menu, 'Digital', '#16a34a')}
                          </td>
                          <td style="padding:6px 8px;border-top:1px solid #f1f1f1;text-align:center;">
                            ${p.active ? '<span style="color:#16a34a;font-weight:bold;">●</span>' : '<span style="color:#dc2626;">○</span>'}
                          </td>
                          <td style="padding:6px 8px;border-top:1px solid #f1f1f1;text-align:right;font-weight:600;">${fmtMoney(p.price)}</td>
                        </tr>`
                    )
                    .join('')}
                </tbody>
              </table>
            </div>`
        )
        .join('');

      // ===== Layout Térmico 80mm =====
      const canalTxt = (p: Product) => {
        const c: string[] = [];
        if (p.sell_delivery) c.push('DEL');
        if (p.sell_dine_in) c.push('MESA');
        if (p.sell_digital_menu) c.push('DIG');
        return c.join('/') || '-';
      };

      const printersThermal = (printers || [])
        .map((p: any) =>
          `<div style="display:flex;justify-content:space-between;font-size:10px;">
            <span>${p.is_active ? '●' : '○'} ${p.name}${p.is_default ? ' *' : ''}</span>
            <span>${p.paper_width || '-'}</span>
          </div>`
        ).join('');

      const gruposThermal = Array.from(grupos.values()).map((g) => `
        <div style="margin-top:8px;">
          <div style="background:#000;color:#fff;padding:2px 4px;font-weight:bold;font-size:11px;text-align:center;">
            ${g.nome.toUpperCase()} (${g.itens.length})
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:10px;">
            ${g.itens.map((p) => `
              <tr style="border-bottom:1px dashed #ccc;">
                <td style="padding:2px 0;vertical-align:top;">
                  <div style="font-weight:bold;">${p.active ? '' : '[INATIVO] '}${p.name}</div>
                  <div style="font-size:9px;color:#555;">${canalTxt(p)} · cod ${String(p.id).slice(0,6)}</div>
                </td>
                <td style="padding:2px 0;text-align:right;vertical-align:top;font-weight:bold;white-space:nowrap;">
                  ${fmtMoney(p.price)}
                </td>
              </tr>
            `).join('')}
          </table>
        </div>
      `).join('');

      const htmlThermal = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
        <title>Cardápio</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          html, body { margin:0; padding:0; }
          body { width:72mm; padding:3mm; font-family: 'Courier New', monospace; color:#000; font-size:11px; }
          h1 { font-size:13px; text-align:center; margin:0 0 4px; }
          .sub { font-size:9px; text-align:center; color:#444; }
          hr { border:none; border-top:1px dashed #000; margin:6px 0; }
          .kpi { display:flex; justify-content:space-between; font-size:10px; }
        </style></head><body>
          <h1>RELATÓRIO DO CARDÁPIO</h1>
          <div class="sub">${new Date().toLocaleString('pt-BR')}</div>
          <hr/>
          <div class="kpi"><span>Total produtos:</span><b>${totalProdutos}</b></div>
          <div class="kpi"><span>Ativos:</span><b>${totalAtivos}</b></div>
          <div class="kpi"><span>Categorias:</span><b>${grupos.size}</b></div>
          <div class="kpi"><span>Ticket médio:</span><b>${fmtMoney(ticketMedio)}</b></div>
          <hr/>
          <div style="font-weight:bold;font-size:11px;">IMPRESSORAS</div>
          ${printersThermal || '<div style="font-size:10px;color:#666;">Nenhuma</div>'}
          <div style="font-size:9px;color:#444;margin-top:2px;">Padrão: ${formatoA4 ? 'A4' : 'Térmica 80mm'}${storeSettings?.thermal_printer_model ? ' · ' + storeSettings.thermal_printer_model : ''}</div>
          <hr/>
          ${gruposThermal || '<div style="text-align:center;font-size:10px;">Nenhum produto</div>'}
          <hr/>
          <div class="sub">www.meupedix.com.br</div>
          <script>window.onload=()=>window.print();</script>
        </body></html>`;

      const htmlA4 = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
        <title>Relatório do Cardápio</title>
        <style>
          @page { size: ${formatoA4 ? 'A4' : 'A4 landscape'}; margin: 12mm; }
          body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; color:#222; margin:0; }
          h1 { margin:0; font-size:22px; color:#ea580c; }
          .sub { color:#666; font-size:12px; }
          .kpis { display:flex; gap:12px; margin:14px 0; }
          .kpi { flex:1; padding:10px 12px; border:1px solid #eee; border-radius:8px; background:#fff7ed; }
          .kpi b { display:block; font-size:18px; color:#ea580c; }
          .kpi span { font-size:11px; color:#666; text-transform:uppercase; letter-spacing:1px; }
          h2 { font-size:14px; margin:18px 0 6px; color:#3a2a1f; border-left:4px solid #ea580c; padding-left:8px; }
          table { width:100%; border-collapse:collapse; }
          .foot { margin-top:24px; padding-top:8px; border-top:1px dashed #ccc; text-align:center; font-size:10px; color:#888; }
        </style></head><body>
          <div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #ea580c;padding-bottom:8px;">
            <div>
              <h1>Relatório do Cardápio</h1>
              <div class="sub">Produtos, canais de venda e configuração de impressoras</div>
            </div>
            <div class="sub">${new Date().toLocaleString('pt-BR')}</div>
          </div>

          <div class="kpis">
            <div class="kpi"><span>Total de produtos</span><b>${totalProdutos}</b></div>
            <div class="kpi"><span>Ativos</span><b>${totalAtivos}</b></div>
            <div class="kpi"><span>Categorias</span><b>${grupos.size}</b></div>
            <div class="kpi"><span>Ticket médio</span><b>${fmtMoney(ticketMedio)}</b></div>
          </div>

          <h2>Configuração de Impressoras</h2>
          <table style="border:1px solid #eee;">
            <thead><tr style="background:#fafafa;">
              <th style="text-align:left;padding:6px 8px;">Impressora</th>
              <th style="text-align:left;padding:6px 8px;">Tipo</th>
              <th style="text-align:left;padding:6px 8px;">Papel</th>
              <th style="text-align:left;padding:6px 8px;">Status</th>
            </tr></thead>
            <tbody>${printersHtml || '<tr><td colspan="4" style="padding:10px;text-align:center;color:#999;">Nenhuma impressora cadastrada</td></tr>'}</tbody>
          </table>
          <div class="sub" style="margin-top:6px;">
            Formato padrão: <strong>${formatoA4 ? 'A4' : 'Térmica 80mm'}</strong>
            ${storeSettings?.thermal_printer_model ? ` · Modelo térmica: <strong>${storeSettings.thermal_printer_model}</strong>` : ''}
          </div>

          <h2>Produtos por Categoria</h2>
          ${gruposHtml || '<div style="padding:20px;text-align:center;color:#999;">Nenhum produto cadastrado</div>'}

          <div class="foot">www.meupedix.com.br · Relatório gerado em ${new Date().toLocaleString('pt-BR')}</div>
          <script>window.onload=()=>window.print();</script>
        </body></html>`;

      const html = formatoA4 ? htmlA4 : htmlThermal;

      const w = window.open('', '_blank', formatoA4 ? 'width=1000,height=900' : 'width=360,height=900');
      if (!w) {
        toast.error('Habilite popups para imprimir o relatório');
        return;
      }
      w.document.write(html);
      w.document.close();
    } catch (e) {
      console.error('[printMenuReport]', e);
      toast.error('Erro ao gerar relatório do cardápio');
    }
  };

  const printComplementsReport = async () => {
    try {
      const { data: printers } = await supabase
        .from('printers')
        .select('id, name, is_active, type, paper_width, is_default')
        .order('name');

      const { data: storeSettings } = await supabase
        .from('store_settings')
        .select('print_paper_format, thermal_printer_model')
        .single();

      const formatoA4 = (storeSettings?.print_paper_format || 'a4') === 'a4';
      const fmtMoney = (n: any) => `R$ ${Number(n || 0).toFixed(2).replace('.', ',')}`;

      // monta nomes auxiliares
      const catNameById = new Map<string, string>();
      categories.forEach((c: any) => catNameById.set(c.id, c.name));
      const prodNameById = new Map<string, string>();
      products.forEach((p: any) => prodNameById.set(p.id, p.name));

      const grupos = [...complementGroups].sort((a, b) => (a.name || '').localeCompare(b.name || ''));

      const totalGrupos = grupos.length;
      const totalItens = grupos.reduce((s, g) => s + (g.complements?.length || 0), 0);
      const obrigatorios = grupos.filter((g) => (g.min_choices || 0) > 0).length;
      const precoMedio = (() => {
        const all = grupos.flatMap((g) => (g.complements || []).map((c: any) => Number(c.price || 0)));
        return all.length ? all.reduce((a, b) => a + b, 0) / all.length : 0;
      })();

      // ===== A4 =====
      const gruposA4 = grupos.map((g) => {
        const cats = categoryComplementGroups
          .filter((cg) => cg.group_id === g.id)
          .map((cg) => catNameById.get(cg.category_id))
          .filter(Boolean);
        const prods = productComplementGroups
          .filter((pg) => pg.group_id === g.id)
          .map((pg) => prodNameById.get(pg.product_id))
          .filter(Boolean);
        const itens = (g.complements || []).slice().sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
        return `
          <div style="margin-top:16px;page-break-inside:avoid;">
            <div style="background:linear-gradient(90deg,#ea580c,#f97316);color:#fff;padding:6px 12px;border-radius:6px 6px 0 0;font-weight:bold;font-size:13px;display:flex;justify-content:space-between;">
              <span>${g.name} <span style="opacity:.8;font-weight:400;">(${itens.length} itens)</span></span>
              <span style="font-size:11px;">${(g.min_choices || 0) > 0 ? 'OBRIGATÓRIO' : 'OPCIONAL'} · min ${g.min_choices || 0} / max ${g.max_choices || 0}</span>
            </div>
            <div style="border:1px solid #eee;border-top:none;padding:8px 12px;background:#fff;">
              <div style="font-size:11px;color:#555;margin-bottom:6px;">
                <strong>Categorias:</strong> ${cats.length ? cats.join(', ') : '<em style="color:#aaa;">nenhuma</em>'}<br/>
                <strong>Produtos:</strong> ${prods.length ? prods.join(', ') : '<em style="color:#aaa;">nenhum</em>'}
              </div>
              <table style="width:100%;border-collapse:collapse;font-size:12px;">
                <thead><tr style="background:#fafafa;">
                  <th style="text-align:left;padding:4px 8px;width:90px;">Código</th>
                  <th style="text-align:left;padding:4px 8px;">Item</th>
                  <th style="text-align:right;padding:4px 8px;width:100px;">Valor</th>
                </tr></thead>
                <tbody>
                  ${itens.length ? itens.map((c: any) => `
                    <tr>
                      <td style="padding:4px 8px;border-top:1px solid #f1f1f1;font-family:monospace;color:#666;">${String(c.id).slice(0, 8)}</td>
                      <td style="padding:4px 8px;border-top:1px solid #f1f1f1;">${c.name}</td>
                      <td style="padding:4px 8px;border-top:1px solid #f1f1f1;text-align:right;font-weight:600;">${fmtMoney(c.price)}</td>
                    </tr>
                  `).join('') : '<tr><td colspan="3" style="padding:8px;text-align:center;color:#999;">Sem itens</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>`;
      }).join('');

      const printersA4 = (printers || []).map((p: any) => `
        <tr>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;">
            <strong>${p.name}</strong>${p.is_default ? ' <span style="color:#ea580c;font-size:10px;">PADRÃO</span>' : ''}
          </td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:12px;color:#555;">${p.type || '-'}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:12px;color:#555;">${p.paper_width || '-'}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:12px;">${p.is_active ? '<span style="color:#16a34a;">Ativa</span>' : '<span style="color:#999;">Inativa</span>'}</td>
        </tr>`).join('');

      const htmlA4 = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
        <title>Relatório de Complementos</title>
        <style>
          @page { size: A4; margin: 12mm; }
          body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; color:#222; margin:0; }
          h1 { margin:0; font-size:22px; color:#ea580c; }
          .sub { color:#666; font-size:12px; }
          .kpis { display:flex; gap:12px; margin:14px 0; }
          .kpi { flex:1; padding:10px 12px; border:1px solid #eee; border-radius:8px; background:#fff7ed; }
          .kpi b { display:block; font-size:18px; color:#ea580c; }
          .kpi span { font-size:11px; color:#666; text-transform:uppercase; letter-spacing:1px; }
          h2 { font-size:14px; margin:18px 0 6px; color:#3a2a1f; border-left:4px solid #ea580c; padding-left:8px; }
          .foot { margin-top:24px; padding-top:8px; border-top:1px dashed #ccc; text-align:center; font-size:10px; color:#888; }
        </style></head><body>
          <div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #ea580c;padding-bottom:8px;">
            <div>
              <h1>Relatório de Complementos</h1>
              <div class="sub">Grupos, itens, vínculos e configuração de impressoras</div>
            </div>
            <div class="sub">${new Date().toLocaleString('pt-BR')}</div>
          </div>
          <div class="kpis">
            <div class="kpi"><span>Grupos</span><b>${totalGrupos}</b></div>
            <div class="kpi"><span>Itens</span><b>${totalItens}</b></div>
            <div class="kpi"><span>Obrigatórios</span><b>${obrigatorios}</b></div>
            <div class="kpi"><span>Preço médio</span><b>${fmtMoney(precoMedio)}</b></div>
          </div>
          <h2>Configuração de Impressoras</h2>
          <table style="width:100%;border-collapse:collapse;border:1px solid #eee;">
            <thead><tr style="background:#fafafa;">
              <th style="text-align:left;padding:6px 8px;">Impressora</th>
              <th style="text-align:left;padding:6px 8px;">Tipo</th>
              <th style="text-align:left;padding:6px 8px;">Papel</th>
              <th style="text-align:left;padding:6px 8px;">Status</th>
            </tr></thead>
            <tbody>${printersA4 || '<tr><td colspan="4" style="padding:10px;text-align:center;color:#999;">Nenhuma</td></tr>'}</tbody>
          </table>
          <div class="sub" style="margin-top:6px;">Formato padrão: <strong>${formatoA4 ? 'A4' : 'Térmica 80mm'}</strong>${storeSettings?.thermal_printer_model ? ' · Modelo: <strong>' + storeSettings.thermal_printer_model + '</strong>' : ''}</div>
          <h2>Grupos de Complementos</h2>
          ${gruposA4 || '<div style="padding:20px;text-align:center;color:#999;">Nenhum grupo cadastrado</div>'}
          <div class="foot">www.meupedix.com.br · Relatório gerado em ${new Date().toLocaleString('pt-BR')}</div>
          <script>window.onload=()=>window.print();</script>
        </body></html>`;

      // ===== Térmico 80mm =====
      const printersThermal = (printers || []).map((p: any) =>
        `<div style="display:flex;justify-content:space-between;font-size:10px;">
          <span>${p.is_active ? '●' : '○'} ${p.name}${p.is_default ? ' *' : ''}</span>
          <span>${p.paper_width || '-'}</span>
        </div>`
      ).join('');

      const gruposThermal = grupos.map((g) => {
        const itens = (g.complements || []).slice().sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
        const vinc = categoryComplementGroups.filter((cg) => cg.group_id === g.id).length
                   + productComplementGroups.filter((pg) => pg.group_id === g.id).length;
        return `
          <div style="margin-top:8px;">
            <div style="background:#000;color:#fff;padding:2px 4px;font-weight:bold;font-size:11px;text-align:center;">
              ${(g.name || '').toUpperCase()} (${itens.length})
            </div>
            <div style="font-size:9px;color:#444;text-align:center;">
              ${(g.min_choices || 0) > 0 ? 'OBRIG' : 'OPC'} · min ${g.min_choices || 0}/max ${g.max_choices || 0} · vinc ${vinc}
            </div>
            <table style="width:100%;border-collapse:collapse;font-size:10px;margin-top:2px;">
              ${itens.length ? itens.map((c: any) => `
                <tr style="border-bottom:1px dashed #ccc;">
                  <td style="padding:2px 0;">${c.name}</td>
                  <td style="padding:2px 0;text-align:right;font-weight:bold;white-space:nowrap;">${fmtMoney(c.price)}</td>
                </tr>
              `).join('') : '<tr><td style="padding:2px 0;color:#777;font-size:9px;">sem itens</td></tr>'}
            </table>
          </div>`;
      }).join('');

      const htmlThermal = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
        <title>Complementos</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          html, body { margin:0; padding:0; }
          body { width:72mm; padding:3mm; font-family: 'Courier New', monospace; color:#000; font-size:11px; }
          h1 { font-size:13px; text-align:center; margin:0 0 4px; }
          .sub { font-size:9px; text-align:center; color:#444; }
          hr { border:none; border-top:1px dashed #000; margin:6px 0; }
          .kpi { display:flex; justify-content:space-between; font-size:10px; }
        </style></head><body>
          <h1>RELATÓRIO COMPLEMENTOS</h1>
          <div class="sub">${new Date().toLocaleString('pt-BR')}</div>
          <hr/>
          <div class="kpi"><span>Grupos:</span><b>${totalGrupos}</b></div>
          <div class="kpi"><span>Itens:</span><b>${totalItens}</b></div>
          <div class="kpi"><span>Obrigatórios:</span><b>${obrigatorios}</b></div>
          <div class="kpi"><span>Preço médio:</span><b>${fmtMoney(precoMedio)}</b></div>
          <hr/>
          <div style="font-weight:bold;font-size:11px;">IMPRESSORAS</div>
          ${printersThermal || '<div style="font-size:10px;color:#666;">Nenhuma</div>'}
          <div style="font-size:9px;color:#444;margin-top:2px;">Padrão: ${formatoA4 ? 'A4' : 'Térmica 80mm'}${storeSettings?.thermal_printer_model ? ' · ' + storeSettings.thermal_printer_model : ''}</div>
          <hr/>
          ${gruposThermal || '<div style="text-align:center;font-size:10px;">Nenhum grupo</div>'}
          <hr/>
          <div class="sub">www.meupedix.com.br</div>
          <script>window.onload=()=>window.print();</script>
        </body></html>`;

      const html = formatoA4 ? htmlA4 : htmlThermal;
      const w = window.open('', '_blank', formatoA4 ? 'width=1000,height=900' : 'width=360,height=900');
      if (!w) { toast.error('Habilite popups para imprimir o relatório'); return; }
      w.document.write(html);
      w.document.close();
    } catch (e) {
      console.error('[printComplementsReport]', e);
      toast.error('Erro ao gerar relatório de complementos');
    }
  };

  const printCustomersReport = async () => {
    try {
      const { data: printers } = await supabase
        .from('printers')
        .select('id, name, is_active, type, paper_width, is_default')
        .order('name');

      const { data: storeSettings } = await supabase
        .from('store_settings')
        .select('print_paper_format, thermal_printer_model')
        .single();

      const formatoA4 = (storeSettings?.print_paper_format || 'a4') === 'a4';

      // Aplica filtros atuais (busca + tipo)
      const term = (customerFilter.search || '').toLowerCase().trim();
      const tipo = customerFilter.person_type || 'all';
      const lista = customers
        .filter((c: any) => {
          if (tipo !== 'all' && (c.person_type || 'fisica') !== tipo) return false;
          if (!term) return true;
          return (c.name || '').toLowerCase().includes(term)
            || (c.phone || '').toLowerCase().includes(term)
            || (c.email || '').toLowerCase().includes(term);
        })
        .sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));

      const total = lista.length;
      const fisicas = lista.filter((c: any) => (c.person_type || 'fisica') === 'fisica').length;
      const juridicas = lista.filter((c: any) => c.person_type === 'juridica').length;
      const cidades = new Set(lista.map((c: any) => c.city).filter(Boolean)).size;

      const fullAddr = (c: any) => [c.address, c.address_number, c.neighborhood, c.city, c.state, c.zip_code]
        .filter(Boolean).join(', ');
      const doc = (c: any) => (c.person_type === 'juridica' ? c.cnpj : c.cpf) || '-';

      // ===== A4 =====
      const rowsA4 = lista.map((c: any, i: number) => `
        <tr style="${i % 2 ? 'background:#fafafa;' : ''}">
          <td style="padding:5px 8px;border-bottom:1px solid #eee;">${c.name || '-'}</td>
          <td style="padding:5px 8px;border-bottom:1px solid #eee;">${c.person_type === 'juridica' ? 'PJ' : 'PF'}</td>
          <td style="padding:5px 8px;border-bottom:1px solid #eee;font-family:monospace;">${doc(c)}</td>
          <td style="padding:5px 8px;border-bottom:1px solid #eee;">${c.phone || '-'}</td>
          <td style="padding:5px 8px;border-bottom:1px solid #eee;">${c.email || '-'}</td>
          <td style="padding:5px 8px;border-bottom:1px solid #eee;font-size:11px;color:#555;">${fullAddr(c) || '-'}</td>
        </tr>`).join('');

      const printersA4 = (printers || []).map((p: any) => `
        <tr>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;"><strong>${p.name}</strong>${p.is_default ? ' <span style="color:#ea580c;font-size:10px;">PADRÃO</span>' : ''}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:12px;color:#555;">${p.type || '-'}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:12px;color:#555;">${p.paper_width || '-'}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:12px;">${p.is_active ? '<span style="color:#16a34a;">Ativa</span>' : '<span style="color:#999;">Inativa</span>'}</td>
        </tr>`).join('');

      const htmlA4 = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
        <title>Relatório de Clientes</title>
        <style>
          @page { size: A4 landscape; margin: 10mm; }
          body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; color:#222; margin:0; }
          h1 { margin:0; font-size:22px; color:#2563eb; }
          .sub { color:#666; font-size:12px; }
          .kpis { display:flex; gap:12px; margin:14px 0; }
          .kpi { flex:1; padding:10px 12px; border:1px solid #eee; border-radius:8px; background:#eff6ff; }
          .kpi b { display:block; font-size:18px; color:#2563eb; }
          .kpi span { font-size:11px; color:#666; text-transform:uppercase; letter-spacing:1px; }
          h2 { font-size:14px; margin:18px 0 6px; color:#1e3a8a; border-left:4px solid #2563eb; padding-left:8px; }
          table { width:100%; border-collapse:collapse; font-size:12px; }
          th { text-align:left; padding:6px 8px; background:#fafafa; border-bottom:2px solid #e5e7eb; }
          .foot { margin-top:18px; padding-top:8px; border-top:1px dashed #ccc; text-align:center; font-size:10px; color:#888; }
        </style></head><body>
          <div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #2563eb;padding-bottom:8px;">
            <div>
              <h1>Relatório de Clientes</h1>
              <div class="sub">Cadastro completo e configuração de impressoras</div>
            </div>
            <div class="sub">${new Date().toLocaleString('pt-BR')}</div>
          </div>
          <div class="kpis">
            <div class="kpi"><span>Total</span><b>${total}</b></div>
            <div class="kpi"><span>Pessoa Física</span><b>${fisicas}</b></div>
            <div class="kpi"><span>Pessoa Jurídica</span><b>${juridicas}</b></div>
            <div class="kpi"><span>Cidades</span><b>${cidades}</b></div>
          </div>
          <h2>Configuração de Impressoras</h2>
          <table style="border:1px solid #eee;">
            <thead><tr>
              <th>Impressora</th><th>Tipo</th><th>Papel</th><th>Status</th>
            </tr></thead>
            <tbody>${printersA4 || '<tr><td colspan="4" style="padding:10px;text-align:center;color:#999;">Nenhuma</td></tr>'}</tbody>
          </table>
          <div class="sub" style="margin-top:6px;">Formato padrão: <strong>${formatoA4 ? 'A4' : 'Térmica 80mm'}</strong>${storeSettings?.thermal_printer_model ? ' · Modelo: <strong>' + storeSettings.thermal_printer_model + '</strong>' : ''}</div>
          <h2>Clientes (${total})</h2>
          <table style="border:1px solid #eee;">
            <thead><tr>
              <th>Nome</th><th style="width:50px;">Tipo</th><th style="width:140px;">CPF/CNPJ</th><th style="width:120px;">Telefone</th><th>E-mail</th><th>Endereço</th>
            </tr></thead>
            <tbody>${rowsA4 || '<tr><td colspan="6" style="padding:16px;text-align:center;color:#999;">Nenhum cliente</td></tr>'}</tbody>
          </table>
          <div class="foot">www.meupedix.com.br · Relatório gerado em ${new Date().toLocaleString('pt-BR')}</div>
          <script>window.onload=()=>window.print();</script>
        </body></html>`;

      // ===== Térmico 80mm =====
      const printersThermal = (printers || []).map((p: any) =>
        `<div style="display:flex;justify-content:space-between;font-size:10px;">
          <span>${p.is_active ? '●' : '○'} ${p.name}${p.is_default ? ' *' : ''}</span>
          <span>${p.paper_width || '-'}</span>
        </div>`
      ).join('');

      const itensThermal = lista.map((c: any) => `
        <div style="border-bottom:1px dashed #000;padding:3px 0;">
          <div style="font-weight:bold;font-size:11px;">${c.name || '-'} <span style="font-weight:normal;font-size:9px;">[${c.person_type === 'juridica' ? 'PJ' : 'PF'}]</span></div>
          <div style="font-size:10px;">Doc: ${doc(c)}</div>
          <div style="font-size:10px;">Tel: ${c.phone || '-'}</div>
          ${c.email ? `<div style="font-size:9px;color:#333;">${c.email}</div>` : ''}
          ${fullAddr(c) ? `<div style="font-size:9px;color:#333;">${fullAddr(c)}</div>` : ''}
        </div>
      `).join('');

      const htmlThermal = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
        <title>Clientes</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          html, body { margin:0; padding:0; }
          body { width:72mm; padding:3mm; font-family: 'Courier New', monospace; color:#000; font-size:11px; }
          h1 { font-size:13px; text-align:center; margin:0 0 4px; }
          .sub { font-size:9px; text-align:center; color:#444; }
          hr { border:none; border-top:1px dashed #000; margin:6px 0; }
          .kpi { display:flex; justify-content:space-between; font-size:10px; }
        </style></head><body>
          <h1>RELATÓRIO DE CLIENTES</h1>
          <div class="sub">${new Date().toLocaleString('pt-BR')}</div>
          <hr/>
          <div class="kpi"><span>Total:</span><b>${total}</b></div>
          <div class="kpi"><span>Física:</span><b>${fisicas}</b></div>
          <div class="kpi"><span>Jurídica:</span><b>${juridicas}</b></div>
          <div class="kpi"><span>Cidades:</span><b>${cidades}</b></div>
          <hr/>
          <div style="font-weight:bold;font-size:11px;">IMPRESSORAS</div>
          ${printersThermal || '<div style="font-size:10px;color:#666;">Nenhuma</div>'}
          <div style="font-size:9px;color:#444;margin-top:2px;">Padrão: ${formatoA4 ? 'A4' : 'Térmica 80mm'}${storeSettings?.thermal_printer_model ? ' · ' + storeSettings.thermal_printer_model : ''}</div>
          <hr/>
          ${itensThermal || '<div style="text-align:center;font-size:10px;">Nenhum cliente</div>'}
          <hr/>
          <div class="sub">www.meupedix.com.br</div>
          <script>window.onload=()=>window.print();</script>
        </body></html>`;

      const html = formatoA4 ? htmlA4 : htmlThermal;
      const w = window.open('', '_blank', formatoA4 ? 'width=1100,height=900' : 'width=360,height=900');
      if (!w) { toast.error('Habilite popups para imprimir o relatório'); return; }
      w.document.write(html);
      w.document.close();
    } catch (e) {
      console.error('[printCustomersReport]', e);
      toast.error('Erro ao gerar relatório de clientes');
    }
  };

  const printDashboardReport = async () => {
    try {
      const s: any = storeSettings || {};
      const formatoA4 = (s.print_paper_format || 'a4') === 'a4';
      const money = (n: any) => `R$ ${Number(n || 0).toFixed(2).replace('.', ',')}`;
      const stats = dashboardStats || ({} as any);
      const periodOrders: any[] = stats.periodOrders || [];
      const today = todayDate;
      const start = financeFilters?.startDate || today;
      const end = financeFilters?.endDate || today;
      const periodo = start === end ? start.split('-').reverse().join('/') : `${start.split('-').reverse().join('/')} a ${end.split('-').reverse().join('/')}`;

      // por canal
      const byChannel: Record<string, { qtd: number; total: number }> = {};
      const byPayment: Record<string, { qtd: number; total: number }> = {};
      const productMap: Record<string, { qtd: number; total: number }> = {};
      for (const o of periodOrders) {
        const ch = (o.order_type || 'delivery').toString();
        byChannel[ch] = byChannel[ch] || { qtd: 0, total: 0 };
        byChannel[ch].qtd++;
        byChannel[ch].total += Number(o.total_amount || 0);

        const pm = (o.payment_method || o.payment_method_name || 'Não informado').toString();
        byPayment[pm] = byPayment[pm] || { qtd: 0, total: 0 };
        byPayment[pm].qtd++;
        byPayment[pm].total += Number(o.total_amount || 0);

        const items = (o.delivery_order_items || o.items || []) as any[];
        for (const it of items) {
          const nome = it.product_name || it.name || 'Item';
          productMap[nome] = productMap[nome] || { qtd: 0, total: 0 };
          productMap[nome].qtd += Number(it.quantity || 1);
          productMap[nome].total += Number(it.subtotal || it.total_price || (Number(it.unit_price || 0) * Number(it.quantity || 1)) || 0);
        }
      }
      const topProducts = Object.entries(productMap)
        .sort((a, b) => b[1].qtd - a[1].qtd)
        .slice(0, 10);

      // ===== A4 =====
      const kpi = (label: string, val: string, color: string) => `
        <div style="border:1px solid #eee;border-left:4px solid ${color};border-radius:6px;padding:10px 12px;flex:1;min-width:180px;">
          <div style="font-size:10px;color:#888;text-transform:uppercase;font-weight:700;letter-spacing:.5px;">${label}</div>
          <div style="font-size:20px;font-weight:800;color:#222;margin-top:2px;">${val}</div>
        </div>`;

      const tableSec = (title: string, rows: Array<[string, string, string]>, headers: [string,string,string]) => `
        <h2>${title}</h2>
        <table style="width:100%;border-collapse:collapse;border:1px solid #eee;font-size:12px;">
          <thead><tr style="background:#fafafa;">
            <th style="text-align:left;padding:6px 8px;">${headers[0]}</th>
            <th style="text-align:center;padding:6px 8px;">${headers[1]}</th>
            <th style="text-align:right;padding:6px 8px;">${headers[2]}</th>
          </tr></thead>
          <tbody>${rows.length ? rows.map(([a,b,c],i)=>`
            <tr style="${i%2?'background:#fafafa;':''}">
              <td style="padding:5px 8px;border-bottom:1px solid #f0f0f0;">${a}</td>
              <td style="padding:5px 8px;border-bottom:1px solid #f0f0f0;text-align:center;">${b}</td>
              <td style="padding:5px 8px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">${c}</td>
            </tr>`).join('') : `<tr><td colspan="3" style="padding:10px;text-align:center;color:#999;">Nenhum</td></tr>`}
          </tbody>
        </table>`;

      const htmlA4 = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
        <title>Relatório do Dashboard</title>
        <style>
          @page { size: A4; margin: 12mm; }
          body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; color:#222; margin:0; }
          h1 { margin:0; font-size:22px; color:#3a2a1f; }
          .sub { color:#666; font-size:12px; }
          h2 { font-size:13px; margin:18px 0 6px; color:#3a2a1f; border-left:4px solid #2563eb; padding-left:8px; }
          .foot { margin-top:24px; padding-top:8px; border-top:1px dashed #ccc; text-align:center; font-size:10px; color:#888; }
          .logo { max-height:60px; }
          .kpis { display:flex;gap:10px;flex-wrap:wrap;margin-top:10px; }
        </style></head><body>
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #2563eb;padding-bottom:8px;gap:12px;">
            <div style="display:flex;align-items:center;gap:12px;">
              ${s.logo_url ? `<img class="logo" src="${s.logo_url}" alt="logo"/>` : ''}
              <div>
                <h1>${(s.name || 'Empresa')}</h1>
                <div class="sub">Relatório do Dashboard — Período: ${periodo}</div>
              </div>
            </div>
            <div class="sub">${new Date().toLocaleString('pt-BR')}</div>
          </div>

          <div class="kpis">
            ${kpi('Faturamento Bruto', money(stats.totalAmount), '#16a34a')}
            ${kpi('Volume de Pedidos', String(stats.orderVolume || 0), '#2563eb')}
            ${kpi('Ticket Médio', money(stats.avgTicket), '#ea580c')}
            ${kpi('Cancelados', String(stats.cancelledCount || 0), '#dc2626')}
          </div>

          <h2>Pedidos por Status (geral)</h2>
          <table style="width:100%;border-collapse:collapse;border:1px solid #eee;font-size:12px;">
            <thead><tr style="background:#fafafa;">
              <th style="text-align:left;padding:6px 8px;">Status</th>
              <th style="text-align:right;padding:6px 8px;">Quantidade</th>
            </tr></thead>
            <tbody>
              <tr><td style="padding:5px 8px;border-bottom:1px solid #f0f0f0;">Pendentes</td><td style="padding:5px 8px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">${stats.pendingCount || 0}</td></tr>
              <tr style="background:#fafafa;"><td style="padding:5px 8px;border-bottom:1px solid #f0f0f0;">Em Produção</td><td style="padding:5px 8px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">${stats.productionCount || 0}</td></tr>
              <tr><td style="padding:5px 8px;border-bottom:1px solid #f0f0f0;">Prontos</td><td style="padding:5px 8px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">${stats.readyCount || 0}</td></tr>
              <tr style="background:#fafafa;"><td style="padding:5px 8px;border-bottom:1px solid #f0f0f0;">Em Entrega</td><td style="padding:5px 8px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">${stats.deliveringCount || 0}</td></tr>
              <tr><td style="padding:5px 8px;border-bottom:1px solid #f0f0f0;">Cancelados</td><td style="padding:5px 8px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">${stats.cancelledCount || 0}</td></tr>
            </tbody>
          </table>

          ${tableSec('Vendas por Canal', Object.entries(byChannel).map(([k,v])=>[k.toUpperCase(), String(v.qtd), money(v.total)]), ['Canal','Qtd','Total'])}
          ${tableSec('Vendas por Forma de Pagamento', Object.entries(byPayment).map(([k,v])=>[k, String(v.qtd), money(v.total)]), ['Pagamento','Qtd','Total'])}
          ${tableSec('Top 10 Produtos do Período', topProducts.map(([k,v])=>[k, String(v.qtd), money(v.total)]), ['Produto','Qtd','Total'])}

          <div class="foot">www.meupedix.com.br · Relatório gerado em ${new Date().toLocaleString('pt-BR')}</div>
          <script>window.onload=()=>window.print();</script>
        </body></html>`;

      // ===== Térmico 80mm =====
      const line = (k: string, val: any) =>
        `<div style="display:flex;justify-content:space-between;font-size:10px;gap:6px;"><span>${k}</span><b style="text-align:right;">${val}</b></div>`;
      const block = (title: string) => `<div style="font-weight:bold;font-size:11px;margin-top:4px;">${title}</div>`;

      const thermalList = (entries: Array<[string, { qtd: number; total: number }]>) =>
        entries.map(([k,v]) => `<div style="display:flex;justify-content:space-between;font-size:10px;gap:4px;">
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${k}</span>
          <span style="white-space:nowrap;">${v.qtd}x ${money(v.total)}</span>
        </div>`).join('');

      const htmlThermal = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
        <title>Dashboard</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          html, body { margin:0; padding:0; }
          body { width:72mm; padding:3mm; font-family: 'Courier New', monospace; color:#000; font-size:11px; }
          h1 { font-size:13px; text-align:center; margin:0 0 2px; }
          .sub { font-size:9px; text-align:center; color:#444; }
          hr { border:none; border-top:1px dashed #000; margin:6px 0; }
        </style></head><body>
          <h1>${(s.name || 'EMPRESA').toString().toUpperCase()}</h1>
          <div class="sub">Relatório do Dashboard</div>
          <div class="sub">Período: ${periodo}</div>
          <div class="sub">${new Date().toLocaleString('pt-BR')}</div>
          <hr/>
          ${block('RESUMO')}
          ${line('Faturamento', money(stats.totalAmount))}
          ${line('Pedidos', String(stats.orderVolume || 0))}
          ${line('Ticket médio', money(stats.avgTicket))}
          ${line('Cancelados', String(stats.cancelledCount || 0))}
          <hr/>
          ${block('STATUS ATUAL')}
          ${line('Pendentes', stats.pendingCount || 0)}
          ${line('Em produção', stats.productionCount || 0)}
          ${line('Prontos', stats.readyCount || 0)}
          ${line('Em entrega', stats.deliveringCount || 0)}
          ${line('Cancelados', stats.cancelledCount || 0)}
          <hr/>
          ${block('POR CANAL')}
          ${thermalList(Object.entries(byChannel)) || '<div style="font-size:10px;">Nenhum</div>'}
          <hr/>
          ${block('PAGAMENTO')}
          ${thermalList(Object.entries(byPayment)) || '<div style="font-size:10px;">Nenhum</div>'}
          <hr/>
          ${block('TOP PRODUTOS')}
          ${thermalList(topProducts) || '<div style="font-size:10px;">Nenhum</div>'}
          <hr/>
          <div class="sub">www.meupedix.com.br</div>
          <script>window.onload=()=>window.print();</script>
        </body></html>`;

      const html = formatoA4 ? htmlA4 : htmlThermal;
      const w = window.open('', '_blank', 'width=900,height=700');
      if (!w) { toast.error('Bloqueado pelo navegador. Permita pop-ups.'); return; }
      w.document.write(html);
      w.document.close();
    } catch (e) {
      console.error('[printDashboardReport]', e);
      toast.error('Erro ao gerar relatório do dashboard');
    }
  };


  const printCompanyReport = async () => {
    try {
      const { data: printers } = await supabase
        .from('printers')
        .select('id, name, is_active, type, paper_width, is_default')
        .order('name');

      const s: any = storeSettings || {};
      const formatoA4 = (s.print_paper_format || 'a4') === 'a4';
      const yn = (b: any) => (b ? 'Sim' : 'Não');
      const v = (x: any) => (x === null || x === undefined || x === '' ? '-' : String(x));
      const money = (n: any) => `R$ ${Number(n || 0).toFixed(2).replace('.', ',')}`;

      const enderecoCompleto = [s.address, s.address_number, s.complement, s.neighborhood, s.city, s.state, s.zip_code]
        .filter(Boolean).join(', ');

      // ===== A4 =====
      const sec = (title: string, rows: Array<[string, any]>) => `
        <h2>${title}</h2>
        <table style="width:100%;border-collapse:collapse;border:1px solid #eee;font-size:12px;">
          ${rows.map(([k, val], i) => `
            <tr style="${i % 2 ? 'background:#fafafa;' : ''}">
              <td style="padding:5px 8px;border-bottom:1px solid #f0f0f0;width:35%;color:#555;">${k}</td>
              <td style="padding:5px 8px;border-bottom:1px solid #f0f0f0;font-weight:600;">${val}</td>
            </tr>
          `).join('')}
        </table>`;

      const printersA4 = (printers || []).map((p: any) => `
        <tr>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;"><strong>${p.name}</strong>${p.is_default ? ' <span style="color:#ea580c;font-size:10px;">PADRÃO</span>' : ''}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:12px;color:#555;">${p.type || '-'}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:12px;color:#555;">${p.paper_width || '-'}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:12px;">${p.is_active ? '<span style="color:#16a34a;">Ativa</span>' : '<span style="color:#999;">Inativa</span>'}</td>
        </tr>`).join('');

      const htmlA4 = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
        <title>Relatório da Empresa</title>
        <style>
          @page { size: A4; margin: 12mm; }
          body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; color:#222; margin:0; }
          h1 { margin:0; font-size:22px; color:#3a2a1f; }
          .sub { color:#666; font-size:12px; }
          h2 { font-size:13px; margin:18px 0 6px; color:#3a2a1f; border-left:4px solid #ea580c; padding-left:8px; }
          .foot { margin-top:24px; padding-top:8px; border-top:1px dashed #ccc; text-align:center; font-size:10px; color:#888; }
          .logo { max-height:60px; }
        </style></head><body>
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #ea580c;padding-bottom:8px;gap:12px;">
            <div style="display:flex;align-items:center;gap:12px;">
              ${s.logo_url ? `<img class="logo" src="${s.logo_url}" alt="logo"/>` : ''}
              <div>
                <h1>${v(s.name)}</h1>
                <div class="sub">Relatório completo das configurações</div>
              </div>
            </div>
            <div class="sub">${new Date().toLocaleString('pt-BR')}</div>
          </div>

          ${sec('Dados Cadastrais', [
            ['Razão / Nome', v(s.name)],
            ['CNPJ', v(s.cnpj)],
            ['CPF', v(s.cpf)],
            ['E-mail', v(s.email)],
            ['WhatsApp', v(s.whatsapp_number)],
            ['Endereço completo', v(enderecoCompleto)],
            ['Latitude / Longitude', `${v(s.latitude)} / ${v(s.longitude)}`],
          ])}

          ${sec('Operação', [
            ['Delivery habilitado', yn(s.delivery_enabled)],
            ['Retirada habilitada', yn(s.pickup_enabled)],
            ['Cardápio ativo', yn(s.is_menu_active)],
            ['Gestão automática do cardápio', yn(s.auto_manage_menu)],
            ['Taxa fixa de entrega', money(s.fixed_delivery_fee)],
            ['Tempo ocioso da mesa (min)', v(s.idle_table_time_minutes)],
            ['Horários de funcionamento', `<pre style="white-space:pre-wrap;font-size:11px;margin:0;">${v(typeof s.opening_hours === 'object' ? JSON.stringify(s.opening_hours, null, 2) : s.opening_hours)}</pre>`],
          ])}

          ${sec('Taxas e Serviços', [
            ['Couvert artístico', yn(s.couvert_artistico_enabled)],
            ['Valor couvert', money(s.couvert_artistico_value)],
            ['Taxa de serviço', yn(s.service_tax_enabled)],
            ['Percentual taxa serviço', `${v(s.service_tax_percent)}%`],
          ])}

          ${sec('Impressão', [
            ['Formato padrão', formatoA4 ? 'A4' : 'Térmica 80mm'],
            ['Modelo térmica', v(s.thermal_printer_model)],
            ['Modo de lançamento na mesa', v(s.table_print_mode)],
            ['Imprimir item separadamente', yn(s.print_item_separately)],
            ['Impressão centralizada', yn(s.centralized_printing)],
            ['KDS habilitado', yn(s.kds_enabled)],
          ])}

          <h2>Impressoras Cadastradas</h2>
          <table style="width:100%;border-collapse:collapse;border:1px solid #eee;font-size:12px;">
            <thead><tr style="background:#fafafa;">
              <th style="text-align:left;padding:6px 8px;">Impressora</th>
              <th style="text-align:left;padding:6px 8px;">Tipo</th>
              <th style="text-align:left;padding:6px 8px;">Papel</th>
              <th style="text-align:left;padding:6px 8px;">Status</th>
            </tr></thead>
            <tbody>${printersA4 || '<tr><td colspan="4" style="padding:10px;text-align:center;color:#999;">Nenhuma</td></tr>'}</tbody>
          </table>

          ${sec('Fiscal', [
            ['Emissão NF-e habilitada', yn(s.fiscal_nfe_enabled)],
            ['Emissão NFC-e habilitada', yn(s.fiscal_nfce_enabled)],
            ['Client ID', s.client_id ? '••••' + String(s.client_id).slice(-4) : '-'],
            ['Client Secret', s.client_secret ? '••••••••' : '-'],
            ['Token NF-e', s.access_token_nfe ? 'configurado' : '-'],
            ['Token NFC-e', s.access_token_nfce ? 'configurado' : '-'],
          ])}

          ${sec('Integrações', [
            ['URL Cardápio Digital', v(s.digital_menu_url)],
          ])}

          <div class="foot">www.meupedix.com.br · Relatório gerado em ${new Date().toLocaleString('pt-BR')}</div>
          <script>window.onload=()=>window.print();</script>
        </body></html>`;

      // ===== Térmico 80mm =====
      const line = (k: string, val: any) =>
        `<div style="display:flex;justify-content:space-between;font-size:10px;gap:6px;"><span>${k}</span><b style="text-align:right;">${val}</b></div>`;
      const block = (title: string) => `<div style="font-weight:bold;font-size:11px;margin-top:4px;">${title}</div>`;

      const printersThermal = (printers || []).map((p: any) =>
        `<div style="display:flex;justify-content:space-between;font-size:10px;">
          <span>${p.is_active ? '●' : '○'} ${p.name}${p.is_default ? ' *' : ''}</span>
          <span>${p.paper_width || '-'}</span>
        </div>`
      ).join('');

      const htmlThermal = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
        <title>Empresa</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          html, body { margin:0; padding:0; }
          body { width:72mm; padding:3mm; font-family: 'Courier New', monospace; color:#000; font-size:11px; }
          h1 { font-size:13px; text-align:center; margin:0 0 2px; }
          .sub { font-size:9px; text-align:center; color:#444; }
          hr { border:none; border-top:1px dashed #000; margin:6px 0; }
        </style></head><body>
          <h1>${v(s.name).toUpperCase()}</h1>
          <div class="sub">Relatório da Empresa</div>
          <div class="sub">${new Date().toLocaleString('pt-BR')}</div>
          <hr/>
          ${block('CADASTRO')}
          ${line('CNPJ', v(s.cnpj))}
          ${line('CPF', v(s.cpf))}
          ${line('E-mail', v(s.email))}
          ${line('WhatsApp', v(s.whatsapp_number))}
          <div style="font-size:10px;margin-top:2px;">${v(enderecoCompleto)}</div>
          <hr/>
          ${block('OPERAÇÃO')}
          ${line('Delivery', yn(s.delivery_enabled))}
          ${line('Retirada', yn(s.pickup_enabled))}
          ${line('Cardápio ativo', yn(s.is_menu_active))}
          ${line('Taxa entrega', money(s.fixed_delivery_fee))}
          ${line('Tempo mesa(min)', v(s.idle_table_time_minutes))}
          <hr/>
          ${block('TAXAS')}
          ${line('Couvert', yn(s.couvert_artistico_enabled))}
          ${line('Valor couvert', money(s.couvert_artistico_value))}
          ${line('Taxa serviço', yn(s.service_tax_enabled))}
          ${line('% serviço', `${v(s.service_tax_percent)}%`)}
          <hr/>
          ${block('IMPRESSÃO')}
          ${line('Formato', formatoA4 ? 'A4' : 'Térmica 80mm')}
          ${line('Modelo', v(s.thermal_printer_model))}
          ${line('Modo mesa', v(s.table_print_mode))}
          ${line('Item separado', yn(s.print_item_separately))}
          ${line('Centralizada', yn(s.centralized_printing))}
          ${line('KDS', yn(s.kds_enabled))}
          <div style="margin-top:4px;font-weight:bold;font-size:10px;">IMPRESSORAS</div>
          ${printersThermal || '<div style="font-size:10px;color:#666;">Nenhuma</div>'}
          <hr/>
          ${block('FISCAL')}
          ${line('NF-e', yn(s.fiscal_nfe_enabled))}
          ${line('NFC-e', yn(s.fiscal_nfce_enabled))}
          ${line('Client ID', s.client_id ? '••' + String(s.client_id).slice(-4) : '-')}
          ${line('Token NF-e', s.access_token_nfe ? 'OK' : '-')}
          ${line('Token NFC-e', s.access_token_nfce ? 'OK' : '-')}
          <hr/>
          <div class="sub">www.meupedix.com.br</div>
          <script>window.onload=()=>window.print();</script>
        </body></html>`;

      const html = formatoA4 ? htmlA4 : htmlThermal;
      const w = window.open('', '_blank', formatoA4 ? 'width=1000,height=900' : 'width=360,height=900');
      if (!w) { toast.error('Habilite popups para imprimir o relatório'); return; }
      w.document.write(html);
      w.document.close();
    } catch (e) {
      console.error('[printCompanyReport]', e);
      toast.error('Erro ao gerar relatório da empresa');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, driverId?: string) => {
    try {
      const payload: any = { status: newStatus };
      if (driverId) payload.driver_id = driverId;
      
      const { error: updateError } = await supabase.from("delivery_orders").update(payload).eq("id", orderId);
      if (updateError) throw updateError;

      // Buscar pedido atualizado
      const { data: order, error: fetchError } = await supabase.from("delivery_orders").select("*, delivery_order_items(*)").eq("id", orderId).single();
      if (fetchError || !order) throw fetchError || new Error("Pedido não encontrado");

      // Enviar WhatsApp (opcional, já estava no código)
      if (order.customer_phone) {
        const storeName = storeSettings?.name || "Nossa Pizzaria";
        if (newStatus === 'production') {
          // whatsappMessage = ... (lógica já existente em outros lugares)
        }
      }

      // Imprime cupom do motoqueiro apenas quando a entrega é finalizada
      if (newStatus === 'delivered' || newStatus === 'awaiting_reconciliation') {
        try {
          await printDriverReceipt(order as any, driverId || (order as any).driver_id);
        } catch (e) {
          console.error('[Delivery] Falha ao gerar cupom do motoqueiro:', e);
        }
      }

      // Lógica de status para finalização direta
      if (newStatus === 'delivered' || newStatus === 'awaiting_reconciliation') {
        toast.success(newStatus === 'delivered' ? "Pedido finalizado com sucesso!" : "Pedido enviado para conciliação no caixa!");
      } else {
        toast.success(`Pedido atualizado para ${newStatus}`);
      }
      
      await fetchData(true, true);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const startTrackingOrder = (orderId: string) => {
    toast.info("Rastreio GPS desativado a pedido do usuário.");
  };

  const stopTrackingOrder = () => {
    setTrackingOrderId(null);
  };


  const handleReconcileOrder = async (order: DeliveryOrder, paymentMethod: string, splitDetails: any = null, selectedCustomerId?: string) => {
    try {
      // Removida obrigatoriedade de motoqueiro para finalizar pedido
      // if (order.order_type === 'delivery' && !order.driver_id) {
      //   toast.error("Por favor, selecione um motoqueiro antes de realizar o acerto/finalização do pedido.");
      //   return;
      // }
      setLoading(true);
      const isCaderneta = paymentMethod === 'caderneta';
      const finalCustomerId = selectedCustomerId || order.customer_id;
      
      const payload: any = {
        status: 'delivered', // Finaliza definitivamente
        driver_status: 'entregue', // Sincroniza com o app do entregador
        delivered_at: toSupabaseDateTime(),
        payment_method: paymentMethod,
        payment_split_details: splitDetails,
        reconciled_at: toSupabaseDateTime(),
        is_on_account: isCaderneta,
        customer_id: finalCustomerId
      };

      const { error: updateError } = await supabase
        .from("delivery_orders")
        .update(payload)
        .eq("id", order.id);
        
      if (updateError) throw updateError;

      // Calcular subtotal e taxas
      const itemsTotal = order.delivery_order_items?.reduce((acc: number, item: any) => acc + item.total_price, 0) || 0;
      const deliveryFee = (order as any).delivery_fee || (order.total_amount - itemsTotal);
      const finalTotalAmount = order.total_amount;

      // Localizar a forma de pagamento selecionada
      const selectedPaymentMethod = paymentMethods.find(m => m.name === paymentMethod);
      
      // Se a forma de pagamento tiver uma categoria vinculada, usamos ela, caso contrário buscamos uma padrão de receita (Vendas)
      const incomeCategory = finCategories.find(c => c.id === (selectedPaymentMethod as any)?.financial_category_id) || 
                            finCategories.find(c => c.name.toLowerCase().includes('venda') && c.type === 'income') ||
                            finCategories.find(c => c.type === 'income');
      
      const expenseCategory = finCategories.find(c => c.name.toLowerCase().includes('entrega') && c.type === 'expense') ||
                             finCategories.find(c => c.type === 'expense');

      // Buscar Plano de Contas DRE correspondente à categoria ou à forma de pagamento
      // Tenta encontrar por ID vinculado, ou pelo nome da categoria no plano de contas
      let incomeDreAccount = chartAccounts.find(ca => ca.id === (incomeCategory as any)?.chart_account_id) ||
                              chartAccounts.find(ca => ca.id === (selectedPaymentMethod as any)?.chart_account_id);
      
      if (!incomeDreAccount && incomeCategory) {
        // Fallback: Tentar encontrar uma conta DRE que tenha o nome similar à categoria ou seja de vendas
        incomeDreAccount = chartAccounts.find(ca => ca.name.toLowerCase().includes(incomeCategory.name.toLowerCase()) && ca.level === 3) ||
                           chartAccounts.find(ca => ca.name.toLowerCase().includes('venda') && ca.level === 3);
      }

      let expenseDreAccount = chartAccounts.find(ca => ca.id === (expenseCategory as any)?.chart_account_id);
      if (!expenseDreAccount && expenseCategory) {
        expenseDreAccount = chartAccounts.find(ca => ca.name.toLowerCase().includes(expenseCategory.name.toLowerCase()) && ca.level === 3) ||
                           chartAccounts.find(ca => ca.name.toLowerCase().includes('entrega') && ca.level === 3);
      }

      // Calcular data de emissão baseada na data do pedido e vencimento padrão (hoje + 30 dias)
      const orderDate = new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date(order.created_at));
      const now = new Date();
      const todayDate = new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Sao_Paulo' }).format(now);
      
      const dueDateObj = new Date(now);
      dueDateObj.setDate(now.getDate() + 30);
      const dueDate = new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Sao_Paulo' }).format(dueDateObj);

      // Se for Caderneta, lança no histórico de débito do cliente
      if (isCaderneta && order.customer_id) {
        await supabase.from("customer_ledgers").insert({
          customer_id: order.customer_id,
          order_id: order.id,
          amount: finalTotalAmount,
          type: 'charge',
          description: `Venda a prazo (Caderneta) - Pedido #${order.id.slice(0, 8)}`
        });
        
        // No financeiro, entra como pendente (contas a receber) com vencimento em 30 dias
        await supabase.from("financial_transactions").insert([{
          description: `Venda Caderneta Pedido #${order.id.slice(0, 8)} - ${order.customer_name}`,
          amount: finalTotalAmount,
          type: 'income',
          category_id: incomeCategory?.id || (selectedPaymentMethod as any)?.financial_category_id || finCategories[0]?.id,
          date: orderDate,
          status: 'pending',
          due_date: dueDate,
          customer_id: order.customer_id,
          chart_account_id: incomeDreAccount?.id || null,
          cashier_session_id: activeSession?.id || null
        }]);
      } else {
        // Pagamentos à vista (Dinheiro, Cartão, Pix...) entram como 'paid' no financeiro e caixa
        await supabase.from("financial_transactions").insert([{
          description: `Venda Caixa Pedido #${order.id.slice(0, 8)} (${paymentMethod}) - ${order.customer_name}`,
          amount: finalTotalAmount,
          type: 'income',
          category_id: incomeCategory?.id || (selectedPaymentMethod as any)?.financial_category_id || finCategories[0]?.id,
          date: orderDate,
          due_date: orderDate, // À vista vence hoje
          customer_id: order.customer_id,
          status: 'paid',
          payment_date: todayDate,
          chart_account_id: incomeDreAccount?.id || null,
          cashier_session_id: activeSession?.id || null
        }]);
      }

      // Lançar pagamento do motoqueiro se houver taxa
      if (order.order_type === 'delivery' && order.driver_id && deliveryFee > 0) {
        const driver = drivers.find(d => d.id === order.driver_id);
        
        // Viagem
        await supabase.from("driver_trips").insert([{
          cashier_session_id: activeSession?.id || null,
          driver_id: order.driver_id,
          trip_count: 1,
          fee_per_trip: deliveryFee,
          total_fee: deliveryFee,
          notes: `Entrega Pedido #${order.id.slice(0, 8)}`
        }]);

        // Financeiro (Saída)
        // Verificar se existe um fornecedor correspondente ao motoqueiro, ou criar um
        let driverSupplierId = null;
        if (driver) {
          const { data: existingSupp } = await supabase
            .from("suppliers")
            .select("id")
            .eq("name", `Motoqueiro: ${driver.name}`)
            .maybeSingle();
            
          if (existingSupp) {
            driverSupplierId = existingSupp.id;
          } else {
            const { data: newSupp } = await supabase
              .from("suppliers")
              .insert([{ name: `Motoqueiro: ${driver.name}`, phone: driver.phone }])
              .select()
              .single();
            if (newSupp) driverSupplierId = newSupp.id;
          }
        }

        await supabase.from("financial_transactions").insert([{
          description: `Pagamento Motoqueiro: ${driver?.name || 'Motoqueiro'} (Pedido #${order.id.slice(0, 8)})`,
          amount: deliveryFee,
          type: 'expense',
          category_id: expenseCategory?.id || finCategories.find(c => c.name.toLowerCase().includes('entrega'))?.id || finCategories[0]?.id,
          date: orderDate,
          due_date: orderDate,
          status: 'paid',
          payment_date: todayDate,
          supplier_id: driverSupplierId,
          chart_account_id: expenseDreAccount?.id || null,
          cashier_session_id: activeSession?.id || null
        }]);
      }

      toast.success("Venda concluída e conciliada no caixa!");
      fetchData();
    } catch (error: any) {
      toast.error("Erro na conciliação: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompGroup = async () => {
    if (!newCompGroup.name) {
      toast.error("O nome do grupo é obrigatório");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        name: newCompGroup.name,
        min_choices: Number(newCompGroup.min_choices || 0),
        max_choices: Number(newCompGroup.max_choices || 1)
      };
      
      let savedGroupId = editingCompGroup?.id;
      if (savedGroupId) {
        const { error } = await supabase.from("complement_groups").update(payload).eq("id", savedGroupId);
        if (error) throw error;
        toast.success("Grupo atualizado!");
      } else {
        const { data, error } = await supabase.from("complement_groups").insert([payload]).select("id").single();
        if (error) throw error;
        savedGroupId = data?.id;
        toast.success("Grupo criado!");
      }

      if (savedGroupId) {
        // Atualizar categorias
        console.log("Deletando categorias para group_id:", savedGroupId);
        const { error: unlinkCatError } = await supabase.from("category_complement_groups").delete().eq("group_id", savedGroupId);
        if (unlinkCatError) throw unlinkCatError;
        
        console.log("selectedCompGroupCategoryIds:", selectedCompGroupCategoryIds);
        if (selectedCompGroupCategoryIds.length > 0) {
          const insertPayload = selectedCompGroupCategoryIds.map(category_id => ({ category_id, group_id: savedGroupId }));
          console.log("Inserindo categorias:", insertPayload);
          const { error: linkCatError, data: linkCatData } = await supabase.from("category_complement_groups").insert(insertPayload).select();
          console.log("Insert resultado categorias:", { linkCatError, linkCatData });
          if (linkCatError) throw linkCatError;
        }

        // Atualizar produtos individuais
        console.log("Deletando produtos para group_id:", savedGroupId);
        const { error: unlinkProdError } = await supabase.from("product_complement_groups").delete().eq("group_id", savedGroupId);
        if (unlinkProdError) throw unlinkProdError;

        console.log("selectedCompGroupProductIds:", selectedCompGroupProductIds);
        if (selectedCompGroupProductIds.length > 0) {
          const insertProdPayload = selectedCompGroupProductIds.map(product_id => ({ product_id, group_id: savedGroupId }));
          console.log("Inserindo produtos:", insertProdPayload);
          const { error: linkProdError, data: linkProdData } = await supabase.from("product_complement_groups").insert(insertProdPayload).select();
          console.log("Insert resultado produtos:", { linkProdError, linkProdData });
          if (linkProdError) throw linkProdError;
        }
      }
      
      setIsCompGroupDialogOpen(false);
      setEditingCompGroup(null);
      setNewCompGroup({ name: "", min_choices: 0, max_choices: 1 });
      setSelectedCompGroupCategoryIds([]);
      setSelectedCompGroupProductIds([]);
      await fetchData(true, true);
    } catch (err: any) {
      console.error("Erro ao salvar grupo:", err);
      toast.error("Erro: " + (err.message || "Erro desconhecido"));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveComplement = async () => {
    if (!newComplement.name || !newComplement.group_id) {
      toast.error("Preencha nome e grupo");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        name: newComplement.name,
        price: Number(newComplement.price?.toString().replace(',', '.') || 0),
        group_id: newComplement.group_id
      };
      
      if (editingComplement?.id) {
        const { error } = await supabase.from("complements").update(payload).eq("id", editingComplement.id);
        if (error) throw error;
        toast.success("Complemento atualizado!");
      } else {
        const { error } = await supabase.from("complements").insert([payload]);
        if (error) throw error;
        toast.success("Complemento criado!");
      }
      
      setIsComplementDialogOpen(false);
      setEditingComplement(null);
      setNewComplement({ name: "", price: "0", group_id: "" });
      await fetchData(true, true);
    } catch (err: any) {
      console.error("Erro ao salvar complemento:", err);
      toast.error("Erro: " + (err.message || "Erro desconhecido"));
    } finally {
      setLoading(false);
    }
  };

   const handleAddCustomItemToOrder = () => {
    const { activeItem } = newDeliveryOrder as any;
    if (!activeItem?.product) return;

    const prod = activeItem.product;
    const relevantGroups = complementGroups.filter(group => {
      const productGroupIds = productComplementGroups
        .filter(pg => pg.group_id && pg.product_id === prod.id)
        .map(pg => pg.group_id);
      const categoryGroupIds = prod.category_id
        ? categoryComplementGroups
            .filter(cg => cg.group_id && cg.category_id === prod.category_id)
            .map(cg => cg.group_id)
        : [];
      const relevantGroupIds = [...new Set([...productGroupIds, ...categoryGroupIds])];
      if (relevantGroupIds.includes(group.id)) return true;
      const hasAnyManualLink =
        productComplementGroups.some(pg => pg.group_id === group.id) ||
        categoryComplementGroups.some(cg => cg.group_id === group.id);
      if (hasAnyManualLink) return false;
      return true;
    });

    const missingGroup = relevantGroups.find(g => {
      const selected = (activeItem.selectedComplements || []).filter((c: any) => c.group_id === g.id).length;
      return selected < g.min_choices;
    });

    if (missingGroup) {
      toast.error(`Selecione pelo menos ${missingGroup.min_choices} opção em "${missingGroup.name}"`);
      return;
    }

    // Regra extra: Grupo de Pão
    const paoGroup = relevantGroups.find(g => g.name.toLowerCase().includes('pão') || g.name.toLowerCase().includes('pao'));
    if (paoGroup) {
      const selectedPao = (activeItem.selectedComplements || []).filter((c: any) => c.group_id === paoGroup.id).length;
      if (selectedPao === 0) {
        toast.error(`Por favor, selecione o ${paoGroup.name}`);
        return;
      }
    }

    const comps = activeItem.selectedComplements || [];
    const size = activeItem.size || "Preço de Venda";
    const selectedSuggestions = activeItem.selectedSuggestions || [];
    const hadInlineSuggestions = Array.isArray(activeItem.suggestions) && activeItem.suggestions.length > 0;

    const basePrice = (size !== "Preço de Venda" && prod.size_prices?.[size]) ? Number(prod.size_prices[size]) : Number(prod.price);
    const compsPrice = comps.reduce((acc: number, c: any) => {
      const p = (size !== "Preço de Venda" && c.size_prices?.[size]) ? Number(c.size_prices[size]) : Number(c.price || 0);
      return acc + p;
    }, 0);

    const name = `${prod.name}${size !== "Preço de Venda" ? ` (${size})` : ""}`;

    // Itens novos: produto principal + sugestões marcadas inline
    const newItems: any[] = [{
      product_id: prod.id,
      product_name: name,
      quantity: 1,
      unit_price: basePrice + compsPrice,
      selected_complements: comps,
    }];

    selectedSuggestions.forEach((s: any) => {
      newItems.push({
        product_id: s.id,
        product_name: s.name,
        quantity: 1,
        unit_price: Number(s.price),
        selected_complements: [],
      });
    });

    setNewDeliveryOrder({
      ...newDeliveryOrder,
      items: [...newDeliveryOrder.items, ...newItems],
      activeItem: null
    } as any);
    setIsOrderComplementDialogOpen(false);

    if (selectedSuggestions.length > 0) {
      toast.success(`+ ${selectedSuggestions.length} sugestão(ões) adicionada(s)!`);
    }

    // Se já mostramos sugestões inline, não reabrir o diálogo de sugestões
    if (hadInlineSuggestions) return;

    // --- TRIGGER SUGESTÕES CROSS-SELL NO ATENDIMENTO (PRODUTOS MONTADOS) ---
    let suggestions: string[] = [];
    if (prod.id === 'pizza-composite' && newDeliveryOrder.activeItem?.flavors) {
      const flavors = newDeliveryOrder.activeItem.flavors;
      flavors.forEach((f: any) => {
        const prodObj = products.find(p => p.id === f.id);
        if (prodObj?.suggested_products) {
          suggestions = [...suggestions, ...prodObj.suggested_products];
        }
      });
    } else {
      const prodForSuggestion = products.find(p => p.id === prod.id);
      suggestions = prodForSuggestion?.suggested_products || [];
    }
    suggestions = Array.from(new Set(suggestions));

    if (suggestions.length > 0) {
      let suggestedProducts = products.filter(p => suggestions.includes(p.id) && p.active !== false);
      const missingSuggestions = suggestions.filter(id => !suggestedProducts.some(p => p.id === id));
      if (missingSuggestions.length > 0 && typeof window !== 'undefined' && (window as any).allProducts) {
        const extra = (window as any).allProducts.filter((p: any) => missingSuggestions.includes(p.id) && p.active !== false);
        suggestedProducts = suggestedProducts.concat(extra);
      }
      const finalSuggestions = suggestedProducts.filter(s => !newDeliveryOrder.items.some(item => item.product_id === s.id));
      if (finalSuggestions.length > 0) {
        setSuggestionDialog({ open: true, products: finalSuggestions });
      }
    }
  };

  const handleCreateOrder = async () => {
    if (!newDeliveryOrder.customer_name) {
      toast.error("Preencha o nome do cliente.");
      return;
    }
    if (newDeliveryOrder.items.length === 0) {
      toast.error("Adicione itens ao pedido.");
      return;
    }
    if (newDeliveryOrder.order_type === 'delivery' && !newDeliveryOrder.customer_address) {
      toast.error("Preencha o endereço para entrega.");
      return;
    }
    // Validação de cidade: só entrega na mesma cidade cadastrada na empresa.
    if (newDeliveryOrder.order_type === 'delivery') {
      const norm = (s: any) => String(s || '').trim().toLowerCase();
      const orderCity = norm((newDeliveryOrder as any).city);
      const storeCity = norm(storeSettings?.city);
      if (orderCity && storeCity && orderCity !== storeCity) {
        toast.error(`Não é possível criar pedido: a cidade "${(newDeliveryOrder as any).city}" é diferente da cidade cadastrada na empresa ("${storeSettings?.city}").`, { duration: 7000 });
        return;
      }
    }
    if (!newDeliveryOrder.customer_phone) {
      toast.error("Preencha o telefone do cliente.");
      return;
    }

    try {
      setLoading(true);
      
      let customerId = (newDeliveryOrder as any).customer_id;
      
      const customerPayload = {
        name: newDeliveryOrder.customer_name,
        phone: newDeliveryOrder.customer_phone,
        address: newDeliveryOrder.customer_address,
        address_number: (newDeliveryOrder as any).address_number,
        address_complement: (newDeliveryOrder as any).address_complement,
        neighborhood: (newDeliveryOrder as any).neighborhood,
        city: (newDeliveryOrder as any).city,
        state: (newDeliveryOrder as any).state,
        zip_code: (newDeliveryOrder as any).zip_code,
        person_type: (newDeliveryOrder as any).person_type || "fisica",
        cpf: (newDeliveryOrder as any).cpf || null,
        cnpj: (newDeliveryOrder as any).cnpj || null
      };

      // Se não tem ID, tenta buscar por telefone ou cria um novo
      if (!customerId && newDeliveryOrder.customer_phone) {
        const { data: existingCust } = await supabase
          .from("customers")
          .select("id")
          .eq("phone", newDeliveryOrder.customer_phone)
          .maybeSingle();
        
        if (existingCust) {
          customerId = existingCust.id;
        } else {
          // Criar novo cliente automaticamente
          const { data: newCust, error: custError } = await supabase
            .from("customers")
            .insert(customerPayload)
            .select()
            .single();
          
          if (!custError && newCust) {
            customerId = newCust.id;
          }
        }
      } else if (customerId) {
        // Se já tem ID, atualiza os dados do cliente caso tenham mudado
        await supabase
          .from("customers")
          .update(customerPayload)
          .eq("id", customerId);
      }

      // Calcular subtotal dos itens
      const subtotal = newDeliveryOrder.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

      // Calcular taxas de entrega
      const deliveryFee = newDeliveryOrder.order_type === 'delivery' ? (Number(newDeliveryOrder.delivery_fee) || 0) : 0;

      const totalAmount = subtotal + deliveryFee;
      
      // Montar endereço completo para o snapshot do pedido
      const fullAddress = `${newDeliveryOrder.customer_address}${newDeliveryOrder.address_number ? ', ' + newDeliveryOrder.address_number : ''}${newDeliveryOrder.address_complement ? ' (' + newDeliveryOrder.address_complement + ')' : ''}${(newDeliveryOrder as any).neighborhood ? ' - ' + (newDeliveryOrder as any).neighborhood : ''}${newDeliveryOrder.city ? ' - ' + newDeliveryOrder.city : ''}`;

      // Regra de fluxo: TODO pedido novo entra primeiro em "Atendimento" (status = 'pending').
      // A partir do atendimento, o operador envia para Produção (somente os itens marcados como cozinha)
      // e em seguida para Entrega. Não pulamos mais direto para 'ready'.
      const initialStatus: 'pending' = 'pending';
      console.log(`🚀 Criando pedido. Initial Status forçado: ${initialStatus} (fluxo Atendimento → Produção → Entrega)`);




      const now = new Date();
      // Garantir que a data de criação seja sempre no fuso de Brasília (São Paulo)
      const brNowISOStr = toSupabaseDateTime();

      const { data: order, error: orderError } = await supabase.from("delivery_orders").insert({
        customer_id: customerId || null,
        customer_name: newDeliveryOrder.customer_name,
        customer_phone: newDeliveryOrder.customer_phone,
        customer_address: fullAddress,
        neighborhood: (newDeliveryOrder as any).neighborhood || "",
        customer_cep: newDeliveryOrder.zip_code,
        customer_city: newDeliveryOrder.city,
        customer_state: newDeliveryOrder.state,
        total_amount: Number(totalAmount) || 0,
        delivery_fee: Number(deliveryFee) || 0,
        order_type: newDeliveryOrder.order_type,
        notes: newDeliveryOrder.notes,
        observation: newDeliveryOrder.observation,
        status: initialStatus,
        cashier_session_id: activeSession?.id,
        tipo_venda: (newDeliveryOrder as any).tipo_venda || null,
        frete: Number((newDeliveryOrder as any).frete) || 0,
        created_at: brNowISOStr
      } as any).select();

      if (orderError) throw orderError;
      if (!order || order.length === 0) throw new Error("Erro ao criar o pedido: nenhum dado retornado.");
      
      const createdOrder = order[0];

      const orderItems = newDeliveryOrder.items.map(item => {
        // Garantir que selected_complements seja um array de objetos serializável
        const selectedComplements = Array.isArray(item.selected_complements) 
          ? item.selected_complements.map((c: any) => ({
              id: c.id,
              name: c.name,
              price: Number(c.price) || 0,
              group_id: c.group_id
            }))
          : [];

        // Validar se o product_id é um UUID válido (pizzas montadas usam 'pizza-composite')
        const isValidUUID = item.product_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.product_id);

        return {
          order_id: createdOrder.id,
          product_id: isValidUUID ? item.product_id : null,
          product_name: item.product_name,
          quantity: Number(item.quantity) || 1,
          unit_price: Number(item.unit_price) || 0,
          total_price: (Number(item.quantity) || 1) * (Number(item.unit_price) || 0),
          selected_complements: selectedComplements as any,
          notes: (item.notes || item.observations || "").toString().trim() || null,
        };
      });

      const { error: itemsError } = await supabase.from("delivery_order_items").insert(orderItems as any);
      if (itemsError) {
        console.error("Erro ao inserir itens:", itemsError);
        throw itemsError;
      }

      // Impressão é disparada automaticamente pelo listener realtime de INSERT em delivery_orders
      // (evita duplicação de vias quando várias abas do admin estão abertas).

      toast.success("Pedido criado com sucesso!");
      
      // Fechar o modal imediatamente
      setIsOrderDialogOpen(false);
      
      // Limpar os dados após fechar
      setTimeout(() => {
        setNewDeliveryOrder({ 
          customer_name: "", 
          customer_phone: "", 
          customer_address: "", 
          address_number: "",
          address_complement: "",
          neighborhood: "",
          city: "",
          state: "",
          zip_code: "",
          person_type: "fisica",
          cpf: "",
          cnpj: "",
          order_type: "counter", 

          notes: "", 
          delivery_fee: 0,
          items: [],
          activeItem: null,
          search_value: ""
        } as any);
      }, 100);

      // Forçamos o recarregamento dos dados
      fetchData();
    } catch (error: any) {
      console.error("Erro completo ao criar pedido:", error);
      toast.error("Erro ao criar pedido: " + (error.message || "Erro desconhecido"));
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'sidebar_logo_url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setImageUploading(true);
      
      const publicUrl = await uploadMenuImage(file, 'logo', 1200);
      
      console.log(`Sucesso no upload! URL gerada para ${field}:`, publicUrl);
      updateCompanyDraft({ [field]: publicUrl });
      
      // Imediatamente tenta salvar no banco para garantir persistência
      const { error: saveError } = await supabase
        .from("store_settings")
        .update({ [field]: publicUrl } as any)
        .eq("id", storeSettings.id);

      if (saveError) {
        console.error(`Erro ao persistir ${field}:`, saveError);
        throw saveError;
      }
      
      setStoreSettings((prev: any) => {
        const next = { ...prev, [field]: publicUrl };
        console.log("Novo estado de storeSettings:", next);
        return next;
      });
      toast.success("Imagem carregada! Não esqueça de salvar as alterações no botão abaixo.");
    } catch (error: any) {
      console.error("Erro no upload do logo:", error);
      toast.error("Erro ao carregar imagem: " + (error.message || "Erro desconhecido"));
    } finally {
      setLoading(false);
      setImageUploading(false);
    }
  }, [updateCompanyDraft, storeSettings?.id]);

  const handleLogoDelete = useCallback(async (field: 'logo_url' | 'sidebar_logo_url') => {
    if (!storeSettings?.id) return;
    
    try {
      setLoading(true);
      // 1. Atualiza no banco de dados primeiro
      const { error } = await supabase
        .from("store_settings")
        .update({ [field]: null } as any)
        .eq("id", storeSettings.id);

      if (error) throw error;

      // 2. Atualiza os estados locais para refletir na UI imediatamente
      updateCompanyDraft({ [field]: "" });
      setStoreSettings((prev: any) => ({ ...prev, [field]: null }));
      
      toast.success("Logo removida com sucesso!");
    } catch (error: any) {
      console.error("Erro ao deletar logo:", error);
      toast.error("Erro ao remover logo: " + (error.message || "Erro desconhecido"));
    } finally {
      setLoading(false);
    }
  }, [storeSettings?.id, updateCompanyDraft]);


  const handleOpenCashier = async () => {
    if (!openingBalance) {
      toast.error("Informe o saldo inicial.");
      return;
    }
    try {
      const { data, error } = await supabase.from("cashier_sessions").insert({
        opening_balance: parseFloat(openingBalance),
        notes: cashierNotes,
        status: 'open'
      } as any).select().single();
      
      if (error) throw error;
      toast.success("Caixa aberto com sucesso!");
      setIsCashierDialogOpen(false);
      setOpeningBalance("");
      setCashierNotes("");
      fetchData();
      
      // Emitir relatório de abertura automaticamente
      if (data) {
        handlePrintOpeningReport(data as CashierSession);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCloseCashier = async () => {
    if (!activeSession) return;
    
    // Verificar mesas em aberto antes de fechar o caixa
    try {
      const { data: openSessions, error: sessionError } = await supabase
        .from("table_sessions")
        .select("id")
        .in("status", ["open", "bill_requested"]);

      if (sessionError) throw sessionError;

      if (openSessions && openSessions.length > 0) {
        toast.error(`Não é possível fechar o caixa. Existem ${openSessions.length} mesa(s) aberta(s).`, {
          duration: 5000,
          description: "Feche todos os atendimentos de mesa antes de encerrar o caixa."
        });
        return;
      }
    } catch (error: any) {
      console.error("Erro ao verificar mesas abertas:", error);
      toast.error("Erro ao verificar mesas abertas. Tente novamente.");
      return;
    }

    // Calculate final balance: opening + income - expenses - driver_fees
    const sessionIncomes = transactions
      .filter(t => t.cashier_session_id === activeSession.id && t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const sessionExpenses = transactions
      .filter(t => t.cashier_session_id === activeSession.id && t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    // As taxas de motoqueiro já estão incluídas em sessionExpenses como transações de 'expense'
    // portanto não subtraímos sessionDriverFees novamente para evitar duplicidade.
    const finalBalance = activeSession.opening_balance + sessionIncomes - sessionExpenses;

    try {
      const { error } = await supabase.from("cashier_sessions").update({
        closed_at: toSupabaseDateTime(),
        closing_balance: finalBalance,
        status: 'closed'
      }).eq("id", activeSession.id);

      if (error) throw error;
      toast.success("Caixa fechado com sucesso!");
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAddTrip = async () => {
    if (!activeSession || !tripData.driver_id || !tripData.trip_count) {
      toast.error("Preencha todos os dados da viagem.");
      return;
    }
    try {
      const fee = parseFloat(tripData.fee_per_trip);
      const count = parseInt(tripData.trip_count);
      const total = fee * count;

      // 1. Grava controle de viagem
      const { error: tripError } = await supabase.from("driver_trips").insert({
        cashier_session_id: activeSession.id,
        driver_id: tripData.driver_id,
        trip_count: count,
        fee_per_trip: fee,
        total_fee: total,
        notes: tripData.notes || "Lançamento manual de viagem"
      } as any);

      if (tripError) throw tripError;

      // 2. Grava saída financeira (pagamento motoqueiro)
      const expenseCategory = finCategories.find(c => c.type === 'expense');
      const driver = drivers.find(d => d.id === tripData.driver_id);

      // Verificar ou criar fornecedor para o motoqueiro
      let driverSupplierId = null;
      if (driver) {
        const { data: existingSupp } = await supabase
          .from("suppliers")
          .select("id")
          .eq("name", `Motoqueiro: ${driver.name}`)
          .maybeSingle();
          
        if (existingSupp) {
          driverSupplierId = existingSupp.id;
        } else {
          const { data: newSupp } = await supabase
            .from("suppliers")
            .insert([{ name: `Motoqueiro: ${driver.name}`, phone: driver.phone } as any])
            .select()
            .single();
          if (newSupp) driverSupplierId = newSupp.id;
        }
      }

      await supabase.from("financial_transactions").insert([{
        description: `Pagamento Motoqueiro: ${driver?.name || 'Motoqueiro'} (Lançamento Manual)`,
        amount: total,
        type: 'expense',
        category_id: expenseCategory?.id || finCategories.find(c => c.name.toLowerCase().includes('entrega'))?.id || finCategories[0]?.id,
        date: todayDate,
        due_date: todayDate,
        status: 'paid',
        payment_date: todayDate,
        supplier_id: driverSupplierId,
        cashier_session_id: activeSession.id
      }]);

      toast.success("Viagem e pagamento registrados!");
      setTripData({ driver_id: "", trip_count: "1", fee_per_trip: "0", notes: "" });
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAddTransactionWithCashier = async () => {
    if (!newTransaction.description) {
      toast.error("A descrição é obrigatória.");
      return;
    }
    if (!newTransaction.amount || parseFloat(newTransaction.amount) <= 0) {
      toast.error("O valor deve ser maior que zero.");
      return;
    }
    if (!newTransaction.date) {
      toast.error("A data de lançamento é obrigatória.");
      return;
    }
    if (!newTransaction.due_date) {
      toast.error("A data de vencimento é obrigatória.");
      return;
    }
    if (newTransaction.type === 'income' && !newTransaction.customer_id) {
      toast.error("O cliente é obrigatório para receitas.");
      return;
    }
    if (newTransaction.type === 'expense' && !newTransaction.supplier_id) {
      toast.error("O fornecedor é obrigatório para despesas.");
      return;
    }
    if (!newTransaction.category_id) {
      toast.error("A categoria é obrigatória.");
      return;
    }
    if (!newTransaction.chart_account_id) {
      toast.error("O plano de contas (DRE) é obrigatório.");
      return;
    }
    try {
      const payload = {
        description: newTransaction.description,
        amount: parseFloat(newTransaction.amount),
        type: newTransaction.type as any,
        category_id: newTransaction.category_id || null,
        chart_account_id: newTransaction.chart_account_id || null,
        date: newTransaction.date,
        due_date: newTransaction.due_date || null,
        payment_date: newTransaction.payment_date || null,
        status: newTransaction.status || 'pending',
        customer_id: newTransaction.type === 'income' && newTransaction.customer_id ? newTransaction.customer_id : null,
        supplier_id: newTransaction.type === 'expense' && newTransaction.supplier_id ? newTransaction.supplier_id : null,
        cashier_session_id: activeSession?.id || null
      };

      if (isEditTransactionMode && newTransaction.id) {
        const { error } = await supabase.from("financial_transactions").update(payload as any).eq("id", newTransaction.id);
        if (error) throw error;
        toast.success("Lançamento atualizado!");
      } else {
        const { error } = await supabase.from("financial_transactions").insert([payload as any]);
        if (error) throw error;
        toast.success("Lançamento realizado!");
      }

      setNewTransaction({ id: "", description: "", amount: "", type: "income", category_id: "", chart_account_id: "", date: todayDate, due_date: "", payment_date: "", status: "pending", customer_id: "", supplier_id: "" });
      setIsEditTransactionMode(false);
      setIsTransactionDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const fetchAddressByCep = async (cep: string, target: 'customer' | 'order') => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado.");
        return;
      }

      const updateAddress = () => {
        if (target === 'customer') {
          setNewCustomer(prev => ({
            ...prev,
            address: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
            zip_code: cleanCep
          }));
        } else {
          setNewDeliveryOrder(prev => ({
            ...prev,
            customer_address: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
            zip_code: cleanCep
          }));
        }
        toast.success("Endereço atualizado via CEP!");
      };

      // Se já houver endereço preenchido, pergunta antes de sobrescrever
      const currentAddress = target === 'customer' ? newCustomer.address : newDeliveryOrder.customer_address;
      
      if (currentAddress && currentAddress.trim() !== "") {
        if (true) {
          updateAddress();
        }
      } else {
        updateAddress();
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  const handleEditTransaction = (t: any) => {
    setNewTransaction({
      id: t.id,
      description: t.description,
      amount: t.amount,
      type: t.type,
      category_id: t.category_id,
      chart_account_id: (t as any).chart_account_id || "",
      date: t.date,
      due_date: (t as any).due_date || "",
      payment_date: (t as any).payment_date || "",
      status: (t as any).status || "pending",
      customer_id: t.customer_id || "",
      supplier_id: t.supplier_id || ""
    });
    
    if (t.status === 'paid') {
      setIsViewTransactionMode(true);
      setIsEditTransactionMode(false);
    } else {
      setIsViewTransactionMode(false);
      setIsEditTransactionMode(true);
    }
    setIsTransactionDialogOpen(true);
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      const today = todayDate;
      const { error } = await supabase.from("financial_transactions")
        .update({ 
          status: 'paid',
          payment_date: today
        })
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Baixa realizada com sucesso!");
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleOpenReceiveModal = (transaction: any) => {
    setReceivingTransaction(transaction);
    setReceiveData({
      payment_date: todayDate,
      payment_method_id: "",
      amount: transaction.amount
    });
    setIsReceiveDialogOpen(true);
  };

  const handleConfirmReceive = async () => {
    if (!receivingTransaction) return;
    if (!receiveData.payment_date) {
      toast.error("Informe a data de recebimento.");
      return;
    }

    try {
      const { error } = await supabase.from("financial_transactions")
        .update({ 
          status: 'paid',
          payment_date: receiveData.payment_date,
          amount: Number(receiveData.amount),
          // Se tivermos payment_method_id na tabela, poderíamos salvar aqui
          // Mas como não temos certeza se a coluna existe na tabela física,
          // vamos apenas salvar o status e a data por enquanto,
          // ou podemos salvar no campo de descrição/observação se necessário.
          // Vou assumir que o usuário quer apenas confirmar a baixa por enquanto
          // como solicitado "forma de receber a conta".
        })
        .eq("id", receivingTransaction.id);
      
      if (error) throw error;
      toast.success("Recebimento confirmado!");
      setIsReceiveDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handlePrintOpeningReport = (session: CashierSession) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const formato = (storeSettings?.print_paper_format === 'a4' ? 'a4' : 'thermal_80mm') as 'a4' | 'thermal_80mm';

    const notesLines = [
      `Operador: ${user?.full_name || 'Admin'}`,
      `Fundo de Caixa Inicial: R$ ${session.opening_balance.toFixed(2)}`,
      `Vendas: R$ 0,00`,
      `Entradas: R$ 0,00`,
      `Saídas: R$ 0,00`,
      session.notes ? `Obs: ${session.notes}` : '',
    ].filter(Boolean).join('\n');

    const html = gerarHtmlImpressao({
      titulo: 'COMPROVANTE DE ABERTURA',
      formato,
      content: {
        customer_name: storeSettings?.name || 'Sistema',
        waiter_name: user?.full_name || 'Admin',
        created_at: session.opened_at,
        total: session.opening_balance,
        notes: notesLines,
      },
      rodapePersonalizado: '"Um novo começo, novas oportunidades!" 🚀 Boas vendas e um excelente trabalho!',
    });

    printWindow.document.write(html);
    printWindow.document.close();
  };


  const handlePrintSessionReport = (session: CashierSession) => {
    const sessionIncomes = transactions.filter(t => t.cashier_session_id === session.id && t.type === 'income');
    const sessionExpenses = transactions.filter(t => t.cashier_session_id === session.id && t.type === 'expense');
    const sessionTrips = driverTrips.filter(t => t.cashier_session_id === session.id);

    const totalIncomes = sessionIncomes.reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = sessionExpenses.reduce((acc, t) => acc + t.amount, 0);
    const totalTrips = sessionTrips.reduce((acc, t) => acc + t.total_fee, 0);
    const finalBalance = session.closing_balance || (session.opening_balance + totalIncomes - totalExpenses - totalTrips);

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const isThermal = storeSettings?.print_paper_format !== 'a4';

    const incomeByMethod: Record<string, number> = {};
    sessionIncomes.forEach(t => {
      const match = t.description.match(/\((.*?)\)/);
      const method = match ? match[1] : 'Outros';
      incomeByMethod[method] = (incomeByMethod[method] || 0) + t.amount;
    });

    const brl = (n: number) => `R$ ${Number(n || 0).toFixed(2).replace('.', ',')}`;
    const esc = (s: any) => String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]!));
    const periodo = `${new Date(session.opened_at).toLocaleString('pt-BR')} → ${session.closed_at ? new Date(session.closed_at).toLocaleString('pt-BR') : 'Em aberto'}`;
    const empresa = storeSettings?.name || 'Sistema';
    const operador = user?.full_name || 'Admin';

    const row = (label: string, value: string, bold = false) =>
      `<tr><td style="padding:3px 0">${esc(label)}</td><td style="padding:3px 0;text-align:right;${bold ? 'font-weight:700' : ''}">${esc(value)}</td></tr>`;

    const section = (titulo: string, rows: string) => `
      <div class="sec">
        <div class="sec-title">${esc(titulo)}</div>
        <table style="width:100%;border-collapse:collapse;font-size:${isThermal ? '11px' : '12px'}">${rows || `<tr><td style="color:#888;padding:4px 0">Sem registros</td></tr>`}</table>
      </div>`;

    const pagamentosRows = Object.entries(incomeByMethod)
      .sort((a, b) => b[1] - a[1])
      .map(([m, v]) => row(m, brl(v))).join('');

    const entradasRows = sessionIncomes
      .map(t => row(t.description, brl(t.amount))).join('');

    const saidasRows = [
      ...sessionExpenses.map(t => row(t.description, `- ${brl(t.amount)}`)),
      ...sessionTrips.map(tr => row(`Entrega: ${tr.drivers?.name || 'Motoqueiro'}`, `- ${brl(tr.total_fee)}`)),
    ].join('');

    const width = isThermal ? '72mm' : '210mm';
    const pageCss = isThermal ? '@page { size: 80mm auto; margin: 0; }' : '@page { size: A4; margin: 15mm; }';
    const baseFont = isThermal ? '11px' : '13px';

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Relatório de Caixa</title>
<style>
  ${pageCss}
  * { box-sizing: border-box; }
  body { font-family: 'Courier New', monospace; font-size: ${baseFont}; color: #000; margin: 0 auto; padding: ${isThermal ? '4mm 3mm' : '0'}; width: ${width}; max-width: 100%; }
  .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 8px; }
  .header h1 { margin: 0; font-size: ${isThermal ? '14px' : '20px'}; letter-spacing: 1px; }
  .header .sub { font-size: ${isThermal ? '10px' : '12px'}; margin-top: 2px; }
  .meta { font-size: ${isThermal ? '10px' : '11px'}; margin-bottom: 10px; }
  .meta div { display: flex; justify-content: space-between; padding: 1px 0; }
  .totalbox { border: 1px dashed #000; padding: 6px 8px; margin: 8px 0; }
  .totalbox .row { display: flex; justify-content: space-between; padding: 2px 0; font-size: ${isThermal ? '11px' : '13px'}; }
  .totalbox .final { border-top: 1px solid #000; margin-top: 4px; padding-top: 4px; font-size: ${isThermal ? '13px' : '16px'}; font-weight: 700; }
  .sec { margin: 8px 0; }
  .sec-title { background: #000; color: #fff; padding: 3px 6px; font-size: ${isThermal ? '10px' : '11px'}; font-weight: 700; letter-spacing: 1px; }
  .footer { text-align: center; margin-top: 10px; padding-top: 6px; border-top: 1px dashed #888; font-size: ${isThermal ? '9px' : '10px'}; color: #555; }
  .footer a { color: #555; text-decoration: none; }
</style></head><body>
  <div class="header">
    <h1>RELATÓRIO DE CAIXA</h1>
    <div class="sub">${esc(empresa)}</div>
    <div class="sub">${new Date().toLocaleString('pt-BR')}</div>
  </div>

  <div class="meta">
    <div><span>Operador:</span><strong>${esc(operador)}</strong></div>
    <div><span>Período:</span><strong style="text-align:right">${esc(periodo)}</strong></div>
    <div><span>Status:</span><strong>${session.closed_at ? 'FECHADO' : 'ABERTO'}</strong></div>
  </div>

  <div class="totalbox">
    <div class="row"><span>Saldo Inicial</span><span>${brl(session.opening_balance)}</span></div>
    <div class="row"><span>(+) Entradas</span><span>${brl(totalIncomes)}</span></div>
    <div class="row"><span>(−) Saídas</span><span>${brl(totalExpenses + totalTrips)}</span></div>
    <div class="row final"><span>SALDO FINAL</span><span>${brl(finalBalance)}</span></div>
  </div>

  ${section('FORMAS DE PAGAMENTO', pagamentosRows)}
  ${section(`ENTRADAS (${sessionIncomes.length})`, entradasRows)}
  ${section(`SAÍDAS (${sessionExpenses.length + sessionTrips.length})`, saidasRows)}

  <div class="footer">
    Relatório gerado em ${new Date().toLocaleString('pt-BR')}<br/>
    <a href="https://www.meupedix.com.br" target="_blank">www.meupedix.com.br</a>
  </div>
  <script>window.onload=()=>{setTimeout(()=>window.print(),250)}</script>
</body></html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  };


  const handleShareSessionWhatsApp = (session: CashierSession) => {
    const sessionIncomes = transactions.filter(t => t.cashier_session_id === session.id && t.type === 'income');
    const sessionExpenses = transactions.filter(t => t.cashier_session_id === session.id && t.type === 'expense');
    const sessionTrips = driverTrips.filter(t => t.cashier_session_id === session.id);
    
    const totalIncomes = sessionIncomes.reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = sessionExpenses.reduce((acc, t) => acc + t.amount, 0);
    const totalTrips = sessionTrips.reduce((acc, t) => acc + t.total_fee, 0);
    const finalBalance = session.closing_balance || (session.opening_balance + totalIncomes - totalExpenses - totalTrips);

    let message = `📊 *RESUMO DE CAIXA - ${storeSettings?.name || 'Sistema'}*\n`;
    message += `📅 *Período:* ${new Date(session.opened_at).toLocaleString('pt-BR')} até ${session.closed_at ? new Date(session.closed_at).toLocaleString('pt-BR') : 'Aberto'}\n\n`;
    
    message += `💰 *Saldo Inicial:* R$ ${session.opening_balance.toFixed(2)}\n`;
    message += `📈 *Entradas:* R$ ${totalIncomes.toFixed(2)}\n`;
    message += `📉 *Saídas:* R$ ${(totalExpenses + totalTrips).toFixed(2)}\n`;
    message += `✅ *Saldo Final: R$ ${finalBalance.toFixed(2)}*\n\n`;
    
    const incomeByMethod: Record<string, number> = {};
    sessionIncomes.forEach(t => {
      const match = t.description.match(/\((.*?)\)/);
      const method = match ? match[1] : 'Outros';
      incomeByMethod[method] = (incomeByMethod[method] || 0) + t.amount;
    });

    message += `💳 *Resumo por Pagamento:*\n`;
    Object.entries(incomeByMethod).forEach(([method, total]) => {
      message += `• ${method}: R$ ${total.toFixed(2)}\n`;
    });
    message += `\n`;

    message += `🔹 *Entradas Principais:*\n`;
    sessionIncomes.slice(0, 5).forEach(t => {
      message += `• ${t.description}: R$ ${t.amount.toFixed(2)}\n`;
    });
    if (sessionIncomes.length > 5) message += `... e mais ${sessionIncomes.length - 5} lançamentos\n`;
    
    message += `\n🔸 *Saídas Principais:*\n`;
    sessionExpenses.slice(0, 5).forEach(t => {
      message += `• ${t.description}: - R$ ${t.amount.toFixed(2)}\n`;
    });
    if (sessionTrips.length > 0) message += `• Taxas Entregas: - R$ ${totalTrips.toFixed(2)}\n`;

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleDeleteTransaction = async (id: string) => {
    if (false) return;
    try {
      // Buscar a transação para ver se é de motoqueiro
      const { data: trans } = await supabase.from("financial_transactions").select("description").eq("id", id).single();
      
      if (!user?.can_delete) {
        toast.error("Você não tem permissão para excluir transações.");
        return;
      }
      const { error } = await supabase.from("financial_transactions").delete().eq("id", id);
      if (error) throw error;

      // Se for pagamento de motoqueiro, deletar a viagem correspondente
      if (trans && trans.description.includes("Pedido #")) {
        const orderPart = trans.description.split("Pedido #")[1];
        if (orderPart) {
          const orderIdPrefix = orderPart.slice(0, 8);
          await supabase.from("driver_trips")
            .delete()
            .ilike("notes", `%Pedido #${orderIdPrefix}%`);
        }
      } else if (trans && trans.description.includes("Lançamento Manual")) {
        await supabase.from("driver_trips")
          .delete()
          .eq("notes", "Lançamento manual de viagem")
          .limit(1);
      }
      
      toast.success("Lançamento removido!");
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handlePrintOrder = (order: DeliveryOrder) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const driverName = order.driver_id ? drivers.find(d => d.id === order.driver_id)?.name : 'Não selecionado';
    const itemsTotal = order.delivery_order_items?.reduce((acc: number, item: any) => acc + item.total_price, 0) || 0;
    
    // Calcular taxas
    const area = deliveryAreas.find(a => 
      (order.neighborhood && a.name && order.neighborhood.toLowerCase().includes(a.name.toLowerCase())) ||
      (order.customer_address && a.name && order.customer_address.toLowerCase().includes(a.name.toLowerCase()))
    );
    const driverFee = order.order_type === 'delivery' ? ((order as any).delivery_fee || (order.total_amount - itemsTotal)) : 0;
    const isFixedFee = false;
    const finalTotal = itemsTotal + driverFee;

    const formato = (storeSettings?.print_paper_format === 'a4' ? 'a4' : 'thermal_80mm') as 'a4' | 'thermal_80mm';

    const tipoLabel = order.order_type === 'delivery' ? 'ENTREGA'
      : order.order_type === 'pickup' ? 'RETIRADA'
      : order.order_type === 'dine_in' ? 'MESA' : 'BALCÃO';

    const notesLines: string[] = [];
    notesLines.push(`Tipo: ${tipoLabel}`);
    notesLines.push(`Telefone: ${order.customer_phone || ''}`);
    if (order.customer_address) notesLines.push(`Endereço: ${order.customer_address}`);
    notesLines.push(`Motoqueiro: ${driverName}`);
    notesLines.push('');
    notesLines.push(`Subtotal: R$ ${itemsTotal.toFixed(2)}`);
    if (driverFee > 0) notesLines.push(`Taxa Entrega${isFixedFee ? ' (Fixa)' : ''}: R$ ${driverFee.toFixed(2)}`);
    if (order.notes) notesLines.push(`Obs: ${order.notes}`);

    const items = (order.delivery_order_items || []).map((item: any) => ({
      name: item.product_name,
      quantity: item.quantity,
      price: item.total_price,
      notes: item.notes,
      complements: item.complements || item.delivery_order_item_complements || [],
    }));

    const html = gerarHtmlImpressao({
      titulo: `PEDIDO #${order.id.slice(0, 8)}`,
      formato,
      content: {
        order_number: order.id.slice(0, 8),
        customer_name: order.customer_name,
        created_at: order.created_at,
        total: finalTotal,
        notes: notesLines.join('\n'),
        items,
      },
      rodapePersonalizado: 'Obrigado pela preferência!',
    });

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleDeleteTrip = async (id: string) => {
    if (false) return;
    try {
      // Buscar a viagem para ter os dados da nota
      const { data: trip } = await supabase.from("driver_trips").select("*").eq("id", id).single();
      
      const { error } = await supabase.from("driver_trips").delete().eq("id", id);
      if (error) throw error;

      // Deletar o lançamento financeiro correspondente
      if (trip && trip.notes) {
        await supabase.from("financial_transactions")
          .delete()
          .ilike("description", `%${trip.notes}%`);
      }
      
      toast.success("Viagem e lançamento financeiro removidos!");
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };


  if (initialLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );

  return (
    <SidebarProvider>
      
      <div className="flex min-h-screen w-full bg-[#FDFCFB] dark:bg-background overflow-hidden">
        <AppSidebar activeTab={activeTab} setActiveTab={handleSetActiveTab} storeSettings={storeSettings} userProfile={user} />
        
        <SidebarInset className="flex flex-col flex-1 min-h-screen bg-transparent overflow-hidden">
          {/* Header Mobile & Trigger */}
          <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white/80 backdrop-blur-md px-4 sm:px-6 shadow-sm shrink-0">
            <SidebarTrigger className="text-orange-600 hover:bg-orange-50">
              <Menu className="h-6 w-6" />
            </SidebarTrigger>
            
            <div className="flex flex-1 items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center border border-orange-200 shadow-inner">
                  <User className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-2xl font-black tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-red-500 to-orange-500 drop-shadow-sm">
                      {storeSettings?.name || 'Meupedix'}
                    </span>
                    <Badge variant="outline" className="h-4 px-1 text-[8px] font-bold uppercase border-orange-200 text-orange-600 bg-orange-50/50">
                      PRO
                    </Badge>
                  </div>
                  <span className="text-[9px] text-gray-400 font-bold tracking-[0.15em] uppercase leading-none mt-1">
                    {user?.full_name || 'Gestor Logado'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                <HeaderClock />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    const nextStatus = !isMenuOpen;
                    // Toggle manual: desativa a gestão automática para não sobrescrever a escolha do usuário
                    setIsMenuOpen(nextStatus);
                    setStoreSettings((prev: any) => prev ? { ...prev, is_menu_active: nextStatus, auto_manage_menu: false } : prev);
                    if (storeSettings?.id) {
                      const { error } = await supabase
                        .from("store_settings")
                        .update({ is_menu_active: nextStatus, auto_manage_menu: false })
                        .eq("id", storeSettings.id);
                      if (error) {
                        toast.error("Erro ao atualizar status do cardápio");
                        setIsMenuOpen(!nextStatus);
                      } else {
                        toast.success(`Cardápio ${nextStatus ? 'aberto' : 'fechado'} com sucesso! (Gestão automática desativada)`);
                      }
                    }
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 h-9 rounded-full border transition-all shadow-sm",
                    isMenuOpen 
                      ? "bg-green-50 text-green-700 border-green-100 hover:bg-green-100" 
                      : "bg-red-50 text-red-700 border-red-100 hover:bg-red-100"
                  )}
                  title={isMenuOpen ? "Fechar Cardápio Digital" : "Abrir Cardápio Digital"}
                >
                  {isMenuOpen ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  <span className="hidden sm:inline text-[10px] font-black uppercase tracking-tighter">
                    {isMenuOpen ? "Cardápio Aberto" : "Cardápio Fechado"}
                  </span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const url = storeSettings?.digital_menu_url?.trim();
                    if (!url) {
                      toast.error("Cadastre o Link do Cardápio Digital em Gestão de Mesas → Configurações.");
                      return;
                    }
                    const finalUrl = url.startsWith("http") ? url : `https://${url}`;
                    window.open(finalUrl, "_blank", "noopener,noreferrer");
                  }}
                  className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-md hover:shadow-lg transition-all"
                  title="Testar Cardápio Digital (abrir link cadastrado)"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 h-9 rounded-full border border-orange-100 shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-black text-orange-700 uppercase tracking-tighter">
                    Online
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="h-9 w-9 rounded-full hover:bg-orange-50 dark:hover:bg-slate-800 text-orange-600 transition-colors"
                  title={theme === 'dark' ? "Modo Claro" : "Modo Escuro"}
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>


                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout} 
                  className="h-9 w-9 rounded-full hover:bg-red-50 text-red-600 transition-colors"
                  title="Sair"
                >
                  <LogOut className="h-5 w-5" /> 
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            <Tabs value={activeTab} onValueChange={handleSetActiveTab} className="space-y-6">
              <TabsList className="hidden" />

          <TabsContent value="dashboard" className="space-y-6 animate-in fade-in duration-500">
            {/* Bloco de Boas Vindas e Insights */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-card/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-[-20%] left-[-5%] w-48 h-48 bg-blue-400/20 rounded-full blur-2xl" />
              
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none mb-1">
                    {storeSettings?.name ? (
                      <span className="block text-blue-300 text-xs uppercase tracking-[0.3em] font-bold mb-2 animate-pulse">
                        Bem-vindo à {storeSettings.name}
                      </span>
                    ) : null}
                    Olá, {user?.full_name?.split(' ')[0] || 'Gestor'}! 🚀
                  </h1>
                  <p className="text-blue-100 font-medium max-w-md">Aqui está o pulso do seu negócio. {activeSession ? 'Nesta sessão' : 'Hoje'} o ticket médio está em <span className="font-black text-white underline decoration-blue-400 underline-offset-4">R$ {(() => {
                    let ordersToCalculate = [];
                    if (activeSession) {
                      ordersToCalculate = deliveryOrders.filter(o => o.cashier_session_id === activeSession.id && o.status !== 'cancelled');
                    } else {
                      const today = todayDate;
                      ordersToCalculate = deliveryOrders.filter(o => o.created_at.startsWith(today) && o.status !== 'cancelled');
                    }
                    if (ordersToCalculate.length === 0) return "0,00";
                    return (ordersToCalculate.reduce((acc, o) => acc + Number(o.total_amount), 0) / ordersToCalculate.length).toFixed(2);
                  })()}</span>.</p>
                </div>
                
                <div className="flex gap-4">
                  <div className="bg-card/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center min-w-[120px]">
                    <div className="text-[10px] font-black uppercase opacity-70 mb-1">Status Delivery</div>
                    <div className="text-2xl font-black">{deliveryOrders.filter(o => o.status === 'delivering').length}</div>
                    <div className="text-[9px] font-bold opacity-60">EM ROTA AGORA</div>
                  </div>
                  <div className="bg-card/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center min-w-[120px]">
                    <div className="text-[10px] font-black uppercase opacity-70 mb-1">Conversão</div>
                    <div className="text-2xl font-black">92%</div>
                    <div className="text-[9px] font-bold opacity-60">DA META DIÁRIA</div>
                  </div>
                </div>
              </div>
            </div>


            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-xl shadow-sm border">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">Filtro por Período</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-medium">Início:</Label>
                  <Input 
                    type="date" 
                    className="h-9 w-40" 
                    value={financeFilters.startDate || todayDate} 
                    onChange={e => setFinanceFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-medium">Fim:</Label>
                  <Input 
                    type="date" 
                    className="h-9 w-40" 
                    value={financeFilters.endDate || todayDate} 
                    onChange={e => setFinanceFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9"
                  onClick={() => setFinanceFilters({ 
                    startDate: todayDate, 
                    endDate: todayDate,
                    dueStartDate: "",
                    dueEndDate: "",
                    paymentStartDate: "",
                    paymentEndDate: "",
                    customerId: "all",
                    supplierId: "all",
                    search: ""
                  })}
                >
                  Hoje
                </Button>
                <Button
                  size="sm"
                  className="h-9 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={printDashboardReport}
                >
                  <FileText className="h-4 w-4 mr-1" /> Relatório
                </Button>

              </div>
            </div>

            {/* Dashboard Inteligente com Gráficos e KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 shadow-lg hover:shadow-xl transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <DollarSign className="h-16 w-16" />
                </div>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 relative z-10">
                  <CardTitle className="text-sm font-black uppercase tracking-wider text-green-700">Faturamento Bruto</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-black text-green-800 tracking-tighter">
                    R$ {dashboardStats?.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-[10px] text-green-600 font-bold mt-1 uppercase">Entradas confirmadas no período</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 shadow-lg hover:shadow-xl transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <ShoppingBag className="h-16 w-16" />
                </div>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 relative z-10">
                  <CardTitle className="text-sm font-black uppercase tracking-wider text-blue-700">Volume Pedidos</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-black text-blue-800 tracking-tighter">
                    {dashboardStats?.orderVolume}
                  </div>
                  <p className="text-[10px] text-blue-600 font-bold mt-1 uppercase">Total de pedidos efetuados</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20 shadow-lg hover:shadow-xl transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <TrendingUp className="h-16 w-16" />
                </div>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 relative z-10">
                  <CardTitle className="text-sm font-black uppercase tracking-wider text-orange-700">Ticket Médio</CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-black text-orange-800 tracking-tighter">
                    R$ {dashboardStats?.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-[10px] text-orange-600 font-bold mt-1 uppercase">Valor médio por venda</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20 shadow-lg hover:shadow-xl transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Clock3 className="h-16 w-16" />
                </div>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 relative z-10">
                  <CardTitle className="text-sm font-black uppercase tracking-wider text-purple-700">Em Aberto (Caixa)</CardTitle>
                  <Clock3 className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-black text-purple-800 tracking-tighter">
                    R$ {deliveryOrders
                      .filter(o => o.status === 'awaiting_reconciliation')
                      .reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0)
                      .toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-[10px] text-purple-600 font-bold mt-1 uppercase">Aguardando conciliação final</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 shadow-lg hover:shadow-xl transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <ArrowUpCircle className="h-16 w-16" />
                </div>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 relative z-10">
                  <CardTitle className="text-sm font-black uppercase tracking-wider text-emerald-700">Contas a Receber</CardTitle>
                  <ArrowUpCircle className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-black text-emerald-800 tracking-tighter">
                    R$ {transactions
                      .filter(t => {
                        const start = financeFilters.startDate || todayDate;
                        const end = financeFilters.endDate || todayDate;
                        return t.type === 'income' && (t as any).status !== 'paid' && t.date >= start && t.date <= end;
                      })
                      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0)
                      .toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-[10px] text-emerald-600 font-bold mt-1 uppercase">Total pendente de recebimento</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-rose-500/10 to-rose-500/5 border-rose-500/20 shadow-lg hover:shadow-xl transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <ArrowDownCircle className="h-16 w-16" />
                </div>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 relative z-10">
                  <CardTitle className="text-sm font-black uppercase tracking-wider text-rose-700">Contas a Pagar</CardTitle>
                  <ArrowDownCircle className="h-4 w-4 text-rose-600" />
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-black text-rose-800 tracking-tighter">
                    R$ {transactions
                      .filter(t => {
                        const start = financeFilters.startDate || todayDate;
                        const end = financeFilters.endDate || todayDate;
                        return t.type === 'expense' && (t as any).status !== 'paid' && t.date >= start && t.date <= end;
                      })
                      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0)
                      .toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-[10px] text-rose-600 font-bold mt-1 uppercase">Total pendente de pagamento</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20 shadow-lg hover:shadow-xl transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <DollarSign className="h-16 w-16" />
                </div>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 relative z-10">
                  <CardTitle className="text-sm font-black uppercase tracking-wider text-amber-700">Saldo Previsto</CardTitle>
                  <DollarSign className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-black text-amber-800 tracking-tighter">
                    R$ {(() => {
                      const start = financeFilters.startDate || todayDate;
                      const end = financeFilters.endDate || todayDate;
                      const periodTrans = transactions.filter(t => t.date >= start && t.date <= end);
                      const income = periodTrans.filter(t => t.type === 'income').reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
                      const expense = periodTrans.filter(t => t.type === 'expense').reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
                      return (income - expense).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    })()}
                  </div>
                  <p className="text-[10px] text-amber-600 font-bold mt-1 uppercase">Resultado líquido no período</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-orange-500/5 border-orange-500/10 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Timer className="h-4 w-4 text-orange-600" />
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Cozinha</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="text-3xl font-black text-orange-700 leading-none">
                      {deliveryOrders.filter(o => o.status === 'production').length}
                    </div>
                    <span className="text-[10px] font-bold text-orange-600 uppercase mb-1">Pedidos agora</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-500/5 border-blue-500/10 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Bike className="h-4 w-4 text-blue-600" />
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Em Rota</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="text-3xl font-black text-blue-700 leading-none">
                      {deliveryOrders.filter(o => o.status === 'delivering').length}
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase mb-1">Entregadores</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-500/5 border-green-500/10 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Finalizados</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="text-3xl font-black text-green-700 leading-none">
                      {deliveryOrders.filter(o => {
                        const orderDate = new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date(o.created_at));
                        return orderDate === todayDate && (o.status === 'delivered' || o.status === 'awaiting_reconciliation');
                      }).length}
                    </div>

                    <span className="text-[10px] font-bold text-green-600 uppercase mb-1">Hoje</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-red-500/5 border-red-500/10 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircleIcon className="h-4 w-4 text-red-600" />
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Cancelados</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="text-3xl font-black text-red-700 leading-none">
                      {deliveryOrders.filter(o => {
                        const orderDate = new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date(o.created_at));
                        return orderDate === todayDate && o.status === 'cancelled';
                      }).length}
                    </div>
                    <span className="text-[10px] font-bold text-red-600 uppercase mb-1">No período</span>
                  </div>
                </CardContent>
              </Card>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 shadow-xl border-none bg-card relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-black uppercase tracking-tight text-blue-900">
                      Curva de Faturamento Diário
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground">Desempenho financeiro dos últimos 7 dias</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100">
                    <TrendingUp className="h-3 w-3 text-blue-600" />
                    <span className="text-[10px] font-black text-blue-700 uppercase">+12% vs sem. ant.</span>
                  </div>
                </CardHeader>
                <CardContent className="h-[350px] pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={(() => {
                      const days = Array.from({ length: 7 }, (_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - (6 - i));
                        return new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Sao_Paulo' }).format(d);
                      });
                      return days.map(day => ({
                        name: day.split('-').reverse().slice(0, 2).join('/'),
                        total: deliveryOrders
                          .filter(o => {
                            const orderDate = new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date(o.created_at));
                            return orderDate === day && o.status !== 'cancelled';
                          })
                          .reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0)
                      }));
                    })()}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                      <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 600 }} />
                      <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 600 }} tickFormatter={(val) => `R$${val}`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                        formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Faturamento']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#2563eb" 
                        strokeWidth={4} 
                        dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} 
                        activeDot={{ r: 8, strokeWidth: 0 }} 
                        animationDuration={1500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-none bg-card relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-600" />
                <CardHeader>
                  <CardTitle className="text-lg font-black uppercase tracking-tight text-orange-900">
                    Ocupação do Sistema
                  </CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground">Distribuição de pedidos por horário</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px] pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={(() => {
                      const hours = [11, 12, 13, 18, 19, 20, 21, 22, 23];
                      const today = todayDate;
                      return hours.map(h => ({
                        hour: `${h}h`,
                        pedidos: deliveryOrders.filter(o => {
                          const oDate = new Date(o.created_at);
                          const orderDate = new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Sao_Paulo' }).format(oDate);
                          // Get hour in Brazil timezone
                          const brHour = parseInt(new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: 'numeric', hour12: false }).format(oDate));
                          return orderDate === today && brHour === h;
                        }).length
                      }));
                    })()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                      <XAxis dataKey="hour" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 600 }} />
                      <YAxis fontSize={10} axisLine={false} tickLine={false} hide />
                      <Tooltip cursor={{ fill: 'rgba(249, 115, 22, 0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                      <Bar 
                        dataKey="pedidos" 
                        fill="#f97316" 
                        radius={[6, 6, 0, 0]} 
                        animationDuration={1000}
                        label={{ position: 'top', fontSize: 10, fontWeight: 'bold', fill: '#f97316' }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg border-emerald-100 overflow-hidden group">
                <CardHeader className="bg-emerald-50/50 border-b transition-colors group-hover:bg-emerald-100/50">
                  <CardTitle className="text-sm font-black uppercase text-emerald-800 flex items-center gap-2 tracking-tighter">
                    <TrendingUpIcon className="h-4 w-4" /> Projeção de Recebimentos
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] pt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={(() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        const ranges = [
                          { label: 'À Vista', min: 0, max: 0 },
                          { label: '30 Dias', min: 1, max: 30 },
                          { label: '60 Dias', min: 31, max: 60 },
                          { label: '90 Dias', min: 61, max: 90 },
                          { label: '120 Dias', min: 91, max: 120 },
                          { label: '+120 Dias', min: 121, max: 9999 },
                        ];

                        return ranges.map(r => {
                          const value = transactions
                            .filter(t => t.type === 'income' && (t as any).status !== 'paid')
                            .filter(t => {
                              const dueDate = (t as any).due_date ? new Date((t as any).due_date + 'T12:00:00') : new Date(t.date + 'T12:00:00');
                              const diffTime = dueDate.getTime() - today.getTime();
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              
                              if (r.min === 0 && r.max === 0) return diffDays <= 0;
                              return diffDays >= r.min && diffDays <= r.max;
                            })
                            .reduce((acc, t) => acc + Number(t.amount), 0);
                          return { name: r.label, valor: value };
                        });
                      })()}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} tickFormatter={(v) => `R$${v}`} />
                      <Tooltip 
                        formatter={(value: any) => [`R$ ${value.toFixed(2)}`, 'Total']}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="valor" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-rose-100 overflow-hidden group">
                <CardHeader className="bg-rose-50/50 border-b transition-colors group-hover:bg-rose-100/50">
                  <CardTitle className="text-sm font-black uppercase text-rose-800 flex items-center gap-2 tracking-tighter">
                    <TrendingDown className="h-4 w-4" /> Projeção de Pagamentos
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] pt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={(() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        const ranges = [
                          { label: 'À Vista', min: 0, max: 0 },
                          { label: '30 Dias', min: 1, max: 30 },
                          { label: '60 Dias', min: 31, max: 60 },
                          { label: '90 Dias', min: 61, max: 90 },
                          { label: '120 Dias', min: 91, max: 120 },
                          { label: '+120 Dias', min: 121, max: 9999 },
                        ];

                        return ranges.map(r => {
                          const value = transactions
                            .filter(t => t.type === 'expense' && (t as any).status !== 'paid')
                            .filter(t => {
                              const dueDate = (t as any).due_date ? new Date((t as any).due_date + 'T12:00:00') : new Date(t.date + 'T12:00:00');
                              const diffTime = dueDate.getTime() - today.getTime();
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              
                              if (r.min === 0 && r.max === 0) return diffDays <= 0;
                              return diffDays >= r.min && diffDays <= r.max;
                            })
                            .reduce((acc, t) => acc + Number(t.amount), 0);
                          return { name: r.label, valor: value };
                        });
                      })()}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} tickFormatter={(v) => `R$${v}`} />
                      <Tooltip 
                        formatter={(value: any) => [`R$ ${value.toFixed(2)}`, 'Total']}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="valor" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="shadow-lg border-blue-100 overflow-hidden group">
                <CardHeader className="bg-blue-50/50 border-b transition-colors group-hover:bg-blue-100/50">
                  <CardTitle className="text-sm font-black uppercase text-blue-800 flex items-center gap-2 tracking-tighter">
                    <PieIcon className="h-4 w-4" /> Formas de Pagamento (Conciliados)
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] pt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={(() => {
                          const methods = ['dinheiro', 'pix', 'cartao_credito', 'cartao_debito', 'cheque', 'caderneta'];
                          const data = methods.map(m => ({
                            name: m === 'dinheiro' ? 'Dinheiro' : 
                                  m === 'pix' ? 'Pix' : 
                                  m === 'cartao_credito' ? 'Crédito' : 
                                  m === 'cartao_debito' ? 'Débito' : 
                                  m === 'cheque' ? 'Cheque' : 'Caderneta',
                            value: deliveryOrders
                              .filter(o => o.payment_method === m && o.status === 'delivered')
                              .reduce((acc, o) => acc + Number(o.total_amount), 0)
                          })).filter(d => d.value > 0);
                          return data.length > 0 ? data : [{ name: 'Sem dados', value: 1 }];
                        })()}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#f97316'].map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => typeof value === 'number' ? `R$ ${value.toFixed(2)}` : value} />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-orange-100 overflow-hidden group">
                <CardHeader className="bg-orange-50/50 border-b transition-colors group-hover:bg-orange-100/50">
                  <CardTitle className="text-sm font-black uppercase text-orange-800 flex items-center gap-2 tracking-tighter">
                    <Users className="h-4 w-4" /> Maiores Devedores (Caderneta)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {(() => {
                      const debtors: any = {};
                      deliveryOrders
                        .filter(o => o.is_on_account && o.status === 'delivered')
                        .forEach(o => {
                          debtors[o.customer_name] = (debtors[o.customer_name] || 0) + Number(o.total_amount);
                        });
                      
                      const topDebtors = Object.entries(debtors)
                        .map(([name, total]: [any, any]) => ({ name, total }))
                        .sort((a, b) => b.total - a.total)
                        .slice(0, 5);

                      if (topDebtors.length === 0) return <div className="text-center py-10 text-muted-foreground italic text-xs">Nenhum débito pendente.</div>;

                      return topDebtors.map((d, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 bg-orange-50 rounded-xl border border-orange-100 hover:bg-orange-100 transition-all hover:translate-x-1 cursor-default">
                          <div className="flex items-center gap-3 truncate">
                            <div className="h-7 w-7 rounded-full bg-orange-600 text-white flex items-center justify-center font-black text-[10px] shadow-sm">#{i+1}</div>
                            <span className="font-bold text-orange-900 truncate text-xs uppercase tracking-tight">{d.name}</span>
                          </div>
                          <span className="font-black text-orange-700 text-xs tabular-nums">R$ {d.total.toFixed(2)}</span>
                        </div>
                      ));
                    })()}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-primary/10 overflow-hidden group">
                <CardHeader className="bg-muted/30 border-b transition-colors group-hover:bg-muted/50">
                  <CardTitle className="text-sm font-black uppercase text-muted-foreground flex items-center gap-2 tracking-tighter">
                    <TrendingUp className="h-4 w-4" /> Performance de Vendas
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {(() => {
                      const itemCounts: Record<string, number> = {};
                      deliveryOrders.forEach(o => {
                        const start = financeFilters.startDate || todayDate;
                        const end = financeFilters.endDate || todayDate;
                        const orderDate = o.created_at.split('T')[0];
                        if (orderDate >= start && orderDate <= end && o.status !== 'cancelled') {
                          o.delivery_order_items?.forEach(item => {
                            itemCounts[item.product_name] = (itemCounts[item.product_name] || 0) + item.quantity;
                          });
                        }
                      });
                      const topProducts = Object.entries(itemCounts)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5);

                      if (topProducts.length === 0) return <div className="text-center py-10 text-muted-foreground italic text-xs">Sem vendas no período.</div>;

                      return topProducts.map(([name, count], i) => (
                        <div key={name} className="flex items-center justify-between p-2.5 bg-muted/20 rounded-xl border border-transparent hover:border-primary/20 transition-all hover:bg-card">
                          <div className="flex items-center gap-3 truncate">
                            <span className="text-[10px] font-black text-muted-foreground w-4">{i + 1}º</span>
                            <span className="text-xs font-bold text-gray-700 truncate uppercase tracking-tighter">{name}</span>
                          </div>
                          <Badge variant="secondary" className="text-[10px] font-black bg-card border shadow-sm">{count} UN</Badge>
                        </div>
                      ));
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>



          <TabsContent value="tables_quick_view" className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden mb-6">
              <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-2">Painel de Mesas 🍽️</h1>
                <p className="text-orange-100 font-medium max-w-md">Gerencie seus atendimentos presenciais com agilidade e precisão.</p>
              </div>
            </div>
            <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando...</div>}><TableDashboardOnly /></Suspense>
          </TabsContent>
          
          <TabsContent value="tables_module" className="space-y-6">
            <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando...</div>}><TableModule /></Suspense>
          </TabsContent>

          <TabsContent value="kitchen_dashboard" className="space-y-6">
            {storeSettings?.kds_enabled !== false ? (
              <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando...</div>}><KitchenDashboard /></Suspense>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-muted-foreground/20">
                <Utensils className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-bold text-muted-foreground">O KDS está desativado</h3>
                <p className="text-sm text-muted-foreground">Ative-o nas configurações da empresa para usar esta funcionalidade.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="waiters_module" className="space-y-6">
            <div className="bg-card p-6 rounded-3xl border shadow-xl">
              <WaiterManagement />
            </div>
          </TabsContent>
          
          <TabsContent value="delivery_module" className="animate-in fade-in duration-500">
            <div className="flex gap-4 items-start">
              <div className="flex-1 min-w-0 space-y-6">
            <div className="mb-6">
              <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando...</div>}><TableDashboardOnly /></Suspense>
            </div>
            
            
            
            
            <div className="bg-card p-4 rounded-xl shadow-sm border border-orange-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 mb-4">
                <div className="flex items-center justify-between w-full md:w-auto gap-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl sm:text-2xl font-bold text-orange-600 flex items-center gap-2">
                      <Truck className="h-6 w-6 sm:h-7 sm:w-7" /> Atendimento
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 bg-orange-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-orange-100">
                    {soundEnabled ? <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600" /> : <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />}
                    <span className="text-[10px] sm:text-xs font-medium text-orange-800">Som</span>
                    <Switch 
                      checked={soundEnabled} 
                      onCheckedChange={toggleSound}
                      className="data-[state=checked]:bg-orange-600 scale-75 sm:scale-100"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                      variant="outline"
                      className="border-blue-600 text-blue-700 hover:bg-blue-50 gap-1.5 sm:gap-2 font-bold h-9 sm:h-10 px-2 sm:px-6 active:scale-95 transition-all shadow-sm text-[10px] sm:text-sm"
                      onClick={() => handleSetActiveTab("history_module")}
                    >
                      <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> <span className="truncate">Relatório</span>
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-green-600 text-green-700 hover:bg-green-50 gap-1.5 sm:gap-2 font-bold h-9 sm:h-10 px-2 sm:px-6 active:scale-95 transition-all shadow-sm text-[10px] sm:text-sm"
                      onClick={() => handleSetActiveTab("cashier")}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> <span className="truncate">Ir p/ Caixa</span>
                    </Button>
                </div>
              <Dialog open={isOrderDialogOpen} onOpenChange={(open) => {
                if (!open) {
                  // Limpa os dados ao fechar o diálogo
                   setNewDeliveryOrder({
                    customer_name: "",
                    customer_phone: "",
                    customer_address: "",
                    address_number: "",
                    address_complement: "",
                    neighborhood: "",
                    city: "",
                    state: "",
                    zip_code: "",
                    person_type: "fisica",
                    cpf: "",
                    cnpj: "",
                    order_type: "counter" as "delivery" | "pickup" | "counter",
                    delivery_fee: 0,
                    notes: "",
                    observation: "",
                    items: [] as any[],
                    activeItem: null,
                    customer_id: undefined,
                    search_value: ""
                  } as any);
                }
                if (open && !activeSession) {
                  toast.error("Opa! O caixa está dormindo. 😴", {
                    description: "Abra o caixa primeiro para começar a lançar novos pedidos!"
                  });
                  return;
                }
                setIsOrderDialogOpen(open);
              }}>
                <div className="grid grid-cols-2 md:flex items-center gap-2 w-full md:w-auto">
                    <DialogTrigger asChild>
                    <Button className="bg-orange-600 hover:bg-orange-700 gap-1.5 sm:gap-2 font-bold shadow-lg h-9 sm:h-10 px-2 sm:px-6 active:scale-95 transition-all text-[10px] sm:text-sm">
                      <Plus className="h-4 w-4 sm:h-5 sm:w-5" /> <span className="truncate">Novo Pedido</span>
                    </Button>
                  </DialogTrigger>
                </div>
                <DialogContent 
                  className="max-w-7xl w-[98vw] md:w-[98vw] max-h-[95vh] md:max-h-[92vh] p-0 flex flex-col overflow-hidden"
                  onPointerDownOutside={(e) => {
                    const t = e.target as HTMLElement;
                    // Impede fechar ao clicar em toasts ou em outro Dialog/Popover sobreposto (ex: sugestões, complementos)
                    if (
                      t.closest('[data-sonner-toast]') ||
                      t.closest('.sonner-toast') ||
                      t.closest('[role="dialog"]') ||
                      t.closest('[role="alertdialog"]') ||
                      t.closest('[data-radix-popper-content-wrapper]')
                    ) {
                      e.preventDefault();
                    }
                  }}
                  onInteractOutside={(e) => {
                    const t = e.target as HTMLElement;
                    if (
                      t.closest('[data-sonner-toast]') ||
                      t.closest('.sonner-toast') ||
                      t.closest('[role="dialog"]') ||
                      t.closest('[role="alertdialog"]') ||
                      t.closest('[data-radix-popper-content-wrapper]')
                    ) {
                      e.preventDefault();
                    }
                  }}
                >
                  <DialogHeader className="shrink-0 px-3 md:px-6 pt-3 md:pt-6 pb-2">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="min-w-0">
                        <DialogTitle>Lançar Novo Pedido</DialogTitle>
                        <DialogDescription>Preencha os dados do cliente e selecione os itens.</DialogDescription>
                        <Dialog open={browseCustomerOpen} onOpenChange={setBrowseCustomerOpen}>
                          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2"><Search className="h-4 w-4" /> Buscar Cliente Cadastrado</DialogTitle>
                              <DialogDescription>Selecione um cliente para preencher os dados do pedido.</DialogDescription>
                            </DialogHeader>
                            <Input
                              autoFocus
                              placeholder="Buscar por nome, telefone, CPF/CNPJ ou bairro..."
                              value={browseCustomerSearch}
                              onChange={e => setBrowseCustomerSearch(e.target.value)}
                              className="h-9"
                            />
                            <div className="flex-1 overflow-y-auto border rounded-lg divide-y">
                              {customers
                                .filter(c => {
                                  const q = browseCustomerSearch.trim().toLowerCase();
                                  if (!q) return true;
                                  return (c.name || "").toLowerCase().includes(q)
                                    || (c.phone || "").toLowerCase().includes(q)
                                    || ((c as any).cpf || "").toLowerCase().includes(q)
                                    || ((c as any).cnpj || "").toLowerCase().includes(q)
                                    || ((c as any).neighborhood || "").toLowerCase().includes(q);
                                })
                                .slice(0, 200)
                                .map(c => (
                                  <button
                                    key={c.id}
                                    type="button"
                                    className="w-full text-left px-3 py-2 hover:bg-orange-50 flex items-center justify-between gap-3"
                                    onClick={() => {
                                      const selectedCustomer: any = {
                                        ...newDeliveryOrder,
                                        customer_name: c.name,
                                        customer_phone: c.phone || "",
                                        customer_address: (c as any).address || "",
                                        address_number: (c as any).address_number || "",
                                        address_complement: (c as any).address_complement || "",
                                        neighborhood: (c as any).neighborhood || "",
                                        city: (c as any).city || "",
                                        state: (c as any).state || "",
                                        zip_code: (c as any).zip_code || "",
                                        person_type: (c as any).person_type || "fisica",
                                        cpf: (c as any).cpf || "",
                                        cnpj: (c as any).cnpj || "",
                                        customer_id: c.id,
                                        search_value: c.phone || c.name,
                                      };
                                      setNewDeliveryOrder(selectedCustomer);
                                      if (selectedCustomer.order_type === 'delivery') handleCalcDeliveryFee(selectedCustomer);
                                      setBrowseCustomerOpen(false);
                                    }}
                                  >
                                    <div className="min-w-0">
                                      <div className="font-bold text-sm truncate">{c.name}</div>
                                      <div className="text-[11px] text-muted-foreground truncate">
                                        {c.phone || 'Sem telefone'}{(c as any).neighborhood ? ` · ${(c as any).neighborhood}` : ''}
                                      </div>
                                    </div>
                                    <Badge variant="outline" className="text-[9px]">Selecionar</Badge>
                                  </button>
                                ))}
                              {customers.length === 0 && (
                                <div className="p-6 text-center text-sm text-muted-foreground">Nenhum cliente cadastrado.</div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>



                      {/* Resumo do Cliente (alinhado à direita do título, sem fundo) */}
                      {(newDeliveryOrder.customer_name || newDeliveryOrder.customer_phone || newDeliveryOrder.customer_address) ? (
                        <div className="flex items-start gap-3 min-w-0 max-w-full md:max-w-[55%] pr-8">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center font-black text-base shadow-md shrink-0 ring-2 ring-emerald-200">
                            {(newDeliveryOrder.customer_name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap leading-tight">
                              <span className="font-black text-sm text-emerald-800 truncate">
                                {newDeliveryOrder.customer_name || 'Cliente'}
                              </span>
                              <button
                                type="button"
                                onClick={() => setClientFormExpanded(true)}
                                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-800 hover:underline"
                              >
                                <Pencil className="h-2.5 w-2.5" /> Editar
                              </button>
                            </div>
                            {newDeliveryOrder.customer_phone && (
                              <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full pl-2 pr-3 py-0.5 shadow-md shadow-emerald-200">
                                <div className="bg-white/20 rounded-full p-0.5">
                                  <Phone className="h-3 w-3" />
                                </div>
                                <span className="text-[13px] font-black tracking-wide">
                                  {newDeliveryOrder.customer_phone}
                                </span>
                              </div>
                            )}
                            {(newDeliveryOrder.customer_address || newDeliveryOrder.city) && (
                              <div className="flex items-start gap-1 text-[11px] text-emerald-600/90 leading-snug">
                                <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
                                <span className="truncate">
                                  {newDeliveryOrder.customer_address}
                                  {(newDeliveryOrder as any).address_number ? `, ${(newDeliveryOrder as any).address_number}` : ""}
                                  {(newDeliveryOrder as any).neighborhood ? ` · ${(newDeliveryOrder as any).neighborhood}` : ""}
                                  {newDeliveryOrder.city ? ` · ${newDeliveryOrder.city}${newDeliveryOrder.state ? `/${newDeliveryOrder.state}` : ""}` : ""}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setClientFormExpanded(true)}
                          className="text-[11px] font-bold uppercase tracking-wider text-orange-600 hover:text-orange-700 inline-flex items-center gap-1 pr-8"
                        >
                          <Plus className="h-3.5 w-3.5" /> Selecionar Cliente
                        </button>
                      )}
                    </div>
                  </DialogHeader>

                  <div className="flex-1 overflow-y-auto px-3 md:px-4">
                  <div className="flex flex-col md:flex-row gap-4 py-2 md:py-4 h-full">

                    {/* Coluna 1: Dados do Cliente (Esquerda - 20-25%) */}
                    <div className="w-full md:w-[22%] shrink-0 space-y-4 min-w-0">
                      <div className="bg-muted/30 p-4 rounded-lg space-y-4">
                        <div className="flex items-center justify-between text-primary font-bold mb-2">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" /> Dados do Cliente
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 text-[10px] gap-1 text-orange-600 border-orange-200"
                              onClick={() => {
                                 setNewDeliveryOrder({
                                  customer_name: "",
                                  customer_phone: "",
                                  customer_address: "",
                                  address_number: "",
                                  address_complement: "",
                                  neighborhood: "",
                                  city: storeSettings?.city || "",
                                  state: "SP",
                                  zip_code: "",
                                  person_type: "fisica",
                                  cpf: "",
                                  cnpj: "",
                                  order_type: "counter",
                                  delivery_fee: 0,
                                  notes: "",
                                  observation: "",
                                  items: [],
                                  activeItem: null,
                                  customer_id: undefined,
                                  search_value: ""
                                } as any);
                                toast.info("Formulário limpo!");
                              }}
                            >
                            <RotateCcw className="h-3 w-3" /> LIMPAR
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2 relative">
                          <Label className="text-xs">Buscar ou Iniciar Novo Cadastro</Label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Input 
                                placeholder="Buscar por Telefone ou Nome..." 
                                autoFocus
                                className="h-9 border-orange-100 focus-visible:ring-orange-500 bg-orange-50/30 pr-9"
                                value={(newDeliveryOrder as any).search_value || ""}
                                onChange={e => {
                                  const val = e.target.value;
                                  // Se o valor for puramente numérico ou começar com número, prioriza telefone
                                  if (/^\d/.test(val)) {
                                    setNewDeliveryOrder(prev => ({...prev, customer_phone: val, customer_name: "", search_value: val, customer_id: undefined} as any));
                                  } else {
                                    setNewDeliveryOrder(prev => ({...prev, customer_name: val, customer_phone: "", search_value: val, customer_id: undefined} as any));
                                  }
                                }} 
                              />
                              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              className="h-9 px-3 bg-orange-600 hover:bg-orange-700 text-white gap-1 shrink-0 font-bold shadow-md shadow-orange-200"
                              title="Cadastrar novo cliente"
                              onClick={() => {
                                setNewDeliveryOrder(prev => ({
                                  ...prev,
                                  customer_name: "",
                                  customer_phone: "",
                                  customer_address: "",
                                  address_number: "",
                                  address_complement: "",
                                  neighborhood: "",
                                  city: storeSettings?.city || "",
                                  state: storeSettings?.state || "SP",
                                  zip_code: "",
                                  person_type: "fisica",
                                  cpf: "",
                                  cnpj: "",
                                  customer_id: undefined,
                                  search_value: "",
                                } as any));
                                setClientFormExpanded(true);
                              }}
                            >
                              <Plus className="h-4 w-4" /> NOVO
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-9 w-9 p-0 shrink-0 border-orange-300 hover:bg-orange-50"
                              title="Listar clientes cadastrados"
                              onClick={() => { setBrowseCustomerSearch(""); setBrowseCustomerOpen(true); }}
                            >
                              <Search className="h-4 w-4 text-orange-600" />
                            </Button>
                          </div>
                          
                          {/* Resultados da busca */}
                          {(newDeliveryOrder as any).search_value && (newDeliveryOrder as any).search_value.length >= 2 && 
                            !(newDeliveryOrder as any).customer_id && (
                            <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-xl max-h-60 overflow-y-auto ring-1 ring-black ring-opacity-5">
                              {customers
                                .filter(c => {
                                  const searchVal = ((newDeliveryOrder as any).search_value || "").toLowerCase();
                                  const numericSearch = searchVal.replace(/\D/g, '');
                                  const custPhone = c.phone ? c.phone.replace(/\D/g, '') : '';
                                  const custName = c.name.toLowerCase();
                                  
                                  // Prioridade 1: Match exato ou parcial no telefone
                                  if (numericSearch && custPhone.includes(numericSearch)) return true;
                                  // Prioridade 2: Match no nome
                                  if (custName.includes(searchVal)) return true;
                                  
                                  return false;
                                })
                                .sort((a, b) => {
                                  const searchVal = ((newDeliveryOrder as any).search_value || "").toLowerCase();
                                  const numericSearch = searchVal.replace(/\D/g, '');
                                  
                                  // Se estiver pesquisando número, prioriza quem tem o telefone começando com esse número
                                  if (numericSearch) {
                                    const aPhone = (a.phone || '').replace(/\D/g, '');
                                    const bPhone = (b.phone || '').replace(/\D/g, '');
                                    if (aPhone.startsWith(numericSearch) && !bPhone.startsWith(numericSearch)) return -1;
                                    if (!aPhone.startsWith(numericSearch) && bPhone.startsWith(numericSearch)) return 1;
                                  }
                                  
                                  return a.name.localeCompare(b.name);
                                })
                                .map(c => (
                                  <div 
                                    key={c.id} 
                                    className="px-4 py-3 hover:bg-orange-50 cursor-pointer flex justify-between items-center border-b last:border-0 transition-colors"
                                    onClick={async () => {
                                      const selectedCustomer = {
                                        ...newDeliveryOrder,
                                        customer_name: c.name,
                                        customer_phone: c.phone || "",
                                        customer_address: (c as any).address || "",
                                        address_number: (c as any).address_number || "",
                                        address_complement: (c as any).address_complement || "",
                                        neighborhood: (c as any).neighborhood || "",
                                        city: (c as any).city || "",
                                        state: (c as any).state || "",
                                        zip_code: (c as any).zip_code || "",
                                        person_type: (c as any).person_type || "fisica",
                                        cpf: (c as any).cpf || "",
                                        cnpj: (c as any).cnpj || "",
                                        customer_id: c.id,
                                        search_value: c.phone || c.name
                                      };
                                      setNewDeliveryOrder(selectedCustomer as any);

                                      // Auto-calculate delivery fee if customer has address
                                      if (selectedCustomer.order_type === 'delivery') {
                                        handleCalcDeliveryFee(selectedCustomer);
                                      }
                                    }}
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-bold text-orange-900">{c.name}</span>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <Badge variant="outline" className="text-[9px] h-4 px-1 bg-card">
                                          {c.phone || 'Sem telefone'}
                                        </Badge>
                                        {(c as any).neighborhood && (
                                          <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                                            • {(c as any).neighborhood}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="bg-orange-100 p-1 rounded-full">
                                      <Plus className="h-4 w-4 text-orange-600" />
                                    </div>
                                  </div>
                                ))
                              }
                            </div>
                          )}
                        </div>


                        <Dialog open={clientFormExpanded} onOpenChange={setClientFormExpanded}>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 text-orange-600">
                                <Users className="h-5 w-5" /> Cadastro / Edição de Cliente
                              </DialogTitle>
                              <DialogDescription>Preencha os dados do cliente. Os campos serão salvos junto ao pedido.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs">Nome</Label>
                            <Input 
                              className="h-8"
                              placeholder="Nome do cliente" 
                              value={newDeliveryOrder.customer_name} 
                              onChange={e => setNewDeliveryOrder({...newDeliveryOrder, customer_name: e.target.value})} 
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Telefone</Label>
                            <Input 
                              className="h-8"
                              placeholder="(00) 00000-0000" 
                              value={newDeliveryOrder.customer_phone} 
                              onChange={e => setNewDeliveryOrder({...newDeliveryOrder, customer_phone: e.target.value})} 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs">Tipo Pessoa</Label>
                            <Select 
                              value={(newDeliveryOrder as any).person_type || "fisica"} 
                              onValueChange={(v) => setNewDeliveryOrder({...newDeliveryOrder, person_type: v} as any)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fisica">Física</SelectItem>
                                <SelectItem value="juridica">Jurídica</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">{((newDeliveryOrder as any).person_type || "fisica") === 'fisica' ? 'CPF' : 'CNPJ'}</Label>
                            <Input 
                              className="h-8" 
                              placeholder={((newDeliveryOrder as any).person_type || "fisica") === 'fisica' ? "000.000.000-00" : "00.000.000/0000-00"} 
                              value={((newDeliveryOrder as any).person_type || "fisica") === 'fisica' ? (newDeliveryOrder as any).cpf || "" : (newDeliveryOrder as any).cnpj || ""} 
                              onChange={e => {
                                const val = e.target.value.replace(/\D/g, '');
                                if (((newDeliveryOrder as any).person_type || "fisica") === 'fisica') {
                                  const limited = val.slice(0, 11);
                                  let formatted = limited;
                                  if (limited.length > 3) formatted = limited.slice(0, 3) + '.' + limited.slice(3);
                                  if (limited.length > 6) formatted = formatted.slice(0, 7) + '.' + formatted.slice(7);
                                  if (limited.length > 9) formatted = formatted.slice(0, 11) + '-' + formatted.slice(11);
                                  setNewDeliveryOrder({...newDeliveryOrder, cpf: formatted} as any);
                                } else {
                                  const limited = val.slice(0, 14);
                                  let formatted = limited;
                                  if (limited.length > 2) formatted = limited.slice(0, 2) + '.' + limited.slice(2);
                                  if (limited.length > 5) formatted = formatted.slice(0, 6) + '.' + formatted.slice(6);
                                  if (limited.length > 8) formatted = formatted.slice(0, 10) + '/' + formatted.slice(10);
                                  if (limited.length > 12) formatted = formatted.slice(0, 15) + '-' + formatted.slice(15);
                                  setNewDeliveryOrder({...newDeliveryOrder, cnpj: formatted} as any);
                                }
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Endereço</Label>
                          <Input className="h-8" placeholder="Rua, Avenida, etc." value={newDeliveryOrder.customer_address} onChange={e => {
                            const isFixedFee = storeSettings?.fixed_delivery_fee !== null && storeSettings?.fixed_delivery_fee !== undefined && Number(storeSettings.fixed_delivery_fee) >= 0;
                            setNewDeliveryOrder({...newDeliveryOrder, customer_address: e.target.value, delivery_fee: isFixedFee ? Number(storeSettings.fixed_delivery_fee) : 0});
                          }} />
                        </div>

                        <div className="grid grid-cols-12 gap-2 bg-blue-50/30 p-2 rounded-lg border border-blue-100">
                          <div className="col-span-3 space-y-1">
                            <Label className="text-xs font-bold text-blue-700">CEP (Pesquisar)</Label>
                            <Input 
                              className="h-8 border-blue-200 focus-visible:ring-blue-500 bg-card" 
                              placeholder="00000-000" 
                              value={newDeliveryOrder.zip_code} 
                                onChange={async (e) => {
                                  const cep = e.target.value.replace(/\D/g, '');
                                  setNewDeliveryOrder(prev => {
                                    const isFixedFee = storeSettings?.fixed_delivery_fee !== null && storeSettings?.fixed_delivery_fee !== undefined && Number(storeSettings.fixed_delivery_fee) >= 0;
                                    return {...prev, zip_code: e.target.value, delivery_fee: prev.order_type === 'delivery' && isFixedFee ? Number(storeSettings.fixed_delivery_fee) : 0};
                                  });
                                  if (cep.length === 8) {
                                    fetchAddressByCep(cep, 'order');
                                  }
                              }} 
                            />
                          </div>
                          <div className="col-span-3 space-y-1">
                            <Label className="text-xs">Número</Label>
                            <Input className="h-8" placeholder="123" value={(newDeliveryOrder as any).address_number} onChange={e => setNewDeliveryOrder({...newDeliveryOrder, address_number: e.target.value} as any)} />
                          </div>
                          <div className="col-span-4 space-y-1">
                            <Label className="text-xs">Cidade</Label>
                            <Input className="h-8" placeholder="Sua Cidade" value={newDeliveryOrder.city} onChange={e => setNewDeliveryOrder({...newDeliveryOrder, city: e.target.value})} />
                          </div>
                          <div className="col-span-2 space-y-1">
                            <Label className="text-xs">UF</Label>
                            <Input className="h-8" placeholder="SP" maxLength={2} value={newDeliveryOrder.state} onChange={e => setNewDeliveryOrder({...newDeliveryOrder, state: e.target.value.toUpperCase()})} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Bairro / Localidade</Label>
                            <Input 
                              className="h-8" 
                              placeholder="Bairro" 
                              value={(newDeliveryOrder as any).neighborhood || ""} 
                              onChange={e => {
                                const isFixedFee = storeSettings?.fixed_delivery_fee !== null && storeSettings?.fixed_delivery_fee !== undefined && Number(storeSettings.fixed_delivery_fee) >= 0;
                                setNewDeliveryOrder({...newDeliveryOrder, neighborhood: e.target.value, delivery_fee: isFixedFee ? Number(storeSettings.fixed_delivery_fee) : 0} as any);
                              }} 
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Complemento</Label>
                            <Input className="h-8" placeholder="Ap, Bloco..." value={(newDeliveryOrder as any).address_complement} onChange={e => setNewDeliveryOrder({...newDeliveryOrder, address_complement: e.target.value} as any)} />
                          </div>
                        </div>

                            <DialogFooter className="pt-2 gap-2">
                              <Button variant="outline" onClick={() => setClientFormExpanded(false)}>Cancelar</Button>
                              <Button
                                className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
                                onClick={async () => {
                                  const nd: any = newDeliveryOrder;
                                  if (!nd.customer_name?.trim()) {
                                    toast.error("Informe o nome do cliente");
                                    return;
                                  }
                                  const payload: any = {
                                    name: nd.customer_name,
                                    phone: nd.customer_phone || null,
                                    address: nd.customer_address || null,
                                    address_number: nd.address_number || null,
                                    address_complement: nd.address_complement || null,
                                    neighborhood: nd.neighborhood || null,
                                    city: nd.city || null,
                                    state: nd.state || null,
                                    zip_code: nd.zip_code || null,
                                    person_type: nd.person_type || 'fisica',
                                    cpf: nd.cpf || null,
                                    cnpj: nd.cnpj || null,
                                  };
                                  try {
                                    if (nd.customer_id) {
                                      const { error } = await supabase.from("customers").update(payload).eq("id", nd.customer_id);
                                      if (error) throw error;
                                      toast.success("Cliente atualizado!");
                                    } else {
                                      const { data, error } = await supabase.from("customers").insert(payload).select().single();
                                      if (error) throw error;
                                      setNewDeliveryOrder({ ...newDeliveryOrder, customer_id: data.id } as any);
                                      toast.success("Cliente gravado!");
                                    }
                                    const { data: custs } = await supabase.from("customers").select("*").order("name");
                                    if (custs) setCustomers(custs as any);
                                    setClientFormExpanded(false);
                                  } catch (err: any) {
                                    toast.error("Erro ao gravar: " + (err.message || err));
                                  }
                                }}
                              >
                                Gravar
                              </Button>
                            </DialogFooter>
                          </div>
                          </DialogContent>
                        </Dialog>


                        {/* Linha compacta sempre visível: Campos empilhados verticalmente */}
                        <div className="flex flex-col gap-3 pt-1">
                          {/* Botão "CALCULAR TAXA / GPS" removido — a taxa vem do cadastro da empresa. */}

                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Tipo Pedido</Label>
                            <Select value={newDeliveryOrder.order_type} onValueChange={(v: any) => {
                              const isFixedFee = storeSettings?.fixed_delivery_fee !== null && storeSettings?.fixed_delivery_fee !== undefined && Number(storeSettings.fixed_delivery_fee) >= 0;
                              setNewDeliveryOrder({
                                ...newDeliveryOrder,
                                order_type: v,
                                delivery_fee: v === 'delivery' && isFixedFee ? Number(storeSettings.fixed_delivery_fee) : 0
                              });
                            }}>
                              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="delivery">Entrega</SelectItem>
                                <SelectItem value="pickup">Retirada</SelectItem>
                                <SelectItem value="counter">Balcão</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Taxa (R$)</Label>
                            <Input
                              className="h-9 border-orange-200"
                              type="number"
                              disabled={newDeliveryOrder.order_type === 'counter'}
                              value={newDeliveryOrder.order_type === 'counter' ? 0 : (newDeliveryOrder.delivery_fee || 0)}
                              onChange={e => setNewDeliveryOrder({...newDeliveryOrder, delivery_fee: parseFloat(e.target.value) || 0})}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Obs Interna</Label>
                            <Input className="h-9" placeholder="Troco, ponto de ref..." value={newDeliveryOrder.notes} onChange={e => setNewDeliveryOrder({...newDeliveryOrder, notes: e.target.value})} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-blue-600">Observação Cliente</Label>
                            <Input className="h-9 border-blue-100" placeholder="Ex: Sem cebola..." value={newDeliveryOrder.observation || ""} onChange={e => setNewDeliveryOrder({...newDeliveryOrder, observation: e.target.value})} />
                          </div>
                          <div className="space-y-1 sm:col-span-2">
                            <div className="flex items-center gap-2 rounded-lg border border-dashed border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/30 px-3 py-2">
                              <div className="bg-emerald-500 text-white rounded-full p-1">
                                <Package className="h-3 w-3" />
                              </div>
                              <div className="flex-1">
                                <p className="text-[9px] font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-wide">Frete</p>
                                <p className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200 leading-tight">Por conta do emitente 🚚</p>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>

                    {/* Coluna 2: Itens do Pedido (Centro - 50-55%) */}
                    <div className="flex-1 space-y-4 min-w-0 md:h-[calc(90vh-200px)] overflow-hidden">
                      {/* Card de Seleção de Produtos */}
                      <div className="border-2 border-orange-100 rounded-xl bg-gradient-to-br from-orange-50/30 via-card to-card shadow-sm p-4 flex flex-col gap-3 h-full overflow-hidden">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-orange-600 font-black uppercase text-sm tracking-wide">
                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-1.5 rounded-lg shadow-sm shadow-orange-200">
                              <Package className="h-3.5 w-3.5 text-white" />
                            </div>
                            Itens do Pedido
                          </div>
                          <span className="text-[10px] text-muted-foreground font-medium">Escolha produtos</span>
                        </div>


                        <Tabs value={(orderProductCategory === '__pizzas__' || (orderPizzaCategory && categories.find(c => c.id === orderProductCategory)?.name.toLowerCase().includes('sabor'))) ? 'pizzas' : 'products'} onValueChange={() => {}} className="w-full flex-1">
                          <TabsList className="hidden">
                            <TabsTrigger value="products">Geral</TabsTrigger>
                            <TabsTrigger value="pizzas">Pizzas (Sabores)</TabsTrigger>
                          </TabsList>

                          {/* Barra de Categoria unificada (substitui as abas Geral/Pizzas) */}
                          <div className="bg-gradient-to-br from-muted/40 to-muted/10 p-3 rounded-xl space-y-3 border shadow-sm mb-4">
                            <div className="relative">
                              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <input
                                placeholder="Buscar por nome do produto..."
                                className="w-full bg-card border border-input h-10 pl-10 pr-4 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                value={orderProductSearch}
                                onChange={(e) => setOrderProductSearch(e.target.value)}
                              />
                            </div>

                            {(() => {
                              const visibleCats = categories;
                              const countFor = (catId: string) => products.filter(p =>
                                p.active !== false &&
                                (catId === 'all' || p.category_id === catId)
                              ).length;
                              const totalCount = countFor('all');
                              const isPizzas = orderProductCategory === '__pizzas__';
                              return (
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between px-1">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Categoria</Label>
                                    <span className="text-[10px] text-muted-foreground">{visibleCats.length} categorias · {totalCount} itens</span>
                                  </div>
                                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-40 overflow-y-auto pr-1 pt-1 scrollbar-hide">
                                    <button
                                      type="button"
                                      className={`h-9 px-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all border flex items-center justify-center gap-1 shadow-sm ${!isPizzas && orderProductCategory === "all" ? "bg-orange-600 text-white border-orange-600 ring-2 ring-orange-500/20" : "bg-card text-muted-foreground border-border hover:border-orange-300 hover:text-orange-600"}`}
                                      onClick={() => { setOrderProductCategory("all"); setOrderProductSearch(""); }}
                                    >
                                      Todas
                                      <span className={`text-[8px] px-1 py-0.5 rounded font-black ${!isPizzas && orderProductCategory === "all" ? "bg-white/25" : "bg-muted"}`}>{totalCount}</span>
                                    </button>
                                    {visibleCats.map(cat => {
                                      const n = countFor(cat.id);
                                      if (n === 0) return null;
                                      const active = !isPizzas && orderProductCategory === cat.id;
                                      return (
                                        <button
                                          type="button"
                                          key={cat.id}
                                          className={`h-9 px-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all border flex items-center justify-center gap-1 shadow-sm ${active ? "bg-orange-600 text-white border-orange-600 ring-2 ring-orange-500/20" : "bg-card text-muted-foreground border-border hover:border-orange-300 hover:text-orange-600"}`}
                                          onClick={() => { setOrderProductCategory(cat.id); setOrderProductSearch(""); }}
                                          title={cat.name}
                                        >
                                          <span className="truncate">{cat.name}</span>
                                          <span className={`text-[8px] px-1 py-0.5 rounded font-black shrink-0 ${active ? "bg-white/25" : "bg-muted"}`}>{n}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                          <Suspense fallback={null}>
                            <OrderProductsGrid ctx={{
                              products,
                              orderProductSearch,
                              orderProductCategory,
                              newDeliveryOrder,
                              setNewDeliveryOrder,
                              complementGroups,
                              productComplementGroups,
                              categoryComplementGroups,
                              setIsOrderComplementDialogOpen,
                              isBeverageProduct,
                              setSuggestionDialog,
                            }} />
                          </Suspense>

                          <TabsContent value="pizzas" className="space-y-4 mt-4">
                            <div className="bg-orange-50 p-3 rounded-md border border-orange-100">
                              <div className="flex items-center justify-between mb-2">
                                <Label className="text-orange-700 font-bold text-xs block">Montar Pizza</Label>
                                <div className="flex items-center gap-2">
                                  <Label className="text-[10px] text-muted-foreground">Dividir em 2?</Label>
                                  <Select 
                                    value={newDeliveryOrder.activeItem?.flavorCount || "1"} 
                                    onValueChange={(count) => {
                                      setNewDeliveryOrder({
                                        ...newDeliveryOrder,
                                        activeItem: { 
                                          ...(newDeliveryOrder.activeItem || {}), 
                                          flavorCount: count,
                                          flavors: count === "1" ? (newDeliveryOrder.activeItem?.flavors || []).slice(0, 1) : (newDeliveryOrder.activeItem?.flavors || [])
                                        }
                                      });
                                    }}
                                  >
                                    <SelectTrigger className="h-6 w-24 text-[10px]"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="1">Inteira</SelectItem>
                                      <SelectItem value="2">2 Sabores</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="space-y-3 mb-4 bg-card/50 p-3 rounded-xl border border-orange-100 shadow-sm">
                                <div className="flex flex-wrap gap-2">
                                  {categories.filter(cat => 
                                    cat.name.toLowerCase().includes('sabor') || 
                                    cat.name.toLowerCase().includes('pizza') ||
                                    products.some(p => p.category_id === cat.id && p.is_pizza_flavor)
                                  ).map((cat, index, filteredCats) => {
                                    // Set default category if not set or if "all" was selected
                                    if ((orderPizzaCategory === "all" || !orderPizzaCategory) && index === 0) {
                                      setOrderPizzaCategory(cat.id);
                                    }
                                    
                                    return (
                                      <button 
                                        key={cat.id}
                                        className={`h-8 px-4 rounded-full text-[11px] font-semibold transition-all border shadow-sm ${orderPizzaCategory === cat.id ? "bg-orange-600 text-white border-orange-600 shadow-orange-100" : "bg-card text-orange-600 border-orange-200 hover:bg-orange-50"}`}
                                        onClick={() => {
                                          // Validar se pode trocar de categoria se já houver um sabor selecionado
                                          const activeFlavors = newDeliveryOrder.activeItem?.flavors || [];
                                          if (activeFlavors.length > 0) {
                                            const firstFlavor = activeFlavors[0];
                                            if (firstFlavor.category_id !== cat.id) {
                                              toast.error("Não é possível misturar categorias diferentes (ex: Salgada com Doce ou tamanhos diferentes)");
                                              return;
                                            }
                                          }
                                          setOrderPizzaCategory(cat.id);
                                        }}
                                      >
                                        {cat.name}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar border rounded p-3 bg-card mb-2">
                                 {products
                                   .filter(p => (newDeliveryOrder.order_type === 'delivery' ? p.sell_delivery !== false : p.sell_dine_in !== false) && p.active !== false)
                                   .filter(p => p.is_pizza_flavor || p.category_id === 'pizzas' || categories.find(c => c.id === p.category_id)?.name.toLowerCase().includes('sabor') || categories.find(c => c.id === p.category_id)?.name.toLowerCase().includes('pizza'))
                                  .filter(p => p.category_id === orderPizzaCategory)
                                  .map(p => {
                                    const flavors = newDeliveryOrder.activeItem?.flavors || [];
                                    const isSelected = flavors.find((f: any) => f.id === p.id);
                                    const flavorCountLimit = parseInt(newDeliveryOrder.activeItem?.flavorCount || "1");
                                    const isDisabled = !isSelected && flavors.length >= flavorCountLimit;

                                    return (
                                      <Button 
                                        key={p.id} 
                                        variant={isSelected ? "default" : "outline"} 
                                        className={`h-auto min-h-12 py-2 text-[10px] px-2 flex flex-col items-center justify-center leading-tight transition-all ${isSelected ? "bg-orange-600 hover:bg-orange-700 shadow-md scale-95" : "hover:border-orange-500 hover:bg-orange-50"}`}
                                        disabled={isDisabled}
                                        onClick={() => {
                                          const currentFlavors = [...flavors];
                                          if (isSelected) {
                                            const newFlavors = currentFlavors.filter(f => f.id !== p.id);
                                            setNewDeliveryOrder({
                                              ...newDeliveryOrder,
                                              activeItem: { ...newDeliveryOrder.activeItem, flavors: newFlavors }
                                            });
                                          } else {
                                            const newFlavor = { 
                                              id: p.id, 
                                              name: p.name, 
                                              price: p.price, 
                                              allow_half_half: p.allow_half_half,
                                              category_id: p.category_id 
                                            };
                                            
                                            // Se o produto permite dividir e não estamos em modo 2 sabores, muda automático
                                            let newFlavorCount = newDeliveryOrder.activeItem?.flavorCount || "1";
                                            if (p.allow_half_half && newFlavorCount === "1") {
                                              newFlavorCount = "2";
                                            }

                                            setNewDeliveryOrder({
                                              ...newDeliveryOrder,
                                              activeItem: { 
                                                ...newDeliveryOrder.activeItem,
                                                flavorCount: newFlavorCount,
                                                flavors: [...currentFlavors, newFlavor] 
                                              }
                                            });
                                          }
                                        }}
                                      >
                                        <span className="font-bold text-center break-words w-full">{p.name}</span>
                                        <span className={`text-[9px] mt-0.5 ${isSelected ? "text-orange-100" : "text-orange-600 font-semibold"}`}>R$ {p.price.toFixed(2)}</span>
                                        {!p.allow_half_half && <span className="text-[7px] text-red-500 font-bold mt-1">(Inteira)</span>}
                                      </Button>
                                    );
                                  })}
                              </div>

                              <div className="flex flex-col gap-1 mb-2 px-1">
                                <Label className="text-[10px] text-muted-foreground uppercase font-bold">Resumo:</Label>
                                <div className="text-[11px] min-h-[1.2rem] font-medium text-orange-900 italic">
                                  {(newDeliveryOrder.activeItem?.flavors || []).length > 0 
                                    ? (newDeliveryOrder.activeItem?.flavors || []).map((f: any) => f.name).join(' + ')
                                    : 'Selecione o(s) sabor(es)...'}
                                </div>
                              </div>

                              <Button 
                                className="w-full h-8 text-xs bg-orange-600 hover:bg-orange-700"
                                disabled={!newDeliveryOrder.activeItem?.flavors || newDeliveryOrder.activeItem.flavors.length === 0}
                                onClick={() => {
                                  const { activeItem } = newDeliveryOrder;
                                  const flavors = activeItem?.flavors || [];
                                  const maxPrice = Math.max(...flavors.map((f: any) => f.price));
                                  const name = flavors.length > 1 
                                    ? `Pizza (1/2 ${flavors[0].name} e 1/2 ${flavors[1].name})`
                                    : `Pizza (${flavors[0].name})`;

                                  const allowCrust = flavors.every((f: any) => {
                                    const prod = products.find(p => p.id === f.id);
                                    return prod?.allow_crust === true;
                                  });

                                  const relevantComplements = complementGroups.filter(g => {
                                    // Para pizzas compostas (meia-a-meia), buscamos vínculos de qualquer um dos sabores
                                    const productId1 = flavors[0].id;
                                    const productId2 = (flavors[1] as any)?.id;
                                    const categoryId1 = flavors[0].category_id;
                                    const categoryId2 = (flavors[1] as any)?.category_id;

                                    const isLinked = 
                                      productComplementGroups.some(pg => pg.group_id === g.id && (pg.product_id === productId1 || pg.product_id === productId2)) ||
                                      categoryComplementGroups.some(cg => cg.group_id === g.id && (cg.category_id === categoryId1 || cg.category_id === categoryId2));

                                    if (isLinked) return true;

                                    // Se o grupo tem outros vínculos, não mostrar aqui
                                    if (productComplementGroups.some(pg => pg.group_id === g.id) || 
                                        categoryComplementGroups.some(cg => cg.group_id === g.id)) return false;

                                    if (g.name === "Bordas" && allowCrust !== true) return false;
                                    return (g.name === "Tipo de Massa" || (g.name === "Bordas" && allowCrust));
                                  });

                                  if (relevantComplements.length > 0) {
                                    setNewDeliveryOrder({
                                      ...newDeliveryOrder,
                                      activeItem: { 
                                        ...activeItem, 
                                        product: { id: 'pizza-composite', name, price: maxPrice, category_id: flavors[0].category_id, allow_crust: allowCrust },
                                        selectedComplements: [] 
                                      }
                                    } as any);
                                    setIsOrderComplementDialogOpen(true);
                                  } else {
                                    setNewDeliveryOrder({
                                      ...newDeliveryOrder,
                                      items: [...newDeliveryOrder.items, {
                                        product_name: name,
                                        quantity: 1,
                                        unit_price: maxPrice,
                                        is_pizza: true,
                                        flavors: flavors.map((f: any) => f.id),
                                        selected_complements: []
                                      }],
                                      activeItem: null
                                    });

                                    // Sugestão baseada nos sabores montados
                                    let suggestions: string[] = [];
                                    flavors.forEach((f: any) => {
                                      const prodObj = products.find(p => p.id === f.id);
                                      if (prodObj?.suggested_products) {
                                        suggestions = [...suggestions, ...prodObj.suggested_products];
                                      }
                                    });
                                    suggestions = Array.from(new Set(suggestions));

                                    if (suggestions.length > 0) {
                                      const suggestedProducts = products.filter(p => suggestions.includes(p.id));
                                      const finalSuggestions = suggestedProducts.filter(s => !newDeliveryOrder.items.some((item: any) => item.product_id === s.id));

                                      if (finalSuggestions.length > 0) {
                                        toast.custom((t: any) => (
                                          <div className={`${t ? 'animate-in slide-in-from-right' : 'animate-out fade-out slide-out-to-right'} bg-card border-2 border-orange-500 rounded-2xl shadow-2xl p-3 flex flex-col gap-2 w-[280px] md:w-[320px] pointer-events-auto max-h-[70vh] overflow-y-auto custom-scrollbar`}>
                                            <div className="flex items-center gap-2 sticky top-0 bg-card pb-2 z-10 border-b border-orange-100">
                                              <div className="bg-orange-100 p-1.5 rounded-lg">
                                                <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-orange-600 animate-pulse" />
                                              </div>
                                              <div className="min-w-0">
                                                <h3 className="font-black text-foreground text-[10px] md:text-xs leading-tight uppercase text-orange-600 truncate">Dica do Cheff</h3>
                                                <p className="text-[8px] md:text-[9px] text-muted-foreground font-medium italic truncate">Estes itens combinam muito!</p>
                                              </div>
                                            </div>
                                            
                                            <div className="flex flex-col gap-2 my-1">
                                              {finalSuggestions.map((s: any) => (
                                                <div key={s.id} className="flex items-center gap-2 p-1.5 rounded-lg border border-border bg-muted/50 hover:bg-muted transition-colors group">
                                                  {s.image_url ? (
                                                    <img src={cldThumb(s.image_url, 120)} loading="lazy" className="h-10 w-10 md:h-12 md:w-12 rounded-md object-cover shadow-sm transition-transform group-hover:scale-105" alt={s.name} />
                                                  ) : (
                                                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-md bg-orange-50 flex items-center justify-center border border-orange-100">
                                                      <Sparkles className="h-4 w-4 text-orange-200" />
                                                    </div>
                                                  )}
                                                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                    <p className="font-bold text-muted-foreground text-[9px] md:text-[10px] truncate leading-tight mb-0.5">{s.name}</p>
                                                    <div className="flex items-center justify-between gap-1">
                                                      <p className="font-black text-orange-600 text-[10px] md:text-xs">R$ {Number(s.price).toFixed(2)}</p>
                                                      <Button 
                                                        type="button"
                                                        size="sm"
                                                        className="h-6 px-2 rounded-md text-[8px] md:text-[9px] font-black bg-orange-600 hover:bg-orange-700 text-white uppercase tracking-tighter shrink-0"
                                                        onClick={(e) => {
                                                          e.preventDefault();
                                                          e.stopPropagation();
                                                          setNewDeliveryOrder((curr: any) => {
                                                            const exists = curr.items.findIndex((item: any) => item.product_id === s.id);
                                                            if (exists !== -1) {
                                                              const newItems = [...curr.items];
                                                              newItems[exists] = { ...newItems[exists], quantity: newItems[exists].quantity + 1 };
                                                              return { ...curr, items: newItems };
                                                            }
                                                            return {
                                                              ...curr,
                                                              items: [...curr.items, {
                                                                product_id: s.id,
                                                                product_name: s.name,
                                                                quantity: 1,
                                                                unit_price: Number(s.price),
                                                                selected_complements: []
                                                              }]
                                                            };
                                                          });
                                                          toast.success(`${s.name} adicionado!`, { position: "top-center" });
                                                        }}
                                                      >
                                                        ADICIONAR
                                                      </Button>
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>

                                            <Button 
                                              type="button"
                                              variant="ghost" 
                                              className="w-full h-7 rounded-lg text-[9px] font-bold text-slate-400 hover:text-muted-foreground hover:bg-muted"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                toast.dismiss(t);
                                              }}
                                            >
                                              FECHAR
                                            </Button>
                                          </div>
                                        ), {
                                          duration: 15000,
                                          position: "top-right",
                                        });
                                      }
                                    }
                                    }
                                }}
                              >
                                Adicionar Pizza
                              </Button>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </div>

                    {/* Coluna 3: Carrinho / Itens Selecionados (Direita - 25%) */}
                    <div className="w-full md:w-[25%] shrink-0 md:sticky md:top-0 md:self-start md:h-[calc(90vh-200px)] md:max-h-[calc(90vh-200px)]">
                      <div className="border-2 border-orange-300 rounded-xl bg-gradient-to-b from-orange-50/40 via-card to-card shadow-lg flex flex-col overflow-hidden h-full">
                        {/* Header do carrinho */}
                        <div className="shrink-0 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="bg-white/20 backdrop-blur p-1.5 rounded-lg">
                              <ShoppingCart className="h-4 w-4" />
                            </div>
                            <div>
                              <h3 className="font-black text-sm uppercase tracking-wide leading-none">Resumo do Pedido</h3>
                              <p className="text-[10px] text-orange-50 font-medium mt-0.5">
                                {newDeliveryOrder.items.length === 0 ? 'Nenhum item ainda' : `${newDeliveryOrder.items.reduce((s, it) => s + (Number(it.quantity) || 0), 0)} item(s) no carrinho`}
                              </p>
                            </div>
                          </div>
                          <div className="bg-white text-orange-600 rounded-full h-9 w-9 flex items-center justify-center font-black text-base shadow-md">
                            {newDeliveryOrder.items.reduce((s, it) => s + (Number(it.quantity) || 0), 0)}
                          </div>
                        </div>



                        <div className="flex-1 min-h-0 p-3 overflow-hidden">
                          <div className="space-y-2 h-full overflow-y-auto pr-2 custom-scrollbar">


                            {newDeliveryOrder.items.map((item, idx) => {
                              const nameLower = item.product_name.toLowerCase();
                              const isDrink = nameLower.includes('bebida') || 
                                              nameLower.includes('suco') || 
                                              nameLower.includes('refrigerante') ||
                                              nameLower.includes('coca') ||
                                              nameLower.includes('guarana') ||
                                              nameLower.includes('cerveja') ||
                                              nameLower.includes('vinho');
                              
                              return (
                              <div key={idx} className={`group relative rounded-lg border-2 p-2.5 text-xs transition-all hover:shadow-md ${isDrink ? 'bg-gradient-to-r from-blue-50 to-blue-50/30 border-blue-200' : 'bg-gradient-to-r from-orange-50/40 to-card border-orange-100 hover:border-orange-300'}`}>
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className={`font-bold text-[11px] leading-tight ${isDrink ? 'text-blue-900' : 'text-foreground'}`}>{item.product_name}</span>
                                      {isDrink && <Badge className="bg-blue-600 text-white hover:bg-blue-600 border-none text-[8px] h-4 py-0 px-1.5 font-black">BEBIDA</Badge>}
                                      {item.selected_complements?.some((c: any) => c.name.toLowerCase().includes('borda')) && (
                                        <Badge className="bg-emerald-600 text-white hover:bg-emerald-600 border-none text-[8px] h-4 py-0 px-1.5 font-black uppercase">BORDA</Badge>
                                      )}
                                    </div>
                                    {(item.selected_complements && item.selected_complements.length > 0) && (
                                      <div className="flex flex-wrap gap-1 mt-1.5">
                                        {item.selected_complements.map((c: any, i: number) => (
                                          <span 
                                            key={i} 
                                            className="text-[9px] font-bold text-orange-700 bg-orange-100/80 px-2 py-0.5 rounded-md border border-orange-200/50 shadow-sm animate-in fade-in zoom-in duration-300"
                                          >
                                            + {c.name}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                    <Input
                                      value={item.notes || ""}
                                      onChange={(e) => {
                                        const newItems = [...newDeliveryOrder.items];
                                        newItems[idx] = { ...newItems[idx], notes: e.target.value };
                                        setNewDeliveryOrder({ ...newDeliveryOrder, items: newItems });
                                      }}
                                      placeholder="Obs: sem cebola, ponto da carne..."
                                      className="mt-1.5 h-6 text-[10px] px-2 py-1 bg-yellow-50 border-yellow-200 focus:border-yellow-400 placeholder:text-yellow-700/50 placeholder:italic"
                                    />
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-destructive hover:bg-destructive hover:text-white shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                      const newItems = newDeliveryOrder.items.filter((_, i) => i !== idx);
                                      setNewDeliveryOrder({ ...newDeliveryOrder, items: newItems });
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="flex items-center justify-between gap-2 mt-2">
                                  <div className="flex items-center gap-1 bg-white rounded-md border border-border shadow-sm">
                                    <button
                                      type="button"
                                      className="h-6 w-6 flex items-center justify-center text-orange-600 hover:bg-orange-50 rounded-l-md font-black text-sm transition-colors"
                                      onClick={() => {
                                        const newItems = [...newDeliveryOrder.items];
                                        if (newItems[idx].quantity > 1) {
                                          newItems[idx] = { ...newItems[idx], quantity: newItems[idx].quantity - 1 };
                                          setNewDeliveryOrder({ ...newDeliveryOrder, items: newItems });
                                        }
                                      }}
                                    >
                                      −
                                    </button>
                                    <span className="px-2 text-[11px] font-black min-w-[20px] text-center">{item.quantity}</span>
                                    <button
                                      type="button"
                                      className="h-6 w-6 flex items-center justify-center text-orange-600 hover:bg-orange-50 rounded-r-md font-black text-sm transition-colors"
                                      onClick={() => {
                                        const newItems = [...newDeliveryOrder.items];
                                        newItems[idx] = { ...newItems[idx], quantity: newItems[idx].quantity + 1 };
                                        setNewDeliveryOrder({ ...newDeliveryOrder, items: newItems });
                                      }}
                                    >
                                      +
                                    </button>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-[9px] text-muted-foreground leading-none">R$ {Number(item.unit_price).toFixed(2)} un.</div>
                                    <div className={`font-black text-sm leading-tight ${isDrink ? 'text-blue-700' : 'text-orange-600'}`}>R$ {(item.quantity * item.unit_price).toFixed(2)}</div>
                                  </div>
                                </div>
                              </div>
                            );
                            })}

                            {/* Taxa de Entrega */}
                            {newDeliveryOrder.order_type === 'delivery' && Number(newDeliveryOrder.delivery_fee) > 0 && (
                              <div className="flex items-center justify-between p-2.5 bg-gradient-to-r from-blue-50 to-blue-50/30 rounded-lg border-2 border-blue-200 text-xs">
                                <div className="flex items-center gap-2">
                                  <div className="bg-blue-600 p-1 rounded">
                                    <Truck className="h-3 w-3 text-white" />
                                  </div>
                                  <span className="font-bold text-blue-900">Taxa de Entrega</span>
                                </div>
                                <span className="font-black text-blue-700 text-sm">R$ {Number(newDeliveryOrder.delivery_fee).toFixed(2)}</span>
                              </div>
                            )}

                            {newDeliveryOrder.items.length === 0 && (!newDeliveryOrder.delivery_fee || newDeliveryOrder.order_type !== 'delivery') && (
                              <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12 px-4 border-2 border-dashed border-orange-200 rounded-xl bg-orange-50/30">
                                <ShoppingCart className="h-10 w-10 text-orange-300 mb-2" />
                                <p className="text-xs font-bold text-orange-600">Carrinho vazio</p>
                                <p className="text-[10px] mt-1">Selecione produtos ao lado esquerdo</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Subtotal */}
                        {newDeliveryOrder.items.length > 0 && (
                          <div className="px-4 py-2 border-t border-orange-100 bg-muted/20 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground font-medium">Subtotal</span>
                            <span className="font-black text-foreground">R$ {newDeliveryOrder.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  </div>

                  {/* Rodapé fixo: Total + Lançar Agora */}
                  <div className="shrink-0 border-t-2 border-orange-200 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-3 shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="text-[9px] md:text-[10px] uppercase font-bold opacity-80 leading-none">Itens</div>
                        <div className="text-base md:text-lg font-black leading-tight">{newDeliveryOrder.items.reduce((s, it) => s + (Number(it.quantity) || 0), 0)}</div>
                      </div>
                      <div className="h-8 w-px bg-white/30" />
                      <div>
                        <div className="text-[9px] md:text-[10px] uppercase font-bold opacity-80 leading-none">Subtotal</div>
                        <div className="text-base md:text-lg font-black leading-tight">R$ {newDeliveryOrder.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toFixed(2)}</div>
                      </div>
                      {newDeliveryOrder.order_type === 'delivery' && Number(newDeliveryOrder.delivery_fee) > 0 && (
                        <>
                          <div className="h-8 w-px bg-white/30" />
                          <div>
                            <div className="text-[9px] md:text-[10px] uppercase font-bold opacity-80 leading-none">Taxa</div>
                            <div className="text-base md:text-lg font-black leading-tight">R$ {Number(newDeliveryOrder.delivery_fee).toFixed(2)}</div>
                          </div>
                        </>
                      )}
                      <div className="h-8 w-px bg-white/30" />
                      <div>
                        <div className="text-[9px] md:text-[10px] uppercase font-bold opacity-80 leading-none">Total</div>
                        <div className="text-xl md:text-2xl font-black leading-tight">
                          R$ {(newDeliveryOrder.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) + (newDeliveryOrder.order_type === 'delivery' ? Number(newDeliveryOrder.delivery_fee || 0) : 0)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <Button
                      className="bg-white text-orange-600 hover:bg-orange-50 font-black h-11 md:h-12 px-5 md:px-8 shadow-lg text-sm md:text-base uppercase tracking-wide"
                      onClick={handleCreateOrder}
                      disabled={newDeliveryOrder.items.length === 0 || loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Lançando...
                        </>
                      ) : (
                        'Lançar Agora'
                      )}
                    </Button>
                  </div>
                </DialogContent>

              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
              {/* Coluna 1: Atendimento (Renomeado de Novos Pedidos) */}
              <div className="flex flex-col gap-4">

                <div className="bg-orange-100 text-orange-700 px-4 py-3 rounded-lg font-bold flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5" /> 1. Atendimento
                  </div>
                  <Badge className="bg-orange-600">{dashboardStats?.pendingCount}</Badge>
                </div>

                
                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                  {deliveryOrders.filter(o => o.status === 'pending' && !o.driver_id).map(order => (
                    <Card key={order.id} className="border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          {activeSession && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50 -ml-2 -mt-1"
                              onClick={() => handleDeleteOrder(order.id)}
                              title="Excluir Pedido"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          <div className="flex-1 px-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                              {order.customer_name}
                              {order.order_type === 'delivery' ? (
                                <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200">
                                  <Truck className="h-3 w-3 mr-1" /> Delivery
                                </Badge>
                              ) : order.order_type === 'pickup' ? (
                                <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200">
                                  <ShoppingBag className="h-3 w-3 mr-1" /> Retirada
                                </Badge>
                              ) : (
                                <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200">
                                  <Store className="h-3 w-3 mr-1" /> Balcão
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3" /> {new Date(order.created_at).toLocaleTimeString()}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Novo</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-start gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                            <span className="truncate">{order.customer_address}</span>
                          </div>
                          {order.observation && (
                            <div className="bg-blue-50 p-2 rounded-lg border border-blue-100 flex items-start gap-2">
                              <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                              <div className="text-xs">
                                <p className="font-bold text-blue-800 uppercase text-[9px]">Observação do Pedido:</p>
                                <p className="text-blue-900 font-medium">{order.observation}</p>
                              </div>
                            </div>
                          )}
                          <div className="border-t pt-2 mt-2">
                            <p className="font-semibold mb-1">Itens:</p>
                            <ul className="space-y-1">
                               {(!order.delivery_order_items || order.delivery_order_items.length === 0) ? (
                                 <li className="text-xs italic text-muted-foreground py-2 text-center flex flex-col items-center justify-center gap-2">
                                   {order.delivery_order_items ? "Nenhum item encontrado" : (
                                     <>
                                       <Loader2 className="h-3 w-3 animate-spin" />
                                       Carregando itens...
                                     </>
                                   )}
                                 </li>
                               ) : (
                                 order.delivery_order_items.map((item: any) => (
                                   <li key={item.id} className="flex flex-col gap-0.5 border-b border-orange-50 pb-1 mb-1 last:border-0">
                                     <div className="flex justify-between items-center">
                                       <span className="font-medium flex items-center gap-1.5">
                                         {item.quantity}x {item.product_name}
                                         {item.selected_complements?.some((c: any) => c.name.toLowerCase().includes('borda')) && (
                                           <Badge className="bg-emerald-600 text-white border-none text-[8px] h-3.5 px-1 font-black leading-none uppercase">BORDA</Badge>
                                         )}
                                       </span>
                                       <span className="text-muted-foreground font-medium">R$ {Number(item.total_price || 0).toFixed(2)}</span>
                                     </div>
                                      {item.selected_complements && item.selected_complements.length > 0 && (
                                        <div className="flex flex-col ml-4 text-[10px] text-muted-foreground italic bg-orange-50/50 p-1 rounded mt-0.5">
                                          {item.selected_complements.map((c: any, i: number) => (
                                            <span key={i}>+ {c.name}</span>
                                          ))}
                                        </div>
                                      )}
                                      {item.notes && (
                                        <div className="ml-4 mt-0.5 text-[10px] text-yellow-800 bg-yellow-50 border border-yellow-200 rounded px-1.5 py-0.5">
                                          <span className="font-bold">Obs:</span> {item.notes}
                                        </div>
                                      )}
                                    </li>
                                 ))
                               )}
                             </ul>
                           </div>
                           <div className="pt-2 border-t space-y-1">
                             {order.order_type === 'delivery' && (
                               <div className="flex justify-between items-center text-xs text-muted-foreground italic px-1">
                                 <span>Taxa de Entrega</span>
                                 <span>R$ {Number((order as any).delivery_fee || 0).toFixed(2)}</span>
                               </div>
                             )}
                            <div className="flex justify-between items-center font-bold text-base">
                              <span>Total</span>
                              <span className="text-orange-600">R$ {Number(order.total_amount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-end pt-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-[10px] gap-1 border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700 font-bold"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  processPrintingForDeliveryOrder(order.id).catch(err => {
                                    console.error("Erro ao imprimir pedido:", err);
                                    toast.error("Erro ao processar impressão");
                                  });
                                }}
                              >
                                <Printer className="h-3 w-3" /> REIMPRIMIR
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        {(() => {
                          const items = order.delivery_order_items || [];
                          // Mesma regra de handleCreateOrder: cozinha se send_to_production OU send_to_kds estiverem ativos.
                          const needsKitchen = items.some((item: any) => {
                            const product = products.find(p => p.name === item.product_name);
                            if (!product) return true;
                            const sendsToProduction = (product as any).send_to_production !== false;
                            const sendsToKds = (product as any).send_to_kds !== false;
                            return sendsToProduction || sendsToKds;
                          });

                          const isDelivery = order.order_type === 'delivery';
                          const readyLabel = isDelivery ? 'Enviar Direto para Entrega'
                            : order.order_type === 'pickup' ? 'Pronto para Retirada'
                            : 'Marcar como Pronto (Balcão)';
                          return !needsKitchen ? (
                            <Button 
                              className="w-full bg-green-600 hover:bg-green-700 gap-2 font-bold"
                              onClick={() => updateOrderStatus(order.id, 'ready')}
                            >
                              {isDelivery ? <Truck className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                              {readyLabel}
                            </Button>
                          ) : (
                            <Button 
                              className="w-full bg-orange-600 hover:bg-orange-700 gap-2 font-bold"
                              onClick={() => updateOrderStatus(order.id, 'production')}
                            >
                              <Plus className="h-4 w-4" /> Enviar para Produção
                            </Button>
                          );
                        })()}
                      </CardFooter>
                    </Card>
                  ))}
                  {deliveryOrders.filter(o => o.status === 'pending' && !o.driver_id).length === 0 && (
                    <div className="py-10 text-center bg-muted/20 rounded-xl border-2 border-dashed">
                      <Package className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-20" />
                      <p className="text-muted-foreground text-sm">Nenhum pedido novo.</p>
                    </div>
                  )}
                </div>
              </div>


              {/* Coluna 2: Em Produção */}
              <div className="flex flex-col gap-4">
                <div className="bg-yellow-100 text-yellow-700 px-4 py-3 rounded-lg font-bold flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" /> 2. Produção
                  </div>
                  <Badge className="bg-yellow-600">{dashboardStats?.productionCount}</Badge>
                </div>


                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                  {deliveryOrders.filter(o => o.status === 'production').map(order => (
                    <Card key={order.id} className="border-l-4 border-l-yellow-500 shadow-md">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          {activeSession && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50 -ml-2 -mt-1"
                              onClick={() => handleDeleteOrder(order.id)}
                              title="Excluir Pedido"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          <div className="flex-1 px-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                              {order.customer_name}
                              {order.order_type === 'delivery' ? (
                                <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200">
                                  <Truck className="h-3 w-3 mr-1" /> Delivery
                                </Badge>
                              ) : order.order_type === 'pickup' ? (
                                <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200">
                                  <ShoppingBag className="h-3 w-3 mr-1" /> Retirada
                                </Badge>
                              ) : (
                                <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200">
                                  <Store className="h-3 w-3 mr-1" /> Balcão
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1 text-yellow-700 font-medium">
                              Em preparo na cozinha
                            </CardDescription>
                          </div>
                          <Badge className="bg-yellow-500">Produzindo</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 text-sm">
                          {order.observation && (
                            <div className="bg-blue-50 p-2 rounded-lg border border-blue-100 flex items-start gap-2 mb-2">
                              <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                              <div className="text-xs">
                                <p className="font-bold text-blue-800 uppercase text-[9px]">Observação do Pedido:</p>
                                <p className="text-blue-900 font-medium">{order.observation}</p>
                              </div>
                            </div>
                          )}
                          {order.notes && (
                            <div className="bg-yellow-50 p-2 rounded border border-yellow-100 italic text-yellow-800 text-xs">
                              {order.notes}
                            </div>
                          )}
                          <div className="border-t pt-2">
                            <ul className="space-y-2">
                               {(!order.delivery_order_items || order.delivery_order_items.length === 0) ? (
                                 <li className="text-xs italic text-muted-foreground py-2 text-center flex flex-col items-center justify-center gap-2">
                                   {order.delivery_order_items ? "Nenhum item encontrado" : (
                                     <>
                                       <Loader2 className="h-3 w-3 animate-spin" />
                                       Carregando itens...
                                     </>
                                   )}
                                 </li>
                               ) : (
                                 <>
                                    {order.delivery_order_items.map((item: any) => {
                                      const product = products.find(p => p.name === item.product_name);
                                      // Exibe se enviar para cozinha (impressão) OU para o KDS. Default = exibir.
                                      const sendsToProduction = !product || (product as any).send_to_production !== false;
                                      const sendsToKds = !product || (product as any).send_to_kds !== false;
                                      const shouldShowInProduction = sendsToProduction || sendsToKds;
                                      
                                      if (!shouldShowInProduction) return null;

                                      return (
                                        <li key={item.id} className="flex flex-col gap-1 border-b border-yellow-50 pb-2 last:border-0">
                                          <div className="flex gap-2 items-center">
                                             <span className="font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded text-xs">{item.quantity}x</span>
                                             <span className="font-medium flex items-center gap-1.5">
                                               {item.product_name}
                                               {item.selected_complements?.some((c: any) => c.name.toLowerCase().includes('borda')) && (
                                                 <Badge className="bg-emerald-600 text-white border-none text-[8px] h-3.5 px-1 font-black leading-none uppercase">BORDA</Badge>
                                               )}
                                             </span>
                                          </div>
                                           {item.selected_complements && item.selected_complements.length > 0 && (
                                             <div className="flex flex-col ml-8 text-[10px] text-muted-foreground italic bg-yellow-50/50 p-1 rounded">
                                               {item.selected_complements.map((c: any, i: number) => (
                                                 <span key={i}>+ {c.name}</span>
                                               ))}
                                             </div>
                                           )}
                                           {item.notes && (
                                             <div className="ml-8 text-[10px] text-yellow-900 bg-yellow-100 border border-yellow-300 rounded px-2 py-0.5">
                                               <span className="font-bold">Obs:</span> {item.notes}
                                             </div>
                                           )}
                                         </li>
                                      );
                                    })}
                                     {order.delivery_order_items.every((item: any) => {
                                       const product = products.find(p => p.name === item.product_name);
                                       if (!product) return false;
                                       return (product as any).send_to_kds === false && (product as any).send_to_production === false;
                                     }) && (
                                      <li className="text-xs italic text-muted-foreground">Nenhum item para produção.</li>
                                    )}
                                 </>
                               )}
                            </ul>
                          </div>
                          <div className="pt-2 border-t space-y-1">
                            {order.order_type === 'delivery' && (
                              <div className="flex justify-between items-center text-xs text-muted-foreground italic px-1">
                                <span>Taxa de Entrega</span>
                                <span>R$ {(Number((order as any).delivery_fee || 0) || (order.total_amount - (order.delivery_order_items?.reduce((acc: number, item: any) => acc + item.total_price, 0) || 0))).toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center font-bold text-sm">
                              <span>Total</span>
                               <span className="text-orange-600">R$ {Number(order.total_amount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-end pt-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-[10px] gap-1 border-yellow-200 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 font-bold"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  processPrintingForDeliveryOrder(order.id).catch(err => {
                                    console.error("Erro ao imprimir pedido:", err);
                                    toast.error("Erro ao processar impressão");
                                  });
                                }}
                              >
                                <Printer className="h-3 w-3" /> REIMPRIMIR
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full bg-yellow-600 hover:bg-yellow-700 gap-2 font-bold"
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                        >
                          <CheckCircle2 className="h-4 w-4" /> Pronto para Entrega
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                  {deliveryOrders.filter(o => o.status === 'production').length === 0 && (
                    <div className="py-10 text-center bg-muted/20 rounded-xl border-2 border-dashed">
                      <Loader2 className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-20" />
                      <p className="text-muted-foreground text-sm">Cozinha livre.</p>
                    </div>
                  )}
                </div>
              </div>


              {/* Coluna 3: Entrega / Retirada / Balcão */}
              <div className="flex flex-col gap-4">
                <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg font-bold flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2">
                    <Bike className="h-5 w-5" /> 3. Entrega / Finalizados
                  </div>
                  <Badge className="bg-green-600">{deliveryOrders.filter(o => o.status === 'ready' || (o.order_type === 'delivery' && !!o.driver_id && o.status !== 'delivered' && o.status !== 'cancelled' && o.status !== 'awaiting_reconciliation' && o.status !== 'delivering')).length}</Badge>
                </div>



                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                  {deliveryOrders.filter(o => o.status === 'ready' || (o.order_type === 'delivery' && !!o.driver_id && o.status !== 'delivered' && o.status !== 'cancelled' && o.status !== 'awaiting_reconciliation' && o.status !== 'delivering')).map(order => {
                    const area = deliveryAreas.find(a => 
                      (order.neighborhood && a.name && order.neighborhood.toLowerCase().includes(a.name.toLowerCase())) ||
                      (order.customer_address && a.name && order.customer_address.toLowerCase().includes(a.name.toLowerCase()))
                    );
                    const validMotoqueiros = appMotoqueiros.filter((m) => typeof m.id === "string" && m.id.length > 0);
                    const assignedValue = validMotoqueiros.find((m) => m.id === order.driver_id || (m.profile_id && m.profile_id === order.driver_id))?.id || order.driver_id || "";
                    const pendingDriver = pendingDriverByOrder[order.id] || "";
                    const selectValue = pendingDriver || assignedValue;
                    return (
                    <Card key={order.id} className={`border-l-4 ${order.status === 'delivering' ? 'border-l-blue-500' : 'border-l-green-500'} shadow-md`}>
                      <CardHeader className="px-3 pt-3 pb-1">
                        <div className="flex justify-between items-start">
                          {activeSession && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50 -ml-2 -mt-1"
                              onClick={() => handleDeleteOrder(order.id)}
                              title="Excluir Pedido"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          <div className="flex-1 px-2">
                            <CardTitle className="text-base leading-tight">{order.customer_name}</CardTitle>
                            <CardDescription className="text-xs text-primary">{order.order_type === 'delivery' ? 'Entrega em Domicílio' : order.order_type === 'pickup' ? 'Retirada' : order.order_type === 'dine_in' ? 'Consumo Local (Mesa)' : 'Pedido Balcão'}</CardDescription>
                          </div>
                          <Badge className={order.status === 'delivering' ? 'bg-blue-500' : 'bg-green-500'}>
                            {order.status === 'delivering' ? 'Em Rota' : 'Aguardando'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="px-3 py-2">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-1.5 text-xs">
                            <MapPin className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                            <span className="font-medium">{order.customer_address}</span>
                          </div>
                          
                          {order.observation && (
                            <div className="bg-blue-50 p-1.5 rounded-md border border-blue-100 flex items-start gap-1.5">
                              <Info className="h-3.5 w-3.5 text-blue-600 mt-0.5 shrink-0" />
                              <div className="text-xs">
                                <p className="font-bold text-blue-800 uppercase text-[9px]">Observação:</p>
                                <p className="text-blue-900 font-medium leading-tight">{order.observation}</p>
                              </div>
                            </div>
                          )}

                          

                          {order.order_type === 'delivery' && !order.driver_id && (
                            <div className="space-y-1.5 pt-1.5 border-t">
                              <Label className="text-[10px] font-bold uppercase text-muted-foreground leading-tight">
                                Motoqueiro (App MeuPedix Entregador)
                              </Label>
                              <div className="flex flex-col gap-1.5">
                                {(() => {
                                   const isDelivering = order.status === "delivering";
                                   return (
                                     <>
                                        <select
                                          className="h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                          value={selectValue}
                                          disabled={validMotoqueiros.length === 0 || !!order.driver_id}
                                          onChange={(event) => {
                                            const v = event.target.value;
                                            setPendingDriverByOrder((prev) => {
                                              const next = { ...prev };
                                              if (v) next[order.id] = v;
                                              else delete next[order.id];
                                              return next;
                                            });
                                          }}
                                        >
                                         <option value="">
                                           {validMotoqueiros.length === 0
                                             ? "Nenhum motoqueiro ativo encontrado"
                                             : "Escolher motoqueiro..."}
                                         </option>
                                         {validMotoqueiros.map((m) => {
                                           const ativo = typeof m.pedidos_ativos === "number" ? m.pedidos_ativos : 0;
                                           const statusText = ativo === 0
                                             ? "Livre"
                                             : `${ativo} em andamento`;
                                           const label = m.full_name || m.email || "Motoqueiro";
                                           return (
                                             <option key={m.id} value={m.id}>
                                               {label} — {statusText}
                                             </option>
                                           );
                                         })}
                                       </select>



                                      {isDelivering && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="w-full gap-2 text-green-700 border-green-200 hover:bg-green-50"
                                          title="Enviar WhatsApp de Saída"
                                          onClick={() => {
                                            const msg = `🚀 *${order.customer_name}, seu pedido saiu para entrega!* O entregador já está a caminho.\n\n📍 Acompanhe pelo link do nosso site!`;
                                            const cleanPhone = order.customer_phone.replace(/\D/g, '');
                                            const finalPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
                                            window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`, "_blank");
                                          }}
                                        >
                                          <Phone className="h-4 w-4" />
                                          WhatsApp de Saída
                                        </Button>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          )}
                          
                          {order.order_type === 'delivery' && order.driver_id && (
                            <div className="space-y-3">
                              <div className="bg-blue-50 p-3 rounded-xl flex items-center justify-between text-blue-700 border border-blue-100 shadow-sm">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                                    <Bike className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black uppercase opacity-60">Entregador</p>
                                    <span className="font-bold">{drivers.find(d => d.id === order.driver_id)?.name}</span>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className="text-[10px] uppercase font-bold opacity-60">Taxa</span>
                                  <span className="font-black text-blue-800">
                                    R$ {(Number((order as any).delivery_fee || 0) || (order.total_amount - (order.delivery_order_items?.reduce((acc: number, item: any) => acc + item.total_price, 0) || 0))).toFixed(2)}
                                  </span>
                                </div>
                              </div>

                              {/* Rastreio GPS removido a pedido do usuário */}

                            </div>
                          )}
                          
                          <div className="pt-2 border-t space-y-2">
                            <Label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                              <Package className="h-3 w-3" /> Itens do Pedido
                            </Label>
                            <ul className="space-y-1">
                               {(!order.delivery_order_items || order.delivery_order_items.length === 0) ? (
                                 <li className="text-xs italic text-muted-foreground py-2 text-center flex flex-col items-center justify-center gap-2">
                                   {order.delivery_order_items ? "Nenhum item encontrado" : (
                                     <>
                                       <Loader2 className="h-3 w-3 animate-spin" />
                                       Carregando itens...
                                     </>
                                   )}
                                 </li>
                               ) : (
                                 order.delivery_order_items.map((item: any) => (
                                   <li key={item.id} className="text-xs flex flex-col bg-muted/30 p-1.5 rounded-sm">
                                     <div className="flex justify-between items-center w-full">
                                       <span className="font-medium">{item.quantity}x {item.product_name}</span>
                                       <span className="font-bold text-primary">R$ {Number(item.total_price || 0).toFixed(2)}</span>
                                     </div>
                                     {item.selected_complements && item.selected_complements.length > 0 && (
                                       <div className="flex flex-col ml-4 text-[9px] text-muted-foreground italic border-l border-primary/20 pl-2 mt-1 bg-card/30 rounded p-1">
                                         {item.selected_complements.map((c: any, i: number) => (
                                           <span key={i}>+ {c.name}</span>
                                         ))}
                                       </div>
                                     )}
                                   </li>
                                 ))
                               )}
                            </ul>
                          </div>


                          <div className="pt-2 border-t space-y-1">
                            <div className="flex justify-between items-center text-xs text-muted-foreground px-2">
                              <span>Subtotal</span>
                              <span>R$ {(() => {
                                const subtotal = order.delivery_order_items?.reduce((acc: number, item: any) => acc + item.total_price, 0) || 0;
                                return subtotal.toFixed(2);
                              })()}</span>
                            </div>

                            
                            {order.order_type === 'delivery' && order.driver_id && (
                              <div className="flex justify-between items-center text-xs text-muted-foreground px-2 italic">
                                <span>Taxa do Motoqueiro</span>
                                <span>R$ {(Number((order as any).delivery_fee || 0) || (order.total_amount - (order.delivery_order_items?.reduce((acc: number, item: any) => acc + item.total_price, 0) || 0))).toFixed(2)}</span>
                              </div>
                            )}

                            <div className="flex justify-between items-center text-base font-bold text-orange-600 bg-orange-50 p-2 rounded-md border border-orange-100 mt-1">
                              <span className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" /> Total do Pedido
                              </span>
                              <span>
                                R$ {(() => {
                                  const subtotalValue = order.delivery_order_items?.reduce((acc: number, item: any) => acc + item.total_price, 0) || 0;
                                  if (order.order_type !== 'delivery') return subtotalValue.toFixed(2);
                                  
                                  const feeValue = (order as any).delivery_fee || (order.total_amount - subtotalValue);
                                  return (subtotalValue + feeValue).toFixed(2);
                                })()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex gap-2">
                        <div className="flex flex-col w-full gap-2">
                          {(order.order_type !== 'delivery' || !!order.driver_id || !!pendingDriver || order.status === 'delivering') && (
                            <Button
                              className="w-full bg-green-600 hover:bg-green-700 gap-2 font-bold shadow-md h-11"
                              onClick={async () => {
                                try {
                                  if (order.order_type === 'delivery') {
                                    if (!order.driver_id && pendingDriver) {
                                      await assignMotoqueiroToOrder(order.id, pendingDriver);
                                      setPendingDriverByOrder((prev) => {
                                        const next = { ...prev };
                                        delete next[order.id];
                                        return next;
                                      });
                                    }
                                    if (order.driver_id || pendingDriver) {
                                      await updateOrderStatus(order.id, 'awaiting_reconciliation');
                                    } else {
                                      toast.info("Selecione um motoqueiro para finalizar.");
                                    }
                                    return;
                                  }
                                  // Retirada/balcão: segue para conciliação no caixa
                                  updateOrderStatus(order.id, 'awaiting_reconciliation');
                                } catch (e: any) {
                                  console.error("[motoqueiros] falha ao atribuir:", e);
                                  toast.error(e?.message || "Erro ao atribuir motoqueiro");
                                  return;
                                }
                              }}
                            >
                              <CheckCircle2 className="h-4 w-4" /> Finalizar Pedido
                            </Button>
                          )}
                          {order.order_type === 'delivery' && !order.driver_id && !pendingDriver && order.status !== 'delivering' && (
                            <p className="text-[11px] text-center text-muted-foreground italic">
                              Selecione um motoqueiro para liberar a finalização.
                            </p>
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                    );
                  })}
                  {deliveryOrders.filter(o => o.status === 'ready' || (o.order_type === 'delivery' && !!o.driver_id && o.status !== 'delivered' && o.status !== 'cancelled' && o.status !== 'awaiting_reconciliation' && o.status !== 'delivering')).length === 0 && (
                    <div className="py-10 text-center bg-muted/20 rounded-xl border-2 border-dashed">
                      <Truck className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-20" />
                      <p className="text-muted-foreground text-sm">Sem pedidos aguardando.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Nova Seção: Histórico de Pedidos Concluídos */}

            <div className="mt-12 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-xl font-bold text-muted-foreground flex items-center gap-2">
                  <Archive className="h-5 w-5" /> Histórico de Pedidos (Concluídos / Cancelados)
                </h3>
                <Badge variant="outline" className="text-muted-foreground">Últimos Pedidos</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {deliveryOrders
                  .filter(o => {
                    const isFinished = o.status === 'delivered' || o.status === 'cancelled';
                    if (!isFinished) return false;
                    
                    // Filtra apenas pedidos do dia (hoje) usando data local
                    const orderDate = new Date(o.created_at).toLocaleDateString('en-CA');
                    return orderDate === todayDate;
                  })
                  .map(order => {
                    const area = deliveryAreas.find(a => 
                      (order.neighborhood && a.name && order.neighborhood.toLowerCase().includes(a.name.toLowerCase())) ||
                      (order.customer_address && a.name && order.customer_address.toLowerCase().includes(a.name.toLowerCase()))
                    );
                    return (
                    <Card key={order.id} className="opacity-75 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-dashed">
                      <CardHeader className="py-3">
                        <div className="flex justify-between items-start">
                          <div className="truncate pr-2">
                            <CardTitle className="text-sm font-bold truncate">{order.customer_name}</CardTitle>
                            {(order as any).tipo_venda === 'whatsapp' && (
                              <Badge className="bg-green-600 hover:bg-green-600 text-white text-[9px] mt-1 gap-1">
                                <MessageCircle className="h-2.5 w-2.5" /> WhatsApp bot
                              </Badge>
                            )}
                            <CardDescription className="text-[10px] flex items-center gap-1">
                              <Calendar className="h-2.5 w-2.5" /> {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString()}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-1">
                            {activeSession && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                                title="Excluir Pedido Permanentemente"
                                onClick={() => handleDeleteOrder(order.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-muted-foreground hover:text-primary transition-colors"
                              title="Imprimir Pedido"
                              onClick={() => handlePrintOrder(order)}
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </Button>
                            <div className="flex flex-col items-end gap-1">
                              <Badge className={order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} variant="outline">
                                {order.status === 'delivered' ? 'Entregue' : 'Cancelado'}
                              </Badge>
                            </div>
                          </div>

                        </div>
                      </CardHeader>
                      <CardContent className="py-0 pb-3">
                        <div className="text-[11px] space-y-1">
                          <div className="flex justify-between font-bold text-orange-600">
                            <span>Total</span>
                            <span>R$ {(() => {
                              const subtotal = order.delivery_order_items?.reduce((acc: number, item: any) => acc + item.total_price, 0) || 0;
                              if (order.order_type !== 'delivery') return subtotal.toFixed(2);
                              
                              const feeValue = (order as any).delivery_fee || (order.total_amount - subtotal);
                              return (subtotal + feeValue).toFixed(2);
                            })()}</span>
                          </div>

                          <div className="text-muted-foreground truncate">{order.customer_address}</div>
                          
                          <div className="pt-2 mt-2 border-t border-dashed border-muted-foreground/20">
                            <div className="font-semibold text-muted-foreground mb-1 uppercase text-[9px]">Itens:</div>
                            <div className="space-y-0.5">
                               {(!order.delivery_order_items || order.delivery_order_items.length === 0) ? (
                                 <div className="text-[10px] italic text-muted-foreground py-1">Carregando itens...</div>
                               ) : (
                                 order.delivery_order_items.map((item: any) => (
                                   <div key={item.id} className="flex flex-col bg-muted/20 px-1.5 py-0.5 rounded-sm">
                                     <div className="flex justify-between items-center w-full text-[11px]">
                                       <span>{item.quantity}x {item.product_name}</span>
                                     </div>
                                     {item.selected_complements && item.selected_complements.length > 0 && (
                                       <div className="flex flex-col ml-4 text-[10px] text-muted-foreground italic">
                                         {item.selected_complements.map((c: any, i: number) => (
                                           <span key={i}>+ {c.name}</span>
                                         ))}
                                       </div>
                                     )}
                                   </div>
                                 ))
                               )}
                            </div>
                          </div>

                          {order.driver_id && (
                            <div className="mt-2 flex items-center justify-between gap-1.5 bg-blue-50 text-blue-700 p-1.5 rounded-sm border border-blue-100">
                              <div className="flex items-center gap-1.5">
                                <Bike className="h-3 w-3" />
                                <span className="font-medium">Entregue por: {drivers.find(d => d.id === order.driver_id)?.name || 'Motoqueiro'}</span>
                              </div>
                              <span className="font-bold">Taxa: R$ {(Number((order as any).delivery_fee) || 0).toFixed(2)}</span>
                            </div>
                          )}

                        </div>
                      </CardContent>
                    </Card>
                    );
                  })}
                {deliveryOrders.filter(o => o.status === 'delivered' || o.status === 'cancelled').length === 0 && (
                  <div className="col-span-full py-8 text-center bg-muted/10 rounded-lg border border-dashed">
                    <p className="text-muted-foreground text-sm italic">Nenhum pedido concluído recentemente.</p>
                  </div>
                )}
              </div>
            </div>
              </div>
              <Suspense fallback={null}>
                <div className="sticky top-24 self-start h-[calc(100vh-8rem)]">
                  <WhatsAppSidePanel />
                </div>
              </Suspense>
            </div>
          </TabsContent>


          <TabsContent value="live_deliveries" className="space-y-6 animate-in fade-in duration-500">
            {activeTab === "live_deliveries" && <LiveDeliveriesPanel />}
          </TabsContent>

          <TabsContent value="history_module" className="space-y-6">
            <Card className="border-orange-100 shadow-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-white border-b border-orange-100 pb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <CardTitle className="text-2xl font-black text-orange-900 italic">
                        {storeSettings?.name || "RELATÓRIO DE PEDIDOS"}
                      </CardTitle>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 bg-card p-2 rounded-2xl shadow-inner border border-orange-100">
                    <div className="flex items-center gap-2">
                      <Label className="text-[10px] font-black uppercase text-orange-800 ml-2">De:</Label>
                      <Input 
                        type="date" 
                        disabled={!showPedidosFiltroPeriodo}
                        className="h-9 w-36 border-none bg-orange-50/50 focus-visible:ring-orange-500 font-bold disabled:opacity-60 disabled:cursor-not-allowed" 
                        value={showPedidosFiltroPeriodo ? historyFilters.startDate : getTodayDate()} 
                        onChange={e => showPedidosFiltroPeriodo && setHistoryFilters(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-[10px] font-black uppercase text-orange-800">Até:</Label>
                      <Input 
                        type="date" 
                        disabled={!showPedidosFiltroPeriodo}
                        className="h-9 w-36 border-none bg-orange-50/50 focus-visible:ring-orange-500 font-bold disabled:opacity-60 disabled:cursor-not-allowed" 
                        value={showPedidosFiltroPeriodo ? historyFilters.endDate : getTodayDate()} 
                        onChange={e => showPedidosFiltroPeriodo && setHistoryFilters(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                    <Button 
                      onClick={fetchHistoryOrders} 
                      disabled={!showPedidosFiltroPeriodo}
                      className="bg-orange-600 hover:bg-orange-700 h-9 px-6 font-bold shadow-md transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Filtrar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-orange-50/30">
                      <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="font-black text-orange-900 uppercase text-[10px] h-12">Data/Hora</TableHead>
                        <TableHead className="font-black text-orange-900 uppercase text-[10px] h-12">Cliente</TableHead>
                        <TableHead className="font-black text-orange-900 uppercase text-[10px] h-12 text-center">Status</TableHead>
                        <TableHead className="font-black text-orange-900 uppercase text-[10px] h-12 text-right">Taxa Entrega</TableHead>
                        <TableHead className="font-black text-orange-900 uppercase text-[10px] h-12 text-right">Total</TableHead>
                        <TableHead className="font-black text-orange-900 uppercase text-[10px] h-12 text-center">Ações</TableHead>

                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-20 text-muted-foreground italic">
                            <div className="flex flex-col items-center gap-4">
                              <div className="bg-orange-50 p-6 rounded-full">
                                <Search className="h-12 w-12 text-orange-200" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-lg font-bold text-orange-900">Nenhum pedido encontrado</p>
                                <p className="text-sm">Tente mudar o período de busca acima.</p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        historyOrders.map(order => (
                          <TableRow key={order.id} className="hover:bg-orange-50/30 transition-colors border-b border-orange-50/50 group">
                            <TableCell className="py-4">
                              <div className="font-bold text-gray-900 text-sm">{new Date(order.created_at).toLocaleDateString()}</div>
                              <div className="text-gray-500 text-xs mt-0.5">
                                {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                            </TableCell>
                            <TableCell className="py-4 max-w-[250px]">
                              <div className="font-black text-gray-900 truncate group-hover:text-orange-600 transition-colors uppercase text-xs">{order.customer_name}</div>
                              {(order as any).tipo_venda === 'whatsapp' && (
                                <Badge className="bg-green-600 hover:bg-green-600 text-white text-[9px] mt-1 gap-1">
                                  <MessageCircle className="h-2.5 w-2.5" /> WhatsApp bot
                                </Badge>
                              )}
                               <div className="text-[10px] text-gray-500 truncate mt-0.5">
                                 {order.customer_address}
                               </div>
                               {order.observation && (
                                 <div className="text-[9px] text-blue-600 font-bold uppercase mt-1">
                                   Obs: {order.observation}
                                 </div>
                               )}
                            </TableCell>
                            <TableCell className="py-4 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <Badge className={`
                                  font-bold shadow-sm border-none px-3 py-1 text-[10px] uppercase tracking-wider
                                  ${order.status === 'delivered' ? "bg-green-500 text-white" :
                                    order.status === 'cancelled' ? "bg-red-500 text-white" :
                                    order.status === 'pending' ? "bg-orange-500 text-white" :
                                    "bg-blue-500 text-white"}
                                `}>
                                  {order.status === 'pending' ? 'Pendente' :
                                   order.status === 'production' ? 'Em Produção' :
                                   order.status === 'ready' ? 'Pronto' :
                                   order.status === 'delivering' ? 'Em Entrega' :
                                   order.status === 'delivered' ? 'Entregue' :
                                   order.status === 'awaiting_reconciliation' ? 'Aguardando Conciliação' :
                                   order.status === 'cancelled' ? 'Cancelado' : order.status}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 text-right">
                              <div className="text-xs text-gray-400 font-medium">Taxa</div>
                              <div className={`font-black text-sm italic ${Number((order as any).delivery_fee) > 0 ? 'text-blue-600' : 'text-gray-300'}`}>
                                R$ {(Number((order as any).delivery_fee) || 0).toFixed(2)}
                              </div>
                            </TableCell>
                            <TableCell className="py-4 text-right">
                              <div className="text-xs text-gray-400 font-medium">Total</div>
                              <div className="font-black text-orange-600 text-base italic">
                                R$ {order.total_amount.toFixed(2)}
                              </div>
                            </TableCell>

                            <TableCell className="py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="h-10 w-10 border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm" 
                                  onClick={() => handlePrintOrder(order)}
                                  title="Imprimir Pedido"
                                >
                                  <Printer className="h-5 w-5" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-10 w-10 border-green-100 text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition-all shadow-sm"
                                  onClick={async () => {
                                    const { printPaymentReceiptForOrder } = await import("@/lib/table-printing");
                                    const ok = await printPaymentReceiptForOrder(order.id);
                                    if (!ok) toast.error("Falha ao gerar comprovante.");
                                  }}
                                  title="Comprovante de Pagamento"
                                >
                                  <ReceiptText className="h-5 w-5" />
                                </Button>
                                {activeSession && (
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-10 w-10 border-red-100 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm" 
                                    onClick={() => handleDeleteOrder(order.id)}
                                    title="Excluir Pedido"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </Button>
                                )}
                                <Suspense fallback={null}>
                                  <FiscalButtons
                                    orderId={order.id}
                                    orderStatus={order.status}
                                    hasDocument={(order as any).hasFiscalDocument || false}
                                    documentType={(order as any).fiscalDocumentType}
                                    documentId={(order as any).fiscalDocumentId}
                                    documentStatus={(order as any).fiscalDocumentStatus}
                                    onEmit={() => loadLargeData()}
                                  />
                                </Suspense>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                {historyOrders.length > 0 && (
                  <div className="p-6 bg-orange-50/30 border-t border-orange-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-orange-100">
                        <span className="text-gray-500 mr-2">Total de Pedidos:</span>
                        <span className="font-black text-orange-600">{historyOrders.length}</span>
                      </div>
                      <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-orange-100">
                        <span className="text-gray-500 mr-2">Valor Total:</span>
                        <span className="font-black text-orange-600">R$ {historyOrders.reduce((acc, o) => acc + o.total_amount, 0).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      <Button 
                        variant="outline"
                        onClick={printOrdersReport}
                        className="bg-white border-orange-200 text-orange-700 hover:bg-orange-50 font-bold px-6"
                      >
                        <Printer className="h-4 w-4 mr-2" /> Imprimir Relatório

                      </Button>
                      <Button
                        variant="outline"
                        onClick={printOrdersReportPrinter}
                        className="bg-white border-orange-300 text-orange-800 hover:bg-orange-50 font-bold px-6"
                      >
                        <Printer className="h-4 w-4 mr-2" /> Imprimir (Impressora)
                      </Button>
                      <Button 
                        onClick={exportOrdersReport}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 shadow-md"
                      >
                        <FileDown className="h-4 w-4 mr-2" /> Exportar CSV
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="company" className="space-y-6">
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={printCompanyReport}
                className="rounded-full gap-2"
                title="Imprimir relatório da empresa"
              >
                <Printer className="h-4 w-4" /> Relatório
              </Button>
            </div>
            <CompanyForm 
              initialData={storeSettings}
              onSaveSuccess={(newData) => {
                setStoreSettings(newData);
                setFormCompany(newData);
              }}
              imageUploading={imageUploading}
              handleLogoUpload={handleLogoUpload}
              handleLogoDelete={handleLogoDelete}
              isMenuOpen={isMenuOpen}
              savingCompany={savingCompany}
              setSavingCompany={setSavingCompany}
            />
          </TabsContent>
          
          <TabsContent value="products" className="space-y-6">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold">Cardápio</h2>
               <div className="flex items-center gap-2">
                 <Button
                   variant="outline"
                   className="rounded-full gap-2"
                   onClick={printMenuReport}
                   title="Imprimir relatório do cardápio"
                 >
                   <Printer className="h-4 w-4" /> Relatório
                 </Button>
               <Dialog open={isProductDialogOpen} onOpenChange={(open) => {
                setIsProductDialogOpen(open);
                if (!open) {
                  setEditingProduct(null);
                  setNewProduct({ 
                    name: "", 
                    description: "", 
                    price: "", 
                    category_id: "", 
                    image_url: "", 
                    active: true, 
                    sell_delivery: true,
                    sell_dine_in: true,
                    sell_digital_menu: true,
                    allow_half_half: false, 
                    allow_crust: true,
                    send_to_production: true,
                    send_to_kds: true

                  } as any);
                  setNewCategory({ name: "", order: "", image_url: "" });
                }
              }}>
                <DialogTrigger asChild>
                  <Button 
                    className="rounded-full gap-2" 
                    onClick={() => {
                      setEditingProduct(null);
                      setNewProduct({ 
                        name: "", 
                        description: "", 
                        price: "", 
                        price_2: "",
                        discount_percent: "",
                        discount_price: "",
                        category_id: "", 
                        image_url: "", 
                        active: true, 
                        is_available: true,
                        sell_delivery: true, 
                        sell_dine_in: true, 
                        sell_digital_menu: true, 
                        allow_half_half: false, 
                        allow_crust: true, 
                        send_to_production: true,
                        send_to_kds: true,
                        cest: "",
                        cst: "",
                        ncm: ""
                      } as any);
                      setNewCategory({ name: "", order: "", image_url: "" });
                    }}
                  >
                    <Plus className="h-5 w-5" /> Novo Produto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[1400px] w-[97vw] h-fit max-h-[92vh] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                  <div className="flex h-full max-h-[90vh]">
                    {/* Lateral Esquerda: Categorias para seleção rápida */}
                    <div className="w-56 bg-gradient-to-b from-orange-50 to-white border-r border-orange-100 p-4 flex flex-col gap-4">
                      <div className="flex items-center gap-2 px-2">
                        <div className="p-1.5 bg-orange-100 rounded-lg text-orange-600">
                          <List className="h-4 w-4" />
                        </div>
                        <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
                          Categorias
                        </span>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setNewProduct((prev: any) => ({ ...prev, category_id: cat.id }))}
                            className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all duration-200 ${
                              newProduct.category_id === cat.id
                                ? "bg-orange-600 text-white shadow-lg shadow-orange-200 font-bold scale-[1.02]"
                                : "hover:bg-orange-100/50 text-muted-foreground hover:text-orange-600 border border-transparent hover:border-orange-100"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <div className={`h-1.5 w-1.5 rounded-full transition-colors ${newProduct.category_id === cat.id ? "bg-card" : "bg-orange-300 group-hover:bg-orange-500"}`} />
                              <span className="truncate">{cat.name}</span>
                            </div>
                            {newProduct.category_id === cat.id && (
                              <div className="h-4 w-4 bg-card/20 rounded-full flex items-center justify-center">
                                <div className="h-1.5 w-1.5 bg-card rounded-full" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="mt-auto pt-4 border-t border-orange-100 text-[10px] text-orange-400 font-medium text-center italic">
                        Selecione a categoria desejada
                      </div>
                    </div>

                    {/* Área Principal: Formulário */}
                    <div className="flex-1 flex flex-col">
                      <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="text-xl font-bold text-orange-600">
                          {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                        </DialogTitle>
                        <DialogDescription>
                          Preencha os detalhes abaixo para {editingProduct ? 'atualizar' : 'adicionar'} ao cardápio.
                        </DialogDescription>
                      </DialogHeader>

                      <Tabs value={productDialogTab} onValueChange={setProductDialogTab} className="flex-1 flex flex-col h-full overflow-hidden">
                        <div className="px-6 border-b border-orange-100 bg-orange-50/30">
                          <TabsList className="bg-transparent border-none p-0 h-12 gap-6">
                            <TabsTrigger 
                              value="geral" 
                              className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs font-bold uppercase tracking-wider"
                            >
                              Dados Gerais
                            </TabsTrigger>
                            {(newProduct as any).product_type !== 'INGREDIENTE' && (
                              <TabsTrigger 
                                value="impostos" 
                                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs font-bold uppercase tracking-wider"
                              >
                                Impostos
                              </TabsTrigger>
                            )}
                            {((newProduct as any).product_type === 'VENDA' || (newProduct as any).product_type === 'AMBOS' || !((newProduct as any).product_type)) && (
                              <TabsTrigger 
                                value="ficha" 
                                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs font-bold uppercase tracking-wider"
                              >
                                Ficha Técnica
                              </TabsTrigger>
                            )}
                            {editingProduct?.id && (newProduct as any).control_inventory && (
                              <TabsTrigger
                                value="movimentacoes"
                                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs font-bold uppercase tracking-wider"
                              >
                                Movimentação do Estoque
                              </TabsTrigger>
                            )}
                          </TabsList>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                          <TabsContent value="geral" className="mt-0 space-y-6">
                            <div className="space-y-2">
                              <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Tipo de Produto</Label>
                              <Select
                                value={(newProduct as any).product_type || "VENDA"}
                                onValueChange={(v) => setNewProduct({ ...newProduct, product_type: v } as any)}
                              >
                                <SelectTrigger className="h-11 border-orange-100 bg-orange-50/30 focus:ring-orange-500">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="VENDA">Venda (cardápio)</SelectItem>
                                  <SelectItem value="INGREDIENTE">Ingrediente (matéria-prima)</SelectItem>
                                  <SelectItem value="AMBOS">Ambos</SelectItem>
                                  <SelectItem value="SERVICO">Serviço</SelectItem>
                                </SelectContent>
                              </Select>
                              <p className="text-[10px] text-muted-foreground">
                                Ingredientes aparecem apenas na tela <b>Insumos</b>. "Ambos" aparece nos dois lugares.
                              </p>
                            </div>
                            {(newProduct as any).product_type === 'INGREDIENTE' && (
                              <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-5 flex items-start gap-3">
                                <div className="text-3xl">🌾</div>
                                <div className="space-y-1">
                                  <p className="text-sm font-bold text-amber-800">Modo simplificado: matéria-prima</p>
                                  <p className="text-xs text-amber-700/90 leading-relaxed">
                                    Ingredientes precisam só de <b>nome</b> e <b>descrição</b> aqui. Custo, rendimento, perda, fornecedor e estoque são configurados na tela <b>Insumos</b>, onde tudo cabe numa tabela só. Nada de preço, canais de venda, imposto ou imagem — foco no que importa. 🎯
                                  </p>
                                </div>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Nome do Produto</Label>
                            <Input 
                              placeholder="Ex: Pizza de Calabresa"
                              value={newProduct.name} 
                              onChange={e => setNewProduct({...newProduct, name: e.target.value})} 
                              className="focus-visible:ring-orange-500"
                            />

                            {/* Preview visual do produto */}
                            <div className="mt-4 rounded-2xl overflow-hidden border-2 border-dashed border-orange-100 bg-gradient-to-br from-orange-50/40 to-white shadow-inner">
                              <div className="relative aspect-square w-full bg-orange-50/30 flex items-center justify-center">
                                {newProduct.image_url ? (
                                  <>
                                    <img
                                      src={cldThumb(newProduct.image_url, 600)}
                                      alt={newProduct.name || "Produto"}
                                      className="absolute inset-0 h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                      <p className="text-white font-black text-lg tracking-tight drop-shadow-lg truncate">
                                        {newProduct.name || "Sem nome"}
                                      </p>
                                      {newProduct.price && (
                                        <p className="text-orange-300 font-bold text-sm mt-0.5 drop-shadow">
                                          R$ {Number(String(newProduct.price).replace(',', '.')).toFixed(2)}
                                        </p>
                                      )}
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex flex-col items-center gap-2 text-orange-300 p-6 text-center">
                                    <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
                                      <ImageIcon className="h-8 w-8" />
                                    </div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-orange-500/70">
                                      Sem imagem
                                    </p>
                                    <p className="text-[10px] text-muted-foreground max-w-[180px]">
                                      Envie uma foto no campo <b>Imagem do Produto</b> ao lado para visualizar aqui.
                                    </p>
                                  </div>
                                )}
                              </div>
                              {newProduct.image_url && (
                                <div className="p-2 bg-white/80 backdrop-blur border-t border-orange-100 flex items-center justify-between text-[10px] uppercase font-bold tracking-wider">
                                  <span className="text-muted-foreground">Prévia do cardápio</span>
                                  <span className="text-orange-600">{(newProduct as any).product_type || "VENDA"}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {(newProduct as any).product_type !== 'INGREDIENTE' && (
                          <>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-xl border-2 border-dashed border-orange-100 bg-orange-50/20">
                              <div className="space-y-0.5">
                                <Label className="text-xs font-bold uppercase text-orange-700">Produto é Pizza?</Label>
                                <p className="text-[10px] text-orange-600/70">Ativa opções de Meio-a-Meio e Tamanhos</p>
                              </div>
                              <Switch 
                                checked={newProduct.is_pizza_flavor} 
                                onCheckedChange={checked => setNewProduct({...newProduct, is_pizza_flavor: checked, allow_half_half: checked})} 
                              />
                            </div>
                            
                            <div className="flex items-center justify-between p-3 rounded-xl border-2 border-dashed border-red-100 bg-red-50/20">
                              <div className="space-y-0.5">
                                <Label className="text-xs font-bold uppercase text-red-700">Produto Promocional?</Label>
                                <p className="text-[10px] text-red-600/70">Aparece primeiro no cardápio digital</p>
                              </div>
                              <Switch 
                                checked={newProduct.is_promotional} 
                                onCheckedChange={checked => setNewProduct({...newProduct, is_promotional: checked})} 
                              />
                            </div>

                            {(newProduct as any).product_type !== 'INGREDIENTE' && (newProduct.is_pizza_flavor ? (
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Preço Broto (R$)</Label>
                                  <div className="relative">
                                    <Input 
                                      type="number" 
                                      placeholder="0,00"
                                      value={newProduct.size_prices?.Broto || ""} 
                                      onChange={e => setNewProduct({
                                        ...newProduct, 
                                        size_prices: { ...newProduct.size_prices, Broto: e.target.value }
                                      })} 
                                      className="h-11 text-sm font-bold focus-visible:ring-orange-500 border-orange-100 bg-orange-50/30"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Preço Grande (R$)</Label>
                                  <div className="relative">
                                    <Input 
                                      type="number" 
                                      placeholder="0,00"
                                      value={newProduct.size_prices?.Grande || ""} 
                                      onChange={e => setNewProduct({
                                        ...newProduct, 
                                        size_prices: { ...newProduct.size_prices, Grande: e.target.value }
                                      })} 
                                      className="h-11 text-sm font-bold focus-visible:ring-orange-500 border-orange-100 bg-orange-50/30"
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Preço de Venda (R$)</Label>
                                <Input 
                                  type="number" 
                                  placeholder="0,00"
                                  value={newProduct.price} 
                                  onChange={e => setNewProduct({...newProduct, price: e.target.value})} 
                                  className="h-11 text-sm font-bold focus-visible:ring-orange-500 border-orange-100 bg-orange-50/30"
                                />
                              </div>
                            ))}
                            {(newProduct as any).product_type !== 'INGREDIENTE' && !newProduct.is_pizza_flavor && (
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Preço 2 (R$)</Label>
                                  <Input
                                    type="number"
                                    placeholder="Opcional"
                                    value={newProduct.price_2 ?? ""}
                                    onChange={e => setNewProduct({...newProduct, price_2: e.target.value})}
                                    className="h-11 text-sm font-bold focus-visible:ring-orange-500 border-orange-100 bg-orange-50/30"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs font-bold uppercase text-green-700 tracking-wider">Preço Promocional (R$)</Label>
                                  <Input
                                    type="number"
                                    placeholder="Opcional"
                                    value={newProduct.discount_price ?? ""}
                                    onChange={e => setNewProduct({...newProduct, discount_price: e.target.value})}
                                    className="h-11 text-sm font-bold focus-visible:ring-green-500 border-green-200 bg-green-50/30"
                                  />
                                </div>
                              </div>
                            )}
                            {((newProduct as any).product_type === 'INGREDIENTE' || (newProduct as any).product_type === 'AMBOS') && (
                              <div className="rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/40 p-3 text-[11px] text-amber-800">
                                💡 Campos de matéria-prima (custo, rendimento, perda, estoque, fornecedor) são editados na tela <b>Insumos</b>.
                              </div>
                            )}
                          </div>
                          {!newProduct.is_pizza_flavor && !newProduct.allow_half_half && (
                            <div className="space-y-2 mt-3">
                              <Label className="text-xs font-bold uppercase text-green-700 tracking-wider flex items-center gap-1">
                                💸 Desconto (%) <span className="text-[10px] font-normal text-muted-foreground normal-case">— aparece em verde no cardápio (apenas produtos sem divisão de tamanho)</span>
                              </Label>
                              <Input 
                                type="number" 
                                min="0"
                                max="99"
                                step="1"
                                placeholder="Ex: 10 para 10% de desconto. Deixe vazio para não aplicar."
                                value={newProduct.discount_percent ?? ""} 
                                onChange={e => setNewProduct({...newProduct, discount_percent: e.target.value})} 
                                className="h-11 text-sm font-bold focus-visible:ring-green-500 border-green-200 bg-green-50/30"
                              />
                            </div>
                          )}
                          </>
                          )}
                        </div>



                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase text-muted-foreground">Descrição / Ingredientes</Label>
                          <Textarea 
                            placeholder="Descreva o produto..."
                            value={newProduct.description} 
                            onChange={e => setNewProduct({...newProduct, description: e.target.value})} 
                            className="min-h-[80px] focus-visible:ring-orange-500"
                          />
                        </div>

                        {(newProduct as any).product_type !== 'INGREDIENTE' && (
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Configurações Rápidas</Label>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2 bg-muted/30 p-2 rounded-lg border border-transparent hover:border-blue-100 transition-all">
                                <input 
                                  type="checkbox" 
                                  id="allow_half_half" 
                                  checked={newProduct.allow_half_half} 
                                  onChange={e => setNewProduct({...newProduct, allow_half_half: e.target.checked})}
                                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <Label htmlFor="allow_half_half" className="text-xs cursor-pointer">Permitir 2 sabores (1/2)</Label>
                              </div>
                              <div className="flex items-center space-x-2 bg-muted/30 p-2 rounded-lg border border-transparent hover:border-blue-100 transition-all">
                                <input 
                                  type="checkbox" 
                                  id="allow_crust" 
                                  checked={newProduct.allow_crust === true} 
                                  onChange={e => setNewProduct({...newProduct, allow_crust: e.target.checked})}
                                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <Label htmlFor="allow_crust" className="text-xs cursor-pointer">Permitir Bordas</Label>
                              </div>
                              <div className="flex items-center space-x-2 bg-muted/30 p-2 rounded-lg border border-transparent hover:border-orange-100 transition-all">
                                <input 
                                  type="checkbox" 
                                  id="send_to_production" 
                                  checked={(newProduct as any).send_to_production !== false} 
                                  onChange={e => setNewProduct({...newProduct, send_to_production: e.target.checked} as any)}
                                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                />
                                <Label htmlFor="send_to_production" className="text-xs cursor-pointer">Imprimir na Cozinha</Label>
                              </div>
                              <div className="flex items-center space-x-2 bg-muted/30 p-2 rounded-lg border border-transparent hover:border-orange-100 transition-all">
                                <input 
                                  type="checkbox" 
                                  id="send_to_kds" 
                                  checked={(newProduct as any).send_to_kds !== false} 
                                  onChange={e => setNewProduct({...newProduct, send_to_kds: e.target.checked} as any)}
                                  className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                                <Label htmlFor="send_to_kds" className="text-xs cursor-pointer">Exibir no KDS</Label>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Status e Canais de Venda</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <div className={`flex items-center gap-2 p-2 rounded-lg border text-[10px] font-bold cursor-pointer transition-all ${newProduct.active ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                                onClick={() => setNewProduct((prev: any) => ({...prev, active: !prev.active}))}>
                                {newProduct.active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                                ATIVO
                              </div>
                              <div className={`flex items-center gap-2 p-2 rounded-lg border text-[10px] font-bold cursor-pointer transition-all ${newProduct.is_available !== false ? 'bg-lime-50 border-lime-200 text-lime-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                                onClick={() => setNewProduct((prev: any) => ({...prev, is_available: prev.is_available === false}))}>
                                {newProduct.is_available !== false ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                                DISPONÍVEL
                              </div>
                              <div className={`flex items-center gap-2 p-2 rounded-lg border text-[10px] font-bold cursor-pointer transition-all ${newProduct.sell_delivery ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                                onClick={() => setNewProduct((prev: any) => ({...prev, sell_delivery: !prev.sell_delivery}))}>
                                {newProduct.sell_delivery ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                                DELIVERY (WEB)
                              </div>
                              <div className={`flex items-center gap-2 p-2 rounded-lg border text-[10px] font-bold cursor-pointer transition-all ${newProduct.sell_digital_menu ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                                onClick={() => setNewProduct((prev: any) => ({...prev, sell_digital_menu: !prev.sell_digital_menu}))}>
                                {newProduct.sell_digital_menu ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                                MESA DIGITAL
                              </div>
                              <div className={`flex items-center gap-2 p-2 rounded-lg border text-[10px] font-bold cursor-pointer transition-all ${newProduct.sell_dine_in ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                                onClick={() => setNewProduct((prev: any) => ({...prev, sell_dine_in: !prev.sell_dine_in}))}>
                                {newProduct.sell_dine_in ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                                SALÃO (MANUAL)
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3 p-3 rounded-lg border-2 border-dashed border-orange-100 bg-orange-50/20">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="control_inventory"
                                checked={!!(newProduct as any).control_inventory}
                                onChange={e => setNewProduct({ ...newProduct, control_inventory: e.target.checked } as any)}
                                className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                              />
                              <Label htmlFor="control_inventory" className="text-xs font-bold cursor-pointer uppercase tracking-wider">
                                Controlar estoque deste produto
                              </Label>
                            </div>
                            {(newProduct as any).control_inventory && (
                              <>
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <Label className="text-[10px] uppercase text-muted-foreground">Unidade</Label>
                                  <Input
                                    value={(newProduct as any).unit || ""}
                                    onChange={e => setNewProduct({ ...newProduct, unit: e.target.value } as any)}
                                    placeholder="un, kg, ml..."
                                  />
                                </div>
                                <div>
                                  <Label className="text-[10px] uppercase text-muted-foreground">Estoque mínimo</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={(newProduct as any).minimum_stock ?? ""}
                                    onChange={e => setNewProduct({ ...newProduct, minimum_stock: e.target.value } as any)}
                                  />
                                </div>
                                <div>
                                  <Label className="text-[10px] uppercase text-muted-foreground">Custo unitário (R$)</Label>
                                  <Input
                                    type="number"
                                    step="0.0001"
                                    value={(newProduct as any).cost_per_unit ?? ""}
                                    onChange={e => setNewProduct({ ...newProduct, cost_per_unit: e.target.value } as any)}
                                    placeholder="0,00"
                                  />
                                </div>
                              </div>
                              <p className="text-[10px] text-muted-foreground italic">
                                O saldo atual é gerido pelas movimentações (entrada/saída/ajuste) no módulo Estoque.
                              </p>
                              </>
                            )}
                          </div>
                        </div>
                        )}


                        {(newProduct as any).product_type !== 'INGREDIENTE' && (
                        <div className="space-y-4 p-4 rounded-xl border-2 border-dashed border-blue-100 bg-blue-50/10">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                              <Plus className="h-4 w-4" />
                            </div>
                            <Label className="text-xs font-black uppercase text-blue-700 tracking-wider">Produtos Sugeridos (Cross-sell)</Label>
                          </div>
                          <p className="text-[10px] text-blue-600/70 -mt-2">Selecione produtos para sugerir quando este for escolhido no atendimento ou delivery.</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                            {products.filter(p => p.id !== editingProduct?.id).map(p => (
                              <div 
                                key={p.id}
                                onClick={() => {
                                  const current = newProduct.suggested_products || [];
                                  const next = current.includes(p.id) 
                                    ? current.filter((id: string) => id !== p.id)
                                    : [...current, p.id];
                                  setNewProduct({...newProduct, suggested_products: next});
                                }}
                                className={`flex items-center gap-2 p-2 rounded-lg border text-[10px] cursor-pointer transition-all ${
                                  (newProduct.suggested_products || []).includes(p.id)
                                    ? "bg-blue-600 border-blue-600 text-white font-bold"
                                    : "bg-card border-gray-100 text-gray-600 hover:border-blue-200"
                                }`}
                              >
                                <div className={`h-1.5 w-1.5 rounded-full ${
                                  (newProduct.suggested_products || []).includes(p.id) ? "bg-card" : "bg-blue-300"
                                }`} />
                                <span className="truncate">{p.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        )}


                        {(newProduct as any).product_type !== 'INGREDIENTE' && (
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase text-muted-foreground">Imagem do Produto</Label>
                          <div className="flex gap-4 items-center">
                            <div className="h-20 w-20 rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/30 flex items-center justify-center overflow-hidden shrink-0">
                              {newProduct.image_url ? (
                                <img src={cldThumb(newProduct.image_url, 200)} alt="Preview" className="h-full w-full object-cover" />
                              ) : (
                                <Plus className="h-6 w-6 text-orange-200" />
                              )}
                            </div>
                            <div className="flex-1 flex gap-2">
                              <Input 
                                placeholder="URL da imagem..."
                                value={newProduct.image_url} 
                                onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} 
                                className="h-9 text-xs focus-visible:ring-orange-500"
                              />
                              <div className="relative">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  onChange={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const input = e.currentTarget;
                                    const file = input?.files?.[0];
                                    if (!file) return;
                                    try {
                                      setImageUploading(true);
                                      const publicUrl = await uploadMenuImage(file, 'prod', 1000);
                                      setNewProduct((current: any) => ({...current, image_url: publicUrl}));
                                      toast.success("Imagem enviada!");
                                    } catch (error: any) {
                                      console.error('[upload produto]', error);
                                      toast.error("Erro no upload: " + (error?.message || 'falha desconhecida'));
                                    } finally {
                                      setImageUploading(false);
                                      try { if (input) input.value = ''; } catch {}
                                    }
                                  }}
                                />
                                <Button variant="outline" type="button" size="sm" disabled={imageUploading} className="h-9 border-orange-200 text-orange-600 hover:bg-orange-50">
                                  {imageUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                </Button>
                              </div>
                              {newProduct.image_url && (
                                <Button 
                                  variant="outline" 
                                  type="button" 
                                  size="sm" 
                                  className="h-9 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => {
                                    setNewProduct((prev: any) => ({ ...prev, image_url: "" }));
                                    toast.success("Imagem removida do produto");
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        )}
                          </TabsContent>

                          <TabsContent value="impostos" className="mt-0 space-y-6">
                            <div className="bg-blue-50/30 border-2 border-dashed border-blue-100 p-6 rounded-2xl space-y-4">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                                  <FileText className="h-4 w-4" />
                                </div>
                                <h3 className="text-sm font-black uppercase text-blue-700 tracking-wider">Informações Tributárias</h3>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">CEST</Label>
                                    <span className="text-[9px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded italic">7 dígitos</span>
                                  </div>
                                  <Input 
                                    placeholder="0000000"
                                    maxLength={7}
                                    value={newProduct.cest || ""} 
                                    onChange={e => setNewProduct({...newProduct, cest: e.target.value.replace(/\D/g, "")})} 
                                    className="h-9 text-xs focus-visible:ring-blue-500 border-blue-100"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">CST</Label>
                                    <span className="text-[9px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded italic">3 dígitos</span>
                                  </div>
                                  <Input 
                                    placeholder="000"
                                    maxLength={3}
                                    value={newProduct.cst || ""} 
                                    onChange={e => setNewProduct({...newProduct, cst: e.target.value.replace(/\D/g, "")})} 
                                    className="h-9 text-xs focus-visible:ring-blue-500 border-blue-100"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">NCM</Label>
                                    <span className="text-[9px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded italic">8 dígitos</span>
                                  </div>
                                  <Input 
                                    placeholder="00000000"
                                    maxLength={8}
                                    value={newProduct.ncm || ""} 
                                    onChange={e => setNewProduct({...newProduct, ncm: e.target.value.replace(/\D/g, "")})} 
                                    className="h-9 text-xs focus-visible:ring-blue-500 border-blue-100"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Unidade</Label>
                                  <Input
                                    placeholder="Ex: UN, KG, L, M"
                                    value={newProduct.unidade ?? "UN"}
                                    onChange={e => setNewProduct({ ...newProduct, unidade: e.target.value.toUpperCase() })}
                                    className="h-9 text-xs focus-visible:ring-blue-500 border-blue-100"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Tipo do Produto</Label>
                                  <Select
                                    value={newProduct.tipo_produto || "MERCADORIA"}
                                    onValueChange={(v) => setNewProduct({ ...newProduct, tipo_produto: v })}
                                  >
                                    <SelectTrigger className="h-9 text-xs border-blue-100"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="MERCADORIA">Mercadoria</SelectItem>
                                      <SelectItem value="SE-SERVICOS">Serviço (IBS Municipal)</SelectItem>
                                      <SelectItem value="SERVICO">Serviço</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-1 md:col-span-3">
                                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Perfil Tributário</Label>
                                  <Select
                                    value={newProduct.tax_rule_id || "__none__"}
                                    onValueChange={(v) => setNewProduct({ ...newProduct, tax_rule_id: v === "__none__" ? "" : v })}
                                  >
                                    <SelectTrigger className="h-9 text-xs border-blue-100"><SelectValue placeholder="Selecione um perfil..." /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="__none__">Selecione um perfil...</SelectItem>
                                      {productTaxRules.map(rule => (
                                        <SelectItem key={rule.id} value={rule.id}>{rule.nome}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                          {productDialogTab === 'ficha' && (
                            <TabsContent value="ficha" className="mt-0" forceMount>
                              <FichaTecnicaEditor
                                productId={editingProduct?.id || null}
                                productType={(newProduct as any).product_type || 'VENDA'}
                                packagingCost={Number((newProduct as any).packaging_cost || 0)}
                                energyCost={Number((newProduct as any).energy_cost || 0)}
                                laborCost={Number((newProduct as any).labor_cost || 0)}
                                enabled={productDialogTab === 'ficha'}
                                salePrice={newProduct.price}
                                onApplySuggestedPrice={(p) => setNewProduct({ ...newProduct, price: String(p) } as any)}
                                onCostsChange={(patch) => setNewProduct({ ...newProduct, ...patch } as any)}
                              />
                            </TabsContent>
                          )}
                          {editingProduct?.id && (newProduct as any).control_inventory && (
                            <TabsContent value="movimentacoes" className="mt-0">
                              <ProductMovementsView
                                productId={editingProduct.id}
                                unit={(newProduct as any).unit}
                              />
                            </TabsContent>
                          )}
                        </div>
                      </Tabs>

                      <div className="p-6 pt-2 bg-gray-50/50 border-t flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => setIsProductDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button className="flex-1 bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-200" disabled={loading || imageUploading} onClick={async () => {
                          if (imageUploading) {
                            toast.info("Aguarde a imagem terminar de carregar antes de salvar.");
                            return;
                          }
                          const isPizza = newProduct.is_pizza_flavor;
                          const productType = (newProduct as any).product_type || "VENDA";
                          const isIngredient = productType === "INGREDIENTE";
                          const priceValue = isPizza ? (newProduct.size_prices?.Grande || newProduct.size_prices?.Broto || "0") : newProduct.price;

                          if (!newProduct.name) { toast.error("Preencha o nome."); return; }
                          if (!isIngredient && !priceValue) { toast.error("Preencha o preço."); return; }
                          if (!newProduct.category_id) { toast.error("Selecione uma categoria."); return; }
                          
                          const payload = {
                            name: newProduct.name,
                            price: isIngredient ? 0 : parseFloat(priceValue),
                            price_2: newProduct.price_2 !== "" && newProduct.price_2 != null ? parseFloat(String(newProduct.price_2).replace(',', '.')) : null,
                            description: newProduct.description,
                            category_id: newProduct.category_id,
                            image_url: newProduct.image_url ? String(newProduct.image_url).trim() : null,
                            active: newProduct.active !== false,
                            is_available: newProduct.is_available !== false,
                            sell_delivery: newProduct.sell_delivery !== false,
                            sell_dine_in: newProduct.sell_dine_in !== false,
                            sell_digital_menu: newProduct.sell_digital_menu !== false,
                            allow_half_half: newProduct.allow_half_half,
                            allow_crust: newProduct.allow_crust === true,
                            is_pizza_flavor: newProduct.is_pizza_flavor,
                            is_promotional: newProduct.is_promotional || false,
                            suggested_products: newProduct.suggested_products || [],
                            size_prices: newProduct.is_pizza_flavor ? {
                              "Broto": newProduct.size_prices?.Broto || null,
                              "Grande": newProduct.size_prices?.Grande || null
                            } : null,
                            send_to_production: (newProduct as any).send_to_production !== false,
                            send_to_kds: (newProduct as any).send_to_kds !== false,
                            cest: newProduct.cest || null,
                            cst: newProduct.cst || null,
                            ncm: newProduct.ncm || null,
                            unidade: newProduct.unidade || "UN",
                            tipo_produto: newProduct.tipo_produto || "MERCADORIA",
                            product_type: productType,
                            tax_rule_id: newProduct.tax_rule_id || null,
                            discount_price: newProduct.discount_price !== "" && newProduct.discount_price != null ? parseFloat(String(newProduct.discount_price).replace(',', '.')) : null,
                            discount_percent: newProduct.discount_percent !== "" && newProduct.discount_percent != null ? parseFloat(String(newProduct.discount_percent).replace(',', '.')) : null,
                            control_inventory: !!(newProduct as any).control_inventory,
                            unit: (newProduct as any).control_inventory ? ((newProduct as any).unit || "un") : ((newProduct as any).unit || null),
                            minimum_stock: (newProduct as any).control_inventory && (newProduct as any).minimum_stock !== "" && (newProduct as any).minimum_stock != null
                              ? parseFloat(String((newProduct as any).minimum_stock).replace(',', '.')) : null,
                            cost_per_unit: (newProduct as any).cost_per_unit !== "" && (newProduct as any).cost_per_unit != null
                              ? parseFloat(String((newProduct as any).cost_per_unit).replace(',', '.')) : null
                          };

                          const finalPayload = payload;

                          try {
                            setLoading(true);
                             const { error } = editingProduct 
                               ? await supabase.from("products").update(finalPayload as any).eq("id", editingProduct.id)
                               : await supabase.from("products").insert([finalPayload as any]);
                            
                            if (error) {
                              console.error("Erro ao salvar produto:", error);
                              toast.error("Erro ao salvar: " + error.message);
                            } else {
                              toast.success(editingProduct ? "Produto atualizado!" : "Produto criado!");
                              setNewProduct({ 
                                name: "", 
                                description: "", 
                                price: "", 
                                 price_2: "",
                                 discount_percent: "",
                                 discount_price: "",
                                category_id: "", 
                                image_url: "", 
                                active: true, 
                                 is_available: true,
                                sell_delivery: true,
                                sell_dine_in: true,
                                sell_digital_menu: true,
                                allow_half_half: false, 
                                send_to_production: true,
                                send_to_kds: true,
                                is_pizza_flavor: false,
                                size_prices: { "Broto": "", "Grande": "" }
                              } as any);
                              setEditingProduct(null);
                              setIsProductDialogOpen(false);
                              await fetchData(true, true);
                            }
                          } catch (e: any) {
                            console.error("Catch save product:", e);
                            toast.error("Erro inesperado: " + (e.message || "Verifique sua conexão"));
                          } finally {
                            setLoading(false);
                          }
                        }}>
                          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          {editingProduct ? 'Salvar Alterações' : 'Criar Produto'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              </div>
            </div>


              <div className="flex flex-col lg:flex-row gap-6">
                {/* Barra Lateral de Categorias */}
                <div className="w-full lg:w-64 space-y-4">
                  <div className="bg-card p-4 rounded-xl border border-orange-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-orange-600 uppercase tracking-wider">Categorias</h3>
                      <Badge variant="secondary" className="bg-orange-50 text-orange-600">{categories.length}</Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <button
                        onClick={() => setProductCategoryFilter("all")}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                          productCategoryFilter === "all" 
                            ? "bg-orange-600 text-white shadow-md shadow-orange-200" 
                            : "hover:bg-orange-50 text-muted-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          <span>Todas</span>
                        </div>
                        <span className={productCategoryFilter === "all" ? "text-white/70" : "text-muted-foreground/50"}>
                          {products.length}
                        </span>
                      </button>

                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setProductCategoryFilter(cat.id);
                            setNewProduct((prev: any) => ({ ...prev, category_id: cat.id }));
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all group ${
                            productCategoryFilter === cat.id 
                              ? "bg-orange-600 text-white shadow-md shadow-orange-200" 
                              : "hover:bg-orange-50 text-muted-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <List className="h-4 w-4" />
                            <span className="truncate">{cat.name}</span>
                          </div>
                          <span className={productCategoryFilter === cat.id ? "text-white/70" : "text-muted-foreground/50 text-xs"}>
                            {products.filter(p => p.category_id === cat.id).length}
                          </span>
                        </button>
                      ))}
                    </div>

                    <Button 
                      className="w-full mt-4 bg-orange-50 text-orange-600 hover:bg-orange-100 border-dashed border-orange-200"
                      variant="outline"
                      onClick={() => {
                        if (productCategoryFilter !== "all") {
                          setNewProduct((prev: any) => ({ 
                            ...prev, 
                            category_id: productCategoryFilter,
                            name: "",
                            description: "",
                            price: ""
                          }));
                          setIsProductDialogOpen(true);
                        } else {
                          toast.info("Selecione uma categoria ao lado para criar o produto nela.");
                        }
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Produto {productCategoryFilter !== "all" ? "na Categoria" : ""}
                    </Button>
                  </div>
                </div>

                {/* Área Principal de Produtos */}
                <div className="flex-1 space-y-6">
                  <div className="bg-card p-4 rounded-xl border border-orange-100 shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Pesquisar por nome ou descrição..." 
                          className="pl-10 h-11 border-orange-50 focus:border-orange-500 focus:ring-orange-500/10 transition-all rounded-lg"
                          value={orderProductSearch}
                          onChange={(e) => setOrderProductSearch(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Select value={productStatusFilter} onValueChange={(v: any) => setProductStatusFilter(v)}>
                          <SelectTrigger className="w-[140px] h-11 border-orange-50">
                            <div className="flex items-center gap-2">
                              <Info className="h-4 w-4 text-orange-500" />
                              <SelectValue placeholder="Status" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos Status</SelectItem>
                            <SelectItem value="active">Apenas Ativos</SelectItem>
                            <SelectItem value="inactive">Apenas Inativos</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mr-2">Visualizando:</span>
                      <Badge 
                        variant="outline" 
                        className="bg-orange-50 text-orange-700 border-orange-100"
                      >
                        {productCategoryFilter === "all" ? "Todos os Produtos" : `Categoria: ${categories.find(c => c.id === productCategoryFilter)?.name}`}
                      </Badge>
                      {orderProductSearch && (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
                          Busca: {orderProductSearch}
                        </Badge>
                      )}
                      <span className="ml-auto text-xs text-muted-foreground font-medium">
                        {products.filter(p => {
                          const matchesSearch = !orderProductSearch || 
                            p.name.toLowerCase().includes(orderProductSearch.toLowerCase()) || 
                            p.description?.toLowerCase().includes(orderProductSearch.toLowerCase());
                          const matchesStatus = productStatusFilter === "all" || (productStatusFilter === "active" ? p.active : !p.active);
                          const matchesCategory = productCategoryFilter === "all" || p.category_id === productCategoryFilter;
                          return matchesSearch && matchesStatus && matchesCategory;
                        }).length} itens
                      </span>
                    </div>
                  </div>
                  
                  <Card className="overflow-hidden border-orange-100 shadow-lg">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-orange-50/50">
                          <TableHead className="w-[80px]">Imagem</TableHead>
                          <TableHead>Produto</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Canais de Venda</TableHead>
                          <TableHead>Preço</TableHead>
                          <TableHead>Estoque</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products
                          .filter(p => {
                            const matchesSearch = !orderProductSearch || 
                              p.name.toLowerCase().includes(orderProductSearch.toLowerCase()) || 
                              p.description?.toLowerCase().includes(orderProductSearch.toLowerCase());
                            const matchesStatus = productStatusFilter === "all" || (productStatusFilter === "active" ? p.active : !p.active);
                            const matchesCategory = productCategoryFilter === "all" || p.category_id === productCategoryFilter;
                            return matchesSearch && matchesStatus && matchesCategory;
                          })
                          .sort((a, b) => ((a as any).categories?.name || '').localeCompare((b as any).categories?.name || ''))
                          .map(p => (
                          <TableRow key={p.id} className="hover:bg-orange-50/20 transition-colors">
                            <TableCell>
                        <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden border shadow-sm">
                          {p.image_url ? (
                            <img src={cldThumb(p.image_url, 96)} loading="lazy" className="h-full w-full object-cover" alt={p.name} />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-orange-50 text-orange-200">
                              <Package className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="text-sm font-bold">{p.name}</div>
                        {p.description && <div className="text-[10px] text-muted-foreground truncate max-w-[200px]">{p.description}</div>}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="secondary" className="text-[10px] font-medium bg-gray-100">
                            {(p as any).categories?.name || '-'}
                          </Badge>
                          {p.is_promotional && (
                            <Badge variant="default" className="text-[9px] font-black bg-orange-500 text-white border-none uppercase">
                              🔥 PROMO
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <div 
                            className={`flex items-center gap-1 cursor-pointer select-none px-2 py-0.5 rounded-md border transition-all ${p.sell_delivery ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-50 text-gray-400 border-gray-200 opacity-60"}`}
                            onClick={async () => {
                              const { error } = await supabase.from("products").update({ sell_delivery: !p.sell_delivery }).eq("id", p.id);
                              if (error) toast.error(error.message);
                              else fetchData(true, true);
                            }}
                            title="Vender no Delivery (Web Online)"
                          >
                            {p.sell_delivery ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                            <span className="text-[9px] font-bold uppercase">Delivery</span>
                          </div>

                          <div 
                            className={`flex items-center gap-1 cursor-pointer select-none px-2 py-0.5 rounded-md border transition-all ${p.sell_digital_menu ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-gray-50 text-gray-400 border-gray-200 opacity-60"}`}
                            onClick={async () => {
                              const { error } = await supabase.from("products").update({ sell_digital_menu: !p.sell_digital_menu }).eq("id", p.id);
                              if (error) toast.error(error.message);
                              else fetchData(true, true);
                            }}
                            title="Cardápio Digital (Mesa/Local)"
                          >
                            {p.sell_digital_menu ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                            <span className="text-[9px] font-bold uppercase">Mesa</span>
                          </div>

                          <div 
                            className={`flex items-center gap-1 cursor-pointer select-none px-2 py-0.5 rounded-md border transition-all ${p.sell_dine_in ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-400 border-gray-200 opacity-60"}`}
                            onClick={async () => {
                              const { error } = await supabase.from("products").update({ sell_dine_in: !p.sell_dine_in }).eq("id", p.id);
                              if (error) toast.error(error.message);
                              else fetchData(true, true);
                            }}
                            title="Vender no Salão (Pedidos Manuais)"
                          >
                            {p.sell_dine_in ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                            <span className="text-[9px] font-bold uppercase">Salão</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">
                        {p.is_pizza_flavor && p.size_prices ? (
                          <div className="flex flex-col text-[10px] gap-0.5">
                            <span className="text-orange-600">B: R$ {Number(p.size_prices.Broto || 0).toFixed(2)}</span>
                            <span className="text-orange-600">G: R$ {Number(p.size_prices.Grande || 0).toFixed(2)}</span>
                          </div>
                        ) : (
                          <span className="text-orange-600">R$ {Number(p.price).toFixed(2)}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {(p as any).control_inventory ? (() => {
                          const stock = Number((p as any).current_stock ?? 0);
                          const minStock = Number((p as any).minimum_stock ?? 0);
                          const unit = (p as any).unit || "un";
                          const cls = stock < 0
                            ? "bg-red-200 text-red-800 border-red-300"
                            : stock === 0
                              ? "bg-red-100 text-red-700 border-red-200"
                              : stock <= minStock
                                ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                : "bg-green-100 text-green-700 border-green-200";
                          return (
                            <Badge variant="outline" className={`${cls} font-bold`}>
                              {stock < 0 && <span className="mr-1">⚠️</span>}
                              {stock.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} {unit}
                            </Badge>
                          );
                        })() : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div 
                          className={`flex items-center gap-2 cursor-pointer select-none px-2 py-1 rounded-full w-fit transition-all ${p.active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"}`}
                          onClick={async () => {
                            const { error } = await supabase.from("products").update({ active: !p.active }).eq("id", p.id);
                            if (error) toast.error(error.message);
                            else fetchData(true, true);
                          }}
                        >
                          {p.active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                          <span className="text-[10px] font-bold uppercase tracking-wider">{p.active ? "Ativo" : "Inativo"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => {
                            setEditingProduct(p);
                            setNewProduct({
                              name: p.name,
                              description: p.description || "",
                              price: p.price.toString(),
                              price_2: (p as any).price_2 != null ? String((p as any).price_2) : "",
                              discount_percent: (p as any).discount_percent != null ? String((p as any).discount_percent) : "",
                              discount_price: (p as any).discount_price != null ? String((p as any).discount_price) : "",
                              category_id: p.category_id || "",
                              image_url: p.image_url || "",
                              active: p.active !== false,
                              is_available: (p as any).is_available !== false,
                              sell_delivery: p.sell_delivery !== false,
                              sell_dine_in: p.sell_dine_in !== false,
                              sell_digital_menu: p.sell_digital_menu !== false,
                              allow_half_half: p.allow_half_half || false,
                              allow_crust: (p as any).allow_crust === true,
                              is_pizza_flavor: p.is_pizza_flavor || false,
                              size_prices: p.size_prices || { "Broto": "", "Grande": "" },
                               is_promotional: p.is_promotional || false,
                               suggested_products: p.suggested_products || [],
                               send_to_production: (p as any).send_to_production !== false,
                               send_to_kds: (p as any).send_to_kds !== false,
                               cest: (p as any).cest || "",
                               cst: (p as any).cst || "",
                              ncm: (p as any).ncm || "",
                              unidade: (p as any).unidade || "UN",
                              tipo_produto: (p as any).tipo_produto || "MERCADORIA",
                              tax_rule_id: (p as any).tax_rule_id || "",
                              control_inventory: !!(p as any).control_inventory,
                              unit: (p as any).unit || "",
                              current_stock: (p as any).current_stock ?? "",
                              minimum_stock: (p as any).minimum_stock ?? "",
                              cost_per_unit: (p as any).cost_per_unit ?? ""
                            });
                            setIsProductDialogOpen(true);
                           }}><Pencil className="h-4 w-4" /></Button>
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" title="Clonar produto" onClick={async () => {
                             const cloneName = `Cópia de ${p.name}`;
                             if (false) return;
                             try {
                               const { data: newProd, error } = await supabase.from("products").insert({
                                 name: cloneName,
                                 description: p.description || null,
                                 price: p.price,
                                  price_2: (p as any).price_2 || null,
                                 category_id: p.category_id || null,
                                 image_url: p.image_url || null,
                                 active: false,
                                 is_available: false,
                                 sell_delivery: p.sell_delivery !== false,
                                 sell_dine_in: p.sell_dine_in !== false,
                                 sell_digital_menu: p.sell_digital_menu !== false,
                                 allow_half_half: p.allow_half_half || false,
                                 allow_crust: (p as any).allow_crust !== false,
                                 is_pizza_flavor: p.is_pizza_flavor || false,
                                 size_prices: p.size_prices || null,
                                 is_promotional: p.is_promotional || false,
                                 suggested_products: p.suggested_products || [],
                                  discount_percent: (p as any).discount_percent || null,
                                  discount_price: (p as any).discount_price || null,
                                  cest: (p as any).cest || null,
                                  cst: (p as any).cst || null,
                                  ncm: (p as any).ncm || null,
                                  send_to_production: (p as any).send_to_production !== false,
                                  send_to_kds: (p as any).send_to_kds !== false,
                               }).select().single();
                               if (error) {
                                 toast.error("Erro ao clonar: " + error.message);
                                 return;
                               }
                               toast.success(`Produto "${cloneName}" criado!`);
                               await fetchData(true, true);
                             } catch (err: any) {
                               toast.error("Erro ao clonar: " + (err?.message || "desconhecido"));
                             }
                           }}><Copy className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-red-50" onClick={async () => {
                               if (!user?.can_delete) {
                                 toast.error("Você não tem permissão para excluir produtos.");
                                 return;
                               }
                               if (false) return;
                               try {
                                const { error } = await supabase.from("products").delete().eq("id", p.id);
                                if (error) {
                                  // Provavelmente vinculado a pedidos antigos — desativa em vez de excluir
                                  if ((error as any).code === "23503" || /foreign key|violates/i.test(error.message)) {
                                    if (false) return;
                                    const { error: updErr } = await supabase.from("products").update({ active: false, is_available: false }).eq("id", p.id);
                                    if (updErr) { toast.error("Erro ao desativar: " + updErr.message); return; }
                                    toast.success("Produto desativado.");
                                  } else {
                                    toast.error("Erro ao excluir: " + error.message);
                                    return;
                                  }
                                } else {
                                  toast.success("Produto excluído.");
                                }
                                await fetchData(true, true);
                              } catch (err: any) {
                                toast.error("Erro ao excluir: " + (err?.message || "desconhecido"));
                              }
                            }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>
      </TabsContent>

          <TabsContent value="finance" className="space-y-6">
            {(() => {
              const filteredTrans = transactions.filter(t => {
                if (!financeFilters.startDate && !financeFilters.endDate && !financeFilters.dueStartDate && !financeFilters.dueEndDate && !financeFilters.paymentStartDate && !financeFilters.paymentEndDate) {
                  return true;
                }
                const matchesStartDate = !financeFilters.startDate || t.date >= financeFilters.startDate;
                const matchesEndDate = !financeFilters.endDate || t.date <= financeFilters.endDate;
                
                const dDate = (t as any).due_date;
                const matchesDueStart = !financeFilters.dueStartDate || (dDate && dDate >= financeFilters.dueStartDate);
                const matchesDueEnd = !financeFilters.dueEndDate || (dDate && dDate <= financeFilters.dueEndDate);

                const pDate = (t as any).payment_date;
                const matchesPaymentStart = !financeFilters.paymentStartDate || (pDate && pDate >= financeFilters.paymentStartDate);
                const matchesPaymentEnd = !financeFilters.paymentEndDate || (pDate && pDate <= financeFilters.paymentEndDate);
                
                return matchesStartDate && matchesEndDate && matchesDueStart && matchesDueEnd && matchesPaymentStart && matchesPaymentEnd;
              });

              const totalIncome = filteredTrans.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
              const totalExpense = filteredTrans.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-green-600 font-semibold uppercase tracking-wider">Receitas</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-green-700">R$ {totalIncome.toFixed(2)}</div></CardContent>
                  </Card>
                  <Card className="bg-red-50 border-red-200">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-red-600 font-semibold uppercase tracking-wider">Despesas</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-red-700">R$ {totalExpense.toFixed(2)}</div></CardContent>
                  </Card>
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-blue-600 font-semibold uppercase tracking-wider">Saldo do Período</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-blue-700">R$ {(totalIncome - totalExpense).toFixed(2)}</div></CardContent>
                  </Card>
                </div>
              );
            })()}
            
            <Tabs value={financialView} onValueChange={setFinancialView} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all" className="font-bold">Geral</TabsTrigger>
                <TabsTrigger value="income" className="font-bold text-green-600">Contas a Receber</TabsTrigger>
                <TabsTrigger value="expense" className="font-bold text-red-600">Contas a Pagar</TabsTrigger>
                <TabsTrigger value="dre" className="font-bold text-blue-600">DRE</TabsTrigger>
                <TabsTrigger value="plano" className="font-bold text-orange-600">Plano de Contas</TabsTrigger>
              </TabsList>
            </Tabs>

            {(financialView === 'all' || financialView === 'income' || financialView === 'expense') && (
            <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Lançamentos</CardTitle>
                <div className="flex gap-2">
                  <Dialog open={isContactDialogOpen} onOpenChange={(open) => {
                    setIsContactDialogOpen(open);
                    if (!open) {
                      setEditingSupplier(null);
                      setNewSupplier({ 
                        name: "", contact_name: "", email: "", phone: "", address: "",
                        address_number: "", zip_code: "", city: "", state: "", cnpj: "", cpf: "",
                        person_type: "juridica"
                      });
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Users className="h-4 w-4" /> Fornecedores
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <DialogTitle>Gerenciar Fornecedores</DialogTitle>
                            <DialogDescription>Visualize, adicione ou edite seus fornecedores.</DialogDescription>
                          </div>
                          {editingSupplier || isAddingSupplier ? (
                            <Button variant="ghost" onClick={() => { setEditingSupplier(null); setIsAddingSupplier(false); }}>
                              Voltar para lista
                            </Button>
                          ) : (
                            <Button className="gap-2" onClick={() => setIsAddingSupplier(true)}>
                              <Plus className="h-4 w-4" /> Novo Fornecedor
                            </Button>
                          )}
                        </div>
                      </DialogHeader>

                      {(editingSupplier || isAddingSupplier) ? (
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg bg-muted/30">
                            <div className="col-span-2 space-y-4 mb-2">
                              <div className="flex items-center gap-4 p-2 bg-background rounded-md border border-indigo-100">
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="radio" 
                                    id="supp_fisica" 
                                    checked={newSupplier.person_type === 'fisica'} 
                                    onChange={() => setNewSupplier({...newSupplier, person_type: 'fisica'})} 
                                  />
                                  <Label htmlFor="supp_fisica" className="cursor-pointer">Pessoa Física</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="radio" 
                                    id="supp_juridica" 
                                    checked={newSupplier.person_type === 'juridica'} 
                                    onChange={() => setNewSupplier({...newSupplier, person_type: 'juridica'})} 
                                  />
                                  <Label htmlFor="supp_juridica" className="cursor-pointer">Pessoa Jurídica</Label>
                                </div>
                              </div>
                            </div>

                            {newSupplier.person_type === 'juridica' ? (
                              <div className="col-span-2 space-y-1">
                                <Label className="text-indigo-600 font-semibold">CNPJ (Pesquisa automática)</Label>
                                <div className="flex gap-2">
                                  <Input 
                                    placeholder="00.000.000/0000-00" 
                                    value={newSupplier.cnpj} 
                                    onChange={e => {
                                      const val = e.target.value.replace(/\D/g, '').substring(0, 14);
                                      setNewSupplier({...newSupplier, cnpj: val});
                                      if (val.length === 14) {
                                        const fetchCnpj = async () => {
                                          const toastId = toast.loading("Buscando CNPJ...");
                                          try {
                                            const res = await fetch(`https://publica.cnpj.ws/cnpj/${val}`);
                                            const data = await res.json();
                                            toast.dismiss(toastId);
                                            if (data && data.estabelecimento) {
                                              const est = data.estabelecimento;
                                              setNewSupplier(prev => ({
                                                ...prev,
                                                name: data.razao_social || "",
                                                email: est.email || "",
                                                phone: (est.ddd1 && est.telefone1) ? `${est.ddd1}${est.telefone1}` : "",
                                                zip_code: est.cep || "",
                                                address: est.logradouro || "",
                                                address_number: est.numero || "",
                                                city: est.cidade?.nome || "",
                                                state: est.estado?.sigla || ""
                                              }));
                                              toast.success("Dados do CNPJ carregados!");
                                            } else {
                                              toast.error("CNPJ não encontrado");
                                            }
                                          } catch (err) {
                                            toast.dismiss(toastId);
                                            toast.error("Erro ao buscar CNPJ");
                                          }
                                        };
                                        fetchCnpj();
                                      }
                                    }} 
                                    className="border-indigo-300 focus-visible:ring-indigo-500 bg-indigo-50/30 font-medium"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="col-span-2 space-y-1">
                                <Label>CPF</Label>
                                <Input 
                                  placeholder="000.000.000-00" 
                                  value={newSupplier.cpf} 
                                  onChange={e => {
                                    const val = e.target.value.replace(/\D/g, '').substring(0, 11);
                                    setNewSupplier({...newSupplier, cpf: val});
                                  }} 
                                />
                              </div>
                            )}

                            <div className="col-span-2 space-y-1">
                              <Label>Nome / Razão Social</Label>
                              <Input value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                              <Label>E-mail</Label>
                              <Input type="email" value={newSupplier.email} onChange={e => setNewSupplier({...newSupplier, email: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                              <Label>Telefone</Label>
                              <Input value={newSupplier.phone} onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})} />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-blue-600 font-semibold">CEP (Pesquisa automática)</Label>
                              <Input 
                                placeholder="00000-000" 
                                value={newSupplier.zip_code} 
                                onChange={e => {
                                  const val = e.target.value.replace(/\D/g, '').substring(0, 8);
                                  setNewSupplier({...newSupplier, zip_code: val});
                                  if (val.length === 8) {
                                    const fetchCep = async () => {
                                      try {
                                        const res = await fetch(`https://viacep.com.br/ws/${val}/json/`);
                                        const data = await res.json();
                                        if (!data.erro) {
                                          setNewSupplier(prev => ({
                                            ...prev,
                                            address: data.logradouro,
                                            city: data.localidade,
                                            state: data.uf
                                          }));
                                          toast.success("Endereço encontrado!");
                                        }
                                      } catch (err) {}
                                    };
                                    fetchCep();
                                  }
                                }}
                                className="border-blue-300 focus-visible:ring-blue-500 bg-blue-50/30"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Endereço</Label>
                              <Input value={newSupplier.address} onChange={e => setNewSupplier({...newSupplier, address: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                              <Label>Número</Label>
                              <Input value={newSupplier.address_number} onChange={e => setNewSupplier({...newSupplier, address_number: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                              <Label>Cidade</Label>
                              <Input value={newSupplier.city} onChange={e => setNewSupplier({...newSupplier, city: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                              <Label>Estado</Label>
                              <Input value={newSupplier.state} onChange={e => setNewSupplier({...newSupplier, state: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                              <Label>Contato (Nome)</Label>
                              <Input value={newSupplier.contact_name} onChange={e => setNewSupplier({...newSupplier, contact_name: e.target.value})} />
                            </div>

                            <div className="col-span-2 mt-4 flex gap-2">
                              <Button className="flex-1" onClick={async () => {
                                if (!newSupplier.name) return toast.error("Nome/Razão Social obrigatório");
                                
                                const { person_type, ...payload } = newSupplier;
                                
                                if (editingSupplier) {
                                  const { error } = await supabase.from("suppliers").update(payload).eq("id", editingSupplier.id);
                                  if (error) toast.error(error.message);
                                  else {
                                    toast.success("Fornecedor atualizado!");
                                    setEditingSupplier(null);
                                    fetchData();
                                  }
                                } else {
                                  const { error } = await supabase.from("suppliers").insert([payload]);
                                  if (error) toast.error(error.message);
                                  else { 
                                    toast.success("Fornecedor cadastrado!"); 
                                    setIsAddingSupplier(false);
                                    fetchData(); 
                                  }
                                }
                              }}>
                                {editingSupplier ? "Salvar Alterações" : "Cadastrar Fornecedor"}
                              </Button>
                              <Button variant="outline" className="flex-1" onClick={() => { setEditingSupplier(null); setIsAddingSupplier(false); }}>
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-4">
                          <div className="border rounded-md">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Fornecedor</TableHead>
                                  <TableHead>Contato/Tel</TableHead>
                                  <TableHead>Cidade/UF</TableHead>
                                  <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {suppliers.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                      Nenhum fornecedor cadastrado.
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  suppliers.map(s => (
                                    <TableRow key={s.id}>
                                      <TableCell>
                                        <div className="flex flex-col">
                                          <span className="font-semibold">{s.name}</span>
                                          <span className="text-[10px] text-muted-foreground">{s.cnpj || s.cpf || "Sem doc"}</span>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex flex-col">
                                          <span className="text-sm">{s.contact_name || "-"}</span>
                                          <span className="text-[10px] text-muted-foreground">{s.phone || s.email || "-"}</span>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <span className="text-sm">{s.city ? `${s.city}/${s.state || ''}` : "-"}</span>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => {
                                            setEditingSupplier(s);
                                            setNewSupplier({
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
                                              person_type: s.cnpj ? "juridica" : "fisica"
                                            });
                                          }}>
                                            <Pencil className="h-4 w-4" />
                                          </Button>
                                          <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={async () => {
                                            if (true) { 

                                              const { error } = await supabase.from("suppliers").delete().eq("id", s.id); 
                                              if (error) toast.error("Erro ao excluir: " + error.message);
                                              else {
                                                toast.success("Fornecedor removido!");
                                                fetchData(); 
                                              }
                                            }
                                          }}>
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
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Dialog open={isFinCategoryDialogOpen} onOpenChange={(open) => {
                    setIsFinCategoryDialogOpen(open);
                    if (!open) {
                      setEditingFinCategory(null);
                      setNewFinCategory({ id: "", name: "", type: "income", chart_account_id: "" });
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => {
                          setEditingFinCategory(null);
                          setNewFinCategory({ id: "", name: "", type: "income", chart_account_id: "" });
                        }}
                      >
                        <List className="h-4 w-4" /> Categorias Financeiras
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingFinCategory ? "Editar Categoria Financeira" : "Gerenciar Categorias Financeiras"}</DialogTitle>
                        <DialogDescription>Estas categorias são usadas no fluxo de caixa e financeiro.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-4">
                          <div className="flex gap-2">
                            <Input 
                              placeholder="Nome..." 
                              value={newFinCategory.name} 
                              onChange={e => setNewFinCategory({...newFinCategory, name: e.target.value})} 
                              className="flex-1"
                            />
                            <Select 
                              value={newFinCategory.type} 
                              onValueChange={(v: any) => setNewFinCategory({...newFinCategory, type: v})}
                            >
                              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="income">Receita</SelectItem>
                                <SelectItem value="expense">Despesa</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-xs">Conta DRE (Opcional)</Label>
                            <div className="flex gap-2">
                              <Select 
                                value={newFinCategory.chart_account_id} 
                                onValueChange={v => setNewFinCategory({...newFinCategory, chart_account_id: v})}
                              >
                                <SelectTrigger className="flex-1">
                                  <SelectValue placeholder="Selecione a conta DRE..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {chartAccounts
                                    .filter(c => (c.level === 3 || c.level === 2) && 
                                      ((newFinCategory.type === 'income' && (c.type === 'revenue' || c.code.startsWith('1'))) || 
                                       (newFinCategory.type === 'expense' && (c.type === 'expense' || c.code.startsWith('3') || c.code.startsWith('4'))))
                                    )
                                    .map(c => (
                                      <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              <Button onClick={handleAddFinCategory} disabled={loading} className="shrink-0">
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : editingFinCategory ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="max-h-[300px] overflow-auto border rounded-md">
                          <Table>


                            <TableHeader>
                              <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead className="w-20"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {finCategories.map(c => (
                                <TableRow key={c.id}>
                                  <TableCell className="py-2">
                                    <div className="flex flex-col">
                                      <span className="font-medium">{c.name}</span>
                                      <span className="text-[10px] text-muted-foreground">
                                        {chartAccounts.find(ca => ca.id === (c as any).chart_account_id)?.name || "Sem conta DRE"}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-2">
                                    <Badge variant={c.type === 'income' ? 'default' : 'destructive'} className="text-[10px]">
                                      {c.type === 'income' ? 'Receita' : 'Despesa'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="py-2">
                                    <div className="flex gap-1">
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-7 w-7 text-indigo-600"
                                        onClick={() => {
                                          setEditingFinCategory(c);
                                          setNewFinCategory({ 
                                            id: c.id, 
                                            name: c.name, 
                                            type: c.type, 
                                            chart_account_id: (c as any).chart_account_id || "" 
                                          });
                                        }}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-7 w-7 text-destructive"
                                        onClick={async () => {
                                          if (true) {
                                            const { error } = await supabase.from("financial_categories").delete().eq("id", c.id);
                                            if (error) toast.error(error.message);
                                            else fetchData();
                                          }
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" className="gap-2" onClick={() => {
                    setIsEditTransactionMode(false);
                    setIsViewTransactionMode(false);
                    setNewTransaction({ id: "", description: "", amount: "", type: "income", category_id: "", date: todayDate, due_date: "", payment_date: "", status: "pending", customer_id: "", supplier_id: "" });
                    setIsTransactionDialogOpen(true);
                  }}>
                    <Plus className="h-4 w-4" /> Novo Lançamento
                  </Button>
              </div>
            </CardHeader>
            <div className="px-6 py-6 border-b bg-muted/50 dark:bg-slate-900/50">
              <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {/* Filtro por Emissão */}
                <div className="bg-card dark:bg-slate-800 p-3 rounded-xl border border-border dark:border-slate-700 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground dark:text-slate-300 font-black text-[10px] uppercase tracking-wider">
                    <Calendar className="h-3.5 w-3.5 text-blue-500" /> Data de Emissão
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[9px] font-bold text-slate-400 dark:text-muted-foreground uppercase">Início</Label>
                      <Input 
                        type="date" 
                        className="h-8 text-xs bg-muted dark:bg-slate-900 border-border dark:border-slate-700 dark:text-slate-200" 
                        value={financeFilters.startDate}
                        onChange={e => setFinanceFilters({...financeFilters, startDate: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] font-bold text-slate-400 dark:text-muted-foreground uppercase">Fim</Label>
                      <Input 
                        type="date" 
                        className="h-8 text-xs bg-muted dark:bg-slate-900 border-border dark:border-slate-700 dark:text-slate-200" 
                        value={financeFilters.endDate}
                        onChange={e => setFinanceFilters({...financeFilters, endDate: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Filtro por Vencimento */}
                <div className="bg-card dark:bg-slate-800 p-3 rounded-xl border border-border dark:border-slate-700 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground dark:text-slate-300 font-black text-[10px] uppercase tracking-wider">
                    <Clock className="h-3.5 w-3.5 text-orange-500" /> Data de Vencimento
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[9px] font-bold text-slate-400 dark:text-muted-foreground uppercase">Início</Label>
                      <Input 
                        type="date" 
                        className="h-8 text-xs bg-muted dark:bg-slate-900 border-border dark:border-slate-700 dark:text-slate-200" 
                        value={financeFilters.dueStartDate}
                        onChange={e => setFinanceFilters({...financeFilters, dueStartDate: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] font-bold text-slate-400 dark:text-muted-foreground uppercase">Fim</Label>
                      <Input 
                        type="date" 
                        className="h-8 text-xs bg-muted dark:bg-slate-900 border-border dark:border-slate-700 dark:text-slate-200" 
                        value={financeFilters.dueEndDate}
                        onChange={e => setFinanceFilters({...financeFilters, dueEndDate: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Filtro por Pagamento */}
                <div className="bg-card dark:bg-slate-800 p-3 rounded-xl border border-border dark:border-slate-700 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground dark:text-slate-300 font-black text-[10px] uppercase tracking-wider">
                    <DollarSign className="h-3.5 w-3.5 text-green-500" /> Data de Pagamento
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[9px] font-bold text-slate-400 dark:text-muted-foreground uppercase">Início</Label>
                      <Input 
                        type="date" 
                        className="h-8 text-xs bg-muted dark:bg-slate-900 border-border dark:border-slate-700 dark:text-slate-200" 
                        value={financeFilters.paymentStartDate}
                        onChange={e => setFinanceFilters({...financeFilters, paymentStartDate: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] font-bold text-slate-400 dark:text-muted-foreground uppercase">Fim</Label>
                      <Input 
                        type="date" 
                        className="h-8 text-xs bg-muted dark:bg-slate-900 border-border dark:border-slate-700 dark:text-slate-200" 
                        value={financeFilters.paymentEndDate}
                        onChange={e => setFinanceFilters({...financeFilters, paymentEndDate: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Filtro por Cliente/Fornecedor */}
                <div className="bg-card dark:bg-slate-800 p-3 rounded-xl border border-border dark:border-slate-700 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground dark:text-slate-300 font-black text-[10px] uppercase tracking-wider">
                    <Users className="h-3.5 w-3.5 text-purple-500" /> Entidade
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[9px] font-bold text-slate-400 dark:text-muted-foreground uppercase">Buscar Nome/Descrição</Label>
                      <div className="relative">
                        <Search className="absolute left-2 top-2 h-3 w-3 text-slate-400" />
                        <Input 
                          placeholder="Buscar..."
                          className="h-8 pl-7 text-xs bg-muted dark:bg-slate-900 border-border dark:border-slate-700 dark:text-slate-200"
                          value={financeFilters.search}
                          onChange={e => setFinanceFilters({...financeFilters, search: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] font-bold text-slate-400 dark:text-muted-foreground uppercase">Cliente</Label>
                      <Select 
                        value={financeFilters.customerId} 
                        onValueChange={v => setFinanceFilters({...financeFilters, customerId: v})}
                      >
                        <SelectTrigger className="h-8 text-[10px] bg-muted dark:bg-slate-900 border-border dark:border-slate-700">
                          <SelectValue placeholder="Todos os Clientes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os Clientes</SelectItem>
                          {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] font-bold text-slate-400 dark:text-muted-foreground uppercase">Fornecedor</Label>
                      <Select 
                        value={financeFilters.supplierId} 
                        onValueChange={v => setFinanceFilters({...financeFilters, supplierId: v})}
                      >
                        <SelectTrigger className="h-8 text-[10px] bg-muted dark:bg-slate-900 border-border dark:border-slate-700">
                          <SelectValue placeholder="Todos os Fornecedores" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os Fornecedores</SelectItem>
                          {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Ações / Impressão */}
                <div className="bg-card dark:bg-slate-800 p-3 rounded-xl border border-border dark:border-slate-700 shadow-sm flex flex-col justify-center gap-2">
                  <Button 
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] uppercase h-10 gap-2"
                    onClick={() => {
                      const filtered = transactions.filter(t => {
                        if (financialView !== 'all' && t.type !== financialView) return false;
                        const matchesStartDate = !financeFilters.startDate || t.date >= financeFilters.startDate;
                        const matchesEndDate = !financeFilters.endDate || t.date <= financeFilters.endDate;
                        const dDate = (t as any).due_date;
                        const matchesDueStart = !financeFilters.dueStartDate || (dDate && dDate >= financeFilters.dueStartDate);
                        const matchesDueEnd = !financeFilters.dueEndDate || (dDate && dDate <= financeFilters.dueEndDate);
                        const pDate = (t as any).payment_date;
                        const matchesPaymentStart = !financeFilters.paymentStartDate || (pDate && pDate >= financeFilters.paymentStartDate);
                        const matchesPaymentEnd = !financeFilters.paymentEndDate || (pDate && pDate <= financeFilters.paymentEndDate);
                        const matchesCustomer = financeFilters.customerId === 'all' || (t as any).customer_id === financeFilters.customerId;
                        const matchesSupplier = financeFilters.supplierId === 'all' || (t as any).supplier_id === financeFilters.supplierId;
                        return matchesStartDate && matchesEndDate && matchesDueStart && matchesDueEnd && matchesPaymentStart && matchesPaymentEnd && matchesCustomer && matchesSupplier;
                      });

                      const printWindow = window.open('', '_blank');
                      if (!printWindow) return;

                      const totalIncome = filtered.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
                      const totalExpense = filtered.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);

                      const formato = (storeSettings?.print_paper_format === 'a4' ? 'a4' : 'thermal_80mm') as 'a4' | 'thermal_80mm';

                      const items = filtered.map(t => {
                        const dateStr = new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR');
                        const dueStr = (t as any).due_date ? new Date((t as any).due_date + 'T12:00:00').toLocaleDateString('pt-BR') : '-';
                        const entidade = t.type === 'income' ? ((t as any).customers?.name || '-') : ((t as any).suppliers?.name || '-');
                        const categoria = (t as any).financial_categories?.name || (t as any).chart_of_accounts?.name || '-';
                        const status = (t as any).status === 'paid' ? 'Pago' : 'Pendente';
                        const signed = (t.type === 'income' ? 1 : -1) * Number(t.amount);
                        return {
                          name: `${t.description}`,
                          quantity: 1,
                          price: signed,
                          notes: `Data: ${dateStr} | Venc: ${dueStr} | ${entidade} | ${categoria} | ${status}`,
                        };
                      });

                      const saldo = totalIncome - totalExpense;
                      const notesSummary = [
                        `Período: ${financeFilters.startDate || 'S/D'} até ${financeFilters.endDate || 'S/D'}`,
                        `Total Receitas: R$ ${totalIncome.toFixed(2)}`,
                        `Total Despesas: R$ ${totalExpense.toFixed(2)}`,
                        `Saldo Final: R$ ${saldo.toFixed(2)}`,
                      ].join('\n');

                      const html = gerarHtmlImpressao({
                        titulo: 'RELATÓRIO FINANCEIRO',
                        formato,
                        content: {
                          created_at: new Date().toISOString(),
                          customer_name: storeSettings?.name || 'Sistema',
                          total: saldo,
                          notes: notesSummary,
                          items,
                        },
                        rodapePersonalizado: `Gerado em ${new Date().toLocaleString('pt-BR')}`,
                      });

                      printWindow.document.write(html);
                      printWindow.document.close();
                    }}

                  >
                    <Printer className="h-4 w-4" /> Imprimir Relatório
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full text-[10px] font-black uppercase h-8"
                    onClick={() => fetchData()}
                  >
                    <RotateCcw className="h-3 w-3 mr-2" /> Atualizar Dados
                  </Button>
                </div>
              </div>

              {(financeFilters.startDate || financeFilters.endDate || financeFilters.dueStartDate || financeFilters.dueEndDate || financeFilters.paymentStartDate || financeFilters.paymentEndDate) && (
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-[10px] gap-2 font-black uppercase text-slate-400 dark:text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    onClick={() => setFinanceFilters({ 
                      startDate: todayDate, 
                      endDate: todayDate, 
                      dueStartDate: "", 
                      dueEndDate: "", 
                      paymentStartDate: "", 
                      paymentEndDate: "",
                      customerId: "all",
                      supplierId: "all",
                      search: ""
                    })}
                  >
                    <RotateCcw className="h-3 w-3" /> Limpar Todos os Filtros
                  </Button>
                </div>
              )}
            </div>
            </Card>
            <Card className="border-none shadow-xl overflow-hidden">
              <Table>

                <TableHeader>
                  <TableRow>
                    <TableHead>Emissão</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Descrição / Cliente-Fornecedor</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Caixa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {transactions.filter(t => {
                    // Filtro de Visão (Geral, Receber, Pagar)
                    if (financialView !== 'all' && t.type !== financialView) {
                      return false;
                    }

                    const matchesStartDate = !financeFilters.startDate || t.date >= financeFilters.startDate;
                    const matchesEndDate = !financeFilters.endDate || t.date <= financeFilters.endDate;
                    
                    const dDate = (t as any).due_date;
                    const matchesDueStart = !financeFilters.dueStartDate || (dDate && dDate >= financeFilters.dueStartDate);
                    const matchesDueEnd = !financeFilters.dueEndDate || (dDate && dDate <= financeFilters.dueEndDate);

                    const pDate = (t as any).payment_date;
                    const matchesPaymentStart = !financeFilters.paymentStartDate || (pDate && pDate >= financeFilters.paymentStartDate);
                    const matchesPaymentEnd = !financeFilters.paymentEndDate || (pDate && pDate <= financeFilters.paymentEndDate);
                    
                    const matchesCustomer = financeFilters.customerId === 'all' || (t as any).customer_id === financeFilters.customerId;
                    const matchesSupplier = financeFilters.supplierId === 'all' || (t as any).supplier_id === financeFilters.supplierId;

                    const searchLower = (financeFilters.search || "").toLowerCase();
                    const matchesSearch = !searchLower || 
                      t.description?.toLowerCase().includes(searchLower) || 
                      (t as any).customers?.name?.toLowerCase().includes(searchLower) ||
                      (t as any).suppliers?.name?.toLowerCase().includes(searchLower);

                    return matchesStartDate && matchesEndDate && matchesDueStart && matchesDueEnd && matchesPaymentStart && matchesPaymentEnd && matchesCustomer && matchesSupplier && matchesSearch;
                  }).map(t => (
                    <TableRow key={t.id}>
                      <TableCell className="text-xs font-medium">{new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-xs">{(t as any).due_date ? new Date((t as any).due_date + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}</TableCell>
                      <TableCell className="text-xs">{ (t as any).payment_date ? new Date((t as any).payment_date + 'T12:00:00').toLocaleDateString('pt-BR') : '-' }</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{t.description}</span>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold">
                            {t.type === 'income' ? 
                              ((t as any).customers?.name ? `👤 Cliente: ${(t as any).customers.name}` : '') : 
                              ((t as any).suppliers?.name ? `🚚 Forn: ${(t as any).suppliers.name}` : '')
                            }
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex flex-col">
                          <span>{(t as any).chart_of_accounts?.name || '-'}</span>
                          <span className="text-[9px] text-muted-foreground">{(t as any).chart_of_accounts?.code}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {t.cashier_session_id ? (
                          <Badge variant="outline" className="text-[9px] bg-primary/5 border-primary/20">Sessão</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] bg-muted">Geral</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={(t as any).status === 'paid' ? 'default' : 'outline'} className="text-[10px]">
                            {(t as any).status === 'paid' ? 'Pago' : 'Pendente'}
                          </Badge>
                          {(t as any).status !== 'paid' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 px-2 text-[10px] gap-1 text-green-600 border-green-200 hover:bg-green-50 font-bold" 
                              title={t.type === 'income' ? "Receber Conta" : "Pagar Conta"}
                              onClick={() => handleOpenReceiveModal(t)}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              {t.type === 'income' ? 'Receber' : 'Pagar'}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className={`text-right font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'income' ? '+' : '-'} R$ {Number(t.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {(t as any).status === 'paid' ? (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" 
                              onClick={() => handleEditTransaction(t)}
                              title="Visualizar Lançamento"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" 
                              onClick={() => handleEditTransaction(t)}
                              title="Editar Lançamento"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteTransaction(t.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                    <TableRow className="bg-muted dark:bg-slate-900/80 hover:bg-muted dark:hover:bg-slate-900/80 border-t-2 border-border dark:border-slate-700">
                      <TableCell colSpan={7} className="text-right font-black uppercase text-[10px] text-muted-foreground dark:text-slate-400">
                        Total {financialView === 'income' ? 'a Receber' : financialView === 'expense' ? 'a Pagar' : 'do Período'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={`text-sm font-black p-2 rounded-lg border ${
                          (() => {
                            const total = transactions.filter(t => {
                              if (financialView !== 'all' && t.type !== financialView) return false;
                              const matchesStartDate = !financeFilters.startDate || t.date >= financeFilters.startDate;
                              const matchesEndDate = !financeFilters.endDate || t.date <= financeFilters.endDate;
                              const dDate = (t as any).due_date;
                              const matchesDueStart = !financeFilters.dueStartDate || (dDate && dDate >= financeFilters.dueStartDate);
                              const matchesDueEnd = !financeFilters.dueEndDate || (dDate && dDate <= financeFilters.dueEndDate);
                              const pDate = (t as any).payment_date;
                              const matchesPaymentStart = !financeFilters.paymentStartDate || (pDate && pDate >= financeFilters.paymentStartDate);
                              const matchesPaymentEnd = !financeFilters.paymentEndDate || (pDate && pDate <= financeFilters.paymentEndDate);
                              return matchesStartDate && matchesEndDate && matchesDueStart && matchesDueEnd && matchesPaymentStart && matchesPaymentEnd;
                            }).reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
                            
                            return total >= 0 ? "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800" : "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800";
                          })()
                        }`}>
                          R$ {transactions.filter(t => {
                            if (financialView !== 'all' && t.type !== financialView) return false;
                            const matchesStartDate = !financeFilters.startDate || t.date >= financeFilters.startDate;
                            const matchesEndDate = !financeFilters.endDate || t.date <= financeFilters.endDate;
                            const dDate = (t as any).due_date;
                            const matchesDueStart = !financeFilters.dueStartDate || (dDate && dDate >= financeFilters.dueStartDate);
                            const matchesDueEnd = !financeFilters.dueEndDate || (dDate && dDate <= financeFilters.dueEndDate);
                            const pDate = (t as any).payment_date;
                            const matchesPaymentStart = !financeFilters.paymentStartDate || (pDate && pDate >= financeFilters.paymentStartDate);
                            const matchesPaymentEnd = !financeFilters.paymentEndDate || (pDate && pDate <= financeFilters.paymentEndDate);
                            return matchesStartDate && matchesEndDate && matchesDueStart && matchesDueEnd && matchesPaymentStart && matchesPaymentEnd;
                          }).reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0).toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
              </Table>
            </Card>
            </>
            )}

            {financialView === 'dre' && (
              <Card className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold">DRE - Demonstrativo de Resultados</h3>
                    <p className="text-xs text-muted-foreground">Classificação por Plano de Contas</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 bg-muted/30 p-2 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Início</Label>
                      <Input 
                        type="date" 
                        className="h-8 text-xs w-[130px]" 
                        value={financeFilters.startDate} 
                        onChange={e => setFinanceFilters({...financeFilters, startDate: e.target.value})} 
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Fim</Label>
                      <Input 
                        type="date" 
                        className="h-8 text-xs w-[130px]" 
                        value={financeFilters.endDate} 
                        onChange={e => setFinanceFilters({...financeFilters, endDate: e.target.value})} 
                      />
                    </div>
                    
                    <div className="h-6 w-[1px] bg-border mx-1"></div>

                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-2 h-8 text-xs"
                      onClick={() => {
                        const dreData = calculateDRE();
                        const printWindow = window.open('', '_blank');
                        if (!printWindow) return;

                        const startStr = financeFilters.startDate ? new Date(financeFilters.startDate + 'T12:00:00').toLocaleDateString('pt-BR') : '-';
                        const endStr = financeFilters.endDate ? new Date(financeFilters.endDate + 'T12:00:00').toLocaleDateString('pt-BR') : '-';

                        const formato = (storeSettings?.print_paper_format === 'a4' ? 'a4' : 'thermal_80mm') as 'a4' | 'thermal_80mm';

                        const items = dreData.map((acc: any) => {
                          const indent = '  '.repeat(Math.max(0, (acc.level || 1) - 1));
                          const signed = acc.type === 'revenue' ? Number(acc.amount) : -Number(acc.amount);
                          return {
                            name: `${indent}${acc.code} - ${acc.name}`,
                            quantity: 1,
                            price: signed,
                            notes: acc.type === 'revenue' ? 'Receita' : (acc.type === 'cost' ? 'Custo' : 'Despesa'),
                          };
                        });

                        const html = gerarHtmlImpressao({
                          titulo: 'DEMONSTRAÇÃO DO RESULTADO (DRE)',
                          formato,
                          content: {
                            created_at: new Date().toISOString(),
                            customer_name: storeSettings?.name || 'Sistema',
                            notes: `Período: ${startStr} até ${endStr}`,
                            items,
                          },
                          rodapePersonalizado: `Gerado em ${new Date().toLocaleString('pt-BR')}`,
                        });

                        printWindow.document.write(html);
                        printWindow.document.close();
                      }}

                    >
                      <Printer className="h-4 w-4" /> Imprimir DRE
                    </Button>
                  </div>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Código</TableHead>
                        <TableHead>Conta</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {calculateDRE().map((acc: any) => (
                        <TableRow key={acc.id} className={acc.level === 1 ? "font-bold bg-muted/20" : acc.level === 2 ? "font-semibold" : "text-xs"}>
                          <TableCell className={acc.level === 2 ? "pl-6" : acc.level === 3 ? "pl-12" : ""}>{acc.code}</TableCell>
                          <TableCell>{acc.name}</TableCell>
                          <TableCell className={`text-right font-bold ${acc.type === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>
                            R$ {Number(acc.amount).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}

            {financialView === 'plano' && (
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold">Plano de Contas</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      onClick={() => {
                        const printWindow = window.open('', '_blank');
                        if (!printWindow) return;

                        const formato = (storeSettings?.print_paper_format === 'a4' ? 'a4' : 'thermal_80mm') as 'a4' | 'thermal_80mm';

                        const items = chartAccounts.map((acc: any) => {
                          const indent = '  '.repeat(Math.max(0, (acc.level || 1) - 1));
                          const typeLabel = acc.type === 'revenue' ? 'Receita' : acc.type === 'cost' ? 'Custo' : 'Despesa';
                          return {
                            name: `${indent}${acc.code} - ${acc.name}`,
                            quantity: 1,
                            notes: typeLabel,
                          };
                        });

                        const html = gerarHtmlImpressao({
                          titulo: 'ESPELHO DO PLANO DE CONTAS',
                          formato,
                          content: {
                            created_at: new Date().toISOString(),
                            customer_name: storeSettings?.name || 'Sistema',
                            items,
                          },
                          rodapePersonalizado: `Gerado em ${new Date().toLocaleString('pt-BR')}`,
                        });

                        printWindow.document.write(html);
                        printWindow.document.close();
                      }}

                    >
                      <Printer className="h-4 w-4" /> Relatório Espelho
                    </Button>
                    <Dialog open={isChartAccountDialogOpen} onOpenChange={(open) => {
                      setIsChartAccountDialogOpen(open);
                      if (!open) {
                        setIsEditChartAccountMode(false);
                        setNewChartAccount({ id: "", code: "", name: "", parent_id: "", type: "revenue", level: 1 });
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button className="gap-2" onClick={() => setIsEditChartAccountMode(false)}>
                          <Plus className="h-4 w-4" /> Nova Conta
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{isEditChartAccountMode ? 'Alterar Conta' : 'Cadastrar Conta no Plano'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Conta Pai (Nível Superior)</Label>
                            <Select value={newChartAccount.parent_id || "none"} onValueChange={v => {
                              const parent = chartAccounts.find(p => p.id === v);
                              const level = parent ? parent.level + 1 : 1;
                              
                              let nextCode = "";
                              if (v === "none") {
                                const level1Accounts = chartAccounts.filter(a => a.level === 1);
                                const maxCode = level1Accounts.length > 0 
                                  ? Math.max(...level1Accounts.map(a => parseInt(a.code) || 0)) 
                                  : 0;
                                nextCode = (maxCode + 1).toString();
                              } else if (parent) {
                                const children = chartAccounts.filter(a => a.parent_id === v);
                                let lastNumber = 0;
                                if (children.length > 0) {
                                  const lastCodes = children.map(c => {
                                    const parts = c.code.split('.');
                                    return parseInt(parts[parts.length - 1]) || 0;
                                  });
                                  lastNumber = Math.max(...lastCodes);
                                }
                                
                                const nextNumber = (lastNumber + 1).toString().padStart(2, '0');
                                nextCode = level === 2 ? `${parent.code}.${lastNumber + 1}` : `${parent.code}.${nextNumber}`;
                              }

                              setNewChartAccount({
                                ...newChartAccount, 
                                parent_id: v === "none" ? "" : v, 
                                level: level,
                                code: nextCode,
                                type: parent ? parent.type : newChartAccount.type
                              });
                            }}>
                              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Nenhum (Nível 1)</SelectItem>
                                {chartAccounts.filter((c: any) => c.level < 3 && c.id !== newChartAccount.id).map((c: any) => (
                                  <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Código Sugerido</Label>
                              <Input value={newChartAccount.code} onChange={e => setNewChartAccount({...newChartAccount, code: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                              <Label>Tipo</Label>
                              <Select value={newChartAccount.type} onValueChange={v => setNewChartAccount({...newChartAccount, type: v as any})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="revenue">Receita</SelectItem>
                                  <SelectItem value="cost">Custo</SelectItem>
                                  <SelectItem value="expense">Despesa</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Nome da Conta</Label>
                            <Input value={newChartAccount.name} onChange={e => setNewChartAccount({...newChartAccount, name: e.target.value})} />
                          </div>
                          <Button className="w-full" onClick={handleAddChartAccount}>
                            {isEditChartAccountMode ? 'Salvar Alterações' : 'Salvar Conta'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Código</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {chartAccounts.map((acc: any) => (
                        <TableRow key={acc.id} className={acc.level === 1 ? "bg-muted/30 font-bold" : ""}>
                          <TableCell className="font-mono text-xs">{acc.code}</TableCell>
                          <TableCell style={{ paddingLeft: `${(acc.level - 1) * 24}px` }} className="text-xs">
                            {acc.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[9px] uppercase">
                              {acc.type === 'revenue' ? 'Receita' : acc.type === 'cost' ? 'Custo' : 'Despesa'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600 hover:bg-blue-50" onClick={() => {
                                setNewChartAccount({
                                  id: acc.id,
                                  code: acc.code,
                                  name: acc.name,
                                  parent_id: acc.parent_id || "",
                                  type: acc.type,
                                  level: acc.level
                                });
                                setIsEditChartAccountMode(true);
                                setIsChartAccountDialogOpen(true);
                              }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={async () => {
                                if (true) {
                                  const { error } = await supabase.from("chart_of_accounts").delete().eq("id", acc.id);
                                  if (error) toast.error(error.message);
                                  else fetchData();
                                }
                              }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </TabsContent>


          <TabsContent value="cashier" className="space-y-6">
            <Dialog open={closeCashierConfirmOpen} onOpenChange={setCloseCashierConfirmOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Fechar Caixa</DialogTitle>
                  <DialogDescription>
                    {showCaixaResumoFechamento ? "Confira o resumo abaixo antes de confirmar o fechamento." : "Confirmar fechamento do caixa?"}
                  </DialogDescription>
                </DialogHeader>
                {showCaixaResumoFechamento && activeSession && (() => {
                  const inc = transactions.filter(t => t.cashier_session_id === activeSession.id && t.type === 'income').reduce((a, t) => a + t.amount, 0);
                  const exp = transactions.filter(t => t.cashier_session_id === activeSession.id && t.type === 'expense').reduce((a, t) => a + t.amount, 0);
                  const fees = driverTrips.filter(t => t.cashier_session_id === activeSession.id).reduce((a, t) => a + t.total_fee, 0);
                  const final = activeSession.opening_balance + inc - exp;
                  return (
                    <div className="grid grid-cols-2 gap-3 py-2 text-sm">
                      <div className="p-3 rounded-lg bg-primary/5"><div className="text-[10px] uppercase text-muted-foreground font-bold">Início</div><div className="font-bold">R$ {activeSession.opening_balance.toFixed(2)}</div></div>
                      <div className="p-3 rounded-lg bg-green-50"><div className="text-[10px] uppercase text-green-700 font-bold">Entradas</div><div className="font-bold text-green-700">R$ {inc.toFixed(2)}</div></div>
                      <div className="p-3 rounded-lg bg-orange-50"><div className="text-[10px] uppercase text-orange-700 font-bold">Taxas Motoqueiros</div><div className="font-bold text-orange-700">R$ {fees.toFixed(2)}</div></div>
                      <div className="p-3 rounded-lg bg-red-50"><div className="text-[10px] uppercase text-red-700 font-bold">Saídas</div><div className="font-bold text-red-700">R$ {exp.toFixed(2)}</div></div>
                      <div className="p-3 rounded-lg bg-blue-50 col-span-2"><div className="text-[10px] uppercase text-blue-700 font-bold">Saldo Final</div><div className="font-bold text-blue-700 text-lg">R$ {final.toFixed(2)}</div></div>
                    </div>
                  );
                })()}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCloseCashierConfirmOpen(false)}>Cancelar</Button>
                  <Button variant="destructive" onClick={async () => { setCloseCashierConfirmOpen(false); await handleCloseCashier(); }}>Confirmar Fechamento</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Archive className="text-blue-600 h-6 w-6" /> Gestão de Caixa
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px] font-black uppercase border-blue-200 text-blue-700 bg-blue-50/50 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Dia do Caixa: {activeSession ? formatDisplayDate(activeSession.opened_at, 'dd/MM/yyyy') : formatDisplayDate(new Date(), 'dd/MM/yyyy')}
                  </Badge>
                  <p className="text-muted-foreground text-sm">Controle de abertura, fechamento e conciliação financeira.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {showCaixaHistorico && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full gap-2 border-slate-200 text-slate-600 hover:bg-slate-50"
                  onClick={() => {
                    const el = document.getElementById('cashier-history-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Calendar className="h-4 w-4" /> Histórico
                </Button>
                )}
                {!activeSession ? (
                  <Dialog open={isCashierDialogOpen} onOpenChange={setIsCashierDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="rounded-full gap-2 shadow-lg bg-blue-600 hover:bg-blue-700">
                        <Unlock className="h-5 w-5" /> Abrir Caixa
                      </Button>
                    </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Abrir Caixa</DialogTitle>
                      <DialogDescription>Informe o valor inicial para começar o expediente de vendas.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label>Saldo Inicial (R$)</Label>
                        <Input type="number" placeholder="0.00" value={openingBalance} onChange={e => setOpeningBalance(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Observações</Label>
                        <Textarea placeholder="Opcional..." value={cashierNotes} onChange={e => setCashierNotes(e.target.value)} />
                      </div>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleOpenCashier}>Confirmar Abertura</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <div className="flex gap-2">
                  <Badge variant="secondary" className="h-10 px-4 text-sm gap-2 border-blue-200 bg-blue-50 text-blue-800 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    Caixa Aberto: R$ {activeSession.opening_balance.toFixed(2)}
                  </Badge>
                  <Button variant="destructive" className="rounded-full gap-2" onClick={() => setCloseCashierConfirmOpen(true)}>
                    <Lock className="h-4 w-4" /> Fechar Caixa
                  </Button>
                  <Button 
                    variant="outline" 
                    className="rounded-full gap-2 border-blue-200 text-blue-700 hover:bg-blue-50" 
                    onClick={() => activeSession && handlePrintOpeningReport(activeSession)}
                  >
                    <Printer className="h-4 w-4" /> Re-imprimir Abertura
                  </Button>
                </div>
              )}
              </div>
            </div>

            {activeSession && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {showCaixaInicio && (
                <Card className="bg-primary/5 border-primary/10">
                  <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Início</CardTitle></CardHeader>
                  <CardContent><div className="text-xl font-bold">R$ {activeSession.opening_balance.toFixed(2)}</div></CardContent>
                </Card>
                )}
                {showCaixaEntradas && (
                <Card className="bg-green-50 border-green-100">
                  <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wider text-green-600">Entradas (Vendas)</CardTitle></CardHeader>
                  <CardContent><div className="text-xl font-bold text-green-700">R$ {transactions.filter(t => t.cashier_session_id === activeSession.id && t.type === 'income').reduce((acc, t) => acc + t.amount, 0).toFixed(2)}</div></CardContent>
                </Card>
                )}
                {showCaixaTaxasMotoqueiros && (
                <Card className="bg-orange-50 border-orange-100">
                  <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wider text-orange-600">Taxas Motoqueiros</CardTitle></CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-orange-700">
                      R$ {driverTrips.filter(t => t.cashier_session_id === activeSession.id).reduce((acc, t) => acc + t.total_fee, 0).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
                )}
                {showCaixaOutrasSaidas && (
                <Card className="bg-red-50 border-red-100">
                  <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wider text-red-600">Outras Saídas</CardTitle></CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-red-700">
                      R$ {transactions.filter(t => t.cashier_session_id === activeSession.id && t.type === 'expense' && !t.description.includes("Pagamento Motoqueiro")).reduce((acc, t) => acc + t.amount, 0).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
                )}
                {showCaixaSaldo && (
                <Card className="bg-blue-50 border-blue-100">
                  <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wider text-blue-600">Saldo em Caixa</CardTitle></CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-blue-700">
                      R$ {(
                        activeSession.opening_balance + 
                        transactions.filter(t => t.cashier_session_id === activeSession.id && t.type === 'income').reduce((acc, t) => acc + t.amount, 0) -
                        transactions.filter(t => t.cashier_session_id === activeSession.id && t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
                      ).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
                )}
              </div>
            )}

            {/* Novo Módulo de Conciliação de Caixa */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 shadow-sm mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-blue-900 flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6" /> Conciliação de Caixa
                  </h3>
                  <p className="text-blue-600/70 text-sm font-medium">Pedidos entregues aguardando acerto financeiro.</p>
                </div>
                <Badge className="bg-blue-600 text-white px-4 py-1 rounded-full animate-pulse">
                  {deliveryOrders.filter(o => o.status === "awaiting_reconciliation").length} Pendentes
                </Badge>
              </div>

              {deliveryOrders.filter(o => o.status === "awaiting_reconciliation").length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {deliveryOrders.filter(o => o.status === "awaiting_reconciliation").map(order => (
                    <Card key={order.id} className="border-none shadow-xl bg-card overflow-hidden group hover:shadow-2xl transition-all duration-300">
                      <div className="h-1.5 bg-blue-600 w-full" />
                      <div className="flex flex-col lg:flex-row">
                        {/* Lado Esquerdo: Resumo do Pedido e Itens */}
                        <div className="w-full lg:w-1/2 p-4 bg-muted/50 border-r border-border">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <CardTitle className="text-base font-black text-foreground">{order.customer_name}</CardTitle>
                              <CardDescription className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {new Date(order.created_at).toLocaleTimeString()}
                              </CardDescription>
                            </div>
                            <Badge variant="outline" className="text-[10px] border-blue-200 text-blue-700 bg-blue-50">
                              #{order.id.slice(0, 5)}
                            </Badge>
                          </div>

                          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                            <Label className="text-[9px] font-black uppercase text-slate-400">Itens do Pedido</Label>
                            {order.delivery_order_items?.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-border last:border-0">
                                <span className="text-muted-foreground font-medium">
                                  <span className="font-bold text-blue-600 mr-1">{item.quantity}x</span>
                                  {item.product_name}
                                </span>
                                <span className="text-muted-foreground font-bold">R$ {item.total_price.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
                            <span className="text-[10px] uppercase font-black text-slate-400">Total Geral</span>
                            <span className="text-lg font-black text-blue-600">R$ {order.total_amount.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Lado Direito: Ações de Pagamento */}
                        <CardContent className="w-full lg:w-1/2 p-4 space-y-4">
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1.5">
                              <DollarSign className="h-3 w-3 text-blue-600" /> Forma de Pagamento
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                              {paymentMethods.filter(m => m.is_active && m.name !== 'Caderneta').map(method => {
                                const IconComp = method.icon === 'Wallet' ? Wallet : 
                                               method.icon === 'ArrowRightLeft' ? ArrowRightLeft : 
                                               method.icon === 'CreditCard' ? CreditCard : 
                                               DollarSign;
                                
                                return (
                                  <Button 
                                    key={method.id}
                                    variant="outline" 
                                    className="h-auto py-2.5 px-2 flex items-center gap-2 justify-start border-border text-muted-foreground hover:bg-indigo-600 hover:text-white transition-all group/btn"
                                    onClick={() => handleReconcileOrder(order, method.name)}
                                  >
                                    <IconComp className="h-3.5 w-3.5 group-hover/btn:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-tight">{method.name}</span>
                                  </Button>
                                );
                              })}
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    className="h-auto py-2.5 px-2 flex items-center gap-2 justify-start border-orange-200 text-orange-600 hover:bg-orange-600 hover:text-white transition-all group/btn"
                                  >
                                    <Clock3 className="h-3.5 w-3.5 group-hover/btn:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-tight">Caderneta</span>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                      <Clock3 className="h-5 w-5 text-orange-600" /> Registrar na Caderneta
                                    </DialogTitle>
                                    <DialogDescription>
                                      Vincule este pedido de <strong>R$ {order.total_amount.toFixed(2)}</strong> à conta de um cliente.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label>Selecione o Cliente</Label>
                                      <Select 
                                        defaultValue={order.customer_id}
                                        onValueChange={(val) => {
                                          (order as any).temp_customer_id = val;
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecione um cliente..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {customers.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ""}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <Button 
                                      className="w-full bg-orange-600 hover:bg-orange-700 font-bold"
                                      onClick={() => {
                                        const selectedId = (order as any).temp_customer_id || order.customer_id;
                                        if (!selectedId) {
                                          toast.error("Por favor, selecione um cliente para a caderneta.");
                                          return;
                                        }
                                        handleReconcileOrder(order, "caderneta", null, selectedId);
                                      }}
                                    >
                                      Confirmar na Caderneta
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    className="h-auto py-2.5 px-2 flex items-center gap-2 justify-start border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white transition-all group/btn"
                                  >
                                    <Maximize2 className="h-3.5 w-3.5 group-hover/btn:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-tight">Dividido</span>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Conciliação Dividida</DialogTitle>
                                  </DialogHeader>
                                  <div className="p-8 text-center space-y-4">
                                    <div className="text-3xl font-black text-blue-600">R$ {order.total_amount.toFixed(2)}</div>
                                    <p className="text-sm text-muted-foreground italic">Em desenvolvimento: No checkout físico, você poderá dividir entre múltiplas formas.</p>
                                    <Button className="w-full" onClick={() => handleReconcileOrder(order, "split")}>Confirmar (Misto)</Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button 
                                variant="outline" 
                                className="h-auto py-2.5 px-2 flex items-center gap-2 justify-start border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-all group/btn"
                                onClick={() => handleDeleteOrder(order.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5 group-hover/btn:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-tight">Excluir Pedido</span>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-card/50 rounded-2xl border-2 border-dashed border-blue-100">
                  <div className="bg-blue-100 p-4 rounded-full mb-4">
                    <CheckCircle2 className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-bold text-blue-900">Tudo em ordem!</h4>
                  <p className="text-blue-600/70 text-sm max-w-xs">Não há novos pedidos aguardando conciliação no momento.</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bike className="h-5 w-5 text-primary" /> Registrar Viagem
                  </CardTitle>
                  <CardDescription>Lance viagens de motoqueiros no caixa atual.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!activeSession ? (
                    <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg">
                      <Lock className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">Abra o caixa para lançar viagens.</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>Motoqueiro</Label>
                        <Select value={tripData.driver_id} onValueChange={v => {
                          setTripData({...tripData, driver_id: v, fee_per_trip: "0"});
                        }}>
                          <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                          <SelectContent>
                            {drivers.filter(d => d.is_active).map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Qtd. Viagens</Label>
                          <Input type="number" min="1" value={tripData.trip_count} onChange={e => setTripData({...tripData, trip_count: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Taxa/Viagem</Label>
                          <Input type="number" value={tripData.fee_per_trip} onChange={e => setTripData({...tripData, fee_per_trip: e.target.value})} />
                        </div>
                      </div>
                      <Button className="w-full" onClick={handleAddTrip}>Lançar Viagem</Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg">Histórico da Sessão</CardTitle>
                    <CardDescription>Movimentações e viagens registradas hoje.</CardDescription>
                  </div>
                  {activeSession && (
                    <Dialog>
                      <DialogTrigger asChild><Button size="sm" variant="outline" className="gap-2"><Plus className="h-4 w-4" /> Nova Despesa/Venda</Button></DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Lançamento em Caixa</DialogTitle></DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label>Descrição</Label>
                            <Input value={newTransaction.description} onChange={e => setNewTransaction({...newTransaction, description: e.target.value})} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Valor (R$)</Label>
                              <Input type="number" value={newTransaction.amount} onChange={e => setNewTransaction({...newTransaction, amount: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                              <Label>Tipo</Label>
                              <Select 
                                value={newTransaction.type} 
                                onValueChange={v => setNewTransaction({...newTransaction, type: v, category_id: ""})}
                              >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="income">Receita</SelectItem>
                                  <SelectItem value="expense">Despesa</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Categoria</Label>
                            <Select value={newTransaction.category_id} onValueChange={v => setNewTransaction({...newTransaction, category_id: v})}>
                              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                              <SelectContent>
                                {finCategories.length === 0 && (
                                  <SelectItem value="none" disabled>Nenhuma categoria encontrada</SelectItem>
                                )}
                                {finCategories
                                  .filter(c => c.type === newTransaction.type)
                                  .map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)
                                }
                              </SelectContent>
                            </Select>
                          </div>
                          <Button onClick={handleAddTransactionWithCashier}>Confirmar Lançamento</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-1">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Viagens / Taxas Motoqueiros</h3>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary">
                            <Users className="h-3.5 w-3.5" /> Ver Resumo por Motoqueiro
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Resumo de Entregas (Sessão Atual)</DialogTitle>
                            <DialogDescription>Total a pagar para cada motoqueiro hoje.</DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Motoqueiro</TableHead>
                                  <TableHead className="text-center">Qtd</TableHead>
                                  <TableHead className="text-right">A Receber</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {activeSession && drivers.filter(d => 
                                  driverTrips.some(t => t.driver_id === d.id && t.cashier_session_id === activeSession.id)
                                ).map(driver => {
                                  const sessionTrips = driverTrips.filter(t => t.driver_id === driver.id && t.cashier_session_id === activeSession.id);
                                  const totalQty = sessionTrips.reduce((acc, t) => acc + t.trip_count, 0);
                                  const totalVal = sessionTrips.reduce((acc, t) => acc + t.total_fee, 0);
                                  return (
                                    <TableRow key={driver.id}>
                                      <TableCell className="font-medium">{driver.name}</TableCell>
                                      <TableCell className="text-center">{totalQty}</TableCell>
                                      <TableCell className="text-right font-bold text-red-600">R$ {totalVal.toFixed(2)}</TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <Table>
                      <TableHeader><TableRow><TableHead>Motoqueiro</TableHead><TableHead>Viagens</TableHead><TableHead>Obs</TableHead><TableHead className="text-right">Total Taxas</TableHead><TableHead className="w-10"></TableHead></TableRow></TableHeader>
                      <TableBody>
                        {activeSession && driverTrips.filter(t => t.cashier_session_id === activeSession.id).length > 0 ? (
                          driverTrips.filter(t => t.cashier_session_id === activeSession.id).map(trip => (
                            <TableRow key={trip.id}>
                              <TableCell className="text-xs">{trip.drivers?.name}</TableCell>
                              <TableCell className="text-xs">{trip.trip_count}x (R$ {trip.fee_per_trip.toFixed(2)})</TableCell>
                              <TableCell className="text-[10px] text-muted-foreground">{trip.notes || '-'}</TableCell>
                              <TableCell className="text-right font-medium text-red-600 text-xs">- R$ {trip.total_fee.toFixed(2)}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteTrip(trip.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow><TableCell colSpan={4} className="text-center py-4 text-muted-foreground italic">Nenhuma viagem lançada.</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>

                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1 mt-6">Outros Lançamentos</h3>
                    <Table>
                      <TableHeader><TableRow><TableHead>Descrição</TableHead><TableHead className="text-right">Valor</TableHead><TableHead className="w-10"></TableHead></TableRow></TableHeader>
                      <TableBody>
                        {activeSession && transactions.filter(t => t.cashier_session_id === activeSession.id).length > 0 ? (
                          <>
                            {/* Transações manuais da sessão */}
                            {transactions
                              .filter(t => t.cashier_session_id === activeSession.id)
                              .filter(t => !t.description.includes("Pagamento Motoqueiro"))
                              .map(t => (
                              <TableRow key={t.id}>
                                <TableCell>{t.description}</TableCell>
                                <TableCell className={`text-right font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                  {t.type === 'income' ? '+' : '-'} R$ {Number(t.amount).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteTransaction(t.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                            
                            {/* As vendas e despesas automáticas agora são gravadas em financial_transactions, então aparecem acima */}
                          </>
                        ) : (
                          <TableRow><TableCell colSpan={2} className="text-center py-4 text-muted-foreground italic">Nenhum lançamento adicional.</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {showCaixaHistorico && (
            <Card id="cashier-history-section">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Histórico de Fechamentos</CardTitle>
                <CardDescription>Relatório de sessões de caixa anteriores.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Abertura</TableHead>
                      <TableHead>Fechamento</TableHead>
                      <TableHead>Saldo Inicial</TableHead>
                      <TableHead>Saldo Final</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cashierSessions.map(session => (
                      <TableRow key={session.id}>
                        <TableCell>{new Date(session.opened_at).toLocaleString('pt-BR')}</TableCell>
                        <TableCell>{session.closed_at ? new Date(session.closed_at).toLocaleString('pt-BR') : '-'}</TableCell>
                        <TableCell>R$ {session.opening_balance.toFixed(2)}</TableCell>
                        <TableCell className="font-bold">
                          {session.closing_balance !== null ? `R$ ${session.closing_balance.toFixed(2)}` : 'Em aberto'}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={cn(
                              "font-semibold border-none",
                              session.status === 'open' 
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400" 
                                : "bg-slate-100 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400"
                            )}
                          >
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full mr-2",
                              session.status === 'open' ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                            )} />
                            {session.status === 'open' ? 'Aberto' : 'Fechado'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => {
                            setSelectedSessionDetails(session);
                            setIsSessionDetailsOpen(true);
                          }}>Ver Detalhes</Button>
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => handlePrintOpeningReport(session)}>
                            <Printer className="h-4 w-4 mr-1" /> Abertura
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            )}

            <Dialog open={isSessionDetailsOpen} onOpenChange={setIsSessionDetailsOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Archive className="h-5 w-5" /> Detalhes do Caixa
                  </DialogTitle>
                  <DialogDescription>
                    Sessão de {selectedSessionDetails && new Date(selectedSessionDetails.opened_at).toLocaleString('pt-BR')} até {selectedSessionDetails?.closed_at ? new Date(selectedSessionDetails.closed_at).toLocaleString('pt-BR') : 'agora'}
                  </DialogDescription>
                  <div className="flex gap-2 pt-2 no-print">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 text-green-600 border-green-200 hover:bg-green-50"
                      onClick={() => selectedSessionDetails && handleShareSessionWhatsApp(selectedSessionDetails)}
                    >
                      <Share2 className="h-4 w-4" /> WhatsApp
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => selectedSessionDetails && handlePrintSessionReport(selectedSessionDetails)}
                    >
                      <Printer className="h-4 w-4" /> Imprimir
                    </Button>
                  </div>
                </DialogHeader>

                {selectedSessionDetails && (
                  <div className="space-y-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="bg-primary/5 p-4">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Inicial</Label>
                        <div className="text-lg font-bold">R$ {selectedSessionDetails.opening_balance.toFixed(2)}</div>
                      </Card>
                      <Card className="bg-green-50 p-4">
                        <Label className="text-[10px] uppercase font-bold text-green-600">Entradas</Label>
                        <div className="text-lg font-bold text-green-700">
                          R$ {transactions.filter(t => t.cashier_session_id === selectedSessionDetails.id && t.type === 'income').reduce((acc, t) => acc + t.amount, 0).toFixed(2)}
                        </div>
                      </Card>
                      <Card className="bg-red-50 p-4">
                        <Label className="text-[10px] uppercase font-bold text-red-600">Saídas</Label>
                        <div className="text-lg font-bold text-red-700">
                          R$ {
                            transactions.filter(t => t.cashier_session_id === selectedSessionDetails.id && t.type === 'expense').reduce((acc, t) => acc + t.amount, 0).toFixed(2)
                          }
                        </div>
                      </Card>
                      <Card className="bg-blue-50 p-4">
                        <Label className="text-[10px] uppercase font-bold text-blue-600">Final</Label>
                        <div className="text-lg font-bold text-blue-700">
                          R$ {selectedSessionDetails.closing_balance?.toFixed(2) || (
                            selectedSessionDetails.opening_balance + 
                            transactions.filter(t => t.cashier_session_id === selectedSessionDetails.id && t.type === 'income').reduce((acc, t) => acc + t.amount, 0) -
                            transactions.filter(t => t.cashier_session_id === selectedSessionDetails.id && t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
                          ).toFixed(2)}
                        </div>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-bold border-b pb-1 flex items-center gap-2">
                        <PieIcon className="h-4 w-4 text-primary" /> Resumo por Forma de Pagamento
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {(() => {
                          const incomeByMethod: Record<string, number> = {};
                          transactions
                            .filter(t => t.cashier_session_id === selectedSessionDetails.id && t.type === 'income')
                            .forEach(t => {
                              // Tenta extrair entre parênteses: "Venda Caixa Pedido #... (Dinheiro)"
                              const match = t.description.match(/\((.*?)\)/);
                              const method = match ? match[1] : 'Outros';
                              incomeByMethod[method] = (incomeByMethod[method] || 0) + t.amount;
                            });
                          
                          if (Object.keys(incomeByMethod).length === 0) return <div className="col-span-full text-center py-4 text-muted-foreground text-sm italic">Nenhuma venda registrada.</div>;

                          return Object.entries(incomeByMethod)
                            .sort((a, b) => b[1] - a[1])
                            .map(([method, total]) => (
                              <Card key={method} className="p-3 bg-card border-primary/10 shadow-sm flex flex-col items-center justify-center text-center">
                                <span className="text-[10px] font-black uppercase text-muted-foreground mb-1">{method}</span>
                                <span className="text-sm font-bold text-primary">R$ {total.toFixed(2)}</span>
                              </Card>
                            ));
                        })()}
                      </div>
                    </div>


                    <div className="space-y-4">
                      <h3 className="font-bold border-b pb-1">Vendas e Entradas</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Descrição</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions.filter(t => t.cashier_session_id === selectedSessionDetails.id && t.type === 'income').map(t => (
                            <TableRow key={t.id}>
                              <TableCell className="text-sm">{t.description}</TableCell>
                              <TableCell className="text-right font-medium text-green-600">R$ {t.amount.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                          {transactions.filter(t => t.cashier_session_id === selectedSessionDetails.id && t.type === 'income').length === 0 && (
                            <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground italic py-2 text-xs">Nenhuma entrada</TableCell></TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-bold border-b pb-1">Despesas e Saídas</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Descrição</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {/* Transações de despesa */}
                          {transactions.filter(t => t.cashier_session_id === selectedSessionDetails.id && t.type === 'expense').map(t => (
                            <TableRow key={t.id}>
                              <TableCell className="text-sm">{t.description}</TableCell>
                              <TableCell className="text-right font-medium text-red-600">- R$ {t.amount.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                          {/* Viagens de motoqueiros (Apenas se não houver transação correspondente no financeiro) */}
                          {driverTrips
                            .filter(trip => 
                              trip.cashier_session_id === selectedSessionDetails.id && 
                              !transactions.some(t => t.description.includes(`#${trip.notes?.split('#')[1] || ''}`) && t.type === 'expense')
                            )
                            .map(trip => (
                              <TableRow key={trip.id}>
                                <TableCell className="text-sm">Entrega: {trip.drivers?.name} ({trip.notes || 'Taxa de Entrega'})</TableCell>
                                <TableCell className="text-right font-medium text-red-600">- R$ {trip.total_fee.toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          {transactions.filter(t => t.cashier_session_id === selectedSessionDetails.id && t.type === 'expense').length === 0 && 
                           driverTrips.filter(t => t.cashier_session_id === selectedSessionDetails.id).length === 0 && (
                            <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground italic py-2 text-xs">Nenhuma saída</TableCell></TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <Card>
                <CardHeader><CardTitle>Fluxo de Caixa (Relatório)</CardTitle></CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cashierSessions.filter(s => s.status === 'closed').reverse()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="opened_at" tickFormatter={(val) => new Date(val).toLocaleDateString('pt-BR')} />
                      <YAxis />
                      <Tooltip labelFormatter={(val) => new Date(val).toLocaleString('pt-BR')} />
                      <Legend />
                      <Line type="monotone" dataKey="closing_balance" stroke="#2563eb" name="Saldo Final" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Distribuição de Despesas</CardTitle></CardHeader>
                <CardContent className="h-[300px]">
                   <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Despesas Gerais', value: transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0) },
                          { name: 'Taxas Motoqueiros', value: driverTrips.reduce((acc, t) => acc + t.total_fee, 0) }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        <Cell fill="#ef4444" />
                        <Cell fill="#f97316" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payment_methods_tab" className="space-y-6 animate-in fade-in duration-500">
            <Card className="border-indigo-100 shadow-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b border-indigo-100 pb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle className="text-2xl font-black text-indigo-900 flex items-center gap-2 italic">
                      <DollarSign className="h-7 w-7 text-indigo-600" /> FORMAS DE PAGAMENTO
                    </CardTitle>
                    <CardDescription className="text-indigo-700 font-medium">Gerencie as opções de pagamento disponíveis no seu caixa.</CardDescription>
                  </div>
                  <Dialog open={isPayMethodDialogOpen} onOpenChange={setIsPayMethodDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="bg-indigo-600 hover:bg-indigo-700 gap-2 font-bold shadow-lg h-10 px-6 active:scale-95 transition-all"
                        onClick={() => {
                          setEditingPayMethod(null);
                          setNewPayMethod({ name: "", chart_account_id: "" });
                          setIsPayMethodDialogOpen(true);
                        }}
                      >
                        <Plus className="h-5 w-5" /> Nova Forma de Pagamento
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingPayMethod ? "Editar Forma de Pagamento" : "Cadastrar Forma de Pagamento"}</DialogTitle>
                        <DialogDescription>
                          {editingPayMethod ? "Atualize as configurações desta forma de pagamento." : "Adicione uma nova opção para recebimento em seu caixa."}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Nome da Forma</Label>
                          <Input 
                            value={newPayMethod.name} 
                            onChange={e => setNewPayMethod({...newPayMethod, name: e.target.value})}
                            placeholder="Ex: Cartão Alimentação, Transferência..." 
                            className="focus-visible:ring-indigo-500" 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Conta DRE (Opcional)</Label>
                          <Select 
                            value={newPayMethod.chart_account_id} 
                            onValueChange={v => setNewPayMethod({...newPayMethod, chart_account_id: v})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a conta DRE..." />
                            </SelectTrigger>
                            <SelectContent>
                              {chartAccounts
                                .filter(c => (c.level === 3 || c.level === 2) && (c.type === 'revenue' || c.code.startsWith('1')))
                                .map(c => (
                                  <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <Button 
                          className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold h-11"
                          onClick={async () => {
                            if (!newPayMethod.name) return toast.error("Nome obrigatório");
                            
                            const payload = { 
                              name: newPayMethod.name,
                              chart_account_id: newPayMethod.chart_account_id || null
                            };

                            let error;
                            if (editingPayMethod) {
                              const { error: updateError } = await supabase.from("payment_methods").update(payload).eq("id", editingPayMethod.id);
                              error = updateError;
                            } else {
                              const { error: insertError } = await supabase.from("payment_methods").insert([payload]);
                              error = insertError;
                            }

                            if (error) toast.error(error.message);
                            else {
                              toast.success(editingPayMethod ? "Forma de pagamento atualizada!" : "Forma de pagamento cadastrada!");
                              setNewPayMethod({ name: "", chart_account_id: "" });
                              setEditingPayMethod(null);
                              setIsPayMethodDialogOpen(false);
                              fetchData();
                            }
                          }}
                        >
                          {editingPayMethod ? "Salvar Alterações" : "Confirmar Cadastro"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-6 bg-muted/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {paymentMethods.map((method) => (
                    <Card key={method.id} className="bg-card border-none shadow-md hover:shadow-lg transition-all group overflow-hidden">
                      <div className="h-1 bg-indigo-500 w-full opacity-50 group-hover:opacity-100 transition-opacity" />
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-indigo-50 p-3 rounded-2xl group-hover:bg-indigo-600 group-hover:rotate-6 transition-all duration-300">
                            <Wallet className="h-5 w-5 text-indigo-600 group-hover:text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-black text-sm text-foreground uppercase tracking-tighter truncate block">{method.name}</span>
                            <div className="flex flex-col gap-0.5 mt-0.5">
                              <p className={`text-[10px] font-bold ${method.is_active ? 'text-green-500' : 'text-red-400'}`}>
                                {method.is_active ? 'DISPONÍVEL NO CAIXA' : 'DESATIVADO'}
                              </p>
                              <div className="text-[9px] text-slate-400 truncate max-w-[120px]">
                                {chartAccounts.find(ca => ca.id === (method as any).chart_account_id)?.name || "Sem conta DRE"}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            onClick={() => {
                              setEditingPayMethod(method);
                              setNewPayMethod({ 
                                name: method.name, 
                                chart_account_id: (method as any).chart_account_id || "" 
                              });
                              setIsPayMethodDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Switch 
                            checked={method.is_active} 
                            onCheckedChange={async (val) => {
                              const { error } = await supabase.from("payment_methods").update({ is_active: val }).eq("id", method.id);
                              if (error) toast.error(error.message);
                              else fetchData();
                            }}
                            className="data-[state=checked]:bg-green-500"
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive/40 hover:text-destructive hover:bg-red-50 transition-colors"
                            onClick={async () => {
                              if (true) {
                                const { error } = await supabase.from("payment_methods").delete().eq("id", method.id);
                                if (error) toast.error(error.message);
                                else fetchData();
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="suppliers_tab" className="space-y-6">
            <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Carregando...</div>}>
              <SuppliersManager />
            </Suspense>
          </TabsContent>
          <TabsContent value="drivers" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Motoqueiros</h2>
              <Dialog open={isDriverDialogOpen} onOpenChange={setIsDriverDialogOpen}>
                <DialogTrigger asChild><Button className="rounded-full gap-2"><Plus className="h-5 w-5" /> Novo Motoqueiro</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{editingDriver ? 'Editar Motoqueiro' : 'Novo Motoqueiro'}</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2"><Label>Nome</Label><Input value={newDriver.name} onChange={e => setNewDriver({...newDriver, name: e.target.value})} /></div>
                    <div className="space-y-2"><Label>Celular</Label><Input value={newDriver.phone} onChange={e => setNewDriver({...newDriver, phone: e.target.value})} /></div>
                    <div className="space-y-2"><Label>Diária (R$)</Label><Input type="number" value={newDriver.daily_rate} onChange={e => setNewDriver({...newDriver, daily_rate: e.target.value})} /></div>
                    <div className="space-y-2">
                      <Label>Login / Usuário</Label>
                      <div className="relative">
                        <Input 
                          placeholder="usuário"
                          value={newDriver.login} 
                          onChange={e => setNewDriver({...newDriver, login: e.target.value.split("@")[0]})} 
                          className="pr-40"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground/40 pointer-events-none">
                          {FIXED_DOMAIN}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2"><Label>Senha</Label><Input type="password" value={newDriver.password} onChange={e => setNewDriver({...newDriver, password: e.target.value})} /></div>
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch id="driver-active" checked={newDriver.active} onCheckedChange={(val) => setNewDriver({...newDriver, active: val})} />
                      <Label htmlFor="driver-active" className="text-xs font-bold uppercase">Entregador Ativo (Login)</Label>
                    </div>
                    {/* Campos de taxa fixa removidos conforme solicitado */}

                    <Button onClick={handleSaveDriver} className="bg-orange-600 hover:bg-orange-700 text-white">Salvar Motoqueiro</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <Card>
              <Table>
                <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Celular</TableHead><TableHead>Diária</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                <TableBody>
                  {drivers.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell>{d.phone}</TableCell>
                      <TableCell>R$ {Number(d.daily_rate).toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge 
                            variant={d.is_active ? "default" : "secondary"} 
                            className="cursor-pointer justify-center"
                            onClick={() => toggleDriverActive(d)}
                          >
                            {d.is_active ? "Em Turno" : "Fora de Turno"}
                          </Badge>
                          <Badge 
                            variant={d.active !== false ? "outline" : "destructive"}
                            className="text-[10px] justify-center"
                          >
                            {d.active !== false ? "Login Ativo" : "Login Bloqueado"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => { 
                          setEditingDriver(d); 
                          setNewDriver({ 
                             name: d.name, 
                             phone: d.phone, 
                             daily_rate: d.daily_rate.toString(),
                             login: (d.login || "").split("@")[0],
                             password: d.password || "",
                             has_fixed_fee: false,
                             fixed_fee: "",
                             active: d.active !== false
                           });

                          setIsDriverDialogOpen(true);
                        }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteDriver(d.id)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="delivery_zones" className="space-y-6">
            <Suspense fallback={null}>
              <DeliveryZonesPanel ctx={{
                isDeliveryAreaDialogOpen,
                setIsDeliveryAreaDialogOpen,
                editingDeliveryArea,
                setEditingDeliveryArea,
                newDeliveryArea,
                setNewDeliveryArea,
                areaForm,
                setAreaForm,
                mapSearch,
                setMapSearch,
                isMapMaximized,
                setIsMapMaximized,
                deliveryAreas,
                storeSettings,
                setLoading,
                fetchData,
                AdminDeliveryMapComponent,
              }} />
            </Suspense>
          </TabsContent>
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Usuários Admin</h2>
              <Dialog open={isUserDialogOpen} onOpenChange={(open) => {
                setIsUserDialogOpen(open);
                if (!open) setNewUser({ email: "", password: "", fullName: "", role: "funcionario", canDelete: false, isKdsOnly: false });
              }}>
                <DialogTrigger asChild><Button className="rounded-full gap-2" onClick={() => setNewUser({ email: "", password: "", fullName: "", role: "funcionario", canDelete: false, isKdsOnly: false })}><Plus className="h-5 w-5" /> Novo Acesso</Button></DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                  <DialogHeader><DialogTitle>{newUser.id ? 'Editar Acesso' : 'Criar Novo Acesso'}</DialogTitle></DialogHeader>
                  <div className="grid gap-3 py-2">

                    <div className="space-y-2"><Label>Nome Completo</Label><Input value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})} /></div>
                    <div className="space-y-2">
                      <Label>E-mail / Usuário</Label>
                      <div className="relative">
                        <Input 
                          placeholder="usuário"
                          value={newUser.email.split("@")[0]} 
                          onChange={e => setNewUser({...newUser, email: e.target.value.split("@")[0]})} 
                          className="pr-40"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground/40 pointer-events-none">
                          {FIXED_DOMAIN}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2"><Label>Senha</Label><Input type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} /></div>
                    <div className="space-y-2">
                      <Label>Nível de Acesso</Label>
                      <Select value={newUser.role} onValueChange={val => {
                        const next: any = { ...newUser, role: val };
                        if (val === 'funcionario' && (!newUser.allowedModules || newUser.allowedModules.length === 0)) {
                          next.allowedModules = [...DEFAULT_FUNCIONARIO_MODULES];
                        }
                        if (val === 'funcionario' && !Array.isArray(newUser.visibleFields)) {
                          next.visibleFields = [...DEFAULT_FUNCIONARIO_VISIBLE_FIELDS];
                        }
                        setNewUser(next);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cargo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="master">Master (Total)</SelectItem>
                          <SelectItem value="administrador">Administrador</SelectItem>
                          <SelectItem value="funcionario">Funcionário</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newUser.role === 'funcionario' && (
                      <div className="space-y-2 p-3 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/20">
                        <Label className="text-xs font-bold uppercase tracking-wider">Módulos Permitidos</Label>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-1">
                          {ALL_MODULES.map((m) => {
                            const checked = (newUser.allowedModules || []).includes(m.id);
                            return (
                              <label key={m.id} className="flex items-center justify-between gap-2 py-0.5 cursor-pointer">
                                <span className="text-xs truncate">{m.label}</span>
                                <Switch
                                  className="scale-75"
                                  checked={checked}
                                  onCheckedChange={(v) => {
                                    const curr: string[] = newUser.allowedModules || [];
                                    const nextMods = v ? Array.from(new Set([...curr, m.id])) : curr.filter((x) => x !== m.id);
                                    setNewUser({ ...newUser, allowedModules: nextMods });
                                  }}
                                />
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {newUser.role === 'funcionario' && (() => {
                      const allowed: string[] = newUser.allowedModules || [];
                      const availableFields = ALL_FIELDS.filter(f => allowed.includes(f.module));
                      if (availableFields.length === 0) return null;
                      const byGroup = availableFields.reduce<Record<string, typeof ALL_FIELDS>>((acc, f) => {
                        (acc[f.group] = acc[f.group] || []).push(f);
                        return acc;
                      }, {});
                      const visible: string[] = newUser.visibleFields || [];
                      return (
                        <details open className="group p-3 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/20">
                          <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider flex items-center justify-between">
                            <span>Campos Visíveis</span>
                            <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                          </summary>
                          <div className="mt-2 space-y-3">
                            {Object.entries(byGroup).map(([groupLabel, fields]) => (
                              <div key={groupLabel} className="space-y-1">
                                <div className="text-[10px] font-black uppercase text-muted-foreground/80 tracking-wider">{groupLabel}</div>
                                <div className="grid grid-cols-1 gap-x-3 gap-y-1">
                                  {fields.map(f => {
                                    const checked = visible.includes(f.id);
                                    return (
                                      <label key={f.id} className="flex items-center justify-between gap-2 py-0.5 cursor-pointer">
                                        <span className="text-xs truncate">{f.label}</span>
                                        <Switch
                                          className="scale-75"
                                          checked={checked}
                                          onCheckedChange={(v) => {
                                            const curr: string[] = newUser.visibleFields || [];
                                            const nextFields = v
                                              ? Array.from(new Set([...curr, f.id]))
                                              : curr.filter((x) => x !== f.id);
                                            setNewUser({ ...newUser, visibleFields: nextFields });
                                          }}
                                        />
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </details>
                      );
                    })()}
                    <div className="flex flex-col gap-4 p-4 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/20">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-bold flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-orange-500" /> Acesso KDS Apenas
                          </Label>
                          <p className="text-[10px] text-muted-foreground">O usuário será levado direto para a produção ao logar</p>
                        </div>
                        <Switch 
                          checked={newUser.isKdsOnly} 
                          onCheckedChange={(checked) => setNewUser({...newUser, isKdsOnly: checked})} 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-bold flex items-center gap-2">
                            <Trash2 className="h-4 w-4 text-red-500" /> Permissão de Exclusão
                          </Label>
                          <p className="text-[10px] text-muted-foreground">Permite excluir pedidos, produtos e registros do sistema</p>
                        </div>
                        <Switch 
                          checked={newUser.canDelete} 
                          onCheckedChange={(checked) => setNewUser({...newUser, canDelete: checked})} 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-bold flex items-center gap-2">
                            <XCircleIcon className="h-4 w-4 text-orange-500" /> Permissão Cancelamento
                          </Label>
                          <p className="text-[10px] text-muted-foreground">Permite excluir pedidos já enviados para produção</p>
                        </div>
                        <Switch 
                          checked={newUser.canCancel} 
                          onCheckedChange={(checked) => setNewUser({...newUser, canCancel: checked})} 
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border border-border/50">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-bold uppercase tracking-wider">Ativo</Label>
                          <p className="text-[10px] text-muted-foreground italic">Permitir login no sistema</p>
                        </div>
                        <Switch 
                          checked={newUser.active} 
                          onCheckedChange={(checked) => setNewUser({...newUser, active: checked})} 
                        />
                      </div>
                    </div>
                    <Button onClick={handleCreateUser}>{newUser.id ? 'Atualizar' : 'Cadastrar'}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <Card>
              <Table>
                <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>E-mail</TableHead><TableHead>Cargo</TableHead><TableHead>Login</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                <TableBody>
        {profiles.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.full_name}</TableCell>
                      <TableCell>{p.email}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={p.role === 'master' ? 'default' : p.role === 'administrador' ? 'secondary' : 'outline'}
                          className={cn(
                            p.role === 'master' && "bg-purple-600 hover:bg-purple-700",
                            p.role === 'administrador' && "bg-blue-600 text-white hover:bg-blue-700"
                          )}
                        >
                          {p.role === 'master' ? 'Master' : p.role === 'administrador' ? 'Admin' : 'Funcionário'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={p.active !== false ? "outline" : "destructive"} className="text-[10px]">
                          {p.active !== false ? 'Ativo' : 'Desativado'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => {
                          setNewUser({
                            id: p.id,
                            email: p.email.split("@")[0],
                            password: (p as any).password,
                            fullName: p.full_name,
                            role: p.role || "funcionario",
                            canDelete: p.can_delete,
                            canCancel: p.can_cancel,
                            isKdsOnly: p.is_kds_only,
                            allowedModules: Array.isArray((p as any).allowed_modules) ? (p as any).allowed_modules : [],
                            visibleFields: Array.isArray((p as any).visible_fields) ? (p as any).visible_fields : [],
                            active: p.active !== false
                          });



                          setIsUserDialogOpen(true);
                        }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={async () => {
                          const isCurrentUserAdmin = user?.role === 'master' || user?.role === 'administrador';
                          if (!isCurrentUserAdmin) {
                            toast.error("Somente administradores ou master podem excluir usuários.");
                            return;
                          }
                          if (!user?.can_delete) {
                            toast.error("Você não tem permissão para excluir usuários.");
                            return;
                          }
                          if (true) {
                            try {
                              setLoading(true);
                              const { error } = await supabase.from("profiles").delete().eq("id", p.id);
                              if (error) throw error;
                              toast.success("Usuário removido com sucesso!");
                              fetchData();
                            } catch (err: any) {
                              toast.error(err.message || "Erro ao excluir usuário.");
                            } finally {
                              setLoading(false);
                            }
                          }
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {profiles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                        Nenhum usuário cadastrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Categorias</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="rounded-full gap-2" onClick={() => {
                      setEditingCategory(null);
                      setNewCategory({ name: "", order: "", image_url: "" });
                    }}>
                      <Plus className="h-5 w-5" /> Nova Categoria
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingCategory ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      {newCategory.image_url && (
                        <div className="flex justify-center mb-2">
                          <div className="h-24 md:h-32 w-full rounded-2xl border overflow-hidden bg-muted shadow-sm">
                            <img src={newCategory.image_url} alt="Preview" className="h-full w-full object-cover" />
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label>Nome da Categoria</Label>
                        <Input 
                          placeholder="Ex: Pizzas, Bebidas..." 
                          value={newCategory.name} 
                          onChange={e => setNewCategory({...newCategory, name: e.target.value})} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Banner da Categoria (Opcional)</Label>
                        <div className="flex gap-2">
                          <Input 
                            value={newCategory.image_url || ""} 
                            onChange={e => setNewCategory({...newCategory, image_url: e.target.value})} 
                            placeholder="URL da imagem..." 
                            className="text-xs"
                          />
                          <div className="relative shrink-0">
                            <input
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const input = e.currentTarget;
                                const file = input?.files?.[0];
                                if (!file) return;
                                try {
                                  setImageUploading(true);
                                  const publicUrl = await uploadMenuImage(file, 'cat', 1200);
                                  setNewCategory((current) => ({...current, image_url: publicUrl}));
                                  toast.success("Imagem enviada!");
                                } catch (error: any) {
                                  console.error('[upload categoria]', error);
                                  toast.error("Erro no upload: " + (error?.message || 'falha desconhecida'));
                                } finally {
                                  setImageUploading(false);
                                  try { if (input) input.value = ''; } catch {}
                                }
                              }}
                            />
                            <Button variant="outline" type="button" size="icon" disabled={imageUploading}>
                              {imageUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            </Button>
                          </div>
                          {newCategory.image_url && (
                            <Button 
                              variant="outline" 
                              type="button" 
                              size="icon" 
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => {
                                setNewCategory((prev) => ({ ...prev, image_url: "" }));
                                toast.success("Imagem removida");
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground italic">Recomendado: 800x200px para banners.</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Ordem de Exibição</Label>
                        <Input 
                          placeholder="Ex: 1, 2, 3..." 
                          type="number" 
                          value={newCategory.order} 
                          onChange={e => setNewCategory({...newCategory, order: e.target.value})} 
                        />
                      </div>
                      <Button onClick={async () => {
                        await handleAddCategory();
                        // O formulário é limpo dentro de handleAddCategory
                      }} disabled={loading} className="w-full">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (editingCategory ? "Atualizar" : "Salvar")}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <Card>
              <Table>
                <TableHeader><TableRow><TableHead>Ordem</TableHead><TableHead>Nome</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                <TableBody>
                  {categories.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="w-20">{c.order || 0}</TableCell>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-right flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => {
                              setEditingCategory(c);
                              setNewCategory({
                                name: c.name,
                                order: (c.order || 0).toString(),
                                image_url: (c as any).image_url || ""
                              });
                            }}><Pencil className="h-4 w-4" /></Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar Categoria</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              {newCategory.image_url && (
                                <div className="flex justify-center mb-2">
                                  <div className="h-24 md:h-32 w-full rounded-2xl border overflow-hidden bg-muted shadow-sm">
                                    <img src={newCategory.image_url} alt="Preview" className="h-full w-full object-cover" />
                                  </div>
                                </div>
                              )}
                              <div className="space-y-2">
                                <Label>Nome da Categoria</Label>
                                <Input 
                                  value={newCategory.name} 
                                  onChange={e => setNewCategory({...newCategory, name: e.target.value})} 
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Banner da Categoria (Opcional)</Label>
                                <div className="flex gap-2">
                                  <Input 
                                    value={newCategory.image_url || ""} 
                                    onChange={e => setNewCategory({...newCategory, image_url: e.target.value})} 
                                    placeholder="URL da imagem..." 
                                    className="text-xs"
                                  />
                                  <div className="relative shrink-0">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                      onChange={async (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const input = e.currentTarget;
                                        const file = input?.files?.[0];
                                        if (!file) return;
                                        try {
                                          setImageUploading(true);
                                          const publicUrl = await uploadMenuImage(file, 'cat', 1200);
                                          setNewCategory((current) => ({...current, image_url: publicUrl}));
                                          toast.success("Imagem enviada!");
                                        } catch (error: any) {
                                          console.error('[upload categoria]', error);
                                          toast.error("Erro no upload: " + (error?.message || 'falha desconhecida'));
                                        } finally {
                                          setImageUploading(false);
                                          try { if (input) input.value = ''; } catch {}
                                        }
                                      }}
                                    />
                                    <Button variant="outline" type="button" size="icon" disabled={imageUploading}>
                                      {imageUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                    </Button>
                                  </div>
                                  {newCategory.image_url && (
                                    <Button 
                                      variant="outline" 
                                      type="button" 
                                      size="icon" 
                                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                      onClick={() => {
                                        setNewCategory((prev) => ({ ...prev, image_url: "" }));
                                        toast.success("Imagem removida");
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Ordem de Exibição</Label>
                                <Input 
                                  type="number" 
                                  value={newCategory.order} 
                                  onChange={e => setNewCategory({...newCategory, order: e.target.value})} 
                                />
                              </div>
                              <Button onClick={handleAddCategory} disabled={loading} className="w-full">
                                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Atualizar"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={async () => {
                          if (true) {
                            await supabase.from("categories").delete().eq("id", c.id);
                            fetchData(true, true);
                          }
                        }}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
          <TabsContent value="customers_tab" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold">Gestão de Clientes</h2>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar por nome ou celular..." 
                    className="pl-10 w-64 rounded-full" 
                    value={customerFilter.search}
                    onChange={(e) => setCustomerFilter(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                
                <Select 
                  value={customerFilter.person_type} 
                  onValueChange={(v) => setCustomerFilter(prev => ({ ...prev, person_type: v }))}
                >
                  <SelectTrigger className="w-40 rounded-full">
                    <SelectValue placeholder="Tipo de Pessoa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="fisica">Pessoa Física</SelectItem>
                    <SelectItem value="juridica">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>

                <Dialog open={isCustomerDialogOpen} onOpenChange={(open) => {
                  setIsCustomerDialogOpen(open);
                  if (!open) {
                    setEditingCustomer(null);
                    setNewCustomer({ 
                      name: "", email: "", phone: "", address: "", address_number: "", neighborhood: "", city: "", state: "", zip_code: "", address_complement: "",
                      person_type: "fisica", cpf: "", cnpj: "", allow_fiado: false
                    });
                  }
                }}>
                  <Button
                    variant="outline"
                    onClick={printCustomersReport}
                    className="rounded-full gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Printer className="h-4 w-4" /> Relatório
                  </Button>
                  <DialogTrigger asChild>
                    <Button className="rounded-full gap-2 bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-5 w-5" /> Novo Cliente
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingCustomer ? "Editar Cliente" : "Cadastrar Novo Cliente"}</DialogTitle>
                      <DialogDescription>{editingCustomer ? "Atualize os dados do cliente no banco de dados." : "Preencha os dados para salvar no banco de dados."}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Tipo de Pessoa</Label>
                          <Select 
                            value={newCustomer.person_type} 
                            onValueChange={(v: "fisica" | "juridica") => setNewCustomer({...newCustomer, person_type: v})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fisica">Pessoa Física</SelectItem>
                              <SelectItem value="juridica">Pessoa Jurídica</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          {newCustomer.person_type === 'fisica' ? (
                            <>
                              <Label>CPF</Label>
                              <Input 
                                placeholder="000.000.000-00" 
                                value={newCustomer.cpf} 
                                onChange={e => {
                                  const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                                  let formatted = val;
                                  if (val.length > 3) formatted = val.slice(0, 3) + '.' + val.slice(3);
                                  if (val.length > 6) formatted = formatted.slice(0, 7) + '.' + formatted.slice(7);
                                  if (val.length > 9) formatted = formatted.slice(0, 11) + '-' + formatted.slice(11);
                                  setNewCustomer({...newCustomer, cpf: formatted});
                                }} 
                              />
                            </>
                          ) : (
                            <>
                              <Label>CNPJ</Label>
                              <Input 
                                placeholder="00.000.000/0000-00" 
                                value={newCustomer.cnpj} 
                                onChange={e => {
                                  const val = e.target.value.replace(/\D/g, '').slice(0, 14);
                                  let formatted = val;
                                  if (val.length > 2) formatted = val.slice(0, 2) + '.' + val.slice(2);
                                  if (val.length > 5) formatted = formatted.slice(0, 6) + '.' + formatted.slice(6);
                                  if (val.length > 8) formatted = formatted.slice(0, 10) + '/' + formatted.slice(10);
                                  if (val.length > 12) formatted = formatted.slice(0, 15) + '-' + formatted.slice(15);
                                  setNewCustomer({...newCustomer, cnpj: formatted});
                                }} 
                              />
                            </>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nome Completo / Razão Social</Label>
                          <Input value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Telefone</Label>
                          <Input value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} />
                        </div>
                      </div>
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-8 space-y-2">
                          <Label>Endereço</Label>
                          <Input value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} />
                        </div>
                        <div className="col-span-4 space-y-2">
                          <Label>Número</Label>
                          <Input value={newCustomer.address_number} onChange={e => setNewCustomer({...newCustomer, address_number: e.target.value})} />
                        </div>
                      </div>
                      <div className="grid grid-cols-12 gap-4 bg-blue-50/30 p-4 rounded-xl border border-blue-100 shadow-sm">
                        <div className="col-span-4 space-y-2">
                          <Label className="text-blue-700 font-bold">CEP (Pesquisar)</Label>
                          <Input 
                            placeholder="00000-000"
                            className="border-blue-200 focus-visible:ring-blue-500 bg-card"
                            value={newCustomer.zip_code} 
                            onChange={e => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 8);
                              setNewCustomer({...newCustomer, zip_code: val});
                              if (val.length === 8) {
                                fetchAddressByCep(val, 'customer');
                              }
                            }} 
                          />
                        </div>
                        <div className="col-span-3 space-y-2">
                          <Label>Cidade</Label>
                          <Input value={newCustomer.city} onChange={e => setNewCustomer({...newCustomer, city: e.target.value})} />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label>UF</Label>
                          <Input maxLength={2} placeholder="SP" value={newCustomer.state} onChange={e => setNewCustomer({...newCustomer, state: e.target.value.toUpperCase()})} />
                        </div>
                        <div className="col-span-3 space-y-2">
                          <Label>Bairro</Label>
                          <Input value={newCustomer.neighborhood} onChange={e => setNewCustomer({...newCustomer, neighborhood: e.target.value})} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Complemento</Label>
                        <Input value={newCustomer.address_complement} onChange={e => setNewCustomer({...newCustomer, address_complement: e.target.value})} />
                      </div>
                      <div className="flex items-center space-x-2 bg-orange-50 p-3 rounded-lg border border-orange-100">
                        <Switch 
                          id="allow-fiado" 
                          checked={newCustomer.allow_fiado} 
                          onCheckedChange={(v) => setNewCustomer({...newCustomer, allow_fiado: v})}
                        />
                        <div className="space-y-0.5">
                          <Label htmlFor="allow-fiado" className="text-sm font-bold text-orange-900">Permitir Venda a Prazo (Caderneta)</Label>
                          <p className="text-[10px] text-orange-600 font-medium">Habilita esta forma de pagamento para este cliente.</p>
                        </div>
                      </div>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={async () => {
                        const required: Array<[string, string]> = [
                          ["name", "Nome"],
                          ["phone", "Telefone"],
                          ["address", "Endereço"],
                          ["address_number", "Número"],
                          ["zip_code", "CEP"],
                          ["city", "Cidade"],
                          ["neighborhood", "Bairro"],
                        ];
                        for (const [k, label] of required) {
                          if (!String((newCustomer as any)[k] ?? "").trim()) {
                            return toast.error(`${label} é obrigatório`);
                          }
                        }
                        
                        let error;
                        if (editingCustomer) {
                          const { error: updateError } = await supabase.from("customers").update(newCustomer).eq("id", editingCustomer.id);
                          error = updateError;
                        } else {
                          const { error: insertError } = await supabase.from("customers").insert([newCustomer]);
                          error = insertError;
                        }

                        if (error) toast.error(error.message);
                        else {
                          toast.success(editingCustomer ? "Cliente atualizado!" : "Cliente cadastrado!");
                          setNewCustomer({ 
                            name: "", email: "", phone: "", address: "", address_number: "", neighborhood: "", city: "", state: "", zip_code: "", address_complement: "",
                            person_type: "fisica", cpf: "", cnpj: "", allow_fiado: false
                          });
                          setEditingCustomer(null);
                          setIsCustomerDialogOpen(false);
                          fetchData();
                        }
                      }}>{editingCustomer ? "Atualizar Cliente" : "Salvar Cliente"}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Card className="border-none shadow-lg">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-bold">Cliente</TableHead>
                    <TableHead className="font-bold">Tipo / Doc</TableHead>
                    <TableHead className="font-bold">Contato</TableHead>
                    <TableHead className="font-bold">Endereço Principal</TableHead>
                    <TableHead className="font-bold">Cidade/Bairro</TableHead>
                    <TableHead className="text-right font-bold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers
                    .filter(c => {
                      const searchLower = customerFilter.search.toLowerCase();
                      const matchesSearch = c.name.toLowerCase().includes(searchLower) || (c.phone && c.phone.includes(searchLower));
                      const matchesType = customerFilter.person_type === 'all' || (c as any).person_type === customerFilter.person_type;
                      return matchesSearch && matchesType;
                    })
                    .map(c => (
                    <TableRow key={c.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{c.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <Badge variant="outline" className="w-fit mb-1">
                            {(c as any).person_type === 'fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                          </Badge>
                          <span className="text-muted-foreground">
                            {(c as any).person_type === 'fisica' ? (c as any).cpf || '-' : (c as any).cnpj || '-'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-muted-foreground" /> {c.phone || '-'}</span>
                          <span className="text-xs text-muted-foreground">{(c as any).email || ''}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm">
                        {(c as any).address ? `${(c as any).address}, ${(c as any).address_number || 'S/N'}` : '-'}
                        {(c as any).address_complement && <span className="block text-xs text-muted-foreground italic">{(c as any).address_complement}</span>}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex flex-col">
                          <span>{(c as any).neighborhood || '-'}</span>
                          <span className="text-xs text-muted-foreground">{(c as any).city || '-'} / {(c as any).state || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => {
                          setEditingCustomer(c);
                          setNewCustomer({
                            name: c.name,
                            email: (c as any).email || "",
                            phone: c.phone || "",
                            address: (c as any).address || "",
                            address_number: (c as any).address_number || "",
                            neighborhood: (c as any).neighborhood || "",
                            city: (c as any).city || "",
                            state: (c as any).state || "",
                            zip_code: (c as any).zip_code || "",
                            address_complement: (c as any).address_complement || "",
                            person_type: (c as any).person_type || "fisica",
                            cpf: (c as any).cpf || "",
                            cnpj: (c as any).cnpj || "",
                            allow_fiado: (c as any).allow_fiado || false
                          });
                          setIsCustomerDialogOpen(true);
                        }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="rounded-full text-destructive" onClick={async (e) => {
                          e.stopPropagation();
                          if (true) {
                            try {
                              setLoading(true);
                              await supabase.from("financial_transactions").delete().eq("customer_id", c.id);
                              await supabase.from("delivery_orders").delete().eq("customer_id", c.id);
                              const { error } = await supabase.from("customers").delete().eq("id", c.id);
                              if (error) throw error;
                              toast.success("Cliente e dados vinculados excluídos!");
                              fetchData();
                            } catch (err: any) {
                              console.error("Erro ao excluir cliente:", err);
                              toast.error("Erro ao excluir: " + (err.message || "Erro desconhecido"));
                            } finally {
                              setLoading(false);
                            }
                          }
                        }}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {customers.filter(c => {
                    const searchLower = customerFilter.search.toLowerCase();
                    const matchesSearch = c.name.toLowerCase().includes(searchLower) || (c.phone && c.phone.includes(searchLower));
                    const matchesType = customerFilter.person_type === 'all' || (c as any).person_type === customerFilter.person_type;
                    return matchesSearch && matchesType;
                  }).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-20 text-center text-muted-foreground italic">
                        Nenhum cliente encontrado com os filtros aplicados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
          <TabsContent value="complements_admin">
            <div className="bg-card p-6 rounded-3xl border shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-foreground tracking-tighter">Complementos</h2>
                  <p className="text-sm text-muted-foreground font-medium">Gerencie grupos de adicionais, massas e bordas.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button 
                    className="flex-1 sm:flex-none bg-orange-600 hover:bg-orange-700 rounded-full font-bold"
                    onClick={() => {
                      setEditingCompGroup(null);
                      setNewCompGroup({ name: "", min_choices: 0, max_choices: 1 });
                      setSelectedCompGroupCategoryIds([]);
                      setSelectedCompGroupProductIds([]);
                      setIsCompGroupDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Novo Grupo
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1 sm:flex-none border-orange-200 text-orange-600 hover:bg-orange-50 rounded-full font-bold"
                    onClick={() => {
                      setEditingComplement(null);
                      setNewComplement({ name: "", price: "0", group_id: complementGroups[0]?.id || "" });
                      setIsComplementDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Novo Item
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1 sm:flex-none border-orange-200 text-orange-700 hover:bg-orange-50 rounded-full font-bold"
                    onClick={printComplementsReport}
                  >
                    <Printer className="h-4 w-4 mr-2" /> Relatório
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {complementGroups.map((group) => (
                  <Card key={group.id} className="border-orange-100 shadow-sm overflow-hidden group/card relative">
                    <CardHeader className="bg-orange-50/50 border-b border-orange-100 py-3 flex flex-row items-center justify-between space-y-0">
                      <div>
                        <CardTitle className="text-base font-black text-orange-800 tracking-tight">{group.name}</CardTitle>
                        <p className="text-[9px] font-bold text-orange-600/60 uppercase tracking-widest">
                          {group.min_choices > 0 ? 'Obrigatório' : 'Opcional'} • Máx: {group.max_choices}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-orange-600 hover:bg-orange-100" onClick={() => {
                          setEditingCompGroup(group);
                          setNewCompGroup({ 
                            name: String(group.name || ""), 
                            min_choices: Number(group.min_choices || 0), 
                            max_choices: Number(group.max_choices || 1) 
                          });
                          setSelectedCompGroupCategoryIds(categoryComplementGroups.filter(cg => cg.group_id === group.id).map(cg => cg.category_id));
                          setSelectedCompGroupProductIds(productComplementGroups.filter(pg => pg.group_id === group.id).map(pg => pg.product_id));
                          setIsCompGroupDialogOpen(true);
                        }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 rounded-full text-destructive hover:bg-red-50" 
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (true) {
                              try {
                                setLoading(true);
                                const { error } = await supabase.from("complement_groups").delete().eq("id", group.id);
                                if (error) throw error;
                                toast.success("Grupo excluído!");
                                await fetchData(true, true);
                              } catch (err: any) {
                                toast.error("Erro ao excluir: " + err.message);
                              } finally {
                                setLoading(false);
                              }
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-1">
                      {(group.complements || []).map((comp: any) => (
                        <div key={comp.id} className="flex justify-between items-center text-sm py-1.5 border-b border-dashed border-border last:border-0 group/item">
                          <div className="flex flex-col">
                            <span className="font-bold text-muted-foreground">{comp.name}</span>
                            <span className="text-[10px] font-black text-orange-600">
                              {Number(comp.price) > 0 ? `+ R$ ${Number(comp.price).toFixed(2)}` : 'GRÁTIS'}
                            </span>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => {
                              setEditingComplement(comp);
                              setNewComplement({ 
                                name: String(comp.name || ""), 
                                price: String(comp.price || "0"), 
                                group_id: String(group.id || "") 
                              });
                              setIsComplementDialogOpen(true);
                            }}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 rounded-full text-destructive" 
                      onClick={async (e) => {
                                e.stopPropagation();
                                if (true) {
                                  try {
                                    setLoading(true);
                                    const { error } = await supabase.from("complements").delete().eq("id", comp.id);
                                    if (error) throw error;
                                    toast.success("Item excluído!");
                                    await fetchData(true, true);
                                  } catch (err: any) {
                                    toast.error("Erro: " + err.message);
                                  } finally {
                                    setLoading(false);
                                  }
                                }
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {group.complements.length === 0 && (
                        <p className="text-center py-4 text-xs text-slate-400 italic">Nenhum item neste grupo</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Dialog Grupo */}
            <Dialog open={isCompGroupDialogOpen} onOpenChange={setIsCompGroupDialogOpen}>
              <DialogContent className="rounded-3xl">
                <DialogHeader>
                  <DialogTitle>{editingCompGroup ? 'Editar Grupo' : 'Novo Grupo'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-1">
                    <Label>Nome do Grupo</Label>
                    <Input placeholder="Ex: Bordas Recheadas" value={newCompGroup.name} onChange={e => setNewCompGroup(prev => ({...prev, name: e.target.value}))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Mín. Seleções</Label>
                      <Input type="number" value={newCompGroup.min_choices} onChange={e => setNewCompGroup(prev => ({...prev, min_choices: Number(e.target.value)}))} />
                    </div>
                    <div className="space-y-1">
                      <Label>Máx. Seleções</Label>
                      <Input type="number" value={newCompGroup.max_choices} onChange={e => setNewCompGroup(prev => ({...prev, max_choices: Number(e.target.value)}))} />
                    </div>
                  </div>
                  <div className="space-y-2 rounded-2xl border border-orange-100 bg-orange-50/40 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-xs font-black uppercase text-orange-700">Aparece em quais categorias?</Label>
                      <span className="text-[10px] font-bold text-orange-600/70">{selectedCompGroupCategoryIds.length} selecionada(s)</span>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                      {categories.map(category => {
                        const active = selectedCompGroupCategoryIds.includes(category.id);
                        return (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => toggleCompGroupCategory(category.id)}
                            className={`rounded-full border px-3 py-1.5 text-[11px] font-black uppercase transition-all ${active ? 'border-orange-600 bg-orange-600 text-white shadow-sm' : 'border-orange-200 bg-card text-orange-700 hover:bg-orange-100'}`}
                          >
                            {active ? '✓ ' : '+ '}{category.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-2 rounded-2xl border border-blue-100 bg-blue-50/40 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-xs font-black uppercase text-blue-700">Aparece em quais produtos específicos?</Label>
                      <span className="text-[10px] font-bold text-blue-600/70">{selectedCompGroupProductIds.length} selecionado(s)</span>
                    </div>
                    <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-1">
                      {categories.map(category => {
                        const catProducts = products.filter(p => p.category_id === category.id);
                        if (catProducts.length === 0) return null;
                        return (
                          <div key={category.id} className="space-y-1">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest px-1">{category.name}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {catProducts.map(product => {
                                const active = selectedCompGroupProductIds.includes(product.id);
                                return (
                                  <button
                                    key={product.id}
                                    type="button"
                                    onClick={() => toggleCompGroupProduct(product.id)}
                                    className={`rounded-lg border px-2 py-1 text-[10px] font-bold transition-all ${active ? 'border-blue-600 bg-blue-600 text-white shadow-sm' : 'border-blue-200 bg-card text-blue-700 hover:bg-blue-100'}`}
                                  >
                                    {active ? '✓ ' : '+ '}{product.name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <Button className="w-full bg-orange-600 hover:bg-orange-700 rounded-xl" onClick={() => handleSaveCompGroup()}>
                  {editingCompGroup ? 'SALVAR ALTERAÇÕES' : 'CRIAR GRUPO'}
                </Button>
              </DialogContent>
            </Dialog>

            {/* Dialog Complemento */}
            <Dialog open={isComplementDialogOpen} onOpenChange={setIsComplementDialogOpen}>
              <DialogContent className="rounded-3xl">
                <DialogHeader>
                  <DialogTitle>{editingComplement ? 'Editar Item' : 'Novo Item'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-1">
                    <Label>Nome do Item</Label>
                    <Input placeholder="Ex: Catupiry" value={newComplement.name} onChange={e => setNewComplement(prev => ({...prev, name: e.target.value}))} />
                  </div>
                  <div className="space-y-1">
                    <Label>Preço Adicional</Label>
                    <Input type="text" placeholder="0,00" value={newComplement.price} onChange={e => setNewComplement(prev => ({...prev, price: e.target.value}))} />
                  </div>
                  <div className="space-y-1">
                    <Label>Grupo</Label>
                    <Select value={newComplement.group_id} onValueChange={v => {
                      console.log("Changing group_id to:", v);
                      setNewComplement(prev => ({...prev, group_id: v}));
                    }}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Selecione um grupo" />
                      </SelectTrigger>
                      <SelectContent>
                        {complementGroups.map(g => (
                          <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="w-full bg-orange-600 hover:bg-orange-700 rounded-xl" onClick={() => handleSaveComplement()}>
                  {editingComplement ? 'SALVAR ALTERAÇÕES' : 'CRIAR ITEM'}
                </Button>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <Dialog open={isOrderComplementDialogOpen} onOpenChange={setIsOrderComplementDialogOpen}>
            <DialogContent className="max-w-[90vw] sm:max-w-[380px] rounded-2xl p-4 gap-3">
              <DialogHeader>
                <DialogTitle className="text-orange-700">Personalizar {(newDeliveryOrder.activeItem as any)?.product?.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2 max-h-[65vh] overflow-y-auto custom-scrollbar pr-1">
                {(() => {
                  const activeProduct = (newDeliveryOrder.activeItem as any)?.product;
                  const relevantGroups = complementGroups.filter(group => {
                    if (!activeProduct) return false;
                    const productGroupIds = productComplementGroups
                      .filter(pg => pg.group_id && pg.product_id === activeProduct.id)
                      .map(pg => pg.group_id);
                    const categoryGroupIds = activeProduct.category_id
                      ? categoryComplementGroups
                          .filter(cg => cg.group_id && cg.category_id === activeProduct.category_id)
                          .map(cg => cg.group_id)
                      : [];
                    const relevantGroupIds = [...new Set([...productGroupIds, ...categoryGroupIds])];
                    if (relevantGroupIds.includes(group.id)) return true;
                    const hasAnyManualLink =
                      productComplementGroups.some(pg => pg.group_id === group.id) ||
                      categoryComplementGroups.some(cg => cg.group_id === group.id);
                    if (hasAnyManualLink) return false;
                    return true;
                  });
                  return relevantGroups.map((group: any) => (
                    <div key={group.id} className="space-y-1.5">
                      <div className="flex items-center justify-between px-1">
                        <Label className="text-[10px] font-black uppercase text-orange-600 tracking-wide">{group.name}</Label>
                        <span className="text-[9px] font-bold text-muted-foreground bg-orange-50 px-1.5 py-0.5 rounded">
                          Máx: {group.max_choices}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {group.complements.map((comp: any) => {
                          const isSelected = (newDeliveryOrder.activeItem as any)?.selectedComplements?.some((c: any) => c.id === comp.id);
                          return (
                            <Button
                              key={comp.id}
                              variant={isSelected ? "default" : "outline"}
                              className={`justify-between h-auto py-1.5 px-3 rounded-lg border transition-all ${isSelected ? 'bg-orange-600 border-orange-600 text-white shadow-sm scale-[0.98]' : 'border-zinc-200 bg-white hover:border-orange-200'}`}
                              onClick={() => {
                                const currentComps = (newDeliveryOrder.activeItem as any)?.selectedComplements || [];
                                if (isSelected) {
                                  setNewDeliveryOrder({
                                    ...newDeliveryOrder,
                                    activeItem: { ...newDeliveryOrder.activeItem, selectedComplements: currentComps.filter((c: any) => c.id !== comp.id) }
                                  } as any);
                                } else {
                                  const groupComps = currentComps.filter((c: any) => c.group_id === group.id);
                                  if (groupComps.length < group.max_choices) {
                                    setNewDeliveryOrder({
                                      ...newDeliveryOrder,
                                      activeItem: { ...newDeliveryOrder.activeItem, selectedComplements: [...currentComps, comp] }
                                    } as any);
                                  } else if (group.max_choices === 1) {
                                    setNewDeliveryOrder({
                                      ...newDeliveryOrder,
                                      activeItem: { ...newDeliveryOrder.activeItem, selectedComplements: [...currentComps.filter((c: any) => c.group_id !== group.id), comp] }
                                    } as any);
                                  } else {
                                    toast.error(`Máximo de ${group.max_choices} opções para ${group.name}`);
                                  }
                                }
                              }}
                            >
                              <span className="font-bold text-xs truncate pr-2">{comp.name}</span>
                              <span className={`text-[10px] font-black shrink-0 ${isSelected ? 'text-white' : 'text-zinc-500'}`}>
                                {comp.price > 0 ? `+ R$ ${Number(comp.price).toFixed(2)}` : 'Grátis'}
                              </span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {/* Sugestões "Dica do Cheff" embutidas — evita abrir 2 diálogos */}
              {((newDeliveryOrder.activeItem as any)?.suggestions?.length ?? 0) > 0 && (
                <div className="space-y-2 pt-2 border-t-2 border-dashed border-orange-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-orange-600 animate-pulse" />
                    <Label className="text-[10px] font-black uppercase text-orange-600/70">Dica do Cheff — leve junto</Label>
                  </div>
                  <div className="grid grid-cols-1 gap-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                    {(newDeliveryOrder.activeItem as any).suggestions.map((s: any) => {
                      const picked = ((newDeliveryOrder.activeItem as any)?.selectedSuggestions || []).some((x: any) => x.id === s.id);
                      return (
                        <Button
                          key={s.id}
                          type="button"
                          variant={picked ? "default" : "outline"}
                          className={`justify-between h-auto py-2.5 px-3 rounded-lg border transition-all ${picked ? 'bg-orange-600 border-orange-600 text-white' : 'border-zinc-200 bg-white'}`}
                          onClick={() => {
                            const curr = (newDeliveryOrder.activeItem as any)?.selectedSuggestions || [];
                            const next = picked ? curr.filter((x: any) => x.id !== s.id) : [...curr, s];
                            setNewDeliveryOrder({
                              ...newDeliveryOrder,
                              activeItem: { ...newDeliveryOrder.activeItem, selectedSuggestions: next }
                            } as any);
                          }}
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            {s.image_url ? (
                              <img src={cldThumb(s.image_url, 80)} loading="lazy" className="h-8 w-8 rounded-md object-cover" alt={s.name} />
                            ) : (
                              <Sparkles className={`h-4 w-4 ${picked ? 'text-white' : 'text-orange-400'}`} />
                            )}
                            <span className="font-bold text-sm truncate">{s.name}</span>
                          </span>
                          <span className="text-[11px] font-black">+ R$ {Number(s.price).toFixed(2)}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              <Button className="w-full bg-orange-600 hover:bg-orange-700 rounded-lg py-5 font-black text-sm uppercase shadow-lg transition-all active:scale-95" onClick={handleAddCustomItemToOrder}>
                ADICIONAR AO PEDIDO
              </Button>
            </DialogContent>
          </Dialog>

          {/* Dialog de Sugestões (Dica do Cheff) - mesmo padrão visual do complemento */}
          <Dialog open={suggestionDialog.open} onOpenChange={(o) => setSuggestionDialog(s => ({ ...s, open: o }))}>
            <DialogContent className="max-w-md rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-orange-700 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-orange-600 animate-pulse" />
                  Dica do Cheff
                </DialogTitle>
                <p className="text-xs text-muted-foreground italic">Estes itens combinam muito com o pedido!</p>
              </DialogHeader>
              <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {suggestionDialog.products.map((s: any) => {
                  const already = newDeliveryOrder.items.some((it: any) => it.product_id === s.id);
                  return (
                    <div key={s.id} className="flex items-center gap-3 p-2 rounded-xl border-2 border-orange-50 bg-orange-50/30">
                      {s.image_url ? (
                        <img src={cldThumb(s.image_url, 140)} loading="lazy" className="h-14 w-14 rounded-lg object-cover shadow-sm" alt={s.name} />
                      ) : (
                        <div className="h-14 w-14 rounded-lg bg-orange-50 flex items-center justify-center border border-orange-100">
                          <Sparkles className="h-5 w-5 text-orange-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{s.name}</p>
                        <p className="font-black text-orange-600 text-sm">R$ {Number(s.price).toFixed(2)}</p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        className="h-9 px-3 rounded-lg text-xs font-black bg-orange-600 hover:bg-orange-700 text-white uppercase"
                        onClick={() => {
                          setNewDeliveryOrder((curr: any) => {
                            const exists = curr.items.findIndex((item: any) => item.product_id === s.id);
                            if (exists !== -1) {
                              const newItems = [...curr.items];
                              newItems[exists] = { ...newItems[exists], quantity: newItems[exists].quantity + 1 };
                              return { ...curr, items: newItems };
                            }
                            return {
                              ...curr,
                              items: [...curr.items, {
                                product_id: s.id,
                                product_name: s.name,
                                quantity: 1,
                                unit_price: Number(s.price),
                                selected_complements: []
                              }]
                            };
                          });
                          toast.success(`${s.name} adicionado!`);
                        }}
                      >
                        {already ? '+1' : 'Adicionar'}
                      </Button>
                    </div>
                  );
                })}
                {suggestionDialog.products.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-4">Sem sugestões para este item.</p>
                )}
              </div>
              <Button
                variant="outline"
                className="w-full rounded-xl py-5 font-bold"
                onClick={() => setSuggestionDialog({ open: false, products: [] })}
              >
                FECHAR
              </Button>
            </DialogContent>
          </Dialog>
          <TabsContent value="receivables" className="space-y-6 animate-in fade-in duration-500">
            <ReceivablesTab 
              transactions={transactions} 
              customers={customers} 
              fetchData={fetchData} 
              todayDate={todayDate}
              setNewTransaction={setNewTransaction}
              setIsTransactionDialogOpen={setIsTransactionDialogOpen}
              setIsEditTransactionMode={setIsEditTransactionMode}
              setIsViewTransactionMode={setIsViewTransactionMode}
              newTransaction={newTransaction}
               storeSettings={storeSettings}
              handleOpenReceiveModal={handleOpenReceiveModal}
            />
          </TabsContent>

          <TabsContent value="payables" className="space-y-6 animate-in fade-in duration-500">
            <PayablesTab
              transactions={transactions}
              suppliers={suppliers}
              fetchData={fetchData}
              todayDate={todayDate}
              setNewTransaction={setNewTransaction}
              setIsTransactionDialogOpen={setIsTransactionDialogOpen}
              setIsEditTransactionMode={setIsEditTransactionMode}
              setIsViewTransactionMode={setIsViewTransactionMode}
              storeSettings={storeSettings}
              handleOpenPayModal={handleOpenReceiveModal}
            />
          </TabsContent>

          <TabsContent value="weekly_campaigns" className="space-y-6 animate-in fade-in duration-500">
            <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando...</div>}><WeeklyCampaignsManager /></Suspense>
          </TabsContent>

          <TabsContent value="printer_config" className="space-y-6 animate-in fade-in duration-500">
            <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando...</div>}><PrinterConfigManager /></Suspense>
          </TabsContent>

          <TabsContent value="whatsapp_bot" className="space-y-6 animate-in fade-in duration-500">
            <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando...</div>}><WhatsAppBotConfig /></Suspense>
          </TabsContent>


          <TabsContent value="tax_rules" className="space-y-6 animate-in fade-in duration-500">
            <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando...</div>}>
              <TaxRulesManager />
            </Suspense>
          </TabsContent>

          <TabsContent value="note_type" className="space-y-6 animate-in fade-in duration-500">
            <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando...</div>}>
              <FiscalNoteConfigManager />
            </Suspense>
          </TabsContent>


          <TabsContent value="fiscal_documents" className="space-y-6 animate-in fade-in duration-500">
            <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando...</div>}>
              <FiscalDocumentsPanel />
            </Suspense>
          </TabsContent>

          <TabsContent value="fiscal_logs" className="space-y-6 animate-in fade-in duration-500">
            <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando...</div>}>
              <FiscalLogsPanel />
            </Suspense>
          </TabsContent>

          <TabsContent value="cclass_trib" className="space-y-6 animate-in fade-in duration-500">
            <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando...</div>}>
              <FiscalCClassTribManager />
            </Suspense>
          </TabsContent>

          <TabsContent value="fiscal_audit" className="space-y-6 animate-in fade-in duration-500">
            <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando...</div>}>
              <FiscalAuditManager />
            </Suspense>
          </TabsContent>

          <TabsContent value="api_endpoints" className="space-y-6 animate-in fade-in duration-500">
            <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando...</div>}>
              <FiscalApiEndpointsManager />
            </Suspense>
          </TabsContent>

          <TabsContent value="insumos" className="space-y-6 animate-in fade-in duration-500">
            {activeTab === 'insumos' && (
              <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando insumos...</div>}>
                <IngredientesManager />
              </Suspense>
            )}
          </TabsContent>

          <TabsContent value="estoque" className="space-y-6 animate-in fade-in duration-500">
            {activeTab === 'estoque' && (
              <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando estoque...</div>}>
                <EstoqueManager />
              </Suspense>
            )}
          </TabsContent>


          <TabsContent value="engenharia_cardapio" className="space-y-6 animate-in fade-in duration-500">
            {activeTab === 'engenharia_cardapio' && (
              <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando dashboard...</div>}>
                <EngenhariaCardapioDashboard active={activeTab === 'engenharia_cardapio'} />
              </Suspense>
            )}
          </TabsContent>



          <Dialog open={isTransactionDialogOpen} onOpenChange={(open) => {
            setIsTransactionDialogOpen(open);
            if (!open) {
              setIsEditTransactionMode(false);
              setIsViewTransactionMode(false);
              setNewTransaction({ id: "", description: "", amount: "", type: "income", category_id: "", date: todayDate, due_date: "", payment_date: "", status: "pending", customer_id: "", supplier_id: "" });
            }
          }}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {isViewTransactionMode ? 'Visualizar Lançamento' : isEditTransactionMode ? 'Editar Lançamento' : 'Novo Lançamento'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input value={newTransaction.description} onChange={e => setNewTransaction({...newTransaction, description: e.target.value})} disabled={isViewTransactionMode} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Valor (R$)</Label>
                    <Input type="number" value={newTransaction.amount} onChange={e => setNewTransaction({...newTransaction, amount: e.target.value})} disabled={isViewTransactionMode} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={newTransaction.type} onValueChange={v => setNewTransaction({...newTransaction, type: v})} disabled={isViewTransactionMode}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Receita</SelectItem>
                        <SelectItem value="expense">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Data Lançamento</Label>
                    <Input type="date" value={newTransaction.date} onChange={e => setNewTransaction({...newTransaction, date: e.target.value})} disabled={isViewTransactionMode} />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Vencimento</Label>
                    <Input type="date" value={newTransaction.due_date || ""} onChange={e => setNewTransaction({...newTransaction, due_date: e.target.value})} disabled={isViewTransactionMode} />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Pagamento</Label>
                    <Input type="date" value={newTransaction.payment_date || ""} onChange={e => setNewTransaction({...newTransaction, payment_date: e.target.value})} disabled={isViewTransactionMode} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>{newTransaction.type === 'income' ? 'Cliente' : 'Fornecedor'}</Label>
                      {newTransaction.type === 'income' && !isViewTransactionMode && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                          title="Novo Cliente"
                          onClick={() => {
                            setEditingCustomer(null);
                            setNewCustomer({ 
                              name: "", email: "", phone: "", address: "", address_number: "", neighborhood: "", city: "", state: "", zip_code: "", address_complement: "",
                              person_type: "fisica", cpf: "", cnpj: "", allow_fiado: false
                            });
                            setIsQuickCustomerDialogOpen(true);
                          }}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <Select value={newTransaction.type === 'income' ? (newTransaction.customer_id || "") : (newTransaction.supplier_id || "")} onValueChange={v => {
                       if (newTransaction.type === 'income') setNewTransaction({...newTransaction, customer_id: v});
                       else setNewTransaction({...newTransaction, supplier_id: v});
                    }} disabled={isViewTransactionMode}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {newTransaction.type === 'income' ? 
                          customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>) :
                          suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)
                        }
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={newTransaction.status || 'pending'} onValueChange={v => setNewTransaction({...newTransaction, status: v as 'pending' | 'paid'})} disabled={isViewTransactionMode}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoria (Opcional)</Label>
                    <Select value={newTransaction.category_id} onValueChange={v => {
                      const category = finCategories.find(c => c.id === v);
                      const dreAccount = chartAccounts.find(acc => acc.name === category?.name);
                      
                      setNewTransaction({
                        ...newTransaction, 
                        category_id: v,
                        chart_account_id: dreAccount ? dreAccount.id : newTransaction.chart_account_id
                      });
                    }} disabled={isViewTransactionMode}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {finCategories.filter(c => c.type === newTransaction.type).map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Plano de Contas (DRE)</Label>
                    <Select value={newTransaction.chart_account_id} onValueChange={v => setNewTransaction({...newTransaction, chart_account_id: v})} disabled={isViewTransactionMode}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {chartAccounts
                          .filter(c => (c.level === 3 || c.level === 2) && 
                            ((newTransaction.type === 'income' && (c.type === 'revenue' || c.code.startsWith('1'))) || 
                             (newTransaction.type === 'expense' && (c.type === 'expense' || c.code.startsWith('3') || c.code.startsWith('4'))))
                          )
                          .map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  {!isViewTransactionMode && (
                    <Button onClick={handleAddTransactionWithCashier}>
                      {isEditTransactionMode ? 'Salvar Alterações' : 'Salvar'}
                    </Button>
                  )}
                  {newTransaction.id && newTransaction.status !== 'paid' && (
                    <Button 
                      variant="outline" 
                      className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                      onClick={() => {
                        setIsTransactionDialogOpen(false);
                        handleOpenReceiveModal(newTransaction);
                      }}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {newTransaction.type === 'income' ? 'Confirmar Recebimento' : 'Confirmar Pagamento'}
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isQuickCustomerDialogOpen} onOpenChange={setIsQuickCustomerDialogOpen}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl">
              <DialogHeader>
                <DialogTitle>Novo Cliente</DialogTitle>
                <DialogDescription>Cadastre rapidamente um cliente para este lançamento.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-2 space-y-1">
                  <Label>Nome</Label>
                  <Input 
                    value={newCustomer.name} 
                    onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} 
                    placeholder="Nome completo..."
                    className="rounded-xl border-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Telefone</Label>
                  <Input 
                    value={newCustomer.phone} 
                    onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} 
                    placeholder="(00) 00000-0000"
                    className="rounded-xl border-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <Label>CEP</Label>
                  <Input 
                    value={newCustomer.zip_code} 
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').substring(0, 8);
                      setNewCustomer({...newCustomer, zip_code: val});
                      if (val.length === 8) fetchAddressByCep(val, 'customer');
                    }} 
                    placeholder="00000-000"
                    className="rounded-xl border-slate-200"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl font-bold"
                  onClick={async () => {
                    if (!newCustomer.name) {
                      toast.error("Nome é obrigatório.");
                      return;
                    }
                    try {
                      const { data, error } = await supabase.from("customers").insert([newCustomer]).select().single();
                      if (error) throw error;
                      
                      const { data: custs } = await supabase.from("customers").select("*").order("name");
                      if (custs) setCustomers(custs as any);
                      
                      setNewTransaction({ ...newTransaction, customer_id: data.id });
                      setIsQuickCustomerDialogOpen(false);
                      toast.success("Cliente cadastrado e selecionado!");
                    } catch (err: any) {
                      toast.error("Erro ao cadastrar: " + err.message);
                    }
                  }}
                >
                  Cadastrar e Selecionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          

          <Dialog open={isReceiveDialogOpen} onOpenChange={setIsReceiveDialogOpen}>
            <DialogContent className="sm:max-w-[420px] rounded-[32px] border-none shadow-2xl p-8">
              <DialogHeader className="space-y-4">
                <DialogTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
                  <div className="bg-green-100 p-1.5 rounded-full">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  Confirmar {receivingTransaction?.type === 'income' ? 'Recebimento' : 'Pagamento'}
                </DialogTitle>
                <DialogDescription className="text-base text-slate-600">
                  Deseja confirmar a baixa do lançamento: <br/>
                  <span className="font-black text-slate-900 block mt-1">"{receivingTransaction?.description}"</span>
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-8">
                <div className="space-y-3">
                  <Label htmlFor="receive_date" className="text-base font-bold text-slate-700">Data do {receivingTransaction?.type === 'income' ? 'Recebimento' : 'Pagamento'}</Label>
                  <Input 
                    id="receive_date" 
                    type="date" 
                    className="h-14 rounded-2xl border-2 border-red-200 focus:border-red-400 focus:ring-0 text-lg px-6 font-medium text-slate-700"
                    value={receiveData.payment_date}
                    onChange={e => setReceiveData({...receiveData, payment_date: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="receive_amount" className="text-base font-bold text-slate-700">Valor Total</Label>
                  <div className="relative group">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-lg">R$</span>
                    <Input 
                      id="receive_amount" 
                      type="number" 
                      step="0.01"
                      className="h-14 pl-14 pr-6 rounded-2xl border-2 border-slate-100 bg-slate-50/50 group-hover:bg-white focus:bg-white focus:border-blue-400 transition-all font-black text-xl" 
                      value={receiveData.amount}
                      onChange={e => setReceiveData({...receiveData, amount: Number(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="flex flex-row gap-4 sm:justify-between pt-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsReceiveDialogOpen(false)} 
                  className="flex-1 h-14 rounded-2xl font-black text-lg bg-[#f59e0b] hover:bg-[#d97706] text-slate-900 transition-colors uppercase tracking-tight"
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1 h-14 rounded-2xl font-black text-lg bg-[#10b981] hover:bg-[#059669] text-white shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2 uppercase tracking-tight" 
                  onClick={handleConfirmReceive}
                >
                  <CheckCircle2 className="h-6 w-6" />
                  Confirmar Baixa
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Tabs>
      </main>
    </SidebarInset>
  </div>
</SidebarProvider>
);
}

 const ReceivablesTab = ({ 
   transactions, 
   customers, 
   fetchData, 
   todayDate, 
   setNewTransaction,
   setIsTransactionDialogOpen,
   setIsEditTransactionMode,
   setIsViewTransactionMode,
   newTransaction,
   storeSettings,
   handleOpenReceiveModal
 }: any) => {
   const [receivableFilters, setReceivableFilters] = useState({
     issueDateStart: "2026-01-01",
     issueDateEnd: "2030-12-31",
     dueDateStart: "",
     dueDateEnd: "",
     paymentDateStart: "",
     paymentDateEnd: "",
     customerId: "all",
     status: "all",
     search: ""
   });

    const filteredReceivables = useMemo(() => {
      return transactions.filter((t: any) => {
        if (t.type !== 'income') return false;
        
        const customer = customers.find((c: any) => c.id === t.customer_id);
        const searchLower = (receivableFilters.search || "").toLowerCase();
        
        // Filtro de Busca (Descrição ou Nome do Cliente)
        if (searchLower && 
            !(t.description?.toLowerCase().includes(searchLower) || 
              (customer && customer.name?.toLowerCase().includes(searchLower)))) return false;

        // Filtro de Status
        if (receivableFilters.status !== 'all' && t.status !== receivableFilters.status) return false;
        
        // Filtro de Datas
        if (receivableFilters.issueDateStart && t.date < receivableFilters.issueDateStart) return false;
        if (receivableFilters.issueDateEnd && t.date > receivableFilters.issueDateEnd) return false;
        
        if (receivableFilters.dueDateStart && t.due_date && t.due_date < receivableFilters.dueDateStart) return false;
        if (receivableFilters.dueDateEnd && t.due_date && t.due_date > receivableFilters.dueDateEnd) return false;
        
        if (receivableFilters.paymentDateStart && t.payment_date && t.payment_date < receivableFilters.paymentDateStart) return false;
        if (receivableFilters.paymentDateEnd && t.payment_date && t.payment_date > receivableFilters.paymentDateEnd) return false;
        
        // Filtro de Cliente Específico
        if (receivableFilters.customerId && receivableFilters.customerId !== 'all' && t.customer_id !== receivableFilters.customerId) return false;
        
        return true;
      });
    }, [transactions, customers, receivableFilters]);

    const totalReceivable = filteredReceivables.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
    const totalPaid = filteredReceivables.filter((t: any) => t.status === 'paid').reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
    const totalPending = filteredReceivables.filter((t: any) => t.status === 'pending').reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);

    const handlePrintReceivablesReport = () => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const fmtBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
      const fmtDate = (d?: string) => d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR') : '-';

      const items = filteredReceivables.map((t: any) => ({
        name: `${fmtDate(t.date)} | Venc: ${fmtDate(t.due_date)} | Pag: ${fmtDate(t.payment_date)} - ${customers.find((c: any) => c.id === t.customer_id)?.name || 'Cliente Geral'} - ${t.description} [${t.status === 'paid' ? 'Recebido' : 'Pendente'}]`,
        quantity: 1,
        price: t.amount || 0,
      }));

      const notes = `Total Geral: ${fmtBRL(totalReceivable)} | Recebido: ${fmtBRL(totalPaid)} | Pendente: ${fmtBRL(totalPending)}`;

      const html = gerarHtmlImpressao({
        titulo: 'RELATÓRIO DE CONTAS A RECEBER',
        content: {
          created_at: new Date().toISOString(),
          notes,
          items,
          total: totalReceivable,
        },
        formato: (storeSettings?.print_paper_format as 'a4' | 'thermal_80mm') || 'a4',
      });

      printWindow.document.write(html);
      printWindow.document.close();
    };

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              Contas a Receber
            </h2>
            <p className="text-gray-500 text-sm">Gerencie suas receitas, cobranças e pendências de clientes.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={handlePrintReceivablesReport}
              className="border-orange-200 text-orange-700 hover:bg-orange-50 gap-2"
            >
              <Printer className="w-4 h-4" />
              Gerar Relatório
            </Button>
            <Button 
              onClick={() => {
                setNewTransaction({ id: "", description: "", amount: "", type: "income", category_id: "", date: todayDate, due_date: todayDate, payment_date: "", status: "pending", customer_id: "", supplier_id: "" });
                setIsTransactionDialogOpen(true);
                setIsEditTransactionMode(false);
                setIsViewTransactionMode(false);
              }}
              className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200/50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Receita
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-white border-green-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-green-600 font-medium">Total Geral</CardDescription>
              <CardTitle className="text-2xl font-bold text-green-700">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalReceivable)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-blue-600 font-medium">Total Recebido</CardDescription>
              <CardTitle className="text-2xl font-bold text-blue-700">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPaid)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-orange-600 font-medium">Total Pendente</CardDescription>
              <CardTitle className="text-2xl font-bold text-orange-700">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPending)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="border-orange-100 shadow-md">
          <CardHeader className="bg-orange-50/30 border-b border-orange-100">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-orange-500" />
              <CardTitle className="text-lg font-semibold text-orange-800">Filtros Avançados</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <div className="space-y-2 lg:col-span-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Nome do cliente ou descrição..." 
                    className="pl-9 text-xs h-9 focus:ring-orange-500 border-orange-100 bg-white" 
                    value={receivableFilters.search}
                    onChange={(e) => setReceivableFilters({...receivableFilters, search: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Data de Emissão</Label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <Input 
                    type="date" 
                    className="text-xs px-2 h-9 w-full min-w-[140px] focus:ring-orange-500 border-orange-100" 
                    value={receivableFilters.issueDateStart}
                    onChange={(e) => setReceivableFilters({...receivableFilters, issueDateStart: e.target.value})}
                  />
                  <span className="text-gray-400">-</span>
                  <Input 
                    type="date" 
                    className="text-xs px-2 h-9 w-full min-w-[140px] focus:ring-orange-500 border-orange-100" 
                    value={receivableFilters.issueDateEnd}
                    onChange={(e) => setReceivableFilters({...receivableFilters, issueDateEnd: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Vencimento</Label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <Input 
                    type="date" 
                    className="text-xs px-2 h-9 w-full min-w-[140px] focus:ring-orange-500 border-orange-100" 
                    value={receivableFilters.dueDateStart}
                    onChange={(e) => setReceivableFilters({...receivableFilters, dueDateStart: e.target.value})}
                  />
                  <span className="text-gray-400">-</span>
                  <Input 
                    type="date" 
                    className="text-xs px-2 h-9 w-full min-w-[140px] focus:ring-orange-500 border-orange-100" 
                    value={receivableFilters.dueDateEnd}
                    onChange={(e) => setReceivableFilters({...receivableFilters, dueDateEnd: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Pagamento</Label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <Input 
                    type="date" 
                    className="text-xs px-2 h-9 w-full min-w-[140px] focus:ring-orange-500 border-orange-100" 
                    value={receivableFilters.paymentDateStart}
                    onChange={(e) => setReceivableFilters({...receivableFilters, paymentDateStart: e.target.value})}
                  />
                  <span className="text-gray-400">-</span>
                  <Input 
                    type="date" 
                    className="text-xs px-2 h-9 w-full min-w-[140px] focus:ring-orange-500 border-orange-100" 
                    value={receivableFilters.paymentDateEnd}
                    onChange={(e) => setReceivableFilters({...receivableFilters, paymentDateEnd: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Cliente / Status</Label>
                <div className="flex gap-1">
                  <Select 
                    value={receivableFilters.customerId} 
                    onValueChange={(v) => setReceivableFilters({...receivableFilters, customerId: v})}
                  >
                    <SelectTrigger className="text-[10px] h-9 border-orange-100 focus:ring-orange-500 bg-white">
                      <SelectValue placeholder="Cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {customers.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select 
                    value={receivableFilters.status} 
                    onValueChange={(v) => setReceivableFilters({...receivableFilters, status: v})}
                  >
                    <SelectTrigger className="text-[10px] h-9 border-orange-100 focus:ring-orange-500 bg-white">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="paid">Recebidos</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs text-orange-600 border-orange-200 hover:bg-orange-50"
                onClick={() => setReceivableFilters({
                  issueDateStart: "",
                  issueDateEnd: "",
                  dueDateStart: "",
                  dueDateEnd: "",
                  paymentDateStart: "",
                  paymentDateEnd: "",
                  customerId: "all",
                  status: "all",
                  search: ""
                })}
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-100 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-orange-600">
                <TableRow className="hover:bg-orange-600 border-orange-500">
                  <TableHead className="text-white font-bold">Emissão</TableHead>
                  <TableHead className="text-white font-bold">Vencimento</TableHead>
                  <TableHead className="text-white font-bold">Pagamento</TableHead>
                  <TableHead className="text-white font-bold">Cliente</TableHead>
                  <TableHead className="text-white font-bold">Descrição</TableHead>
                  <TableHead className="text-white font-bold">Valor</TableHead>
                  <TableHead className="text-white font-bold text-center">Status</TableHead>
                  <TableHead className="text-white font-bold text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceivables.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-gray-400">
                      Nenhum registro encontrado com os filtros selecionados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReceivables.map((t: any) => (
                    <TableRow key={t.id} className="hover:bg-orange-50/50 transition-colors">
                      <TableCell className="text-xs text-gray-600">
                        {t.date ? new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-gray-800">
                        {t.due_date ? new Date(t.due_date + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">
                        {t.payment_date ? new Date(t.payment_date + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-gray-900">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-900">
                            {customers.find((c: any) => c.id === t.customer_id)?.name || 'Cliente Geral'}
                          </span>
                          {customers.find((c: any) => c.id === t.customer_id)?.phone && (
                            <span className="text-[10px] text-gray-400 italic">
                              {customers.find((c: any) => c.id === t.customer_id)?.phone}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-gray-600 max-w-[200px] truncate">
                        {t.description}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-green-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn(
                          "text-[10px] font-bold px-2 py-0.5 uppercase tracking-tighter",
                          t.status === 'paid' ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                        )}>
                          {t.status === 'paid' ? 'Recebido' : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => {
                              setNewTransaction(t);
                              setIsTransactionDialogOpen(true);
                              setIsEditTransactionMode(true);
                              setIsViewTransactionMode(false);
                            }}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          {t.status !== 'paid' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 px-2 text-[10px] gap-1 text-green-600 border-green-200 hover:bg-green-50 font-bold"
                              title="Receber Conta"
                              onClick={() => handleOpenReceiveModal(t)}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Receber
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={async () => {
                              if (confirm("Tem certeza que deseja excluir este recebimento? Esta ação também removerá o pedido e itens vinculados permanentemente.")) {
                                try {
                                  // Se a descrição contiver um ID de pedido (ex: #abc12345), tentamos limpar o pedido também
                                  const orderIdMatch = t.description.match(/#([a-f0-9-]{8,})/i);
                                  const orderId = orderIdMatch ? orderIdMatch[1] : null;

                                  if (orderId) {
                                    console.log(`Lançamento vinculado ao pedido ${orderId}. Removendo cascata...`);
                                    
                                    // 1. Remover itens do pedido
                                    await supabase.from("delivery_order_items").delete().eq("order_id", orderId);
                                    
                                    // 2. Remover o próprio pedido
                                    await supabase.from("delivery_orders").delete().eq("id", orderId);
                                  }

                                  // 3. Remover a transação financeira atual
                                  const { error } = await supabase
                                    .from('financial_transactions')
                                    .delete()
                                    .eq('id', t.id);
                                  
                                  if (error) throw error;
                                  toast.success("Recebimento e vínculos excluídos com sucesso!");
                                  fetchData();
                                } catch (e: any) {
                                  toast.error("Erro ao excluir registro: " + e.message);
                                }
                              }
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    );
  };

const PayablesTab = ({
  transactions,
  suppliers,
  fetchData,
  todayDate,
  setNewTransaction,
  setIsTransactionDialogOpen,
  setIsEditTransactionMode,
  setIsViewTransactionMode,
  storeSettings,
  handleOpenPayModal
}: any) => {
  const [filters, setFilters] = useState({
    issueDateStart: "2026-01-01",
    issueDateEnd: "2030-12-31",
    dueDateStart: "",
    dueDateEnd: "",
    paymentDateStart: "",
    paymentDateEnd: "",
    supplierId: "all",
    status: "all",
    search: ""
  });

  const filtered = useMemo(() => {
    return transactions.filter((t: any) => {
      if (t.type !== 'expense') return false;
      const supplier = suppliers.find((s: any) => s.id === t.supplier_id);
      const searchLower = (filters.search || "").toLowerCase();
      if (searchLower &&
          !(t.description?.toLowerCase().includes(searchLower) ||
            (supplier && supplier.name?.toLowerCase().includes(searchLower)))) return false;
      if (filters.status !== 'all' && t.status !== filters.status) return false;
      if (filters.issueDateStart && t.date < filters.issueDateStart) return false;
      if (filters.issueDateEnd && t.date > filters.issueDateEnd) return false;
      if (filters.dueDateStart && t.due_date && t.due_date < filters.dueDateStart) return false;
      if (filters.dueDateEnd && t.due_date && t.due_date > filters.dueDateEnd) return false;
      if (filters.paymentDateStart && t.payment_date && t.payment_date < filters.paymentDateStart) return false;
      if (filters.paymentDateEnd && t.payment_date && t.payment_date > filters.paymentDateEnd) return false;
      if (filters.supplierId && filters.supplierId !== 'all' && t.supplier_id !== filters.supplierId) return false;
      return true;
    });
  }, [transactions, suppliers, filters]);

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  const total = filtered.reduce((a: number, c: any) => a + (c.amount || 0), 0);
  const totalPaid = filtered.filter((t: any) => t.status === 'paid').reduce((a: number, c: any) => a + (c.amount || 0), 0);
  const totalPending = filtered.filter((t: any) => t.status === 'pending').reduce((a: number, c: any) => a + (c.amount || 0), 0);
  const todayStr = new Date().toISOString().slice(0, 10);
  const totalOverdue = filtered.filter((t: any) => t.status === 'pending' && t.due_date && t.due_date < todayStr).reduce((a: number, c: any) => a + (c.amount || 0), 0);

  const handlePrintPayablesReport = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    const fmtDate = (d?: string) => d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR') : '-';

    const items = filtered.map((t: any) => ({
      name: `${fmtDate(t.date)} | Venc: ${fmtDate(t.due_date)} | Pag: ${fmtDate(t.payment_date)} - ${suppliers.find((s: any) => s.id === t.supplier_id)?.name || '-'} - ${t.description || ''} [${t.status === 'paid' ? 'Pago' : 'Pendente'}]`,
      quantity: 1,
      price: t.amount || 0,
    }));

    const notes = `Total: ${fmt(total)} | Pago: ${fmt(totalPaid)} | A Pagar: ${fmt(totalPending)} | Vencidas: ${fmt(totalOverdue)}`;

    const html = gerarHtmlImpressao({
      titulo: 'RELATÓRIO DE CONTAS A PAGAR',
      content: {
        created_at: new Date().toISOString(),
        notes,
        items,
        total,
      },
      formato: (storeSettings?.print_paper_format as 'a4' | 'thermal_80mm') || 'a4',
    });

    w.document.write(html);
    w.document.close();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ArrowDownRight className="w-6 h-6 text-red-600" /> Contas a Pagar
          </h2>
          <p className="text-gray-500 text-sm">Gerencie suas despesas, vencimentos e pagamentos a fornecedores.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handlePrintPayablesReport} className="border-red-200 text-red-700 hover:bg-red-50 gap-2">
            <Printer className="w-4 h-4" /> Gerar Relatório
          </Button>
          <Button
            onClick={() => {
              setNewTransaction({ id: "", description: "", amount: "", type: "expense", category_id: "", date: todayDate, due_date: todayDate, payment_date: "", status: "pending", customer_id: "", supplier_id: "" });
              setIsTransactionDialogOpen(true);
              setIsEditTransactionMode(false);
              setIsViewTransactionMode(false);
            }}
            className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200/50"
          >
            <Plus className="w-4 h-4 mr-2" /> Nova Despesa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-white border-red-100 shadow-sm">
          <CardHeader className="pb-2"><CardDescription className="text-red-600 font-medium">Total Geral</CardDescription>
            <CardTitle className="text-2xl font-bold text-red-700">{fmt(total)}</CardTitle></CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-sm">
          <CardHeader className="pb-2"><CardDescription className="text-blue-600 font-medium">Total Pago</CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-700">{fmt(totalPaid)}</CardTitle></CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-100 shadow-sm">
          <CardHeader className="pb-2"><CardDescription className="text-orange-600 font-medium">A Pagar</CardDescription>
            <CardTitle className="text-2xl font-bold text-orange-700">{fmt(totalPending)}</CardTitle></CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-rose-50 to-white border-rose-200 shadow-sm">
          <CardHeader className="pb-2"><CardDescription className="text-rose-600 font-medium">Vencidas</CardDescription>
            <CardTitle className="text-2xl font-bold text-rose-700">{fmt(totalOverdue)}</CardTitle></CardHeader>
        </Card>
      </div>

      <Card className="border-red-100 shadow-md">
        <CardHeader className="bg-red-50/30 border-b border-red-100">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-red-500" />
            <CardTitle className="text-lg font-semibold text-red-800">Filtros Avançados</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input placeholder="Fornecedor ou descrição..." className="pl-9 text-xs h-9 border-red-100 bg-white"
                  value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Emissão</Label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                <Input type="date" className="text-xs px-2 h-9 w-full min-w-[140px] border-red-100" value={filters.issueDateStart}
                  onChange={(e) => setFilters({ ...filters, issueDateStart: e.target.value })} />
                <span className="text-gray-400">-</span>
                <Input type="date" className="text-xs px-2 h-9 w-full min-w-[140px] border-red-100" value={filters.issueDateEnd}
                  onChange={(e) => setFilters({ ...filters, issueDateEnd: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Vencimento</Label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                <Input type="date" className="text-xs px-2 h-9 w-full min-w-[140px] border-red-100" value={filters.dueDateStart}
                  onChange={(e) => setFilters({ ...filters, dueDateStart: e.target.value })} />
                <span className="text-gray-400">-</span>
                <Input type="date" className="text-xs px-2 h-9 w-full min-w-[140px] border-red-100" value={filters.dueDateEnd}
                  onChange={(e) => setFilters({ ...filters, dueDateEnd: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Pagamento</Label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                <Input type="date" className="text-xs px-2 h-9 w-full min-w-[140px] border-red-100" value={filters.paymentDateStart}
                  onChange={(e) => setFilters({ ...filters, paymentDateStart: e.target.value })} />
                <span className="text-gray-400">-</span>
                <Input type="date" className="text-xs px-2 h-9 w-full min-w-[140px] border-red-100" value={filters.paymentDateEnd}
                  onChange={(e) => setFilters({ ...filters, paymentDateEnd: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Fornecedor / Status</Label>
              <div className="flex gap-1">
                <Select value={filters.supplierId} onValueChange={(v) => setFilters({ ...filters, supplierId: v })}>
                  <SelectTrigger className="text-[10px] h-9 border-red-100 bg-white"><SelectValue placeholder="Fornecedor" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {suppliers.map((s: any) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                  <SelectTrigger className="text-[10px] h-9 border-red-100 bg-white"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="paid">Pagos</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" className="text-xs text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setFilters({ issueDateStart: "", issueDateEnd: "", dueDateStart: "", dueDateEnd: "", paymentDateStart: "", paymentDateEnd: "", supplierId: "all", status: "all", search: "" })}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-100 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-red-600">
              <TableRow className="hover:bg-red-600 border-red-500">
                <TableHead className="text-white font-bold">Emissão</TableHead>
                <TableHead className="text-white font-bold">Vencimento</TableHead>
                <TableHead className="text-white font-bold">Pagamento</TableHead>
                <TableHead className="text-white font-bold">Fornecedor</TableHead>
                <TableHead className="text-white font-bold">Descrição</TableHead>
                <TableHead className="text-white font-bold">Valor</TableHead>
                <TableHead className="text-white font-bold text-center">Status</TableHead>
                <TableHead className="text-white font-bold text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-12 text-gray-400">Nenhum registro encontrado.</TableCell></TableRow>
              ) : (
                filtered.map((t: any) => {
                  const supplier = suppliers.find((s: any) => s.id === t.supplier_id);
                  const overdue = t.status === 'pending' && t.due_date && t.due_date < todayStr;
                  return (
                    <TableRow key={t.id} className={cn("hover:bg-red-50/50 transition-colors", overdue && "bg-rose-50/40")}>
                      <TableCell className="text-xs text-gray-600">{t.date ? new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}</TableCell>
                      <TableCell className="text-xs font-medium text-gray-800">
                        {t.due_date ? new Date(t.due_date + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                        {overdue && <Badge className="ml-1 text-[9px] bg-rose-100 text-rose-700 hover:bg-rose-200">Vencida</Badge>}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">{t.payment_date ? new Date(t.payment_date + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}</TableCell>
                      <TableCell className="text-xs font-semibold text-gray-900">
                        <div className="flex flex-col">
                          <span>{supplier?.name || 'Sem fornecedor'}</span>
                          {supplier?.phone && (<span className="text-[10px] text-gray-400 italic">{supplier.phone}</span>)}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-gray-600 max-w-[200px] truncate">{t.description}</TableCell>
                      <TableCell className="text-xs font-bold text-red-600">{fmt(t.amount)}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn("text-[10px] font-bold px-2 py-0.5 uppercase tracking-tighter",
                          t.status === 'paid' ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-orange-100 text-orange-700 hover:bg-orange-200")}>
                          {t.status === 'paid' ? 'Pago' : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => { setNewTransaction(t); setIsTransactionDialogOpen(true); setIsEditTransactionMode(true); setIsViewTransactionMode(false); }}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          {t.status !== 'paid' && (
                            <Button variant="outline" size="sm" className="h-7 px-2 text-[10px] gap-1 text-red-600 border-red-200 hover:bg-red-50 font-bold"
                              title="Pagar Conta" onClick={() => handleOpenPayModal(t)}>
                              <CheckCircle2 className="w-3 h-3" /> Pagar
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={async () => {
                              if (confirm("Excluir esta despesa?")) {
                                try {
                                  const { error } = await supabase.from('financial_transactions').delete().eq('id', t.id);
                                  if (error) throw error;
                                  toast.success("Despesa excluída!");
                                  fetchData();
                                } catch (e: any) { toast.error("Erro: " + e.message); }
                              }
                            }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};


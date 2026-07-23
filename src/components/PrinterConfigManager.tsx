import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Printer, Settings, Plus, Trash2, Edit2, List, History, Monitor, CheckCircle, XCircle, AlertCircle, RefreshCcw, Wifi, Search, Loader2, Play, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

export function PrinterConfigManager() {
  const [printers, setPrinters] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [mappings, setMappings] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [storeSettings, setStoreSettings] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [cleaningJobs, setCleaningJobs] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("printers");

  const handleCleanupOldJobs = async (mode: "days" | "all" = "days") => {
    let daysToKeep = 30;
    if (mode === "days") {
      const answer = prompt("Remover jobs de impressão com mais de quantos dias?", "30");
      if (answer === null) return;
      const parsed = parseInt(answer, 10);
      if (isNaN(parsed) || parsed < 0) {
        toast.error("Valor inválido.");
        return;
      }
      daysToKeep = parsed;
    } else {
      if (!confirm("Tem certeza que deseja remover TODOS os jobs de impressão (independente do status/data)?")) return;
      daysToKeep = 0;
    }

    setCleaningJobs(true);
    try {
      const cutoff = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000).toISOString();
      let query = (supabase as any).from("printing_jobs").delete({ count: "exact" });
      if (daysToKeep > 0) query = query.lt("created_at", cutoff);
      else query = query.not("id", "is", null); // apaga tudo
      const { error, count } = await query;
      if (error) throw error;
      toast.success(`${count ?? 0} job(s) removido(s).`);
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao limpar jobs: " + (err?.message || "desconhecido"));
    } finally {
      setCleaningJobs(false);
    }
  };

  // Form states
  const [isPrinterDialogOpen, setIsPrinterDialogOpen] = useState(false);
  const [isSectorDialogOpen, setIsSectorDialogOpen] = useState(false);
  const [isMappingDialogOpen, setIsMappingDialogOpen] = useState(false);
  
  const [editingPrinter, setEditingPrinter] = useState<any>(null);
  const [editingSector, setEditingSector] = useState<any>(null);
  const [isEditingMapping, setIsEditingMapping] = useState(false);
  const [testPrintPreview, setTestPrintPreview] = useState<any>(null);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);

  const [isScanning, setIsScanning] = useState(false);
  const [scannedPrinters, setScannedPrinters] = useState<any[]>([]);

  const [printerForm, setPrinterForm] = useState({
    name: "",
    description: "",
    sector_id: "",
    connection_type: "tcp",
    ip_address: "",
    port: "9100",
    model: "Generic ESC/POS",
    copies: "1",
    priority: "0",
    is_active: true,
    auto_print: true,
    esc_pos_compatible: true,
    show_preview: true,
    auto_browser_print: false

  });

  const [sectorForm, setSectorForm] = useState({
    name: "",
    description: "",
    printing_type: "complete",
    auto_print: true,
    is_active: true
  });

  const [mappingForm, setMappingForm] = useState<{category_ids: string[], sector_ids: string[]}>({
    category_ids: [],
    sector_ids: []
  });

  const fetchLogs = async () => {
    const { data } = await supabase
      .from("printing_jobs")
      .select("*, printers(name)")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setLogs(data);
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("printer_config_jobs_history")
      .on("postgres_changes", { event: "*", schema: "public", table: "printing_jobs" }, () => {
        fetchLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [printersRes, sectorsRes, categoriesRes, mappingsRes, logsRes, settingsRes] = await Promise.all([
      supabase.from("printers").select("*, printer_sectors(name)").order("name"),
      supabase.from("printer_sectors").select("*").order("name"),
      supabase.from("categories").select("*").order("name"),
      supabase.from("category_printer_mappings").select("*, categories(name), printer_sectors(name)"),
      supabase.from("printing_jobs").select("*, printers(name)").order("created_at", { ascending: false }).limit(50),
      supabase.from("store_settings").select("*").single()
    ]);

    if (printersRes.data) setPrinters(printersRes.data);
    if (sectorsRes.data) setSectors(sectorsRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    if (mappingsRes.data) setMappings(mappingsRes.data);
    if (logsRes.data) setLogs(logsRes.data);
    if (settingsRes.data) setStoreSettings(settingsRes.data);

    
    setLoading(false);
  };

  const handleSavePrinter = async () => {
    if (!printerForm.name || printerForm.name.trim() === "") {
      return toast.error("Nome é obrigatório");
    }

    if (printerForm.connection_type !== 'virtual' && !printerForm.ip_address) {
      return toast.error("Endereço IP é obrigatório para conexões de rede");
    }

    const payload = {
      name: printerForm.name.trim(),
      description: printerForm.description,
      sector_id: printerForm.sector_id === "none" || !printerForm.sector_id ? null : printerForm.sector_id,
      connection_type: printerForm.connection_type,
      ip_address: printerForm.ip_address,
      port: printerForm.port ? parseInt(String(printerForm.port)) : 9100,
      model: printerForm.model,
      copies: printerForm.copies ? parseInt(String(printerForm.copies)) : 1,
      priority: printerForm.priority ? parseInt(String(printerForm.priority)) : 0,
      is_active: printerForm.is_active,
      auto_print: printerForm.auto_print,
      esc_pos_compatible: printerForm.esc_pos_compatible,
      show_preview: printerForm.show_preview,
      auto_browser_print: printerForm.auto_browser_print,
    };

    try {
      if (editingPrinter) {
        const { error } = await supabase.from("printers").update(payload).eq("id", editingPrinter.id);
        if (error) throw error;
        toast.success("Impressora atualizada!");
      } else {
        const { error } = await supabase.from("printers").insert([payload]);
        if (error) throw error;
        toast.success("Impressora cadastrada!");
      }
      setIsPrinterDialogOpen(false);
      setEditingPrinter(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeletePrinter = async (id: string) => {
    if (!confirm("Excluir esta impressora?")) return;
    const { error } = await supabase.from("printers").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Impressora excluída");
      fetchData();
    }
  };

  const handleSaveSector = async () => {
    if (!sectorForm.name) return toast.error("Nome é obrigatório");
    
    const payload = {
      name: sectorForm.name,
      description: sectorForm.description,
    };

    try {
      if (editingSector) {
        const { error } = await supabase.from("printer_sectors").update(payload).eq("id", editingSector.id);
        if (error) throw error;
        toast.success("Setor atualizado!");
      } else {
        const { error } = await supabase.from("printer_sectors").insert([payload]);
        if (error) throw error;
        toast.success("Setor cadastrado!");
      }
      setIsSectorDialogOpen(false);
      setEditingSector(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteSector = async (id: string) => {
    if (!confirm("Excluir este setor? Isso removerá o vínculo de impressoras e categorias associadas.")) return;
    const { error } = await supabase.from("printer_sectors").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Setor excluído");
      fetchData();
    }
  };

  const handleSaveMapping = async () => {
    if (mappingForm.category_ids.length === 0 || mappingForm.sector_ids.length === 0) {
      return toast.error("Selecione categorias e ao menos um setor");
    }

    try {
      if (isEditingMapping) {
        const catId = mappingForm.category_ids[0];
        const { error: delError } = await supabase
          .from("category_printer_mappings")
          .delete()
          .eq("category_id", catId);
        
        if (delError) throw delError;
      }

      const inserts: any[] = [];
      mappingForm.category_ids.forEach(category_id => {
        mappingForm.sector_ids.forEach(sector_id => {
          inserts.push({
            category_id: category_id,
            sector_id: sector_id,
          });
        });
      });

      const { error } = await supabase.from("category_printer_mappings").insert(inserts);
      if (error) throw error;
      
      toast.success(isEditingMapping ? "Vínculo atualizado!" : "Vínculos criados!");
      setIsMappingDialogOpen(false);
      setIsEditingMapping(false);
      setMappingForm({ category_ids: [], sector_ids: [] });
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao salvar vínculos");
    }
  };
  const handleDeleteMapping = async (id: string) => {
    const { error } = await supabase.from("category_printer_mappings").delete().eq("id", id);
    if (error) toast.error(error.message);
    else fetchData();
  };
  const handleTestPrint = async (printerId: string) => {
    toast.info("Enviando teste de impressão...");
    
    // Buscar a impressora atual para saber o setor dela
    const { data: printerData } = await supabase
      .from("printers")
      .select("*, printer_sectors(name)")
      .eq("id", printerId)
      .single();

    const testContent = {
      items: [
        { name: "PRODUTO TESTE", quantity: 1, price: 10.00, notes: "Observação de teste" }
      ],
      total: 10.00,
      order_number: "TESTE-001",
      customer: "TESTE DE IMPRESSÃO",
      timestamp: new Date().toLocaleTimeString(),
      sector_name: printerData?.printer_sectors?.name || "TESTE",
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from("printing_jobs").insert([{
        printer_id: printerId,
        content: JSON.stringify(testContent),
        status: 'pending'
      }]);

      if (error) throw error;
      
      toast.success("Teste enviado!");
      setTestPrintPreview(testContent);
      setIsTestDialogOpen(true);
      fetchData();
    } catch (error: any) {
      toast.error("Erro no teste: " + error.message);
    }
  };

  const handleScanPrinters = async () => {
    setIsScanning(true);
    toast.info("Buscando impressoras na rede local...");
    
    // Simulação de busca na rede local (como seria feito por um app desktop/mobile ou bridge)
    setTimeout(() => {
      const found = [
        { name: "EPSON TM-T20", ip: "192.168.1.150", port: "9100", model: "Epson ESC/POS" },
        { name: "MP-4200 TH", ip: "192.168.1.155", port: "9100", model: "Bematech" },
        { name: "WiFi Printer", ip: "192.168.1.200", port: "9100", model: "Generic WiFi" }
      ];
      setScannedPrinters(found);
      setIsScanning(false);
      toast.success(`${found.length} impressoras encontradas!`);
    }, 2000);
  };

  const handleScanWindowsPrinters = async () => {
    setIsScanning(true);
    toast.info("Buscando impressoras instaladas no Sistema (CUPS/Windows)...");
    
    // Em um cenário real, isso exigiria um bridge local ou a API de Impressão do Navegador (print())
    // Aqui simulamos a detecção de impressoras locais do sistema
    setTimeout(() => {
      const found = [
        { name: "Microsoft Print to PDF", ip: "LOCAL_PDF", port: "0", model: "Windows PDF", type: 'usb' },
        { name: "POS-80 Series", ip: "USB001", port: "0", model: "Generic Thermal", type: 'usb' },
        { name: "ELGIN i9", ip: "USB002", port: "0", model: "Elgin i9", type: 'usb' }
      ];
      setScannedPrinters(found);
      setIsScanning(false);
      toast.success(`${found.length} impressoras locais encontradas!`);
    }, 1500);
  };

  const handleSelectScanned = (p: any) => {
    setPrinterForm({
      ...printerForm,
      name: p.name,
      ip_address: p.ip,
      port: p.port || "9100",
      model: p.model,
      connection_type: p.type || "wifi"
    });
    setScannedPrinters([]);
  };

  const currentPaperFormat = ((storeSettings as any)?.print_paper_format || "thermal_80mm") as "a4" | "thermal_80mm";

  const handlePaperFormatChange = async (value: "a4" | "thermal_80mm") => {
    if (!storeSettings?.id) {
      toast.error("Configurações da loja ainda não foram carregadas.");
      return;
    }

    const { error } = await supabase
      .from("store_settings")
      .update({ print_paper_format: value } as any)
      .eq("id", storeSettings.id);

    if (error) {
      toast.error(`Erro ao salvar formato de papel: ${error.message}`);
      return;
    }

    toast.success("Formato de papel atualizado!");
    fetchData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tighter text-gray-800">GERENCIAMENTO DE IMPRESSÃO</h2>
          <p className="text-sm text-muted-foreground">Configure setores, impressoras e automações de impressão.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Sincronizar
          </Button>
        </div>
      </div>

      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Label className="text-base font-bold">Formato de Papel</Label>
              <Badge variant="outline" className="bg-background">
                {currentPaperFormat === "a4" ? "A4" : "Térmica 80mm"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Esta configuração vale para todos os comprovantes e relatórios impressos pelo sistema.
            </p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Button
              variant="outline"
              type="button"
              onClick={() => window.open('/preview-impressao', '_blank')}
              className="gap-2"
            >
              <Eye className="h-4 w-4" /> Preview de Impressão
            </Button>
            <Select value={currentPaperFormat} onValueChange={(value) => handlePaperFormatChange(value as "a4" | "thermal_80mm")}>
              <SelectTrigger className="w-full md:w-[240px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thermal_80mm">Térmica 80mm</SelectItem>
                <SelectItem value="a4">A4 (Jato de tinta/Laser)</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </CardContent>
      </Card>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="printers" className="gap-2"><Printer className="h-4 w-4" /> Impressoras</TabsTrigger>
          <TabsTrigger value="sectors" className="gap-2"><Settings className="h-4 w-4" /> Setores</TabsTrigger>
          <TabsTrigger value="categories" className="gap-2"><List className="h-4 w-4" /> Categorias</TabsTrigger>
          <TabsTrigger value="settings" className="gap-2"><Settings className="h-4 w-4" /> Configurações</TabsTrigger>
          <TabsTrigger value="monitor" className="gap-2"><Monitor className="h-4 w-4" /> Monitor</TabsTrigger>
          <TabsTrigger value="logs" className="gap-2"><History className="h-4 w-4" /> Logs</TabsTrigger>
        </TabsList>


        <TabsContent value="printers" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Impressoras Cadastradas</h3>
            <Button size="sm" onClick={() => {
              setEditingPrinter(null);
              setPrinterForm({
                name: "",
                description: "",
                sector_id: "",
                connection_type: "tcp",
                ip_address: "",
                port: "9100",
                model: "Generic ESC/POS",
                copies: "1",
                priority: "0",
                is_active: true,
                auto_print: true,
                esc_pos_compatible: true,
                show_preview: true,
                auto_browser_print: false

              });
              setIsPrinterDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" /> Nova Impressora
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {printers.map((p) => (
              <Card key={p.id} className={`${!p.is_active ? 'opacity-60 bg-muted/20' : ''} border-2 hover:border-primary/20 transition-all`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-bold uppercase">{p.name}</CardTitle>
                    <Badge variant={p.is_active ? "default" : "secondary"}>{p.is_active ? "Ativa" : "Inativa"}</Badge>
                  </div>
                  <CardDescription>{p.description || "Sem descrição"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Setor:</span>
                    <span className="font-bold">{p.printer_sectors?.name || "Nenhum"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Conexão:</span>
                    <span className="font-bold uppercase">{p.connection_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Endereço:</span>
                    <span className="font-bold">{p.ip_address}:{p.port}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 border-t gap-2 flex justify-end">
                   <Button variant="ghost" size="icon" title="Testar Impressão" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50" onClick={() => handleTestPrint(p.id)}>
                    <Play className="h-4 w-4" />
                  </Button>
                   <Button variant="ghost" size="icon" onClick={() => {
                     setEditingPrinter(p);
                     setPrinterForm({
                       ...p,
                       port: String(p.port),
                       copies: String(p.copies),
                       priority: String(p.priority),
                       sector_id: p.sector_id || "none"
                     });
                     setIsPrinterDialogOpen(true);
                   }}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeletePrinter(p.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sectors" className="mt-6 space-y-4">
           <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Setores de Produção</h3>
            <Button size="sm" onClick={() => {
              setEditingSector(null);
              setSectorForm({
                name: "",
                description: "",
                printing_type: "complete",
                auto_print: true,
                is_active: true
              });
              setIsSectorDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" /> Novo Setor
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="font-bold text-gray-600">Setor</TableHead>
                  <TableHead className="font-bold">Descrição</TableHead>
                  <TableHead className="font-bold">Tipo Impressão</TableHead>
                  <TableHead className="font-bold text-center">Auto-Print</TableHead>
                  <TableHead className="font-bold text-center">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sectors.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-bold uppercase text-xs text-primary">{s.display_name}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{s.description || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase">{s.printing_type === 'complete' ? 'Completa' : 'Resumida'}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch checked={s.auto_print} disabled />
                    </TableCell>
                    <TableCell className="text-center">
                       <Badge variant={s.is_active ? "outline" : "secondary"} className={s.is_active ? "border-green-500 text-green-700" : ""}>
                         {s.is_active ? "Ativo" : "Inativo"}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => {
                          setEditingSector(s);
                          setSectorForm(s);
                          setIsSectorDialogOpen(true);
                        }}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteSector(s.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Vínculo Categoria x Setor</h3>
            <Button size="sm" onClick={() => {
              setMappingForm({ category_ids: [], sector_ids: [] });
              setIsEditingMapping(false);
              setIsMappingDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" /> Vincular Categoria
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(mappings.reduce((acc: any, m: any) => {
              const catId = m.category_id;
              if (!acc[catId]) acc[catId] = { name: m.categories?.name, id: catId, sectors: [] };
              acc[catId].sectors.push(m);
              return acc;
            }, {})).map((group: any) => (
              <Card key={group.id} className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-primary/5 py-3 border-b border-primary/10 flex-row justify-between items-center space-y-0">
                  <div>
                    <div className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Categoria</div>
                    <CardTitle className="text-sm font-bold uppercase text-primary">{group.name}</CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-primary hover:bg-primary/10" 
                    onClick={() => {
                      setMappingForm({ 
                        category_ids: [group.id], 
                        sector_ids: group.sectors.map((s: any) => s.sector_id) 
                      });
                      setIsEditingMapping(true);
                      setIsMappingDialogOpen(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Setores de Impressão</div>
                  <div className="flex flex-wrap gap-2">
                    {group.sectors.map((m: any) => (
                      <Badge key={m.id} variant="secondary" className="pl-3 pr-1 py-1 gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border-none shadow-sm">
                        {m.printer_sectors?.display_name}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-4 w-4 text-blue-400 hover:text-red-500 hover:bg-transparent" 
                          onClick={() => handleDeleteMapping(m.id)}
                        >
                          <Trash2 className="h-2 w-2" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comportamento de Impressão (Mesa)</CardTitle>
              <CardDescription>Defina como o sistema deve se comportar ao lançar itens nas mesas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-xl">
                <div className="space-y-0.5">
                  <Label className="text-base">Modo de Lançamento</Label>
                  <p className="text-sm text-muted-foreground">
                    Imediato: imprime assim que adiciona o item.<br />
                    Agrupado: aguarda o botão "Enviar para Produção".
                  </p>
                </div>
                <Select 
                  value={storeSettings?.table_print_mode || 'immediate'} 
                  onValueChange={async (v) => {
                    const { error } = await supabase.from('store_settings').update({ table_print_mode: v }).eq('id', storeSettings.id);
                    if (!error) {
                      toast.success("Modo atualizado!");
                      fetchData();
                    }
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Imediato</SelectItem>
                    <SelectItem value="grouped">Agrupado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-xl">
                <div className="space-y-0.5">
                  <Label className="text-base">Impressão Individual de Itens</Label>
                  <p className="text-sm text-muted-foreground">Se ativo, cada item sairá em um cupom separado na impressora.</p>
                </div>
                <Switch 
                  checked={storeSettings?.print_item_separately} 
                  onCheckedChange={async (v) => {
                    const { error } = await supabase.from('store_settings').update({ print_item_separately: v }).eq('id', storeSettings.id);
                    if (!error) {
                      toast.success("Configuração salva!");
                      fetchData();
                    }
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-xl bg-blue-50/20 border-blue-100">
                <div className="space-y-0.5">
                  <Label className="text-base text-blue-700">Impressão Centralizada (Apenas Caixa)</Label>
                  <p className="text-sm text-blue-600/80">Se ativo, tudo será impresso na impressora do caixa, ignorando setores (Cozinha/Bar).</p>
                </div>
                <Switch 
                  checked={storeSettings?.centralized_printing} 
                  onCheckedChange={async (v) => {
                    const { error } = await supabase.from('store_settings').update({ centralized_printing: v }).eq('id', storeSettings.id);
                    if (!error) {
                      toast.success("Modo de impressão centralizada atualizado!");
                      fetchData();
                    }
                  }}
                />
              </div>

              <div className="p-4 border rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Formato de Papel</Label>
                    <p className="text-sm text-muted-foreground">
                      Escolha o formato de impressão usado pelo sistema.
                    </p>
                  </div>
                  <Select
                    value={currentPaperFormat}
                    onValueChange={(v) => handlePaperFormatChange(v as "a4" | "thermal_80mm")}
                  >
                    <SelectTrigger className="w-[220px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="thermal_80mm">Térmica 80mm</SelectItem>
                      <SelectItem value="a4">A4 (Jato de tinta/Laser)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {currentPaperFormat === 'a4' && (
                  <div className="space-y-1">
                    <Label className="text-sm">Modelo da impressora térmica (referência)</Label>
                    <Input
                      placeholder="MDK-082"
                      defaultValue={(storeSettings as any)?.thermal_printer_model || ''}
                      onBlur={async (e) => {
                        const v = e.target.value;
                        const { error } = await supabase.from('store_settings').update({ thermal_printer_model: v } as any).eq('id', storeSettings.id);
                        if (!error) {
                          toast.success("Modelo salvo!");
                          fetchData();
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Apenas registro — usado quando voltar para o formato térmico.
                    </p>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      const { gerarHtmlImpressao } = await import('@/lib/print-template');
                      const formato = ((storeSettings as any)?.print_paper_format || 'thermal_80mm') as 'a4' | 'thermal_80mm';
                      const html = gerarHtmlImpressao({
                        titulo: 'TESTE DE IMPRESSÃO',
                        formato,
                        content: {
                          order_number: 'TESTE-001',
                          customer_name: 'Cliente Exemplo',
                          waiter_name: 'Atendente Teste',
                          sector_name: 'COZINHA',
                          created_at: new Date().toISOString(),
                          total: 47.5,
                          notes: 'Cupom de teste — valide o layout antes de usar.',
                          items: [
                            { name: 'X-Burger Especial', quantity: 2, price: 18.0, notes: 'sem cebola', complements: [{ name: 'Bacon extra' }, { name: 'Queijo cheddar' }] },
                            { name: 'Refrigerante Lata', quantity: 1, price: 6.5 },
                            { name: 'Batata Frita M', quantity: 1, price: 5.0 },
                          ],
                        },
                      });
                      const win = window.open('', '_blank', 'width=800,height=900');
                      if (win) {
                        win.document.write(html);
                        win.document.close();
                      } else {
                        toast.error('Não foi possível abrir a janela de teste (pop-up bloqueado).');
                      }
                    }}
                  >
                    Imprimir teste
                  </Button>
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitor" className="mt-6">

          <Card>
            <CardHeader>
              <CardTitle>Monitor de Status</CardTitle>
              <CardDescription>Status em tempo real das impressoras na rede local.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {printers.map(p => (
                   <div key={p.id} className="p-4 rounded-xl border flex items-center justify-between bg-muted/10">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${p.is_active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                      <div>
                        <div className="font-bold uppercase text-xs">{p.name}</div>
                        <div className="text-[10px] text-muted-foreground">{p.ip_address}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[9px]">ONLINE (Simulado)</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Histórico de Impressão</CardTitle>
                <CardDescription>Jobs concluídos ou com falha há mais de 30 dias podem ser removidos para manter o banco leve.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCleanupOldJobs("days")}
                  disabled={cleaningJobs}
                  className="gap-2"
                >
                  {cleaningJobs ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Limpar por dias
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleCleanupOldJobs("all")}
                  disabled={cleaningJobs}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Limpar TODOS
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Impressora</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Erro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs">{new Date(log.created_at).toLocaleString()}</TableCell>
                      <TableCell className="text-xs font-bold uppercase">{log.printers?.name}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] font-bold ${
                            log.status === 'printed' ? 'bg-green-50 text-green-700 border-green-200' : 
                            (log.status === 'failed' || log.status === 'error') ? 'bg-red-50 text-red-700 border-red-200' : 
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {log.status === 'printed' ? 'IMPRESSO' : 
                           (log.status === 'failed' || log.status === 'error') ? 'FALHOU' : 
                           log.status === 'pending' ? 'PENDENTE' : log.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-red-500 truncate max-w-[200px]">{log.error_message || "-"}</TableCell>
                    </TableRow>
                  ))}
                  {logs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">Nenhum log encontrado.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Printer Dialog */}
      <Dialog open={isPrinterDialogOpen} onOpenChange={setIsPrinterDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingPrinter ? "Editar Impressora" : "Cadastrar Impressora"}</DialogTitle>
            <DialogDescription>Configure os detalhes da conexão da impressora térmica.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome da Impressora</Label>
                <Input value={printerForm.name} onChange={e => setPrinterForm({...printerForm, name: e.target.value})} placeholder="Ex: Cozinha 1" />
              </div>
              <div className="space-y-2">
                <Label>Setor</Label>
                <Select value={printerForm.sector_id} onValueChange={v => setPrinterForm({...printerForm, sector_id: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {sectors.map(s => <SelectItem key={s.id} value={s.id}>{s.display_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={printerForm.description} onChange={e => setPrinterForm({...printerForm, description: e.target.value})} placeholder="Ex: Localizada no balcão principal" />
            </div>
            
            <div className="space-y-2">
              <Label>Tipo de Conexão</Label>
              <Select value={printerForm.connection_type} onValueChange={v => setPrinterForm({...printerForm, connection_type: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tcp">TCP/IP (Cabo)</SelectItem>
                  <SelectItem value="wifi">WiFi / Rede Sem Fio</SelectItem>
                  <SelectItem value="usb">USB (Local / Linux)</SelectItem>
                  <SelectItem value="virtual">Impressora Virtual (Navegador/PDF)</SelectItem>
                  <SelectItem value="qz_tray">QZ Tray (Impressão Silenciosa)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 border-2 border-dashed rounded-xl bg-blue-50/30 border-blue-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Search className="h-4 w-4 text-primary" /> Localizador de Impressoras
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800" onClick={handleScanPrinters} disabled={isScanning}>
                    {isScanning ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Wifi className="h-3 w-3 mr-2" />}
                    {isScanning ? "..." : "Rede"}
                  </Button>
                  <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800" onClick={handleScanWindowsPrinters} disabled={isScanning}>
                    {isScanning ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Monitor className="h-3 w-3 mr-2" />}
                    {isScanning ? "..." : "SISTEMA (Win/Linux)"}
                  </Button>
                </div>
              </div>

              {scannedPrinters.length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {scannedPrinters.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border border-blue-100 text-xs hover:border-primary cursor-pointer transition-colors shadow-sm" onClick={() => handleSelectScanned(p)}>
                      <div>
                        <div className="font-bold">{p.name}</div>
                        <div className="text-muted-foreground">{p.ip}:{p.port}</div>
                      </div>
                      <Plus className="h-3 w-3 text-primary" />
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-muted-foreground">O localizador identifica impressoras na rede (WiFi) ou instaladas no Sistema (CUPS/Linux ou Windows).</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{printerForm.connection_type === 'usb' ? 'Porta USB / Nome' : 'IP da Impressora'}</Label>
                <Input value={printerForm.ip_address} onChange={e => setPrinterForm({...printerForm, ip_address: e.target.value})} placeholder={printerForm.connection_type === 'usb' ? 'LPT1 / COM1' : '192.168.1.100'} />
              </div>
              <div className="space-y-2">
                <Label>Porta (Padrão 9100)</Label>
                <Input type="number" value={printerForm.port} onChange={e => setPrinterForm({...printerForm, port: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Vias</Label>
                <Input type="number" value={printerForm.copies} onChange={e => setPrinterForm({...printerForm, copies: e.target.value})} />
              </div>
              <div className="space-y-2 flex items-center gap-2 pt-8">
                <Switch checked={printerForm.is_active} onCheckedChange={c => setPrinterForm({...printerForm, is_active: c})} />
                <Label>Ativa</Label>
              </div>
              <div className="space-y-2 flex items-center gap-2 pt-8">
                <Switch checked={printerForm.auto_print} onCheckedChange={c => setPrinterForm({...printerForm, auto_print: c})} />
                <Label>Auto</Label>
              </div>
              <div className="space-y-2 flex items-center gap-2 pt-8">
                <Switch checked={printerForm.show_preview} onCheckedChange={c => setPrinterForm({...printerForm, show_preview: c})} />
                <Label>Preview</Label>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            {editingPrinter && (
              <Button type="button" variant="outline" className="text-blue-600 border-blue-200" onClick={() => handleTestPrint(editingPrinter.id)}>
                <Play className="h-4 w-4 mr-2" /> Testar Agora
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsPrinterDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSavePrinter}>Salvar Impressora</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sector Dialog */}
      <Dialog open={isSectorDialogOpen} onOpenChange={setIsSectorDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{editingSector ? "Editar Setor" : "Cadastrar Setor"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Setor (Ex: Pizzaria)</Label>
              <Input value={sectorForm.name} onChange={e => setSectorForm({...sectorForm, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Impressão</Label>
              <Select value={sectorForm.printing_type} onValueChange={v => setSectorForm({...sectorForm, printing_type: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="complete">Completa (Tudo)</SelectItem>
                  <SelectItem value="summary">Resumida (Apenas produção)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input 
                value={sectorForm.description || ""} 
                onChange={e => setSectorForm({...sectorForm, description: e.target.value})} 
                placeholder="Ex: Responsável por pratos quentes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSectorDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveSector}>Salvar Setor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mapping Dialog */}
      <Dialog open={isMappingDialogOpen} onOpenChange={setIsMappingDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{isEditingMapping ? "Editar Vínculo" : "Vincular Categoria ao Setor"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-3">
              <Label>{isEditingMapping ? "Alterando Categoria:" : "Categorias"}</Label>
              <ScrollArea className="h-40 border rounded-lg p-4">
                <div className="space-y-4">
                  {categories
                    .filter(c => !isEditingMapping || mappingForm.category_ids.includes(c.id))
                    .map(c => (
                    <div key={c.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`cat-${c.id}`} 
                        checked={mappingForm.category_ids.includes(c.id)}
                        disabled={isEditingMapping}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setMappingForm({ ...mappingForm, category_ids: [...mappingForm.category_ids, c.id] });
                          } else {
                            setMappingForm({ 
                              ...mappingForm, 
                              category_ids: mappingForm.category_ids.filter(id => id !== c.id) 
                            });
                          }
                        }}
                      />
                      <label htmlFor={`cat-${c.id}`} className="text-sm font-medium leading-none uppercase cursor-pointer">
                        {c.name}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="space-y-3">
              <Label>Setores de Impressão</Label>
              <ScrollArea className="h-48 border rounded-lg p-4">
                <div className="space-y-4">
                  {sectors.map(s => (
                    <div key={s.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`sector-${s.id}`} 
                        checked={mappingForm.sector_ids.includes(s.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setMappingForm({ ...mappingForm, sector_ids: [...mappingForm.sector_ids, s.id] });
                          } else {
                            setMappingForm({ 
                              ...mappingForm, 
                              sector_ids: mappingForm.sector_ids.filter(id => id !== s.id) 
                            });
                          }
                        }}
                      />
                      <label 
                        htmlFor={`sector-${s.id}`} 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 uppercase cursor-pointer"
                      >
                        {s.display_name}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <p className="text-[10px] text-muted-foreground italic">
                Selecione todos os setores onde os produtos desta categoria devem ser impressos (Ex: Cozinha e Delivery).
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMappingDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveMapping}>Salvar Vínculo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Print Preview Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Printer className="h-6 w-6 text-green-500" />
              Impressora Virtual
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-gray-600">
              {testPrintPreview?.sector_name ? `Setor: ${testPrintPreview.sector_name.toUpperCase()}` : "Visualização do Cupom"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-amber-50 p-6 rounded-lg border border-amber-200 shadow-inner font-mono text-[11px] space-y-2 max-h-[400px] overflow-y-auto">
            <div className="text-center border-b border-dashed border-amber-300 pb-2 mb-2 font-bold">
              *** COMPROVANTE DE TESTE ***
            </div>
            <div className="flex justify-between">
              <span>DATA/HORA:</span>
              <span>{testPrintPreview?.timestamp}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>PEDIDO:</span>
              <span>{testPrintPreview?.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span>CLIENTE:</span>
              <span>{testPrintPreview?.customer}</span>
            </div>
            
            <div className="border-t border-b border-dashed border-amber-300 py-2 my-2">
              <div className="flex justify-between font-bold mb-1">
                <span>ITEM</span>
                <span>QTD</span>
                <span>VALOR</span>
              </div>
              {testPrintPreview?.items.map((item: any, idx: number) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between uppercase">
                    <span>{item.name}</span>
                    <span>{item.quantity}</span>
                    <span>R$ {item.price.toFixed(2)}</span>
                  </div>
                  {item.notes && <div className="text-[9px] italic ml-2">* {item.notes}</div>}
                </div>
              ))}
            </div>
            
            <div className="flex justify-between font-bold text-sm pt-2">
              <span>TOTAL:</span>
              <span>R$ {testPrintPreview?.total.toFixed(2)}</span>
            </div>
            
            <div className="text-center border-t border-dashed border-amber-300 pt-4 mt-4 text-[9px] text-amber-700 italic">
              Este é um teste virtual para validar o funcionamento do sistema de impressão.
            </div>
          </div>
          
          <DialogFooter>
            <Button className="w-full" onClick={() => setIsTestDialogOpen(false)}>Fechar Visualização</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

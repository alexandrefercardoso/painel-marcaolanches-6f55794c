
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { LayoutGrid, Plus, Save, Trash2, Printer, QrCode, Download, Settings, RefreshCw, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { QRCodeCanvas } from "qrcode.react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export function TableManagement() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  
  // Table generation state
  const [quantity, setQuantity] = useState("10");
  const [prefix, setPrefix] = useState("Mesa");
  const [sector, setSector] = useState("Geral");

  const fetchTablesAndSettings = async () => {
    try {
      setLoading(true);
      const { data: tablesData, error: tablesError } = await supabase.from("restaurant_tables").select("*").order("number");
      if (tablesError) {
        console.error("Erro ao buscar mesas:", tablesError);
        toast.error("Erro ao buscar mesas: " + tablesError.message);
      }
      setTables(tablesData || []);

      const { data: settingsData, error: settingsError } = await supabase.from("store_settings").select("*").single();
      if (settingsError) {
        console.error("Erro ao buscar store_settings:", settingsError);
        toast.error("Erro ao carregar configurações da empresa: " + settingsError.message);
      }
      setSettings(settingsData || null);
    } catch (error: any) {
      console.error("Erro crítico ao carregar dados:", error);
      toast.error("Erro crítico ao carregar dados: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTablesAndSettings();
  }, []);

  const getTableQrCodeUrl = (digitalMenuUrl: string | null | undefined, table: any) => {
    if (!digitalMenuUrl || digitalMenuUrl.trim() === "") return "";
    let targetUrl = digitalMenuUrl.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = "https://" + targetUrl;
    }
    try {
      const url = new URL(targetUrl);
      url.searchParams.set("mesa", table.number);
      url.searchParams.set("table_id", table.id);
      return url.toString();
    } catch (e) {
      const separator = targetUrl.includes("?") ? "&" : "?";
      return `${targetUrl}${separator}mesa=${table.number}&table_id=${table.id}`;
    }
  };

  const handleSaveSettings = async () => {
    try {
      const { error } = await supabase.from("store_settings").update({
        couvert_artistico_enabled: settings.couvert_artistico_enabled,
        couvert_artistico_value: parseFloat(settings.couvert_artistico_value) || 0,
        service_tax_enabled: settings.service_tax_enabled,
        service_tax_percent: parseFloat(settings.service_tax_percent) || 0,
        idle_table_time_minutes: parseInt(settings.idle_table_time_minutes) || 50,
        digital_menu_url: settings.digital_menu_url || ""
      }).eq("id", settings.id);

      if (error) throw error;
      toast.success("Configurações salvas!");
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    }
  };

  const generateTables = async () => {
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Quantidade inválida.");
      return;
    }

    if (tables.length > 0 && !confirm(`Existem ${tables.length} mesas cadastradas. Deseja adicionar mais ${qty} mesas?`)) {
      return;
    }

    try {
      const startNum = tables.length > 0 ? Math.max(...tables.map(t => parseInt(t.number) || 0)) + 1 : 1;
      const newTables = Array.from({ length: qty }, (_, i) => ({
        number: (startNum + i).toString().padStart(2, '0'),
        prefix: prefix,
        sector: sector
      }));

      const { error } = await supabase.from("restaurant_tables").insert(newTables);
      if (error) throw error;

      toast.success(`${qty} mesas geradas com sucesso!`);
      fetchTablesAndSettings();
    } catch (error: any) {
      toast.error("Erro ao gerar mesas: " + error.message);
    }
  };

  const deleteAllTables = async () => {
    // Check for deletion permission
    const sessionStr = localStorage.getItem('admin_session');
    const user = sessionStr ? JSON.parse(sessionStr) : null;
    
    if (user && !user.can_delete) {
      toast.error("Você não tem permissão para excluir configurações de mesas.");
      return;
    }

    if (!confirm("TEM CERTEZA? Isso excluirá todas as mesas e QR Codes!")) return;
    try {
      const { error } = await supabase.from("restaurant_tables").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) throw error;
      toast.success("Todas as mesas foram excluídas.");
      fetchTablesAndSettings();
    } catch (error: any) {
      toast.error("Erro ao excluir: " + error.message);
    }
  };

  const exportQRCodes = async () => {
    if (!settings.digital_menu_url || settings.digital_menu_url.trim() === "") {
      toast.error("Por favor, informe o Link do Cardápio Digital antes de imprimir.");
      return;
    }
    toast.info("Gerando PDF dos QR Codes...");
    const pdf = new jsPDF();
    const qrElements = document.querySelectorAll(".qr-export-container");
    
    for (let i = 0; i < qrElements.length; i++) {
      const element = qrElements[i] as HTMLElement;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        ignoreElements: (el) => el.classList.contains('no-export')
      });
      const imgData = canvas.toDataURL("image/png");
      
      const x = (i % 2) * 100 + 10;
      const y = Math.floor((i % 6) / 2) * 80 + 10;
      
      if (i > 0 && i % 6 === 0) pdf.addPage();
      
      pdf.addImage(imgData, "PNG", x, y, 80, 70);
    }
    
    pdf.save("qr_codes_mesas.pdf");
    toast.success("PDF gerado com sucesso!");
  };

  const handleDeleteTable = async (tableId: string) => {
    // Check for deletion permission
    const sessionStr = localStorage.getItem('admin_session');
    const user = sessionStr ? JSON.parse(sessionStr) : null;
    
    if (user && !user.can_delete) {
      toast.error("Você não tem permissão para excluir mesas.");
      return;
    }

    try {
      // Verificar se há sessões abertas nesta mesa
      const { data: activeSessions } = await supabase
        .from("table_sessions")
        .select("id")
        .eq("table_id", tableId)
        .in("status", ["open", "bill_requested"]);

      if (activeSessions && activeSessions.length > 0) {
        toast.error("Não é possível excluir uma mesa com atendimento ativo!");
        return;
      }

      if (!confirm("Deseja realmente excluir esta mesa?")) return;

      const { error } = await supabase.from("restaurant_tables").delete().eq("id", tableId);
      if (error) throw error;

      toast.success("Mesa excluída com sucesso!");
      fetchTablesAndSettings();
    } catch (error: any) {
      toast.error("Erro ao excluir mesa: " + error.message);
    }
  };

  const handlePrintTable = (table: any) => {
    if (!settings.digital_menu_url || settings.digital_menu_url.trim() === "") {
      toast.error("Por favor, informe o Link do Cardápio Digital antes de imprimir.");
      return;
    }
    const printWindow = window.open('', '_blank', 'width=600,height=800');
    if (!printWindow) return;

    const qrCanvas = document.querySelector(`[data-table-id="${table.id}"] canvas`) as HTMLCanvasElement;
    const qrDataUrl = qrCanvas ? qrCanvas.toDataURL("image/png") : "";
    const finalUrl = getTableQrCodeUrl(settings.digital_menu_url, table);

    printWindow.document.write(`
      <html>
        <head>
          <title>${table.prefix} ${table.number}</title>
          <style>
            body { 
              font-family: 'Inter', sans-serif; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center; 
              padding: 40px;
              text-align: center;
            }
            .prefix { font-size: 14px; font-weight: 800; text-transform: uppercase; color: #666; margin-bottom: 5px; }
            .number { font-size: 32px; font-weight: 900; margin-bottom: 30px; }
            .qr-code { border: 2px solid #000; padding: 20px; border-radius: 20px; margin-bottom: 30px; }
            .url { font-size: 10px; color: #999; margin-top: 20px; word-break: break-all; max-width: 400px; }
            @media print {
              body { padding: 0; }
              @page { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          <h1 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 900; text-transform: uppercase;">${settings.name || ''}</h1>
          <div class="prefix">${table.sector}</div>
          <div class="number">${table.prefix} ${table.number}</div>
          <div class="qr-code">
            <img src="${qrDataUrl}" width="250" height="250" />
          </div>
          <div class="url">${finalUrl}</div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-8 text-center bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl max-w-lg mx-auto my-10 shadow-lg">
        <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-500 mx-auto mb-4 animate-bounce" />
        <h3 className="text-lg font-black uppercase text-red-800 dark:text-red-400 mb-2">Erro ao Carregar Configurações</h3>
        <p className="text-xs text-red-600 dark:text-red-500 mb-6 uppercase font-bold leading-relaxed">
          Não foi possível carregar as configurações da empresa. Verifique se você executou o script SQL no Supabase para criar a coluna "digital_menu_url" na tabela "store_settings".
        </p>
        <div className="flex flex-col gap-2">
          <Button onClick={fetchTablesAndSettings} className="bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs rounded-full gap-2 py-5 shadow-md">
            <RefreshCw className="h-4 w-4" /> Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configurações Gerais */}
        <Card className="border-none shadow-xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-orange-500" />
          <CardHeader>
            <CardTitle className="text-xl font-black uppercase text-orange-900 dark:text-orange-400 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações da Empresa
            </CardTitle>
            <CardDescription className="text-xs font-bold uppercase">Regras de negócio para o atendimento em mesas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border group hover:border-orange-200 transition-colors">
                <div className="space-y-1">
                  <Label className="text-sm font-black uppercase tracking-tight">Couvert Artístico</Label>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Lançar automaticamente por pessoa na abertura</p>
                </div>
                <div className="flex items-center gap-4">
                  {settings.couvert_artistico_enabled && (
                    <div className="w-24">
                      <Input 
                        type="number" 
                        value={settings.couvert_artistico_value} 
                        onChange={(e) => setSettings({...settings, couvert_artistico_value: e.target.value})}
                        className="h-8 font-bold text-xs"
                      />
                    </div>
                  )}
                  <Switch 
                    checked={settings.couvert_artistico_enabled} 
                    onCheckedChange={(val) => setSettings({...settings, couvert_artistico_enabled: val})} 
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border group hover:border-blue-200 transition-colors">
                <div className="space-y-1">
                  <Label className="text-sm font-black uppercase tracking-tight">Taxa de Serviço (%)</Label>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Cálculo automático no fechamento da conta</p>
                </div>
                <div className="flex items-center gap-4">
                  {settings.service_tax_enabled && (
                    <div className="w-24">
                      <Input 
                        type="number" 
                        value={settings.service_tax_percent} 
                        onChange={(e) => setSettings({...settings, service_tax_percent: e.target.value})}
                        className="h-8 font-bold text-xs"
                      />
                    </div>
                  )}
                  <Switch 
                    checked={settings.service_tax_enabled} 
                    onCheckedChange={(val) => setSettings({...settings, service_tax_enabled: val})} 
                  />
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-xl border space-y-3">
                <div className="space-y-1">
                  <Label className="text-sm font-black uppercase tracking-tight">Tempo Máximo Ociosa (minutos)</Label>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Tempo sem movimentação para alerta visual</p>
                </div>
                <Input 
                  type="number" 
                  value={settings.idle_table_time_minutes} 
                  onChange={(e) => setSettings({...settings, idle_table_time_minutes: e.target.value})}
                  className="font-bold"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/20 border-t p-4">
            <Button onClick={handleSaveSettings} className="w-full bg-orange-600 hover:bg-orange-700 font-black uppercase text-xs rounded-full gap-2">
              <Save className="h-4 w-4" />
              Salvar Configurações
            </Button>
          </CardFooter>
        </Card>

        {/* Gerenciamento de Mesas */}
        <Card className="border-none shadow-xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
          <CardHeader>
            <CardTitle className="text-xl font-black uppercase text-blue-900 dark:text-blue-400 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuração de Mesas
            </CardTitle>
            <CardDescription className="text-xs font-bold uppercase">Geração automática e gerenciamento de layout</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">Quantidade</Label>
                <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">Prefixo</Label>
                <Input value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="Ex: Mesa" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">Setor</Label>
                <Input value={sector} onChange={(e) => setSector(e.target.value)} placeholder="Ex: Interno" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={generateTables} className="flex-1 bg-blue-600 hover:bg-blue-700 font-black uppercase text-[10px] rounded-full gap-2">
                <Plus className="h-4 w-4" />
                Gerar Mesas
              </Button>
                <Button onClick={deleteAllTables} variant="outline" className="text-red-600 border-red-200 dark:border-red-900/50 hover:bg-red-600 hover:text-white transition-all font-black uppercase text-[10px] rounded-full gap-2 group">
                  <Trash2 className="h-4 w-4 group-hover:animate-bounce" />
                  Limpar Tudo
                </Button>
            </div>

            <div className="space-y-4 border-t pt-6">
              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                    <QrCode className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-sm font-black uppercase tracking-tight text-blue-900 dark:text-blue-400">
                      Link do Cardápio Digital
                    </Label>
                    <p className="text-[10px] font-bold text-blue-600/70 uppercase">Obrigatório para ativar a geração de QR Codes</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="relative group">
                    <Input 
                      value={settings.digital_menu_url || ""} 
                      onChange={(e) => setSettings({...settings, digital_menu_url: e.target.value})}
                      placeholder="Ex: https://cardapio.meurestaurante.com.br"
                      className="font-bold text-xs h-11 pr-24 border-blue-200 dark:border-blue-900/50 bg-white dark:bg-zinc-950 focus-visible:ring-blue-500 rounded-xl"
                    />
                    <Button 
                      onClick={handleSaveSettings}
                      size="sm"
                      className="absolute right-1.5 top-1.5 h-8 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] rounded-lg px-3 shadow-md"
                    >
                      <Save className="h-3 w-3 mr-1" /> Salvar
                    </Button>
                  </div>

                  {settings.digital_menu_url && settings.digital_menu_url.trim() !== "" && (
                    <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 border border-dashed border-blue-200 dark:border-blue-800/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-black uppercase text-blue-600/70">Exemplo de URL Final:</span>
                        < Badge variant="outline" className="text-[8px] h-4 bg-blue-50 text-blue-600 border-blue-200 font-bold uppercase">Mesa 01</Badge>
                      </div>
                      <p className="text-[10px] font-mono text-muted-foreground break-all leading-tight">
                        {getTableQrCodeUrl(settings.digital_menu_url, { number: "01", id: "uuid-exemplo" })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                onClick={exportQRCodes} 
                disabled={!settings.digital_menu_url || settings.digital_menu_url.trim() === ""}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] rounded-full gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <QrCode className="h-4 w-4" />
                Imprimir QR Codes (PDF)
              </Button>
            </div>
            {!settings.digital_menu_url && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl animate-pulse">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-[10px] font-black uppercase text-red-600">Atenção: Cadastre o link do cardápio para habilitar as impressões</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lista de Mesas e QR Codes */}
      <Card className="border-none shadow-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-black uppercase">Mesas Cadastradas</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase">Total de {tables.length} mesas</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchTablesAndSettings} className="rounded-full">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {tables.map((table) => {
              const hasMenuUrl = settings.digital_menu_url && settings.digital_menu_url.trim() !== "";
              const qrValue = hasMenuUrl ? getTableQrCodeUrl(settings.digital_menu_url, table) : "";
              
              return (
                <div key={table.id} className="qr-export-container group relative flex flex-col items-center p-4 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-lg transition-all">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity no-export">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" 
                      onClick={() => handleDeleteTable(table.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <span className="text-[10px] font-black uppercase text-muted-foreground mb-1">{table.sector}</span>
                  <span className="text-lg font-black text-foreground mb-3">{table.prefix} {table.number}</span>
                  
                  {hasMenuUrl ? (
                    <div className="bg-white p-2 rounded-lg border dark:border-zinc-700 shadow-sm mb-3" data-table-id={table.id}>
                      <QRCodeCanvas 
                        value={qrValue} 
                        size={100}
                        level="H"
                        includeMargin={false}
                      />
                    </div>
                  ) : (
                    <div className="w-[116px] h-[116px] flex flex-col items-center justify-center bg-muted/40 border border-dashed border-red-200 dark:border-red-900/30 rounded-lg mb-3 p-2 text-center text-red-500/80">
                      <QrCode className="h-8 w-8 mb-1.5 opacity-30 animate-pulse" />
                      <span className="text-[8px] font-black uppercase tracking-tighter leading-tight">Cadastre o Link do Cardápio</span>
                    </div>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    disabled={!hasMenuUrl}
                    onClick={() => handlePrintTable(table)}
                    className="h-7 w-full text-[9px] font-black uppercase gap-1 hover:bg-orange-50 no-export disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Printer className="h-3 w-3" />
                    Imprimir
                  </Button>
                </div>
              );
            })}
            
            {tables.length === 0 && (
              <div className="col-span-full py-20 text-center flex flex-col items-center gap-4 border-2 border-dashed rounded-3xl">
                <LayoutGrid className="h-12 w-12 text-muted-foreground/30" />
                <div className="space-y-1">
                  <p className="font-black uppercase text-muted-foreground">Nenhuma mesa configurada</p>
                  <p className="text-xs text-muted-foreground/60 font-bold uppercase">Utilize o painel acima para gerar as mesas automaticamente</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

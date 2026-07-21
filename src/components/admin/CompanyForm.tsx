import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Building2, Phone, MapPin, Clock, CalendarDays, Trash2, Upload, Plus, Eye, Utensils, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CompanyFormSkeleton } from "./CompanyFormSkeleton";
import { FiscalTab } from "./CompanyForm/FiscalTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CompanyFormProps {
  initialData: any;
  onSaveSuccess: (newData: any) => void;
  imageUploading: boolean;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>, field: any) => void;
  handleLogoDelete: (field: 'logo_url' | 'sidebar_logo_url') => void;
  isMenuOpen: boolean;
  savingCompany: boolean;
  setSavingCompany: (val: boolean) => void;
}

export const CompanyForm = React.memo(function CompanyForm({
  initialData,
  onSaveSuccess,
  imageUploading,
  handleLogoUpload,
  handleLogoDelete,
  isMenuOpen,
  savingCompany,
  setSavingCompany
}: CompanyFormProps) {
  const [formData, setFormData] = useState<any>(null);

  // Inicializa o formData apenas uma vez quando o initialData estiver disponível
  useEffect(() => {
    if (initialData && !formData) {
      const defaultData = {
        name: "",
        whatsapp_number: "",
        email: "",
        cnpj: "",
        cpf: "",
        address: "",
        address_number: "",
        state: "",
        city: "",
        neighborhood: "",
        zip_code: "",
        complement: "",
        logo_url: "",
        sidebar_logo_url: "",
        opening_hours: {},
        auto_manage_menu: false,
        google_maps_api_key: "",
        fixed_delivery_fee: null,
        kds_enabled: true,
        latitude: null,
        longitude: null
      };
      
      console.log("Inicializando CompanyForm com:", initialData.logo_url);
      setFormData({ ...defaultData, ...initialData });
    }
  }, [initialData]);

  // Sincroniza o estado quando os dados iniciais mudam
  useEffect(() => {
    if (initialData?.id) {
      setFormData((prev: any) => {
        if (!prev) return initialData;
        
        // Sempre sincroniza URLs de logo se elas mudarem nos dados iniciais
        if (prev.id !== initialData.id || 
            prev.logo_url !== initialData.logo_url || 
            prev.sidebar_logo_url !== initialData.sidebar_logo_url) {
          console.log("Sincronizando formData com novos dados (logo ou ID)");
          return {
            ...prev,
            ...initialData
          };
        }
        return prev;
      });
    }
  }, [initialData]);

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const [geocoding, setGeocoding] = useState(false);
  const buscarCoordenadas = async () => {
    const apiKey = (formData?.google_maps_api_key?.trim() || import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() || "");
    if (!apiKey) {
      toast.error("Configure a Chave da API do Google Maps antes de buscar coordenadas.");
      return;
    }
    const parts = [
      formData?.address,
      formData?.address_number,
      formData?.neighborhood,
      formData?.city,
      formData?.state,
      formData?.zip_code,
    ].filter(Boolean).join(", ");
    if (!parts) {
      toast.error("Preencha o endereço da loja antes de buscar as coordenadas.");
      return;
    }
    try {
      setGeocoding(true);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(parts)}&key=${encodeURIComponent(apiKey)}`;
      const resp = await fetch(url);
      const json = await resp.json();
      if (json.status !== "OK" || !json.results?.[0]) {
        throw new Error(json.error_message || json.status || "Endereço não encontrado");
      }
      const loc = json.results[0].geometry.location;
      setFormData((prev: any) => ({ ...prev, latitude: loc.lat, longitude: loc.lng }));
      toast.success(`Coordenadas encontradas: ${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}`);
    } catch (err: any) {
      console.error("Erro ao geocodificar:", err);
      toast.error("Erro ao buscar coordenadas: " + (err.message || "desconhecido"));
    } finally {
      setGeocoding(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData?.id) {
      toast.error("Erro: ID da empresa não encontrado.");
      return;
    }

    try {
      setSavingCompany(true);
      const updateData = {
        name: formData.name || null,
        whatsapp_number: formData.whatsapp_number || null,
        email: formData.email || null,
        cnpj: formData.cnpj || null,
        cpf: formData.cpf || null,
        city: formData.city || null,
        neighborhood: formData.neighborhood || null,
        address: formData.address || null,
        address_number: formData.address_number || null,
        state: formData.state || null,
        zip_code: formData.zip_code || null,
        complement: formData.complement || null,
        logo_url: formData.logo_url || null,
        sidebar_logo_url: formData.sidebar_logo_url || null,
        opening_hours: formData.opening_hours || {},
        auto_manage_menu: !!formData.auto_manage_menu,
        google_maps_api_key: formData.google_maps_api_key || null,
        fixed_delivery_fee: formData.fixed_delivery_fee ? Number(formData.fixed_delivery_fee) : null,
        kds_enabled: formData.kds_enabled !== false,
        latitude: formData.latitude === "" || formData.latitude === null || formData.latitude === undefined ? null : Number(formData.latitude),
        longitude: formData.longitude === "" || formData.longitude === null || formData.longitude === undefined ? null : Number(formData.longitude),
        is_menu_active: !!isMenuOpen
      };

      const { error, data: updatedResult } = await supabase
        .from("store_settings")
        .update(updateData)
        .eq("id", formData.id)
        .select();

      if (error) throw error;

      toast.success("Configurações salvas com sucesso!");
      if (updatedResult?.[0]) {
        onSaveSuccess(updatedResult[0]);
      }
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar: " + (error.message || "Erro desconhecido"));
    } finally {
      setSavingCompany(false);
    }
  };

  if (!formData?.id && !initialData?.id) {
    return <CompanyFormSkeleton />;
  }

  return (
    <Tabs defaultValue="empresa" className="space-y-4">
      <TabsList>
        <TabsTrigger value="empresa">Empresa</TabsTrigger>
        <TabsTrigger value="fiscal">Fiscal</TabsTrigger>
      </TabsList>
      <TabsContent value="empresa">
    <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden rounded-3xl">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-transparent to-transparent border-b border-primary/5 pb-8">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center shadow-inner">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-3xl font-black tracking-tighter uppercase italic">Dados da Empresa</CardTitle>
            <CardDescription className="font-medium text-muted-foreground">Configure as informações principais do seu estabelecimento.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Coluna de Identidade Visual */}
            <div className="lg:col-span-4 space-y-8">
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary/70 flex items-center gap-2">
                  <Eye className="h-4 w-4" /> Identidade Visual
                </h3>
                
                {/* Logo Principal */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Logo Principal (Cardápio)</span>
                  <div className="border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center gap-4 bg-muted/20 min-h-[220px] transition-all hover:bg-muted/30 hover:border-primary/30 relative">
                    {(formData?.logo_url || initialData?.logo_url) ? (
                      <div className="flex flex-col items-center w-full">
                        <div className="relative group mb-4">
                          <img 
                            src={formData?.logo_url || initialData?.logo_url} 
                            alt="Logo" 
                            className="h-28 w-auto object-contain drop-shadow-md rounded-lg" 
                            key={formData?.logo_url || initialData?.logo_url}
                          />
                        </div>
                        <Button 
                          type="button"
                          variant="destructive" 
                          size="sm" 
                          className="w-full h-10 font-bold gap-2 shadow-sm"
                          onClick={() => {
                            if (confirm("Remover logo?")) handleLogoDelete('logo_url');
                          }}
                        >
                          <Trash2 className="h-4 w-4" /> Excluir Logo
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Upload className="h-8 w-8 text-primary/40 mx-auto mb-2" />
                        <p className="text-xs font-bold text-muted-foreground">Sem Logo</p>
                      </div>
                    )}
                    <Label className="flex w-full cursor-pointer bg-orange-600 text-white px-4 py-2 rounded-xl text-sm items-center justify-center h-11 hover:bg-orange-700 transition-all font-black uppercase">
                      {imageUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Plus className="h-5 w-5 mr-2" /> Carregar</>}
                      <input type="file" className="hidden" accept="image/*" disabled={imageUploading} onChange={(e) => handleLogoUpload(e, 'logo_url')} />
                    </Label>
                  </div>
                </div>

                {/* Logo Lateral */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Logo Lateral (Painel)</span>
                  <div className="border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center gap-4 bg-muted/20 min-h-[150px] transition-all hover:bg-muted/30 hover:border-primary/30 relative">
                    {(formData?.sidebar_logo_url || initialData?.sidebar_logo_url) ? (
                      <div className="flex flex-col items-center w-full">
                        <div className="relative group mb-4">
                          <img 
                            src={formData?.sidebar_logo_url || initialData?.sidebar_logo_url} 
                            alt="Logo Lateral" 
                            className="h-10 w-auto object-contain drop-shadow-sm rounded-lg" 
                            key={formData?.sidebar_logo_url || initialData?.sidebar_logo_url}
                          />
                        </div>
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="sm" 
                          className="w-full h-10 font-bold gap-2 shadow-sm"
                          onClick={() => {
                            if (confirm("Remover logo lateral?")) handleLogoDelete('sidebar_logo_url');
                          }}
                        >
                          <Trash2 className="h-4 w-4" /> Excluir
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Upload className="h-6 w-6 text-primary/30 mx-auto mb-2" />
                        <p className="text-xs font-bold text-muted-foreground">Sem Logo Lateral</p>
                      </div>
                    )}
                    <Label className="flex w-full cursor-pointer bg-orange-600 text-white px-4 py-2 rounded-xl text-sm items-center justify-center h-10 hover:bg-orange-700 font-black uppercase transition-all shadow-sm">
                      {imageUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-2" /> Carregar</>}
                      <input type="file" className="hidden" accept="image/*" disabled={imageUploading} onChange={(e) => handleLogoUpload(e, 'sidebar_logo_url')} />
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna de Dados Cadastrais */}
            <div className="lg:col-span-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold text-primary flex items-center gap-2"><Building2 className="h-4 w-4" /> Nome da Empresa</Label>
                  <Input value={formData?.name || ""} onChange={e => updateField('name', e.target.value)} className="h-12 border-primary/10 focus:border-primary/30" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-primary flex items-center gap-2"><Phone className="h-4 w-4" /> WhatsApp (DDD + Número)</Label>
                  <Input value={formData?.whatsapp_number || ""} onChange={e => updateField('whatsapp_number', e.target.value)} className="h-12 border-primary/10" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold text-primary">CNPJ</Label>
                  <Input value={formData?.cnpj || ""} onChange={e => updateField('cnpj', e.target.value)} className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-primary">CPF</Label>
                  <Input value={formData?.cpf || ""} onChange={e => updateField('cpf', e.target.value)} className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-primary">E-mail</Label>
                  <Input type="email" value={formData?.email || ""} onChange={e => updateField('email', e.target.value)} className="h-12" />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-primary/5">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary/70 flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Endereço
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <Label className="font-bold text-primary">Rua/Logradouro</Label>
                    <Input value={formData?.address || ""} onChange={e => updateField('address', e.target.value)} className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-primary">Número</Label>
                    <Input value={formData?.address_number || ""} onChange={e => updateField('address_number', e.target.value)} className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-primary">CEP</Label>
                    <Input value={formData?.zip_code || ""} onChange={e => updateField('zip_code', e.target.value)} className="h-12" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-primary">Bairro</Label>
                    <Input value={formData?.neighborhood || ""} onChange={e => updateField('neighborhood', e.target.value)} className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-primary">Complemento</Label>
                    <Input value={formData?.complement || ""} onChange={e => updateField('complement', e.target.value)} className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-primary">Cidade</Label>
                    <Input value={formData?.city || ""} onChange={e => updateField('city', e.target.value)} className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-primary">Estado</Label>
                    <Input value={formData?.state || ""} onChange={e => updateField('state', e.target.value)} className="h-12" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-primary/5">
                  <div className="space-y-2">
                    <Label className="font-bold text-primary flex items-center gap-2"><MapPin className="h-4 w-4" /> Latitude</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="-23.5505"
                      value={formData?.latitude === null || formData?.latitude === undefined ? "" : formData.latitude}
                      onChange={e => updateField('latitude', e.target.value === "" ? null : e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-primary flex items-center gap-2"><MapPin className="h-4 w-4" /> Longitude</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="-46.6333"
                      value={formData?.longitude === null || formData?.longitude === undefined ? "" : formData.longitude}
                      onChange={e => updateField('longitude', e.target.value === "" ? null : e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="font-bold text-primary flex items-center gap-2">Chave da API do Google Maps</Label>
                    <Input
                      type="password"
                      placeholder="Cole aqui a chave de API do Google Maps (ou configure VITE_GOOGLE_MAPS_API_KEY no .env)"
                      value={formData?.google_maps_api_key || ""}
                      onChange={e => updateField('google_maps_api_key', e.target.value)}
                      className="h-12"
                    />
                    <p className="text-[10px] text-muted-foreground font-medium italic">
                      A chave é salva junto às configurações da loja. Se não preencher, o sistema tentará usar a variável VITE_GOOGLE_MAPS_API_KEY do ambiente.
                    </p>
                  </div>
                  <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center gap-3">
                    <Button
                      type="button"
                      onClick={buscarCoordenadas}
                      disabled={geocoding}
                      className="h-11 gap-2 font-bold"
                      variant="secondary"
                    >
                      {geocoding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      Buscar coordenadas pelo endereço
                    </Button>
                    <p className="text-[11px] text-muted-foreground font-medium italic flex-1">
                      Usa o endereço preenchido acima + sua Chave da API do Google Maps para localizar a loja automaticamente. Você também pode digitar manualmente ou copiar do Google Maps (clique com o botão direito no endereço).
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                    <Clock className="h-5 w-5" /> Horários de Funcionamento
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg border border-primary/10">
                      <Label className="text-xs font-bold uppercase">Gestão Automática</Label>
                      <input type="checkbox" checked={!!formData?.auto_manage_menu} onChange={e => updateField('auto_manage_menu', e.target.checked)} className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                    const labels: any = { monday: 'Segunda', tuesday: 'Terça', wednesday: 'Quarta', thursday: 'Quinta', friday: 'Sexta', saturday: 'Sábado', sunday: 'Domingo' };
                    const dayActive = formData?.opening_hours?.[day]?.active;
                    
                    return (
                      <div key={day} className={`p-4 rounded-2xl border-2 transition-all ${dayActive ? "bg-card border-primary/20 shadow-sm" : "bg-muted/30 border-dashed border-muted grayscale opacity-70"}`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-sm flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /> {labels[day]}</span>
                          <input 
                            type="checkbox" 
                            checked={!!dayActive} 
                            onChange={e => {
                              const hours = { ...(formData?.opening_hours || {}) };
                              hours[day] = { ...hours[day], active: e.target.checked };
                              updateField('opening_hours', hours);
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input 
                            type="time" 
                            value={formData?.opening_hours?.[day]?.open || "18:00"} 
                            disabled={!dayActive} 
                            onChange={e => {
                              const hours = { ...(formData?.opening_hours || {}) };
                              hours[day] = { ...hours[day], open: e.target.value };
                              updateField('opening_hours', hours);
                            }} 
                          />
                          <Input 
                            type="time" 
                            value={formData?.opening_hours?.[day]?.close || "23:00"} 
                            disabled={!dayActive} 
                            onChange={e => {
                              const hours = { ...(formData?.opening_hours || {}) };
                              hours[day] = { ...hours[day], close: e.target.value };
                              updateField('opening_hours', hours);
                            }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Configurações de Taxa de Entrega */}
              <div className="border-t pt-8 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary/70 flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Taxa de Entrega do Motoqueiro
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-primary flex items-center gap-2">Taxa Fixa por Entrega (R$)</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0,00"
                      value={formData?.fixed_delivery_fee === null ? "" : formData?.fixed_delivery_fee} 
                      onChange={e => updateField('fixed_delivery_fee', e.target.value === "" ? null : e.target.value)} 
                      className="h-12" 
                    />
                    <p className="text-[10px] text-muted-foreground font-medium italic">Valor que o motoqueiro recebe por cada viagem concluída.</p>
                  </div>
                </div>
              </div>

              {/* Configurações de Produção */}
              <div className="border-t pt-8 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary/70 flex items-center gap-2">
                  <Utensils className="h-4 w-4" /> Configurações de Produção
                </h3>
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border-2 border-primary/5 hover:border-primary/20 transition-all">
                  <div className="space-y-0.5">
                    <Label className="text-base font-bold text-primary">Sistema KDS (Produção na Cozinha)</Label>
                    <p className="text-xs text-muted-foreground font-medium">Ativa o painel de produção para visualização de pedidos na cozinha.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={formData?.kds_enabled !== false} 
                    onChange={e => updateField('kds_enabled', e.target.checked)} 
                    className="h-6 w-6 rounded-md border-primary text-primary focus:ring-primary cursor-pointer"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-14 font-black shadow-lg hover:shadow-xl transition-all uppercase tracking-widest text-lg" disabled={savingCompany}>
                {savingCompany ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : <Save className="h-6 w-6 mr-3" />}
                Salvar Alterações
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
      </TabsContent>
      <TabsContent value="fiscal">
        <FiscalTab settings={formData} onUpdate={() => onSaveSuccess(formData)} />
      </TabsContent>
    </Tabs>
  );
});

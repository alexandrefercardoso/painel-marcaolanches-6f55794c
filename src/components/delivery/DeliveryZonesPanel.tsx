import { Target, Plus, Minimize2, Maximize2, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { geocodeAddress } from "@/lib/geocoding";

export interface DeliveryZonesPanelCtx {
  isDeliveryAreaDialogOpen: boolean;
  setIsDeliveryAreaDialogOpen: (v: boolean) => void;
  editingDeliveryArea: any;
  setEditingDeliveryArea: (v: any) => void;
  newDeliveryArea: any;
  setNewDeliveryArea: (v: any) => void;
  areaForm: { name: string; fee: string; radius_km: number };
  setAreaForm: (v: any) => void;
  mapSearch: string;
  setMapSearch: (v: string) => void;
  isMapMaximized: boolean;
  setIsMapMaximized: (v: boolean) => void;
  deliveryAreas: any[];
  storeSettings: any;
  setLoading: (v: boolean) => void;
  fetchData: () => void;
  AdminDeliveryMapComponent: any;
}

export function DeliveryZonesPanel({ ctx }: { ctx: DeliveryZonesPanelCtx }) {
  const {
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
  } = ctx;

  return (
    <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Target className="h-7 w-7 text-orange-600" /> Áreas de Ação (Entregas)
              </h2>
              <Dialog open={isDeliveryAreaDialogOpen} onOpenChange={setIsDeliveryAreaDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-full gap-2 bg-orange-600 hover:bg-orange-700" onClick={() => {
                    setEditingDeliveryArea(null);
                    const defaultCoords = { 
                      center_lat: Number(storeSettings?.latitude) || -23.5505, 
                      center_lng: Number(storeSettings?.longitude) || -46.6333 
                    };
                    setNewDeliveryArea({ ...defaultCoords, radius_km: 1 });
                    setAreaForm({ name: "", fee: "0", radius_km: 1 });
                  }}>
                    <Plus className="h-5 w-5" /> Nova Área
                  </Button>
                </DialogTrigger>
                <DialogContent className={`${isMapMaximized ? "max-w-[100vw] w-screen h-screen m-0 rounded-none" : "sm:max-w-[1000px] w-[95vw] max-h-[95vh]"} transition-all duration-300 overflow-y-auto`}>
                  <DialogHeader className="flex flex-row items-center justify-between pr-8">
                    <div className="space-y-1">
                      <DialogTitle>{editingDeliveryArea ? 'Editar Área' : 'Nova Área de Ação'}</DialogTitle>
                      <DialogDescription>Desenhe o raio de entrega no mapa e defina a taxa.</DialogDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 ml-auto mr-4" 
                      onClick={() => setIsMapMaximized(!isMapMaximized)}
                      title={isMapMaximized ? "Reduzir tela" : "Maximizar tela"}
                    >
                      {isMapMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome da Área (Ex: Centro, Bairro X)</Label>
                        <Input value={areaForm.name} onChange={e => setAreaForm({...areaForm, name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Taxa de Entrega (R$)</Label>
                        <Input type="number" value={areaForm.fee} onChange={e => setAreaForm({...areaForm, fee: e.target.value})} />
                      </div>
                    </div>
                    
                    {/* Campo de Raio removido conforme solicitado */}

                    <div className="space-y-2">
                      <Label>Centralizar em:</Label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Buscar endereço para centralizar a área..." 
                          value={mapSearch} 
                          onChange={e => setMapSearch(e.target.value)} 
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              (e.target as HTMLInputElement).nextElementSibling?.querySelector('button')?.click();
                            }
                          }}
                        />
                        <Button variant="outline" id="btn-search-map" onClick={async () => {
                          if (!mapSearch) return;
                          try {
                             const result = await geocodeAddress(mapSearch, {
                               city: storeSettings?.city,
                               state: storeSettings?.state
                             });
                            if (result) {
                              setNewDeliveryArea((prev: any) => ({...prev, center_lat: result.lat, center_lng: result.lng}));
                              toast.success(`Localização de "${mapSearch}" encontrada!`);
                            } else {
                              toast.error("Endereço não encontrado.");
                            }
                          } catch (e) {
                            toast.error("Erro ao buscar endereço.");
                          }
                        }}>Buscar</Button>
                      </div>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-orange-800 font-bold text-sm uppercase tracking-wider">
                        <MapPin className="h-4 w-4" /> Visualização Interativa
                      </div>
                      <div className={`w-full ${isMapMaximized ? "h-[calc(100vh-320px)]" : "h-[550px]"} transition-all duration-300 bg-card rounded-lg border-2 border-orange-200 overflow-hidden relative shadow-inner`}>
                        {AdminDeliveryMapComponent ? (
                          <AdminDeliveryMapComponent 
                            center={{ 
                              lat: newDeliveryArea.center_lat || storeSettings?.latitude || -23.5505, 
                              lng: newDeliveryArea.center_lng || storeSettings?.longitude || -46.6333 
                            }} 
                            radius={newDeliveryArea.radius_km || 1}
                            polygonCoords={newDeliveryArea.polygon_coords}
                            onLocationChange={(lat: number, lng: number) => {
                              setNewDeliveryArea((prev: any) => ({ ...prev, center_lat: lat, center_lng: lng }));
                            }}
                            onPolygonChange={(coords: [number, number][]) => {
                              setNewDeliveryArea((prev: any) => ({ ...prev, polygon_coords: coords }));
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-orange-400 text-sm">Carregando mapa...</div>
                        )}
                        <div className="absolute top-2 right-2 bg-card/95 p-3 rounded-xl shadow-lg text-[10px] font-bold text-orange-600 z-50 border border-orange-100 backdrop-blur-sm animate-bounce">
                          📍 Clique no mapa para definir o centro da entrega
                        </div>
                        <div className="absolute bottom-2 left-2 bg-orange-600 text-white px-3 py-1.5 rounded-full shadow-lg text-[10px] font-black z-50 uppercase tracking-tight">
                          Área: {areaForm.name || 'Nova Área'} (Geográfica)
                        </div>
                      </div>
                      <p className="text-[10px] text-orange-700/70 italic text-center">
                        Dica: Você pode criar vários círculos com preços diferentes para cobrir toda a cidade.
                      </p>
                    </div>

                    <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={async () => {
                      if (!areaForm.name) return toast.error("Nome obrigatório");
                      try {
                        setLoading(true);
                        const payload = {
                          name: areaForm.name,
                          fee: parseFloat(areaForm.fee),
                          radius_km: parseFloat(areaForm.radius_km.toString()),
                          center_lat: newDeliveryArea.center_lat,
                          center_lng: newDeliveryArea.center_lng,
                          polygon_coords: newDeliveryArea.polygon_coords,
                          is_active: true
                        };
                        const { error } = editingDeliveryArea 
                          ? await supabase.from("delivery_areas").update(payload).eq("id", editingDeliveryArea.id)
                          : await supabase.from("delivery_areas").insert([payload]);
                        
                        if (error) throw error;
                        toast.success(editingDeliveryArea ? "Área atualizada!" : "Área criada!");
                        setIsDeliveryAreaDialogOpen(false);
                        fetchData();
                      } catch (err: any) {
                        toast.error("Erro: " + err.message);
                      } finally {
                        setLoading(false);
                      }
                    }}>Salvar Área de Ação</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deliveryAreas.map(area => (
                <Card key={area.id} className="border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-all overflow-hidden group">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{area.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Navigation className="h-3 w-3 text-orange-600" /> Área Geográfica (Mapa)
                        </CardDescription>
                      </div>
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200">R$ {Number(area.fee).toFixed(2)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Centro: {area.center_lat?.toFixed(4)}, {area.center_lng?.toFixed(4)}</p>
                      <p className="italic text-[10px]">Aplica taxa fixa para endereços dentro do desenho no mapa.</p>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/30 pt-4 flex justify-end gap-2">
                    <Button variant="ghost" size="sm" className="h-8 text-orange-600" onClick={() => {
                      setEditingDeliveryArea(area);
                      setNewDeliveryArea({
                        center_lat: area.center_lat,
                        center_lng: area.center_lng,
                        radius_km: area.radius_km,
                        polygon_coords: area.polygon_coords
                      });
                      setAreaForm({
                        name: area.name,
                        fee: area.fee.toString(),
                        radius_km: area.radius_km
                      });
                      setIsDeliveryAreaDialogOpen(true);
                    }}>Editar</Button>
                    <Button variant="ghost" size="sm" className="h-8 text-destructive" onClick={async () => {
                      if (true) {
                        await supabase.from("delivery_areas").delete().eq("id", area.id);
                        fetchData();
                      }
                    }}>Excluir</Button>
                  </CardFooter>
                </Card>
              ))}
              {deliveryAreas.length === 0 && (
                <div className="col-span-full py-20 text-center bg-muted/20 rounded-xl border-2 border-dashed border-orange-200/50">
                  <Target className="h-12 w-12 text-orange-200 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-orange-900/50">Nenhuma Área de Ação</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto">Cadastre círculos no mapa para automatizar suas taxas de entrega por bairro ou raio.</p>
                </div>
              )}
            </div>
    </>
  );
}

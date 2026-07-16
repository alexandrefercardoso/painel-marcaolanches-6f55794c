import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Megaphone, Upload, Eye, MousePointerClick, Calendar, Sparkles, Trash2, Save, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import { WeeklyCampaignBanner } from "@/components/WeeklyCampaignBanner";
import type { WeeklyCampaign } from "@/hooks/useWeeklyCampaign";
import { getSafeCampaignLink, isSafeCampaignLink } from "@/lib/campaign-links";

const DAYS = [
  { idx: 0, name: "Domingo", short: "DOM", color: "from-red-500 to-rose-500" },
  { idx: 1, name: "Segunda", short: "SEG", color: "from-blue-500 to-cyan-500" },
  { idx: 2, name: "Terça", short: "TER", color: "from-purple-500 to-pink-500" },
  { idx: 3, name: "Quarta", short: "QUA", color: "from-green-500 to-emerald-500" },
  { idx: 4, name: "Quinta", short: "QUI", color: "from-amber-500 to-orange-500" },
  { idx: 5, name: "Sexta", short: "SEX", color: "from-fuchsia-500 to-purple-600" },
  { idx: 6, name: "Sábado", short: "SÁB", color: "from-indigo-500 to-violet-600" },
];

type Draft = Partial<WeeklyCampaign> & { day_of_week: number };

export function WeeklyCampaignsManager() {
  const [campaigns, setCampaigns] = useState<WeeklyCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDay, setEditDay] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const today = new Date().getDay();

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("weekly_campaigns").select("*").order("priority", { ascending: false });
    if (error) {
      toast.error("Erro ao carregar campanhas");
    } else {
      setCampaigns((data || []) as WeeklyCampaign[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function getForDay(idx: number) {
    return campaigns.find((c) => c.day_of_week === idx) || null;
  }

  function openEdit(idx: number) {
    const existing = getForDay(idx);
    setEditDay(idx);
    setDraft(
      existing
        ? { ...existing }
        : {
            day_of_week: idx,
            media_type: "image",
            is_active: true,
            priority: 0,
            show_mode: "always",
            muted: true,
            autoplay: true,
            background_color: "#0f172a",
          },
    );
  }

  function closeEdit() {
    setEditDay(null);
    setDraft(null);
  }

  async function handleUpload(file: File) {
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
      const isVideo = file.type.startsWith("video/");
      const isGif = ext === "gif";
      const mediaType: "image" | "video" | "gif" = isVideo ? "video" : isGif ? "gif" : "image";
      
      // Verificação de sessão conforme o sistema de login customizado (admin_session)
      const sessionStr = localStorage.getItem('admin_session');
      const adminSession = sessionStr ? JSON.parse(sessionStr) : null;
      
      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();

      console.log("SESSION (Auth)", session);
      console.log("USER (Auth)", user);
      console.log("ADMIN_SESSION (Custom)", adminSession);

      if (!adminSession) {
        throw new Error("Usuário não autenticado. Por favor, faça login novamente.");
      }

      // Ajustado para organização em uma única pasta
      const fileName = `day-${draft?.day_of_week}-${Date.now()}.${ext}`;
      const path = `all/${fileName}`;
      
      console.log("[CampaignUpload] Iniciando upload:", { 
        bucket: "campaigns", 
        path, 
        admin_user_id: adminSession.id,
        file_type: file.type, 
        file_size: file.size 
      });
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("campaigns")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type,
        });
      
      if (uploadError) {
        console.error("[CampaignUpload] Erro no upload:", uploadError);
        throw uploadError;
      }
      
      console.log("[CampaignUpload] Sucesso:", uploadData);
      
      const publicUrl = `https://tmheapviezuqezfpqctp.supabase.co/storage/v1/object/public/campaigns/${path}`;
      console.log("[CampaignUpload] URL Pública:", publicUrl);
      
      setDraft((d) => (d ? { ...d, media_url: publicUrl, media_type: mediaType } : d));
      toast.success("Mídia enviada com sucesso!");
    } catch (e: any) {
      console.error("[CampaignUpload] Catch:", e);
      toast.error("Falha no upload: " + (e.message || "Erro de permissão ou rede"));
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!draft) return;
    if (!draft.media_url) {
      toast.error("Envie uma mídia primeiro");
      return;
    }
    if (!isSafeCampaignLink(draft.button_link)) {
      toast.error("Link inválido. Use apenas https://, http:// ou # para âncoras internas.");
      return;
    }

    setSaving(true);
    const safeButtonLink = getSafeCampaignLink(draft.button_link);
    const payload = {
      day_of_week: draft.day_of_week,
      media_type: draft.media_type || "image",
      media_url: draft.media_url,
      title: draft.title || null,
      subtitle: draft.subtitle || null,
      button_text: draft.button_text || null,
      button_link: safeButtonLink,
      background_color: draft.background_color || null,
      is_active: draft.is_active ?? true,
      expires_at: draft.expires_at || null,
      priority: draft.priority ?? 0,
      show_mode: draft.show_mode || "always",
      auto_close_seconds: draft.auto_close_seconds || null,
      muted: draft.muted ?? true,
      autoplay: draft.autoplay ?? true,
    };

    console.log("[CampaignSave] Enviando payload:", payload);

    try {
      const { error } = draft.id
        ? await supabase.from("weekly_campaigns").update(payload as any).eq("id", draft.id)
        : await supabase.from("weekly_campaigns").insert(payload as any);

      if (error) {
        console.error("[CampaignSave] Erro ao salvar:", error);
        toast.error("Erro ao salvar: " + error.message);
      } else {
        toast.success("Campanha salva com sucesso!");
        closeEdit();
        load();
      }
    } catch (e: any) {
      console.error("[CampaignSave] Catch:", e);
      toast.error("Erro inesperado ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!draft?.id) return;
    if (!confirm("Excluir esta campanha?")) return;
    const { error } = await supabase.from("weekly_campaigns").delete().eq("id", draft.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Campanha excluída");
      closeEdit();
      load();
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-700 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight flex items-center gap-3">
              <Megaphone className="h-8 w-8" /> Campanhas Semanais
            </h1>
            <p className="text-white/80 mt-1 max-w-xl">
              Configure um banner promocional para cada dia da semana. O sistema mostra automaticamente a campanha do dia atual no cardápio.
            </p>
          </div>
          <Badge className="bg-white text-pink-700 font-bold text-sm px-4 py-2 rounded-full">
            <Sparkles className="h-4 w-4 mr-1" /> HOJE: {DAYS[today].name}
          </Badge>
        </div>
      </div>

      {/* Preview do banner ativo do dia */}
      <Card className="overflow-hidden border-2 border-dashed bg-muted/30">
        <CardContent className="p-4">
          <div className="text-xs font-bold uppercase text-muted-foreground mb-4 tracking-wider flex justify-between items-center">
            <span>Pré-visualização (como o cliente vê hoje)</span>
            {!campaigns.find(c => c.day_of_week === today && c.is_active) && (
              <Badge variant="outline" className="text-[10px] font-normal italic">
                Nenhuma campanha ativa para hoje
              </Badge>
            )}
          </div>
          <div className="min-h-[100px] flex items-center justify-center relative">
            <WeeklyCampaignBanner variant="hero" />
            {!campaigns.find(c => c.day_of_week === today && c.is_active) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Megaphone className="h-8 w-8 opacity-20" />
                <p className="text-sm italic opacity-50">Espaço ficará oculto para o cliente</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grid de 7 dias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DAYS.map((day) => {
          const c = getForDay(day.idx);
          const isToday = day.idx === today;
          return (
            <Card
              key={day.idx}
              onClick={() => openEdit(day.idx)}
              className={`relative cursor-pointer overflow-hidden border-2 transition-all hover:scale-[1.02] hover:shadow-xl ${
                isToday ? "border-pink-500 ring-2 ring-pink-300" : "border-transparent"
              }`}
            >
              {isToday && (
                <Badge className="absolute top-2 left-2 z-20 bg-pink-600 text-white animate-pulse">
                  HOJE
                </Badge>
              )}
              <div
                className={`relative aspect-video bg-gradient-to-br ${day.color} flex items-center justify-center`}
              >
                {c?.media_url ? (
                  c.media_type === "video" ? (
                    <video
                      src={c.media_url}
                      muted
                      loop
                      playsInline
                      autoPlay
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <img loading="lazy"
                      src={c.media_url}
                      alt={day.name}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )
                ) : (
                  <Megaphone className="h-12 w-12 text-white/70" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <div className="text-xs font-bold opacity-80">{day.short}</div>
                  <div className="font-black text-lg leading-tight">{day.name}</div>
                </div>
                {c && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Badge
                      variant="secondary"
                      className={c.is_active ? "bg-green-500 text-white" : "bg-gray-500 text-white"}
                    >
                      {c.is_active ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-3 space-y-1.5">
                <div className="font-semibold text-sm line-clamp-1">
                  {c?.title || <span className="text-muted-foreground italic">Sem título</span>}
                </div>
                {c?.subtitle && (
                  <div className="text-xs text-muted-foreground line-clamp-1">{c.subtitle}</div>
                )}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Eye className="h-3 w-3" /> {c?.views_count ?? 0}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MousePointerClick className="h-3 w-3" /> {c?.clicks_count ?? 0}
                  </span>
                  <span className="text-pink-600 font-bold">
                    {c ? "Editar" : "+ Criar"}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog de edição */}
      <Dialog open={editDay !== null} onOpenChange={(o) => !o && closeEdit()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Calendar className="h-5 w-5 text-pink-600" />
              {editDay !== null && `Campanha de ${DAYS[editDay].name}`}
            </DialogTitle>
          </DialogHeader>

          {draft && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Coluna esquerda: campos */}
              <div className="space-y-4">
                <div>
                  <Label>Mídia (imagem, GIF ou vídeo MP4)</Label>
                  <label className="mt-1 flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer hover:border-pink-500 transition">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {uploading ? "Enviando..." : "Clique ou arraste para enviar"}
                    </span>
                    <span className="text-xs text-muted-foreground">JPG, PNG, WEBP, GIF, MP4</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,video/mp4,image/gif"
                      onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                    />
                  </label>
                  {draft.media_url && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-green-600 font-medium">
                      {draft.media_type === "video" ? (
                        <VideoIcon className="h-3.5 w-3.5" />
                      ) : (
                        <ImageIcon className="h-3.5 w-3.5" />
                      )}
                      Mídia carregada ({draft.media_type})
                    </div>
                  )}
                </div>

                <div>
                  <Label>Título</Label>
                  <Input
                    value={draft.title || ""}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    placeholder="Ex: Pizza em dobro hoje!"
                  />
                </div>
                <div>
                  <Label>Subtítulo</Label>
                  <Textarea
                    rows={2}
                    value={draft.subtitle || ""}
                    onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
                    placeholder="Apenas nas segundas. Aproveite!"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Texto do botão</Label>
                    <Input
                      value={draft.button_text || ""}
                      onChange={(e) => setDraft({ ...draft, button_text: e.target.value })}
                      placeholder="Peça agora"
                    />
                  </div>
                  <div>
                    <Label>Link do botão</Label>
                    <Input
                      value={draft.button_link || ""}
                      onChange={(e) => setDraft({ ...draft, button_link: e.target.value })}
                      placeholder="#produtos ou https://..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Cor de fundo</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={draft.background_color || "#0f172a"}
                        onChange={(e) => setDraft({ ...draft, background_color: e.target.value })}
                        className="h-9 w-12 rounded border cursor-pointer"
                      />
                      <Input
                        value={draft.background_color || ""}
                        onChange={(e) => setDraft({ ...draft, background_color: e.target.value })}
                        placeholder="#0f172a"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Prioridade</Label>
                    <Input
                      type="number"
                      value={draft.priority ?? 0}
                      onChange={(e) =>
                        setDraft({ ...draft, priority: Number(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Expira em (opcional)</Label>
                  <Input
                    type="datetime-local"
                    value={draft.expires_at ? draft.expires_at.slice(0, 16) : ""}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        expires_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Modo de exibição</Label>
                    <Select
                      value={draft.show_mode || "always"}
                      onValueChange={(v: any) => setDraft({ ...draft, show_mode: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="always">Sempre exibir</SelectItem>
                        <SelectItem value="once_per_day">Uma vez por dia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Fechar automaticamente (s)</Label>
                    <Input
                      type="number"
                      placeholder="0 = nunca"
                      value={draft.auto_close_seconds ?? ""}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          auto_close_seconds: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="font-medium text-sm">Campanha ativa</div>
                    <div className="text-xs text-muted-foreground">
                      Desligue para ocultar do site
                    </div>
                  </div>
                  <Switch
                    checked={draft.is_active ?? true}
                    onCheckedChange={(v) => setDraft({ ...draft, is_active: v })}
                  />
                </div>

                {draft.media_type === "video" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <span className="text-sm font-medium">Autoplay</span>
                      <Switch
                        checked={draft.autoplay ?? true}
                        onCheckedChange={(v) => setDraft({ ...draft, autoplay: v })}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <span className="text-sm font-medium">Iniciar mudo</span>
                      <Switch
                        checked={draft.muted ?? true}
                        onCheckedChange={(v) => setDraft({ ...draft, muted: v })}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Coluna direita: preview */}
              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Pré-visualização ao vivo
                </Label>
                <div
                  className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg"
                  style={{ backgroundColor: draft.background_color || "#0f172a" }}
                >
                  {draft.media_url ? (
                    draft.media_type === "video" ? (
                      <video
                        src={draft.media_url}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <img loading="lazy"
                        src={draft.media_url}
                        alt="preview"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/70">
                      <Megaphone className="h-12 w-12" />
                    </div>
                  )}
                  {(draft.title || draft.subtitle || draft.button_text) && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                      <div className="relative z-10 flex h-full flex-col justify-center p-4 max-w-xs">
                        {draft.title && (
                          <h3 className="text-white font-black text-xl leading-tight drop-shadow-lg">
                            {draft.title}
                          </h3>
                        )}
                        {draft.subtitle && (
                          <p className="mt-1 text-white/90 text-sm drop-shadow">{draft.subtitle}</p>
                        )}
                        {draft.button_text && (
                          <button className="mt-3 w-fit rounded-full bg-pink-600 hover:bg-pink-700 text-white font-bold px-4 py-2 text-sm">
                            {draft.button_text}
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
                {draft.id && (
                  <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Visualizações:</span>
                      <span className="font-bold">{draft.views_count ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cliques:</span>
                      <span className="font-bold">{draft.clicks_count ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Conversão:</span>
                      <span className="font-bold">
                        {draft.views_count
                          ? Math.round(((draft.clicks_count || 0) / draft.views_count) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            {draft?.id && (
              <Button variant="destructive" onClick={handleDelete} className="mr-auto">
                <Trash2 className="h-4 w-4 mr-1" /> Excluir
              </Button>
            )}
            <Button variant="outline" onClick={closeEdit}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || uploading}
              className="bg-pink-600 hover:bg-pink-700"
            >
              <Save className="h-4 w-4 mr-1" />
              {saving ? "Salvando..." : "Salvar campanha"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Conversation = {
  id: string;
  customer_phone: string;
  customer_name: string | null;
  last_message: string | null;
  status: string;
  updated_at: string;
};

type Message = {
  id: string;
  conversation_id: string;
  direction: "inbound" | "outbound";
  content: string;
  created_at: string;
};

export function WhatsAppSidePanel() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [openConv, setOpenConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [botEnabled, setBotEnabled] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadEnabled = async () => {
      const { data } = await supabase
        .from("store_settings")
        .select("whatsapp_bot_enabled")
        .limit(1)
        .maybeSingle();
      setBotEnabled(!!(data as any)?.whatsapp_bot_enabled);
    };
    loadEnabled();
    const ch = supabase
      .channel("whatsapp-bot-enabled-flag")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "store_settings" },
        () => loadEnabled()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const load = async () => {
    const { data } = await supabase
      .from("whatsapp_conversations" as any)
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(100);
    setConversations((data as any) || []);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("whatsapp-conversations-panel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "whatsapp_conversations" },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  useEffect(() => {
    if (!openConv) return;
    let cancelled = false;
    (async () => {
      setLoadingMsgs(true);
      const { data } = await supabase
        .from("whatsapp_messages" as any)
        .select("*")
        .eq("conversation_id", openConv.id)
        .order("created_at", { ascending: true });
      if (!cancelled) {
        setMessages((data as any) || []);
        setLoadingMsgs(false);
        setTimeout(() => scrollRef.current?.scrollTo({ top: 99999 }), 50);
      }
    })();
    const ch = supabase
      .channel(`whatsapp-msgs-${openConv.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "whatsapp_messages",
          filter: `conversation_id=eq.${openConv.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as any]);
          setTimeout(() => scrollRef.current?.scrollTo({ top: 99999 }), 50);
        }
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
    };
  }, [openConv]);

  const waitingCount = useMemo(
    () => conversations.filter((c) => c.status === "aguardando_humano").length,
    [conversations]
  );

  const send = async () => {
    if (!openConv || !input.trim()) return;
    setSending(true);
    const content = input.trim();
    setInput("");
    const { error } = await supabase.from("whatsapp_messages" as any).insert({
      conversation_id: openConv.id,
      direction: "outbound",
      content,
      sender: "atendente",
    });
    if (error) {
      toast.error("Erro ao enviar: " + error.message);
      setInput(content);
    } else {
      await supabase
        .from("whatsapp_conversations" as any)
        .update({ last_message: content, status: "em_andamento", updated_at: new Date().toISOString() })
        .eq("id", openConv.id);
    }
    setSending(false);
  };

  if (!botEnabled) return null;

  return (
    <>
      <aside className="hidden lg:flex flex-col w-[250px] shrink-0 border-l border-orange-100 bg-card">
        <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-green-600 to-emerald-500 text-white">
          <div className="flex items-center gap-2 font-bold">
            <MessageCircle className="h-4 w-4" />
            <span>WhatsApp</span>
          </div>
          {waitingCount > 0 && (
            <Badge className="bg-red-600 hover:bg-red-600 text-white">{waitingCount}</Badge>
          )}
        </div>
        <ScrollArea className="flex-1">
          {conversations.length === 0 ? (
            <div className="p-4 text-xs text-muted-foreground text-center">
              Nenhuma conversa ainda.
            </div>
          ) : (
            <ul className="divide-y">
              {conversations.map((c) => {
                const isWaiting = c.status === "aguardando_humano";
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => setOpenConv(c)}
                      className="w-full text-left p-3 hover:bg-muted/40 transition-colors"
                    >
                      <div className={cn(
                        "text-sm font-semibold truncate",
                        isWaiting ? "text-red-600" : "text-foreground"
                      )}>
                        {c.customer_name || c.customer_phone}
                      </div>
                      <div className={cn(
                        "text-xs truncate mt-0.5",
                        isWaiting ? "text-red-500" : "text-muted-foreground"
                      )}>
                        {c.last_message || "—"}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </aside>

      <Dialog open={!!openConv} onOpenChange={(o) => !o && setOpenConv(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-green-600" />
              {openConv?.customer_name || openConv?.customer_phone}
            </DialogTitle>
          </DialogHeader>
          <div ref={scrollRef} className="h-[380px] overflow-y-auto rounded-md border bg-muted/20 p-3 space-y-2">
            {loadingMsgs ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Carregando...
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-8">Sem mensagens.</div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                    m.direction === "outbound"
                      ? "ml-auto bg-green-600 text-white"
                      : "bg-white border"
                  )}
                >
                  {m.content}
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite uma mensagem..."
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
            />
            <Button onClick={send} disabled={sending || !input.trim()} className="bg-green-600 hover:bg-green-700">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

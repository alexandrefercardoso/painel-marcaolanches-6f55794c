import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, Clock, CreditCard, MapPin, Phone, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PaymentMethod {
  id: string;
  name: string;
  icon: string | null;
  is_active: boolean | null;
}

const DAYS = [
  { key: "monday", label: "Segunda-feira" },
  { key: "tuesday", label: "Terça-feira" },
  { key: "wednesday", label: "Quarta-feira" },
  { key: "thursday", label: "Quinta-feira" },
  { key: "friday", label: "Sexta-feira" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
];

const TODAY_KEY = DAYS[(new Date().getDay() + 6) % 7].key;

export function StoreInfoDialog({ storeSettings }: { storeSettings: any }) {
  const [open, setOpen] = useState(false);
  const [payments, setPayments] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    if (!open || payments.length) return;
    supabase
      .from("payment_methods")
      .select("id, name, icon, is_active")
      .eq("is_active", true)
      .then(({ data }) => setPayments((data as any) || []));
  }, [open]);

  const hours = (storeSettings?.opening_hours || {}) as Record<
    string,
    { open: string; close: string; active: boolean }
  >;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-3 rounded-full border-primary/30 text-primary hover:bg-primary/10 text-[11px] font-semibold gap-1.5"
        >
          <Info className="h-3.5 w-3.5" />
          Mais informações
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-primary via-primary to-primary/70 p-5 text-primary-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-primary-foreground">
              {storeSettings?.name || "Nossa Loja"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs opacity-90 mt-1">Tudo o que você precisa saber 👇</p>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-5 space-y-5">
          {/* Endereço */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold mb-2 text-foreground">
              <MapPin className="h-4 w-4 text-primary" /> Endereço
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed pl-6">
              {storeSettings?.address || "—"}
              {storeSettings?.address_number ? `, ${storeSettings.address_number}` : ""}
              {storeSettings?.neighborhood ? ` — ${storeSettings.neighborhood}` : ""}
              <br />
              {storeSettings?.city || ""}
              {storeSettings?.state ? ` / ${storeSettings.state}` : ""}
              {storeSettings?.zip_code ? ` — CEP ${storeSettings.zip_code}` : ""}
            </p>
            {storeSettings?.whatsapp_number && (
              <p className="text-sm text-muted-foreground pl-6 mt-1 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-primary" />
                {storeSettings.whatsapp_number}
              </p>
            )}
          </section>

          {/* Horários */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold mb-2 text-foreground">
              <Clock className="h-4 w-4 text-primary" /> Horário de Funcionamento
            </h3>
            <div className="rounded-xl border border-border overflow-hidden">
              {DAYS.map((d) => {
                const h = hours[d.key];
                const isToday = d.key === TODAY_KEY;
                const isOpen = h?.active;
                return (
                  <div
                    key={d.key}
                    className={`flex items-center justify-between px-3 py-2 text-xs border-b border-border last:border-0 ${
                      isToday ? "bg-primary/10 font-bold" : ""
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {d.label}
                      {isToday && (
                        <Badge className="bg-primary text-primary-foreground text-[9px] px-1.5 py-0">
                          HOJE
                        </Badge>
                      )}
                    </span>
                    <span className={isOpen ? "text-foreground" : "text-muted-foreground italic"}>
                      {isOpen ? `${h.open} — ${h.close}` : "Fechado"}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Pagamentos */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold mb-2 text-foreground">
              <CreditCard className="h-4 w-4 text-primary" /> Formas de Pagamento
            </h3>
            {payments.length === 0 ? (
              <p className="text-xs text-muted-foreground pl-6">Carregando...</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    <span className="truncate">{p.name}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Atendimento */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold mb-3 text-foreground">
              <Phone className="h-4 w-4 text-primary" /> Atendimento & Suporte
            </h3>
            <div className="space-y-4 pl-6">
              <div className="flex flex-wrap gap-2">
                {storeSettings?.delivery_enabled ? (
                  <Badge variant="outline" className="gap-1.5 border-green-200 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/50 py-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Delivery Ativo
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1.5 opacity-60 py-1">
                    <XCircle className="h-3.5 w-3.5 text-muted-foreground" /> Sem delivery
                  </Badge>
                )}
                {storeSettings?.pickup_enabled && (
                  <Badge variant="outline" className="gap-1.5 border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50 py-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" /> Retirada no Balcão
                  </Badge>
                )}
              </div>
              
              {storeSettings?.whatsapp_number && (
                <Button 
                  asChild
                  className="w-full bg-[#25D366] hover:bg-[#20ba56] text-white font-bold rounded-xl gap-2 shadow-lg shadow-green-500/20 h-11"
                >
                  <a 
                    href={`https://wa.me/55${storeSettings.whatsapp_number.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Phone className="h-4 w-4" />
                    Falar com Atendimento
                  </a>
                </Button>
              )}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

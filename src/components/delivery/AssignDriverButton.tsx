import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Bike, Loader2, UserPlus, RefreshCcw } from "lucide-react";

interface Motoqueiro {
  id: string;
  full_name: string | null;
  email: string | null;
  pedidos_ativos: number | null;
}

interface Props {
  orderId: string;
  driverId?: string | null;
  driverNameFallback?: string | null;
  adminUser: any;
  onAssigned?: () => void;
}

export function AssignDriverButton({
  orderId,
  driverId,
  driverNameFallback,
  adminUser,
  onAssigned,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [motoqueiros, setMotoqueiros] = useState<Motoqueiro[]>([]);

  const canAssign =
    adminUser?.role === "master" ||
    adminUser?.role === "administrador" ||
    adminUser?.role === "funcionario";

  const openModal = async () => {
    setOpen(true);
    setLoading(true);
    try {
      const { data, error } = await (supabase as any).rpc("listar_motoqueiros_loja");
      if (error) throw error;
      setMotoqueiros((data as any) || []);
    } catch (e: any) {
      toast.error(e?.message || "Erro ao listar entregadores");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (entregadorId: string) => {
    if (!adminUser?.id) {
      toast.error("Sessão inválida. Faça login novamente.");
      return;
    }
    setAssigning(entregadorId);
    try {
      const { error } = await supabase.rpc("atribuir_entregador", {
        p_pedido_id: orderId,
        p_entregador_id: entregadorId,
        p_admin_profile_id: adminUser.id,
      });
      if (error) throw error;
      toast.success("Entregador atribuído!");
      setOpen(false);
      onAssigned?.();
    } catch (e: any) {
      toast.error(e?.message || "Erro ao atribuir entregador");
    } finally {
      setAssigning(null);
    }
  };

  if (driverId) {
    return (
      <div className="flex items-center gap-2">
        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
          <Bike className="h-3 w-3" />
          {driverNameFallback || "Entregador atribuído"}
        </Badge>
        {canAssign && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-[10px] text-muted-foreground hover:text-foreground gap-1"
            onClick={openModal}
          >
            <RefreshCcw className="h-3 w-3" />
            Trocar
          </Button>
        )}
        <DriverModal
          open={open}
          setOpen={setOpen}
          loading={loading}
          motoqueiros={motoqueiros}
          assigning={assigning}
          onPick={handleAssign}
          currentId={driverId}
        />
      </div>
    );
  }

  if (!canAssign) return null;

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
        onClick={openModal}
      >
        <UserPlus className="h-4 w-4" />
        Atribuir entregador
      </Button>
      <DriverModal
        open={open}
        setOpen={setOpen}
        loading={loading}
        motoqueiros={motoqueiros}
        assigning={assigning}
        onPick={handleAssign}
      />
    </>
  );
}

function DriverModal({
  open,
  setOpen,
  loading,
  motoqueiros,
  assigning,
  onPick,
  currentId,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  loading: boolean;
  motoqueiros: Motoqueiro[];
  assigning: string | null;
  onPick: (id: string) => void;
  currentId?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bike className="h-5 w-5 text-emerald-600" />
            Escolher entregador
          </DialogTitle>
          <DialogDescription>
            Selecione um motoqueiro habilitado para este pedido.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Carregando...
          </div>
        ) : motoqueiros.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Nenhum entregador habilitado encontrado.
          </div>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {motoqueiros.map((m) => {
              const isCurrent = m.id === currentId;
              const isBusy = assigning !== null;
              return (
                <button
                  key={m.id}
                  disabled={isBusy}
                  onClick={() => onPick(m.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left ${
                    isCurrent
                      ? "border-emerald-400 bg-emerald-50"
                      : "border-border hover:border-emerald-300 hover:bg-emerald-50/50"
                  } disabled:opacity-60`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <Bike className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {m.full_name || m.email || "Entregador"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {m.pedidos_ativos ?? 0} pedido(s) ativo(s)
                        {isCurrent && " · atual"}
                      </p>
                    </div>
                  </div>
                  {assigning === m.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                  ) : (
                    <Badge variant="outline" className="text-[10px]">
                      {isCurrent ? "Trocar" : "Atribuir"}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

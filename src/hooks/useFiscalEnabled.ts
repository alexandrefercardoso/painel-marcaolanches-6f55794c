import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useFiscalEnabled() {
  const [nfeEnabled, setNfeEnabled] = useState(false);
  const [nfceEnabled, setNfceEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await (supabase as any)
        .from("store_settings")
        .select("fiscal_nfe_enabled, fiscal_nfce_enabled")
        .maybeSingle();
      if (!mounted) return;
      setNfeEnabled(!!data?.fiscal_nfe_enabled);
      setNfceEnabled(!!data?.fiscal_nfce_enabled);
      setLoading(false);
    })();

    const ch = (supabase as any)
      .channel("fiscal-enabled-" + Math.random())
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "store_settings" },
        (payload: any) => {
          if (payload.new) {
            setNfeEnabled(!!payload.new.fiscal_nfe_enabled);
            setNfceEnabled(!!payload.new.fiscal_nfce_enabled);
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      (supabase as any).removeChannel(ch);
    };
  }, []);

  return { nfeEnabled, nfceEnabled, anyEnabled: nfeEnabled || nfceEnabled, loading };
}

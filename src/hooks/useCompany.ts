import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCompany() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`store_settings-changes-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "store_settings" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["current-store-settings"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["current-store-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_settings")
        .select("*")
        .single();

      if (error) {
        console.error("[store_settings] erro ao carregar configurações:", error);
        return null;
      }

      return {
        ...data,
        nome: data.name,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

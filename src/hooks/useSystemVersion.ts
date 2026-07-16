import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SystemVersion {
  version: string;
  release_date: string;
}

export function useSystemVersion() {
  return useQuery<SystemVersion | null>({
    queryKey: ["app_version", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_version" as any)
        .select("version, release_date")
        .eq("active", true)
        .order("release_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("[useSystemVersion]", error);
        return null;
      }
      return (data as SystemVersion | null) ?? null;
    },
    staleTime: 10 * 60 * 1000,
  });
}

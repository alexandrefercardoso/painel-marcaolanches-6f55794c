import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type WeeklyCampaign = {
  id: string;
  day_of_week: number;
  media_type: "image" | "video" | "gif";
  media_url: string | null;
  title: string | null;
  subtitle: string | null;
  button_text: string | null;
  button_link: string | null;
  background_color: string | null;
  is_active: boolean;
  expires_at: string | null;
  priority: number;
  show_mode: "always" | "once_per_day";
  auto_close_seconds: number | null;
  muted: boolean;
  autoplay: boolean;
  views_count: number;
  clicks_count: number;
};

type CacheEntry = { day: number; ts: number; data: WeeklyCampaign | null };
let memCache: CacheEntry | null = null;
const TTL = 5 * 60 * 1000;

export function useWeeklyCampaign() {
  const today = new Date().getDay();
  const lsKey = `wc_cache_${today}`;

  const initial = (() => {
    if (memCache && memCache.day === today && Date.now() - memCache.ts < TTL) return memCache.data;
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(lsKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { ts: number; data: WeeklyCampaign | null };
      const c = parsed.data;
      if (c?.expires_at && new Date(c.expires_at) < new Date()) return null;
      return c;
    } catch {
      return null;
    }
  })();

  const [campaign, setCampaign] = useState<WeeklyCampaign | null>(initial);
  const [loading, setLoading] = useState(initial === null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (memCache && memCache.day === today && Date.now() - memCache.ts < TTL) {
        if (!cancelled) {
          setCampaign(memCache.data);
          setLoading(false);
        }
        return;
      }

      let query = supabase
        .from("weekly_campaigns")
        .select("*")
        .eq("day_of_week", today)
        .eq("is_active", true)
        .order("priority", { ascending: false })
        .limit(1);

      const { data, error } = await query.maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("[useWeeklyCampaign]", error);
        setCampaign(null);
      } else {
        const c = data as WeeklyCampaign | null;
        const final = c?.expires_at && new Date(c.expires_at) < new Date() ? null : c;
        setCampaign(final);
        memCache = { day: today, ts: Date.now(), data: final };
        try {
          localStorage.setItem(lsKey, JSON.stringify({ ts: Date.now(), data: final }));
        } catch {}
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const recordView = useCallback((id: string) => {
    supabase.rpc("increment_campaign_view", { campaign_id: id }).then(() => {});
  }, []);
  const recordClick = useCallback((id: string) => {
    supabase.rpc("increment_campaign_click", { campaign_id: id }).then(() => {});
  }, []);

  return { campaign, loading, recordView, recordClick };
}

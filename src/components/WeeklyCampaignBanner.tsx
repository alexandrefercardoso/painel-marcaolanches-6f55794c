
import { useEffect, useRef, useState } from "react";
import { X, Volume2, VolumeX, ExternalLink } from "lucide-react";
import { useWeeklyCampaign } from "@/hooks/useWeeklyCampaign";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSafeCampaignLink } from "@/lib/campaign-links";

type Variant = "hero" | "modal";

interface Props {
  variant?: Variant;
  className?: string;
}

const DAY_KEY = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

export function WeeklyCampaignBanner({ variant = "hero", className }: Props) {
  const { campaign, loading, recordView, recordClick } = useWeeklyCampaign();
  const [closed, setClosed] = useState(false);
  const [muted, setMuted] = useState(true);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const viewedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!campaign) return;
    setMuted(campaign.muted);
    if (campaign.show_mode === "once_per_day") {
      const key = `wc_dismissed_${DAY_KEY()}_${campaign.id}`;
      if (typeof window !== "undefined" && localStorage.getItem(key)) {
        setClosed(true);
      }
    }
  }, [campaign]);

  useEffect(() => {
    if (!campaign || closed || viewedRef.current) return;
    viewedRef.current = true;
    recordView(campaign.id);
    if (campaign.auto_close_seconds && campaign.auto_close_seconds > 0) {
      const t = setTimeout(() => handleClose(), campaign.auto_close_seconds * 1000);
      return () => clearTimeout(t);
    }
  }, [campaign, closed, recordView]);

  useEffect(() => {
    if (!campaign?.media_url || campaign.media_type === "video") return;
    if (typeof document === "undefined") return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = campaign.media_url;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [campaign]);

  function handleClose() {
    if (campaign && campaign.show_mode === "once_per_day" && typeof window !== "undefined") {
      localStorage.setItem(`wc_dismissed_${DAY_KEY()}_${campaign.id}`, "1");
    }
    setClosed(true);
  }

  function handleCTA() {
    if (!campaign) return;
    recordClick(campaign.id);
    const url = getSafeCampaignLink(campaign.button_link);
    if (!url) return;
    if (/^https?:\/\//i.test(url)) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    window.location.href = url;
  }

  function toggleMute() {
    setMuted((m) => {
      const next = !m;
      if (videoRef.current) videoRef.current.muted = next;
      return next;
    });
  }

  if (loading || !campaign || closed || !campaign.media_url) return null;

  const bg = campaign.background_color || undefined;
  const isVideo = campaign.media_type === "video";
  const isModal = variant === "modal";

  const content = (
    <div
      className={cn(
        "group relative w-full overflow-hidden shadow-2xl animate-scale-in",
        isModal
          ? "h-[100dvh] sm:h-auto sm:aspect-video rounded-none sm:rounded-3xl"
          : cn("rounded-2xl", variant === "hero" ? "aspect-[21/9] md:aspect-[3/1]" : "aspect-video"),
        className,
      )}
      style={bg ? { backgroundColor: bg } : undefined}
    >
      {!mediaLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50 animate-pulse" />
      )}

      {isVideo ? (
        <video
          ref={videoRef}
          src={campaign.media_url}
          autoPlay={campaign.autoplay}
          muted={muted}
          loop
          playsInline
          preload="metadata"
          onLoadedData={() => setMediaLoaded(true)}
          className={cn(
            "absolute inset-0 h-full w-full transition-opacity duration-500",
            isModal ? "object-cover sm:object-cover" : "object-cover",
            mediaLoaded ? "opacity-100" : "opacity-0",
          )}
        />
      ) : (
        <img
          src={campaign.media_url}
          alt={campaign.title || "Promoção do dia"}
          loading="lazy"
          decoding="async"
          onLoad={() => setMediaLoaded(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-all duration-700",
            mediaLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
          )}
        />
      )}

      {(campaign.title || campaign.subtitle || campaign.button_text) && (
        <div
          className={cn(
            "absolute inset-0",
            isModal
              ? "bg-gradient-to-t from-black/90 via-black/40 to-black/20 sm:bg-gradient-to-r sm:from-black/70 sm:via-black/30 sm:to-transparent"
              : "bg-gradient-to-r from-black/70 via-black/30 to-transparent",
          )}
        />
      )}

      <div
        className={cn(
          "relative z-10 flex h-full flex-col",
          isModal
            ? "justify-end sm:justify-center p-6 pb-10 sm:p-12 max-w-full sm:max-w-xl text-center sm:text-left items-center sm:items-start"
            : "justify-center p-4 sm:p-8 md:p-12 max-w-xl",
        )}
      >
        {campaign.title && (
          <h2
            className={cn(
              "text-white font-black leading-tight drop-shadow-lg animate-fade-in",
              isModal
                ? "text-4xl sm:text-3xl md:text-5xl"
                : "text-2xl sm:text-3xl md:text-5xl",
            )}
          >
            {campaign.title}
          </h2>
        )}
        {campaign.subtitle && (
          <p
            className={cn(
              "mt-3 text-white/90 drop-shadow animate-fade-in",
              isModal ? "text-base sm:text-base md:text-lg" : "text-sm sm:text-base md:text-lg",
            )}
          >
            {campaign.subtitle}
          </p>
        )}
        {campaign.button_text && (
          <Button
            onClick={handleCTA}
            size="lg"
            className={cn(
              "mt-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xl hover:scale-105 transition-transform",
              isModal ? "w-full sm:w-fit h-14 text-base sm:h-11" : "w-fit",
            )}
          >
            {campaign.button_text}
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div
        className={cn(
          "absolute z-20 flex gap-1.5 transition-opacity",
          isModal
            ? "top-[max(1rem,env(safe-area-inset-top))] right-4 opacity-100"
            : "top-2 right-2 opacity-80 group-hover:opacity-100",
        )}
      >
        {isVideo && (
          <button
            onClick={toggleMute}
            className="rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm p-2.5 text-white transition"
            aria-label={muted ? "Ativar som" : "Silenciar"}
          >
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        )}
        <button
          onClick={handleClose}
          className="rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm p-2.5 text-white transition"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        <div className="w-full h-full sm:h-auto sm:max-w-3xl">{content}</div>
      </div>
    );
  }

  return content;
}

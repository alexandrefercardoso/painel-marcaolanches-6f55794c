import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { GlobalPrinterMonitor } from "@/components/GlobalPrinterMonitor";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useEffect, useState } from "react";
import { OfflinePage } from "@/components/OfflinePage";
import { registerSW } from "virtual:pwa-register";

import appCss from "../styles.css?url";

function installReactDomMutationGuard() {
  if (typeof window === "undefined" || typeof Node === "undefined") return;

  const globalScope = globalThis as typeof globalThis & {
    __reactDomMutationGuardInstalled?: boolean;
  };
  if (globalScope.__reactDomMutationGuardInstalled) return;
  globalScope.__reactDomMutationGuardInstalled = true;

  const originalRemoveChild = Node.prototype.removeChild;
  const originalInsertBefore = Node.prototype.insertBefore;

  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) return child;
    return originalRemoveChild.call(this, child) as T;
  };

  Node.prototype.insertBefore = function <T extends Node>(
    this: Node,
    newNode: T,
    referenceNode: Node | null,
  ): T {
    if (referenceNode && referenceNode.parentNode !== this) return newNode;
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };
}

installReactDomMutationGuard();

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" },
      { name: "google", content: "notranslate" },
      { title: "Painel de Gestão Delivery" },
      { name: "description", content: "Sistema de Gestão de Delivery Profissional" },
      { name: "theme-color", content: "#ef4444" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Gestão Delivery" },
      { property: "og:title", content: "Painel de Gestão Delivery" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://tmheapviezuqezfpqctp.supabase.co/storage/v1/object/public/products/prod_1740578644551_f8g27x.jpg" },
      { name: "apple-touch-fullscreen", content: "yes" },
      { name: "format-detection", content: "telephone=no" },
      { name: "twitter:title", content: "Painel de Gestão Delivery" },
      { property: "og:description", content: "Sistema de Gestão de Delivery Profissional" },
      { name: "twitter:description", content: "Sistema de Gestão de Delivery Profissional" },
      { name: "twitter:image", content: "https://tmheapviezuqezfpqctp.supabase.co/storage/v1/object/public/products/prod_1740578644551_f8g27x.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192.png" },
      { rel: "icon", type: "image/png", sizes: "512x512", href: "/icon-512.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}


function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Register Service Worker only outside the Vite preview/dev server.
    // In preview, an active SW can keep serving stale modules and show a white screen after HMR/F5.
    const isPreviewHost = (() => {
      if (typeof window === "undefined") return false;
      const h = window.location.hostname;
      const inIframe = window.self !== window.top;
      return (
        inIframe ||
        h.startsWith("id-preview--") ||
        h.startsWith("preview--") ||
        h.endsWith(".lovableproject.com") ||
        h.endsWith(".lovableproject-dev.com") ||
        h.endsWith(".beta.lovable.dev") ||
        new URLSearchParams(window.location.search).get("sw") === "off"
      );
    })();

    if (typeof window !== "undefined" && import.meta.env.PROD && !isPreviewHost) {
      registerSW({
        onNeedRefresh() {
          toast.info("Novo conteúdo disponível! Por favor, recarregue.", {
            action: {
              label: "Atualizar",
              onClick: () => window.location.reload(),
            },
            duration: 10000,
          });
        },
        onOfflineReady() {
          toast.success("App pronto para uso offline!");
        },
      });
    } else if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });

      if ("caches" in window) {
        caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
      }
    }

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setIsOffline(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Outlet />
      </ThemeProvider>
      {isOffline && (
        <div className="fixed bottom-4 left-4 right-4 z-[100] animate-in fade-in slide-in-from-bottom-4">
          <OfflinePage />
        </div>
      )}
      <PWAInstallPrompt />
      <GlobalPrinterMonitor />
    </QueryClientProvider>
  );
}
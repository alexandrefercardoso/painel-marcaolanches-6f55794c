import { createFileRoute, redirect } from "@tanstack/react-router";
import React, { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

const AdminPage = lazy(() => import("./-AdminPage"));

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;

    const sessionStr = localStorage.getItem("admin_session");

    if (!sessionStr) {
      throw redirect({ to: "/login" });
    }

    try {
      const user = JSON.parse(sessionStr);
      return { user };
    } catch (e) {
      localStorage.removeItem("admin_session");
      throw redirect({ to: "/login" });
    }
  },
  component: AdminRoute,
});

function AdminRoute() {
  const { user } = Route.useRouteContext() as any;

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
          <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Carregando painel...
          </div>
        </div>
      }
    >
      <AdminPage user={user} />
    </Suspense>
  );
}
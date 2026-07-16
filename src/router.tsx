import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // cache por 5 minutos global
        refetchOnWindowFocus: false, // ← principal culpado dos 68k chamadas
        refetchOnReconnect: false, // não refetch ao reconectar rede
        refetchIntervalInBackground: false,
        retry: 1, // só 1 tentativa em caso de erro
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 1000 * 60, // preload com cache de 1 minuto
  });

  return router;
};

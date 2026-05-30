"use client";

import { useEffect } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/auth-api";
import { applyTheme } from "@/lib/theme";
import { useAuthStore } from "@/store/auth-store";
import { useTenantStore } from "@/store/tenant-store";
import { useThemeStore } from "@/store/theme-store";

const queryClient = new QueryClient();

function AuthHydration() {
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const tenantId = useTenantStore((state) => state.tenant.id);

  const { data, error } = useQuery({
    queryKey: ["auth", "user", token, tenantId],
    queryFn: () => getCurrentUser(token as string, { tenantId }),
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data, setUser]);

  useEffect(() => {
    if (error) {
      logout();
    }
  }, [error, logout]);

  return null;
}

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const syncTheme = () => {
      applyTheme(useThemeStore.getState().theme);
    };

    const unsubscribe = useThemeStore.persist.onFinishHydration(syncTheme);

    void Promise.all([
      useThemeStore.persist.rehydrate(),
      useAuthStore.persist.rehydrate(),
      useTenantStore.persist.rehydrate(),
    ]).then(syncTheme);

    return unsubscribe;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthHydration />
      {children}
    </QueryClientProvider>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export function AuthGuard({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const [isAuthHydrated, setIsAuthHydrated] = useState(
    () => typeof window !== "undefined" && useAuthStore.persist.hasHydrated()
  );

  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setIsAuthHydrated(true);
    });

    if (!useAuthStore.persist.hasHydrated()) {
      void useAuthStore.persist.rehydrate();
    }

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isAuthHydrated && !token) {
      router.replace("/login");
    }
  }, [isAuthHydrated, router, token]);

  if (!isAuthHydrated || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-950">
        <div>
          <div className="mx-auto h-10 w-10 animate-pulse rounded-2xl bg-slate-950 dark:bg-slate-50" />
          <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-300">
            Checking your session...
          </p>
        </div>
      </div>
    );
  }

  return children;
}

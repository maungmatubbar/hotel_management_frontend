"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

export function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  function handleLogout() {
    logout();
    queryClient.clear();
    router.replace("/login");
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-950 dark:text-red-300 dark:hover:bg-red-950/40"
      onClick={handleLogout}
    >
      Logout
    </Button>
  );
}

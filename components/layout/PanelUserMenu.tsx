"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

type PanelUserMenuProps = {
  profileHref: string;
  compact?: boolean;
};

function getInitials(name?: string | null): string {
  const words = name?.trim().split(/\s+/).filter(Boolean) ?? [];

  if (words.length === 0) {
    return "HM";
  }

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function PanelUserMenu({ profileHref, compact = false }: PanelUserMenuProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const profilePhoto = useAuthStore((state) => state.profilePhoto);
  const logout = useAuthStore((state) => state.logout);
  const [isOpen, setIsOpen] = useState(false);

  function handleLogout() {
    setIsOpen(false);
    logout();
    queryClient.clear();
    router.replace("/login");
  }

  return (
    <div className="relative z-50">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(
          "h-11 rounded-2xl border-slate-200 bg-white/85 px-2 pr-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/85",
          compact && "h-10 w-10 rounded-full p-1"
        )}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="relative flex h-8 w-8 overflow-hidden rounded-full bg-linear-to-br from-slate-950 to-cyan-700 text-xs font-semibold text-white dark:from-slate-100 dark:to-cyan-200 dark:text-slate-950">
          {profilePhoto ? (
            <Image src={profilePhoto} alt={user?.name ?? "Profile"} fill className="object-cover" />
          ) : (
            <span className="grid h-full w-full place-items-center">{getInitials(user?.name)}</span>
          )}
        </span>
        <span className={cn("hidden max-w-32 truncate text-left sm:inline", compact && "sm:hidden")}>
          {user?.name ?? "Account"}
        </span>
        {compact ? null : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
      </Button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/10 dark:border-slate-800 dark:bg-slate-900">
          <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/70">
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 overflow-hidden rounded-full bg-linear-to-br from-slate-950 to-cyan-700 text-sm font-semibold text-white dark:from-slate-100 dark:to-cyan-200 dark:text-slate-950">
                {profilePhoto ? (
                  <Image src={profilePhoto} alt={user?.name ?? "Profile"} fill className="object-cover" />
                ) : (
                  <span className="grid h-full w-full place-items-center">{getInitials(user?.name)}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950 dark:text-slate-50">
                  {user?.name ?? "Logged in"}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {user?.email ?? "No email added"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-2 space-y-1">
            <Link
              href={profileHref}
              className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={() => setIsOpen(false)}
            >
              <UserCircle className="h-4 w-4" />
              Profile
            </Link>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

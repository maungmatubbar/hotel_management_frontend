"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, UserCircle } from "lucide-react";
import type { UserDataResponse } from "@/generated/generated";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useTenantStore } from "@/store/tenant-store";

const navItems = [
  { label: "Hotels", href: "/" },
  { label: "Customer Portal", href: "/customer/dashboard" },
  { label: "Admin", href: "/admin/dashboard" },
  { label: "Super Admin", href: "/super-admin/dashboard" },
];

function getDashboardPath(user: UserDataResponse | null): string {
  const roleNames = user?.roles.map((role) => role.name.toLowerCase()) ?? [];

  if (roleNames.includes("super admin")) {
    return "/super-admin/dashboard";
  }

  if (roleNames.includes("admin")) {
    return "/admin/dashboard";
  }

  return "/customer/dashboard";
}

function getProfilePath(user: UserDataResponse | null): string {
  const dashboardPath = getDashboardPath(user);

  if (dashboardPath.startsWith("/super-admin")) {
    return "/super-admin/profile";
  }

  if (dashboardPath.startsWith("/admin")) {
    return "/admin/profile";
  }

  return "/customer/profile";
}

export function Navbar() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const hydrated = useHydrated();
  const tenant = useTenantStore((state) => state.tenant);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const isLoggedIn = hydrated && Boolean(token);

  function handleLogout() {
    setIsUserMenuOpen(false);
    logout();
    queryClient.clear();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-slate-950 to-cyan-700 text-xs font-bold text-white shadow-lg shadow-cyan-900/20">
            HM
          </span>
          <div>
            <p className="text-sm font-semibold leading-4 text-slate-950 dark:text-slate-50">HotelOS</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Multi-tenant SaaS</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-xl border border-slate-200/70 bg-slate-50/80 p-1 text-sm font-medium text-slate-600 shadow-inner dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-1.5 transition hover:bg-white hover:text-slate-950 hover:shadow-sm dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Badge className="hidden rounded-lg border border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/70 lg:inline-flex">
            {tenant.name}
          </Badge>
          <ThemeToggle />
          {isLoggedIn ? (
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={() => setIsUserMenuOpen((current) => !current)}
              >
                <UserCircle className="h-4 w-4" />
                <span className="hidden max-w-28 truncate sm:inline">{user?.name ?? "Account"}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>

              {isUserMenuOpen ? (
                <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-950/10 dark:border-slate-800 dark:bg-slate-900">
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-semibold text-slate-950 dark:text-slate-50">
                      {user?.name ?? "Logged in"}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {user?.email ?? tenant.name}
                    </p>
                  </div>
                  <Link
                    href={getDashboardPath(user)}
                    className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href={getProfilePath(user)}
                    className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              href="/login"
              className={cn(buttonVariants({ size: "sm" }), "rounded-lg")}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PanelUserMenu } from "@/components/layout/PanelUserMenu";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils";

type SidebarProps = {
  title: string;
  subtitle: string;
  items: {
    label: string;
    href: string;
    icon: LucideIcon;
  }[];
  isCollapsed: boolean;
  profileHref: string;
};

export function Sidebar({ title, subtitle, items, isCollapsed, profileHref }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "border-b border-slate-200/70 bg-white/90 px-4 py-4 backdrop-blur-xl transition-all duration-300 dark:border-slate-800/70 dark:bg-slate-950/90 lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:h-screen lg:w-72 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-5 lg:py-6",
        isCollapsed && "lg:w-20 lg:px-3"
      )}
    >
      <div className={cn("flex items-center justify-between gap-4", !isCollapsed && "lg:block")}>
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-slate-950 via-slate-800 to-cyan-700 text-sm font-bold text-white shadow-lg shadow-cyan-900/20 dark:from-slate-100 dark:via-white dark:to-cyan-200 dark:text-slate-950">
            HM
          </span>
          <div className={cn("min-w-0", isCollapsed && "lg:hidden")}>
            <p className="truncate font-semibold text-slate-950 dark:text-slate-50">{title}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <ThemeToggle />
          <PanelUserMenu profileHref={profileHref} compact />
        </div>
      </div>

      <nav className={cn("mt-4 flex gap-2 overflow-x-auto pb-1 lg:mt-10 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0", isCollapsed && "lg:mt-8")}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white lg:w-full lg:py-3",
                isCollapsed && "lg:justify-center lg:px-0",
                isActive &&
                  "bg-gray-100 text-black shadow-none hover:bg-gray-100 hover:text-black dark:bg-gray-100 dark:text-black dark:hover:bg-gray-100 dark:hover:text-black"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className={cn(isCollapsed && "lg:hidden")}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={cn("mt-10 hidden rounded-3xl bg-linear-to-br from-slate-950 via-slate-900 to-cyan-800 p-5 text-white shadow-xl shadow-cyan-950/10 lg:block", isCollapsed && "lg:hidden")}>
        <Badge variant="inverted">Live workspace</Badge>
        <p className="mt-4 text-sm font-semibold">Operations overview</p>
        <p className="mt-2 text-xs leading-5 text-white/60">
          Keep rooms, bookings, pricing, reports, and settings organized from one responsive panel.
        </p>
      </div>
    </aside>
  );
}

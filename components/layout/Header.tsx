"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PanelUserMenu } from "@/components/layout/PanelUserMenu";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils";

type HeaderProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  action?: string;
  profileHref?: string;
  metricValue?: string;
  metricLabel?: string;
  showTopbar?: boolean;
  showHero?: boolean;
  sticky?: boolean;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
};

export function Header({
  eyebrow,
  title,
  description,
  action,
  profileHref = "/customer/profile",
  metricValue = "78%",
  metricLabel = "occupancy",
  showTopbar = true,
  showHero = true,
  sticky = true,
  isSidebarCollapsed = false,
  onToggleSidebar,
}: HeaderProps) {
  const containerClassName = [
    "border-b border-slate-200/70 bg-white/85 px-4 py-5 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/85 sm:px-6 lg:px-8",
    sticky ? "sticky top-0 z-50 overflow-visible" : "relative z-10 overflow-hidden",
  ].join(" ");
  const topbarClassName = onToggleSidebar
    ? cn(
        "relative z-20 hidden flex-wrap items-center justify-between gap-3 lg:flex",
        showHero && "mb-5"
      )
    : cn(
        "relative z-20 flex flex-wrap items-center justify-between gap-3",
        showHero && "mb-5"
      );

  return (
    <div className={containerClassName}>
      <div className="pointer-events-none absolute right-4 top-0 h-32 w-32 rounded-full bg-cyan-100/80 blur-3xl dark:bg-cyan-950/50" />
      <div className="pointer-events-none absolute left-1/3 top-0 h-24 w-52 rounded-full bg-slate-100 blur-3xl dark:bg-slate-800/40" />
      {showTopbar ? (
        <div className={topbarClassName}>
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
            {onToggleSidebar ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="hidden h-10 w-10 rounded-full p-0 lg:inline-flex"
                aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                onClick={onToggleSidebar}
              >
                {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            ) : null}
            <div className="relative hidden min-w-64 max-w-md flex-1 md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder="Search..."
                className="h-10 rounded-full bg-white/80 pl-10 shadow-sm dark:bg-slate-900/80"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <PanelUserMenu profileHref={profileHref} />
          </div>
        </div>
      ) : null}

      {showHero ? (
      <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <span className="font-semibold text-slate-950 dark:text-slate-50">{metricValue}</span>
            <span className="ml-2 text-slate-500 dark:text-slate-400">{metricLabel}</span>
          </div>
          {action ? (
            <Button className="rounded-xl shadow-sm">
              {action}
            </Button>
          ) : null}
        </div>
      </div>
      ) : null}
    </div>
  );
}

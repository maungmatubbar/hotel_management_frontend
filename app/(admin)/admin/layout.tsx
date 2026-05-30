"use client";

import { useState } from "react";
import {
  BadgePercent,
  BedDouble,
  CalendarCheck,
  ChartNoAxesCombined,
  Gauge,
  Settings,
  Tags,
  UserCircle,
} from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useTenantStore } from "@/store/tenant-store";

const adminNav = [
  { label: "Dashboard", href: "/admin/dashboard", icon: Gauge },
  { label: "Rooms", href: "/admin/rooms", icon: BedDouble },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
  { label: "Pricing", href: "/admin/pricing", icon: BadgePercent },
  { label: "Promos", href: "/admin/promos", icon: Tags },
  { label: "Reports", href: "/admin/reports", icon: ChartNoAxesCombined },
  { label: "Settings", href: "/admin/settings", icon: Settings },
  { label: "Profile", href: "/admin/profile", icon: UserCircle },
];

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const tenant = useTenantStore((state) => state.tenant);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50 lg:flex">
        <Sidebar
          title="Hotel Admin"
          subtitle={tenant.name}
          items={adminNav}
          isCollapsed={isSidebarCollapsed}
          profileHref="/admin/profile"
        />
        <div className={isSidebarCollapsed ? "min-w-0 flex-1 transition-all duration-300 lg:pl-20" : "min-w-0 flex-1 transition-all duration-300 lg:pl-72"}>
          <Header
            profileHref="/admin/profile"
            showHero={false}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed((current) => !current)}
          />
          <main className="w-full p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}

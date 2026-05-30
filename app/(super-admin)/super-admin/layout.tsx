"use client";

import { useState } from "react";
import { Building2, Gauge, Hotel, Users, UserCircle } from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

const superAdminNav = [
  { label: "Dashboard", href: "/super-admin/dashboard", icon: Gauge },
  { label: "Hotels", href: "/super-admin/hotels", icon: Hotel },
  { label: "Tenants", href: "/super-admin/tenants", icon: Building2 },
  { label: "Users", href: "/super-admin/users", icon: Users },
  { label: "Profile", href: "/super-admin/profile", icon: UserCircle },
];

export default function SuperAdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 lg:flex">
        <Sidebar
          title="Super Admin"
          subtitle="SaaS owner console"
          items={superAdminNav}
          isCollapsed={isSidebarCollapsed}
          profileHref="/super-admin/profile"
        />
        <div className={isSidebarCollapsed ? "min-w-0 flex-1 transition-all duration-300 lg:pl-20" : "min-w-0 flex-1 transition-all duration-300 lg:pl-72"}>
          <Header
            profileHref="/super-admin/profile"
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

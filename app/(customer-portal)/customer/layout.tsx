"use client";

import { useState } from "react";
import { CalendarCheck, Gauge, Heart, UserCircle } from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

const customerNav = [
  { label: "Dashboard", href: "/customer/dashboard", icon: Gauge },
  { label: "My bookings", href: "/customer/bookings", icon: CalendarCheck },
  { label: "Favorites", href: "/customer/favorites", icon: Heart },
  { label: "Profile", href: "/customer/profile", icon: UserCircle },
];

export default function CustomerPortalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 lg:flex">
        <Sidebar
          title="Customer Portal"
          subtitle="Guest booking account"
          items={customerNav}
          isCollapsed={isSidebarCollapsed}
          profileHref="/customer/profile"
        />
        <div className={isSidebarCollapsed ? "min-w-0 flex-1 transition-all duration-300 lg:pl-20" : "min-w-0 flex-1 transition-all duration-300 lg:pl-72"}>
          <Header
            profileHref="/customer/profile"
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

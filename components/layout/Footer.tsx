import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const footerGroups = [
  {
    title: "Explore",
    links: [
      { label: "Home", href: "/" },
      { label: "Rooms", href: "/rooms" },
      { label: "Services", href: "/services" },
    ],
  },
  {
    title: "Manage",
    links: [
      { label: "Hotel admin", href: "/admin/dashboard" },
      { label: "Super admin", href: "/super-admin/dashboard" },
      { label: "Bookings", href: "/customer/bookings" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Terms", href: "/" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-slate-950 to-cyan-700 text-sm font-bold text-white shadow-lg shadow-cyan-900/20">
                HM
              </span>
              <div>
                <p className="font-semibold text-slate-950 dark:text-slate-50">HotelOS</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Multi-tenant hotel management SaaS
                </p>
              </div>
            </Link>
            <p className="mt-5 max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-300">
              Search stays, reserve rooms, manage customer bookings, and operate tenant
              hotel dashboards from one production-ready interface.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge>OTP login</Badge>
              <Badge>Tenant aware</Badge>
              <Badge>Night mode</Badge>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                  {group.title}
                </h3>
                <div className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <Link
                      key={`${group.title}-${link.label}`}
                      href={link.href}
                      className="block text-sm text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 HotelOS. All rights reserved.</p>
          <p>Built for hotel tenants, guests, and SaaS owners.</p>
        </div>
      </div>
    </footer>
  );
}

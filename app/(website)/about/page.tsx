import { Award, Building2, CheckCircle2, ShieldCheck, UsersRound } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const values = [
  "Tenant-aware hotel operations",
  "Guest-first booking experience",
  "Clear inventory and payment workflows",
];

const highlights = [
  { value: "Multi-tenant", label: "architecture for growing hotel groups" },
  { value: "Real-time", label: "room availability and booking context" },
  { value: "Unified", label: "guest, room, payment, and admin experience" },
];

export default function AboutPage() {
  return (
    <main className="hotel-page-bg text-slate-950 dark:text-slate-50">
      <Navbar />
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_35%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_0.75fr] lg:px-8">
          <div>
            <Badge variant="inverted">About HotelOS</Badge>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
              A modern hotel management experience for teams and guests.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
              HotelOS helps hotels present live rooms online, collect direct bookings,
              manage customer details, and keep tenant operations organized from one clean interface.
            </p>
          </div>
          <Card className="border-white/10 bg-white/10 p-6 text-white backdrop-blur dark:bg-white/10">
            <Building2 className="h-10 w-10 text-cyan-200" />
            <h2 className="mt-6 text-2xl font-semibold">Built for professional hospitality teams</h2>
            <p className="mt-3 text-sm leading-6 text-white/65">
              From boutique properties to multi-location hotel groups, the platform keeps each
              tenant&apos;s rooms, bookings, and payments separated and easy to operate.
            </p>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <Card key={item.value} className="p-6">
              <p className="text-3xl font-semibold text-slate-950 dark:text-slate-50">{item.value}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.label}</p>
            </Card>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.75fr_1fr] lg:items-start">
          <div>
            <Badge variant="success">Our focus</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">Hospitality software that feels simple.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              The goal is to remove friction from daily hotel operations while giving guests
              a professional booking path from room discovery to payment.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: "Trust", description: "Secure tenant data, role-aware dashboards, and clean public booking flows.", icon: ShieldCheck },
              { title: "Service", description: "Guest details, room choice, stay dates, and payment options stay connected.", icon: UsersRound },
              { title: "Quality", description: "A polished interface that makes hotel inventory easier to understand.", icon: Award },
            ].map((item) => (
              <Card key={item.title} className="p-5">
                <item.icon className="h-6 w-6 text-cyan-600 dark:text-cyan-300" />
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>

        <Card className="mt-12 p-6">
          <h2 className="text-2xl font-semibold">What we believe</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {values.map((value) => (
              <div key={value} className="flex gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{value}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
      <Footer />
    </main>
  );
}

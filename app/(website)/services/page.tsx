import Link from "next/link";
import { BedDouble, CalendarCheck, CreditCard, Headphones, Hotel, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const services = [
  {
    title: "Room Inventory Management",
    description: "Create room types, set rates, publish images, manage capacity, and control availability.",
    icon: BedDouble,
  },
  {
    title: "Online Guest Booking",
    description: "Let guests choose rooms, dates, quantities, and payment options from the public website.",
    icon: CalendarCheck,
  },
  {
    title: "Payment & Invoice Flow",
    description: "Support pay now and pay later journeys with invoice tracking and payment gateway handoff.",
    icon: CreditCard,
  },
  {
    title: "Hotel Admin Dashboard",
    description: "Give staff clear access to bookings, rooms, customers, and property operations.",
    icon: Hotel,
  },
  {
    title: "Secure Tenant Access",
    description: "Keep hotel data separated across tenants with authenticated admin and customer experiences.",
    icon: ShieldCheck,
  },
  {
    title: "Guest Support Workflow",
    description: "Keep customer contact, stay details, and booking status easy to review and follow up.",
    icon: Headphones,
  },
];

export default function ServicesPage() {
  return (
    <main className="hotel-page-bg text-slate-950 dark:text-slate-50">
      <Navbar />
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Badge variant="inverted">Hotel management services</Badge>
          <div className="mt-6 grid gap-8 lg:grid-cols-[0.8fr_0.45fr] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl">
                Services that connect hotel operations with guest booking.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
                Use HotelOS to run professional room sales, booking collection, invoice
                workflows, and tenant hotel administration from a single platform.
              </p>
            </div>
            <Card className="border-white/10 bg-white/10 p-6 text-white backdrop-blur dark:bg-white/10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100">Recommended path</p>
              <p className="mt-3 text-2xl font-semibold">Publish rooms, accept bookings, then manage guests.</p>
              <Link
                href="/rooms"
                className={cn(buttonVariants(), "mt-5 bg-white text-slate-950 hover:bg-slate-100")}
              >
                View rooms
              </Link>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.title} className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-slate-50 dark:text-slate-950">
                <service.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-xl font-semibold">{service.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{service.description}</p>
            </Card>
          ))}
        </div>

        <Card className="mt-12 overflow-hidden">
          <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <Badge variant="success">Need help choosing?</Badge>
              <h2 className="mt-4 text-2xl font-semibold">Start with live room sales.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                The rooms page uses the tenant room endpoint, so guests can browse real inventory
                and continue into the checkout flow with selected dates and room details.
              </p>
            </div>
            <Link href="/contact" className={buttonVariants({ variant: "outline" })}>
              Contact hotel team
            </Link>
          </div>
        </Card>
      </section>
      <Footer />
    </main>
  );
}

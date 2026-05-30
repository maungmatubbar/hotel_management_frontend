import Link from "next/link";
import { BedDouble, CalendarDays, Mail, MapPin, Phone, Search, ShieldCheck, UserRound, Users } from "lucide-react";
import { HotelCard } from "@/components/hotel/HotelCard";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hotels } from "@/lib/mock-data";

const popularDestinations = ["Cox's Bazar", "Dhaka", "Sylhet", "Chattogram"];
const propertyTypes = [
  ["Hotels", "128 properties"],
  ["Resorts", "42 properties"],
  ["Apartments", "76 properties"],
  ["Villas", "19 properties"],
];

export default function CustomerHomePage() {
  return (
    <main className="overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
          <div className="relative grid gap-10 lg:grid-cols-[0.95fr_0.55fr] lg:items-end">
            <div>
              <Badge variant="inverted" className="px-4 py-2 text-sm">
                Multi-tenant hotel booking platform
              </Badge>
              <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl">
                Find your next stay with fast room booking.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
                Search hotels, compare rooms, apply promos, and manage bookings from a
                customer portal inspired by modern travel marketplaces like{" "}
                <a className="font-semibold text-white underline" href="https://www.booking.com/">
                  Booking.com
                </a>
                .
              </p>
            </div>

            <Card className="border-white/10 bg-white/10 p-5 text-white backdrop-blur dark:bg-white/10">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-400/20">
                  <ShieldCheck className="h-7 w-7 text-cyan-200" />
                </div>
                <div>
                  <p className="font-semibold">Verified tenant hotels</p>
                  <p className="mt-1 text-sm text-white/60">
                    Secure OTP login, customer trips, and tenant-aware rooms.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="-mb-72 mt-12 border-4 border-cyan-400 bg-cyan-400 p-1 shadow-2xl shadow-slate-950/25 dark:border-cyan-400 dark:bg-cyan-400">
            <form
              action={`/hotel/${hotels[0].slug}/booking#payment`}
              className="grid gap-1 rounded-2xl md:grid-cols-2 lg:grid-cols-6"
            >
              <div className="rounded-xl bg-white p-4 text-slate-950 dark:bg-white dark:text-slate-950">
                <Label htmlFor="check-in" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <CalendarDays className="h-4 w-4" />
                  Check in
                </Label>
                <Input id="check-in" name="check_in" type="date" className="mt-2 border-slate-200" required />
              </div>

              <div className="rounded-xl bg-white p-4 text-slate-950 dark:bg-white dark:text-slate-950">
                <Label htmlFor="check-out" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <CalendarDays className="h-4 w-4" />
                  Check out
                </Label>
                <Input id="check-out" name="check_out" type="date" className="mt-2 border-slate-200" required />
              </div>

              <div className="rounded-xl bg-white p-4 text-slate-950 dark:bg-white dark:text-slate-950">
                <Label htmlFor="guests" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <Users className="h-4 w-4" />
                  Guests
                </Label>
                <Input id="guests" name="guests" type="number" min="1" defaultValue="2" className="mt-2 border-slate-200" required />
              </div>

              <div className="rounded-xl bg-white p-4 text-slate-950 dark:bg-white dark:text-slate-950">
                <Label htmlFor="rooms" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <BedDouble className="h-4 w-4" />
                  Rooms
                </Label>
                <Input id="rooms" name="rooms" type="number" min="1" defaultValue="1" className="mt-2 border-slate-200" required />
              </div>

              <div className="rounded-xl bg-white p-4 text-slate-950 dark:bg-white dark:text-slate-950 lg:col-span-2">
                <Label htmlFor="customer-address" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <MapPin className="h-4 w-4" />
                  Address
                </Label>
                <Input id="customer-address" name="customer_address" placeholder="House, road, city" className="mt-2 border-slate-200" required />
              </div>

              <div className="rounded-xl bg-white p-4 text-slate-950 dark:bg-white dark:text-slate-950 lg:col-span-2">
                <Label htmlFor="customer-name" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <UserRound className="h-4 w-4" />
                  Customer name
                </Label>
                <Input id="customer-name" name="customer_name" placeholder="Enter full name" className="mt-2 border-slate-200" required />
              </div>

              <div className="rounded-xl bg-white p-4 text-slate-950 dark:bg-white dark:text-slate-950 lg:col-span-2">
                <Label htmlFor="customer-email" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input id="customer-email" name="customer_email" type="email" placeholder="customer@example.com" className="mt-2 border-slate-200" required />
              </div>

              <div className="rounded-xl bg-white p-4 text-slate-950 dark:bg-white dark:text-slate-950 lg:col-span-2">
                <Label htmlFor="customer-phone" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <Phone className="h-4 w-4" />
                  Phone
                </Label>
                <Input id="customer-phone" name="customer_phone" type="tel" placeholder="+880 17..." className="mt-2 border-slate-200" required />
              </div>

              <Button
                type="submit"
                className="min-h-12 self-end rounded-xl bg-slate-950 px-5 text-sm text-white hover:bg-slate-800 dark:bg-slate-950 dark:text-white lg:col-span-1"
              >
                <Search className="h-4 w-4" />
                Book now
              </Button>
            </form>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 pt-64 sm:px-6 lg:px-8">
        <Card className="grid overflow-hidden md:grid-cols-[0.7fr_0.3fr]">
          <div className="p-6 sm:p-8">
            <Badge variant="success">Limited-time offer</Badge>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
              Save 15% on selected tenant hotels
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              A Booking.com-style promotional strip for seasonal campaigns, promo codes,
              and hotel-specific discount offers.
            </p>
            <Button className="mt-5 rounded-lg">Explore deals</Button>
          </div>
          <div className="min-h-48 bg-linear-to-br from-slate-900 via-slate-700 to-cyan-700" />
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
            Trending destinations
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Popular city cards for quick hotel discovery.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {popularDestinations.map((city, index) => (
            <Link
              key={city}
              href="#hotels"
              className={`group relative min-h-44 overflow-hidden rounded-2xl p-5 text-white shadow-sm ${
                index === 0 ? "md:col-span-2" : ""
              }`}
            >
              <div className="absolute inset-0 bg-linear-to-br from-slate-950 via-slate-800 to-cyan-700 transition group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative">
                <h3 className="text-2xl font-semibold">{city}</h3>
                <p className="mt-2 text-sm text-white/70">Hotels, resorts, and apartments</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
              Browse by property type
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Marketplace-style cards for faster guest navigation.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {propertyTypes.map(([title, count]) => (
            <Card key={title} className="overflow-hidden">
              <div className="h-32 bg-linear-to-br from-cyan-100 via-slate-100 to-slate-300 dark:from-slate-800 dark:via-slate-900 dark:to-cyan-950" />
              <div className="p-5">
                <h3 className="font-semibold text-slate-950 dark:text-slate-50">{title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{count}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section id="hotels" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Hotels
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Stays guests love
            </h2>
          </div>
          <p className="hidden max-w-sm text-sm text-slate-500 sm:block">
            Featured hotel cards with review score, tenant routing, and clear booking CTA.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hotels.map((hotel) => (
            <HotelCard key={hotel.slug} hotel={hotel} />
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}

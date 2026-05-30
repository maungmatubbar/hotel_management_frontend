import { StatCard } from "@/components/dashboard/StatCard";
import { BookingCard } from "@/components/hotel/BookingCard";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { customerStats, customerTrips } from "@/lib/mock-data";

export default function CustomerDashboardPage() {
  return (
    <div className="space-y-8">
      <Header
        eyebrow="Guest workspace"
        title="Welcome back, Tanvir"
        description="Track bookings, manage guest details, save favorite hotels, and continue checkout from one customer portal."
        action="Book new stay"
        profileHref="/customer/profile"
        metricValue="2"
        metricLabel="active trips"
        showTopbar={false}
        sticky={false}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {customerStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.62fr_0.38fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">Upcoming trips</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Customer booking timeline UI.</p>
            </div>
            <Badge variant="success">2 active</Badge>
          </div>
          <div className="mt-5 space-y-3">
            {customerTrips.map((trip) => (
              <BookingCard
                key={`${trip.hotel}-${trip.date}`}
                booking={{
                  guest: trip.hotel,
                  room: trip.room,
                  date: trip.date,
                  status: trip.status,
                  total: trip.amount,
                }}
              />
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 p-6 text-white dark:border-cyan-900/40">
          <Badge variant="inverted">Reward member</Badge>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight">2,450 points</h2>
          <p className="mt-3 text-sm leading-6 text-white/60">
            Use reward points on the next booking checkout, promo campaigns, or hotel upgrades.
          </p>
          <div className="mt-8 rounded-2xl bg-white/10 p-4">
            <p className="text-sm text-white/60">Next reward unlock</p>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-3/4 rounded-full bg-cyan-300" />
            </div>
          </div>
          <Button className="mt-6 w-full bg-white text-slate-950 hover:bg-slate-100">
            Explore hotels
          </Button>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          ["Fast rebooking", "Repeat your last stay in two clicks."],
          ["Saved preferences", "Room type, guests, and favorite hotels."],
          ["Secure access", "Phone OTP and password-ready account UI."],
        ].map(([title, text]) => (
          <Card key={title} className="p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
              HM
            </div>
            <h3 className="mt-5 font-semibold text-slate-950 dark:text-slate-50">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{text}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}

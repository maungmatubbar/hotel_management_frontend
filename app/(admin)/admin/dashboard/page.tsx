import { StatCard } from "@/components/dashboard/StatCard";
import { BookingCard } from "@/components/hotel/BookingCard";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { bookings, tenantStats } from "@/lib/mock-data";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {tenantStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.65fr_0.35fr]">
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">Recent bookings</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Latest guest activity across this tenant.</p>
            </div>
            <Badge>Live UI</Badge>
          </div>
          <div className="mt-5 space-y-3">
            {bookings.map((booking) => (
              <BookingCard key={`${booking.guest}-${booking.date}`} booking={booking} />
            ))}
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 p-6 text-white dark:border-cyan-900/40 dark:bg-linear-to-br">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
          <Badge variant="inverted">Today&apos;s focus</Badge>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight">Raise direct booking conversion</h2>
          <p className="mt-3 text-sm leading-6 text-white/65">
            Promote rooms with low occupancy, publish weekend pricing, and review pending
            guest requests.
          </p>
          <div className="mt-6 space-y-3 text-sm">
            {["12 pending requests", "4 rooms low inventory", "2 promos expiring"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur transition hover:bg-white/15">
                {item}
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {["Room revenue", "Occupancy mix", "Promo performance"].map((title, index) => (
          <Card key={title} className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-950 dark:text-slate-50">{title}</h3>
              <Badge variant={index === 1 ? "warning" : "success"}>{index === 1 ? "Watch" : "Good"}</Badge>
            </div>
            <div className="mt-6 flex h-32 items-end gap-2">
              {[42, 68, 54, 80, 62, 92, 74].map((height, barIndex) => (
                <div key={`${title}-${barIndex}`} className="flex flex-1 items-end">
                  <div
                    className="w-full rounded-t-xl bg-cyan-700/80 dark:bg-cyan-400/70"
                    style={{ height: `${height}%` }}
                  />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}

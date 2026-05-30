import { StatCard } from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { superAdminStats } from "@/lib/mock-data";

export default function SuperAdminDashboardPage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {superAdminStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.6fr_0.4fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">Tenant growth</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Monthly platform onboarding trend.</p>
            </div>
            <Badge variant="success">+14%</Badge>
          </div>
          <div className="mt-8 grid h-72 items-end gap-3 rounded-2xl bg-slate-50 p-5 dark:bg-slate-950/70 sm:grid-cols-10">
            {[45, 52, 48, 61, 70, 66, 78, 84, 88, 96].map((height, index) => (
              <div key={index} className="flex h-full items-end">
                <div
                  className="w-full rounded-t-2xl bg-cyan-700 dark:bg-cyan-400"
                  style={{ height: `${height}%` }}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">Platform alerts</h2>
            <Badge variant="warning">3 open</Badge>
          </div>
          <div className="mt-5 space-y-3">
            {["3 tenants pending verification", "1 subscription renewal failed", "9 hotels need profile review"].map(
              (alert) => (
                <div key={alert} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300">
                  {alert}
                </div>
              )
            )}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {["Tenant health", "Billing status", "User activity"].map((title, index) => (
          <Card key={title} className="overflow-hidden p-6">
            <Badge variant={index === 1 ? "warning" : "success"}>{index === 1 ? "Review" : "Healthy"}</Badge>
            <h3 className="mt-5 text-lg font-semibold text-slate-950 dark:text-slate-50">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Platform level signal prepared for production analytics cards.
            </p>
          </Card>
        ))}
      </section>
    </div>
  );
}

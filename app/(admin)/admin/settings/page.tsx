import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AdminSettingsPage() {
  return (
    <section className="grid gap-6 md:grid-cols-2">
      {["Hotel profile", "Tenant billing", "Booking policies", "Notification channels"].map((item) => (
        <Card key={item} className="group p-5 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-lg dark:hover:border-cyan-900 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Settings
              </p>
              <h2 className="mt-3 text-xl font-semibold text-slate-950 dark:text-slate-50">{item}</h2>
            </div>
            <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30" />
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Configure tenant-level settings and operational preferences.
          </p>
          <Button variant="outline" className="mt-6 rounded-xl">
            Manage
          </Button>
        </Card>
      ))}
    </section>
  );
}

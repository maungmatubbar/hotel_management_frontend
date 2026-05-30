import { Card } from "@/components/ui/card";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-300">
              Analytics
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
              Reports
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Revenue, occupancy, channel performance, and guest behavior in one executive summary.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[28rem]">
            {[
              ["$24.8k", "revenue"],
              ["78%", "occupancy"],
              ["4.8", "rating"],
              ["12", "requests"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                <p className="font-semibold text-slate-950 dark:text-slate-50">{value}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 grid h-80 grid-cols-12 items-end gap-2 rounded-3xl bg-slate-50 p-4 dark:bg-slate-950/70 sm:gap-3 sm:p-5">
          {[40, 65, 52, 78, 44, 86, 70, 90, 58, 74, 62, 96].map((height, index) => (
            <div key={index} className="flex h-full items-end rounded-t-2xl bg-white/70 p-1 dark:bg-slate-900/80">
              <div
                className="w-full rounded-t-2xl bg-linear-to-t from-slate-950 to-cyan-600 dark:from-cyan-500 dark:to-cyan-300"
                style={{ height: `${height}%` }}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

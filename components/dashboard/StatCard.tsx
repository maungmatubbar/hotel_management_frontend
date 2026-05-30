import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: string;
  trend: string;
};

export function StatCard({ label, value, trend }: StatCardProps) {
  const isPositive = trend.startsWith("+");

  return (
    <Card className="group relative overflow-hidden p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70 dark:hover:shadow-black/20">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-cyan-100/80 blur-2xl transition group-hover:bg-cyan-200/80 dark:bg-cyan-950/40" />
      <div className="absolute bottom-0 left-0 h-1 w-full bg-linear-to-r from-cyan-500 via-slate-900 to-cyan-500 opacity-70 dark:from-cyan-400 dark:via-white dark:to-cyan-400" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <Badge variant={isPositive ? "success" : "warning"}>{trend}</Badge>
        </div>
        <div className="mt-5">
          <p className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">{value}</p>
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            vs last month
          </p>
        </div>
      </div>
    </Card>
  );
}

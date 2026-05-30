import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const promos = [
  { code: "SUMMER20", discount: "20%", usage: "82 uses" },
  { code: "FAMILY15", discount: "15%", usage: "41 uses" },
  { code: "WEEKEND10", discount: "10%", usage: "23 uses" },
];

export default function AdminPromosPage() {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-300">
            Marketing
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
            Promo codes
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Create campaign codes, monitor redemption, and keep checkout offers under control.
          </p>
        </div>
        <Button className="rounded-xl">
          New promo
        </Button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {promos.map((promo) => (
          <div key={promo.code} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950/70 dark:hover:border-cyan-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">Code</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
              {promo.code}
            </h3>
            <div className="mt-5 flex justify-between text-sm text-slate-600 dark:text-slate-300">
              <span>{promo.discount} off</span>
              <span>{promo.usage}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

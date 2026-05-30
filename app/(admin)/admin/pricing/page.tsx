import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const rules = ["Weekend markup", "Long stay discount", "Seasonal rate", "Last-minute deal"];

export default function AdminPricingPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.62fr_0.38fr]">
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Badge variant="success">Revenue optimized</Badge>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
              Pricing rules
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Control rates by season, demand, room type, and booking behavior.
            </p>
          </div>
          <Button variant="outline">Export rules</Button>
        </div>
        <div className="mt-6 space-y-3">
          {rules.map((rule, index) => (
            <div key={rule} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 dark:border-slate-800 dark:bg-slate-950/70 dark:hover:border-cyan-900 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-950 dark:text-slate-50">{rule}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Applies to {index + 2} room types</p>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">Create rule</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Add a new dynamic pricing condition and apply it to selected rooms.
        </p>
        <div className="mt-5 space-y-4">
          {["Rule name", "Adjustment", "Date range"].map((field) => (
            <Input
              key={field}
              placeholder={field}
            />
          ))}
          <Button className="w-full">
            Save pricing rule
          </Button>
        </div>
      </Card>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TenantForm } from "@/components/forms/TenantForm";
import { TenantList } from "@/components/tenant/TenantList";

export default function SuperAdminTenantsPage() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">Tenants</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Manage tenant accounts, plans, and status.</p>
        </div>
        <Button className="rounded-full">
          Invite tenant
        </Button>
      </div>

      <TenantForm />
      <TenantList />
    </Card>
  );
}

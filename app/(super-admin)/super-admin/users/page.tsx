import { TenantUserForm } from "@/components/forms/TenantUserForm";
import { TenantUserList } from "@/components/tenant/TenantUserList";
import { Card } from "@/components/ui/card";

export default function SuperAdminUsersPage() {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">Users</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Role-aware user directory across platform, tenant admins, and booking customers.
      </p>

      <TenantUserForm />
      <TenantUserList />
    </Card>
  );
}

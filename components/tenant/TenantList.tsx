"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getTenants } from "@/lib/tenant-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { useTenantStore } from "@/store/tenant-store";

export function TenantList() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const setTenant = useTenantStore((state) => state.setTenant);

  const { data: tenants, isLoading, isError, error } = useQuery({
    queryKey: ["tenants", token],
    queryFn: () => getTenants(token as string),
    enabled: Boolean(token),
  });

  if (isLoading) {
    return <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Loading tenants...</p>;
  }

  if (isError) {
    return (
      <p className="mt-6 text-sm text-red-600">
        {error instanceof Error ? error.message : "Failed to load tenants."}
      </p>
    );
  }

  if (!tenants?.length) {
    return (
      <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
        No tenants yet. Create one using the form above.
      </p>
    );
  }

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="grid gap-4 border-b border-slate-200 bg-slate-50 p-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 md:grid-cols-[1fr_auto_auto] md:items-center">
        <p>Tenant</p>
        <p>Status</p>
        <p>Action</p>
      </div>
      {tenants.map((tenant) => (
        <div
          key={tenant.id}
          className="grid gap-4 border-b border-slate-100 p-5 last:border-b-0 dark:border-slate-800 md:grid-cols-[1fr_auto_auto] md:items-center"
        >
          <div>
            <p className="font-semibold text-slate-950 dark:text-slate-50">{tenant.name}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {tenant.domains.length > 0 ? tenant.domains.join(", ") : tenant.id}
            </p>
          </div>
          <Badge variant="success">Active</Badge>
          <Button
            variant="outline"
            size="sm"
            className="w-fit rounded-full"
            onClick={() => {
              setTenant({
                id: tenant.id,
                name: tenant.name,
                slug: tenant.id,
                domains: tenant.domains,
              });
              logout();
              router.push("/login");
            }}
          >
            Admin Panel
          </Button>
        </div>
      ))}
    </div>
  );
}

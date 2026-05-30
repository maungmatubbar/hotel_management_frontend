"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllTenantUsers } from "@/lib/tenant-api";
import { useAuthStore } from "@/store/auth-store";

export function TenantUserList() {
  const token = useAuthStore((state) => state.token);

  const { data: users, isLoading, isError, error } = useQuery({
    queryKey: ["tenant-users", token],
    queryFn: () => getAllTenantUsers(token as string),
    enabled: Boolean(token),
  });

  if (isLoading) {
    return <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Loading users...</p>;
  }

  if (isError) {
    return (
      <p className="mt-6 text-sm text-red-600">
        {error instanceof Error ? error.message : "Failed to load tenant users."}
      </p>
    );
  }

  if (!users?.length) {
    return (
      <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
        No tenant users yet. Create one using the form above.
      </p>
    );
  }

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="grid gap-3 border-b border-slate-200 bg-slate-50 p-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 md:grid-cols-5">
        <p>Name</p>
        <p>Tenant</p>
        <p>Email</p>
        <p>Role</p>
        <p>Phone</p>
      </div>
      {users.map((user) => (
        <div
          key={`${user.tenant_id}-${user.id}`}
          className="grid gap-3 border-b border-slate-100 p-5 last:border-b-0 dark:border-slate-800 md:grid-cols-5"
        >
          <p className="font-semibold text-slate-950 dark:text-slate-50">{user.name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user.tenant_id}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">{user.email}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {user.roles.map((role) => role.name).join(", ")}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user.phone_number ?? "—"}</p>
        </div>
      ))}
    </div>
  );
}

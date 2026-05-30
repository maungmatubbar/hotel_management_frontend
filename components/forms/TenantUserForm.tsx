"use client";

import { type FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createTenantUser,
  type TenantUserDataResponse,
  type TenantUserRole,
} from "@/lib/tenant-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth-store";

const initialForm = {
  tenant: "",
  name: "",
  email: "",
  phone_number: "",
  password: "",
  role: "admin" as TenantUserRole,
};

export function TenantUserForm() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const [form, setForm] = useState(initialForm);
  const [createdUser, setCreatedUser] = useState<TenantUserDataResponse | null>(null);

  const userMutation = useMutation({
    mutationFn: () => {
      if (!token) {
        throw new Error("Missing auth token");
      }

      const { tenant, ...payload } = form;

      return createTenantUser(token, tenant, payload);
    },
    onSuccess: (user) => {
      setCreatedUser(user);
      setForm(initialForm);
      void queryClient.invalidateQueries({ queryKey: ["tenant-users", token] });
    },
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    userMutation.mutate();
  }

  return (
    <form className="mt-6 grid gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="user-tenant">Tenant ID</Label>
          <Input
            id="user-tenant"
            value={form.tenant}
            onChange={(event) => setForm((current) => ({ ...current, tenant: event.target.value }))}
            placeholder="hotel-alpha"
            className="mt-2"
            required
          />
        </div>
        <div>
          <Label htmlFor="user-role">Role</Label>
          <select
            id="user-role"
            value={form.role}
            onChange={(event) =>
              setForm((current) => ({ ...current, role: event.target.value as TenantUserRole }))
            }
            className="mt-2 flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-slate-300"
          >
            <option value="admin">admin</option>
            <option value="staff">staff</option>
          </select>
        </div>
        <div>
          <Label htmlFor="user-name">Name</Label>
          <Input
            id="user-name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Tenant User"
            className="mt-2"
            required
          />
        </div>
        <div>
          <Label htmlFor="user-email">Email</Label>
          <Input
            id="user-email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="admin@example.com"
            className="mt-2"
            required
          />
        </div>
        <div>
          <Label htmlFor="user-phone">Phone number</Label>
          <Input
            id="user-phone"
            value={form.phone_number}
            onChange={(event) =>
              setForm((current) => ({ ...current, phone_number: event.target.value }))
            }
            placeholder="017..."
            className="mt-2"
            required
          />
        </div>
        <div>
          <Label htmlFor="user-password">Password</Label>
          <Input
            id="user-password"
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="password"
            className="mt-2"
            required
          />
        </div>
      </div>

      {userMutation.isError ? (
        <p className="text-sm text-red-600">{userMutation.error.message}</p>
      ) : null}

      {createdUser ? (
        <p className="text-sm text-emerald-600">
          Created {createdUser.name} for {createdUser.tenant_id} as{" "}
          {createdUser.roles.map((role) => role.name).join(", ")}.
        </p>
      ) : null}

      <Button className="w-fit rounded-full" disabled={userMutation.isPending}>
        {userMutation.isPending ? "Creating..." : "Create tenant user"}
      </Button>
    </form>
  );
}

"use client";

import { type FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTenant, type TenantDataResponse } from "@/lib/tenant-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth-store";

const initialForm = {
  id: "",
  name: "",
  domain: "",
};

export function TenantForm() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const [form, setForm] = useState(initialForm);
  const [createdTenant, setCreatedTenant] = useState<TenantDataResponse | null>(null);

  const tenantMutation = useMutation({
    mutationFn: () => {
      if (!token) {
        throw new Error("Missing auth token");
      }

      return createTenant(token, form);
    },
    onSuccess: (tenant) => {
      setCreatedTenant(tenant);
      setForm(initialForm);
      void queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    tenantMutation.mutate();
  }

  return (
    <form className="mt-6 grid gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="tenant-id">Tenant ID</Label>
          <Input
            id="tenant-id"
            value={form.id}
            onChange={(event) => setForm((current) => ({ ...current, id: event.target.value }))}
            placeholder="hotel-alpha"
            className="mt-2"
            required
          />
        </div>
        <div>
          <Label htmlFor="tenant-name">Tenant name</Label>
          <Input
            id="tenant-name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Hotel Alpha"
            className="mt-2"
            required
          />
        </div>
        <div>
          <Label htmlFor="tenant-domain">Domain</Label>
          <Input
            id="tenant-domain"
            value={form.domain}
            onChange={(event) => setForm((current) => ({ ...current, domain: event.target.value }))}
            placeholder="alpha.example.com"
            className="mt-2"
            required
          />
        </div>
      </div>

      {tenantMutation.isError ? (
        <p className="text-sm text-red-600">{tenantMutation.error.message}</p>
      ) : null}

      {createdTenant ? (
        <p className="text-sm text-emerald-600">
          Created {createdTenant.name} with {createdTenant.domains.join(", ")}.
        </p>
      ) : null}

      <Button className="w-fit rounded-full" disabled={tenantMutation.isPending}>
        {tenantMutation.isPending ? "Creating..." : "Create tenant"}
      </Button>
    </form>
  );
}

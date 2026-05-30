import { create } from "zustand";
import { persist } from "zustand/middleware";

type Tenant = {
  id: string;
  name: string;
  slug: string;
  domains?: string[];
};

type TenantStore = {
  tenant: Tenant;
  setTenant: (tenant: Tenant) => void;
};

export const useTenantStore = create<TenantStore>()(
  persist(
    (set) => ({
      tenant: {
        id: process.env.NEXT_PUBLIC_TENANT_ID ?? "hotel-alpha",
        name: "Tenant Admin",
        slug: process.env.NEXT_PUBLIC_TENANT_ID ?? "hotel-alpha",
        domains: [],
      },
      setTenant: (tenant) => set({ tenant }),
    }),
    {
      name: "hotelos-tenant",
      skipHydration: true,
    }
  )
);

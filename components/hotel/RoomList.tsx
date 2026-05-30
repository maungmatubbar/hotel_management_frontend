"use client";

import { useQuery } from "@tanstack/react-query";
import { RoomCard } from "@/components/hotel/RoomCard";
import { getTenantRooms } from "@/lib/tenant-api";
import { useAuthStore } from "@/store/auth-store";
import { useTenantStore } from "@/store/tenant-store";

export function RoomList() {
  const token = useAuthStore((state) => state.token);
  const tenant = useTenantStore((state) => state.tenant);

  const { data: rooms, isLoading, isError, error } = useQuery({
    queryKey: ["rooms", token, tenant.id],
    queryFn: () => getTenantRooms(token as string, tenant.id),
    enabled: Boolean(token && tenant.id),
  });

  if (isLoading) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Loading rooms...</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-red-600 dark:text-red-300">
        {error instanceof Error ? error.message : "Failed to load rooms."}
      </p>
    );
  }

  if (!rooms?.length) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        No rooms yet. Create one using the Create room button.
      </p>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  );
}

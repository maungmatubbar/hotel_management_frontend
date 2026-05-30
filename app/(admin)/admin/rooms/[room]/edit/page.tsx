"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { RoomForm } from "@/components/forms/RoomForm";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getRoom } from "@/lib/tenant-api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useTenantStore } from "@/store/tenant-store";

export default function AdminEditRoomPage() {
  const params = useParams<{ room: string }>();
  const token = useAuthStore((state) => state.token);
  const tenant = useTenantStore((state) => state.tenant);
  const roomId = params.room;

  const { data: room, isLoading, isError, error } = useQuery({
    queryKey: ["rooms", "detail", token, tenant.id, roomId],
    queryFn: () => getRoom(token as string, tenant.id, roomId),
    enabled: Boolean(token && tenant.id && roomId),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge variant="success">Room settings</Badge>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
            Edit room
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Update room images, rate, inventory, status, and guest-facing details.
          </p>
        </div>
        <Link href="/admin/rooms" className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")}>
          Back to rooms
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading room...</p>
      ) : null}

      {isError ? (
        <p className="text-sm text-red-600 dark:text-red-300">
          {error instanceof Error ? error.message : "Failed to load room."}
        </p>
      ) : null}

      {room ? <RoomForm mode="edit" room={room} /> : null}
    </div>
  );
}

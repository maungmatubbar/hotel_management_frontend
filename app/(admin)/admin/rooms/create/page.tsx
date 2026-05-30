import Link from "next/link";
import { RoomForm } from "@/components/forms/RoomForm";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminCreateRoomPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge variant="success">New inventory</Badge>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
            Create room
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Add room images, rate, inventory, status, and guest-facing details for a new room type.
          </p>
        </div>
        <Link href="/admin/rooms" className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")}>
          Back to rooms
        </Link>
      </div>

      <RoomForm />
    </div>
  );
}

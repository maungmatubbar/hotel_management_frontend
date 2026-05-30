import Link from "next/link";
import { RoomList } from "@/components/hotel/RoomList";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function AdminRoomsPage() {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-0">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <Badge variant="success">Inventory healthy</Badge>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
              Room inventory
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Create, edit, publish, pause, and monitor availability across all tenant room types.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">Import rooms</Button>
            <Link href="/admin/rooms/create" className={cn(buttonVariants(), "rounded-xl")}>
              Create room
            </Link>
          </div>
        </div>
        <div className="grid border-t border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/60 sm:grid-cols-3">
          {[
            ["42", "total rooms"],
            ["31", "available"],
            ["4", "low inventory"],
          ].map(([value, label]) => (
            <div key={label} className="border-b border-slate-200 p-5 last:border-b-0 dark:border-slate-800 sm:border-b-0 sm:border-r sm:last:border-r-0">
              <p className="text-2xl font-semibold text-slate-950 dark:text-slate-50">{value}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </Card>
      <RoomList />
    </div>
  );
}

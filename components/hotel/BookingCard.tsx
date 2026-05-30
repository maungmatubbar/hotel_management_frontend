import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type BookingCardProps = {
  booking: {
    guest: string;
    room: string;
    date: string;
    status: string;
    total: string;
  };
};

export function BookingCard({ booking }: BookingCardProps) {
  return (
    <Card className="grid gap-4 p-4 transition hover:border-cyan-200 hover:shadow-md dark:hover:border-cyan-900 sm:p-5 md:grid-cols-[1fr_1fr_auto] md:items-center">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {booking.guest
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")}
        </span>
        <div>
          <p className="font-semibold text-slate-950 dark:text-slate-50">{booking.guest}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{booking.room}</p>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{booking.date}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Total {booking.total}</p>
      </div>
      <Badge>
        {booking.status}
      </Badge>
    </Card>
  );
}

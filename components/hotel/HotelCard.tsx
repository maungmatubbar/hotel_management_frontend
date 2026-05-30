import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type HotelCardProps = {
  hotel: {
    name: string;
    slug: string;
    city: string;
    rating: number;
    rooms: number;
    price: string;
    image: string;
    badge: string;
  };
};

export function HotelCard({ hotel }: HotelCardProps) {
  return (
    <Link
      href={`/hotel/${hotel.slug}`}
      className="group block transition hover:-translate-y-1"
    >
      <Card className="overflow-hidden transition group-hover:shadow-xl">
        <div className="relative flex h-56 items-end overflow-hidden bg-linear-to-br from-slate-900 via-slate-700 to-cyan-700 p-5 text-white">
          <div className="absolute right-4 top-4 h-20 w-20 rounded-full bg-cyan-300/25 blur-2xl" />
          <div className="relative">
            <Badge variant="inverted">
              {hotel.badge}
            </Badge>
            <p className="mt-3 text-sm text-white/75">{hotel.image}</p>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">{hotel.name}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{hotel.city}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden text-right text-xs text-slate-500 dark:text-slate-400 sm:block">
                Excellent
              </span>
              <span className="rounded-xl bg-slate-950 px-2.5 py-2 text-sm font-bold text-white dark:bg-cyan-500 dark:text-slate-950">
                {hotel.rating}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {["Free cancellation", "Breakfast", `${hotel.rooms} rooms`].map((item) => (
              <Badge key={item}>{item}</Badge>
            ))}
          </div>

          <div className="mt-6 flex items-end justify-between gap-4 border-t border-slate-200 pt-5 dark:border-slate-800">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              <p>1 night, 2 adults</p>
              <p className="mt-1 text-xs">Includes taxes and fees</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 dark:text-slate-400">From</p>
              <p className="text-2xl font-semibold text-slate-950 dark:text-slate-50">
                {hotel.price}
              </p>
              <span className="mt-3 inline-flex rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-950">
                See availability
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

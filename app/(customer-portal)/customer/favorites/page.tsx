import { HotelCard } from "@/components/hotel/HotelCard";
import { Card } from "@/components/ui/card";
import { hotels } from "@/lib/mock-data";

export default function CustomerFavoritesPage() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-950">Saved hotels</h2>
        <p className="mt-2 text-sm text-slate-600">
          Favorite hotels are ready for quick customer rebooking.
        </p>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        {hotels.map((hotel) => (
          <HotelCard key={hotel.slug} hotel={hotel} />
        ))}
      </div>
    </div>
  );
}

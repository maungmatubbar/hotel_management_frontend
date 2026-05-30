import { HotelCard } from "@/components/hotel/HotelCard";
import { Card } from "@/components/ui/card";
import { hotels } from "@/lib/mock-data";

export default function SuperAdminHotelsPage() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">Hotels</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Platform-wide hotel directory with tenant ownership and publication state.
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

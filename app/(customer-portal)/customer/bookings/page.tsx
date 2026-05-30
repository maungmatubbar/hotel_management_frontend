import { BookingCard } from "@/components/hotel/BookingCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { customerTrips } from "@/lib/mock-data";

export default function CustomerBookingsPage() {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">My bookings</h2>
          <p className="mt-2 text-sm text-slate-600">
            Customer booking history with status, payment amount, and stay details.
          </p>
        </div>
        <div className="flex gap-2">
          {["All", "Upcoming", "Completed"].map((item) => (
            <Button key={item} variant="outline" size="sm" className="rounded-full">
              {item}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {customerTrips.map((trip) => (
          <BookingCard
            key={`${trip.hotel}-${trip.date}`}
            booking={{
              guest: trip.hotel,
              room: trip.room,
              date: trip.date,
              status: trip.status,
              total: trip.amount,
            }}
          />
        ))}
      </div>
    </Card>
  );
}

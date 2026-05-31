import Link from "next/link";
import { RoomCard } from "@/components/hotel/RoomCard";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { hotels, rooms } from "@/lib/mock-data";

type RoomsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function RoomsPage({ params }: RoomsPageProps) {
  const { slug } = await params;
  const hotel = hotels.find((item) => item.slug === slug) ?? hotels[0];

  return (
    <main className="hotel-page-bg">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href={`/hotel/${hotel.slug}`} className="text-sm font-semibold text-slate-600">
              Back to {hotel.name}
            </Link>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
              Rooms and rates
            </h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Customer room listing UI with availability filters, amenities, and clear booking CTAs.
            </p>
          </div>
          <Link
            href={`/hotel/${hotel.slug}/booking`}
            className="rounded-lg bg-slate-950 px-6 py-3 text-center text-sm font-semibold text-white"
          >
            Continue to checkout
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="grid gap-3 md:grid-cols-4">
            {["Check in", "Check out", "Guests", "Room type"].map((label) => (
              <div key={label} className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {label}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-700">Select {label.toLowerCase()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard key={room.name} room={room} />
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}

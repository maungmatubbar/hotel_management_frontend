import Link from "next/link";
import { HotelCard } from "@/components/hotel/HotelCard";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { hotels, rooms } from "@/lib/mock-data";

type HotelDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function HotelDetailsPage({ params }: HotelDetailsPageProps) {
  const { slug } = await params;
  const hotel = hotels.find((item) => item.slug === slug) ?? hotels[0];

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-slate-950 text-white shadow-2xl shadow-slate-200">
          <div className="grid gap-8 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">
                {hotel.city}
              </p>
              <h1 className="mt-4 text-5xl font-semibold tracking-tight">{hotel.name}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/65">
                Tenant-aware hotel detail page with room discovery, availability preview,
                and a booking path designed for OTP customers.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/hotel/${hotel.slug}/rooms`}
                  className="rounded-lg bg-white px-6 py-3 text-center text-sm font-semibold text-slate-950"
                >
                  View rooms
                </Link>
                <Link
                  href={`/hotel/${hotel.slug}/booking`}
                  className="rounded-lg border border-white/20 px-6 py-3 text-center text-sm font-semibold text-white"
                >
                  Start booking
                </Link>
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-white/10 p-4">
                  <p className="text-white/55">Rating</p>
                  <strong className="mt-2 block text-2xl">{hotel.rating}</strong>
                </div>
                <div className="rounded-xl bg-white/10 p-4">
                  <p className="text-white/55">Rooms</p>
                  <strong className="mt-2 block text-2xl">{hotel.rooms}</strong>
                </div>
                <div className="col-span-2 rounded-xl bg-white p-4 text-slate-950">
                  <p className="text-sm text-slate-500">Starting from</p>
                  <strong className="mt-2 block text-3xl">{hotel.price}/night</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.65fr_0.35fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-2xl font-semibold text-slate-950">Availability snapshot</h2>
            <div className="mt-6 grid grid-cols-7 gap-2 text-center text-sm">
              {Array.from({ length: 14 }, (_, index) => (
                <div
                  key={index}
                  className={`rounded-xl p-3 ${
                    index % 5 === 0 ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </section>
          <HotelCard hotel={hotel} />
        </div>

        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-950">Room highlights</h2>
            <Link href={`/hotel/${hotel.slug}/rooms`} className="text-sm font-semibold text-slate-700">
              See all
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {rooms.map((room) => (
              <div key={room.name} className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="font-semibold text-slate-950">{room.name}</p>
                <p className="mt-2 text-sm text-slate-500">{room.capacity}</p>
              </div>
            ))}
          </div>
        </section>
      </section>
      <Footer />
    </main>
  );
}

import Link from "next/link";
import { BookingForm } from "@/components/forms/BookingForm";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { hotels } from "@/lib/mock-data";

type BookingPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{
    check_in?: string;
    check_out?: string;
    guests?: string;
    room_id?: string;
    total_amount?: string;
    invoice?: string;
    invoice_id?: string;
  }>;
};

export default async function BookingPage({ params, searchParams }: BookingPageProps) {
  const { slug } = await params;
  const bookingDetails = await searchParams;
  const hotel = hotels.find((item) => item.slug === slug) ?? hotels[0];
  const invoiceId = bookingDetails?.invoice ?? bookingDetails?.invoice_id;

  return (
    <main>
      <Navbar />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.58fr_0.42fr] lg:px-8">
        <div>
          <Link href={`/hotel/${hotel.slug}/rooms`} className="text-sm font-semibold text-slate-600">
            Back to rooms
          </Link>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
            Complete your booking
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Review your stay details, add customer information, choose Pay now or Pay later,
            then proceed with the booking.
          </p>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-slate-950">Availability calendar</h2>
            <div className="mt-5 grid grid-cols-7 gap-2 text-center text-sm">
              {Array.from({ length: 28 }, (_, index) => (
                <button
                  key={index}
                  className={`rounded-xl p-3 font-medium ${
                    index > 18 && index < 23
                      ? "bg-slate-950 text-white"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside>
          <BookingForm
            hotelName={hotel.name}
            hotelPrice={bookingDetails?.total_amount ? `Tk ${Number(bookingDetails.total_amount).toLocaleString("en-BD")}` : hotel.price}
            defaultValues={{
              checkIn: bookingDetails?.check_in,
              checkOut: bookingDetails?.check_out,
              guests: bookingDetails?.guests,
              roomId: bookingDetails?.room_id,
            }}
            initialInvoiceId={invoiceId}
            initialInvoiceIsSslcommerzSuccess={Boolean(bookingDetails?.invoice_id)}
          />
        </aside>
      </section>
      <Footer />
    </main>
  );
}

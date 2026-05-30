import Link from "next/link";
import { AdminBookingForm } from "@/components/forms/AdminBookingForm";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminCreateBookingPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge variant="success">New booking</Badge>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
            Add guest booking
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Create a booking with required guest, phone, address, room, stay, and payment details. Email is optional.
          </p>
        </div>
        <Link href="/admin/bookings" className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")}>
          Back to bookings
        </Link>
      </div>

      <AdminBookingForm />
    </div>
  );
}

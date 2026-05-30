"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CreditCard, Hash, Mail, MapPin, Phone, ReceiptText, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getTenantBooking, type BookingDataResponse } from "@/lib/tenant-api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useTenantStore } from "@/store/tenant-store";

function formatTk(amount: number) {
  return `Tk ${amount.toLocaleString("en-BD")}`;
}

function parseAmount(amount: string | number | undefined) {
  if (typeof amount === "number") {
    return amount;
  }

  return Number((amount ?? "").replace(/[^\d]/g, "")) || 0;
}

function getBookingDate(booking: BookingDataResponse, key: "check_in" | "check_out") {
  if (key === "check_in") {
    return booking.check_in ?? booking.check_in_date ?? "";
  }

  return booking.check_out ?? booking.check_out_date ?? "";
}

function formatBookingTotal(booking: BookingDataResponse) {
  const invoiceTotal = booking.invoice?.total_amount;

  if (invoiceTotal) {
    return formatTk(parseAmount(invoiceTotal));
  }

  const total = booking.total ?? booking.total_price;

  if (total) {
    return typeof total === "number" ? formatTk(total) : String(total);
  }

  return formatTk(0);
}

function formatMoney(amount: string | number | undefined) {
  if (!amount) {
    return undefined;
  }

  return formatTk(parseAmount(amount));
}

function getStayDateRange(booking: BookingDataResponse) {
  return [getBookingDate(booking, "check_in"), getBookingDate(booking, "check_out")]
    .filter(Boolean)
    .join(" - ");
}

function DetailItem({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-950/60 dark:shadow-black/20">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 wrap-break-word text-sm font-semibold text-slate-950 dark:text-slate-50">
        {value || "Not set"}
      </p>
    </div>
  );
}

function SummaryItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-white backdrop-blur">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">{label}</p>
        <p className="mt-1 text-sm font-semibold">{value || "Not set"}</p>
      </div>
    </div>
  );
}

function InvoiceRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0 dark:border-slate-800">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <strong className="text-right text-sm text-slate-950 dark:text-slate-50">{value || "Not set"}</strong>
    </div>
  );
}

export default function AdminBookingDetailPage() {
  const params = useParams<{ booking: string }>();
  const token = useAuthStore((state) => state.token);
  const tenant = useTenantStore((state) => state.tenant);
  const bookingId = params.booking;

  const { data: booking, isLoading, isError, error } = useQuery({
    queryKey: ["bookings", "detail", token, tenant.id, bookingId],
    queryFn: () => getTenantBooking(token as string, tenant.id, bookingId),
    enabled: Boolean(token && tenant.id && bookingId),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge variant="success">Booking details</Badge>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
            View booking
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Guest contact, room number, stay dates, and invoice summary.
          </p>
        </div>
        <Link href="/admin/bookings" className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")}>
          Back to bookings
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading booking...</p>
      ) : null}

      {isError ? (
        <p className="text-sm text-red-600 dark:text-red-300">
          {error instanceof Error ? error.message : "Failed to load booking."}
        </p>
      ) : null}

      {booking ? (
        <div className="space-y-6">
          <Card className="overflow-hidden border-0 bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 p-0 text-white shadow-xl shadow-slate-900/20">
            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="success">{booking.invoice?.status ?? booking.status ?? "Pending"}</Badge>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                      Booking #{booking.id}
                    </span>
                    {booking.invoice?.invoice_number ? (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                        {booking.invoice.invoice_number}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                    {booking.guest_name ?? "Guest"}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                    {booking.room ?? "Room not set"}{" "}
                    {booking.assigned_room_number ? `· Room ${booking.assigned_room_number}` : ""}
                  </p>
                </div>
                <div className="rounded-3xl border border-white/15 bg-white/10 p-5 text-right backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">Total amount</p>
                  <p className="mt-2 text-3xl font-bold">{formatBookingTotal(booking)}</p>
                  <p className="mt-1 text-sm text-slate-300">
                    Due {formatMoney(booking.invoice?.amount_due) ?? formatBookingTotal(booking)}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <SummaryItem icon={Phone} label="Phone" value={booking.guest_phone ?? booking.phone_number} />
                <SummaryItem icon={Mail} label="Email" value={booking.guest_email ?? booking.email} />
                <SummaryItem icon={CalendarDays} label="Stay" value={getStayDateRange(booking)} />
                <SummaryItem icon={Hash} label="Room number" value={booking.assigned_room_number} />
              </div>
            </div>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <Card className="p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-200">
                    <UserRound className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">Guest information</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Contact and identity details</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <DetailItem label="Guest name" value={booking.guest_name} />
                  <DetailItem label="Phone" value={booking.guest_phone ?? booking.phone_number} />
                  <DetailItem label="Email" value={booking.guest_email ?? booking.email} />
                  <DetailItem label="Address" value={booking.guest_address ?? booking.address} />
                  <DetailItem label="NID number" value={booking.nid_number} />
                  <DetailItem label="Promo code" value={booking.promo_code} />
                </div>
              </Card>

              <Card className="p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-200">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">Stay details</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Room, dates, and assignment</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <DetailItem label="Room" value={booking.room} />
                  <DetailItem label="Room number" value={booking.assigned_room_number} />
                  <DetailItem label="Room quantity" value={booking.room_quantity} />
                  <DetailItem label="Dates" value={getStayDateRange(booking)} />
                </div>
              </Card>

              <Card className="overflow-hidden p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <ReceiptText className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">NID document</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Uploaded guest identity image</p>
                  </div>
                </div>
                {booking.nid_image_url ? (
                  <a
                    href={booking.nid_image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 block overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={booking.nid_image_url} alt="Guest NID" className="h-72 w-full object-cover transition hover:scale-[1.01]" />
                  </a>
                ) : (
                  <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                    No NID image uploaded.
                  </p>
                )}
              </Card>
            </div>

            <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
              <Card className="p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                    <CreditCard className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">Invoice summary</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {booking.invoice?.invoice_number ?? "No invoice number"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
                  <InvoiceRow label="Subtotal" value={formatMoney(booking.invoice?.subtotal)} />
                  <InvoiceRow label="Discount" value={formatMoney(booking.invoice?.discount ?? booking.discount)} />
                  <InvoiceRow label="Amount paid" value={formatMoney(booking.invoice?.amount_paid)} />
                  <InvoiceRow label="Amount due" value={formatMoney(booking.invoice?.amount_due)} />
                  <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl bg-cyan-50 px-4 py-3 dark:bg-cyan-950/40">
                    <span className="text-sm font-semibold text-cyan-700 dark:text-cyan-200">Total</span>
                    <strong className="text-lg text-slate-950 dark:text-slate-50">{formatBookingTotal(booking)}</strong>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  <DetailItem label="Invoice status" value={booking.invoice?.status ?? booking.status} />
                  <DetailItem label="Issued at" value={booking.invoice?.issued_at} />
                  <DetailItem label="Due at" value={booking.invoice?.due_at} />
                </div>
              </Card>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

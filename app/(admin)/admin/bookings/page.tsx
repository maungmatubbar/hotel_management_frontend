"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getTenantBookings, type BookingDataResponse, type BookingFilters } from "@/lib/tenant-api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useTenantStore } from "@/store/tenant-store";

const initialFilters: BookingFilters = {
  booking_number: "",
  customer_name: "",
  phone_number: "",
  customer_email: "",
};

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

function formatStayDate(booking: BookingDataResponse) {
  const checkIn = getBookingDate(booking, "check_in");
  const checkOut = getBookingDate(booking, "check_out");

  if (!checkIn && !checkOut) {
    return "Date not set";
  }

  return [checkIn, checkOut].filter(Boolean).join(" - ");
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

function getBookingView(booking: BookingDataResponse) {
  const guest = booking.guest_name ?? "Guest";
  const roomCount = Number(booking.room_quantity) || 1;
  const roomName = booking.room ?? "Room not set";
  const assignedRoomNumber = booking.assigned_room_number?.trim();

  return {
    id: booking.id,
    guest,
    initials: guest
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase(),
    email: booking.guest_email ?? booking.email ?? "No email",
    phone: booking.guest_phone ?? booking.phone_number ?? "No phone",
    address: booking.guest_address ?? booking.address ?? "No address",
    roomName,
    assignedRoomNumber,
    roomCount,
    date: formatStayDate(booking),
    status: booking.status ?? booking.invoice?.status ?? "Pending",
    total: formatBookingTotal(booking),
  };
}

export default function AdminBookingsPage() {
  const token = useAuthStore((state) => state.token);
  const tenant = useTenantStore((state) => state.tenant);
  const [page, setPage] = useState(1);
  const [filterForm, setFilterForm] = useState<BookingFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<BookingFilters>(initialFilters);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const { data: bookingPage, isLoading, isError, error } = useQuery({
    queryKey: ["bookings", token, tenant.id, page, appliedFilters],
    queryFn: () => getTenantBookings(token as string, tenant.id, { page, filters: appliedFilters }),
    enabled: Boolean(token && tenant.id),
  });

  const bookings = bookingPage?.data ?? [];
  const bookingRows = (bookings ?? []).map(getBookingView);
  const bookedRevenue = bookingRows.reduce((total, booking) => total + parseAmount(booking.total), 0);
  const pendingCount = bookingRows.filter((booking) => booking.status.toLowerCase() === "pending").length;
  const todayInputDate = new Date().toISOString().slice(0, 10);
  const arrivalsToday = (bookings ?? []).filter(
    (booking) => getBookingDate(booking, "check_in") === todayInputDate
  ).length;
  const activeFilterCount = Object.values(appliedFilters).filter((value) => value?.trim()).length;

  function openFilterModal() {
    setFilterForm(appliedFilters);
    setIsFilterModalOpen(true);
  }

  function closeFilterModal() {
    setFilterForm(appliedFilters);
    setIsFilterModalOpen(false);
  }

  function updateFilter(key: keyof BookingFilters, value: string) {
    setFilterForm((current) => ({ ...current, [key]: value }));
  }

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setAppliedFilters(filterForm);
    setIsFilterModalOpen(false);
  }

  function resetFilters() {
    setFilterForm(initialFilters);
    setAppliedFilters(initialFilters);
    setPage(1);
    setIsFilterModalOpen(false);
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-4 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge variant="success">{bookingPage?.total ?? bookingRows.length} active bookings</Badge>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
              Bookings management
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Search, filter, update status, and manage guest booking lifecycle.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["All", "Pending", "Confirmed"].map((filter) => (
              <Button
                key={filter}
                variant="outline"
                size="sm"
                className="shrink-0 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                {filter}
              </Button>
            ))}
            <Link href="/admin/bookings/create" className={cn(buttonVariants(), "rounded-full px-4 py-2")}>
              Create booking
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            [formatTk(bookedRevenue), "booked revenue"],
            [String(pendingCount), "pending requests"],
            [String(arrivalsToday), "arrivals today"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/70"
            >
              <p className="text-xl font-semibold text-slate-950 dark:text-slate-50">{value}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Card className="overflow-hidden border-slate-200 shadow-none dark:border-slate-800">
            <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900/80 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
                  Recent bookings
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Guest contact, address, stay details, and payment overview.
                </p>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-0">
                <Button type="button" variant="outline" className="rounded-full" onClick={openFilterModal}>
                  <SlidersHorizontal className="h-4 w-4" />
                  Filter
                  {activeFilterCount ? (
                    <span className="ml-1 rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-bold text-cyan-700 dark:bg-cyan-950 dark:text-cyan-200">
                      {activeFilterCount}
                    </span>
                  ) : null}
                </Button>
                {activeFilterCount ? (
                  <Button type="button" variant="ghost" className="rounded-full" onClick={resetFilters}>
                    Clear filters
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="overflow-x-auto">
              {isLoading ? (
                <p className="px-5 py-6 text-sm text-slate-500 dark:text-slate-400">Loading bookings...</p>
              ) : null}
              {isError ? (
                <p className="px-5 py-6 text-sm text-red-600 dark:text-red-300">
                  {error instanceof Error ? error.message : "Failed to load bookings."}
                </p>
              ) : null}
              {!isLoading && !isError && !bookingRows.length ? (
                <p className="px-5 py-6 text-sm text-slate-500 dark:text-slate-400">
                  No bookings yet. Create one using the Create booking button.
                </p>
              ) : null}
              {!isLoading && !isError && bookingRows.length ? (
              <table className="min-w-[1040px] w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.16em] text-slate-500 dark:bg-slate-950/70 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Guest</th>
                    <th className="px-5 py-4 font-semibold">Contact</th>
                    <th className="px-5 py-4 font-semibold">Address</th>
                    <th className="px-5 py-4 font-semibold">Stay</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 text-right font-semibold">Total</th>
                    <th className="px-5 py-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {bookingRows.map((booking) => (
                    <tr key={booking.id} className="bg-white transition hover:bg-cyan-50/60 dark:bg-slate-900/70 dark:hover:bg-cyan-950/20">
                      <td className="px-5 py-4 align-top">
                        <div className="flex items-center gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-sm font-bold text-cyan-700 ring-1 ring-cyan-100 dark:bg-cyan-950 dark:text-cyan-200 dark:ring-cyan-900">
                            {booking.initials}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-950 dark:text-slate-50">{booking.guest}</p>
                            <p className="mt-1 text-slate-500 dark:text-slate-400">
                              {booking.roomName}
                              {booking.assignedRoomNumber ? ` · Room ${booking.assignedRoomNumber}` : ""}
                              {" · "}
                              {booking.roomCount} {booking.roomCount > 1 ? "rooms" : "room"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <p className="font-medium text-slate-800 dark:text-slate-100">{booking.email}</p>
                        <p className="mt-1 text-slate-500 dark:text-slate-400">{booking.phone}</p>
                      </td>
                      <td className="max-w-[240px] px-5 py-4 align-top text-slate-600 dark:text-slate-300">
                        {booking.address}
                      </td>
                      <td className="px-5 py-4 align-top">
                        <p className="font-medium text-slate-800 dark:text-slate-100">{booking.date}</p>
                        <p className="mt-1 text-slate-500 dark:text-slate-400">
                          {booking.assignedRoomNumber
                            ? `Room ${booking.assignedRoomNumber}`
                            : "Room number not assigned"}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <Badge variant={booking.status === "Confirmed" || booking.status === "Checked in" ? "success" : "warning"}>
                          {booking.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right align-top font-semibold text-slate-950 dark:text-slate-50">
                        {booking.total}
                      </td>
                      <td className="px-5 py-4 text-right align-top">
                        <Link
                          href={`/admin/bookings/${booking.id}`}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              ) : null}
            </div>

            {bookingPage ? (
              <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Showing {bookingPage.from ?? 0}-{bookingPage.to ?? 0} of {bookingPage.total} bookings
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!bookingPage.prev_page_url || isLoading}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    Previous
                  </Button>
                  <span className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Page {bookingPage.current_page} of {bookingPage.last_page}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!bookingPage.next_page_url || isLoading}
                    onClick={() => setPage((current) => Math.min(bookingPage.last_page, current + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      </Card>

      {isFilterModalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4">
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-filter-title"
            className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
            onSubmit={applyFilters}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-800">
              <div>
                <span className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-cyan-700 dark:bg-cyan-950 dark:text-cyan-200">
                  Booking filters
                </span>
                <h3 id="booking-filter-title" className="mt-3 text-xl font-semibold text-slate-950 dark:text-slate-50">
                  Find the right booking fast
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Search by booking number, guest details, phone, or email.
                </p>
              </div>
              <button
                type="button"
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-50"
                aria-label="Close booking filter modal"
                onClick={closeFilterModal}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                Booking number
                <Input
                  placeholder="Search booking number"
                  value={filterForm.booking_number}
                  onChange={(event) => updateFilter("booking_number", event.target.value)}
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                Customer name
                <Input
                  placeholder="Search customer name"
                  value={filterForm.customer_name}
                  onChange={(event) => updateFilter("customer_name", event.target.value)}
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                Phone number
                <Input
                  placeholder="Search phone number"
                  value={filterForm.phone_number}
                  onChange={(event) => updateFilter("phone_number", event.target.value)}
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                Customer email
                <Input
                  placeholder="Search customer email"
                  value={filterForm.customer_email}
                  onChange={(event) => updateFilter("customer_email", event.target.value)}
                />
              </label>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" className="rounded-full" onClick={resetFilters}>
                Reset
              </Button>
              <Button type="button" variant="ghost" className="rounded-full" onClick={closeFilterModal}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-full">
                Apply filters
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BedDouble,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Headphones,
  Hotel,
  Images,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTenantWebsiteRooms, type RoomDataResponse } from "@/lib/tenant-api";
import { hotels } from "@/lib/mock-data";
import { useAuthStore } from "@/store/auth-store";
import { useTenantStore } from "@/store/tenant-store";

const hotelStats = [
  ["Live", "tenant room inventory"],
  ["24/7", "guest booking access"],
  ["Secure", "invoice and payment flow"],
];

const proofPoints = ["Live rates", "Room photos", "Secure checkout", "Front desk ready"];

const managementFeatures = [
  {
    title: "Live room inventory",
    description: "Keep room types, capacity, rates, images, and availability aligned with the tenant dashboard.",
    icon: BedDouble,
  },
  {
    title: "Guest booking workflow",
    description: "Guide guests from date selection to room choice, customer details, invoice, and payment option.",
    icon: ClipboardList,
  },
  {
    title: "Secure payments",
    description: "Support pay-now and pay-later journeys with public invoice tracking and gateway redirects.",
    icon: CreditCard,
  },
  {
    title: "Operational clarity",
    description: "Give hotel teams a clean view of booking demand, room availability, and guest communication.",
    icon: Headphones,
  },
];

function getTodayInputDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDaysToInputDate(date: string, days: number) {
  const sourceDate = new Date(date);

  if (Number.isNaN(sourceDate.getTime())) {
    return "";
  }

  sourceDate.setDate(sourceDate.getDate() + days);
  const year = sourceDate.getFullYear();
  const month = String(sourceDate.getMonth() + 1).padStart(2, "0");
  const day = String(sourceDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getRoomLabel(room: RoomDataResponse) {
  return room.room_name || `Room ${room.id}`;
}

function parseAmount(amount: string | number | undefined) {
  if (typeof amount === "number") {
    return amount;
  }

  return Number((amount ?? "").replace(/[^\d.-]/g, "")) || 0;
}

function formatTk(amount: number) {
  return `Tk ${amount.toLocaleString("en-BD")}`;
}

function getStayNights(checkIn: string, checkOut: string) {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (!checkIn || !checkOut || Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
    return 0;
  }

  return Math.max(0, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / 86_400_000));
}

function formatRoomType(roomType: string | undefined) {
  if (!roomType) {
    return "Room";
  }

  if (roomType === "ac") {
    return "AC room";
  }

  if (roomType === "non_ac") {
    return "Non AC room";
  }

  return roomType.replaceAll("_", " ");
}

function formatCapacity(capacity: string | undefined) {
  if (!capacity) {
    return "Guest capacity";
  }

  return /\D/.test(capacity) ? capacity : `${capacity} guest${capacity === "1" ? "" : "s"}`;
}

function getRoomImages(room: RoomDataResponse) {
  return room.image_urls?.length ? room.image_urls : room.images;
}

function isRoomBookable(room: RoomDataResponse) {
  return room.status?.toLowerCase() !== "inactive" && Number(room.available_rooms) !== 0;
}

export default function CustomerHomePage() {
  const token = useAuthStore((state) => state.token);
  const tenant = useTenantStore((state) => state.tenant);
  const todayInputDate = getTodayInputDate();
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [checkIn, setCheckIn] = useState(todayInputDate);
  const [checkOut, setCheckOut] = useState(addDaysToInputDate(todayInputDate, 1));
  const {
    data: tenantRooms,
    isLoading: isLoadingRooms,
    isError: isRoomsError,
    error: roomsError,
  } = useQuery({
    queryKey: ["rooms", token, tenant.id],
    queryFn: () => getTenantWebsiteRooms(tenant.id, token),
    enabled: Boolean(tenant.id),
  });
  const rooms = tenantRooms ?? [];
  const availableRooms = rooms.filter(isRoomBookable);
  const selectedRoom = tenantRooms?.find((room) => String(room.id) === selectedRoomId);
  const stayNights = getStayNights(checkIn, checkOut);
  const totalAmount = parseAmount(selectedRoom?.rate) * stayNights;
  const bookingSlug = hotels[0].slug;
  const startingRate = availableRooms.reduce<number | null>((lowestRate, room) => {
    const rate = parseAmount(room.rate);

    if (!rate) {
      return lowestRate;
    }

    return lowestRate === null ? rate : Math.min(lowestRate, rate);
  }, null);
  const totalRoomCount = rooms.reduce((count, room) => count + (Number(room.available_rooms) || 0), 0);

  function getBookingHref(room: RoomDataResponse) {
    const params = new URLSearchParams({
      check_in: checkIn,
      check_out: checkOut,
      guests: String(Number(room.capacity) || 1),
      room_id: String(room.id),
    });
    const amount = parseAmount(room.rate) * Math.max(stayNights, 1);

    if (amount > 0) {
      params.set("total_amount", String(amount));
    }

    return `/hotel/${bookingSlug}/booking?${params.toString()}`;
  }

  return (
    <main className="hotel-page-bg overflow-hidden text-slate-950 dark:text-slate-50">
      <Navbar />
      <section className="relative bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_34%),radial-gradient(circle_at_84%_12%,rgba(245,158,11,0.18),transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(15,23,42,0.82))]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-[#fffbea] to-transparent dark:from-[#020617]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-28 pt-14 sm:px-6 lg:px-8 lg:pt-20">
          <div className="grid gap-12 lg:grid-cols-[1fr_0.74fr] lg:items-center">
            <div className="max-w-3xl">
              <Badge variant="inverted" className="px-4 py-2 text-sm ring-1 ring-white/15">
                Premium hotel booking experience
              </Badge>
              <h1 className="mt-6 text-5xl font-semibold tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                A polished hotel website for rooms, bookings, and payments.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">
                Let guests browse live room inventory, choose dates, compare rates, and continue
                to a secure booking flow that stays connected with hotel operations.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#rooms"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-slate-950 shadow-xl shadow-cyan-950/20 transition hover:-translate-y-0.5 hover:bg-slate-100"
                >
                  <Search className="h-4 w-4" />
                  View available rooms
                </a>
                <a
                  href="#management"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
                >
                  <Hotel className="h-4 w-4" />
                  Explore operations
                </a>
              </div>
              <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/70">
                {proofPoints.map((point) => (
                  <span key={point} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                    <CheckCircle2 className="h-4 w-4 text-cyan-200" />
                    {point}
                  </span>
                ))}
              </div>
            </div>

            <Card className="border-white/10 bg-white/10 p-4 text-white shadow-2xl shadow-slate-950/40 backdrop-blur dark:bg-white/10 sm:p-5">
              <div className="overflow-hidden rounded-3xl bg-white text-slate-950 shadow-2xl">
                <div className="bg-linear-to-br from-cyan-500 via-slate-900 to-amber-500 p-6 text-white">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="inverted">Today&apos;s overview</Badge>
                    <ShieldCheck className="h-5 w-5 text-cyan-100" />
                  </div>
                  <p className="mt-12 text-sm text-white/70">Room inventory</p>
                  <p className="mt-2 text-4xl font-semibold tracking-tight">
                    {isLoadingRooms ? "..." : `${availableRooms.length} room types`}
                  </p>
                  <p className="mt-2 text-sm text-white/75">
                    {totalRoomCount ? `${totalRoomCount} rooms ready to sell online` : "Connect a tenant to load live rooms"}
                  </p>
                </div>
                <div className="space-y-3 p-5">
                  {[
                    ["Check-in ready", "Guests can choose dates and reserve from live rooms."],
                    ["Invoice supported", "Bookings can continue to pay now or pay later."],
                    ["Management friendly", "Room details stay aligned with tenant inventory."],
                  ].map(([title, description]) => (
                    <div key={title} className="flex gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                      <div>
                        <p className="text-sm font-semibold">{title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <Card className="-mb-28 mt-10 border-0 bg-white/95 p-2 shadow-2xl shadow-slate-950/25 backdrop-blur dark:bg-slate-900/95">
            <form
              action={`/hotel/${bookingSlug}/booking`}
              className="grid gap-1.5 rounded-2xl md:grid-cols-2 lg:grid-cols-[1fr_1fr_0.75fr_0.75fr_auto] lg:items-stretch"
            >
              <div className="rounded-xl bg-white p-2.5 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
                <Label htmlFor="check-in" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <CalendarDays className="h-4 w-4" />
                  Check in
                </Label>
                <Input
                  id="check-in"
                  name="check_in"
                  type="date"
                  value={checkIn}
                  min={todayInputDate}
                  onChange={(event) => {
                    setCheckIn(event.target.value);
                    if (checkOut && event.target.value > checkOut) {
                      setCheckOut("");
                    }
                  }}
                  className="mt-1 h-10 border-slate-200"
                  required
                />
              </div>

              <div className="rounded-xl bg-white p-2.5 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
                <Label htmlFor="check-out" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <CalendarDays className="h-4 w-4" />
                  Check out
                </Label>
                <Input
                  id="check-out"
                  name="check_out"
                  type="date"
                  value={checkOut}
                  min={checkIn || todayInputDate}
                  onChange={(event) => setCheckOut(event.target.value)}
                  className="mt-1 h-10 border-slate-200"
                  required
                />
              </div>

              <div className="rounded-xl bg-white p-2.5 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
                <Label htmlFor="guests" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <Users className="h-4 w-4" />
                  Guests
                </Label>
                <Input
                  id="guests"
                  name="guests"
                  type="number"
                  min="1"
                  value={String(Number(selectedRoom?.capacity) || 2)}
                  readOnly
                  className="mt-1 h-10 border-slate-200"
                  required
                />
              </div>

              <div className="rounded-xl bg-white p-2.5 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
                <Label htmlFor="room-id" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <BedDouble className="h-4 w-4" />
                  Available rooms
                </Label>
                <select
                  id="room-id"
                  name="room_id"
                  value={selectedRoomId}
                  onChange={(event) => setSelectedRoomId(event.target.value)}
                  className="mt-1 flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-950 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-slate-300"
                  disabled={isLoadingRooms || isRoomsError || !availableRooms.length}
                  required
                >
                  <option value="">
                    {isLoadingRooms ? "Loading rooms..." : "Select a room"}
                  </option>
                  {availableRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {getRoomLabel(room)} - {formatTk(parseAmount(room.rate))}
                    </option>
                  ))}
                </select>
                {isRoomsError ? (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                    {roomsError instanceof Error ? roomsError.message : "Failed to load rooms."}
                  </p>
                ) : null}
                {selectedRoom ? (
                  <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Total: {formatTk(totalAmount)} {stayNights ? `for ${stayNights} night${stayNights > 1 ? "s" : ""}` : ""}
                  </p>
                ) : null}
              </div>

              <input type="hidden" name="total_amount" value={totalAmount ? String(totalAmount) : ""} />

              <Button
                type="submit"
                className="min-h-10 self-start rounded-xl bg-cyan-700 px-4 text-sm text-white shadow-lg shadow-cyan-900/20 hover:bg-cyan-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400 lg:mt-[29px]"
                disabled={!selectedRoom || !checkIn || !checkOut}
              >
                <Search className="h-4 w-4" />
                Check availability
              </Button>
            </form>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 pt-20 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {hotelStats.map(([value, label]) => (
            <Card key={label} className="p-6 shadow-lg shadow-slate-200/60 dark:shadow-black/20">
              <p className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">{value}</p>
              <p className="mt-2 text-sm font-medium capitalize text-slate-500 dark:text-slate-400">{label}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="management" className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <Badge variant="success">Built for hotel teams</Badge>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
              Everything your property needs to run smoother
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              From room setup to checkout, the website stays connected with the tenant room endpoint.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {managementFeatures.map((feature) => (
            <Card key={feature.title} className="group p-5 shadow-lg shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-xl dark:shadow-black/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white transition group-hover:bg-cyan-700 dark:bg-slate-50 dark:text-slate-950">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-semibold text-slate-950 dark:text-slate-50">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="rooms" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_0.45fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Live room selection
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
              Available rooms from your hotel inventory
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              These cards are loaded from the rooms endpoint, so guests see current rates,
              room types, capacity, amenities, images, and availability.
            </p>
          </div>
          <Card className="p-5 shadow-lg shadow-slate-200/60 dark:shadow-black/20">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                  {startingRate ? `Starting from ${formatTk(startingRate)}` : "Rates update live"}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Select dates above or book directly from a room card.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {isLoadingRooms ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="h-64 animate-pulse bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-10 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              </Card>
            ))}
          </div>
        ) : null}

        {isRoomsError ? (
          <Card className="p-6">
            <p className="text-sm font-semibold text-red-600 dark:text-red-300">
              {roomsError instanceof Error ? roomsError.message : "Failed to load rooms."}
            </p>
          </Card>
        ) : null}

        {!isLoadingRooms && !isRoomsError && !availableRooms.length ? (
          <Card className="p-8 text-center">
            <BedDouble className="mx-auto h-10 w-10 text-slate-400" />
            <h3 className="mt-4 text-xl font-semibold text-slate-950 dark:text-slate-50">
              No rooms are available yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              Once room inventory is created for this tenant, guests will be able to compare
              rooms and continue to booking from this section.
            </p>
          </Card>
        ) : null}

        {!isLoadingRooms && !isRoomsError && availableRooms.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availableRooms.map((room) => {
              const images = getRoomImages(room);
              const coverImage = images[0];
              const roomRate = parseAmount(room.rate);

              return (
                <Card key={room.id} className="group overflow-hidden shadow-lg shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-xl dark:shadow-black/20">
                  <div
                    className="relative flex h-64 items-end overflow-hidden bg-linear-to-br from-slate-900 via-slate-700 to-cyan-700 bg-cover bg-center p-5 text-white"
                    style={coverImage ? { backgroundImage: `url(${coverImage})` } : undefined}
                  >
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                    {!coverImage ? (
                      <div className="absolute inset-0 grid place-items-center text-white/70">
                        <div className="text-center">
                          <Images className="mx-auto h-8 w-8" />
                          <p className="mt-2 text-sm font-medium">Room image coming soon</p>
                        </div>
                      </div>
                    ) : null}
                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      <Badge variant="inverted" className="capitalize">
                        {room.status.replaceAll("_", " ")}
                      </Badge>
                      {room.available_rooms ? (
                        <Badge variant="inverted">
                          {room.available_rooms} available
                        </Badge>
                      ) : null}
                    </div>
                    <div className="relative">
                      <p className="text-sm font-semibold text-cyan-100">{formatRoomType(room.room_type)}</p>
                      <h3 className="mt-2 text-2xl font-semibold">{getRoomLabel(room)}</h3>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap gap-2">
                      <Badge>
                        <Users className="mr-1 h-3.5 w-3.5" />
                        {formatCapacity(room.capacity)}
                      </Badge>
                      <Badge>
                        <CalendarCheck className="mr-1 h-3.5 w-3.5" />
                        {stayNights || 1} night{(stayNights || 1) > 1 ? "s" : ""}
                      </Badge>
                    </div>

                    {room.description ? (
                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {room.description}
                      </p>
                    ) : null}

                    {room.amenities.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {room.amenities.slice(0, 4).map((amenity) => (
                          <span
                            key={amenity}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                          >
                            {amenity}
                          </span>
                        ))}
                        {room.amenities.length > 4 ? (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            +{room.amenities.length - 4} more
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="mt-6 flex items-end justify-between gap-4 border-t border-slate-200 pt-5 dark:border-slate-800">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                          Rate per night
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                          {roomRate ? formatTk(roomRate) : "Contact hotel"}
                        </p>
                      </div>
                      <Link
                        href={getBookingHref(room)}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700 dark:bg-slate-50 dark:text-slate-950 dark:hover:bg-cyan-300"
                      >
                        Book room
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : null}
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <Card className="overflow-hidden border-0 bg-slate-950 text-white shadow-2xl shadow-slate-950/20">
          <div className="grid gap-8 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.24),transparent_30%)] p-8 md:grid-cols-[1fr_auto] md:items-center lg:p-10">
            <div>
              <Badge variant="inverted" className="ring-1 ring-white/15">
                <Star className="mr-1 h-3.5 w-3.5 fill-current" />
                Ready for guest conversion
              </Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                Turn room inventory into a confident online booking journey.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
                Guests get a polished booking experience while hotel teams keep control of rates,
                availability, invoices, and payment decisions from the tenant workflow.
              </p>
            </div>
            <a
              href="#rooms"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Browse rooms
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </Card>
      </section>
      <Footer />
    </main>
  );
}

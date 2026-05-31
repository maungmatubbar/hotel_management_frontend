"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BedDouble, CalendarCheck, CalendarDays, Images, Search, Users } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTenantWebsiteRooms, type RoomDataResponse } from "@/lib/tenant-api";
import { hotels } from "@/lib/mock-data";
import { useAuthStore } from "@/store/auth-store";
import { useTenantStore } from "@/store/tenant-store";

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

function getRoomLabel(room: RoomDataResponse) {
  return room.room_name || `Room ${room.id}`;
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

export default function RoomsPage() {
  const token = useAuthStore((state) => state.token);
  const tenant = useTenantStore((state) => state.tenant);
  const todayInputDate = getTodayInputDate();
  const [checkIn, setCheckIn] = useState(todayInputDate);
  const [checkOut, setCheckOut] = useState(addDaysToInputDate(todayInputDate, 1));
  const bookingSlug = hotels[0].slug;
  const stayNights = getStayNights(checkIn, checkOut) || 1;
  const {
    data: tenantRooms,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["rooms", token, tenant.id],
    queryFn: () => getTenantWebsiteRooms(tenant.id, token),
    enabled: Boolean(tenant.id),
  });
  const rooms = (tenantRooms ?? []).filter(isRoomBookable);

  function getBookingHref(room: RoomDataResponse) {
    const params = new URLSearchParams({
      check_in: checkIn,
      check_out: checkOut,
      guests: String(Number(room.capacity) || 1),
      room_id: String(room.id),
    });
    const amount = parseAmount(room.rate) * stayNights;

    if (amount > 0) {
      params.set("total_amount", String(amount));
    }

    return `/hotel/${bookingSlug}/booking?${params.toString()}`;
  }

  return (
    <main className="hotel-page-bg text-slate-950 dark:text-slate-50">
      <Navbar />
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Badge variant="inverted">Rooms and suites</Badge>
          <div className="mt-6 grid gap-8 lg:grid-cols-[0.75fr_0.45fr] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl">
                Choose from live hotel rooms and book with confidence.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
                Browse tenant room inventory with rates, capacity, amenities, images, and
                availability pulled from the rooms endpoint.
              </p>
            </div>
            <Card className="border-white/10 bg-white/10 p-5 text-white backdrop-blur dark:bg-white/10">
              <p className="text-sm text-white/65">Available room types</p>
              <p className="mt-2 text-4xl font-semibold">{isLoading ? "..." : rooms.length}</p>
              <p className="mt-2 text-sm text-white/65">Select dates below to prepare checkout.</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Card className="p-3">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <div className="rounded-xl bg-white p-3 dark:bg-slate-950">
              <Label htmlFor="rooms-check-in" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <CalendarDays className="h-4 w-4" />
                Check in
              </Label>
              <Input
                id="rooms-check-in"
                type="date"
                value={checkIn}
                min={todayInputDate}
                onChange={(event) => {
                  setCheckIn(event.target.value);
                  if (checkOut && event.target.value > checkOut) {
                    setCheckOut("");
                  }
                }}
                className="mt-1"
              />
            </div>
            <div className="rounded-xl bg-white p-3 dark:bg-slate-950">
              <Label htmlFor="rooms-check-out" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <CalendarDays className="h-4 w-4" />
                Check out
              </Label>
              <Input
                id="rooms-check-out"
                type="date"
                value={checkOut}
                min={checkIn || todayInputDate}
                onChange={(event) => setCheckOut(event.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white dark:bg-slate-50 dark:text-slate-950">
              <Search className="h-4 w-4" />
              Dates update live
            </div>
          </div>
        </Card>

        {isLoading ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
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

        {isError ? (
          <Card className="mt-8 p-6">
            <p className="text-sm font-semibold text-red-600 dark:text-red-300">
              {error instanceof Error ? error.message : "Failed to load rooms."}
            </p>
          </Card>
        ) : null}

        {!isLoading && !isError && !rooms.length ? (
          <Card className="mt-8 p-8 text-center">
            <BedDouble className="mx-auto h-10 w-10 text-slate-400" />
            <h2 className="mt-4 text-xl font-semibold">No rooms are available yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              Published tenant rooms will appear here automatically once inventory is available.
            </p>
          </Card>
        ) : null}

        {!isLoading && !isError && rooms.length ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => {
              const images = getRoomImages(room);
              const coverImage = images[0];
              const roomRate = parseAmount(room.rate);

              return (
                <Card key={room.id} className="group overflow-hidden">
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
                      {room.available_rooms ? <Badge variant="inverted">{room.available_rooms} available</Badge> : null}
                    </div>
                    <div className="relative">
                      <p className="text-sm font-semibold text-cyan-100">{formatRoomType(room.room_type)}</p>
                      <h2 className="mt-2 text-2xl font-semibold">{getRoomLabel(room)}</h2>
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
                        {stayNights} night{stayNights > 1 ? "s" : ""}
                      </Badge>
                    </div>
                    {room.description ? (
                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {room.description}
                      </p>
                    ) : null}
                    {room.amenities.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {room.amenities.slice(0, 5).map((amenity) => (
                          <span
                            key={amenity}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-6 flex items-end justify-between gap-4 border-t border-slate-200 pt-5 dark:border-slate-800">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Rate per night</p>
                        <p className="mt-1 text-2xl font-semibold">{roomRate ? formatTk(roomRate) : "Contact hotel"}</p>
                      </div>
                      <Link
                        href={getBookingHref(room)}
                        className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-950 dark:hover:bg-slate-200"
                      >
                        Book room
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : null}
      </section>
      <Footer />
    </main>
  );
}

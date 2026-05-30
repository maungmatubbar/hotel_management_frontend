"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch, type FieldError } from "react-hook-form";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NotifyPopup } from "@/components/ui/notify-popup";
import { createBooking, getTenantRooms, uploadTenantFile, type BookingPayload, type RoomDataResponse } from "@/lib/tenant-api";
import { useAuthStore } from "@/store/auth-store";
import { useTenantStore } from "@/store/tenant-store";

function formatTk(amount: number) {
  return `Tk ${amount.toLocaleString("en-BD")}`;
}

function parseTkAmount(amount: string | number | null | undefined) {
  if (typeof amount === "number") {
    return amount;
  }

  return Number((amount ?? "").replace(/[^\d]/g, ""));
}

function getStayDays(checkIn?: string, checkOut?: string) {
  if (!checkIn || !checkOut) {
    return 0;
  }

  const startDate = new Date(`${checkIn}T00:00:00`);
  const endDate = new Date(`${checkOut}T00:00:00`);
  const diffInMs = endDate.getTime() - startDate.getTime();

  return diffInMs > 0 ? Math.ceil(diffInMs / (1000 * 60 * 60 * 24)) : 0;
}

function formatDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getNextDateInputValue(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + 1);

  return formatDateInputValue(date);
}

function RequiredLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <Label htmlFor={htmlFor}>
      {children} <span className="text-red-500">*</span>
    </Label>
  );
}

function FieldErrorMessage({ error }: { error?: FieldError }) {
  if (!error) {
    return null;
  }

  return <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{error.message}</p>;
}

type BookingFormValues = {
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  guestAddress: string;
  nidNumber: string;
  nidUploadImage: FileList;
  roomId: string;
  assignedRoomNumber: string;
  roomQuantity: number;
  discount: number;
  promoCode: string;
  checkIn: string;
  checkOut: string;
};

type UploadStatus = "idle" | "uploading" | "uploaded" | "failed";

function getRoomLabel(room: RoomDataResponse) {
  return room.room_name || `Room ${room.id}`;
}

function toBookingPayload(
  values: BookingFormValues,
  nidImageUrl: string,
  selectedRoom?: RoomDataResponse
): BookingPayload {
  return {
    guest_name: values.guestName,
    guest_phone: values.guestPhone,
    guest_email: values.guestEmail,
    guest_address: values.guestAddress,
    room_id: selectedRoom?.id ?? values.roomId,
    assigned_room_number: values.assignedRoomNumber,
    nid_number: values.nidNumber,
    nid_image_url: nidImageUrl,
    room_quantity: values.roomQuantity,
    discount: values.discount,
    promo_code: values.promoCode,
    check_in: values.checkIn,
    check_out: values.checkOut,
  };
}

export function AdminBookingForm() {
  const queryClient = useQueryClient();
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<BookingFormValues>({
    defaultValues: {
      discount: 0,
      roomQuantity: 1,
    },
  });
  const token = useAuthStore((state) => state.token);
  const tenant = useTenantStore((state) => state.tenant);
  const {
    data: tenantRooms,
    isLoading: isLoadingRooms,
    isError: isRoomsError,
    error: roomsError,
  } = useQuery({
    queryKey: ["rooms", token, tenant.id],
    queryFn: () => getTenantRooms(token as string, tenant.id),
    enabled: Boolean(token && tenant.id),
  });
  const [nidUploadStatus, setNidUploadStatus] = useState<UploadStatus>("idle");
  const [nidUploadError, setNidUploadError] = useState("");
  const [nidUploadedUrl, setNidUploadedUrl] = useState("");
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);

  const selectedRoomId = useWatch({ control, name: "roomId" });
  const watchedRoomQuantity = useWatch({ control, name: "roomQuantity" });
  const watchedDiscount = useWatch({ control, name: "discount" });
  const watchedNidUploadImage = useWatch({ control, name: "nidUploadImage" });
  const watchedCheckIn = useWatch({ control, name: "checkIn" });
  const watchedCheckOut = useWatch({ control, name: "checkOut" });

  const selectedRoomData = tenantRooms?.find((room) => String(room.id) === selectedRoomId);
  const roomRate = selectedRoomData ? parseTkAmount(selectedRoomData.rate) : 0;
  const roomQuantity = Math.max(1, Number(watchedRoomQuantity) || 1);
  const discountPercent = Math.min(100, Math.max(0, Number(watchedDiscount) || 0));
  const stayDays = getStayDays(watchedCheckIn, watchedCheckOut);
  const subtotal = roomRate * roomQuantity * stayDays;
  const appliedDiscount = Math.round((subtotal * discountPercent) / 100);
  const total = subtotal - appliedDiscount;
  const totalAmount = useMemo(() => formatTk(total), [total]);
  const nidUploadFile = watchedNidUploadImage?.[0];
  const nidFileName = nidUploadFile?.name;
  const nidPreviewUrl = useMemo(() => (nidUploadFile ? URL.createObjectURL(nidUploadFile) : ""), [nidUploadFile]);
  const todayInputDate = useMemo(() => formatDateInputValue(new Date()), []);
  const checkOutMinDate = useMemo(
    () => (watchedCheckIn ? getNextDateInputValue(watchedCheckIn) : todayInputDate),
    [todayInputDate, watchedCheckIn],
  );

  useEffect(() => {
    return () => {
      if (nidPreviewUrl) {
        URL.revokeObjectURL(nidPreviewUrl);
      }
    };
  }, [nidPreviewUrl]);

  useEffect(() => {
    if (watchedCheckOut && watchedCheckOut < checkOutMinDate) {
      setValue("checkOut", "");
    }
  }, [checkOutMinDate, setValue, watchedCheckOut]);

  const nidUploadRegister = register("nidUploadImage", {
    onChange: async (event) => {
      const file = event.target.files?.[0] as File | undefined;

      setNidUploadedUrl("");
      setNidUploadError("");

      if (!file) {
        setNidUploadStatus("idle");
        return;
      }

      if (!token) {
        setNidUploadStatus("failed");
        setNidUploadError("Missing auth token");
        return;
      }

      setNidUploadStatus("uploading");

      try {
        const uploadedFile = await uploadTenantFile(token, tenant.id, file);
        setNidUploadedUrl(uploadedFile.url);
        setNidUploadStatus("uploaded");
      } catch (error) {
        setNidUploadStatus("failed");
        setNidUploadError(error instanceof Error ? error.message : "Upload failed");
      }
    },
  });

  const onSubmit = async (values: BookingFormValues) => {
    setErrorMessage("");

    if (!token) {
      setErrorMessage("Missing auth token");
      return;
    }

    if (nidUploadStatus === "uploading") {
      setErrorMessage("NID image upload complete hoy nai.");
      return;
    }

    if (nidUploadStatus === "failed") {
      setErrorMessage(nidUploadError || "NID image upload failed.");
      return;
    }

    const payload = toBookingPayload(values, nidUploadedUrl, selectedRoomData);

    setIsCreatingBooking(true);

    try {
      await createBooking(token, tenant.id, payload);

      reset({
        discount: 0,
        roomQuantity: 1,
      });
      setNidUploadedUrl("");
      setNidUploadError("");
      setNidUploadStatus("idle");
      setIsNotifyOpen(true);
      void queryClient.invalidateQueries({ queryKey: ["bookings", token, tenant.id] });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Booking create failed");
    } finally {
      setIsCreatingBooking(false);
    }
  };

  return (
    <>
      <Card className="border-slate-100 bg-linear-to-br from-white to-slate-50 p-4 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950/70 sm:p-6 rounded-3xl">
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 xl:grid-cols-[1fr_320px] xl:items-start">
          <div className="space-y-4">
            <div className="grid gap-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/20 md:grid-cols-3">
              <div>
                <RequiredLabel htmlFor="guest-name">Guest name</RequiredLabel>
                <Input
                  id="guest-name"
                  className="mt-2"
                  placeholder="Enter guest name"
                  aria-invalid={errors.guestName ? "true" : "false"}
                  {...register("guestName", { required: "Guest name is required." })}
                />
                <FieldErrorMessage error={errors.guestName} />
              </div>
              <div>
                <RequiredLabel htmlFor="guest-phone">Phone number</RequiredLabel>
                <Input
                  id="guest-phone"
                  className="mt-2"
                  placeholder="+880 1XXX-XXXXXX"
                  aria-invalid={errors.guestPhone ? "true" : "false"}
                  {...register("guestPhone", { required: "Phone number is required." })}
                />
                <FieldErrorMessage error={errors.guestPhone} />
              </div>
              <div>
                <Label htmlFor="guest-email">Email address</Label>
                <Input
                  id="guest-email"
                  type="email"
                  className="mt-2"
                  placeholder="guest@example.com"
                  aria-invalid={errors.guestEmail ? "true" : "false"}
                  {...register("guestEmail", {
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address.",
                    },
                  })}
                />
                <FieldErrorMessage error={errors.guestEmail} />
              </div>
              <div className="md:col-span-2">
                <RequiredLabel htmlFor="guest-address">Address</RequiredLabel>
                <Input
                  id="guest-address"
                  className="mt-2"
                  placeholder="House, road, area, city"
                  aria-invalid={errors.guestAddress ? "true" : "false"}
                  {...register("guestAddress", { required: "Address is required." })}
                />
                <FieldErrorMessage error={errors.guestAddress} />
              </div>
              <div>
                <RequiredLabel htmlFor="room-type">Room</RequiredLabel>
                <select
                  id="room-type"
                  className="mt-2 flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-slate-300"
                  aria-invalid={errors.roomId ? "true" : "false"}
                  disabled={isLoadingRooms || isRoomsError}
                  {...register("roomId", { required: "Room is required." })}
                >
                  <option value="">
                    {isLoadingRooms ? "Loading rooms..." : "Select room"}
                  </option>
                  {(tenantRooms ?? []).map((room) => (
                    <option key={room.id} value={room.id}>
                      {getRoomLabel(room)} - {formatTk(parseTkAmount(room.rate))}
                    </option>
                  ))}
                </select>
                <FieldErrorMessage error={errors.roomId} />
                {isRoomsError ? (
                  <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                    {roomsError instanceof Error ? roomsError.message : "Failed to load rooms."}
                  </p>
                ) : null}
              </div>
              <div>
                <Label htmlFor="assigned-room-number">Assign room number</Label>
                <Input
                  id="assigned-room-number"
                  className="mt-2"
                  placeholder="Example: 302"
                  {...register("assignedRoomNumber")}
                />
              </div>
              <div>
                <Label htmlFor="nid-number">NID number</Label>
                <Input
                  id="nid-number"
                  className="mt-2"
                  placeholder="Enter NID number"
                  {...register("nidNumber")}
                />
              </div>
              <div>
                <RequiredLabel htmlFor="room-quantity">How many rooms</RequiredLabel>
                <Input
                  id="room-quantity"
                  type="number"
                  min={1}
                  className="mt-2"
                  placeholder="1"
                  aria-invalid={errors.roomQuantity ? "true" : "false"}
                  {...register("roomQuantity", {
                    min: {
                      value: 1,
                      message: "At least 1 room is required.",
                    },
                    required: "Room quantity is required.",
                    valueAsNumber: true,
                  })}
                />
                <FieldErrorMessage error={errors.roomQuantity} />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-4  dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/20">
              <div>
                <Label htmlFor="nid-upload-image">Upload NID image</Label>
                <div
                  className="relative mt-2 flex min-h-40 items-end overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-cyan-100 via-slate-100 to-amber-100 bg-cover bg-center p-4 dark:border-slate-800 dark:from-cyan-950 dark:via-slate-900 dark:to-amber-950"
                  style={nidPreviewUrl ? { backgroundImage: `url(${nidPreviewUrl})` } : undefined}
                >
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/75 via-slate-950/10 to-transparent" />
                  {!nidPreviewUrl ? (
                    <div className="absolute inset-0 grid place-items-center p-6 text-center text-slate-500 dark:text-slate-400">
                      <div>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-slate-600 shadow-sm dark:bg-slate-900/80 dark:text-slate-300">
                          <Camera className="h-5 w-5" />
                        </div>
                        <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                          No NID image selected
                        </p>
                      </div>
                    </div>
                  ) : null}
                  {nidFileName ? (
                    <div className="relative max-w-full truncate rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-lg dark:bg-slate-950/85 dark:text-slate-200">
                      {nidUploadStatus === "uploading" ? "Uploading..." : null}
                      {nidUploadStatus === "uploaded" ? "Uploaded" : null}
                      {nidUploadStatus === "failed" ? nidUploadError || "Upload failed" : null}
                      {nidUploadStatus === "idle" ? nidFileName : null}
                    </div>
                  ) : null}
                </div>
                <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
                  <Camera className="h-4 w-4" />
                  Upload NID image
                  <input id="nid-upload-image" type="file" accept="image/*" className="sr-only" {...nidUploadRegister} />
                </label>
                {nidUploadedUrl ? (
                  <p className="mt-2 truncate text-xs text-slate-500 dark:text-slate-400">
                    Uploaded URL ready for payload.
                  </p>
                ) : null}
                {errorMessage ? (
                  <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300">
                    {errorMessage}
                  </p>
                ) : null}
                <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button className="w-full sm:w-auto" disabled={isCreatingBooking || nidUploadStatus === "uploading"}>
                    {isCreatingBooking ? "Creating..." : "Create booking"}
                  </Button>
                </div>
              </div>

            </div>
          </div>

          <div className="space-y-4 xl:sticky xl:top-6">
            <div className="rounded-3xl border border-slate-100 bg-white p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">
                Stay details
              </p>
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="booking-discount">Discount (%)</Label>
                  <Input
                    id="booking-discount"
                    type="number"
                    min={0}
                    max={100}
                    className="mt-2 text-right"
                    placeholder="0%"
                    aria-invalid={errors.discount ? "true" : "false"}
                    {...register("discount", {
                      max: {
                        value: 100,
                        message: "Discount cannot be more than 100%.",
                      },
                      min: {
                        value: 0,
                        message: "Discount cannot be negative.",
                      },
                      valueAsNumber: true,
                    })}
                  />
                  <FieldErrorMessage error={errors.discount} />
                </div>
                <div>
                  <RequiredLabel htmlFor="check-in">Check in</RequiredLabel>
                  <Input
                    id="check-in"
                    type="date"
                    min={todayInputDate}
                    className="mt-2"
                    aria-invalid={errors.checkIn ? "true" : "false"}
                    {...register("checkIn", {
                      required: "Check in date is required.",
                      validate: (value) => value >= todayInputDate || "Check in cannot be before today.",
                    })}
                  />
                  <FieldErrorMessage error={errors.checkIn} />
                </div>
                <div>
                  <RequiredLabel htmlFor="check-out">Check out</RequiredLabel>
                  <Input
                    id="check-out"
                    type="date"
                    min={checkOutMinDate}
                    className="mt-2"
                    aria-invalid={errors.checkOut ? "true" : "false"}
                    {...register("checkOut", {
                      required: "Check out date is required.",
                      validate: (value) => value >= checkOutMinDate || "Check out must be after check in.",
                    })}
                  />
                  <FieldErrorMessage error={errors.checkOut} />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">
                  Payment summary
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-50">
                  Booking amount
                </h3>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span>Room rate</span>
                  <strong className="min-w-28 text-right text-slate-950 dark:text-slate-50">{formatTk(roomRate)}</strong>
                </div>
                <div className="flex justify-between gap-4">
                  <span>
                    Subtotal ({roomQuantity} {roomQuantity > 1 ? "rooms" : "room"} x {stayDays}{" "}
                    {stayDays === 1 ? "day" : "days"})
                  </span>
                  <strong className="min-w-28 text-right text-slate-950 dark:text-slate-50">{formatTk(subtotal)}</strong>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Discount ({discountPercent}%)</span>
                  <strong className="min-w-28 text-right text-emerald-700 dark:text-emerald-300">- {formatTk(appliedDiscount)}</strong>
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="promo-code">Promo code</Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    id="promo-code"
                    className="min-w-0 flex-1 uppercase"
                    placeholder="PROMO10"
                    {...register("promoCode")}
                  />
                  <Button type="button" variant="outline" className="shrink-0">
                    Apply
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex justify-between gap-4 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-base dark:border-cyan-900 dark:bg-cyan-950/40">
                <span>Total payable</span>
                <strong className="min-w-28 text-right text-slate-950 dark:text-slate-50">{totalAmount}</strong>
              </div>
            </div>
          </div>
        </div>

      </form>
    </Card>
    <NotifyPopup
      isOpen={isNotifyOpen}
      title="Booking created"
      message="Guest booking saved successfully."
      onClose={() => setIsNotifyOpen(false)}
    />
    </>
  );
}

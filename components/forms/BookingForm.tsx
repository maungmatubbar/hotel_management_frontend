"use client";

import { useState, type ReactNode } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm, type FieldError } from "react-hook-form";
import { CreditCard, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createPublicBooking,
  getPublicInvoice,
  getPublicInvoiceSslcommerzSuccess,
  getTenantWebsiteRooms,
  isPublicInvoicePaid,
} from "@/lib/tenant-api";
import { useAuthStore } from "@/store/auth-store";
import { useTenantStore } from "@/store/tenant-store";

type BookingFormProps = {
  hotelName?: string;
  hotelPrice?: string;
  defaultValues?: {
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    roomId?: string;
  };
  /** e.g. return from payment gateway via ?invoice= */
  initialInvoiceId?: string;
  initialInvoiceIsSslcommerzSuccess?: boolean;
};

type BookingCheckoutValues = {
  customer_name: string;
  phone_number: string;
  email: string;
  address: string;
  payment_option: "pay_now" | "pay_later";
};

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

function parseAmount(amount: string | number | undefined) {
  if (typeof amount === "number") {
    return amount;
  }

  return Number((amount ?? "").replace(/[^\d.-]/g, "")) || 0;
}

function formatTk(amount: number) {
  return `Tk ${amount.toLocaleString("en-BD")}`;
}

function getStayNights(checkIn: string | undefined, checkOut: string | undefined) {
  const checkInDate = new Date(checkIn ?? "");
  const checkOutDate = new Date(checkOut ?? "");

  if (!checkIn || !checkOut || Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
    return 0;
  }

  return Math.max(0, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / 86_400_000));
}

function addNightsToDate(checkIn: string | undefined, nights: number) {
  const checkInDate = new Date(checkIn ?? "");

  if (!checkIn || Number.isNaN(checkInDate.getTime())) {
    return "";
  }

  checkInDate.setDate(checkInDate.getDate() + nights);
  const year = checkInDate.getFullYear();
  const month = String(checkInDate.getMonth() + 1).padStart(2, "0");
  const day = String(checkInDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function BookingForm({
  hotelName = "Selected hotel",
  hotelPrice = "$120",
  defaultValues,
  initialInvoiceId,
  initialInvoiceIsSslcommerzSuccess = false,
}: BookingFormProps) {
  const token = useAuthStore((state) => state.token);
  const tenant = useTenantStore((state) => state.tenant);
  const [trackedInvoiceId, setTrackedInvoiceId] = useState<string | null>(
    initialInvoiceId?.trim() || null
  );
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<BookingCheckoutValues>();
  const initialStayNights = Math.max(1, getStayNights(defaultValues?.checkIn, defaultValues?.checkOut) || 1);
  const [stayNights, setStayNights] = useState(initialStayNights);
  const [roomQuantity, setRoomQuantity] = useState(1);
  const { data: rooms } = useQuery({
    queryKey: ["rooms", token, tenant.id],
    queryFn: () => getTenantWebsiteRooms(tenant.id, token),
    enabled: Boolean(tenant.id),
  });
  const selectedRoom = rooms?.find((room) => String(room.id) === defaultValues?.roomId);
  const calculatedCheckOut = addNightsToDate(defaultValues?.checkIn, stayNights) || defaultValues?.checkOut;
  const fallbackRoomRate = initialStayNights > 0 ? parseAmount(hotelPrice) / initialStayNights : 0;
  const roomRate = parseAmount(selectedRoom?.rate) || fallbackRoomRate;
  const availableRoomCount = Number(selectedRoom?.available_rooms) || undefined;
  const guestCount = Number(defaultValues?.guests) || 1;
  const totalAmount = roomRate * stayNights * roomQuantity;
  const displayAmount = totalAmount > 0 ? formatTk(totalAmount) : hotelPrice;
  const bookingMutation = useMutation({
    mutationFn: (values: BookingCheckoutValues) => {
      if (!defaultValues?.roomId || !defaultValues?.checkIn || !calculatedCheckOut) {
        throw new Error("Missing room or stay details.");
      }

      return createPublicBooking(tenant.id, {
        customer_name: values.customer_name,
        phone_number: values.phone_number,
        email: values.email || undefined,
        address: values.address,
        guest_name: values.customer_name,
        guest_phone: values.phone_number,
        guest_email: values.email || undefined,
        guest_address: values.address,
        guests: guestCount,
        room_id: defaultValues.roomId,
        room_quantity: roomQuantity,
        check_in: defaultValues.checkIn,
        check_out: calculatedCheckOut,
        payment_option: values.payment_option,
        stay_nights: stayNights,
        total_amount: totalAmount,
      });
    },
    onSuccess: (result, values) => {
      const invoiceId = result.booking.invoice?.id;

      if (values.payment_option === "pay_now" && invoiceId != null) {
        setTrackedInvoiceId(String(invoiceId));
      }

      if (values.payment_option === "pay_now" && result.payment?.payment_url) {
        window.location.assign(result.payment.payment_url);
      }
    },
  });

  const publicInvoiceQuery = useQuery({
    queryKey: [
      "public-invoice",
      tenant.id,
      trackedInvoiceId,
      initialInvoiceIsSslcommerzSuccess,
    ],
    queryFn: () =>
      initialInvoiceIsSslcommerzSuccess
        ? getPublicInvoiceSslcommerzSuccess(tenant.id, trackedInvoiceId!)
        : getPublicInvoice(tenant.id, trackedInvoiceId!),
    enabled: Boolean(tenant.id && trackedInvoiceId),
    refetchInterval: (query) =>
      query.state.data && isPublicInvoicePaid(query.state.data) ? false : 2500,
  });

  const invoicePaid =
    publicInvoiceQuery.data != null && isPublicInvoicePaid(publicInvoiceQuery.data);
  const invoicePending =
    publicInvoiceQuery.data != null &&
    !isPublicInvoicePaid(publicInvoiceQuery.data) &&
    !publicInvoiceQuery.isError;

  function handleCheckoutSubmit(values: BookingCheckoutValues) {
    bookingMutation.mutate(values);
  }

  return (
    <Card id="payment" className="scroll-mt-24 p-6">
      <form className="space-y-5" onSubmit={handleSubmit(handleCheckoutSubmit)}>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Guest checkout
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
            Complete booking details
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Add customer information, choose payment preference, then proceed.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
          <div className="flex items-start gap-4">
            <div>
              <p className="font-semibold text-slate-950 dark:text-slate-50">{hotelName}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {defaultValues?.checkIn || "Check-in"} - {calculatedCheckOut || "Check-out"} ·{" "}
                {defaultValues?.guests || "2"} guests · {roomQuantity} room{roomQuantity > 1 ? "s" : ""} · Room{" "}
                {defaultValues?.roomId || "not selected"}
              </p>
            </div>
          </div>
          <div className="mt-3 divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <div className="flex justify-between gap-3 py-2">
              <span>Room rate</span>
              <strong className="text-slate-950 dark:text-slate-50">
                {roomRate > 0 ? formatTk(roomRate) : "Not set"}
              </strong>
            </div>
            <div className="flex items-center justify-between gap-3 py-2">
              <span>Stay nights</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  disabled={stayNights <= 1}
                  onClick={() => setStayNights((current) => Math.max(1, current - 1))}
                >
                  -
                </button>
                <strong className="min-w-6 text-center text-slate-950 dark:text-slate-50">{stayNights}</strong>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  onClick={() => setStayNights((current) => current + 1)}
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 py-2">
              <span>Rooms</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  disabled={roomQuantity <= 1}
                  onClick={() => setRoomQuantity((current) => Math.max(1, current - 1))}
                >
                  -
                </button>
                <strong className="min-w-6 text-center text-slate-950 dark:text-slate-50">{roomQuantity}</strong>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  disabled={availableRoomCount ? roomQuantity >= availableRoomCount : false}
                  onClick={() =>
                    setRoomQuantity((current) =>
                      availableRoomCount ? Math.min(availableRoomCount, current + 1) : current + 1
                    )
                  }
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex justify-between gap-3 py-2 text-base">
              <span>Total amount</span>
              <strong className="text-slate-950 dark:text-slate-50">{displayAmount}</strong>
            </div>
          </div>
        </div>

        <input type="hidden" name="check_in" value={defaultValues?.checkIn ?? ""} />
        <input type="hidden" name="check_out" value={calculatedCheckOut ?? ""} />
        <input type="hidden" name="guests" value={defaultValues?.guests ?? ""} />
        <input type="hidden" name="room_id" value={defaultValues?.roomId ?? ""} />
        <input type="hidden" name="room_quantity" value={String(roomQuantity)} />
        <input type="hidden" name="stay_nights" value={String(stayNights)} />
        <input type="hidden" name="total_amount" value={totalAmount ? String(totalAmount) : ""} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <RequiredLabel htmlFor="customer-name">
              <UserRound className="h-4 w-4" />
              Customer name
            </RequiredLabel>
            <Input
              id="customer-name"
              placeholder="Enter full name"
              className="mt-2"
              aria-invalid={errors.customer_name ? "true" : "false"}
              {...register("customer_name", { required: "Customer name is required." })}
            />
            <FieldErrorMessage error={errors.customer_name} />
          </div>
          <div>
            <RequiredLabel htmlFor="phone-number">
              <Phone className="h-4 w-4" />
              Phone number
            </RequiredLabel>
            <Input
              id="phone-number"
              type="tel"
              placeholder="+880 17..."
              className="mt-2"
              aria-invalid={errors.phone_number ? "true" : "false"}
              {...register("phone_number", { required: "Phone number is required." })}
            />
            <FieldErrorMessage error={errors.phone_number} />
          </div>
        </div>

        <div>
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="customer@example.com"
            className="mt-2"
            {...register("email")}
          />
        </div>

        <div>
          <RequiredLabel htmlFor="address">
            <MapPin className="h-4 w-4" />
            Address
          </RequiredLabel>
          <Input
            id="address"
            placeholder="House, road, city"
            className="mt-2"
            aria-invalid={errors.address ? "true" : "false"}
            {...register("address", { required: "Address is required." })}
          />
          <FieldErrorMessage error={errors.address} />
        </div>

        <div>
          <Label className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment option
          </Label>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950">
              <input
                type="radio"
                value="pay_now"
                className="mt-1"
                {...register("payment_option", { required: "Payment option is required." })}
              />
              <span>
                <span className="block font-semibold text-slate-950 dark:text-slate-50">Pay now</span>
                <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">
                  Continue to payment and confirm instantly.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950">
              <input
                type="radio"
                value="pay_later"
                className="mt-1"
                {...register("payment_option", { required: "Payment option is required." })}
              />
              <span>
                <span className="block font-semibold text-slate-950 dark:text-slate-50">Pay later</span>
                <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">
                  Reserve now and settle payment at front desk.
                </span>
              </span>
            </label>
          </div>
          <FieldErrorMessage error={errors.payment_option} />
        </div>

        <Button className="w-full" disabled={bookingMutation.isPending}>
          {bookingMutation.isPending ? "Submitting..." : "Proceed"}
        </Button>
        {bookingMutation.isSuccess && !trackedInvoiceId ? (
          <p className="rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
            Booking request submitted successfully. You can pay at check-in.
          </p>
        ) : null}
        {bookingMutation.isSuccess && trackedInvoiceId && publicInvoiceQuery.isLoading ? (
          <p className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-950/40 dark:text-slate-200">
            Booking created. Checking payment status...
          </p>
        ) : null}
        {trackedInvoiceId && invoicePaid ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
            <p className="font-semibold">Payment successful</p>
            {publicInvoiceQuery.data?.invoice_number ? (
              <p className="mt-1">
                Invoice {publicInvoiceQuery.data.invoice_number}
                {publicInvoiceQuery.data.amount_paid
                  ? ` · Paid ${formatTk(parseAmount(publicInvoiceQuery.data.amount_paid))}`
                  : null}
              </p>
            ) : null}
          </div>
        ) : null}
        {trackedInvoiceId && invoicePending ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            <p className="font-semibold">Payment pending</p>
            <p className="mt-1">
              Complete payment to confirm your booking. Status updates automatically.
            </p>
            {publicInvoiceQuery.data?.amount_due ? (
              <p className="mt-1 font-medium">
                Amount due: {formatTk(parseAmount(publicInvoiceQuery.data.amount_due))}
              </p>
            ) : null}
          </div>
        ) : null}
        {trackedInvoiceId && publicInvoiceQuery.isError ? (
          <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
            {publicInvoiceQuery.error instanceof Error
              ? publicInvoiceQuery.error.message
              : "Could not verify payment status."}
          </p>
        ) : null}
        {bookingMutation.isError ? (
          <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
            {bookingMutation.error instanceof Error ? bookingMutation.error.message : "Booking submit failed."}
          </p>
        ) : null}
      </form>
    </Card>
  );
}

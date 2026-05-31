"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Banknote,
  CalendarDays,
  Camera,
  CircleCheck,
  CreditCard,
  DoorOpen,
  Download,
  FileCheck2,
  FileText,
  Hash,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Upload,
  UserRound,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  assignBookingRoom,
  getTenantBooking,
  payBookingInvoice,
  uploadTenantFile,
  updateBookingNidImage,
  updateBookingStatus,
  type BookingDataResponse,
  type BookingPaymentResponse,
  type BookingStatus,
} from "@/lib/tenant-api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useTenantStore } from "@/store/tenant-store";

const bookingStatusOptions: { value: BookingStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "check_in", label: "Checked in" },
  { value: "check_out", label: "Checked out" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function formatBookingStatus(status: string | null | undefined) {
  return bookingStatusOptions.find((option) => option.value === status)?.label ?? status ?? "Pending";
}

function formatTk(amount: number) {
  return `Tk ${amount.toLocaleString("en-BD")}`;
}

function parseAmount(amount: string | number | undefined) {
  if (typeof amount === "number") {
    return amount;
  }

  return Number((amount ?? "").replace(/[^\d.-]/g, "")) || 0;
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

function getInvoiceDueAmount(booking: BookingDataResponse) {
  const dueAmount = parseAmount(booking.invoice?.amount_due);

  if (dueAmount > 0) {
    return dueAmount;
  }

  return parseAmount(booking.invoice?.total_amount ?? booking.total ?? booking.total_price);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  const normalizedValue = value.includes(" ") ? value.replace(" ", "T") : value;
  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatPaymentType(type: string | null | undefined) {
  if (!type) {
    return "Payment";
  }

  return type
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatPaymentMethod(method: string | null | undefined) {
  return formatPaymentType(method);
}

async function downloadFile(url: string, filename: string, token: string | null) {
  if (!token) {
    throw new Error("Missing auth token.");
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/pdf",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Download failed.");
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename;
  link.style.display = "none";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

function getStayDateRange(booking: BookingDataResponse) {
  return [getBookingDate(booking, "check_in"), getBookingDate(booking, "check_out")]
    .filter(Boolean)
    .join(" - ");
}

function getStayNights(booking: BookingDataResponse) {
  const checkIn = getBookingDate(booking, "check_in");
  const checkOut = getBookingDate(booking, "check_out");
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (!checkIn || !checkOut || Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
    return "Flexible stay";
  }

  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / 86_400_000);

  if (nights <= 0) {
    return "Same day stay";
  }

  return `${nights} night${nights > 1 ? "s" : ""}`;
}

function getGuestInitials(name: string | null | undefined) {
  return (name ?? "Guest")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getPaymentProgress(booking: BookingDataResponse) {
  const total = parseAmount(booking.invoice?.total_amount ?? booking.total ?? booking.total_price);
  const paid = parseAmount(booking.invoice?.amount_paid);

  if (total <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((paid / total) * 100));
}

function normalizeRoomNumber(roomNumber: string | null | undefined) {
  const trimmedRoomNumber = (roomNumber ?? "").trim();

  return trimmedRoomNumber.toLowerCase() === "to be assigned" ? "" : trimmedRoomNumber;
}

function PlainDetail({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-3 last:border-b-0 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <span className="wrap-break-word text-sm font-semibold text-slate-950 dark:text-slate-50 sm:max-w-[65%] sm:text-right">
        {value || "Not set"}
      </span>
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
    <div className="group flex gap-3 rounded-3xl border border-white/15 bg-white/10 p-4 text-white shadow-lg shadow-black/10 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/10">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">{label}</p>
        <p className="mt-1 text-sm font-semibold">{value || "Not set"}</p>
      </div>
    </div>
  );
}

function BookingJourney({ status }: { status: BookingStatus }) {
  const currentIndex = Math.max(
    bookingStatusOptions.findIndex((option) => option.value === status),
    0
  );
  const visibleStatuses = bookingStatusOptions.filter((option) => option.value !== "cancelled");

  return (
    <div className="grid gap-3 md:grid-cols-5">
      {visibleStatuses.map((option, index) => {
        const isComplete = currentIndex >= index && status !== "cancelled";
        const isCurrent = status === option.value;

        return (
          <div
            key={option.value}
            className={cn(
              "rounded-2xl border p-3 transition",
              isComplete
                ? "border-cyan-200 bg-cyan-50 text-cyan-900 dark:border-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-100"
                : "border-slate-200 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-400",
              isCurrent ? "ring-2 ring-cyan-400/40" : ""
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                  isComplete ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                )}
              >
                {isComplete ? <CircleCheck className="h-4 w-4" /> : index + 1}
              </span>
              <p className="text-xs font-semibold">{option.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PaymentItem({ payment, token }: { payment: BookingPaymentResponse; token: string | null }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-950/60 dark:shadow-black/20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-950 dark:text-slate-50">{formatMoney(payment.amount)}</p>
          <div className="mt-1.5 space-y-0.5 text-xs text-slate-500 dark:text-slate-400">
            <p>Method: {formatPaymentMethod(payment.method)}</p>
            <p>Paid at: {formatDateTime(payment.paid_at)}</p>
          </div>
        </div>
        <Badge variant="success">{formatPaymentType(payment.type)}</Badge>
      </div>
      {payment.reference ? (
        <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          Reference: {payment.reference}
        </p>
      ) : null}
      {payment.receipt ? (
        <div className="mt-2 flex flex-col gap-2 rounded-xl bg-gray-50 px-3 py-2.5 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
          <span className="text-[9px] font-semibold leading-5">
            Receipt {payment.receipt.receipt_number} · Issued {formatDateTime(payment.receipt.issued_at)}
          </span>
          {payment.receipt.download_url ? (
            <a
              href={payment.receipt.download_url}
              onClick={(event) => {
                event.preventDefault();
                void downloadFile(payment.receipt!.download_url, `${payment.receipt!.receipt_number}.pdf`, token);
              }}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-7 w-fit shrink-0 rounded-lg bg-white px-2 text-xs text-slate-700 dark:bg-slate-950 dark:text-slate-200")}
            >
              <Download className="h-3 w-3" />
              Download receipt
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default function AdminBookingDetailPage() {
  const params = useParams<{ booking: string }>();
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const tenant = useTenantStore((state) => state.tenant);
  const bookingId = params.booking;
  const [paymentAmount, setPaymentAmount] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentReference, setPaymentReference] = useState("");
  const [paidAt, setPaidAt] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState<BookingStatus | null>(null);
  const [roomNumber, setRoomNumber] = useState<string | null>(null);
  const [uploadedNidImageUrl, setUploadedNidImageUrl] = useState<string | null>(null);
  const [nidImageFile, setNidImageFile] = useState<File | null>(null);
  const [nidImageInputKey, setNidImageInputKey] = useState(0);
  const [formMessage, setFormMessage] = useState("");

  const { data: booking, isLoading, isError, error } = useQuery({
    queryKey: ["bookings", "detail", token, tenant.id, bookingId],
    queryFn: () => getTenantBooking(token as string, tenant.id, bookingId),
    enabled: Boolean(token && tenant.id && bookingId),
  });

  const defaultPaymentAmount = booking ? String(getInvoiceDueAmount(booking)) : "";
  const hasInvoiceDue = booking ? parseAmount(booking.invoice?.amount_due) > 0 : false;
  const downPaymentAmount = paymentAmount ?? defaultPaymentAmount;
  const effectivePaidAt = paidAt ?? new Date().toISOString().slice(0, 10);
  const effectiveBookingStatus: BookingStatus = (bookingStatus ?? booking?.status ?? "confirmed") as BookingStatus;
  const effectiveRoomNumber = roomNumber ?? normalizeRoomNumber(booking?.assigned_room_number);
  const selectedNidPreviewUrl = useMemo(
    () => (nidImageFile ? URL.createObjectURL(nidImageFile) : ""),
    [nidImageFile]
  );
  const currentNidPreviewUrl = selectedNidPreviewUrl || uploadedNidImageUrl || booking?.nid_image_url || "";

  useEffect(() => {
    return () => {
      if (selectedNidPreviewUrl) {
        URL.revokeObjectURL(selectedNidPreviewUrl);
      }
    };
  }, [selectedNidPreviewUrl]);

  const paymentMutation = useMutation({
    mutationFn: ({ amount, type }: { amount: string; type: "full_payment" | "down_payment" }) => {
      if (!token) {
        throw new Error("Missing auth token.");
      }

      const paymentPayload = {
        amount,
        method: paymentMethod,
        reference: paymentReference.trim() || undefined,
        paid_at: effectivePaidAt,
        type,
      };

      return payBookingInvoice(token, tenant.id, bookingId, paymentPayload);
    },
    onSuccess: (_updatedBooking, variables) => {
      setFormMessage(
        variables.type === "down_payment"
          ? "Down payment saved and receipt created."
          : "Invoice payment saved and receipt created."
      );
      setPaymentAmount(null);
      setPaymentReference("");
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: () => {
      if (!token) {
        throw new Error("Missing auth token.");
      }

      return updateBookingStatus(token, tenant.id, bookingId, { status: effectiveBookingStatus });
    },
    onSuccess: () => {
      setFormMessage("Booking status updated.");
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  const roomAssignmentMutation = useMutation({
    mutationFn: (nextRoomNumber: string) => {
      if (!token) {
        throw new Error("Missing auth token.");
      }

      if (!booking?.room_id) {
        throw new Error("This booking has no room type assigned.");
      }

      const assignedRoomNumber = nextRoomNumber.trim();
      if (!assignedRoomNumber) {
        throw new Error("Room number is required.");
      }

      return assignBookingRoom(token, tenant.id, bookingId, {
        room_id: booking.room_id,
        assigned_room_number: assignedRoomNumber,
      });
    },
    onSuccess: (_updatedBooking, nextRoomNumber) => {
      const trimmedRoomNumber = nextRoomNumber.trim();
      setFormMessage("Room number assigned.");
      setRoomNumber(trimmedRoomNumber);
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  const nidImageMutation = useMutation({
    mutationFn: async (nextNidImageFile: File | null) => {
      if (!token) {
        throw new Error("Missing auth token.");
      }

      if (!nextNidImageFile) {
        throw new Error("NID image is required.");
      }

      const uploadedFile = await uploadTenantFile(token, tenant.id, nextNidImageFile);
      await updateBookingNidImage(token, tenant.id, bookingId, { nid_image_url: uploadedFile.url });

      return uploadedFile.url;
    },
    onSuccess: (uploadedNidImageUrl) => {
      setFormMessage("NID image updated.");
      setUploadedNidImageUrl(uploadedNidImageUrl);
      setNidImageFile(null);
      setNidImageInputKey((currentKey) => currentKey + 1);
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  function handlePaymentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const paymentType =
      submitter?.value === "down_payment" ? "down_payment" : "full_payment";
    const amount = paymentType === "down_payment" ? downPaymentAmount : defaultPaymentAmount;

    setFormMessage("");
    paymentMutation.mutate({ amount, type: paymentType });
  }

  function handleStatusSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormMessage("");
    statusMutation.mutate();
  }

  function handleRoomAssignmentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormMessage("");
    roomAssignmentMutation.mutate(effectiveRoomNumber);
  }

  function handleNidImageSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormMessage("");
    nidImageMutation.mutate(nidImageFile);
  }

  const paymentError =
    paymentMutation.error instanceof Error ? paymentMutation.error.message : "Payment update failed.";
  const statusError =
    statusMutation.error instanceof Error ? statusMutation.error.message : "Status update failed.";
  const roomAssignmentError =
    roomAssignmentMutation.error instanceof Error ? roomAssignmentMutation.error.message : "Room assignment failed.";
  const nidImageError =
    nidImageMutation.error instanceof Error ? nidImageMutation.error.message : "NID image upload failed.";
  const paymentProgress = booking ? getPaymentProgress(booking) : 0;
  const stayNights = booking ? getStayNights(booking) : "Flexible stay";
  const guestInitials = booking ? getGuestInitials(booking.guest_name) : "G";

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-4xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/20 sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-cyan-200/50 blur-3xl dark:bg-cyan-900/30" />
        <div className="pointer-events-none absolute -bottom-24 left-16 h-44 w-44 rounded-full bg-emerald-200/50 blur-3xl dark:bg-emerald-900/20" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge variant="success">Booking command center</Badge>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-3xl">
              Manage guest stay, documents, and payment in one place
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              A clean hotel front-desk view for room assignment, guest verification, invoice collection, and receipt history.
            </p>
          </div>
          <Link href="/admin/bookings" className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}>
            Back to bookings
          </Link>
        </div>
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
          <Card className="overflow-hidden border-0 bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 p-0 text-white shadow-2xl shadow-slate-900/20">
            <div className="relative p-5 sm:p-6 lg:p-8">
              <div className="pointer-events-none absolute -right-16 top-10 h-52 w-52 rounded-full bg-cyan-400/20 blur-3xl" />
              <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-emerald-300/10 blur-3xl" />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.75rem] bg-white/15 text-2xl font-black ring-1 ring-white/20 backdrop-blur">
                    {guestInitials}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="inverted">
                        {formatBookingStatus(booking.invoice?.status ?? booking.status)}
                      </Badge>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                        {booking.booking_number ?? `Booking #${booking.id}`}
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
                      {effectiveRoomNumber ? `· Room ${effectiveRoomNumber}` : ""}
                    </p>
                  </div>
                </div>
                <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur lg:min-w-72">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">Total amount</p>
                      <p className="mt-2 text-3xl font-bold">{formatBookingTotal(booking)}</p>
                    </div>
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                      <WalletCards className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-white/15">
                    <div className="h-2 rounded-full bg-emerald-300" style={{ width: `${paymentProgress}%` }} />
                  </div>
                  <p className="mt-2 text-sm text-slate-300">
                    {paymentProgress}% paid · Due {formatMoney(booking.invoice?.amount_due) ?? formatBookingTotal(booking)}
                  </p>
                </div>
              </div>

              <div className="relative mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <SummaryItem icon={Phone} label="Phone" value={booking.guest_phone ?? booking.phone_number} />
                <SummaryItem icon={Mail} label="Email" value={booking.guest_email ?? booking.email} />
                <SummaryItem icon={CalendarDays} label="Stay" value={getStayDateRange(booking)} />
                <SummaryItem icon={DoorOpen} label="Room number" value={effectiveRoomNumber} />
              </div>
            </div>
          </Card>
          <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <Card className="overflow-hidden border-slate-100 bg-linear-to-br from-white via-slate-50 to-cyan-50 p-5 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-cyan-950/30 sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-slate-50 dark:text-slate-950">
                      <FileCheck2 className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
                        Documents & booking status
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Verify guest identity and update the booking stage.
                      </p>
                    </div>
                  </div>
                  <Badge variant={effectiveBookingStatus === "cancelled" ? "warning" : "success"}>
                    {formatBookingStatus(effectiveBookingStatus)}
                  </Badge>
                </div>

                <div className="mt-5">
                  <BookingJourney status={effectiveBookingStatus} />
                </div>

                <div className="mt-5 space-y-5">
                  <div className="grid gap-4 xl:grid-cols-3">
                    <form
                      className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/20"
                      onSubmit={handleStatusSubmit}
                    >
                      <div className="border-b border-slate-200 bg-linear-to-br from-slate-50 to-white p-4 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
                        <div className="flex items-start gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm shadow-slate-950/20 dark:bg-slate-50 dark:text-slate-950">
                            <FileCheck2 className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                              Booking status
                            </h4>
                            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                              Move this booking through the stay journey.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3 p-4">
                        <div>
                          <Label htmlFor="booking-status">Status</Label>
                          <select
                            id="booking-status"
                            className="mt-2 flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-slate-300"
                            value={effectiveBookingStatus}
                            onChange={(event) => setBookingStatus(event.target.value as BookingStatus)}
                          >
                            {bookingStatusOptions.map((status) => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <Button type="submit" className="w-full" disabled={statusMutation.isPending}>
                          {statusMutation.isPending ? "Updating..." : "Update status"}
                        </Button>
                      </div>
                      {statusMutation.isError ? (
                        <p className="mx-4 mb-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
                          {statusError}
                        </p>
                      ) : null}
                    </form>

                    <form
                      className="min-w-0 overflow-hidden rounded-3xl border border-cyan-100 bg-white shadow-sm shadow-cyan-100/60 dark:border-cyan-900/60 dark:bg-slate-950 dark:shadow-black/20"
                      onSubmit={handleRoomAssignmentSubmit}
                    >
                      <div className="border-b border-cyan-100 bg-linear-to-br from-cyan-50 to-white p-4 dark:border-cyan-900/60 dark:from-cyan-950/30 dark:to-slate-950">
                        <div className="flex items-start gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-600 text-white shadow-sm shadow-cyan-600/20">
                            <DoorOpen className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                              Room assignment
                            </h4>
                            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                              Set the physical room number for this stay.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                        <div className="min-w-0">
                          <Label htmlFor="room-number">Room number</Label>
                          <Input
                            id="room-number"
                            className="mt-2 bg-slate-50 font-semibold dark:bg-slate-900"
                            placeholder="e.g. 302"
                            value={effectiveRoomNumber}
                            onChange={(event) => setRoomNumber(event.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full md:w-auto" disabled={roomAssignmentMutation.isPending}>
                          {roomAssignmentMutation.isPending ? "Assigning..." : "Assign room"}
                        </Button>
                      </div>
                      {roomAssignmentMutation.isError ? (
                        <p className="mx-4 mb-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
                          {roomAssignmentError}
                        </p>
                      ) : null}
                    </form>

                    <form
                      className="min-w-0 overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-950 dark:shadow-black/20"
                      onSubmit={handleNidImageSubmit}
                    >
                      <div className="border-b border-emerald-100 bg-linear-to-br from-emerald-50 to-white p-4 dark:border-emerald-900/60 dark:from-emerald-950/30 dark:to-slate-950">
                        <div className="flex items-start gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/20">
                            <ShieldCheck className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                              Guest document
                            </h4>
                            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                              Upload NID first, then save the uploaded URL.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3 p-4">
                        <div className="grid gap-3 md:grid-cols-[140px_minmax(0,1fr)] md:items-center">
                          <div className="overflow-hidden rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30">
                            {currentNidPreviewUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={currentNidPreviewUrl}
                                alt={selectedNidPreviewUrl ? "Selected NID preview" : "Guest NID preview"}
                                className="h-32 w-full object-cover md:h-28"
                              />
                            ) : (
                              <div className="flex h-32 flex-col items-center justify-center text-emerald-600 dark:text-emerald-300 md:h-28">
                                <Camera className="h-6 w-6" />
                                <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em]">
                                  Preview
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="nid-image">NID image</Label>
                            <Input
                              key={nidImageInputKey}
                              id="nid-image"
                              type="file"
                              accept="image/*"
                              className="mt-2 h-auto min-h-11 py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-700 dark:file:bg-slate-800 dark:file:text-slate-200"
                              onChange={(event) => setNidImageFile(event.target.files?.[0] ?? null)}
                              required
                            />
                            <p className="mt-2 truncate text-xs text-slate-500 dark:text-slate-400">
                              {nidImageFile ? nidImageFile.name : "Select JPG, PNG, or WebP image."}
                            </p>
                          </div>
                        </div>
                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600" disabled={nidImageMutation.isPending || !nidImageFile}>
                          <Upload className="h-4 w-4" />
                          {nidImageMutation.isPending ? "Uploading..." : "Upload & save NID"}
                        </Button>
                      </div>
                      {nidImageMutation.isError ? (
                        <p className="mx-4 mb-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
                          {nidImageError}
                        </p>
                      ) : null}
                    </form>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600 dark:bg-slate-900/80 dark:text-slate-300">
                    Front desk note: confirm the guest document before check-in, then move the booking through the stay journey.
                  </div>

                  {formMessage ? (
                    <p className="rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
                      {formMessage}
                    </p>
                  ) : null}
                </div>
              </Card>

              <Card className="overflow-hidden p-0">
                <div className="border-b border-slate-200 bg-linear-to-r from-slate-50 via-white to-cyan-50 p-5 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950/30 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-200">
                      <UserRound className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">Guest information</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Contact, stay, and booking reference details.
                      </p>
                    </div>
                    </div>
                    <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:ring-slate-800">
                      {stayNights}
                    </span>
                  </div>
                </div>
                <div className="grid gap-0 divide-y divide-slate-200 dark:divide-slate-800 md:grid-cols-2 xl:grid-cols-3 xl:divide-x xl:divide-y-0">
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center gap-2">
                      <UserRound className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
                      <h4 className="font-semibold text-slate-950 dark:text-slate-50">Contact details</h4>
                    </div>
                    <div className="mt-3">
                      <PlainDetail label="Guest name" value={booking.guest_name} />
                      <PlainDetail label="Phone" value={booking.guest_phone ?? booking.phone_number} />
                      <PlainDetail label="Email" value={booking.guest_email ?? booking.email} />
                      <PlainDetail label="Address" value={booking.guest_address ?? booking.address} />
                    </div>
                  </div>
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                      <h4 className="font-semibold text-slate-950 dark:text-slate-50">Stay details</h4>
                    </div>
                    <div className="mt-3">
                      <PlainDetail label="Room" value={booking.room} />
                      <PlainDetail label="Room number" value={effectiveRoomNumber} />
                      <PlainDetail label="Room quantity" value={booking.room_quantity} />
                      <PlainDetail label="Dates" value={getStayDateRange(booking)} />
                      <PlainDetail label="Promo code" value={booking.promo_code} />
                    </div>
                  </div>
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                      <h4 className="font-semibold text-slate-950 dark:text-slate-50">Invoice summary</h4>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {booking.invoice?.invoice_number ?? "No invoice number"}
                    </p>
                    <div className="mt-3">
                      <PlainDetail label="Subtotal" value={formatMoney(booking.invoice?.subtotal)} />
                      <PlainDetail label="Booking number" value={booking.booking_number} />
                      <PlainDetail label="Discount" value={formatMoney(booking.invoice?.discount ?? booking.discount)} />
                      <PlainDetail label="Amount paid" value={formatMoney(booking.invoice?.amount_paid)} />
                      <PlainDetail label="Amount due" value={formatMoney(booking.invoice?.amount_due)} />
                      <PlainDetail label="Total" value={formatBookingTotal(booking)} />
                      <PlainDetail label="Invoice status" value={booking.invoice?.status ?? booking.status} />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
              {/* <Card className="overflow-hidden border-0 bg-linear-to-br from-emerald-600 via-cyan-700 to-slate-950 p-0 text-white shadow-xl shadow-emerald-900/20">
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Badge variant="inverted">Payment desk</Badge>
                      <h3 className="mt-4 text-xl font-semibold">Pay invoice or down payment</h3>
                      <p className="mt-2 text-sm leading-6 text-emerald-50/90">
                        Collect full or partial payment, generate receipt, and keep the booking lifecycle updated.
                      </p>
                    </div>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                      <CreditCard className="h-6 w-6" />
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
                        Paid
                      </p>
                      <p className="mt-2 text-lg font-bold">{formatMoney(booking.invoice?.amount_paid) ?? formatTk(0)}</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
                        Due
                      </p>
                      <p className="mt-2 text-lg font-bold">{formatMoney(booking.invoice?.amount_due) ?? formatBookingTotal(booking)}</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl bg-white/10 p-3 backdrop-blur">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100">
                      <span>Collection progress</span>
                      <span>{paymentProgress}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/15">
                      <div className="h-2 rounded-full bg-white" style={{ width: `${paymentProgress}%` }} />
                    </div>
                  </div>
                </div>
              </Card> */}

              <Card className="p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                    <Banknote className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">Record payment</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Full payment or down payment will create a receipt.
                    </p>
                  </div>
                </div>

                <form className="mt-5 space-y-4" onSubmit={handlePaymentSubmit}>
                  <div>
                    <Label htmlFor="payment-amount">Down payment amount</Label>
                    <Input
                      id="payment-amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      className="mt-2"
                      value={downPaymentAmount}
                      onChange={(event) => setPaymentAmount(event.target.value)}
                      disabled={!hasInvoiceDue}
                      required
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="payment-method">Method</Label>
                      <select
                        id="payment-method"
                        className="mt-2 flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-slate-300"
                        value={paymentMethod}
                        onChange={(event) => setPaymentMethod(event.target.value)}
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="bank_transfer">Bank transfer</option>
                        <option value="mobile_banking">Mobile banking</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="paid-at">Paid date</Label>
                      <Input
                        id="paid-at"
                        type="date"
                        className="mt-2"
                        value={effectivePaidAt}
                        onChange={(event) => setPaidAt(event.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="payment-reference">Reference / transaction ID</Label>
                    <Input
                      id="payment-reference"
                      className="mt-2"
                      placeholder="Optional"
                      value={paymentReference}
                      onChange={(event) => setPaymentReference(event.target.value)}
                    />
                  </div>

                  <div className="grid gap-3">
                    <Button
                      type="submit"
                      name="paymentType"
                      value="full_payment"
                      className="h-auto min-h-11 w-full whitespace-normal px-4 py-2.5 text-center leading-5"
                      disabled={
                        paymentMutation.isPending ||
                        !defaultPaymentAmount ||
                        parseAmount(defaultPaymentAmount) <= 0
                      }
                    >
                      {paymentMutation.isPending ? "Saving payment..." : "Mark paid & create receipt"}
                    </Button>
                    <Button
                      type="submit"
                      name="paymentType"
                      value="down_payment"
                      variant="outline"
                      className="h-auto min-h-11 w-full whitespace-normal px-4 py-2.5 text-center leading-5"
                      disabled={
                        paymentMutation.isPending ||
                        !hasInvoiceDue ||
                        !downPaymentAmount ||
                        parseAmount(downPaymentAmount) <= 0
                      }
                    >
                      {paymentMutation.isPending ? "Saving payment..." : "Save down payment"}
                    </Button>
                  </div>
                </form>
                {paymentMutation.isError ? (
                  <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
                    {paymentError}
                  </p>
                ) : null}
              </Card>

              <Card className="p-5 sm:p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      <FileText className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-xs font-semibold text-slate-950 dark:text-slate-50">Receipt history</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Invoice payments and receipt numbers</p>
                    </div>
                  </div>
                  {booking.invoice?.download_url ? (
                    <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-900">
                      <span className="truncate text-xs font-semibold text-slate-950 dark:text-slate-50">
                        {booking.invoice.invoice_number}
                      </span>
                      <a
                        href={booking.invoice.download_url}
                        onClick={(event) => {
                          event.preventDefault();
                          void downloadFile(booking.invoice!.download_url, `${booking.invoice!.invoice_number}.pdf`, token);
                        }}
                        className={cn(buttonVariants({ size: "sm" }), "h-7 shrink-0 rounded-lg bg-emerald-600 px-2 text-xs text-white hover:bg-emerald-700")}
                      >
                        <Download className="h-3 w-3" />
                        Invoice download
                      </a>
                    </div>
                  ) : null}
                </div>

                <div className="mt-5 space-y-3">
                  {booking.invoice?.payments?.length ? (
                    booking.invoice.payments.map((payment) => (
                      <PaymentItem key={payment.id} payment={payment} token={token} />
                    ))
                  ) : (
                    <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                      No payments or receipts created yet.
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

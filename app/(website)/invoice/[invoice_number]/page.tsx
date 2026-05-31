"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  ReceiptText,
  ShieldCheck,
  WalletCards,
  XCircle,
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getPublicInvoice,
  isPublicInvoicePaid,
  type BookingPaymentDataResponse,
} from "@/lib/tenant-api";
import { cn } from "@/lib/utils";
import { useTenantStore } from "@/store/tenant-store";

function parseAmount(amount: string | number | undefined) {
  if (typeof amount === "number") {
    return amount;
  }

  return Number((amount ?? "").replace(/[^\d.-]/g, "")) || 0;
}

function formatTk(amount: string | number | undefined) {
  return `Tk ${parseAmount(amount).toLocaleString("en-BD")}`;
}

function formatDate(date: string | null | undefined) {
  if (!date) {
    return "Not set";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
}

function formatPaymentType(type: string) {
  return type.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function PaymentRow({ payment }: { payment: BookingPaymentDataResponse }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold text-slate-950">{payment.method}</p>
          <p className="mt-1 text-sm text-slate-500">
            {formatPaymentType(payment.type)} · {formatDate(payment.paid_at)}
          </p>
          {payment.reference ? (
            <p className="mt-2 break-all text-xs text-slate-600">
              Reference: <span className="font-medium">{payment.reference}</span>
            </p>
          ) : null}
        </div>
        <p className="text-xl font-semibold text-slate-950">{formatTk(payment.amount)}</p>
      </div>

      {payment.receipt ? (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-900">
              Receipt {payment.receipt.receipt_number}
            </p>
            <p className="mt-1 text-xs text-emerald-700">
              Issued {formatDate(payment.receipt.issued_at)}
            </p>
          </div>
          {payment.receipt.download_url ? (
            <a
              href={payment.receipt.download_url}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "bg-white")}
            >
              <Download className="h-4 w-4" />
              Download receipt
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default function PublicInvoicePage() {
  const params = useParams();
  const tenant = useTenantStore((state) => state.tenant);
  const invoiceNumber = decodeURIComponent(String(params.invoice_number ?? ""));

  const invoiceQuery = useQuery({
    queryKey: ["public-invoice-view", tenant.id, invoiceNumber],
    queryFn: () => getPublicInvoice(tenant.id, invoiceNumber),
    enabled: Boolean(tenant.id && invoiceNumber),
  });

  const invoice = invoiceQuery.data;
  const isPaid = invoice ? isPublicInvoicePaid(invoice) : false;

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#e0f2fe,transparent_34%),linear-gradient(135deg,#f8fafc_0%,#eef2ff_48%,#f0fdfa_100%)]">
      <Navbar />
      <section className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="absolute left-10 top-10 h-32 w-32 rounded-full bg-sky-300/30 blur-3xl" />
        <div className="absolute bottom-16 right-10 h-40 w-40 rounded-full bg-emerald-300/25 blur-3xl" />

        <div className="relative mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>

        <Card className="relative overflow-hidden border border-white/70 bg-white/90 p-0 shadow-2xl shadow-slate-200/70 backdrop-blur">
          <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
            <aside className="relative overflow-hidden bg-slate-950 px-6 py-8 text-white sm:px-8 lg:py-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.35),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.25),transparent_30%)]" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-100">
                  <ShieldCheck className="h-4 w-4" />
                  Public invoice
                </div>
                <h1 className="mt-6 text-4xl font-semibold tracking-tight">Invoice details</h1>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  View invoice summary, payment history, and download documents.
                </p>

                <div className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                    Invoice number
                  </p>
                  <p className="mt-2 break-all text-2xl font-semibold">
                    {invoice?.invoice_number || invoiceNumber || "Missing"}
                  </p>
                </div>

                {invoice ? (
                  <div className="mt-4 rounded-3xl border border-white/10 bg-white/10 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                      Status
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-950">
                      {isPaid ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <ReceiptText className="h-4 w-4 text-amber-500" />
                      )}
                      {invoice.status}
                    </div>
                  </div>
                ) : null}
              </div>
            </aside>

            <div className="space-y-6 p-6 sm:p-8 lg:p-10">
              {!invoiceNumber ? (
                <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-sm">
                  <div className="flex items-start gap-3">
                    <XCircle className="mt-0.5 h-5 w-5" />
                    <div>
                      <p className="font-semibold">Invoice number missing</p>
                      <p className="mt-1 text-sm">
                        Public invoice page needs an invoice number in the URL.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {invoiceQuery.isLoading ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-slate-950">Loading invoice...</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Please wait while we fetch invoice details.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {invoiceQuery.isError ? (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-red-800 shadow-sm">
                  <div className="flex items-start gap-3">
                    <XCircle className="mt-0.5 h-5 w-5" />
                    <div>
                      <p className="font-semibold">Invoice not available</p>
                      <p className="mt-1 text-sm">
                        {invoiceQuery.error instanceof Error
                          ? invoiceQuery.error.message
                          : "Could not load invoice details."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {invoice ? (
                <>
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-950">Invoice summary</p>
                        <p className="text-sm text-slate-500">Subtotal, discount, and totals</p>
                      </div>
                    </div>
                    <div className="mt-5 space-y-3 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="font-semibold text-slate-950">
                          {formatTk(invoice.subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Discount</span>
                        <span className="font-semibold text-slate-950">
                          {formatTk(invoice.discount)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4 border-t border-slate-200 pt-3 text-base">
                        <span className="font-medium text-slate-700">Total</span>
                        <span className="font-semibold text-slate-950">
                          {formatTk(invoice.total_amount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                        <WalletCards className="h-5 w-5" />
                      </div>
                      <p className="mt-4 text-sm text-emerald-700">Amount paid</p>
                      <p className="mt-1 text-2xl font-semibold text-emerald-950">
                        {formatTk(invoice.amount_paid)}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white">
                        <ReceiptText className="h-5 w-5" />
                      </div>
                      <p className="mt-4 text-sm text-amber-700">Amount due</p>
                      <p className="mt-1 text-2xl font-semibold text-amber-950">
                        {formatTk(invoice.amount_due)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                        <CalendarDays className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-950">Invoice timeline</p>
                        <p className="text-sm text-slate-500">Issued and due dates</p>
                      </div>
                    </div>
                    <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-slate-500">Issued at</p>
                        <p className="mt-1 font-semibold text-slate-950">
                          {formatDate(invoice.issued_at)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-slate-500">Due at</p>
                        <p className="mt-1 font-semibold text-slate-950">
                          {formatDate(invoice.due_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {invoice.payments.length ? (
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="font-semibold text-slate-950">Payments</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Payment method, reference, and receipt downloads
                      </p>
                      <div className="mt-4 space-y-3">
                        {invoice.payments.map((payment) => (
                          <PaymentRow key={payment.id} payment={payment} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                      No payments recorded for this invoice yet.
                    </div>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link href="/" className={cn(buttonVariants(), "flex-1")}>
                      <ArrowLeft className="h-4 w-4" />
                      Back to home
                    </Link>
                    {invoice.download_url ? (
                      <a
                        href={invoice.download_url}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(buttonVariants({ variant: "outline" }), "flex-1")}
                      >
                        <Download className="h-4 w-4" />
                        Download invoice
                      </a>
                    ) : null}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </Card>
      </section>
      <Footer />
    </main>
  );
}

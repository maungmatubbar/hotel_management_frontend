"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Download,
  Loader2,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getPublicInvoiceSslcommerzSuccess,
  isPublicInvoicePaid,
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

export default function PaymentSuccessPage() {
  const params = useParams();
  const tenant = useTenantStore((state) => state.tenant);
  const invoiceNumber = decodeURIComponent(String(params.invoice_number ?? ""));

  const invoiceQuery = useQuery({
    queryKey: ["sslcommerz-success", tenant.id, invoiceNumber],
    queryFn: () => getPublicInvoiceSslcommerzSuccess(tenant.id, invoiceNumber),
    enabled: Boolean(tenant.id && invoiceNumber),
  });

  const invoice = invoiceQuery.data;
  const isPaid = invoice ? isPublicInvoicePaid(invoice) : false;

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#dcfce7,transparent_34%),linear-gradient(135deg,#f8fafc_0%,#eef2ff_46%,#ecfeff_100%)]">
      <Navbar />
      <section className="relative mx-auto flex min-h-[74vh] max-w-5xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="absolute left-8 top-10 h-28 w-28 rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="absolute bottom-16 right-8 h-36 w-36 rounded-full bg-cyan-300/30 blur-3xl" />

        <Card className="relative w-full overflow-hidden border border-white/70 bg-white/90 p-0 shadow-2xl shadow-slate-200/70 backdrop-blur">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative overflow-hidden bg-slate-950 px-6 py-8 text-white sm:px-8 lg:py-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.35),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.25),transparent_30%)]" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
                  <ShieldCheck className="h-4 w-4" />
                  SSLCommerz payment
                </div>
                <h1 className="mt-6 text-4xl font-semibold tracking-tight">
                  Payment verification
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  We are checking your hotel invoice status securely with the payment gateway.
                </p>

                <div className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                    Invoice number
                  </p>
                  <p className="mt-2 break-all text-2xl font-semibold">
                    {invoiceNumber || "Missing"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-6 sm:p-8 lg:p-10">
            {!invoiceNumber ? (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-sm">
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5" />
                  <div>
                    <p className="font-semibold">Invoice number missing</p>
                    <p className="mt-1 text-sm">
                      Payment success page needs an invoice number in the URL.
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
                    <p className="text-lg font-semibold text-slate-950">Verifying payment...</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Please wait while we confirm this invoice.
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
                    <p className="font-semibold">Payment verification failed</p>
                    <p className="mt-1 text-sm">
                      {invoiceQuery.error instanceof Error
                        ? invoiceQuery.error.message
                        : "Could not verify payment status."}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {invoice ? (
              <div
                className={`overflow-hidden rounded-3xl border shadow-sm ${
                  isPaid
                    ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                    : "border-amber-200 bg-amber-50 text-amber-950"
                }`}
              >
                <div className="flex items-start gap-4 p-6">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                      isPaid ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"
                    }`}
                  >
                    {isPaid ? (
                      <CheckCircle2 className="h-7 w-7" />
                    ) : (
                      <Clock3 className="h-7 w-7" />
                    )}
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]">
                      <Sparkles className="h-3.5 w-3.5" />
                      {invoice.status}
                    </div>
                    <p className="mt-3 text-2xl font-semibold">
                      {isPaid ? "Payment successful" : "Payment pending"}
                    </p>
                    <p className="mt-2 text-sm leading-6 opacity-80">
                      Invoice {invoice.invoice_number} has been verified from SSLCommerz.
                    </p>
                  </div>
                </div>

                <div className="grid gap-px bg-white/60 text-sm sm:grid-cols-3">
                  <div className="bg-white/70 p-5">
                    <p className="text-slate-500">Total</p>
                    <p className="mt-1 text-xl font-semibold text-slate-950">
                      {formatTk(invoice.total_amount)}
                    </p>
                  </div>
                  <div className="bg-white/70 p-5">
                    <p className="text-slate-500">Paid</p>
                    <p className="mt-1 text-xl font-semibold text-slate-950">
                      {formatTk(invoice.amount_paid)}
                    </p>
                  </div>
                  <div className="bg-white/70 p-5">
                    <p className="text-slate-500">Due</p>
                    <p className="mt-1 text-xl font-semibold text-slate-950">
                      {formatTk(invoice.amount_due)}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/" className={cn(buttonVariants(), "flex-1")}>
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>
              {invoice?.invoice_number ? (
                <Link
                  href={`/invoice/${encodeURIComponent(invoice.invoice_number)}`}
                  className={cn(buttonVariants({ variant: "secondary" }), "flex-1")}
                >
                  <ReceiptText className="h-4 w-4" />
                  View invoice
                </Link>
              ) : null}
              {invoice?.download_url ? (
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
          </div>
          </div>
        </Card>
      </section>
      <Footer />
    </main>
  );
}

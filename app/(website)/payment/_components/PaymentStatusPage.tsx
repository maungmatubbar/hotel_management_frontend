import Link from "next/link";
import { type ComponentType } from "react";
import { ArrowLeft, RefreshCw, ReceiptText, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PaymentStatusPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  tone: "red" | "amber" | "blue";
  searchParams?: Record<string, string | string[] | undefined>;
};

const toneStyles = {
  red: {
    card: "border-red-200 bg-red-50 text-red-950",
    icon: "bg-red-600 text-white",
    glow: "bg-red-300/30",
    pill: "bg-red-100 text-red-800",
  },
  amber: {
    card: "border-amber-200 bg-amber-50 text-amber-950",
    icon: "bg-amber-500 text-white",
    glow: "bg-amber-300/30",
    pill: "bg-amber-100 text-amber-800",
  },
  blue: {
    card: "border-blue-200 bg-blue-50 text-blue-950",
    icon: "bg-blue-600 text-white",
    glow: "bg-blue-300/30",
    pill: "bg-blue-100 text-blue-800",
  },
};

function getParam(params: PaymentStatusPageProps["searchParams"], key: string) {
  const value = params?.[key];

  return Array.isArray(value) ? value[0] : value;
}

export function PaymentStatusPage({
  eyebrow,
  title,
  description,
  icon: Icon,
  tone,
  searchParams,
}: PaymentStatusPageProps) {
  const invoiceNumber =
    getParam(searchParams, "invoice_number") ??
    getParam(searchParams, "invoice") ??
    getParam(searchParams, "invoice_id");
  const transactionId =
    getParam(searchParams, "tran_id") ??
    getParam(searchParams, "transaction_id") ??
    getParam(searchParams, "val_id");
  const styles = toneStyles[tone];

  return (
    <main className="hotel-page-bg min-h-screen overflow-hidden">
      <Navbar />
      <section className="relative mx-auto flex min-h-[74vh] max-w-5xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className={cn("absolute left-8 top-10 h-32 w-32 rounded-full blur-3xl", styles.glow)} />
        <div className="absolute bottom-16 right-8 h-36 w-36 rounded-full bg-cyan-300/25 blur-3xl" />

        <Card className="relative w-full overflow-hidden border border-white/70 bg-white/90 p-0 shadow-2xl shadow-slate-200/70 backdrop-blur">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative overflow-hidden bg-slate-950 px-6 py-8 text-white sm:px-8 lg:py-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.3),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(20,184,166,0.25),transparent_30%)]" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                  <ShieldCheck className="h-4 w-4" />
                  {eyebrow}
                </div>
                <h1 className="mt-6 text-4xl font-semibold tracking-tight">{title}</h1>
                <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>

                <div className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                    Gateway callback
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    This page confirms the SSLCommerz callback reached the hotel booking app.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-6 sm:p-8 lg:p-10">
              <div className={cn("overflow-hidden rounded-3xl border shadow-sm", styles.card)}>
                <div className="flex items-start gap-4 p-6">
                  <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl", styles.icon)}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <div>
                    <div className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]", styles.pill)}>
                      Payment update
                    </div>
                    <p className="mt-3 text-2xl font-semibold">{title}</p>
                    <p className="mt-2 text-sm leading-6 opacity-80">{description}</p>
                  </div>
                </div>
              </div>

              {(invoiceNumber || transactionId) ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                      <ReceiptText className="h-5 w-5" />
                    </div>
                    <div className="space-y-3">
                      <p className="font-semibold text-slate-950">Payment reference</p>
                      {invoiceNumber ? (
                        <p className="break-all">
                          <span className="font-medium text-slate-500">Invoice:</span>{" "}
                          <span className="font-semibold text-slate-950">{invoiceNumber}</span>
                        </p>
                      ) : null}
                      {transactionId ? (
                        <p className="break-all">
                          <span className="font-medium text-slate-500">Transaction:</span>{" "}
                          <span className="font-semibold text-slate-950">{transactionId}</span>
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/" className={cn(buttonVariants(), "flex-1")}>
                  <ArrowLeft className="h-4 w-4" />
                  Back to home
                </Link>
                <Link href="/#booking" className={cn(buttonVariants({ variant: "outline" }), "flex-1")}>
                  <RefreshCw className="h-4 w-4" />
                  Try booking again
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </section>
      <Footer />
    </main>
  );
}

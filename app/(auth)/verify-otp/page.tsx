import Link from "next/link";
import { OTPForm } from "@/components/forms/OTPForm";

export default function VerifyOtpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-md">
        <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-950">
          Back to login
        </Link>
        <div className="mt-6 rounded-2xl bg-slate-950 p-8 text-white">
          <p className="text-sm font-medium text-cyan-200">OTP verification</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Check your messages</h1>
          <p className="mt-3 text-sm leading-6 text-white/65">
            Use the code sent to your phone when you choose the OTP login option.
          </p>
        </div>
        <div className="-mt-4 px-3">
          <OTPForm />
        </div>
      </section>
    </main>
  );
}

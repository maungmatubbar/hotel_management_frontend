import Link from "next/link";
import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
      <section className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="text-lg font-semibold">
          HotelOS
        </Link>
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-cyan-200">
            Secure login
          </p>
          <h1 className="mt-5 max-w-xl text-5xl font-semibold tracking-tight">
            Email, phone, password, and OTP access for every role.
          </h1>
        </div>
        <p className="text-sm text-white/60">Laravel Sanctum ready UI, token wiring pending.</p>
      </section>

      <section className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-slate-950">
              Back to hotels
            </Link>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">
              Login to your account
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Use your email or phone number with password, or continue with phone OTP.
            </p>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}

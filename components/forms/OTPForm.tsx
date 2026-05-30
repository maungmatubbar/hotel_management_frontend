export function OTPForm() {
  return (
    <form className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="otp">
          Verification code
        </label>
        <input
          id="otp"
          inputMode="numeric"
          placeholder="Enter 6 digit OTP"
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-lg font-semibold tracking-[0.5em] outline-none transition placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:border-slate-950"
        />
      </div>
      <button className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
        Verify and continue
      </button>
      <button type="button" className="w-full text-sm font-medium text-slate-600 hover:text-slate-950">
        Resend OTP
      </button>
    </form>
  );
}

"use client";

import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

type NotifyPopupProps = {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  duration?: number;
};

export function NotifyPopup({ isOpen, title, message, onClose, duration = 3000 }: NotifyPopupProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timer = window.setTimeout(onClose, duration);

    return () => window.clearTimeout(timer);
  }, [duration, isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-60 w-[calc(100%-2rem)] max-w-sm sm:right-6 sm:top-6">
      <div
        role="status"
        aria-live="polite"
        className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/30"
      >
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-50">{title}</h3>
          <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">{message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-200"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

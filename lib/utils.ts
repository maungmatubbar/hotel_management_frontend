import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyAmount(
  amount: string | number | null | undefined,
  defaultCurrency = "TK"
) {
  if (amount === null || amount === undefined || amount === "") {
    return "";
  }

  const rawAmount = String(amount).trim();
  const currency = rawAmount.includes("$")
    ? "$"
    : rawAmount.toLowerCase().includes("tk")
      ? "TK"
      : defaultCurrency;
  const numericValue = Number(rawAmount.replace(/[^0-9.-]/g, ""));

  if (!Number.isFinite(numericValue)) {
    return rawAmount;
  }

  const formattedAmount = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(numericValue);

  return currency === "$" ? `${currency}${formattedAmount}` : `${currency} ${formattedAmount}`;
}

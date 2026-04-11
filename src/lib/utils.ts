import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const currencySymbols: Record<string, string> = {
  PEN: "S/",
  USD: "$",
  EUR: "€",
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string) {
  const symbol = currencySymbols[currency] || currency;
  return `${symbol} ${amount.toFixed(2)}`;
}

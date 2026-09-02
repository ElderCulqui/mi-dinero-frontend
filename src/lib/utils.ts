import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale"

const currencySymbols: Record<string, string> = {
  PEN: "S/",
  USD: "$",
  EUR: "€",
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number, 
  currency: string, 
  decimal: number
): string {
  const symbol = currencySymbols[currency] || currency;
  return `${symbol} ${amount.toFixed(decimal)}`;
}

export function formatDate(
  value: string | Date,
  pattern = "d/M/yyyy H:mm",
): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, pattern, { locale: es })
}
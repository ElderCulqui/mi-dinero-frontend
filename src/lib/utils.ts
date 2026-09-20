import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { currencyOptions, type Currency } from "@/types/currency";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = error.response;

    if (typeof response === "object" && response !== null && "data" in response) {
      const data = response.data;

      if (
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
      ) {
        return data.message;
      }
    }
  }

  return fallback;
}

export function formatCurrency(
  amount: number, 
  currency: string, 
  decimal = 2
): string {
  const symbol = currencyOptions[currency as Currency]?.symbol || currency;
  return `${symbol} ${amount.toFixed(decimal)}`;
}

export function formatDate(
  value: string | Date,
  pattern = "d/M/yyyy H:mm a",
): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, pattern, { locale: es });
}

import { z } from "zod";
import type { Currency } from "./currency";

export interface Card {
  id: string;
  name: string;
  brand: string;
  bankCurrency: Currency;
  isActive: boolean;
}

export const cardSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres"),
  brand: z.string().min(1, "La marca es obligatoria"),
  bankCurrency: z.enum(["USD", "PEN"]),
  isActive: z.boolean(),
});

export type CardFormData = z.input<typeof cardSchema>;

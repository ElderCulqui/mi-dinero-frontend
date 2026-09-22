import { z } from "zod";
import type { TransactionType } from "./transactionType";

export interface Category {
  id: string;
  userId: number;
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres"),
  type: z.string(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export type CategoryFormData = z.input<typeof categorySchema>;

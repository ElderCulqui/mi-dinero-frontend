import { z } from "zod";

export type AccountType = "efectivo" | "cuenta_bancaria" | "tarjeta_credito";

export interface Account {
  id: string;
  userId: number;
  name: string;
  type: AccountType;
  balance: number;
  creditLimit?: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export const accountSchema = z
  .object({
    name: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(50, "El nombre no puede exceder 50 caracteres"),
    type: z.string(),
    userId: z.number("El ID de usuario debe ser un número"),
    balance: z.number().optional(),
    creditLimit: z.number().optional(),
    isActive: z.boolean().default(true),
    isDefault: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.type === "tarjeta_credito") {
        return (
          data.creditLimit !== null &&
          data.creditLimit !== undefined &&
          data.creditLimit > 0
        );
      }
      return true;
    },
    {
      message:
        "El límite de crédito es obligatorio y debe ser mayor a 0 para cuentas de tipo 'tarjeta_credito'",
      path: ["creditLimit"],
    },
  );

export type AccountFormData = z.infer<typeof accountSchema>;

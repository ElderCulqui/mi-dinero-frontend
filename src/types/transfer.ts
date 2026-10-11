import { z } from "zod";
import type { Currency } from "./currency"

export interface TransferAccount {
    id: number;
    name: string;
    currency: Currency;
}

export interface Transfer {
    id: number;
    userId: number;
    fromAccountId: number;
    toAccountId: number;
    fromAmount: number;
    toAmount: number;
    fromCurrency: Currency;
    toCurrency: Currency;
    rate: number | null;
    date: string;
    description: string | null;
    fromTxnId: number | null;
    toTxnId: number | null;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    fromAccount?: TransferAccount;
    toAccount?: TransferAccount;
}

export const transferSchema = z
    .object({
        fromAccountId: z.number({ error: "Selecciona la cuenta origen" }).int().positive(),
        toAccountId: z.number({ error: "Selecciona la cuenta destino" }).int().positive(),
        fromAmount: z.number({ error: "Ingresa el monto de origen" }).min(0.01, "Debe ser mayor a 0"),
        toAmount: z.number().min(0.01, "Debe ser mayor a 0").nullable().optional(),
        rate: z.number().min(0, "Debe ser >= 0").nullable().optional(),
        date: z.string({ error: "La fecha es obligatoria" }).min(1, "La fecha es obligatoria"),
        description: z.string().max(255).optional()    
    })
    .refine((d) => d.fromAccountId !== d.toAccountId, {
        message: "Las cuentas de origen y destino deben ser distintas",
        path: ["toAccountId"],
    });

export type TransferFormData = z.input<typeof transferSchema>;
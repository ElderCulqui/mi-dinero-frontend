import { z } from "zod";
import type { Contact } from "./contact";
import type { Transaction } from "./transaction";

export type ShareStatus = "pendiente" | "cobrado";

export interface TransactionShare {
    id: number;
    transactionId: number;
    contactId: number;
    amount: number;
    status: ShareStatus;
    paidDate: string | null;
    settlementRate: number | null;
    settlementCurrency: "PEN" | "USD" | null;
    settlementAmount: number | null;
    reimbursementTxnId: number | null;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    contact?: Contact;
    reimbursementTxn?: Transaction;
}

export const collectShareSchema = z.object({
    accountId: z.number({ error: "Selecciona una cuenta" }).int().positive(),
    settlementAmount: z
        .number({ error: "Ingresa el monto recibido" })
        .min(0.01, "Debe ser mayor a 0"),
    settlementRate: z.number().min(0, "Debe ser mayor o igual a 0").nullable().optional(),
    date: z.string().optional(),
    categoryId: z.number().int().positive().nullable().optional(),
    description: z.string().max(255).optional(),
});

export type CollectShareFormData = z.input<typeof collectShareSchema>;

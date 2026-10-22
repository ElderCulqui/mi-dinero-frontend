import { z } from "zod";
import type { Currency } from "./currency";

export type LoanStatus = "activo" | "pagado";

export type PayStatus = "pendiente" | "parcial" | "pagado" | "atrasado";

export interface LoanAccount {
    id: number;
    name: string;
    currency: Currency;
}

export interface LoanCategory {
    id: number;
    name: string;
}

export interface LoanPayment {
    id: number;
    loanId: number;
    number: number;
    dueDate: string;
    amount: number;
    paidAmount: number;
    status: PayStatus;
    paidDate: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

export interface Loan {
    id: number;
    userId: number;
    name: string;
    currency: Currency;
    principal: number;
    totalAmount: number;
    interestRate: number | null;
    termMonths: number;
    startDate: string;
    status: LoanStatus;
    accountId: number | null;
    categoryId: number | null;
    description: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    payments?: LoanPayment[];
    account?: LoanAccount | null;
    category?: LoanCategory | null;
}

export interface LoanUpdateData {
    name?: string;
    description?: string | null;
    accountId?: number | null;
    categoryId?: number | null;
}

export const loanSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio").max(100, "Máximo 100 caracteres"),
    currency: z.enum(["PEN", "USD"]),
    principal: z.number({ error: "Ingresa el capital" }).min(0.01, "Debe ser mayor a 0"),
    totalAmount: z.number({ error: "Ingresa el monto total" }).min(0.01, "Debe ser mayor a 0"),
    interestRate: z.number().min(0, "Debe ser >= 0").max(9.9999).nullable().optional(),
    termMonths: z.number({ error: "Ingresa el número de cuotas" }).int().min(1, "Mínimo 1").max(999),
    startDate: z.string({ error: "La fecha de inicio es obligatoria"}).min(1, "La fecha de inicio es obligatoria"),
    accountId: z.number().int().positive().nullable().optional(),
    categoryId: z.number().int().positive().nullable().optional(),
    description: z.string().max(500, "Máximo 500 caracteres").optional(),
});

export type LoanFormData = z.input<typeof loanSchema>;

export const payLoanSchema = z.object({
    amount: z.number({ error: "Ingresa el monto" }).min(0.01, "Debe ser mayor a 0"),
    date: z.string().optional(),
    accountId: z.number().int().positive().nullable().optional(),
    categoryId: z.number().int().positive().nullable().optional(),
    description: z.string().max(500).optional(),
})

export type PayLoanFormData = z.input<typeof payLoanSchema>;
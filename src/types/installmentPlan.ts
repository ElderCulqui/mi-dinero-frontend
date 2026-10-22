import { z } from "zod";
import type { Currency } from "./currency";
import type { PayStatus } from "./loan";

export type PlanStatus = "activo" | "pagado";

export interface Installment {
    id: number;
    installmentPlanId: number;
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

export interface InstallmentPlanCreditCard {
    id: number;
    name: string;
    bankCurrency: Currency;
}

export interface InstallmentPlan {
    id: number;
    userId: number;
    creditCardId: number;
    categoryId: number | null;
    description: string;
    currency: Currency;
    totalAmount: number;
    installments: number;
    amountPerInstallment: number;
    startDate: string;
    firstDueDate: string;
    status: PlanStatus;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;  
    installments_?: Installment[];
    creditCard?: InstallmentPlanCreditCard;
    category?: { id: number; name: string } | null;
}

export interface InstallmentPlanUpdateData {
    description?: string;
    categoryId?: number | null;
}

export const installmentPlanSchema = z.object({
    creditCardId: z.number({ error: "Selecciona una tarjeta" }).int().positive(),
    description: z.string().min(1, " La descripción es obligatoria").max(255, "Máximo 255 caracteres"),
    totalAmount: z.number({ error: "Ingresa el monto total" }).min(0.01, "Debe ser mayor a 0"),
    installments: z.number({ error: "Ingresa el número de cuotas" }).int().min(1, "Mínimo 1").max(999),
    startDate: z.string({ error: "La fecha de compra es obligatoria" }).min(1, "La fecha de compra es obligatoria"),
    firstDueDate: z.string({ error: "La primera fecha de pago es obligatoria" }).min(1, "La primera fecha de pago es obligatoria"),
    categoryId: z.number().int().positive().nullable().optional(),
});

export type InstallmentPlanFormData = z.input<typeof installmentPlanSchema>;

export const payInstallmentSchema = z.object({
    amount: z.number({ error: "Ingresa el monto" }).min(0.01, "Debe ser mayor a 0"),
    date: z.string().optional(),
    categoryId: z.number().int().positive().nullable().optional(),
    description: z.string().max(500).optional(),
});

export type PayInstallmentFormData = z.input<typeof payInstallmentSchema>;
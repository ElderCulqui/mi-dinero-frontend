import z from "zod";

export type CycleStatus = "abierto" | "cerrado" | "pagado"

export interface BillingCycle {
    id: number;
    userId: number;
    creditCardId: number;
    periodStart: string;
    periodEnd: string;
    dueDate: string;
    bankAmount: number | null;
    status: CycleStatus;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export const billingCycleSchema = z
    .object({
        periodStart: z.string().min(1, "La fecha inicial es obligatoria"),
        periodEnd: z.string().min(1, "La fecha final es obligatoria"),
        dueDate: z.string().min(1, "La fecha de vencimiento es obligatoria"),
        bankAmount: z.number().min(0).nullable().optional(),
        status: z.enum(["abierto", "cerrado", "pagado"]),
    })
    .refine(
        (data) =>
            new Date(data.periodStart) < new Date(data.periodEnd),
        {
            message: "El inicio debe ser anterior al final del periodo",
            path: ["periodEnd"],
        },
    );

export type BillingCycleFormData = z.input<typeof billingCycleSchema>
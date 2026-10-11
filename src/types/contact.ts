import { z } from "zod";

export interface Contact {
    id: number;
    userId: number;
    name: string;
    note?: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

export const contactSchema = z.object({
    name: z
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede exceder 50 caracteres"),
    note: z.string().max(255, "La nota no puede exceder 255 caracteres").optional()
})

export type ContactFormData = z.input<typeof contactSchema>;
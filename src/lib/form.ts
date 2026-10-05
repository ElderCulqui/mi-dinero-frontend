import axios from "axios";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

interface ApiValidationError {
    path?: string;
    msg?: string;
}

export function applyApiErrors<T extends FieldValues>(
    error: unknown,
    form: UseFormReturn<T>,
    fallback: string,
): string {
    if (!axios.isAxiosError(error)) {
        return fallback;
    }

    const data = error.response?.data as
        | { errors?: ApiValidationError[]; error?: string; message?: string }
        | undefined;

    const validationErrors = data?.errors;

    if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        for (const apiError of validationErrors) {
            const path = apiError.path as FieldPath<T> | undefined;
            const message = apiError.msg ?? fallback;

            if (path && path in form.getValues()) {
                form.setError(path, { type: "server", message });
            } else {
                form.setError("root", { type: "server", message });
            }
        }

        return validationErrors[0]?.msg ?? fallback;
    }

    return data?.message ?? data?.error ?? fallback;
}

export const numberOrUndefined = (value: string): number | undefined => {
    if (value === "") return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
}

export const numberOrNull = (value: string): number | null => {
    if (value === "") return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
}

export const toDateTimeLocal = (value: string | Date): string => {
    const date = typeof value === "string" ? new Date(value) : value;
    const pad = (n: number) => String(n).padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
import type React from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";

interface FormFieldProps<T extends FieldValues, N extends FieldPath<T>> {
    form: UseFormReturn<T>;
    name: N;
    label?: React.ReactNode;
    description?: React.ReactNode;
    orientation?: "vertical" | "horizontal";
    className?: string;
    children: (state: { invalid: boolean }) => React.ReactNode;
}

export default function FormField<T extends FieldValues, N extends FieldPath<T>>({
    form,
    name,
    label,
    description,
    orientation = "vertical",
    className,
    children
}: FormFieldProps<T, N>) {
    const error = form.formState.errors[name] as
        | { message?: string }
        | undefined;
    
    const invalid = Boolean(error);

    return (
        <Field orientation={orientation} className={className}>
            {label ? (
                <FieldLabel htmlFor={String(name)}>{label}</FieldLabel>
            ): null}

            {children({ invalid })}

            <FieldError errors={[error]} />

            {description ? (
                <FieldDescription>{description}</FieldDescription>
            ) : null}
        </Field>
    );
}
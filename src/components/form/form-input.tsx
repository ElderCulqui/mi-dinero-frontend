import type { ComponentProps, ReactNode } from "react";
import type {
    FieldPath,
    FieldValues,
    UseFormReturn,
} from "react-hook-form";

import { Input } from "@/components/ui/input";
import FormField from "./form-field";

interface FormInputProps<T extends FieldValues, N extends FieldPath<T>> 
    extends Omit<ComponentProps<typeof Input>, "form" | "name"> {
    form: UseFormReturn<T>;
    name: N;
    label?: ReactNode; 
    description?: ReactNode; 
    orientation?: "vertical" | "horizontal";
    transform?: (raw: string) => T[N] | undefined;
}

export default function FormInput<
    T extends FieldValues,
    N extends FieldPath<T>
>({
    form,
    name,
    label,
    description,
    orientation,
    transform,
    ...inputProps
}: FormInputProps<T, N>) {
    const registration = form.register(
        name,
        transform ? { setValueAs: transform } : undefined,
    );

    return (
        <FormField
            form={form}
            name={name}
            label={label}
            description={description}
            orientation={orientation}
        >
            {({ invalid }) => (
                <Input 
                    id={String(name)}
                    aria-invalid={invalid}
                    {...inputProps}
                    {...registration}
                />
            )}
        </FormField>
    )
}
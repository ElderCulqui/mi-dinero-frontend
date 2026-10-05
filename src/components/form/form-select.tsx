import type { ReactNode } from "react";
import {
    Controller,
    type FieldPath,
    type FieldValues,
    type UseFormReturn,
} from "react-hook-form";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import FormField from "./form-field";

type SelectOption<V> = { value: V; label: ReactNode };

interface FormSelectProps<
    T extends FieldValues, 
    N extends FieldPath<T>, 
    V = NonNullable<T[N]>
> {
    form: UseFormReturn<T>;
    name: N;
    label?: ReactNode; 
    placeholder?: string; 
    description?: ReactNode; 
    orientation?: "vertical" | "horizontal";
    options: SelectOption<V>[];
    nullable?: boolean;
    disabled?: boolean; 
    className?: string;
}

export default function FormSelect<
    T extends FieldValues,
    N extends FieldPath<T>,
    V = NonNullable<T[N]>
>({
    form,
    name,
    label,
    placeholder,
    description,
    orientation,
    options,
    nullable = false,
    disabled = false,
    className
}: FormSelectProps<T, N, V>) {
    return (
        <FormField
            form={form}
            name={name}
            label={label}
            description={description}
            orientation={orientation}
        >
            {({ invalid }) => (
                <Controller
                    control={form.control}
                    name={name}
                    render={({ field }) => (
                        <Select
                            items={options}
                            value={field.value ?? null}
                            onValueChange={(value) => field.onChange(value)}
                            disabled={disabled}
                        >
                            <SelectTrigger
                                id={String(name)}
                                className={className}
                                aria-invalid={invalid}
                                disabled={disabled}
                            >
                                <SelectValue placeholder={placeholder} />
                            </SelectTrigger>

                            <SelectContent>
                                {nullable ? (
                                    <SelectItem value={null}>
                                        {placeholder ?? "Sin selección"}
                                    </SelectItem>
                                ): null}

                                {options.map((option) => (
                                    <SelectItem
                                        key={String(option.value)}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                >

                </Controller>
            )}
        </FormField>
    )
}
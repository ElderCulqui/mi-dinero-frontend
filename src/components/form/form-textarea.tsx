import type { ComponentProps, ReactNode } from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

import { Textarea } from "@/components/ui/textarea";
import FormField from "./form-field";

interface FormTextareaProps<T extends FieldValues, N extends FieldPath<T>>
  extends Omit<ComponentProps<typeof Textarea>, "form" | "name"> {
  form: UseFormReturn<T>;
  name: N;
  label?: ReactNode;
  description?: ReactNode;
  orientation?: "vertical" | "horizontal";
}

export default function FormTextarea<
  T extends FieldValues,
  N extends FieldPath<T>,
>({
  form,
  name,
  label,
  description,
  orientation,
  ...textareaProps
}: FormTextareaProps<T, N>) {
  const registration = form.register(name);

  return (
    <FormField
      form={form}
      name={name}
      label={label}
      description={description}
      orientation={orientation}
    >
      {({ invalid }) => (
        <Textarea
          id={String(name)}
          aria-invalid={invalid}
          {...textareaProps}
          {...registration}
        />
      )}
    </FormField>
  );
}
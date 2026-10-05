import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

interface FormActionsProps {
    onCancel?: () => void;
    submitLabel: string;
    cancelLabel?: string;
    isSubmitting?: boolean;
}

export default function FormActions({
    onCancel,
    submitLabel,
    cancelLabel = "Cancelar",
    isSubmitting = false
}: FormActionsProps) {
    return (
        <Field orientation="horizontal" className="justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
                {cancelLabel}
            </Button>

            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {submitLabel}
            </Button>

        </Field>
    )
}
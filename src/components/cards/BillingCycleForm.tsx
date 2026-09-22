import { billingCycleService } from '@/services/billingCycleService';
import { billingCycleSchema, type BillingCycle, type BillingCycleFormData } from '@/types/billingCycle';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Field, FieldError, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

type Props = {
    cardId: string;
    cycle?: BillingCycle;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function BillingCycleForm({ cardId, cycle, onSuccess, onCancel}: Props) {
    const form = useForm<BillingCycleFormData>({
        resolver: zodResolver(billingCycleSchema),
        defaultValues: {
            periodStart: cycle
            ? cycle.periodStart.slice(0, 10)
            : "",
            periodEnd: cycle
            ? cycle.periodEnd.slice(0, 10)
            : "",
            dueDate: cycle
            ? cycle.dueDate.slice(0, 10)
            : "",
            bankAmount: cycle?.bankAmount ?? null,
            status: cycle?.status ?? "abierto",
        },
    })

    const onSubmit = async (data: BillingCycleFormData) => {
        const payload = {
            ...data,
            periodStart: `${data.periodStart}T00:00:00.000Z`,
            periodEnd: `${data.periodEnd}T23:59:59.999Z`,
            dueDate: `${data.dueDate}T00:00:00.000Z`,
        }
        
        try {
            if (cycle) {
                await billingCycleService.update(cycle.id, payload);
            } else {
                await billingCycleService.create(cardId, payload);
            }
    
            onSuccess?.();
        } catch (error: unknown) {
            const apiErrors = axios.isAxiosError(error)
                ? error.response?.data?.errors
                : undefined;

            if (Array.isArray(apiErrors)) {
                for (const apiError of apiErrors) {
                    const field = apiError.path as keyof BillingCycleFormData;
                    if (field in form.getValues()) {
                        form.setError(field, {
                            type: "server",
                            message: apiError.msg,
                        });
                    } else {
                        form.setError("root", {
                            type: "server",
                            message: apiError.msg,
                        })
                    }
                }
            }
        }
    }
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Field>
            <FieldLabel htmlFor="bc-period-start">Inicio del periodo</FieldLabel>
            <Input
                id="bc-period-start"
                type="date"
                {...form.register("periodStart")}
            />
            <FieldError errors={[form.formState.errors.periodStart]} />
        </Field>
        <Field>
            <FieldLabel htmlFor="bc-period-end">Fin del periodo</FieldLabel>
            <Input
                id="bc-period-end"
                type="date"
                {...form.register("periodEnd")}
            />
            <FieldError errors={[form.formState.errors.periodEnd]} />
        </Field>
        <Field>
            <FieldLabel htmlFor="bc-due-date">Último día de pago</FieldLabel>
            <Input
                id="bc-due-date"
                type="date"
                {...form.register("dueDate")}
            />
            <FieldError errors={[form.formState.errors.dueDate]} />
        </Field>
        <Field>
            <FieldLabel htmlFor="bc-bank-amount">Importe bancario</FieldLabel>
            <Input
                id="bc-bank-amount"
                type="number"
                min={0}
                step={0.01}
                {...form.register("bankAmount", {
                    setValueAs: (value) => value === "" ? null : Number(value),
                })}
            />
            <FieldError errors={[form.formState.errors.bankAmount]} />
        </Field>

        <Field>
            <FieldLabel>Moneda de la tarjeta</FieldLabel>
            <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                    <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                    >
                    <SelectTrigger className="w-full" aria-invalid={!!form.formState.errors.status}>
                        <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="abierto">Abierto</SelectItem>
                        <SelectItem value="cerrado">Cerrado</SelectItem>
                        <SelectItem value="pagado">Pagado</SelectItem>
                    </SelectContent>
                    </Select>
                )}
            />
            <FieldError errors={[form.formState.errors.status]} />
      </Field>     
      {form.formState.errors.root && (
        <FieldError errors={[form.formState.errors.root]} />
      )}

      <Field orientation="horizontal" className="justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {cycle ? "Actualizar ciclo" : "Crear ciclo"}
        </Button>
      </Field>
    </form>
  )
}
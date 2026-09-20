import { billingCycleService } from '@/services/billingCycleService';
import { billingCycleSchema, type BillingCycle, type BillingCycleFormData } from '@/types/billingCycle';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react'
import { useForm } from 'react-hook-form';

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

        if (cycle) {
            await billingCycleService.update(cycle.id, payload);
        } else {
            await billingCycleService.create(cardId, payload);
        }

        onSuccess?.();
    }
  return (
    <div>BillingCycleForm</div>
  )
}
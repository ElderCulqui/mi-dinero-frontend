import { applyApiErrors, numberOrUndefined, toDateTimeLocal } from '@/lib/form';
import { accountService } from '@/services/accountService';
import { exchangeRateService } from '@/services/exchangeRateService';
import { transferService } from '@/services/transferService';
import type { Account } from '@/types/account';
import { transferSchema, type Transfer, type TransferFormData } from '@/types/transfer'
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { FormActions, FormInput, FormSelect } from '../form';
import { formatCurrency } from '@/lib/utils';
import { FieldError } from '../ui/field';

interface Props {
    transfer?: Transfer;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const toDirectRate = (from?: string, to?: string, marketRate?: number | null) => {
    if (marketRate === null || marketRate === undefined || marketRate <= 0) return null;
    if (from === "USD" && to === "PEN") return marketRate;
    if (from === "PEN" && to === "USD") return 1 / marketRate;
    return marketRate;
};

const toMarketRate = (from?: string, to?: string, directRate?: number | null) => {
    if (directRate === null || directRate === undefined) return null;
    if (from === "USD" && to === "PEN") return directRate;
    if (from === "PEN" && to === "USD") return directRate > 0 ? 1 / directRate : null;
    return directRate;
};

export default function TransferForm({ transfer, onSuccess, onCancel }: Props) {
    const isEditing = !!transfer;
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loadingAccounts, setLoadingAccounts] = useState(true);
    const [loadingRate, setLoadingRate] = useState(false);
    const [latestRate, setLatestRate] = useState<number | null>(null);

    const form = useForm<TransferFormData>({
        resolver: zodResolver(transferSchema),
        defaultValues: {
            fromAccountId: transfer?.fromAccountId,
            toAccountId: transfer?.toAccountId,
            fromAmount: transfer?.fromAmount ?? undefined,
            toAmount: transfer?.toAmount ?? null,
            rate: toMarketRate(transfer?.fromCurrency, transfer?.toCurrency, transfer?.rate),
            date: toDateTimeLocal(transfer?.date ?? new Date()),
            description: transfer?.description ?? "",
        }
    })

    const fromAccountId = useWatch({ control: form.control, name: "fromAccountId" });
    const toAccountId = useWatch({ control: form.control, name: "toAccountId" });
    const fromAmount = useWatch({ control: form.control, name: "fromAmount" });
    const rate = useWatch({ control: form.control, name: "rate" });
    const toAmountInput = useWatch({ control: form.control, name: "toAmount" });

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoadingAccounts(true);
            try {
                const list = await accountService.getAll();
                if (!cancelled) setAccounts(list);
            } catch (error) {
                if (!cancelled) toast.error("No se pudieron cargar las cuentas");
            } finally {
                if (!cancelled) setLoadingAccounts(false);
            }
        };
        void load();
        return () => {
            cancelled = true;
        };
    }, []);

    const accountOptions = useMemo(
        () =>
            accounts.map((account) => ({
                value: Number(account.id),
                label: account.currency
                    ? `${account.name} (${account.currency})`
                    : account.name,
            })),
        [accounts],
    );

    const fromAccount = accounts.find((a) => Number(a.id) === fromAccountId);
    const toAccount = accounts.find((a) => Number(a.id) === toAccountId);
    const isCrossCurrency = !!fromAccount && !!toAccount && fromAccount.currency !== toAccount.currency;

    useEffect(() => {
        if (!isCrossCurrency || !fromAccount?.currency || !toAccount?.currency) return;

        let cancelled = false;
        const loadRate = async () => {
            setLoadingRate(true);
            try {
                const latest = await exchangeRateService.getLatest("USD", "PEN");
                if (cancelled) return;

                setLatestRate(latest.rate);

                if (!form.getValues("rate")) {
                    form.setValue("rate", Number(latest.rate.toFixed(4)), {
                        shouldDirty: false,
                    });
                }
            } catch {
                if (!cancelled) setLatestRate(null);
            } finally {
                if (!cancelled) setLoadingRate(false);
            }
        };

        void loadRate();
        return () => {
            cancelled = true;
        };
    }, [isCrossCurrency, fromAccount?.currency, toAccount?.currency, form]);

    const previewToAmount = (() => {
        if (!isCrossCurrency) return null;

        if (rate) {
            const direct = toDirectRate(fromAccount?.currency, toAccount?.currency, rate);
            if (direct !== null && fromAmount) {
                return Number((fromAmount * direct).toFixed(2));
            }
        }

        if (toAmountInput) return Number(toAmountInput.toFixed(2));
        return null;
    })();

    const onSubmit = async (data: TransferFormData) => {
        try {
            const payload = {
                ...data,
                date: new Date(data.date).toISOString(),
                toAmount: isCrossCurrency ? data.toAmount ?? null : null,
                rate: isCrossCurrency
                ? toDirectRate(fromAccount?.currency, toAccount?.currency, data.rate)
                : null,
            };

            if (isEditing) {
                await transferService.update(transfer.id, payload);
                toast.success("Transferencia actualizada existosamente");
            } else {
                await transferService.create(payload);
                toast.success("Transferencia creada existosamente");
            }
            onSuccess?.();
        } catch (error: unknown) {
            toast.error(
                applyApiErrors(error, form, "Error al guardar la transferencia")
            );
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormSelect
                form={form}
                name="fromAccountId"
                label="Cuenta origen"
                placeholder="Seleccione una cuenta"
                options={accountOptions}
                disabled={loadingAccounts}
            />

            <FormSelect
                form={form}
                name="toAccountId"
                label="Cuenta destino"
                placeholder="Seleccione una cuenta"
                options={accountOptions}
                disabled={loadingAccounts}
            />

             <FormInput
                form={form}
                name="fromAmount"
                label="Monto origen"
                type="number"
                min={0.01}
                step={0.01}
                transform={numberOrUndefined}
            />

            {isCrossCurrency ? (
                <>
                    <FormInput
                        form={form}
                        name="rate"
                        label="Tipo de cambio (S/ por 1 $, opcional)"
                        type="number"
                        min={0}
                        step={0.0001}
                        placeholder={loadingRate ? "Obteniendo TC del día..." : "Se calcula automáticamente"}
                        transform={numberOrUndefined}
                        disabled={loadingRate}
                    />

                    {latestRate !== null ? (
                        <p className="text-xs text-muted-foreground">
                            TC del día: {formatCurrency(latestRate, "PEN", 3)} (S/ por 1 $)
                        </p>
                    ) : null}

                    <FormInput
                        form={form}
                        name="toAmount"
                        label="Monto destino (opcional)"
                        type="number"
                        min={0.01}
                        step={0.01}
                        placeholder="Se calcula automáticamente"
                        transform={numberOrUndefined}
                    />

                    {previewToAmount !== null && toAccount?.currency ? (
                        <p className="text-sm text-muted-foreground">
                            Monto destino estimado: {formatCurrency(previewToAmount, toAccount.currency)}
                        </p>
                    ) : null}
                </>
            ) : null}

            <FormInput form={form} name="date" label="Fecha" type="datetime-local" />

            <FormInput
                form={form}
                name="description"
                label="Descripción"
                type="text"
                placeholder="Opcional"
            />

            {form.formState.errors.root ? (
                <FieldError errors={[form.formState.errors.root]} />
            ) : null}

            <FormActions
                onCancel={onCancel}
                isSubmitting={form.formState.isSubmitting}
                submitLabel={
                isEditing ? "Actualizar transferencia" : "Crear transferencia"
                }
            />

        </form>
    )
}

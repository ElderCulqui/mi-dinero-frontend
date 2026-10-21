import { applyApiErrors, numberOrUndefined } from '@/lib/form';
import { accountService } from '@/services/accountService';
import { categoryService } from '@/services/categoryService';
import { loanService } from '@/services/loanService';
import type { Account } from '@/types/account';
import type { Category } from '@/types/category';
import type { Currency } from '@/types/currency';
import { loanSchema, type Loan, type LoanFormData, type LoanUpdateData } from '@/types/loan'
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { FormActions, FormInput, FormSelect } from '../form';

type Props = {
    loan?: Loan;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const currencyOptions = [
  { value: "PEN" as Currency, label: "Soles (S/.)" },
  { value: "USD" as Currency, label: "Dólares ($)" },
];

export default function LoanForm({ loan, onSuccess, onCancel }: Props) {
    const isEditing = !!loan;
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCatalogs, setLoadingCatalogs] = useState(true);

    const form = useForm<LoanFormData>({
        resolver: zodResolver(loanSchema),
        defaultValues: {
            name: loan?.name ?? "",
            currency: loan?.currency ?? "PEN",
            principal: loan?.principal ?? undefined,
            totalAmount: loan?.totalAmount ?? undefined,
            interestRate: loan?.interestRate ?? null,
            termMonths: loan?.termMonths ?? undefined,
            startDate: loan ? loan.startDate.slice(0, 10) : "",
            accountId: loan?.accountId ?? null,
            categoryId: loan?.categoryId ?? null,
            description: loan?.description ?? "",
        },
    });

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoadingCatalogs(true);
            try {
                const [accountList, categoryList] = await Promise.all([
                    accountService.getAll(),
                    categoryService.getAll()
                ]);
                if (!cancelled) {
                    setAccounts(accountList);
                    setCategories(categoryList.filter((c) => c.type === "egreso"));
                }
            } catch (error) {
                if (!cancelled) toast.error("No se pudieron cargar cuentas y categorías");
            } finally {
                if (!cancelled) setLoadingCatalogs(false);
            }
        };
        void load();
        return () => {
            cancelled = true;
        }
    }, []);

    const accountOptions = useMemo(
        () =>
            accounts.map((a) => ({
                value: Number(a.id),
                label: a.currency ? `${a.name} (${a.currency})` : a.name,
            })),
        [accounts],
    );

    const categoryOptions = useMemo(
        () => categories.map((c) => ({ value: Number(c.id), label: c.name })),
        [categories],
    );

    const onSubmit = async (data: LoanFormData) => {
        try {
            if (isEditing) {
                const payload: LoanUpdateData = {
                    name: data.name,
                    accountId: data.accountId ?? null,
                    categoryId: data.categoryId ?? null,
                    description: data.description ?? null,
                };
                await loanService.update(loan.id, payload);
                toast.success("Préstamo actualizado correctamente");
            } else {
                await loanService.create({
                    ...data,
                    startDate: new Date(`${data.startDate}T00:00:00.000Z`).toISOString(),
                });
                toast.success("Préstamo creado exitosamente");
            }
            onSuccess?.();
        } catch (error: unknown) {
            toast.error(applyApiErrors(error, form, "Error al guardar el préstamo"));
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormInput 
                form={form}
                name="name"
                label="Nombre"
                type="text"
                placeholder="Ej. Préstamo Banco X"
                required
            />

            {isEditing ? (
                <p className="text-xs text-muted-foreground">
                    Los montos, cuotas y fecha de inicio no se pueden modificar una vez creado.
                </p>
            ) : (
                <>
                    <FormSelect
                        form={form}
                        name="currency"
                        label="Moneda"
                        options={currencyOptions}
                    />

                    <FormInput 
                        form={form}
                        name="principal"
                        label="Capital prestado"
                        type="number"
                        min={0.01}
                        step={0.01}
                        transform={numberOrUndefined}
                    />

                    <FormInput 
                        form={form}
                        name="totalAmount"
                        label="Monto total a pagar (con intereses)"
                        type="number"
                        min={0.01}
                        step={0.01}
                        transform={numberOrUndefined}
                    />

                    <FormInput 
                        form={form}
                        name="interestRate"
                        label="Tasa de interés (%)"
                        type="number"
                        min={0}
                        step={0.0001}
                        transform={numberOrUndefined}
                    />

                    <FormInput 
                        form={form}
                        name="termMonths"
                        label="Número de cuotas"
                        type="number"
                        min={1}
                        step={1}
                        transform={numberOrUndefined}
                    />

                    <FormInput 
                        form={form}
                        name="startDate"
                        label="Fecha de inicio"
                        type="date"
                    />
                </>
            )}

            <FormSelect 
                form={form}
                name="accountId"
                label="Cuenta"
                placeholder="Sin cuenta"
                options={accountOptions}
                nullable
                disabled={loadingCatalogs}
            />

            <FormSelect 
                form={form}
                name="categoryId"
                label="Categoría"
                placeholder="Sin categoría"
                options={categoryOptions}
                nullable
                disabled={loadingCatalogs}
            />

            <FormInput 
                form={form}
                name="description"
                label="Descripción"
                type="text"
                placeholder="Opcional"
            />

            <FormActions
                onCancel={onCancel}
                isSubmitting={form.formState.isSubmitting}
                submitLabel={isEditing ? "Actualizar préstamo" : "Crear préstamo"}
            />
        </form>
    );
}
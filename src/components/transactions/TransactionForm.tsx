import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BanknoteArrowDown, BanknoteArrowUp } from "lucide-react";
import { toast } from "sonner";

import { FormActions, FormInput, FormSelect } from "@/components/form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { accountService } from "@/services/accountService";
import { categoryService } from "@/services/categoryService";
import { transactionService } from "@/services/transactionService";
import { applyApiErrors, numberOrUndefined, toDateTimeLocal } from "@/lib/form";
import {
    transactionSchema,
    type Transaction,
    type TransactionFormData,
} from "@/types/transaction";
import type { Account } from "@/types/account";
import type { Category } from "@/types/category";

interface Props {
    transaction?: Transaction,
    onSuccess?: () => void;
    onCancel?: () => void;
}

const transactionTypes = [
  { value: "ingreso", label: "Ingreso", icon: BanknoteArrowUp},
  { value: "egreso", label: "Egreso", icon: BanknoteArrowDown}
] as const;

export default function TransactionForm({
  transaction,
  onSuccess,
  onCancel
}: Props) {
  const isEditing = !!transaction;

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      accountId: transaction?.accountId,
      categoryId: transaction?.categoryId ?? null,
      type: transaction?.type ?? "egreso",
      date: toDateTimeLocal(transaction?.date ?? new Date()),
      amount: transaction?.amount ?? undefined,
      description: transaction?.description ?? ""
    }
  })

  const selectedType = useWatch({ control: form.control, name: "type" });

  useEffect(() => {
    let cancelled = false;

    const loadCatalogs = async () => {
      setLoadingCatalogs(true);

      try {
        const [accountList, categoryList] = await Promise.all([
          accountService.getAll(),
          categoryService.getAll()
        ]);

        if (cancelled) return;

        setAccounts(accountList);
        setCategories(categoryList);
      } catch {
        if (!cancelled) {
          toast.error("No se pudieron cargar cuentas y categorias");
        }
      } finally {
        if (!cancelled) setLoadingCatalogs(false);
      }
    };

    void loadCatalogs();

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
          : account.name
      })),
    [accounts],
  );

  const categoryOptions = useMemo(
    () => 
      categories
      .filter((category) => category.type === selectedType)
      .map((category) => ({
        value: Number(category.id),
        label: category.name
      })),
    [categories, selectedType],
  )

  const onSubmit = async (data: TransactionFormData) => {
    try {
      const payload = {
        ...data,
        date: new Date(data.date).toISOString(),
      };

      if (isEditing) {
        await transactionService.update(transaction.id, payload);
        toast.success("Transacción actualizada exitosamente");
      } else {
        await transactionService.create(payload);
        toast.success("Transacción creada exitosamente");
      }

      onSuccess?.();
    } catch(error: unknown) {
      const message = applyApiErrors(
        error,
        form,
        "Error al guardar la transacción"
      );
      toast.error(message);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Field orientation="horizontal">
        <FieldLabel>Tipo</FieldLabel>
        <Controller
          control={form.control}
          name="type"
          render={({ field }) => (
            <Tabs
              className="w-full"
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                form.setValue("categoryId", null, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }}
            >
              <TabsList className="grid w-full grid-cols-2">
                {transactionTypes.map((type) => {
                  const Icon = type.icon;

                  return (
                    <TabsTrigger
                      key={type.value}
                      value={type.value}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {type.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          )}
        />
        <FieldError errors={[form.formState.errors.type]} />
      </Field>

      <FormSelect 
        form={form}
        name="accountId"
        label="Cuenta"
        placeholder="Seleccione una cuenta"
        options={accountOptions}
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
        name="date"
        label="Fecha"
        type="datetime-local"
      />

      <FormInput
        form={form}
        name="amount"
        label="Monto"
        type="number"
        min={0.01}
        step={0.01}
        placeholder="0.00"
        transform={numberOrUndefined}
      />

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
          isEditing
            ? "Actualizar transacción"
            : "Crear transacción"
        }
      />
    </form>
  )
}
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { FormActions, FormInput, FormSelect } from "@/components/form";
import { FieldDescription } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { applyApiErrors, numberOrUndefined, toDateTimeLocal } from "@/lib/form";
import { formatCurrency } from "@/lib/utils";
import { accountService } from "@/services/accountService";
import { categoryService } from "@/services/categoryService";
import { transactionShareService } from "@/services/transactionShareService";
import {
  collectShareSchema,
  type CollectShareFormData,
  type TransactionShare,
} from "@/types/transactionShare";
import type { Account } from "@/types/account";
import type { Category } from "@/types/category";

interface Props {
  share: TransactionShare | null;
  currency: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CollectShareDialog({
  share,
  currency,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);

  const form = useForm<CollectShareFormData>({
    resolver: zodResolver(collectShareSchema),
    defaultValues: {
      accountId: undefined,
      settlementAmount: share?.amount ?? undefined,
      settlementRate: null,
      date: toDateTimeLocal(new Date()),
      categoryId: null,
      description: "",
    },
  });

  const accountId = useWatch({ control: form.control, name: "accountId" });
  const selectedAccount = accounts.find((a) => Number(a.id) === accountId);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const load = async () => {
      setLoadingCatalogs(true);
      try {
        const [accountList, categoryList] = await Promise.all([
          accountService.getAll(),
          categoryService.getAll(),
        ]);
        if (!cancelled) {
          setAccounts(accountList);
          setCategories(categoryList.filter((c) => c.type === "ingreso"));
        }
      } catch {
        if (!cancelled) toast.error("No se pudieron cargar cuentas y categorías");
      } finally {
        if (!cancelled) setLoadingCatalogs(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const accountOptions = useMemo(
    () =>
      accounts.map((a) => ({
        value: Number(a.id),
        label: a.currency ? `${a.name} (${a.currency})` : a.name,
      })),
    [accounts],
  );

  const categoryOptions = useMemo(
    () =>
      categories.map((c) => ({ value: Number(c.id), label: c.name })),
    [categories],
  );

  const onSubmit = async (data: CollectShareFormData) => {
    if (!share) return;
    try {
      await transactionShareService.collect(share.id, {
        ...data,
        date: data.date ? new Date(data.date).toISOString() : undefined,
      });
      toast.success("Cobro registrado exitosamente");
      onSuccess();
    } catch (error: unknown) {
      toast.error(applyApiErrors(error, form, "Error al registrar el cobro"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar cobro</DialogTitle>
          <DialogDescription>
            {share
              ? `Cobrando ${formatCurrency(share.amount, currency)} a ${
                  share.contact?.name ?? `Contacto #${share.contactId}`
                }`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormSelect
            form={form}
            name="accountId"
            label="Cuenta destino"
            placeholder="Seleccione una cuenta"
            options={accountOptions}
            disabled={loadingCatalogs}
          />

          <FormInput
            form={form}
            name="settlementAmount"
            label="Monto recibido"
            type="number"
            min={0.01}
            step={0.01}
            placeholder="0.00"
            transform={numberOrUndefined}
          />

          <FormInput
            form={form}
            name="settlementRate"
            label="Tipo de cambio (opcional)"
            type="number"
            min={0}
            step={0.0001}
            placeholder="Solo referencia"
            transform={numberOrUndefined}
          />

          <FormInput form={form} name="date" label="Fecha" type="datetime-local" />

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

          {selectedAccount ? (
            <FieldDescription>
              El dinero se acreditará en {selectedAccount.name} (
              {selectedAccount.currency}).
            </FieldDescription>
          ) : null}

          <FormActions
            onCancel={() => onOpenChange(false)}
            isSubmitting={form.formState.isSubmitting}
            submitLabel="Registrar cobro"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
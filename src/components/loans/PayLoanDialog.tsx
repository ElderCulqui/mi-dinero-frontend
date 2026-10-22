import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { FormActions, FormInput, FormSelect } from "@/components/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { applyApiErrors, numberOrUndefined, toDateTimeLocal } from "@/lib/form";
import { formatCurrency } from "@/lib/utils";
import { accountService } from "@/services/accountService";
import { categoryService } from "@/services/categoryService";
import { loanService } from "@/services/loanService";
import {
  payLoanSchema,
  type PayLoanFormData,
  type Loan,
} from "@/types/loan";
import type { Account } from "@/types/account";
import type { Category } from "@/types/category";

interface Props {
  loan: Loan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function PayLoanDialog({
  loan,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [paymentId, setPaymentId] = useState<number | null>(null);

  const unpaidPayments = useMemo(
    () => (loan?.payments ?? []).filter((p) => p.status !== "pagado"),
    [loan],
  );

  const selectedPayment = useMemo(
    () => unpaidPayments.find((p) => p.id === paymentId) ?? null,
    [unpaidPayments, paymentId],
  );

  const form = useForm<PayLoanFormData>({
    resolver: zodResolver(payLoanSchema),
    defaultValues: {
      amount: undefined,
      date: toDateTimeLocal(new Date()),
      accountId: loan?.accountId ?? null,
      categoryId: null,
      description: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    const first = unpaidPayments[0];
    setPaymentId(first ? first.id : null);
    form.reset({
      amount: first
        ? Number((Number(first.amount) - Number(first.paidAmount)).toFixed(2))
        : undefined,
      date: toDateTimeLocal(new Date()),
      accountId: loan?.accountId ?? null,
      categoryId: null,
      description: "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loan]);

  useEffect(() => {
    if (!selectedPayment) return;
    const remaining = Number(
      (Number(selectedPayment.amount) - Number(selectedPayment.paidAmount)).toFixed(2),
    );
    form.setValue("amount", remaining, { shouldValidate: false });
  }, [selectedPayment, form]);

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
          setCategories(categoryList.filter((c) => c.type === "egreso"));
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

  const paymentOptions = useMemo(
    () =>
      unpaidPayments.map((p) => ({
        value: p.id,
        label: `Cuota ${p.number} — ${formatCurrency(
          p.amount,
          loan?.currency ?? "PEN",
        )} (pendiente ${formatCurrency(
          Number(p.amount) - Number(p.paidAmount),
          loan?.currency ?? "PEN",
        )})`,
      })),
    [unpaidPayments, loan],
  );

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

  const onSubmit = async (data: PayLoanFormData) => {
    if (!loan || paymentId === null) return;
    try {
      await loanService.pay(loan.id, paymentId, {
        ...data,
        date: data.date ? new Date(data.date).toISOString() : undefined,
      });
      toast.success("Cuota pagada exitosamente");
      onSuccess();
    } catch (error: unknown) {
      toast.error(applyApiErrors(error, form, "Error al pagar la cuota"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pagar cuota</DialogTitle>
          <DialogDescription>
            {loan ? `Préstamo: ${loan.name}` : ""}
          </DialogDescription>
        </DialogHeader>

        {unpaidPayments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Este préstamo no tiene cuotas pendientes.
          </p>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cuota a pagar</label>
              <Select
                items={paymentOptions}
                value={paymentId ?? null}
                onValueChange={(value) =>
                  setPaymentId(value === null ? null : Number(value))
                }
                disabled={loadingCatalogs}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una cuota" />
                </SelectTrigger>
                <SelectContent>
                  {paymentOptions.map((opt) => (
                    <SelectItem key={String(opt.value)} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <FormInput
              form={form}
              name="amount"
              label="Monto a pagar"
              type="number"
              min={0.01}
              step={0.01}
              transform={numberOrUndefined}
            />

            <FormInput
              form={form}
              name="date"
              label="Fecha"
              type="datetime-local"
            />

            <FormSelect
              form={form}
              name="accountId"
              label="Cuenta"
              placeholder="Cuenta del préstamo"
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
              onCancel={() => onOpenChange(false)}
              isSubmitting={form.formState.isSubmitting}
              submitLabel="Pagar cuota"
            />
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
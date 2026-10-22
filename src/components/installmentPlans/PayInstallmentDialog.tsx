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
import { categoryService } from "@/services/categoryService";
import { installmentPlanService } from "@/services/installmentPlanService";
import {
  payInstallmentSchema,
  type PayInstallmentFormData,
  type InstallmentPlan,
} from "@/types/installmentPlan";
import type { Category } from "@/types/category";

interface Props {
  plan: InstallmentPlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function PayInstallmentDialog({
  plan,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [installmentId, setInstallmentId] = useState<number | null>(null);

  const unpaidInstallments = useMemo(
    () => (plan?.installments_ ?? []).filter((i) => i.status !== "pagado"),
    [plan],
  );

  const selectedInstallment = useMemo(
    () => unpaidInstallments.find((i) => i.id === installmentId) ?? null,
    [unpaidInstallments, installmentId],
  );

  const form = useForm<PayInstallmentFormData>({
    resolver: zodResolver(payInstallmentSchema),
    defaultValues: {
      amount: undefined,
      date: toDateTimeLocal(new Date()),
      categoryId: null,
      description: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    const first = unpaidInstallments[0];
    setInstallmentId(first ? first.id : null);
    form.reset({
      amount: first
        ? Number((Number(first.amount) - Number(first.paidAmount)).toFixed(2))
        : undefined,
      date: toDateTimeLocal(new Date()),
      categoryId: null,
      description: "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, plan]);

  useEffect(() => {
    if (!selectedInstallment) return;
    const remaining = Number(
      (Number(selectedInstallment.amount) - Number(selectedInstallment.paidAmount)).toFixed(2),
    );
    form.setValue("amount", remaining, { shouldValidate: false });
  }, [selectedInstallment, form]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const load = async () => {
      setLoadingCatalogs(true);
      try {
        const categoryList = await categoryService.getAll();
        if (!cancelled) {
          setCategories(categoryList.filter((c) => c.type === "egreso"));
        }
      } catch {
        if (!cancelled) toast.error("No se pudieron cargar las categorías");
      } finally {
        if (!cancelled) setLoadingCatalogs(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const installmentOptions = useMemo(
    () =>
      unpaidInstallments.map((i) => ({
        value: i.id,
        label: `Cuota ${i.number} — ${formatCurrency(
          i.amount,
          plan?.currency ?? "PEN",
        )} (pendiente ${formatCurrency(
          Number(i.amount) - Number(i.paidAmount),
          plan?.currency ?? "PEN",
        )})`,
      })),
    [unpaidInstallments, plan],
  );

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: Number(c.id), label: c.name })),
    [categories],
  );

  const onSubmit = async (data: PayInstallmentFormData) => {
    if (!plan || installmentId === null) return;
    try {
      await installmentPlanService.pay(plan.id, installmentId, {
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
            {plan ? `Plan: ${plan.description}` : ""}
          </DialogDescription>
        </DialogHeader>

        {unpaidInstallments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Este plan no tiene cuotas pendientes.
          </p>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cuota a pagar</label>
              <Select
                items={installmentOptions}
                value={installmentId ?? null}
                onValueChange={(value) =>
                  setInstallmentId(value === null ? null : Number(value))
                }
                disabled={loadingCatalogs}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una cuota" />
                </SelectTrigger>
                <SelectContent>
                  {installmentOptions.map((opt) => (
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
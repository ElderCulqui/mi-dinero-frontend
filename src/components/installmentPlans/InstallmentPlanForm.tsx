import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { FormActions, FormInput, FormSelect } from "../form";
import { applyApiErrors, numberOrUndefined } from "@/lib/form";
import { cardService } from "@/services/cardService";
import { categoryService } from "@/services/categoryService";
import { installmentPlanService } from "@/services/installmentPlanService";
import type { Card } from "@/types/card";
import type { Category } from "@/types/category";
import {
  installmentPlanSchema,
  type InstallmentPlan,
  type InstallmentPlanFormData,
  type InstallmentPlanUpdateData,
} from "@/types/installmentPlan";

type Props = {
  plan?: InstallmentPlan;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function InstallmentPlanForm({
  plan,
  onSuccess,
  onCancel,
}: Props) {
  const isEditing = !!plan;
  const [cards, setCards] = useState<Card[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);

  const form = useForm<InstallmentPlanFormData>({
    resolver: zodResolver(installmentPlanSchema),
    defaultValues: {
      creditCardId: plan?.creditCardId ?? undefined,
      description: plan?.description ?? "",
      totalAmount: plan?.totalAmount ?? undefined,
      installments: plan?.installments ?? undefined,
      startDate: plan ? plan.startDate.slice(0, 10) : "",
      firstDueDate: plan ? plan.firstDueDate.slice(0, 10) : "",
      categoryId: plan?.categoryId ?? null,
    },
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadingCatalogs(true);
      try {
        const [cardList, categoryList] = await Promise.all([
          cardService.getAll(),
          categoryService.getAll(),
        ]);
        if (!cancelled) {
          setCards(cardList.filter((c) => c.isActive));
          setCategories(categoryList.filter((c) => c.type === "egreso"));
        }
      } catch {
        if (!cancelled) toast.error("No se pudieron cargar tarjetas y categorías");
      } finally {
        if (!cancelled) setLoadingCatalogs(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const cardOptions = useMemo(
    () =>
      cards.map((c) => ({
        value: Number(c.id),
        label: `${c.name} (${c.bankCurrency})`,
      })),
    [cards],
  );

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: Number(c.id), label: c.name })),
    [categories],
  );

  const onSubmit = async (data: InstallmentPlanFormData) => {
    try {
      if (isEditing && plan) {
        const payload: InstallmentPlanUpdateData = {
          description: data.description,
          categoryId: data.categoryId ?? null,
        };
        await installmentPlanService.update(plan.id, payload);
        toast.success("Plan actualizado correctamente");
      } else {
        await installmentPlanService.create({
          ...data,
          startDate: new Date(`${data.startDate}T00:00:00.000Z`).toISOString(),
          firstDueDate: new Date(`${data.firstDueDate}T00:00:00.000Z`).toISOString(),
        });
        toast.success("Plan creado exitosamente");
      }
      onSuccess?.();
    } catch (error: unknown) {
      toast.error(applyApiErrors(error, form, "Error al guardar el plan"));
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FormSelect
        form={form}
        name="creditCardId"
        label="Tarjeta"
        placeholder="Seleccione una tarjeta"
        options={cardOptions}
        disabled={loadingCatalogs || isEditing}
      />

      <FormInput
        form={form}
        name="description"
        label="Descripción"
        type="text"
        placeholder="Ej. Compra de laptop en 12 cuotas"
        required
      />

      {isEditing ? (
        <p className="text-xs text-muted-foreground">
          El monto, las cuotas y las fechas no se pueden modificar una vez creado.
        </p>
      ) : (
        <>
          <FormInput
            form={form}
            name="totalAmount"
            label="Monto total"
            type="number"
            min={0.01}
            step={0.01}
            transform={numberOrUndefined}
          />
          <FormInput
            form={form}
            name="installments"
            label="Número de cuotas"
            type="number"
            min={1}
            step={1}
            transform={numberOrUndefined}
          />
          <FormInput
            form={form}
            name="startDate"
            label="Fecha de compra"
            type="date"
          />
          <FormInput
            form={form}
            name="firstDueDate"
            label="Primera fecha de pago"
            type="date"
          />
        </>
      )}

      <FormSelect
        form={form}
        name="categoryId"
        label="Categoría"
        placeholder="Sin categoría"
        options={categoryOptions}
        nullable
        disabled={loadingCatalogs}
      />

      <FormActions
        onCancel={onCancel}
        isSubmitting={form.formState.isSubmitting}
        submitLabel={isEditing ? "Actualizar plan" : "Crear plan"}
      />
    </form>
  );
}
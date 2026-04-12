import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, BanknoteArrowUp, BanknoteArrowDown } from "lucide-react";

import {
  categorySchema,
  type CategoryFormData,
  type Category,
} from "@/types/category";
import { categoryService } from "@/services/categoryService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CategoryFormProps {
  category?: Category;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const transactionTypes = [
  { value: "ingreso", label: "Ingreso", icon: BanknoteArrowUp },
  { value: "egreso", label: "Egreso", icon: BanknoteArrowDown },
];

export default function CategoryForm({
  category,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const isEditing = !!category;

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || "",
      type: category?.type || transactionTypes[0].value,
      color: category?.color || "#3b82f6",
      icon: category?.icon || "",
    },
  });

  const accountType = form.watch("type");
  //   const selectedColor = form.watch("color");

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (accountType === "ingreso") {
        data.color = "#10b981"; // Verde para ingresos
      } else if (accountType === "egreso") {
        data.color = "#3b82f6"; // Azul para egresos
      }

      if (isEditing) {
        await categoryService.update(category.id, data);
        toast.success("Categoría actualizada exitosamente");
      } else {
        await categoryService.create(data);
        toast.success("Categoría creada exitosamente");
      }
      onSuccess?.();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al guardar la categoría";
      toast.error(message);
      console.error("Category form error:", error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Field orientation="horizontal">
        <FieldLabel>Tipo de Categoría</FieldLabel>
        <Controller
          control={form.control}
          name="type"
          render={({ field }) => (
            <Tabs
              className="w-full"
              value={field.value}
              onValueChange={field.onChange}
            >
              <TabsList className="grid w-full grid-cols-3">
                {transactionTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <TabsTrigger key={type.value} value={type.value}>
                      <Icon className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">{type.label}</span>
                      <span className="sm:hidden">
                        {type.label.split(" ")[0]}
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          )}
        />
      </Field>

      <Field orientation="horizontal">
        <FieldLabel>Nombre de la Categoría</FieldLabel>
        <Input
          type="text"
          placeholder="Alquiler"
          required
          {...form.register("name")}
        />
        <FieldError errors={[form.formState.errors.name]} />
      </Field>

      {form.formState.errors ? (
        <Field orientation="horizontal">
          <FieldError errors={Object.values(form.formState.errors)} />
        </Field>
      ) : null}

      <Field orientation="horizontal" className="justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {isEditing ? "Actualizar Categoría" : "Crear Categoría"}
        </Button>
      </Field>
    </form>
  );
}

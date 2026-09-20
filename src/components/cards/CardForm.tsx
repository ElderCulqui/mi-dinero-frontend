import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { cardSchema, type Card, type CardFormData } from "@/types/card";
import { currencyOptions, type Currency } from "@/types/currency";
import { cardService } from "@/services/cardService";
import { getApiErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Field, 
  FieldError, 
  FieldLabel, 
  FieldDescription 
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CardFormProps {
  card?: Card;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const currencies = Object.values(currencyOptions) as Array<{
  code: Currency;
  symbol: string;
  label: string;
}>;

export default function CardForm({
  card,
  onSuccess,
  onCancel,
}: CardFormProps) {
  const isEditing = !!card;

  const form = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      name: card?.name || "",
      brand: card?.brand || "",
      bankCurrency: card?.bankCurrency || "PEN",
      isActive: card?.isActive ?? true,
    },
  });

  const onSubmit = async (data: CardFormData) => {
    try {
      if (isEditing) {
        await cardService.update(card.id, data);
        toast.success("Tarjeta actualizada exitosamente");
      } else {
        await cardService.create(data);
        toast.success("Tarjeta creada exitosamente");
      }

      onSuccess?.();
    } catch (error: unknown) {
      const message = getApiErrorMessage(
        error,
        "Error al guardar la tarjeta",
      );
      toast.error(message);
      console.error("Card form error:", error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Field>
        <FieldLabel htmlFor="card-name">Nombre de la tarjeta</FieldLabel>
        <Input
          id="card-name"
          type="text"
          placeholder="Tarjeta principal"
          {...form.register("name")}
        />
        <FieldError errors={[form.formState.errors.name]} />
      </Field>

      <Field>
        <FieldLabel htmlFor="card-brand">Marca</FieldLabel>
        <Input
          id="card-brand"
          type="text"
          placeholder="Visa"
          {...form.register("brand")}
        />
        <FieldError errors={[form.formState.errors.brand]} />
      </Field>

      <Field>
        <FieldLabel>Moneda de la tarjeta</FieldLabel>
        <Controller
          control={form.control}
          name="bankCurrency"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(value) => field.onChange(value)}
            >
              <SelectTrigger className="w-full" aria-invalid={!!form.formState.errors.bankCurrency}>
                <SelectValue placeholder="Selecciona una moneda" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.label} ({currency.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError errors={[form.formState.errors.bankCurrency]} />
      </Field>

      <Field orientation="horizontal">
        <FieldLabel>Tarjeta activa</FieldLabel>
        <Input
          id="card-active"
          type="checkbox"
          className="h-4 w-4 accent-primary"
          {...form.register("isActive")}
        />
        <FieldError errors={[form.formState.errors.isActive]} />
        <FieldDescription>
          Permite usar esta tarjeta en nuevas operaciones.
        </FieldDescription>
        
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
          {isEditing ? "Actualizar tarjeta" : "Crear tarjeta"}
        </Button>
      </Field>
    </form>
  );
}

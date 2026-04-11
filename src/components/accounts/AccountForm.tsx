import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Wallet, CreditCard, Banknote } from "lucide-react";

import {
  accountSchema,
  type AccountFormData,
  type Account,
} from "../../types/account";
import { accountService } from "../../services/accountService";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { FieldDescription, Field, FieldLabel, FieldError } from "../ui/field";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

import { useAuthStore } from "../../stores/authStore";
import { useEffect } from "react";

interface AccountFromProps {
  account?: Account;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const accountTypes = [
  { value: "efectivo", label: "Efectivo", icon: Banknote },
  { value: "cuenta_bancaria", label: "Cuenta bancaria", icon: Wallet },
  { value: "tarjeta_credito", label: "Tarjeta Crédito", icon: CreditCard },
];

// const currencies = [
//   { value: "PEN", label: "Soles (S/)", symbol: "S/" },
//   { value: "USD", label: "Dólares ($)", symbol: "$" },
//   { value: "EUR", label: "Euros (€)", symbol: "€" },
// ];

// const colors = [
//   "#3b82f6",
//   "#ef4444",
//   "#10b981",
//   "#f59e0b",
//   "#8b5cf6",
//   "#ec4899",
//   "#14b8a6",
//   "#f97316",
// ];

export default function AccountForm({
  account,
  onSuccess,
  onCancel,
}: AccountFromProps) {
  const isEditing = !!account;

  const { user } = useAuthStore();

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: account?.name || "",
      type: account?.type || "efectivo",
      balance: account?.balance || 0,
      creditLimit: account?.creditLimit || 0,
      // currency: account?.currency || 'PEN',
      // color: account?.color || '#3b82f6',
      isActive: account?.isActive ?? true,
      isDefault: account?.isDefault ?? false,
      userId: user?.id,
    },
  });

  const accountType = form.watch("type");
  //   const selectedColor = form.watch("color");

  const onSubmit = async (data: AccountFormData) => {
    try {
      if (isEditing) {
        await accountService.update(account.id, data);
        toast.success("Cuenta actualizada exitosamente");
      } else {
        await accountService.create(data);
        toast.success("Cuenta creada exitosamente");
      }
      onSuccess?.();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al guardar la cuenta";
      toast.error(message);
      console.error("Account form error:", error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Field orientation="horizontal">
        <FieldLabel>Tipo de Cuenta</FieldLabel>
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
                {accountTypes.map((type) => {
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
        <FieldLabel>Nombre de la Cuenta</FieldLabel>
        <Input
          type="text"
          placeholder="Mi cuenta de ahorros"
          required
          {...form.register("name")}
        />
        <FieldError errors={[form.formState.errors.name]} />
      </Field>

      {accountType === "tarjeta_credito" && (
        <Field orientation="horizontal">
          <FieldLabel>Límite de Crédito</FieldLabel>
          <Input
            type="number"
            placeholder="5000"
            min={0}
            step={0.01}
            required
            {...form.register("creditLimit", { valueAsNumber: true })}
          />
          <FieldError errors={[form.formState.errors.creditLimit]} />
          <FieldDescription>
            Define el límite de crédito para esta cuenta. Solo aplica para
            tarjetas de crédito.
          </FieldDescription>
        </Field>
      )}

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
          {isEditing ? "Actualizar Cuenta" : "Crear Cuenta"}
        </Button>
      </Field>
    </form>
  );
}

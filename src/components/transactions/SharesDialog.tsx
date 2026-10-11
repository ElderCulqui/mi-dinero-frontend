import { useCallback, useEffect, useState } from "react";
import { HandCoins, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
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
import { formatCurrency, getApiErrorMessage } from "@/lib/utils";
import { contactService } from "@/services/contactService";
import { transactionShareService } from "@/services/transactionShareService";
import type { Contact } from "@/types/contact";
import type { Transaction } from "@/types/transaction";
import type { TransactionShare } from "@/types/transactionShare";

interface Row {
  contactId: number | null;
  amount: number | null;
}

interface Props {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCollect: (share: TransactionShare) => void;
  reloadKey: number;
}

export default function SharesDialog({
  transaction,
  open,
  onOpenChange,
  onCollect,
  reloadKey,
}: Props) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [shares, setShares] = useState<TransactionShare[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const transactionId = transaction?.id;

  const load = useCallback(async () => {
    if (!transactionId) return;
    setLoading(true);
    try {
      const [contactList, shareList] = await Promise.all([
        contactService.getAll(),
        transactionShareService.getByTransaction(transactionId),
      ]);
      setContacts(contactList);
      setShares(shareList);
      setRows(
        shareList
          .filter((s) => s.status === "pendiente")
          .map((s) => ({ contactId: s.contactId, amount: s.amount })),
      );
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Error al cargar el reparto"));
    } finally {
      setLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    if (open) void load();
  }, [open, reloadKey, load]);

  const currency = transaction?.account.currency ?? "PEN";
  const pendingShares = shares.filter((s) => s.status === "pendiente");
  const collectedShares = shares.filter((s) => s.status === "cobrado");
  const total = rows.reduce((sum, r) => sum + (r.amount ?? 0), 0);
  const remaining = (transaction?.amount ?? 0) - total;

  const addRow = () => setRows((r) => [...r, { contactId: null, amount: null }]);
  const removeRow = (index: number) =>
    setRows((r) => r.filter((_, i) => i !== index));
  const updateRow = (index: number, patch: Partial<Row>) =>
    setRows((r) => r.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const handleSave = async () => {
    if (!transactionId || !transaction) return;

    const clean = rows.filter(
      (r) => r.contactId && r.amount && r.amount > 0,
    ) as { contactId: number; amount: number }[];

    if (rows.length > 0 && clean.length !== rows.length) {
      toast.error("Completa contacto y monto (> 0) en cada fila");
      return;
    }
    if (clean.length === 0) {
      toast.error("Agrega al menos un reparto");
      return;
    }
    if (new Set(clean.map((r) => r.contactId)).size !== clean.length) {
      toast.error("No repitas un contacto");
      return;
    }
    if (clean.reduce((s, r) => s + r.amount, 0) > transaction.amount + 1e-9) {
      toast.error("La suma del reparto supera el monto de la transacción");
      return;
    }

    setSaving(true);
    try {
      await transactionShareService.split(transactionId, clean);
      toast.success("Reparto guardado exitosamente");
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Error al guardar el reparto"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Repartir gasto</DialogTitle>
          <DialogDescription>
            {transaction
              ? `Transacción de ${formatCurrency(transaction.amount, currency)} · ${
                  transaction.description || "sin descripción"
                }`
              : ""}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {collectedShares.length > 0 ? (
              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Ya cobrados</h3>
                {collectedShares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <div className="font-medium">
                        {share.contact?.name ?? `Contacto #${share.contactId}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(share.amount, currency)}
                      </div>
                    </div>
                    <Badge variant="secondary">Cobrado</Badge>
                  </div>
                ))}
              </section>
            ) : null}

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Reparto pendiente</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRow}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar
                </Button>
              </div>

              {rows.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Sin reparto. Agrega un contacto y su monto.
                </p>
              ) : (
                rows.map((row, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select
                      items={contacts.map((c) => ({
                        value: c.id,
                        label: c.name,
                      }))}
                      value={row.contactId ?? null}
                      onValueChange={(value) =>
                        updateRow(index, { contactId: value as number })
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Contacto" />
                      </SelectTrigger>
                      <SelectContent>
                        {contacts.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      min={0.01}
                      step={0.01}
                      className="w-32"
                      value={row.amount ?? ""}
                      onChange={(e) =>
                        updateRow(index, {
                          amount:
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                        })
                      }
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRow(index)}
                      aria-label="Quitar fila"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}

              {transaction ? (
                <p className="text-sm text-muted-foreground">
                  Total repartido: {formatCurrency(total, currency)} ·
                  Disponible: {formatCurrency(remaining, currency)}
                </p>
              ) : null}
            </section>

            {pendingShares.length > 0 ? (
              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Cobrar pendientes</h3>
                {pendingShares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <div className="font-medium">
                        {share.contact?.name ?? `Contacto #${share.contactId}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(share.amount, currency)}
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onCollect(share)}
                    >
                      <HandCoins className="mr-2 h-4 w-4" />
                      Cobrar
                    </Button>
                  </div>
                ))}
              </section>
            ) : null}
          </div>
        )}

        <Field orientation="horizontal" className="justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Guardar reparto
          </Button>
        </Field>
      </DialogContent>
    </Dialog>
  );
}
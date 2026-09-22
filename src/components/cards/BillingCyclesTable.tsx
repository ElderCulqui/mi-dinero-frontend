import { CalendarDays, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import type { BillingCycle } from "@/types/billingCycle";
import type { Currency } from "@/types/currency";
import { currencyOptions } from "@/types/currency";
import { formatCurrency, formatDate, getApiErrorMessage } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useState } from "react";
import { billingCycleService } from "@/services/billingCycleService";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";

interface BillingCyclesTableProps {
  cycles: BillingCycle[];
  currency: Currency;
  onEdit: (cycle: BillingCycle) => void;
  onRefresh: () => void;
}

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  abierto: {
    label: "Abierto",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  cerrado: {
    label: "Cerrado",
    className:
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  },
  pagado: {
    label: "Pagado",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  }
};

export default function BillingCyclesTable({
  cycles,
  currency,
  onEdit,
  onRefresh
}: BillingCyclesTableProps) {
  const currencyConfig = currencyOptions[currency];
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cycleToDelete, setCycleToDelete] = useState<BillingCycle | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!cycleToDelete) return;

    setLoading(true);
    try {
      await billingCycleService.delete(cycleToDelete.id);
      toast.success("Ciclo de facturación eliminado exitosamente");
      onRefresh();
    } catch (error: unknown) {
      const message = getApiErrorMessage(
        error,
        "Error al eliminar el ciclo de facturación",
      );
      toast.error(message);
      console.error("Delete card error:", error);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setCycleToDelete(null);
    }
  };

  const renderActions = (cycle: BillingCycle) => (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
        <MoreHorizontal className="h-4 w-4" />
        {/* <span className="sr-only">Acciones para {card.name}</span> */}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(cycle)}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600"
          onClick={() => {
            setCycleToDelete(cycle);
            setDeleteDialogOpen(true);
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (cycles.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/40 py-12 text-center">
        <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">
          No hay ciclos de facturación
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Los ciclos aparecerán cuando se registren en la tarjeta.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="hidden overflow-x-auto md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Periodo</TableHead>
                <TableHead>Fecha de vencimiento</TableHead>
                <TableHead className="text-right">Monto bancario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {cycles.map((cycle) => {
                const status = statusConfig[cycle.status] ?? {
                  label: cycle.status,
                  className: "",
                };

                return (
                  <TableRow key={cycle.id}>
                    <TableCell>
                      <div className="font-medium">
                        {formatDate(cycle.periodStart, "dd/MM/yyyy")} -{" "}
                        {formatDate(cycle.periodEnd, "dd/MM/yyyy")}
                      </div>
                    </TableCell>

                    <TableCell>
                      {formatDate(cycle.dueDate, "dd/MM/yyyy")}
                    </TableCell>

                    <TableCell className="text-right font-medium">
                      {cycle.bankAmount === null
                        ? "—"
                        : formatCurrency(
                            cycle.bankAmount,
                            currencyConfig.code,
                          )}
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary" className={status.className}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {renderActions(cycle)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="divide-y md:hidden">
          {cycles.map((cycle) => {
            const status = statusConfig[cycle.status] ?? {
              label: cycle.status,
              className: "",
            };

            return (
              <div key={cycle.id} className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">Periodo</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(cycle.periodStart, "dd/MM/yyyy")} -{" "}
                      {formatDate(cycle.periodEnd, "dd/MM/yyyy")}
                    </p>
                  </div>

                  <Badge variant="secondary" className={status.className}>
                    {status.label}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Vencimiento</p>
                    <p className="font-medium">
                      {formatDate(cycle.dueDate, "dd/MM/yyyy")}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Monto</p>
                    <p className="font-medium">
                      {cycle.bankAmount === null
                        ? "—"
                        : formatCurrency(
                            cycle.bankAmount,
                            currencyConfig.code,
                          )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el 
              ciclo de facturación y todos sus datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
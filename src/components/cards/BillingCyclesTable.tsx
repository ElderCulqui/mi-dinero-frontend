import { CalendarDays } from "lucide-react";

import type { BillingCycle } from "@/types/billingCycle";
import type { Currency } from "@/types/currency";
import { currencyOptions } from "@/types/currency";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BillingCyclesTableProps {
  cycles: BillingCycle[];
  currency: Currency;
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
}: BillingCyclesTableProps) {
  const currencyConfig = currencyOptions[currency];

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
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Periodo</TableHead>
              <TableHead>Fecha de vencimiento</TableHead>
              <TableHead className="text-right">Monto bancario</TableHead>
              <TableHead>Estado</TableHead>
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
  );
}
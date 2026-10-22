import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, CreditCard, Banknote } from "lucide-react";
import { toast } from "sonner";

import type { InstallmentPlan } from "@/types/installmentPlan";
import { installmentPlanService } from "@/services/installmentPlanService";
import { formatCurrency, getApiErrorMessage } from "@/lib/utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PayInstallmentDialog from "./PayInstallmentDialog";

interface InstallmentPlansTableProps {
  plans: InstallmentPlan[];
  onEdit: (plan: InstallmentPlan) => void;
  onRefresh: () => void;
}

function planTotals(plan: InstallmentPlan) {
  const paid = (plan.installments_ ?? []).reduce(
    (sum, i) => sum + Number(i.paidAmount),
    0,
  );
  const total = Number(plan.totalAmount);
  const pending = total - paid;
  const progress = total > 0 ? Math.round((paid / total) * 100) : 0;
  return { paid, pending, progress };
}

const statusConfig: Record<string, { label: string; className: string }> = {
  activo: {
    label: "Activo",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  pagado: {
    label: "Pagado",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
};

export default function InstallmentPlansTable({
  plans,
  onEdit,
  onRefresh,
}: InstallmentPlansTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<InstallmentPlan | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [payingPlan, setPayingPlan] = useState<InstallmentPlan | null>(null);

  const handleDelete = async () => {
    if (!planToDelete) return;
    setDeleting(true);
    try {
      await installmentPlanService.delete(planToDelete.id);
      toast.success("Plan eliminado exitosamente");
      onRefresh();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Error al eliminar el plan"));
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    }
  };

  if (plans.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/40">
        <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">
          No tienes planes en cuotas
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Comienza agregando tu primer plan
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Moneda</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Pagado</TableHead>
                <TableHead className="text-right">Pendiente</TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => {
                const { paid, pending, progress } = planTotals(plan);
                const status = statusConfig[plan.status] ?? statusConfig.activo;
                return (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div className="font-medium">{plan.description}</div>
                      {plan.creditCard?.name ? (
                        <div className="text-sm text-muted-foreground">
                          {plan.creditCard.name}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{plan.currency}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(plan.totalAmount, plan.currency)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(paid, plan.currency)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(pending, plan.currency)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{progress}%</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={status.className}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setPayingPlan(plan)}>
                              <Banknote className="mr-2 h-4 w-4" />
                              Pagar cuota
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(plan)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setPlanToDelete(plan);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el plan <strong>{planToDelete?.description}</strong>{" "}
              junto con sus cuotas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PayInstallmentDialog
        plan={payingPlan}
        open={payingPlan !== null}
        onOpenChange={(open) => {
          if (!open) setPayingPlan(null);
        }}
        onSuccess={() => {
          setPayingPlan(null);
          onRefresh();
        }}
      />
    </>
  );
}
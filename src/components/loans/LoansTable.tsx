import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Wallet, Banknote } from "lucide-react";
import { toast } from "sonner";

import type { Loan } from "@/types/loan";
import { loanService } from "@/services/loanService";
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
import PayLoanDialog from "./PayLoanDialog";

interface LoansTableProps {
  loans: Loan[];
  onEdit: (loan: Loan) => void;
  onRefresh: () => void;
}

function loanTotals(loan: Loan) {
  const paid = (loan.payments ?? []).reduce(
    (sum, p) => sum + Number(p.paidAmount),
    0,
  );
  const total = Number(loan.totalAmount);
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

export default function LoansTable({
  loans,
  onEdit,
  onRefresh,
}: LoansTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loanToDelete, setLoanToDelete] = useState<Loan | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [payingLoan, setPayingLoan] = useState<Loan | null>(null);

  const handleDelete = async () => {
    if (!loanToDelete) return;
    setDeleting(true);
    try {
      await loanService.delete(loanToDelete.id);
      toast.success("Préstamo eliminado exitosamente");
      onRefresh();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Error al eliminar el préstamo"));
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setLoanToDelete(null);
    }
  };

  if (loans.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/40">
        <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">
          No tienes préstamos registrados
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Comienza agregando tu primer préstamo
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
                <TableHead>Préstamo</TableHead>
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
              {loans.map((loan) => {
                const { paid, pending, progress } = loanTotals(loan);
                const status = statusConfig[loan.status] ?? statusConfig.activo;
                return (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <div className="font-medium">{loan.name}</div>
                      {loan.account?.name ? (
                        <div className="text-sm text-muted-foreground">
                          {loan.account.name}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{loan.currency}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(loan.totalAmount, loan.currency)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(paid, loan.currency)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(pending, loan.currency)}
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
                            <DropdownMenuItem onClick={() => setPayingLoan(loan)}>
                              <Banknote className="mr-2 h-4 w-4" />
                              Pagar cuota
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(loan)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setLoanToDelete(loan);
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
            <AlertDialogTitle>¿Eliminar préstamo?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el préstamo <strong>{loanToDelete?.name}</strong> junto
              con su cronograma de cuotas.
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

      <PayLoanDialog
        loan={payingLoan}
        open={payingLoan !== null}
        onOpenChange={(open) => {
          if (!open) setPayingLoan(null);
        }}
        onSuccess={() => {
          setPayingLoan(null);
          onRefresh();
        }}
      />
    </>
  );
}
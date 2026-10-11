import { useState } from "react";
import { MoreHorizontal, Pencil, Repeat, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { formatCurrency, formatDate, getApiErrorMessage } from "@/lib/utils";
import { type Transfer } from "@/types/transfer";
import { transferService } from "@/services/transferService";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface TransfersTableProps {
  transfers: Transfer[];
  onEdit: (transfer: Transfer) => void;
  onRefresh: () => void;
}

export default function TransfersTable({
  transfers,
  onEdit,
  onRefresh,
}: TransfersTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transferToDelete, setTransferToDelete] = useState<Transfer | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!transferToDelete) return;
    setLoading(true);
    try {
      await transferService.delete(transferToDelete.id);
      toast.success("Transferencia eliminada exitosamente");
      onRefresh();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Error al eliminar la transferencia"));
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setTransferToDelete(null);
    }
  };

  if (transfers.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/40">
        <Repeat className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">
          No tienes transferencias registradas
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Comienza registrando una transferencia entre tus cuentas
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Desde</TableHead>
              <TableHead>Hacia</TableHead>
              <TableHead className="text-right">Monto origen</TableHead>
              <TableHead className="text-right">Monto destino</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transfers.map((transfer) => (
              <TableRow key={transfer.id}>
                <TableCell className="whitespace-nowrap">
                  {formatDate(transfer.date, "dd/MM/yyyy HH:mm")}
                </TableCell>
                <TableCell>
                  {transfer.fromAccount?.name ?? `#${transfer.fromAccountId}`}
                </TableCell>
                <TableCell>
                  {transfer.toAccount?.name ?? `#${transfer.toAccountId}`}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(transfer.fromAmount, transfer.fromCurrency)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(transfer.toAmount, transfer.toCurrency)}
                </TableCell>
                <TableCell className="max-w-48 truncate text-muted-foreground">
                  {transfer.description || "—"}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(transfer)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setTransferToDelete(transfer);
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
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar transferencia?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán también las dos transacciones generadas por esta
              transferencia (eliminación lógica).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
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
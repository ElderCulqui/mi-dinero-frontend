import { formatCurrency, formatDate, getApiErrorMessage } from "@/lib/utils";
import type { Transaction, TransactionPagination } from "@/types/transaction";
import {
    tableFeatures,
    createColumnHelper,
    useTable,
    type ColumnDef,
} from "@tanstack/react-table"
import { Badge } from "../ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Loader2, MoreHorizontal, Pencil, ReceiptText, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";

interface TransactionsTableProps {
    transactions: Transaction[];
    pagination: TransactionPagination;
    loading?: boolean;
    onEdit: (transaction: Transaction) => void;
    onDelete: (transaction: Transaction) => Promise<void> | void;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
}

const features = tableFeatures({});

const columnHelper = createColumnHelper<
    typeof features,
    Transaction
>();

type TransactionColumnDef = ColumnDef<
    typeof features,
    Transaction
>;

const typeConfig: Record<
    Transaction["type"],
    { label: string, className: string }
> = {
    ingreso: {
    label: "Ingreso",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    },
    egreso: {
        label: "Egreso",
        className:
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    },
}

const statusConfig: Record<
  Transaction["status"],
  { label: string; className: string }
> = {
  ejecutado: {
    label: "Ejecutado",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  anulado: {
    label: "Anulado",
    className:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
};

const sourceLabels: Record<Transaction["source"], string> = {
  manual: "Manual",
  loan: "Préstamo",
  installment: "Cuota",
  reimbursement: "Reembolso",
  transfer: "Transferencia",
};

function createColumns(
    onEdit: (transaction: Transaction) => void,
    onRequestDelete: (transaction: Transaction) => void,
): TransactionColumnDef[] {
    return columnHelper.columns([
        columnHelper.accessor("date", {
            header: "Fecha",
            cell: ({ row }) => (
                <span className="whitespace-nowrap">
                    {formatDate(row.original.date, "dd/MM/yyyy HH:mm")}
                </span>
            )
        }),

        columnHelper.accessor("description", {
            header: "Descripción",
            cell: ({ row }) => (
                <span className="max-w-56 truncate">
                    {row.original.description || (
                        <span className="text-muted-foreground">
                            Sin descripción
                        </span>
                    )}
                </span>
            )
        }),

        columnHelper.display({
            id: "account",
            header: "Cuenta",
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">
                        {row.original.account.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {row.original.account.currency}
                    </div>
                </div>
            ),
        }),

        columnHelper.display({
            id: "category",
            header: "Categoría",
            cell: ({ row }) => {
                const category = row.original.category;

                if(!category) {
                    return (
                        <span className="text-muted-foreground">
                            Sin categoría
                        </span>
                    )
                }

                return (
                    <div className="flex items-center gap-2">
                        <span
                            aria-hidden="true"
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                    </div>
                )
            }
        }),

        columnHelper.accessor("type", {
            header: "Tipo",
            cell: ({ row }) => {
                const config = typeConfig[row.original.type];

                return (
                    <Badge variant="secondary" className={config.className}>
                        {config.label}
                    </Badge>
                );
            },
        }),

        columnHelper.accessor("amount", {
            id: "amount",
            header: () => <div className="text-right">Monto</div>,
            cell: ({ row }) => {
                const transaction = row.original;
                const isIncome = transaction.type === "ingreso";
                const sign = isIncome ? "+" : "-";

                return (
                    <div
                        className={`text-right font-medium ${
                            isIncome ? "text-green-600" : "text-red-600"
                        }`}
                    >
                        {sign}
                        {formatCurrency(
                            transaction.amount,
                            transaction.account.currency
                        )}
                    </div>
                );
            }
        }),

        columnHelper.accessor("status", {
            header: "Estado",
            cell: ({ row }) => {
                const config = statusConfig[row.original.status];

                return (
                    <Badge variant="secondary" className={config.className}>
                        {config.label}
                    </Badge>
                );
            },
        }),

        columnHelper.accessor("source", {
            header: "Origen",
            cell: ({ row }) => {
                return (
                    <Badge variant="outline">
                        {sourceLabels[row.original.source]}
                    </Badge>
                );
            },
        }),

        columnHelper.display({
            id: "actions",
            header: () => <div className="text-right">Acciones</div>,
            cell: ({ row }) => {
                const transaction = row.original;

                return (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
                                aria-label={`Acciones para la transacción ${transaction.id}`}
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={() => onEdit(transaction)}
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Editar
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => onRequestDelete(transaction)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        }),
    ]);
}

export default function TransactionsTable({
    transactions,
    pagination,
    loading = false,
    onEdit,
    onDelete,
    onPageChange,
    onPageSizeChange
}: TransactionsTableProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleRequestDelete = (transaction: Transaction) => {
        setTransactionToDelete(transaction);
        setDeleteDialogOpen(true);
    }

    const columns = useMemo(
        () => createColumns(onEdit, handleRequestDelete),
        [onEdit],
    );

    const table = useTable({
        features,
        columns,
        data: transactions
    })

    const firstItem = pagination.total === 0 
        ? 0
        : (pagination.page - 1) * pagination.pageSize + 1;

    const lastItem = Math.min(
        pagination.page * pagination.pageSize,
        pagination.total,
    )

    const handleDelete = async () => {
        if (!transactionToDelete) return;

        setDeleteLoading(true);

        try {
            await onDelete(transactionToDelete);

            toast.success("Transacción eliminada exitosamente");
            setDeleteDialogOpen(false);
            setTransactionToDelete(null);
        } catch (error: unknown) {
            toast.error(
                getApiErrorMessage(
                    error,
                    "Error al eliminar la transacción"
                ),
            );
        } finally {
            setDeleteLoading(false);
        }
    }

    return (
        <section
            aria-label="Listado de transacciones"
            className="space-y-4"
        >
            <div className="overflow-hidden rounded-lg border bg-card">
                <Table>
                    <TableCaption className="sr-only">
                        Lista de trasacciones registradas
                    </TableCaption>

                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : (
                                            <table.FlexRender header={header} />
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-32 text-center"
                                >
                                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Cargando transacciones...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-40 text-center"
                                >
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <ReceiptText className="h-10 w-10" />
                                        <span>
                                            No hay transacciones registradas.
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getAllCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            <table.FlexRender cell={cell} />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                {pagination.total === 0
                    ? "No hay transacciones"
                    : `Mostrando ${firstItem}-${lastItem} de ${pagination.total} transacciones`}
                </p>

                <div className="flex flex-wrap items-center justify-end gap-3">
                <Select
                    value={String(pagination.pageSize)}
                    onValueChange={(value) => {
                    onPageSizeChange(Number(value));
                    }}
                >
                    <SelectTrigger
                    className="w-[85px]"
                    aria-label="Cantidad por página"
                    >
                    <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                </Select>

                <span className="text-sm text-muted-foreground">
                    Página {pagination.page} de {pagination.totalPages}
                </span>

                <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasPreviousPage || loading}
                    onClick={() => onPageChange(pagination.page - 1)}
                >
                    Anterior
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNextPage || loading}
                    onClick={() => onPageChange(pagination.page + 1)}
                >
                    Siguiente
                </Button>
                </div>
            </div>

            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                if (!deleteLoading) {
                    setDeleteDialogOpen(open);

                    if (!open) {
                    setTransactionToDelete(null);
                    }
                }
                }}
            >
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                    ¿Eliminar transacción?
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                    Esta acción realizará una eliminación lógica de la
                    transacción
                    <strong>
                        {transactionToDelete?.description
                        ? ` "${transactionToDelete.description}"`
                        : ` #${transactionToDelete?.id}`}
                    </strong>
                    .
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleteLoading}>
                    Cancelar
                    </AlertDialogCancel>

                    <AlertDialogAction
                    variant="destructive"
                    disabled={deleteLoading}
                    onClick={handleDelete}
                    >
                    {deleteLoading ? (
                        <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Eliminando...
                        </>
                    ) : (
                        "Eliminar"
                    )}
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    )
}
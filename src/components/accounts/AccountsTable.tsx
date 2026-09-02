import { useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Power,
  Wallet,
  CreditCard,
  Banknote,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "../../lib/utils";

import { type Account } from "../../types/account";
import { accountService } from "../../services/accountService";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface AccountsTableProps {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onRefresh: () => void;
}

const accountTypeConfig: Record<
  string,
  { label: string; icon: any; color: string }
> = {
  efectivo: {
    label: "Efectivo",
    icon: Banknote,
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  tarjeta_credito: {
    label: "Crédito",
    icon: CreditCard,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  cuenta_bancaria: {
    label: "Cuenta Bancaria",
    icon: Wallet,
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  },
};

export default function AccountsTable({
  accounts,
  onEdit,
  onRefresh,
}: AccountsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!accountToDelete) return;
    setLoading(true);

    try {
      await accountService.delete(accountToDelete.id);
      toast.success("Cuenta eliminada exitosamente");
      onRefresh();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al eliminar la cuenta";
      toast.error(message);
      console.error("Delete account error:", error);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    }
  };

  const handleToggleStatus = async (account: Account) => {
    try {
      await accountService.toggleStatus(account.id);
      toast.success(`Cuenta ${account.isActive ? "desactivada" : "activada"}`);
      onRefresh();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al cambiar el estado";
      toast.error(message);
      console.error("Toggle account status error:", error);
    }
  };

  if (accounts.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/40">
        <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">
          No tienes cuentas registradas
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Comienza agregando tu primera cuenta
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cuenta</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead className="text-right">Límite</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => {
                const typeConfig =
                  accountTypeConfig[account.type] || accountTypeConfig.efectivo;
                const Icon = typeConfig.icon;
                return (
                  <TableRow key={account.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          // style={{ backgroundColor: account?.color }}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">{account.name}</div>
                          {/* <div className="text-sm text-gray-500">{account.currency}</div> */}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={typeConfig.color}>
                        {typeConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(account.balance, "PEN")}
                      {/* {account.balance} */}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {account.type === "tarjeta_credito" && account.creditLimit
                        ? formatCurrency(account.creditLimit, "PEN")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={account.isActive ? "default" : "secondary"}
                      >
                        {account.isActive ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(account)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(account)}
                          >
                            <Power className="mr-2 h-4 w-4" />
                            {account.isActive ? "Desactivar" : "Activar"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setAccountToDelete(account);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Versión Mobile */}
        <div className="md:hidden divide-y">
          {accounts.map((account) => {
            const typeConfig = accountTypeConfig[account.type];
            const Icon = typeConfig.icon;

            return (
              <div key={account.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      // style={{ backgroundColor: account.color + '20' }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">{account.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className={`${typeConfig.color} text-xs`}
                        >
                          {typeConfig.label}
                        </Badge>
                        <Badge
                          variant={account.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {account.isActive ? "Activa" : "Inactiva"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(account)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggleStatus(account)}
                      >
                        <Power className="mr-2 h-4 w-4" />
                        {account.isActive ? "Desactivar" : "Activar"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          setAccountToDelete(account);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-muted-foreground">Saldo</div>
                    <div className="font-medium">
                      {formatCurrency(account.balance, "PEN")}
                    </div>
                  </div>
                  {account.type === "tarjeta_credito" &&
                    account.creditLimit && (
                      <div>
                        <div className="text-muted-foreground">Límite</div>
                        <div className="font-medium">
                          {formatCurrency(account.creditLimit, "PEN")}
                        </div>
                      </div>
                    )}
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
              Esta acción no se puede deshacer. Se eliminará permanentemente la
              cuenta <strong>{accountToDelete?.name}</strong> y todos sus datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* <AlertDialogCancel>Cancelar</AlertDialogCancel> */}
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

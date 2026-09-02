import { useState } from "react";
import {
  MoreHorizontal,
  BanknoteArrowUp,
  BanknoteArrowDown,
  FolderOpen,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { type Category } from "@/types/category";
import { categoryService } from "@/services/categoryService";

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

interface CategoriesTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onRefresh: () => void;
}

const transactionTypeConfig: Record<
  string,
  { label: string; icon: any; color: string }
> = {
  ingreso: {
    label: "Ingreso",
    icon: BanknoteArrowUp,
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  egreso: {
    label: "Egreso",
    icon: BanknoteArrowDown,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
};

export default function CategoriesTable({
  categories,
  onEdit,
  onRefresh,
}: CategoriesTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setLoading(true);

    try {
      await categoryService.delete(categoryToDelete.id);
      toast.success("Categoría eliminada exitosamente");
      onRefresh();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al eliminar la categoría";
      toast.error(message);
      console.error("Delete category error:", error);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/40">
        <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">
          No tienes categorías registradas
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Comienza agregando tu primera categoría
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
                <TableHead>Categoría</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => {
                const typeConfig = transactionTypeConfig[category.type];
                const Icon = typeConfig.icon;
                return (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: category?.color }}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">{category.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={typeConfig.color}>
                        {typeConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(category)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setCategoryToDelete(category);
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
        {/* <div className="md:hidden divide-y">
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
                    <div className="text-gray-500">Saldo</div>
                    <div className="font-medium">
                      {formatCurrency(account.balance, "PEN")}
                    </div>
                  </div>
                  {account.type === "tarjeta_credito" &&
                    account.creditLimit && (
                      <div>
                        <div className="text-gray-500">Límite</div>
                        <div className="font-medium">
                          {formatCurrency(account.creditLimit, "PEN")}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            );
          })}
        </div> */}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la
              cuenta <strong>{categoryToDelete?.name}</strong> y todos sus
              datos.
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

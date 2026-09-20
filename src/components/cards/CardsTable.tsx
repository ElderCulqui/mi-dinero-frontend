import { useState } from "react";
import {
  CreditCard,
  Eye,
  MoreHorizontal,
  Pencil,
  Power,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { cardService } from "@/services/cardService";
import type { Card } from "@/types/card";
import { currencyOptions } from "@/types/currency";
import { getApiErrorMessage } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CardsTableProps {
  cards: Card[];
  onEdit: (card: Card) => void;
  onView: (card: Card) => void;
  onRefresh: () => void;
}

export default function CardsTable({
  cards,
  onEdit,
  onView,
  onRefresh,
}: CardsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<Card | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!cardToDelete) return;

    setLoading(true);
    try {
      await cardService.delete(cardToDelete.id);
      toast.success("Tarjeta eliminada exitosamente");
      onRefresh();
    } catch (error: unknown) {
      const message = getApiErrorMessage(
        error,
        "Error al eliminar la tarjeta",
      );
      toast.error(message);
      console.error("Delete card error:", error);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setCardToDelete(null);
    }
  };

  const handleToggleStatus = async (card: Card) => {
    try {
      await cardService.toggleStatus(card.id);
      toast.success(`Tarjeta ${card.isActive ? "desactivada" : "activada"}`);
      onRefresh();
    } catch (error: unknown) {
      const message = getApiErrorMessage(
        error,
        "Error al cambiar el estado",
      );
      toast.error(message);
      console.error("Toggle card status error:", error);
    }
  };

  const renderActions = (card: Card) => (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Acciones para {card.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onView(card)}>
          <Eye className="mr-2 h-4 w-4" />
          Ver detalle
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(card)}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleToggleStatus(card)}>
          <Power className="mr-2 h-4 w-4" />
          {card.isActive ? "Desactivar" : "Activar"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600"
          onClick={() => {
            setCardToDelete(card);
            setDeleteDialogOpen(true);
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (cards.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/40 py-12 text-center">
        <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">
          No tienes tarjetas registradas
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Comienza agregando tu primera tarjeta
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
                <TableHead>Tarjeta</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Moneda</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cards.map((card) => {
                const currency = currencyOptions[card.bankCurrency];
                return (
                  <TableRow key={card.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <span className="font-medium">{card.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{card.brand}</TableCell>
                    <TableCell>
                      <span title={currency.label}>
                        {currency.code} ({currency.symbol})
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={card.isActive ? "default" : "secondary"}>
                        {card.isActive ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {renderActions(card)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="divide-y md:hidden">
          {cards.map((card) => {
            const currency = currencyOptions[card.bankCurrency];
            return (
              <div key={card.id} className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">{card.name}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {card.brand}
                        </Badge>
                        <Badge
                          variant={card.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {card.isActive ? "Activa" : "Inactiva"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {renderActions(card)}
                </div>
                <div className="text-sm">
                  <div className="text-muted-foreground">Moneda</div>
                  <div className="font-medium">
                    {currency.code} ({currency.symbol})
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
              Esta acción no se puede deshacer. Se eliminará permanentemente la
              tarjeta <strong>{cardToDelete?.name}</strong> y todos sus datos.
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

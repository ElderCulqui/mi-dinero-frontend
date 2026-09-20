import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import AppLayout from "@/components/layouts/AppLayout";
import CardForm from "@/components/cards/CardForm";
import CardsTable from "@/components/cards/CardsTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cardService } from "@/services/cardService";
import type { Card } from "@/types/card";
import { useNavigate } from "react-router-dom";

export default function Cards() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | undefined>();

  const fetchCards = async () => {
    try {
      setLoading(true);
      const data = await cardService.getAll();
      setCards(data);
    } catch (error) {
      toast.error("Error al cargar las tarjetas");
      console.error("Fetch cards error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (card: Card) => {
    navigate(`/cards/${card.id}`);
  }

  useEffect(() => {
    fetchCards();
  }, []);

  const handleNew = () => {
    setEditingCard(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (card: Card) => {
    setEditingCard(card);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    setEditingCard(undefined);
    fetchCards();
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setEditingCard(undefined);
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingCard(undefined);
    }
  };

  return (
    <AppLayout
      title="Mis tarjetas de crédito"
      actions={
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva tarjeta
        </Button>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <CardsTable
          cards={cards}
          onEdit={handleEdit}
          onView={handleView}
          onRefresh={fetchCards}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCard ? "Editar tarjeta" : "Nueva tarjeta"}
            </DialogTitle>
            <DialogDescription>
              {editingCard
                ? "Modifica los detalles de tu tarjeta"
                : "Completa el formulario para crear una nueva tarjeta"}
            </DialogDescription>
          </DialogHeader>
          <CardForm
            card={editingCard}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import AppLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TransfersTable from "@/components/transfers/TransfersTable";
import TransferForm from "@/components/transfers/TransferForm";
import { transferService } from "@/services/transferService";
import type { Transfer } from "@/types/transfer";
import { getApiErrorMessage } from "@/lib/utils";

export default function Transfers() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<Transfer | undefined>();

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const data = await transferService.getAll();
      setTransfers(data);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Error al cargar las transferencias"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleNew = () => {
    setEditingTransfer(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (transfer: Transfer) => {
    setEditingTransfer(transfer);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    setEditingTransfer(undefined);
    fetchTransfers();
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setEditingTransfer(undefined);
  };

  return (
    <AppLayout
      title="Mis transferencias"
      actions={
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva transferencia
        </Button>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <TransfersTable
          transfers={transfers}
          onEdit={handleEdit}
          onRefresh={fetchTransfers}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTransfer ? "Editar transferencia" : "Nueva transferencia"}
            </DialogTitle>
            <DialogDescription>
              {editingTransfer
                ? "Modifica los datos de la transferencia"
                : "Registra una transferencia entre tus cuentas"}
            </DialogDescription>
          </DialogHeader>
          <TransferForm
            transfer={editingTransfer}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
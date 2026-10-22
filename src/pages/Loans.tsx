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
import LoansTable from "@/components/loans/LoansTable";
import LoanForm from "@/components/loans/LoanForm";
import { loanService } from "@/services/loanService";
import type { Loan } from "@/types/loan";
import { getApiErrorMessage } from "@/lib/utils";

export default function Loans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | undefined>();

  const fetchLoans = async () => {
    try {
      setLoading(true);
      setLoans(await loanService.getAll());
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Error al cargar los préstamos"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleNew = () => {
    setEditingLoan(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (loan: Loan) => {
    setEditingLoan(loan);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    setEditingLoan(undefined);
    fetchLoans();
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setEditingLoan(undefined);
  };

  return (
    <AppLayout
      title="Préstamos"
      actions={
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo préstamo
        </Button>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <LoansTable loans={loans} onEdit={handleEdit} onRefresh={fetchLoans} />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLoan ? "Editar préstamo" : "Nuevo préstamo"}
            </DialogTitle>
            <DialogDescription>
              {editingLoan
                ? "Modifica los detalles del préstamo"
                : "Completa el formulario para crear un nuevo préstamo"}
            </DialogDescription>
          </DialogHeader>
          <LoanForm
            loan={editingLoan}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
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
import InstallmentPlansTable from "@/components/installmentPlans/InstallmentPlansTable";
import InstallmentPlanForm from "@/components/installmentPlans/InstallmentPlanForm";
import { installmentPlanService } from "@/services/installmentPlanService";
import type { InstallmentPlan } from "@/types/installmentPlan";
import { getApiErrorMessage } from "@/lib/utils";

export default function InstallmentPlans() {
  const [plans, setPlans] = useState<InstallmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<InstallmentPlan | undefined>();

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setPlans(await installmentPlanService.getAll());
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Error al cargar los planes"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleNew = () => {
    setEditingPlan(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (plan: InstallmentPlan) => {
    setEditingPlan(plan);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    setEditingPlan(undefined);
    fetchPlans();
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setEditingPlan(undefined);
  };

  return (
    <AppLayout
      title="Planes en cuotas"
      actions={
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo plan
        </Button>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <InstallmentPlansTable
          plans={plans}
          onEdit={handleEdit}
          onRefresh={fetchPlans}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? "Editar plan" : "Nuevo plan en cuotas"}
            </DialogTitle>
            <DialogDescription>
              {editingPlan
                ? "Modifica los detalles del plan"
                : "Completa el formulario para crear un nuevo plan"}
            </DialogDescription>
          </DialogHeader>
          <InstallmentPlanForm
            plan={editingPlan}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
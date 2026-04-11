import { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import AppLayout from "../components/layouts/AppLayout";
import AccountsTable from "../components/accounts/AccountsTable";
import AccountForm from "../components/accounts/AccountForm";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import type { Account } from "../types/account";
import { accountService } from "../services/accountService";

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>();

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await accountService.getAll();
      setAccounts(data);
    } catch (error) {
      toast.error("Error al cargar las cuentas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleNew = () => {
    setEditingAccount(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    setEditingAccount(undefined);
    fetchAccounts();
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setEditingAccount(undefined);
  };

  return (
    <AppLayout
      title="Mis cuentas"
      actions={
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva cuenta
        </Button>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <AccountsTable
          accounts={accounts}
          onEdit={handleEdit}
          onRefresh={fetchAccounts}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? "Editar cuenta" : "Nueva cuenta"}
            </DialogTitle>
            <DialogDescription>
              {editingAccount
                ? "Modifica los detalles de tu cuenta"
                : "Completa el formulario para crear una nueva cuenta"}
            </DialogDescription>
          </DialogHeader>
          <AccountForm
            account={editingAccount}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

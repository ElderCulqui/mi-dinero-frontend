import AppLayout from "@/components/layouts/AppLayout"
import TransactionForm from "@/components/transactions/TransactionForm";
import TransactionsTable from "@/components/transactions/TransactionsTable";
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { transactionService } from "@/services/transactionService";
import type { Transaction, TransactionPagination } from "@/types/transaction";
import { Loader2, Plus } from "lucide-react"
import { useEffect, useState } from "react";

const defaultPagination: TransactionPagination = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
}

export default function Transactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [pagination, setPagination] =
      useState<TransactionPagination>(defaultPagination);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(true);
    const [reloadKey, setReloadKey] = useState(0);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTxn, setEditingTxn] = useState<
      Transaction | undefined
    >();

    useEffect(() => {
      let cancelled = false;
      const fetchTransactions = async () => {
        setLoading(true);

        try {
          const response = await transactionService.getAll({
            page,
            pageSize
          });

          if (cancelled) return;

          setTransactions(response.data);
          setPagination(response.pagination);
        } catch (error) {
          
        } finally {
          if (!cancelled) {
            setLoading(false)
          }
        }
      };

      void fetchTransactions();

      return () => {
        cancelled = true;
      };  
    }, [page, pageSize, reloadKey]);

    const handleNew = () => {
      setEditingTxn(undefined);
      setDialogOpen(true);
    };
  
    const handleEdit = (transaction: Transaction) => {
      setEditingTxn(transaction);
      setDialogOpen(true);
    };

    const handleDelete = async (transaction: Transaction) => {
      await transactionService.delete(transaction.id);

      if (transactions.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1);
      } else {
        setReloadKey((currentKey) => currentKey - 1);
      }
    };

    const handleSuccess = () => {
      setDialogOpen(false);
      setEditingTxn(undefined);
      setReloadKey((currentKey) => currentKey + 1);
    };

    const handleCancel = () => {
      setDialogOpen(false);
      setEditingTxn(undefined);
    };

    const handleDialogChange = (open: boolean) => {
      setDialogOpen(open);
      if (!open) {
        setEditingTxn(undefined);
      }
    };

    const handlePageChange = (nextPage: number) => {
      setPage(nextPage);
    };

    const handlePageSizeChange = (nextPageSize: number) => {
      setPageSize(nextPageSize);
      setPage(1);
    };

    return (
      <AppLayout
        title="Mis transaciones"
        actions={
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva transacción
          </Button>
        }
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <TransactionsTable
            transactions={transactions}
            pagination={pagination}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}

        <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTxn ? "Editar transacción" : "Nueva transacción"}
              </DialogTitle>
              <DialogDescription>
                {editingTxn
                  ? "Modifica los detalles de una transacción"
                  : "Completa el formulario para crear una nueva cuenta"}
              </DialogDescription>
            </DialogHeader>
            <TransactionForm
              transaction={editingTxn}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </DialogContent>
        </Dialog>
      </AppLayout>
    )
}
import { formatCurrency, formatDate, getApiErrorMessage } from '@/lib/utils';
import { transactionService } from '@/services/transactionService';
import type { Transaction } from '@/types/transaction';
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowDownLeft, ArrowUpLeft, Loader2, Undo2 } from 'lucide-react';

export default function RecentTransacionts() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        
        const fetchTransactions = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const response = await transactionService.getAll({
                    page: 1,
                    pageSize: 5
                });

                if (!cancelled) {
                    setTransactions(response.data);
                }
            } catch (error) {
                if (!cancelled) {
                    setError(
                        getApiErrorMessage(error, "Error al cargar las transacciones"),
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void fetchTransactions();

        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Transacciones recientes</CardTitle>
                <Button
                    onClick={() => navigate("/transactions")}
                >
                    <Undo2 className="mr-2 h-4 w-4" />
                    Ver todas
                </Button>
            </CardHeader>

            <CardContent>
                {loading ? (
                    <div
                        className="flex items-center justify-center py-8"
                        role="status"
                        aria-label="Cargando transacciones"
                    >
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                 ) : error ? (
                    <div className="flex flex-col items-start gap-3 py-2">
                        <p className="text-sm text-destructive" role="alert">
                            {error}
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setReloadKey((key) => key + 1)}
                        >
                            Reintentar
                        </Button>
                    </div>
                 ) : transactions.length === 0 ? (
                    <p className="py-2 text-sm text-muted-foreground">
                        Aún no hay transacciones.
                    </p>
                 ) : (
                    <div className="divide-y">
                        {transactions.map((transaction) => {
                            const isIncome = transaction.type === "ingreso";
                            const description = transaction.description?.trim();
                            const title =
                                description ||
                                transaction.category?.name ||
                                "Sin descripción";

                            const details = [
                                formatDate(transaction.date, "dd MMM yyyy, hh:mm a"),
                                transaction.account.name,
                                description
                                ? transaction.category?.name
                                : undefined,
                                transaction.status === "anulado" ? "Anulada" : undefined,
                            ]
                                .filter(Boolean)
                                .join(" · ");

                            return (
                                <div
                                    key={transaction.id}
                                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                                >
                                    <div className={
                                            isIncome
                                                ? "flex size-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                : "flex size-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                        }
                                        aria-hidden="true"
                                    >
                                        {isIncome ? (
                                            <ArrowDownLeft className="size-4" />
                                        ) : (
                                            <ArrowUpLeft className="size-4" />
                                        )}
                                    </div>

                                     <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{title}</p>
                                        <p className="truncate text-xs text-muted-foreground">
                                        {details}
                                        </p>
                                    </div>

                                    <p
                                        className={
                                        isIncome
                                            ? "shrink-0 text-sm font-semibold text-green-700 dark:text-green-400"
                                            : "shrink-0 text-sm font-semibold text-red-700 dark:text-red-400"
                                        }
                                    >
                                        {isIncome ? "+" : "-"}
                                        {formatCurrency(
                                            Math.abs(transaction.amount),
                                            transaction.account.currency,
                                        )}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                 )
                }

            </CardContent>
        </Card>
    )
}
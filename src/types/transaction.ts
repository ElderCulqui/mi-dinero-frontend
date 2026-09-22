import z from "zod";
import type { TransactionType } from "./transactionType";
import type { Currency } from "./currency";

export type TxnStatus = "ejecutado" | "anulado";

export type TxnSource = "manual" | "loan" | "installment" | "reimbursement" | "transfer";

export interface TransactionAccount {
  id: number;
  name: string;
  currency: Currency;
}

export interface TransactionCategory {
  id: number;
  name: string;
  color: string;
  type: TransactionType;
}

export interface Transaction {
    id: number;
    userId: number;
    accountId: number;
    categoryId: number | null;
    type: TransactionType;
    amount: number;
    amountBase: number;
    description: string | null;
    date: string;
    status: TxnStatus;
    source: TxnSource;
    billingCycleId: number | null;
    loanPaymentId: number | null;
    installmentId: number | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    account: TransactionAccount;
    category: TransactionCategory | null;
}

export interface TransactionPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface TransactionsResponse { 
  data: Transaction[],
  pagination: TransactionPagination
}

export const transactionSchema = z.object({
  accountId: z.number().positive(),
  categoryId: z.number().optional(),
  type: z.enum(["ingreso", "egreso"]),
  date: z.string().min(1, "La fecha es obligatoria"),
  amount: z.number().min(0.01, "El monto es obligatorio"),
  description: z.string().optional(),
});

export type TransactionFormData = z.input<typeof transactionSchema>;
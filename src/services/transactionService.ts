import api from "@/services/api";
import type { 
    Transaction,
    TransactionFormData,
    TransactionsResponse,
} from "@/types/transaction";
import { number } from "zod";

const path = "/transactions";

interface GetTransactionsParams {
    page?: number;
    pageSize?: number;
}

export const transactionService = {
    getAll: async (
        params?: GetTransactionsParams,
    ): Promise<TransactionsResponse> => {
        const { data } = await api.get<TransactionsResponse>(path, {
            params,
        });
        return data;
    },
    
    getById: async (id: string): Promise<Transaction> => {
        const { data } = await api.get<Transaction>(`${path}/${id}`);
        return data;
    },

    create: async (
        transactionData: TransactionFormData,
    ) : Promise<Transaction> => {
        const { data } = await api.post(`${path}`, transactionData);
        return data;
    },

    update : async (
        transactionId: number,
        transactionData: TransactionFormData,
    ) : Promise<Transaction> => {
        const { data } = await api.put(
            `${path}/${transactionId}`,
            transactionData,
        )
        return data;
    },

    delete : async (transactionId : number) : Promise<void> => {
        await api.delete(`${path}/${transactionId}`);
    },
}
import api from "@/services/api";
import type {
  TransactionShare,
  CollectShareFormData,
} from "@/types/transactionShare";

export interface SplitShareInput {
    contactId: number;
    amount: number;
}

export const transactionShareService = {
    getByTransaction: async (transactionId: number): Promise<TransactionShare[]> => {
        const { data } = await api.get(`/transactions/${transactionId}/shares`);
        return data;
    },
    split : async (
        transactionId: number,
        shares: SplitShareInput[]
    ): Promise<TransactionShare[]> => {
        const { data } = await api.post(`/transactions/${transactionId}/shares`, {
            shares,
        })
        return data;
    },
    collect: async (
        shareId: number,
        collectData: CollectShareFormData,
    ): Promise<TransactionShare> => {
        const { data } = await api.patch( `/transaction-shares/${shareId}/cobrar`, collectData);
        return data;
    }
}
import api from "@/services/api";
import type { Loan, LoanFormData, LoanUpdateData, PayLoanFormData } from "@/types/loan"

const path = "/loans";

export const loanService = {
    getAll: async (): Promise<Loan[]> => {
        const { data } = await api.get(path);
        return data;
    },
    getById: async (id: number): Promise<Loan> => {
        const { data } = await api.get(`${path}/${id}`);
        return data;
    },
    create: async (loanData: LoanFormData): Promise<Loan> => {
        const { data } = await api.post(path, loanData);
        return data;
    },
    update: async (id: number, loanData: LoanUpdateData): Promise<Loan> => {
        const { data } = await api.put(`${path}/${id}`, loanData);
        return data;
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`${path}/${id}`);
    },
    pay: async (
        loanId: number,
        paymentId: number,
        payData: PayLoanFormData
    ): Promise<unknown> => {
        const { data } = await api.post(
            `${path}/${loanId}/payments/${paymentId}/pay`,
            payData,
        );
        return data;
    }
}
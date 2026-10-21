import api from "@/services/api";
import type { InstallmentPlan, InstallmentPlanFormData, InstallmentPlanUpdateData, PayInstallmentFormData } from "@/types/installmentPlan";

const path = "/installment-plans";

export const installmentPlanService = {
    getAll: async (): Promise<InstallmentPlan[]> => {
        const { data } = await api.get(path);
        return data;
    },
    getById: async (id: number): Promise<InstallmentPlan> => {
        const { data } = await api.get(`${path}/${id}`);
        return data;
    },
    create: async (planData: InstallmentPlanFormData): Promise<InstallmentPlan> => {
        const { data } = await api.post(path, planData);
        return data;
    },
    update: async (
        id: number,
        planData: InstallmentPlanUpdateData
    ): Promise<InstallmentPlan> => {
        const { data } = await api.put(`${path}/${id}`, planData);
        return data;
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`${path}/${id}`);
    },
    pay: async (
        planId: number,
        installmentId: number,
        payData: PayInstallmentFormData
    ): Promise<unknown> => {
        const { data } = await api.post(
            `${path}/${planId}/installments/${installmentId}/pay`,
            payData,
        );
        return data;
    }
}
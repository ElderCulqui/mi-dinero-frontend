import api from "@/services/api";
import { type Transfer, type TransferFormData } from "@/types/transfer"

const path = "/transfers";

export const transferService = {
    getAll: async (): Promise<Transfer[]> => {
        const { data } = await api.get(path);
        return data;
    },
    getById: async (id: number): Promise<Transfer> => {
        const { data } = await api.get(`${path}/${id}`);
        return data;
    },
    create: async (transferData: TransferFormData): Promise<Transfer> => {
        const { data } = await api.post(path, transferData);
        return data;
    },
    update: async (id: number, transferData: TransferFormData): Promise<Transfer> => {
        const { data } = await api.put(`${path}/${id}`, transferData);
        return data;
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`${path}/${id}`);
    },
}
import api from "./api";
import { type Account, type AccountFormData } from "../types/account";

export const accountService = {
  getAll: async (): Promise<Account[]> => {
    const { data } = await api.get("/accounts");
    return data;
  },

  getById: async (id: string): Promise<Account> => {
    const { data } = await api.get(`/accounts/${id}`);
    return data;
  },

  create: async (accountData: AccountFormData): Promise<Account> => {
    const { data } = await api.post("/accounts", accountData);
    return data;
  },

  update: async (
    id: string,
    accountData: AccountFormData,
  ): Promise<Account> => {
    const { data } = await api.put(`/accounts/${id}`, accountData);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/accounts/${id}`);
  },

  toggleStatus: async (id: string): Promise<Account> => {
    const { data } = await api.patch(`/accounts/${id}/toggle-status`);
    return data;
  },
};

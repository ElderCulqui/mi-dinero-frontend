import api from "@/services/api";
import { type Card, type CardFormData } from "@/types/card";

const prefixPath = "/credit-cards";

export const cardService = {
  getAll: async (): Promise<Card[]> => {
    const { data } = await api.get(prefixPath);
    return data;
  },

  getById: async (id: string): Promise<Card> => {
    const { data } = await api.get(`${prefixPath}/${id}`);
    return data;
  },

  create: async (cardData: CardFormData): Promise<Card> => {
    const { data } = await api.post(prefixPath, cardData);
    return data;
  },

  update: async (
    id: string,
    cardData: CardFormData,
  ): Promise<Card> => {
    const { data } = await api.put(`${prefixPath}/${id}`, cardData);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${prefixPath}/${id}`);
  },

  toggleStatus: async (id: string): Promise<Card> => {
    const { data } = await api.patch(`${prefixPath}/${id}/toggle-status`);
    return data;
  },
};

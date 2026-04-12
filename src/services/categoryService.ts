import api from "@/services/api";
import { type Category, type CategoryFormData } from "@/types/category";

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const { data } = await api.get("/categories");
    return data;
  },

  getById: async (id: string): Promise<Category> => {
    const { data } = await api.get(`/categories/${id}`);
    return data;
  },

  create: async (categoryData: CategoryFormData): Promise<Category> => {
    const { data } = await api.post("/categories", categoryData);
    return data;
  },

  update: async (
    id: string,
    categoryData: CategoryFormData,
  ): Promise<Category> => {
    const { data } = await api.put(`/categories/${id}`, categoryData);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

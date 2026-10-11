import api from "@/services/api";
import { type Contact, type ContactFormData } from "@/types/contact";

const path = "/contacts"

export const contactService = {
    getAll: async (): Promise<Contact[]> => {
        const { data } = await api.get(path);
        return data;
    },
    getById: async (id: number): Promise<Contact> => {
        const { data } = await api.get(`${path}/${id}`);
        return data;
    },
    create: async (contactData: ContactFormData): Promise<Contact> => {
        const { data } = await api.post(path, contactData);
        return data;
    },
    update: async (id: number, contactData: ContactFormData): Promise<Contact> => {
        const { data } = await api.put(`${path}/${id}`, contactData);
        return data;
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`${path}/${id}`);
    },
}
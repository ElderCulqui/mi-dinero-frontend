import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import AppLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ContactsTable from "@/components/contacts/ContactsTable";
import ContactForm from "@/components/contacts/ContactForm";
import { contactService } from "@/services/contactService";
import type { Contact } from "@/types/contact";
import { getApiErrorMessage } from "@/lib/utils";

export default function Contacts() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | undefined>();

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const data = await contactService.getAll();
            setContacts(data);
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, "Error al cargar los contactos"));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchContacts();
    }, []);

    const handleNew = () => {
        setEditingContact(undefined);
        setDialogOpen(true);
    };

    const handleEdit = (contact: Contact) => {
        setEditingContact(contact);
        setDialogOpen(true);
    };

    const handleSuccess = () => {
        setDialogOpen(false);
        setEditingContact(undefined);
        fetchContacts();
    };

    const handleCancel = () => {
        setDialogOpen(false);
        setEditingContact(undefined);
    };

    return (
        <AppLayout
            title="Mis contactos"
            actions={
                <Button onClick={handleNew}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo contacto
                </Button>
            }
        >
            {loading ? (
                <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <ContactsTable
                contacts={contacts}
                onEdit={handleEdit}
                onRefresh={fetchContacts}
                />
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                    {editingContact ? "Editar contacto" : "Nuevo contacto"}
                    </DialogTitle>
                    <DialogDescription>
                    {editingContact
                        ? "Modifica los detalles del contacto"
                        : "Completa el formulario para crear un nuevo contacto"}
                    </DialogDescription>
                </DialogHeader>
                <ContactForm
                    contact={editingContact}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { type Contact } from "@/types/contact";
import { contactService } from "@/services/contactService";
import { getApiErrorMessage } from "@/lib/utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ContactsTableProps {
    contacts: Contact[];
    onEdit: (contact: Contact) => void;
    onRefresh: () => void;
}

export default function ContactsTable({
    contacts,
    onEdit,
    onRefresh,
}: ContactsTableProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!contactToDelete) return;
        setLoading(true);
        try {
            await contactService.delete(contactToDelete.id);
            toast.success("Contacto eliminado exitosamente");
            onRefresh();
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, "Error al eliminar el contacto"));
        } finally {
            setLoading(false);
            setDeleteDialogOpen(false);
            setContactToDelete(null);
        }
    };

    if (contacts.length === 0) {
        return (
             <div className="text-center py-12 border rounded-lg bg-muted/40">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                    No tienes contactos registrados
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Comienza agregando tu primer contacto
                </p>
            </div>
        )
    }

    return (
        <>
            <div className="rounded-lg border bg-card overflow-hidden">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {contacts.map((contact) => (
                    <TableRow key={contact.id}>
                        <TableCell className="font-medium">{contact.name}</TableCell>
                        <TableCell className="text-muted-foreground max-w-56 truncate">
                        {contact.note || "Sin nota"}
                        </TableCell>
                        <TableCell>
                        <div className="flex justify-end">
                            <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
                                <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(contact)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                    setContactToDelete(contact);
                                    setDeleteDialogOpen(true);
                                }}
                                >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar contacto?</AlertDialogTitle>
                    <AlertDialogDescription>
                    Se eliminará el contacto <strong>{contactToDelete?.name}</strong>.
                    Sus repartos existentes no se verán afectados.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction
                    onClick={handleDelete}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700"
                    >
                    {loading ? "Eliminando..." : "Eliminar"}
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
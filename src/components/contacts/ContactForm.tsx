import { applyApiErrors } from "@/lib/form";
import { contactService } from "@/services/contactService";
import { contactSchema, type Contact, type ContactFormData } from "@/types/contact"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormActions, FormInput, FormTextArea } from "../form";

interface Props {
    contact?: Contact;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function ContactForm({ contact, onSuccess, onCancel }: Props) {
    const isEditing = !!contact;

    const form = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            name: contact?.name ?? '',
            note: contact?.note ?? ''
        },
    });

    const onSubmit = async (data: ContactFormData) => {
        try {
            if (isEditing) {
                await contactService.update(contact.id, data);
                toast.success("Contacto actualizado correctamente");
            } else {
                await contactService.create(data);
                toast.success("Contacto creado correctamente");
            }
            onSuccess?.();
        } catch (error: unknown) {
            toast.error(applyApiErrors(error, form, "Error al guardar el contacto"))
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormInput
                form={form}
                name="name"
                label="Nombre"
                type="text"
                placeholder="Ej. Mary Garate"
                required
            />

            <FormTextArea 
                form={form}
                name="note"
                label="Nota"
                placeholder="Opcional"
                rows={3}
            />

            <FormActions 
                onCancel={onCancel}
                isSubmitting={form.formState.isSubmitting}
                submitLabel={isEditing ? 'Actualizar contacto' : 'Crear contacto'}
            />
        </form>
    )
}

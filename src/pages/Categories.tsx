import { useEffect, useState } from "react";

import AppLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CategoriesTable from "@/components/categories/CategoriesTable";
import { categoryService } from "@/services/categoryService";
import type { Category } from "@/types/category";
import CategoryForm from "@/components/categories/CategoryForm";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<
    Category | undefined
  >();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      toast.error("Error al cargar las categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNew = () => {
    setEditingCategory(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    setEditingCategory(undefined);
    fetchCategories();
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setEditingCategory(undefined);
  };

  return (
    <AppLayout
      title="Mis categorías"
      actions={
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva categoría
        </Button>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <CategoriesTable
          categories={categories}
          onEdit={handleEdit}
          onRefresh={fetchCategories}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Editar categoría" : "Nueva categoría"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Modifica los detalles de tu categoría"
                : "Completa el formulario para crear una nueva categoría"}
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            category={editingCategory}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

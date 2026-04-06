import AppLayout from "../components/layouts/AppLayout";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Plus } from "lucide-react";

export default function Accounts() {
  return (
    <AppLayout
      title="Mis cuentas"
      actions={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva cuenta
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Lista de Cuentas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Aquí irán tus cuentas de efectivo, débito y crédito.
          </p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

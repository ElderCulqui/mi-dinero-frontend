import AppLayout from "../components/layouts/AppLayout";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Plus,
  Wallet,
  CreditCard,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { exchangeRateService } from "@/services/exchangeRateService";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import type { ExchangeRate } from "@/types/exchangeRate";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function Dashboard() {
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const fetchExchangeRate = async () => {
    try {
      const rate = await exchangeRateService.getLatest("USD", "PEN");
      setExchangeRate(rate);
    } catch (error) {
      console.error("Error al obtener el tipo de cambio:", error);
      toast.error("Error al obtener el tipo de cambio");
    }
  };

  useEffect(() => {
    fetchExchangeRate();
  }, []);

  return (
    <AppLayout
      title="Dashboard"
      actions={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Transacción
        </Button>
      }
    >
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/ 12,450.00</div>
            <p className="text-xs text-green-600 mt-1">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +20.1% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ingresos
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/ 15,000.00</div>
            <p className="text-xs text-muted-foreground mt-1">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gastos
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/ 2,550.00</div>
            <p className="text-xs text-muted-foreground mt-1">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tarjetas
            </CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">Activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tipo de Cambio (USD/PEN)
            </CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(exchangeRate?.rate ?? 0, 'PEN', 3)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Fuente: {exchangeRate?.source || "N/A"} - {exchangeRate?.createdAt ? formatDate(exchangeRate.createdAt) : "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transacciones Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No hay transacciones aún.</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

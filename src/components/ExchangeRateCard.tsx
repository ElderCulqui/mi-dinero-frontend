import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"
import type { ExchangeRate } from "@/types/exchangeRate"
import { exchangeRateService } from "@/services/exchangeRateService"
import { cn, formatCurrency, formatDate } from "@/lib/utils"
import { useEffect, useState } from "react"

export default function ExchangeRateCard() {
    const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const fetchExchangeRate = async () => {
        try {
            const rate = await exchangeRateService.getLatest("USD", "PEN");
            setExchangeRate(rate);
        } catch (error) {
            console.error("Error al obtener el tipo de cambio:", error);
            toast.error("Error al obtener el tipo de cambio");
        } finally {
            setLoading(false);
        }
    }

    const handleSync = async () => {
        setSyncing(true);
        try {
            const rate = await exchangeRateService.sync();
            setExchangeRate(rate);
            toast.success("Tipo de cambio actualizado")
        } catch (error) {
            console.error("Error al sincronizar el tipo de cambio:", error);
            toast.error("Error al actualizar el tipo de cambio");
        } finally {
            setSyncing(false);
        }
    }

    useEffect(() => {
        fetchExchangeRate();
    }, []);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                     Tipo de Cambio (USD/PEN)
                </CardTitle>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSync}
                    disabled={syncing || loading}
                    aria-label="Actualizar tipo de cambio"
                >
                    <RefreshCw className={cn(syncing && "animate-sping")} />
                </Button>
            </CardHeader>
             <CardContent>
                <div className="text-2xl font-bold">
                    {formatCurrency(exchangeRate?.rate ?? 0, "PEN", 3)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Fuente: {exchangeRate?.source || "N/A"} - {" "}
                {exchangeRate?.updatedAt ? formatDate(exchangeRate.updatedAt) : "N/A"}
                </p>
            </CardContent>
        </Card>
    )
}

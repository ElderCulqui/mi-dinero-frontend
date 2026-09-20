import BillingCyclesTable from '@/components/cards/BillingCyclesTable';
import AppLayout from '@/components/layouts/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { billingCycleService } from '@/services/billingCycleService';
import { cardService } from '@/services/cardService';
import type { BillingCycle } from '@/types/billingCycle';
import type { Card as CardData } from '@/types/card';
import { currencyOptions } from '@/types/currency';
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function CardShow() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [card, setCard] = useState<CardData>();
    const [cycles, setCycles] = useState<BillingCycle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cardId = id;

        if (!cardId) {
            setLoading(false);
            return;
        }

        const fetchCardDetail = async () => {
            try {
                setLoading(true);

                const [cardData, cycleData] = await Promise.all([
                    cardService.getById(id),
                    billingCycleService.getByCardId(id)
                ]);

                setCard(cardData);
                setCycles( cycleData);
            } catch (error) {
                toast.error("Error al cargar el detalle de la tarjeta");
                console.error("Fetch card detail error: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCardDetail();
    }, [id]);

    if (loading) {
        return (
        <AppLayout title="Detalle de tarjeta">
            <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        </AppLayout>
        );
    }

    if (!card) {
        return (
        <AppLayout title="Tarjeta no encontrada">
            <Button variant="outline" onClick={() => navigate("/cards")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a tarjetas
            </Button>
        </AppLayout>
        );
    }

    const currency = currencyOptions[card.bankCurrency];
    
    return (
        <AppLayout
        title={card.name}
        actions={
            <Button variant="outline" onClick={() => navigate("/cards")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
            </Button>
        }
        >
        <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Información de la tarjeta
            </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium">{card.name}</p>
            </div>

            <div>
                <p className="text-sm text-muted-foreground">Marca</p>
                <p className="font-medium">{card.brand}</p>
            </div>

            <div>
                <p className="text-sm text-muted-foreground">Moneda</p>
                <p className="font-medium">
                {currency.code} ({currency.symbol})
                </p>
            </div>

            <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <Badge variant={card.isActive ? "default" : "secondary"}>
                {card.isActive ? "Activa" : "Inactiva"}
                </Badge>
            </div>
            </CardContent>
        </Card>

        <section className="space-y-4">
            <div>
            <h2 className="text-xl font-semibold">
                Ciclos de facturación
            </h2>
            <p className="text-sm text-muted-foreground">
                Consulta los periodos y fechas de vencimiento de tu tarjeta.
            </p>
            </div>

            <BillingCyclesTable cycles={cycles} currency={card.bankCurrency} />
        </section>
        </AppLayout>
    );
}
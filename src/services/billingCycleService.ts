import api from "@/services/api";
import type { 
    BillingCycle,
    BillingCycleFormData,
} from "@/types/billingCycle";

const cardsPath = "/credit-cards";
const cyclesPath = "/billing-cycles";

export const billingCycleService = {
    getByCardId: async (cardId: string): Promise<BillingCycle[]> => {
        const { data } = await api.get(
            `${cardsPath}/${cardId}/billing-cycles`
        ); 
        return data;
    },

    create: async (
        cardId: string,
        cycleData: BillingCycleFormData,
    ) : Promise<BillingCycle> => {
        const { data } = await api.post(
            `${cardsPath}/${cardId}/billing-cycles`,
            cycleData
        );
        return data;
    },

    update : async (
        cycleId: number,
        cycleData: BillingCycleFormData,
    ) : Promise<BillingCycle> => {
        const { data } = await api.put(
            `${cyclesPath}/${cycleId}`,
            cycleData,
        )
        return data;
    },

    delete : async (cycleId : number) : Promise<void> => {
        await api.delete(`${cyclesPath}/${cycleId}`);
    },
}
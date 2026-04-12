import api from "@/services/api";
import { type ExchangeRate } from "@/types/exchangeRate";

export const exchangeRateService = {
  getLatest: async (
    baseCurrency: string,
    targetCurrency: string,
  ): Promise<ExchangeRate> => {
    const { data } = await api.get(
      `/exchange-rates/latest?base=${baseCurrency}&target=${targetCurrency}`,
    );
    return data;
  },
};

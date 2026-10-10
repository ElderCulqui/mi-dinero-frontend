export interface ExchangeRate {
  id: string;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  source: string;
  date: string;
  side: "buy" | "sell";
  createdAt: string;
  updatedAt: string;
}

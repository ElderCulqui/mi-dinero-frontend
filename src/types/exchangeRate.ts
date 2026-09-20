export interface ExchangeRate {
  id: string;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  source: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

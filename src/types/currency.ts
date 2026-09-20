export type Currency = "USD" | "PEN";

export const currencyOptions: Record<
    Currency,
    { code: Currency; symbol: string; label: string }
> = {
    PEN: {
        code: "PEN",
        symbol: "S/.",
        label: "Soles"
    },
    USD: {
        code: "USD",
        symbol: "$",
        label: "Dólares"
    }
};
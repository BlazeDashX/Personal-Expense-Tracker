// file: lib/finance.ts
export function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

export function fromMinorUnits(amount: number): number {
  return amount / 100;
}

export function formatMoney(amountInMinorUnits: number, currencyCode: string = "BDT", locale: string = "en-BD"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
  }).format(amountInMinorUnits / 100);
}
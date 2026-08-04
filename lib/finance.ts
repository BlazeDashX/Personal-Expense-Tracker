// file: lib/finance.ts
export function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

export function fromMinorUnits(amount: number): number {
  return amount / 100;
}

export function formatMoney(
  amountInMinorUnits: number,
  currencyCode: string = "BDT",
  locale: string = "en-BD"
): string {
  void currencyCode;
  const major = amountInMinorUnits / 100;
  const isWhole = major % 1 === 0;

  const formattedNumber = new Intl.NumberFormat(locale, {
    style: "decimal",
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(major);

  return `৳${formattedNumber}`;
}
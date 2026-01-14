// Utility function to filter purchases by year
export interface Purchase {
  date: string; // ISO format
  price: number;
}

export function filterPurchasesByYear(
  purchases: Purchase[] | undefined,
  fromYear: number | null,
  toYear: number | null
): Purchase[] {
  // Defensive check: Ensure purchases is a valid array
  if (!Array.isArray(purchases)) {
    return [];
  }

  return purchases.filter((purchase) => {
    const purchaseYear = new Date(purchase.date).getFullYear();
    const isAfterFromYear = fromYear === null || purchaseYear >= fromYear;
    const isBeforeToYear = toYear === null || purchaseYear <= toYear;
    return isAfterFromYear && isBeforeToYear;
  });
}
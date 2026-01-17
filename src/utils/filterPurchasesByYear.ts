// Utility function to filter purchases by year
export interface Purchase {
  date: string; // DD-MM-YY format
  price: number;
}

/**
 * Parse date string in DD-MM-YY or DD-MM-YYYY format to Date object
 */
function parseDateFromString(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  const parts = dateStr.split(/[\/\-\.]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    let year = parseInt(parts[2], 10);
    if (year < 100) {
      year = year > 50 ? 1900 + year : 2000 + year;
    }
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime()) && date.getDate() === day && date.getMonth() === month) {
      return date;
    }
  }
  
  const isoDate = new Date(dateStr);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }
  return null;
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
    const parsedDate = parseDateFromString(purchase.date);
    if (!parsedDate) return false;
    const purchaseYear = parsedDate.getFullYear();
    const isAfterFromYear = fromYear === null || purchaseYear >= fromYear;
    const isBeforeToYear = toYear === null || purchaseYear <= toYear;
    return isAfterFromYear && isBeforeToYear;
  });
}
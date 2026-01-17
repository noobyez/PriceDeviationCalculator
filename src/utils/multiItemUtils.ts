/**
 * Utility functions for multi-item dataset handling
 * Provides grouping, normalization, and correlation analysis
 */

import { Purchase, GroupedPurchaseData } from "@/models/Purchase";

/**
 * Default item name for single-item datasets
 */
export const DEFAULT_ITEM_NAME = "Default";

/**
 * Parse date string in DD-MM-YY or DD-MM-YYYY format to Date object
 * This is the CENTRAL date parsing function for the entire application
 * @param dateStr Date string in DD-MM-YY, DD-MM-YYYY, or ISO format
 * @returns Date object or null if invalid
 */
export function parseDateFromString(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // Try DD-MM-YY or DD-MM-YYYY format (with - or / separators)
  const parts = dateStr.split(/[\/\-\.]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // months are 0-based
    let year = parseInt(parts[2], 10);
    
    // Handle 2-digit years
    if (year < 100) {
      year = year > 50 ? 1900 + year : 2000 + year;
    }
    
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime()) && date.getDate() === day && date.getMonth() === month) {
      return date;
    }
  }
  
  // Fallback: try ISO format (YYYY-MM-DD)
  const isoDate = new Date(dateStr);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }
  
  return null;
}

/**
 * Check if a date string is valid
 * @param dateStr Date string to validate
 * @returns true if valid date
 */
export function isValidDate(dateStr: string): boolean {
  return parseDateFromString(dateStr) !== null;
}

/**
 * Groups purchases by item, handling both single-item and multi-item datasets
 * @param purchases Raw array of purchases
 * @returns GroupedPurchaseData with items organized by name
 */
export function groupPurchasesByItem(purchases: Purchase[]): GroupedPurchaseData {
  const byItem: Record<string, Purchase[]> = {};
  
  for (const purchase of purchases) {
    // Use item name or default for single-item compatibility
    const itemName = purchase.item?.trim() || DEFAULT_ITEM_NAME;
    
    if (!byItem[itemName]) {
      byItem[itemName] = [];
    }
    byItem[itemName].push(purchase);
  }
  
  const items = Object.keys(byItem).sort();
  const hasMultipleItems = items.length > 1 || (items.length === 1 && items[0] !== DEFAULT_ITEM_NAME);
  
  return {
    items,
    byItem,
    hasMultipleItems
  };
}

/**
 * Gets purchases for a specific item
 * @param groupedData Grouped purchase data
 * @param itemName Item name to retrieve
 * @returns Array of purchases for the item, or empty array if not found
 */
export function getPurchasesForItem(
  groupedData: GroupedPurchaseData, 
  itemName: string
): Purchase[] {
  return groupedData.byItem[itemName] || [];
}

/**
 * Extracts prices array for a specific item
 * @param groupedData Grouped purchase data
 * @param itemName Item name
 * @returns Array of prices
 */
export function getPricesForItem(
  groupedData: GroupedPurchaseData,
  itemName: string
): number[] {
  const purchases = getPurchasesForItem(groupedData, itemName);
  return purchases.map(p => p.price).filter(p => Number.isFinite(p));
}

/**
 * Extracts dates array for a specific item
 * @param groupedData Grouped purchase data
 * @param itemName Item name
 * @returns Array of dates (ISO strings)
 */
export function getDatesForItem(
  groupedData: GroupedPurchaseData,
  itemName: string
): string[] {
  const purchases = getPurchasesForItem(groupedData, itemName);
  return purchases.map(p => p.date);
}

/**
 * Extracts quantities array for a specific item (for advanced regression)
 * @param groupedData Grouped purchase data
 * @param itemName Item name
 * @returns Array of quantities (undefined values included)
 */
export function getQuantitiesForItem(
  groupedData: GroupedPurchaseData,
  itemName: string
): (number | undefined)[] {
  const purchases = getPurchasesForItem(groupedData, itemName);
  return purchases.map(p => p.quantity);
}

/**
 * Time series data for a specific item
 * This is the CENTRAL data structure for all item-based analysis
 */
export interface ItemTimeSeries {
  itemId: string;
  dates: string[];        // ISO date strings, sorted chronologically
  prices: number[];       // Corresponding prices
  quantities: number[];   // Corresponding quantities (0 if not available)
  purchases: Purchase[];  // Original purchase records, sorted by date
  stats: {
    count: number;
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
    totalQuantity: number;
    firstDate: string;
    lastDate: string;
  };
}

/**
 * CENTRAL FUNCTION: Gets the complete time series for a specific item
 * ALL analysis functions (regression, correlation, forecast) MUST use this function
 * 
 * @param purchases Raw array of ALL purchases (not filtered)
 * @param itemId The item identifier to filter by
 * @returns ItemTimeSeries with all data needed for analysis, or null if item not found
 */
export function getItemTimeSeries(
  purchases: Purchase[],
  itemId: string
): ItemTimeSeries | null {
  // Filter purchases for this specific item
  const itemPurchases = purchases.filter(p => {
    const pItem = p.item?.trim() || DEFAULT_ITEM_NAME;
    return pItem === itemId;
  });

  if (itemPurchases.length === 0) {
    return null;
  }

  // Sort by date chronologically using parseDateFromString
  const sortedPurchases = [...itemPurchases].sort((a, b) => {
    const dateA = parseDateFromString(a.date);
    const dateB = parseDateFromString(b.date);
    if (!dateA || !dateB) return 0;
    return dateA.getTime() - dateB.getTime();
  });

  // Extract arrays
  const dates = sortedPurchases.map(p => p.date);
  const prices = sortedPurchases.map(p => p.price);
  const quantities = sortedPurchases.map(p => p.quantity ?? 0);

  // Calculate statistics
  const validPrices = prices.filter(p => Number.isFinite(p));
  const stats = {
    count: sortedPurchases.length,
    minPrice: validPrices.length > 0 ? Math.min(...validPrices) : 0,
    maxPrice: validPrices.length > 0 ? Math.max(...validPrices) : 0,
    avgPrice: validPrices.length > 0 
      ? validPrices.reduce((a, b) => a + b, 0) / validPrices.length 
      : 0,
    totalQuantity: quantities.reduce((a, b) => a + b, 0),
    firstDate: dates[0] || '',
    lastDate: dates[dates.length - 1] || '',
  };

  return {
    itemId,
    dates,
    prices,
    quantities,
    purchases: sortedPurchases,
    stats,
  };
}

/**
 * Gets time series for multiple items at once
 * Useful for comparison dashboards
 * 
 * @param purchases Raw array of ALL purchases
 * @param itemIds Array of item identifiers
 * @returns Map of itemId to ItemTimeSeries
 */
export function getMultipleItemTimeSeries(
  purchases: Purchase[],
  itemIds: string[]
): Map<string, ItemTimeSeries> {
  const result = new Map<string, ItemTimeSeries>();
  
  for (const itemId of itemIds) {
    const series = getItemTimeSeries(purchases, itemId);
    if (series) {
      result.set(itemId, series);
    }
  }
  
  return result;
}

/**
 * Gets all unique item IDs from the dataset
 * @param purchases Raw array of all purchases
 * @returns Sorted array of unique item IDs
 */
export function getAllItemIds(purchases: Purchase[]): string[] {
  const itemSet = new Set<string>();
  
  for (const p of purchases) {
    const itemId = p.item?.trim() || DEFAULT_ITEM_NAME;
    itemSet.add(itemId);
  }
  
  return Array.from(itemSet).sort();
}

/**
 * Validates that the dataset has the required structure
 * @param purchases Array of purchases to validate
 * @returns Validation result with any errors
 */
export interface DatasetValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  itemCount: number;
  recordCount: number;
}

export function validateDataset(purchases: Purchase[]): DatasetValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (purchases.length === 0) {
    errors.push('Dataset is empty');
    return { isValid: false, errors, warnings, itemCount: 0, recordCount: 0 };
  }

  let missingItem = 0;
  let missingPrice = 0;
  let missingDate = 0;
  let missingQuantity = 0;
  let invalidPrice = 0;
  let invalidDate = 0;

  for (const p of purchases) {
    if (!p.item || p.item.trim() === '') missingItem++;
    if (p.price === undefined || p.price === null) missingPrice++;
    else if (!Number.isFinite(p.price) || p.price < 0) invalidPrice++;
    if (!p.date) missingDate++;
    else {
      if (!isValidDate(p.date)) invalidDate++;
    }
    if (p.quantity === undefined || p.quantity === null) missingQuantity++;
  }

  if (missingPrice > 0) errors.push(`${missingPrice} records missing price`);
  if (invalidPrice > 0) errors.push(`${invalidPrice} records with invalid price`);
  if (missingDate > 0) errors.push(`${missingDate} records missing date`);
  if (invalidDate > 0) errors.push(`${invalidDate} records with invalid date`);
  
  if (missingItem > 0) warnings.push(`${missingItem} records missing item (will use default)`);
  if (missingQuantity > 0) warnings.push(`${missingQuantity} records missing quantity`);

  const itemIds = getAllItemIds(purchases);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    itemCount: itemIds.length,
    recordCount: purchases.length,
  };
}

/**
 * Interface for correlation result between two items
 */
export interface ItemCorrelationResult {
  itemA: string;
  itemB: string;
  correlation: number; // Pearson correlation coefficient (-1 to 1)
  strength: 'strong' | 'moderate' | 'weak';
  direction: 'positive' | 'negative';
  commonDates: number; // Number of common data points
  isSignificant: boolean; // Whether correlation is statistically meaningful
}

/**
 * Calculates Pearson correlation coefficient between two arrays
 * @param x First array
 * @param y Second array
 * @returns Correlation coefficient (-1 to 1), or NaN if calculation not possible
 */
export function pearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 2) return NaN;
  
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
  const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
  );
  
  if (denominator === 0) return NaN;
  return numerator / denominator;
}

/**
 * Aligns two item datasets by common dates for correlation analysis
 * @param groupedData Grouped purchase data
 * @param itemA First item name
 * @param itemB Second item name
 * @returns Object with aligned prices for both items
 */
export function alignItemsByDate(
  groupedData: GroupedPurchaseData,
  itemA: string,
  itemB: string
): { pricesA: number[]; pricesB: number[]; commonDates: string[] } {
  const purchasesA = getPurchasesForItem(groupedData, itemA);
  const purchasesB = getPurchasesForItem(groupedData, itemB);
  
  // Create maps for quick lookup by date
  const mapA = new Map<string, number>();
  const mapB = new Map<string, number>();
  
  for (const p of purchasesA) {
    const dateKey = p.date.split('T')[0]; // Use date part only
    mapA.set(dateKey, p.price);
  }
  
  for (const p of purchasesB) {
    const dateKey = p.date.split('T')[0];
    mapB.set(dateKey, p.price);
  }
  
  // Find common dates
  const commonDates: string[] = [];
  const pricesA: number[] = [];
  const pricesB: number[] = [];
  
  for (const [date, priceA] of mapA) {
    if (mapB.has(date)) {
      const priceB = mapB.get(date)!;
      if (Number.isFinite(priceA) && Number.isFinite(priceB)) {
        commonDates.push(date);
        pricesA.push(priceA);
        pricesB.push(priceB);
      }
    }
  }
  
  // Sort by date
  const sorted = commonDates
    .map((date, i) => ({ date, priceA: pricesA[i], priceB: pricesB[i] }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  return {
    pricesA: sorted.map(s => s.priceA),
    pricesB: sorted.map(s => s.priceB),
    commonDates: sorted.map(s => s.date)
  };
}

/**
 * Calculates correlation between two items
 * @param groupedData Grouped purchase data
 * @param itemA First item name
 * @param itemB Second item name
 * @returns Correlation result or null if not calculable
 */
export function calculateItemCorrelation(
  groupedData: GroupedPurchaseData,
  itemA: string,
  itemB: string
): ItemCorrelationResult | null {
  const aligned = alignItemsByDate(groupedData, itemA, itemB);
  
  if (aligned.commonDates.length < 3) {
    return null; // Not enough common data points
  }
  
  const correlation = pearsonCorrelation(aligned.pricesA, aligned.pricesB);
  
  if (!Number.isFinite(correlation)) {
    return null;
  }
  
  const absCorr = Math.abs(correlation);
  const strength: 'strong' | 'moderate' | 'weak' = 
    absCorr >= 0.7 ? 'strong' : absCorr >= 0.4 ? 'moderate' : 'weak';
  const direction: 'positive' | 'negative' = correlation >= 0 ? 'positive' : 'negative';
  
  return {
    itemA,
    itemB,
    correlation,
    strength,
    direction,
    commonDates: aligned.commonDates.length,
    isSignificant: aligned.commonDates.length >= 5 && absCorr >= 0.3
  };
}

/**
 * Rolling correlation calculation for detecting correlation changes over time
 * @param groupedData Grouped purchase data
 * @param itemA First item name
 * @param itemB Second item name
 * @param windowSize Window size for rolling correlation
 * @returns Array of rolling correlations with dates
 */
export function calculateRollingCorrelation(
  groupedData: GroupedPurchaseData,
  itemA: string,
  itemB: string,
  windowSize: number = 5
): { date: string; correlation: number }[] {
  const aligned = alignItemsByDate(groupedData, itemA, itemB);
  
  if (aligned.commonDates.length < windowSize) {
    return [];
  }
  
  const results: { date: string; correlation: number }[] = [];
  
  for (let i = windowSize - 1; i < aligned.commonDates.length; i++) {
    const windowPricesA = aligned.pricesA.slice(i - windowSize + 1, i + 1);
    const windowPricesB = aligned.pricesB.slice(i - windowSize + 1, i + 1);
    const corr = pearsonCorrelation(windowPricesA, windowPricesB);
    
    if (Number.isFinite(corr)) {
      results.push({
        date: aligned.commonDates[i],
        correlation: corr
      });
    }
  }
  
  return results;
}

// ============================================================================
// NEW API: Functions that use getItemTimeSeries directly with raw purchases
// These should be preferred over the GroupedPurchaseData-based functions
// ============================================================================

/**
 * Aligns two items' time series by common dates for correlation analysis
 * Uses the central getItemTimeSeries function
 * 
 * @param purchases Raw array of ALL purchases (not filtered)
 * @param itemIdA First item identifier
 * @param itemIdB Second item identifier
 * @returns Aligned price arrays and common dates
 */
export function alignItemsTimeSeries(
  purchases: Purchase[],
  itemIdA: string,
  itemIdB: string
): { pricesA: number[]; pricesB: number[]; commonDates: string[] } {
  const seriesA = getItemTimeSeries(purchases, itemIdA);
  const seriesB = getItemTimeSeries(purchases, itemIdB);
  
  if (!seriesA || !seriesB) {
    return { pricesA: [], pricesB: [], commonDates: [] };
  }
  
  // Create maps for quick lookup by date (use date part only for comparison)
  const mapA = new Map<string, number>();
  const mapB = new Map<string, number>();
  
  for (let i = 0; i < seriesA.dates.length; i++) {
    const dateKey = seriesA.dates[i].split('T')[0];
    mapA.set(dateKey, seriesA.prices[i]);
  }
  
  for (let i = 0; i < seriesB.dates.length; i++) {
    const dateKey = seriesB.dates[i].split('T')[0];
    mapB.set(dateKey, seriesB.prices[i]);
  }
  
  // Find common dates and align prices
  const commonDates: string[] = [];
  const pricesA: number[] = [];
  const pricesB: number[] = [];
  
  for (const [date, priceA] of mapA) {
    if (mapB.has(date)) {
      const priceB = mapB.get(date)!;
      if (Number.isFinite(priceA) && Number.isFinite(priceB)) {
        commonDates.push(date);
        pricesA.push(priceA);
        pricesB.push(priceB);
      }
    }
  }
  
  // Sort chronologically
  const sorted = commonDates
    .map((date, i) => ({ date, priceA: pricesA[i], priceB: pricesB[i] }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  return {
    pricesA: sorted.map(s => s.priceA),
    pricesB: sorted.map(s => s.priceB),
    commonDates: sorted.map(s => s.date)
  };
}

/**
 * Calculates correlation between two items using the central getItemTimeSeries
 * 
 * @param purchases Raw array of ALL purchases (not filtered)
 * @param itemIdA First item identifier
 * @param itemIdB Second item identifier
 * @returns Correlation result or null if not calculable
 */
export function calculateItemsCorrelation(
  purchases: Purchase[],
  itemIdA: string,
  itemIdB: string
): ItemCorrelationResult | null {
  const aligned = alignItemsTimeSeries(purchases, itemIdA, itemIdB);
  
  if (aligned.commonDates.length < 3) {
    return null;
  }
  
  const correlation = pearsonCorrelation(aligned.pricesA, aligned.pricesB);
  
  if (!Number.isFinite(correlation)) {
    return null;
  }
  
  const absCorr = Math.abs(correlation);
  const strength: 'strong' | 'moderate' | 'weak' = 
    absCorr >= 0.7 ? 'strong' : absCorr >= 0.4 ? 'moderate' : 'weak';
  const direction: 'positive' | 'negative' = correlation >= 0 ? 'positive' : 'negative';
  
  return {
    itemA: itemIdA,
    itemB: itemIdB,
    correlation,
    strength,
    direction,
    commonDates: aligned.commonDates.length,
    isSignificant: aligned.commonDates.length >= 5 && absCorr >= 0.3
  };
}

/**
 * Rolling correlation using the central getItemTimeSeries
 * 
 * @param purchases Raw array of ALL purchases (not filtered)
 * @param itemIdA First item identifier
 * @param itemIdB Second item identifier
 * @param windowSize Window size for rolling correlation
 * @returns Array of rolling correlations with dates
 */
export function calculateItemsRollingCorrelation(
  purchases: Purchase[],
  itemIdA: string,
  itemIdB: string,
  windowSize: number = 5
): { date: string; correlation: number }[] {
  const aligned = alignItemsTimeSeries(purchases, itemIdA, itemIdB);
  
  if (aligned.commonDates.length < windowSize) {
    return [];
  }
  
  const results: { date: string; correlation: number }[] = [];
  
  for (let i = windowSize - 1; i < aligned.commonDates.length; i++) {
    const windowPricesA = aligned.pricesA.slice(i - windowSize + 1, i + 1);
    const windowPricesB = aligned.pricesB.slice(i - windowSize + 1, i + 1);
    const corr = pearsonCorrelation(windowPricesA, windowPricesB);
    
    if (Number.isFinite(corr)) {
      results.push({
        date: aligned.commonDates[i],
        correlation: corr
      });
    }
  }
  
  return results;
}

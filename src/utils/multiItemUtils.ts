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

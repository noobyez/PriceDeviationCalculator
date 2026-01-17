/**
 * Regression utility functions
 * Supports both standard (time only) and advanced (quantity + time) regression modes
 */

import { 
  LinearRegressionResult, 
  MultipleRegressionResult, 
  RegressionResult,
  RegressionMode 
} from "@/models/Purchase";

/**
 * Standard linear regression: Price = a + b * Time
 * @param prices Array of price values
 * @returns LinearRegressionResult or null if insufficient data
 */
export function linearRegression(prices: number[]): LinearRegressionResult | null {
  const n = prices.length;
  if (n < 2) return null;

  // x = 1, 2, ..., n (time index)
  const x = Array.from({ length: n }, (_, i) => i + 1);
  const y = prices;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return null;

  const a = (sumY * sumX2 - sumX * sumXY) / denominator;
  const b = (n * sumXY - sumX * sumY) / denominator;
  const nextX = n + 1;
  const predicted = a + b * nextX;

  // Compute R² (coefficient of determination)
  const meanY = sumY / n;
  const ssTot = y.reduce((acc, yi) => acc + (yi - meanY) ** 2, 0);
  const ssRes = y.reduce((acc, yi, i) => {
    const yiPred = a + b * x[i];
    return acc + (yi - yiPred) ** 2;
  }, 0);
  const r2 = ssTot === 0 ? 1 : Math.max(0, Math.min(1, 1 - ssRes / ssTot));

  return { mode: 'standard', a, b, predicted, r2 };
}

/**
 * Multiple linear regression: Price = α + β1 * Quantity + β2 * Time
 * Uses Ordinary Least Squares (OLS) with normal equations
 * @param prices Array of price values
 * @param quantities Array of quantity values (must match prices length)
 * @returns MultipleRegressionResult or null if insufficient data
 */
export function multipleRegression(
  prices: number[], 
  quantities: number[]
): MultipleRegressionResult | null {
  const n = prices.length;
  if (n < 3 || quantities.length !== n) return null; // Need at least 3 points for 2 predictors

  // Verify all quantities are valid numbers
  if (quantities.some(q => !Number.isFinite(q))) return null;

  // Time index: 1, 2, ..., n
  const time = Array.from({ length: n }, (_, i) => i + 1);
  const y = prices;

  // Calculate sums for normal equations
  // X matrix columns: [1, quantity, time]
  // Normal equations: (X'X)β = X'y

  const sumQ = quantities.reduce((a, b) => a + b, 0);
  const sumT = time.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumQQ = quantities.reduce((a, q) => a + q * q, 0);
  const sumTT = time.reduce((a, t) => a + t * t, 0);
  const sumQT = quantities.reduce((a, q, i) => a + q * time[i], 0);
  const sumQY = quantities.reduce((a, q, i) => a + q * y[i], 0);
  const sumTY = time.reduce((a, t, i) => a + t * y[i], 0);

  // Build the 3x3 matrix (X'X) and vector (X'y)
  // | n     sumQ   sumT  |   | alpha      |   | sumY  |
  // | sumQ  sumQQ  sumQT | * | betaQ      | = | sumQY |
  // | sumT  sumQT  sumTT |   | betaT      |   | sumTY |

  // Solve using Cramer's rule or direct matrix inversion
  // For a 3x3 system, we'll use the determinant method

  const det = (
    n * (sumQQ * sumTT - sumQT * sumQT) -
    sumQ * (sumQ * sumTT - sumQT * sumT) +
    sumT * (sumQ * sumQT - sumQQ * sumT)
  );

  if (Math.abs(det) < 1e-10) return null; // Singular matrix

  // Calculate coefficients using Cramer's rule
  const detAlpha = (
    sumY * (sumQQ * sumTT - sumQT * sumQT) -
    sumQ * (sumQY * sumTT - sumQT * sumTY) +
    sumT * (sumQY * sumQT - sumQQ * sumTY)
  );

  const detBetaQ = (
    n * (sumQY * sumTT - sumQT * sumTY) -
    sumY * (sumQ * sumTT - sumQT * sumT) +
    sumT * (sumQ * sumTY - sumQY * sumT)
  );

  const detBetaT = (
    n * (sumQQ * sumTY - sumQY * sumQT) -
    sumQ * (sumQ * sumTY - sumQY * sumT) +
    sumY * (sumQ * sumQT - sumQQ * sumT)
  );

  const alpha = detAlpha / det;
  const betaQuantity = detBetaQ / det;
  const betaTime = detBetaT / det;

  // Calculate R²
  const meanY = sumY / n;
  const ssTot = y.reduce((acc, yi) => acc + (yi - meanY) ** 2, 0);
  const ssRes = y.reduce((acc, yi, i) => {
    const yiPred = alpha + betaQuantity * quantities[i] + betaTime * time[i];
    return acc + (yi - yiPred) ** 2;
  }, 0);
  const r2 = ssTot === 0 ? 1 : Math.max(0, Math.min(1, 1 - ssRes / ssTot));

  // Predict next price using average quantity and next time period
  const avgQuantity = sumQ / n;
  const nextTime = n + 1;
  const predicted = alpha + betaQuantity * avgQuantity + betaTime * nextTime;

  return {
    mode: 'advanced',
    alpha,
    betaQuantity,
    betaTime,
    predicted,
    r2,
    avgQuantity
  };
}

/**
 * Unified regression function that selects the appropriate method based on mode
 * Falls back to standard regression if advanced mode is selected but quantities are unavailable
 * 
 * @param prices Array of price values
 * @param mode Regression mode ('standard' or 'advanced')
 * @param quantities Optional array of quantity values (required for advanced mode)
 * @returns RegressionResult or null if insufficient data
 */
export function calculateRegression(
  prices: number[],
  mode: RegressionMode,
  quantities?: number[]
): RegressionResult | null {
  // If advanced mode requested and quantities available, use multiple regression
  if (mode === 'advanced' && quantities && quantities.length === prices.length) {
    const result = multipleRegression(prices, quantities);
    // Fallback to standard if multiple regression fails
    if (result) return result;
  }
  
  // Default to standard linear regression
  return linearRegression(prices);
}

/**
 * Check if quantities data is available and valid
 * @param quantities Array of quantity values
 * @returns true if quantities are valid for advanced regression
 */
export function hasValidQuantities(quantities?: number[]): boolean {
  if (!quantities || quantities.length < 3) return false;
  return quantities.every(q => Number.isFinite(q) && q >= 0);
}

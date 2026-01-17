export interface Purchase {
  date: string; // ISO string format
  price: number;
  quantity?: number; // Optional: quantity ordered (for advanced regression)
  item?: string; // Optional: item identifier for multi-item datasets
}

/**
 * Dataset grouped by item for multi-item analysis
 */
export interface GroupedPurchaseData {
  items: string[]; // List of unique item names
  byItem: Record<string, Purchase[]>; // Purchases grouped by item
  hasMultipleItems: boolean; // True if dataset contains multiple items
}

/**
 * Regression mode types for price analysis
 * - 'standard': Price vs Time only (linear regression)
 * - 'advanced': Price vs Quantity + Time (multiple regression)
 */
export type RegressionMode = 'standard' | 'advanced';

/**
 * Result of linear regression (standard mode)
 */
export interface LinearRegressionResult {
  mode: 'standard';
  a: number;           // Intercept
  b: number;           // Slope (time coefficient)
  predicted: number;   // Predicted price for next period
  r2: number;          // R² coefficient of determination
}

/**
 * Result of multiple regression (advanced mode)
 * Price = α + β1 * Quantity + β2 * Time
 */
export interface MultipleRegressionResult {
  mode: 'advanced';
  alpha: number;       // Intercept (α)
  betaQuantity: number; // Quantity coefficient (β1)
  betaTime: number;    // Time coefficient (β2)
  predicted: number;   // Predicted price for next period (with avg quantity)
  r2: number;          // R² coefficient of determination
  avgQuantity: number; // Average quantity (used for prediction)
}

/**
 * Union type for regression results
 */
export type RegressionResult = LinearRegressionResult | MultipleRegressionResult;

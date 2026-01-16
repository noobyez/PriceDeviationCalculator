/**
 * Generate 4 business-oriented decision buckets for probabilistic price forecasting.
 * @param historicalPrices - Array of historical prices.
 * @param predictedPrice - Predicted future price from linear regression.
 * @returns Array of decision buckets with labels, price ranges, probabilities, and explanations.
 */
export function generateDecisionBuckets(historicalPrices: number[], predictedPrice: number) {
    // Calculate standard deviation of historical prices
    const n = historicalPrices.length;
    if (n < 2) throw new Error("Not enough data points to calculate decision buckets.");

    const minPrice = Math.min(...historicalPrices);
    const mean = historicalPrices.reduce((sum, price) => sum + price, 0) / n;
    const variance = historicalPrices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / (n - 1);
    const stdDev = Math.sqrt(variance);

    // Define business-oriented ranges
    const ranges = [
        { label: "🔴 ALTO RISCHIO – Prezzo troppo basso", min: minPrice, max: predictedPrice - 2 * stdDev, explanation: "Prezzo significativamente inferiore al previsto. Potenziale rischio di sottovalutazione." },
        { label: "⚠️ ATTENZIONE – Prezzo sotto la media", min: predictedPrice - 2 * stdDev, max: predictedPrice, explanation: "Prezzo inferiore alla tendenza. Potenziale opportunità di negoziazione o problema di qualità dati." },
        { label: "✅ ACCETTABILE – Prezzo nella media", min: predictedPrice, max: predictedPrice + 2 * stdDev, explanation: "Prezzo in linea con la tendenza storica." },
        { label: "🔵 PREMIUM – Prezzo elevato", min: predictedPrice + 2 * stdDev, max: Math.max(...historicalPrices), explanation: "Prezzo superiore alla tendenza. Decisione commerciale necessaria." },
    ];

    // Calculate probabilities for each range
    const probabilities = ranges.map((range) => {
        const { min, max } = range;
        const zMin = (min - predictedPrice) / stdDev;
        const zMax = (max - predictedPrice) / stdDev;
        const probability = standardNormalCDF(zMax) - standardNormalCDF(zMin);
        return { ...range, probability: Math.round(probability * 100) };
    });

    // Normalize probabilities to sum to 100%
    const totalProbability = probabilities.reduce((sum, range) => sum + range.probability, 0);
    probabilities.forEach((range) => {
        range.probability = Math.round((range.probability / totalProbability) * 100);
    });

    return probabilities;
}

/**
 * Calculate the cumulative distribution function (CDF) for a standard normal distribution.
 * This is used to compute probabilities for a normal distribution.
 * @param z - The z-score.
 * @returns The probability that a standard normal random variable is less than or equal to z.
 */
function standardNormalCDF(z: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989422804014327 * Math.exp(-z * z / 2);
    const probability = d * t * (
        0.319381530 +
        t * (-0.356563782 +
        t * (1.781477937 +
        t * (-1.821255978 +
        t * 1.330274429))));
    return z >= 0 ? 1 - probability : probability;
}
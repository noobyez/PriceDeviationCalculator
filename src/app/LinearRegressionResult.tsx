"use client";
import React from "react";

interface LinearRegressionResultProps {
  prices: number[];
}

// Calcola la retta di regressione y = a + b*x e predice il valore per x = n+1
function linearRegression(prices: number[]): { a: number; b: number; predicted: number; r2: number } | null {
  const n = prices.length;
  if (n < 2) return null;
  const x = Array.from({ length: n }, (_, i) => i + 1); // x = 1, 2, ..., n
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

  // Compute R² (coefficient of determination) as a simple model confidence metric
  // R² = 1 - SS_res / SS_tot
  const meanY = sumY / n;
  const ssTot = y.reduce((acc, yi) => acc + (yi - meanY) ** 2, 0);
  const ssRes = y.reduce((acc, yi, i) => {
    const yiPred = a + b * x[i];
    return acc + (yi - yiPred) ** 2;
  }, 0);
  const r2 = ssTot === 0 ? 1 : Math.max(0, Math.min(1, 1 - ssRes / ssTot));

  return { a, b, predicted, r2 };
}

export default function LinearRegressionResult({ prices }: LinearRegressionResultProps) {
  const result = linearRegression(prices);
  if (!result) return null;
  return (
    <div className="mt-2 p-3 bg-green-50 rounded text-green-800 dark:bg-green-900 dark:text-green-100">
      <span className="font-medium">Prezzo atteso secondo trend storico: </span>
      {result.predicted.toFixed(2)}
      <div className="text-sm text-green-700 dark:text-green-200 mt-1">
        <span className="font-medium">Confidenza modello (R²): </span>
        {(result.r2 * 100).toFixed(2)}%
      </div>
      {/* Short, non-technical explanation for R² */}
      <div className="text-xs text-green-700 dark:text-green-200 mt-1 italic">
        R² indica quanto i prezzi storici seguono un andamento coerente: più è alto, più il trend è probabile e affidabile.
      </div>
    </div>
  );
}

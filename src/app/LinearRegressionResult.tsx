"use client";
import React from "react";

interface LinearRegressionResultProps {
  prices: number[];
}

// Calcola la retta di regressione y = a + b*x e predice il valore per x = n+1
function linearRegression(prices: number[]) {
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
  return { a, b, predicted };
}

export default function LinearRegressionResult({ prices }: LinearRegressionResultProps) {
  const result = linearRegression(prices);
  if (!result) return null;
  return (
    <div className="mt-2 p-3 bg-green-50 rounded text-green-800 dark:bg-green-900 dark:text-green-100">
      <span className="font-medium">Prezzo atteso secondo trend storico: </span>
      {result.predicted.toFixed(2)}
    </div>
  );
}

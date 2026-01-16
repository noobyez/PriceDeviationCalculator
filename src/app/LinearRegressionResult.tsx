"use client";
import React from "react";
import { Tooltip } from "./components/help";

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

  // Determine confidence level for visual feedback
  const confidenceLevel = result.r2 >= 0.7 ? 'high' : result.r2 >= 0.4 ? 'medium' : 'low';
  const confidenceColors = {
    high: 'text-emerald-600 dark:text-emerald-400',
    medium: 'text-amber-600 dark:text-amber-400',
    low: 'text-red-600 dark:text-red-400',
  };

  return (
    <div className="flex flex-col gap-3">
      <Tooltip content="La regressione lineare mostra il trend medio atteso dei prezzi basato sullo storico.">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Analisi Trend
        </h3>
      </Tooltip>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Tooltip content="Prezzo previsto per il prossimo acquisto, calcolato dal trend storico." position="bottom">
            <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              Prezzo Atteso
            </div>
          </Tooltip>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {result.predicted.toFixed(2)}
          </div>
        </div>
        <div>
          <Tooltip content="Quanto è affidabile questa previsione: alto (>70%) = molto affidabile, basso (<40%) = poco affidabile." position="bottom">
            <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              Confidenza (R²)
            </div>
          </Tooltip>
          <div className={`text-2xl font-bold ${confidenceColors[confidenceLevel]}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
            {(result.r2 * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
        R² indica quanto i prezzi storici seguono un andamento coerente: più è alto, più il trend è affidabile.
      </p>
    </div>
  );
}

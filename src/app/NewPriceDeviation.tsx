"use client";
import React, { useState } from "react";
import LinearRegressionResult from "./LinearRegressionResult";
import PriceChart from "./PriceChart";

interface NewPriceDeviationProps {
  prices: number[];
  isNewPriceOutlier?: boolean;
  onDeviationChange?: (price: number | null, deviation: { abs: number; perc: number } | null) => void;
}

function linearRegression(prices: number[]) {
  const n = prices.length;
  if (n < 2) return null;
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
  return { a, b, predicted };
}

export default function NewPriceDeviation({ prices, isNewPriceOutlier = false, onDeviationChange }: NewPriceDeviationProps) {
  const [newPrice, setNewPrice] = useState<string>("");
  const [result, setResult] = useState<{ abs: number; perc: number } | null>(null);
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const regression = linearRegression(prices);
  const prezzoAtteso = regression ? regression.predicted : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPrice(e.target.value);
    setResult(null);
    onDeviationChange?.(null, null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prezzoAtteso) return;
    const prezzo = parseFloat(newPrice.replace(",", "."));
    if (isNaN(prezzo)) return;
    const abs = prezzo - prezzoAtteso;
    const perc = ((prezzo - prezzoAtteso) / prezzoAtteso) * 100;
    setResult({ abs, perc });
    setLastPrice(prezzo);
    onDeviationChange?.(prezzo, { abs, perc });
  };

  return (
    <div className="mt-10">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <label className="label text-zinc-700 mb-1">Nuovo prezzo offerto dal fornitore:</label>
        <input
          type="number"
          step="any"
          value={newPrice}
          onChange={handleChange}
          className="input"
          placeholder="Inserisci nuovo prezzo"
          required
        />
        <button
          type="submit"
          className="btn mt-2"
        >
          Calcola scostamento
        </button>
      </form>
      {result && (
        <div className={`mt-6 p-4 rounded-lg text-lg font-medium shadow-sm text-center ${isNewPriceOutlier ? "bg-red-50/80 dark:bg-red-900/60 text-red-800 dark:text-red-100 ring-2 ring-red-400" : "bg-yellow-50/80 dark:bg-yellow-900/60 text-yellow-800 dark:text-yellow-100"}`}>
          <div><span className="font-medium">Scostamento assoluto:</span> {result.abs.toFixed(2)}</div>
          <div><span className="font-medium">Scostamento percentuale:</span> {result.perc.toFixed(2)}%</div>
          {isNewPriceOutlier && (
            <div className="mt-2 text-red-600 dark:text-red-300 font-semibold">⚠️ Outlier: oltre ±5% dal prezzo atteso</div>
          )}
        </div>
      )}
      <PriceChart prices={prices} regression={regression} newPrice={result ? parseFloat(newPrice.replace(",", ".")) : null} isNewPriceOutlier={isNewPriceOutlier} />
    </div>
  );
}

"use client";
import PriceHistoryUpload from "./PriceHistoryUpload";
import LinearRegressionResult from "./LinearRegressionResult";
import NewPriceDeviation from "./NewPriceDeviation";
import PriceChart from "./PriceChart";
import StatisticsPanel from "./StatisticsPanel";
import DownloadPdfButton from "./DownloadPdfButton";
import { useState, useMemo } from "react";
import { Purchase } from "../models/Purchase";

// Funzioni statistiche
function mean(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
function median(arr: number[]) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
function std(arr: number[]) {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((acc, val) => acc + (val - m) ** 2, 0) / arr.length);
}
function variance(arr: number[]) {
  const m = mean(arr);
  return arr.reduce((acc, val) => acc + (val - m) ** 2, 0) / arr.length;
}
function quartiles(arr: number[]) {
  const sorted = [...arr].sort((a, b) => a - b);
  const q1 = median(sorted.slice(0, Math.floor(sorted.length / 2)));
  const q3 = median(sorted.slice(Math.ceil(sorted.length / 2)));
  return { q1, q3 };
}
function iqr(arr: number[]) {
  const { q1, q3 } = quartiles(arr);
  return q3 - q1;
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

// Funzione per calcolare quartili e outlier
function getOutlierBounds(arr: number[]) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const q1 = sorted.length % 2 !== 0
    ? sorted[Math.floor(mid / 2)]
    : (sorted[Math.floor(mid / 2) - 1] + sorted[Math.floor(mid / 2)]) / 2;
  const q3 = sorted.length % 2 !== 0
    ? sorted[mid + Math.floor((sorted.length - mid) / 2)]
    : (sorted[mid + Math.floor((sorted.length - mid) / 2) - 1] + sorted[mid + Math.floor((sorted.length - mid) / 2)]) / 2;
  const iqrVal = q3 - q1;
  return { lower: q1 - 1.5 * iqrVal, upper: q3 + 1.5 * iqrVal };
}

export default function Home() {
  const [purchases, setPurchases] = useState<Purchase[] | null>(null);
  const [interval, setInterval] = useState<number | "all">("all");
  const [customInterval, setCustomInterval] = useState<string>("");
  const [newPrice, setNewPrice] = useState<number | null>(null);
  const [deviation, setDeviation] = useState<{ abs: number; perc: number } | null>(null);

  const handleUpload = (uploadedPurchases: Purchase[]) => {
    setPurchases(uploadedPurchases);
  };

  // Calcola i prezzi filtrati in base all'intervallo selezionato
  const filteredPrices = useMemo(() => {
    if (!purchases) return null;
    const prices = purchases.map((purchase) => purchase.price);
    if (interval === "all") return prices;
    return prices.slice(-interval);
  }, [purchases, interval]);

  // Calcola regressione per outlier e PDF
  const regression = useMemo(() => {
    if (!filteredPrices) return null;
    return linearRegression(filteredPrices);
  }, [filteredPrices]);

  // Outlier: solo il nuovo prezzo offerto se supera ±5% dal prezzo atteso
  const isNewPriceOutlier = useMemo(() => {
    if (!regression || newPrice === null) return false;
    const upperBound = regression.predicted * 1.05;
    const lowerBound = regression.predicted * 0.95;
    return newPrice > upperBound || newPrice < lowerBound;
  }, [regression, newPrice]);

  // Calcola statistiche per il PDF
  const stats = useMemo(() => {
    if (!filteredPrices) return null;
    const { q1, q3 } = quartiles(filteredPrices);
    return {
      mean: mean(filteredPrices),
      median: median(filteredPrices),
      std: std(filteredPrices),
      variance: variance(filteredPrices),
      min: Math.min(...filteredPrices),
      max: Math.max(...filteredPrices),
      q1,
      q3,
      iqr: iqr(filteredPrices),
    };
  }, [filteredPrices]);

  // Handler per l'input personalizzato
  const handleCustomIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomInterval(e.target.value);
  };

  const applyCustomInterval = () => {
    const val = parseInt(customInterval, 10);
    if (!isNaN(val) && val > 0 && filteredPrices && val <= filteredPrices.length) {
      setInterval(val);
    }
  };

  const handleCustomIntervalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      applyCustomInterval();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)]">
      <main className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center">
        <h1 className="section-title mb-12">Price Prediction Model Analysis</h1>
        <PriceHistoryUpload onUpload={handleUpload} />
        {purchases && filteredPrices && (
          <div className="card w-full max-w-xl mx-auto flex flex-col items-center">
            {/* Selezione intervallo */}
            <div className="flex flex-wrap gap-2 mb-2 items-center justify-center">
              <span className="label text-zinc-500 mr-2">Intervallo:</span>
              {[10, 20, 50, "all"].map((opt) => (
                <button
                  key={String(opt)}
                  className={`px-4 py-1 rounded-full text-sm font-medium transition-all border ${interval === opt ? "bg-blue-500 text-white border-blue-500" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700"}`}
                  onClick={() => { setInterval(opt as number | "all"); setCustomInterval(""); }}
                  disabled={typeof opt === "number" && filteredPrices.length < opt}
                  style={{ opacity: typeof opt === "number" && filteredPrices.length < opt ? 0.5 : 1 }}
                >
                  {opt === "all" ? "Tutti" : `Ultimi ${opt}`}
                </button>
              ))}
            </div>
            {/* Input intervallo personalizzato */}
            <div className="flex gap-2 mb-6 items-center justify-center">
              <input
                type="number"
                min={1}
                max={filteredPrices.length}
                value={customInterval}
                onChange={handleCustomIntervalChange}
                onKeyDown={handleCustomIntervalKeyDown}
                placeholder={`Personalizzato (1-${filteredPrices.length})`}
                className="input w-44 text-center text-sm py-1 px-2"
              />
              <button
                type="button"
                className="px-4 py-1 rounded-full text-sm font-medium transition-all border bg-blue-500 text-white border-blue-500"
                onClick={applyCustomInterval}
                disabled={!customInterval || isNaN(parseInt(customInterval, 10)) || parseInt(customInterval, 10) < 1 || parseInt(customInterval, 10) > filteredPrices.length}
              >
                Applica
              </button>
              {typeof interval === "number" && ![10, 20, 50].includes(interval) && (
                <span className="ml-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs font-semibold">
                  Ultimi {interval}
                </span>
              )}
            </div>
            <h2 className="label text-lg mb-6">Storico prezzi caricato</h2>
            <div className="flex flex-wrap gap-3 text-lg mb-8">
              {filteredPrices.map((p, i) => (
                <span
                  key={i}
                  className="px-4 py-1 rounded-full shadow-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {p}
                </span>
              ))}
            </div>
            <StatisticsPanel prices={filteredPrices} />
            <div className="mt-2 mb-4 px-4 py-3 bg-blue-50/80 dark:bg-blue-900/60 rounded-lg text-blue-800 dark:text-blue-100 text-lg font-medium shadow-sm w-full text-center">
              <span className="font-medium">Media: </span>
              {(
                filteredPrices.reduce((acc, val) => acc + val, 0) / filteredPrices.length
              ).toFixed(2)}
            </div>
            <LinearRegressionResult prices={filteredPrices} />
            <NewPriceDeviation 
              prices={filteredPrices} 
              isNewPriceOutlier={isNewPriceOutlier}
              onDeviationChange={(price, dev) => {
                setNewPrice(price);
                setDeviation(dev);
              }}
            />
            {stats && (
              <DownloadPdfButton
                prices={filteredPrices}
                stats={stats}
                regression={regression}
                newPrice={newPrice}
                deviation={deviation}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

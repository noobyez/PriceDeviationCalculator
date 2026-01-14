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
  const [fromYear, setFromYear] = useState<string>("");
  const [toYear, setToYear] = useState<string>("");
  // Applied year range (only updated when user clicks "Applica")
  const [appliedFromYear, setAppliedFromYear] = useState<string>("");
  const [appliedToYear, setAppliedToYear] = useState<string>("");

  const handleUpload = (uploadedPurchases: Purchase[]) => {
    try {
      // sanitize input: ensure price is finite number and date is valid
      const sane: Purchase[] = uploadedPurchases
        .map((p) => ({ price: Number(p.price), date: String(p.date) }))
        .filter((p) => Number.isFinite(p.price) && !!p.date && !isNaN(new Date(p.date).getTime()));
      setPurchases(sane.length > 0 ? sane : null);
    } catch (err) {
      console.error('Error processing uploaded purchases', err);
      setPurchases(null);
    }
  };

  // Apply year filter when user clicks Applica
  const handleYearFilter = () => {
    const fromRaw = fromYear.trim();
    const toRaw = toYear.trim();

    const isFullYear = (s: string) => /^\d{4}$/.test(s);

    // If a year string is provided, require it to be a full 4-digit year
    if (fromRaw !== "" && !isFullYear(fromRaw)) return;
    if (toRaw !== "" && !isFullYear(toRaw)) return;

    const fromParsed = fromRaw !== "" ? parseInt(fromRaw, 10) : NaN;
    const toParsed = toRaw !== "" ? parseInt(toRaw, 10) : NaN;
    const from = !Number.isNaN(fromParsed) ? fromParsed : null;
    const to = !Number.isNaN(toParsed) ? toParsed : null;

    if (from !== null && to !== null && from > to) {
      // invalid range: do not apply
      return;
    }

    setAppliedFromYear(fromRaw);
    setAppliedToYear(toRaw);
  };

  // Validate year range to show UI feedback and avoid accidental submits
  const invalidYearRange = useMemo(() => {
    const fromRaw = fromYear.trim();
    const toRaw = toYear.trim();
    const isFullYear = (s: string) => /^\d{4}$/.test(s);

    if (fromRaw !== "" && !isFullYear(fromRaw)) return true;
    if (toRaw !== "" && !isFullYear(toRaw)) return true;

    const fromParsed = fromRaw !== "" ? parseInt(fromRaw, 10) : NaN;
    const toParsed = toRaw !== "" ? parseInt(toRaw, 10) : NaN;
    const from = !Number.isNaN(fromParsed) ? fromParsed : null;
    const to = !Number.isNaN(toParsed) ? toParsed : null;
    return from !== null && to !== null && from > to;
  }, [fromYear, toYear]);

  // Use appliedFromYear/appliedToYear so typing does not immediately change layout
  const filteredByYear = useMemo(() => {
    if (!purchases) return [];
    const fromRaw = appliedFromYear.trim();
    const toRaw = appliedToYear.trim();
    const fromParsed = fromRaw !== "" ? parseInt(fromRaw, 10) : NaN;
    const toParsed = toRaw !== "" ? parseInt(toRaw, 10) : NaN;
    const from = !Number.isNaN(fromParsed) ? fromParsed : null;
    const to = !Number.isNaN(toParsed) ? toParsed : null;

    return purchases.filter((purchase) => {
      try {
        const d = new Date(purchase.date);
        if (isNaN(d.getTime())) return false; // skip invalid dates
        const purchaseYear = d.getFullYear();
        const afterFrom = from === null ? true : purchaseYear >= from;
        const beforeTo = to === null ? true : purchaseYear <= to;
        return afterFrom && beforeTo;
      } catch {
        return false;
      }
    });
  }, [purchases, appliedFromYear, appliedToYear]);

  // fullPrices: all prices within selected years (preserve original order and duplicates)
  const fullPrices = useMemo(() =>
    filteredByYear
      .map((p) => Number(p.price))
      .filter((v) => Number.isFinite(v)),
    [filteredByYear]
  );

  // intervalPrices: apply interval selection (used for statistics/regression)
  const intervalPrices = useMemo(() => {
    if (interval === "all") return fullPrices;
    if (typeof interval === "number") {
      return fullPrices.slice(-interval);
    }
    return fullPrices;
  }, [fullPrices, interval]);

  // Calcola regressione per outlier e PDF
  const regression = useMemo(() => {
    if (!intervalPrices || intervalPrices.length === 0) return null;
    return linearRegression(intervalPrices);
  }, [intervalPrices]);

  // Outlier: solo il nuovo prezzo offerto se supera ±5% dal prezzo atteso
  const isNewPriceOutlier = useMemo(() => {
    if (!regression || newPrice === null) return false;
    const upperBound = regression.predicted * 1.05;
    const lowerBound = regression.predicted * 0.95;
    return newPrice > upperBound || newPrice < lowerBound;
  }, [regression, newPrice]);

  // Calcola statistiche per il PDF
  const stats = useMemo(() => {
    if (!intervalPrices || intervalPrices.length === 0) return null;
    const { q1, q3 } = quartiles(intervalPrices);
    return {
      mean: mean(intervalPrices),
      median: median(intervalPrices),
      std: std(intervalPrices),
      variance: variance(intervalPrices),
      min: Math.min(...intervalPrices),
      max: Math.max(...intervalPrices),
      q1,
      q3,
      iqr: iqr(intervalPrices),
    };
  }, [intervalPrices]);

  // Handler per l'input personalizzato
  const handleCustomIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomInterval(e.target.value);
  };

  const applyCustomInterval = () => {
    const val = parseInt(customInterval, 10);
    if (!isNaN(val) && val > 0 && fullPrices && val <= fullPrices.length) {
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
        {purchases && (
          <div className="card w-full max-w-xl mx-auto flex flex-col items-center">
            {/* Selezione intervallo */}
            <div className="flex flex-wrap gap-2 mb-2 items-center justify-center">
              <span className="label text-zinc-500 mr-2">Intervallo:</span>
              {[10, 20, 50, "all"].map((opt) => (
                <button
                  key={String(opt)}
                  className={`px-4 py-1 rounded-full text-sm font-medium transition-all border ${interval === opt ? "bg-blue-500 text-white border-blue-500" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700"}`}
                  onClick={() => { setInterval(opt as number | "all"); setCustomInterval(""); }}
                  disabled={typeof opt === "number" && filteredByYear.length < opt}
                  style={{ opacity: typeof opt === "number" && filteredByYear.length < opt ? 0.5 : 1 }}
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
                max={filteredByYear.length}
                value={customInterval}
                onChange={handleCustomIntervalChange}
                onKeyDown={handleCustomIntervalKeyDown}
                placeholder={`Personalizzato (1-${filteredByYear.length})`}
                className="input w-44 text-center text-sm py-1 px-2"
              />
              <button
                type="button"
                className="px-4 py-1 rounded-full text-sm font-medium transition-all border bg-blue-500 text-white border-blue-500"
                onClick={applyCustomInterval}
                disabled={!customInterval || isNaN(parseInt(customInterval, 10)) || parseInt(customInterval, 10) < 1 || parseInt(customInterval, 10) > filteredByYear.length}
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
              {intervalPrices.map((price, i) => (
                <span
                  key={i}
                  className="px-4 py-1 rounded-full shadow-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {price}
                </span>
              ))}
            </div>
            {intervalPrices && intervalPrices.length > 0 ? (
              <>
                <StatisticsPanel prices={intervalPrices} />
                <div className="mt-2 mb-4 px-4 py-3 bg-blue-50/80 dark:bg-blue-900/60 rounded-lg text-blue-800 dark:text-blue-100 text-lg font-medium shadow-sm w-full text-center">
                  <span className="font-medium">Media: </span>
                  {(
                    intervalPrices.reduce((acc, val) => acc + val, 0) / intervalPrices.length
                  ).toFixed(2)}
                </div>
                <LinearRegressionResult prices={intervalPrices} />
              </>
            ) : (
              <div className="mt-2 mb-4 px-4 py-3 rounded-lg text-zinc-500 text-sm w-full text-center">
                Nessun dato sufficiente per calcolare statistiche e regressione.
              </div>
            )}
            <div className="flex flex-col gap-2 mb-6 items-center justify-center">
              <h2 className="label text-lg">Seleziona intervallo anni</h2>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Anno da"
                  value={fromYear}
                  onChange={(e) => setFromYear(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); } }}
                  onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); } }}
                  className="input input-bordered w-full"
                />
                <input
                  type="number"
                  placeholder="Anno a"
                  value={toYear}
                  onChange={(e) => setToYear(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); } }}
                  onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); } }}
                  className="input input-bordered w-full"
                />
                <button
                  type="button"
                  onClick={handleYearFilter}
                  className="ml-2 px-4 py-1 rounded-full text-sm font-medium transition-all border bg-blue-500 text-white border-blue-500"
                >
                  Applica
                </button>
              </div>
              {invalidYearRange && (
                <div className="text-red-500 text-sm mt-2">
                  Intervallo anni non valido. Assicurati che "Anno da" sia minore o uguale a "Anno a".
                </div>
              )}
            </div>
            {intervalPrices && intervalPrices.length > 0 && (
              <NewPriceDeviation 
                prices={intervalPrices} 
                isNewPriceOutlier={isNewPriceOutlier}
                onDeviationChange={(price, dev) => {
                  setNewPrice(price);
                  setDeviation(dev);
                }}
              />
            )}
            {stats && intervalPrices && intervalPrices.length > 0 && (
              <DownloadPdfButton
                prices={intervalPrices}
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

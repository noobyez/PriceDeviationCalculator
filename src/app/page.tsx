"use client";
import PriceHistoryUpload from "./PriceHistoryUpload";
import LinearRegressionResult from "./LinearRegressionResult";
import NewPriceDeviation from "./NewPriceDeviation";
import PriceChart from "./PriceChart";
import ProbabilisticPriceChart from "./ProbabilisticPriceChart";
import OverlayHistoricalVsForecast from "./OverlayHistoricalVsForecast";
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

  // Toggle per rimuovere valori outlier identificati tramite Z-score (|Z| > 2)
  const [removeOutliers, setRemoveOutliers] = useState<boolean>(false);

  // Indici esclusi manualmente dall'utente (basati su filteredByYear)
  const [excludedIndices, setExcludedIndices] = useState<Set<number>>(new Set());

  const handleUpload = (uploadedPurchases: Purchase[]) => {
    try {
      // sanitize input: ensure price is finite number and date is valid
      const sane: Purchase[] = uploadedPurchases
        .map((p) => ({ price: Number(p.price), date: String(p.date) }))
        .filter((p) => Number.isFinite(p.price) && !!p.date && !isNaN(new Date(p.date).getTime()));
      setPurchases(sane.length > 0 ? sane : null);
      // Reset esclusioni manuali quando si carica un nuovo file
      setExcludedIndices(new Set());
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

  // fullDates: date corrispondenti ai fullPrices
  const fullDates = useMemo(() =>
    filteredByYear
      .filter((p) => Number.isFinite(Number(p.price)))
      .map((p) => p.date),
    [filteredByYear]
  );

  // intervalPricesRaw: dati originali dopo selezione intervallo (usati per visualizzazione e per calcolare Z-score)
  const intervalPricesRaw = useMemo(() => {
    if (interval === "all") return fullPrices;
    if (typeof interval === "number") {
      return fullPrices.slice(-interval);
    }
    return fullPrices;
  }, [fullPrices, interval]);

  // intervalDatesRaw: date corrispondenti a intervalPricesRaw
  const intervalDatesRaw = useMemo(() => {
    if (interval === "all") return fullDates;
    if (typeof interval === "number") {
      return fullDates.slice(-interval);
    }
    return fullDates;
  }, [fullDates, interval]);

  // Calcola Z-score per individuare outlier e costruisce intervalPrices filtrati se removeOutliers=true
  const { intervalPrices, intervalDates, outlierFlags } = useMemo(() => {
    if (!intervalPricesRaw || intervalPricesRaw.length === 0) {
      return { intervalPrices: intervalPricesRaw, intervalDates: intervalDatesRaw, outlierFlags: [] };
    }

    const m = mean(intervalPricesRaw);
    const s = std(intervalPricesRaw);

    const flags = intervalPricesRaw.map((p) => {
      if (s === 0) return false; // deviazione nulla -> nessun outlier
      const z = Math.abs((p - m) / s);
      return z > 2;
    });

    // Filtra per outlier Z-score e per esclusioni manuali
    const filtered: number[] = [];
    const filteredDates: string[] = [];
    intervalPricesRaw.forEach((price, i) => {
      const isZScoreOutlier = removeOutliers && flags[i];
      const isManuallyExcluded = excludedIndices.has(i);
      if (!isZScoreOutlier && !isManuallyExcluded) {
        filtered.push(price);
        filteredDates.push(intervalDatesRaw[i] || '');
      }
    });

    return { intervalPrices: filtered, intervalDates: filteredDates, outlierFlags: flags };
  }, [intervalPricesRaw, intervalDatesRaw, removeOutliers, excludedIndices]);

  // Handler per toggle esclusione manuale di un valore
  const toggleExclude = (index: number) => {
    setExcludedIndices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Reset esclusioni manuali
  const resetExclusions = () => {
    setExcludedIndices(new Set());
  };

  // Calcola regressione per outlier e PDF (include R² confidence)
  const regression = useMemo(() => {
    if (!intervalPrices || intervalPrices.length === 0) return null;
    const base = linearRegression(intervalPrices);
    if (!base) return null;
    // compute R² using the same x=1..n mapping used in linearRegression
    const n = intervalPrices.length;
    const meanY = intervalPrices.reduce((a, b) => a + b, 0) / n;
    const ssTot = intervalPrices.reduce((acc, yi) => acc + (yi - meanY) ** 2, 0);
    const ssRes = intervalPrices.reduce((acc, yi, i) => {
      const yiPred = base.a + base.b * (i + 1);
      return acc + (yi - yiPred) ** 2;
    }, 0);
    const r2 = ssTot === 0 ? 1 : Math.max(0, Math.min(1, 1 - ssRes / ssTot));
    return { ...base, r2 };
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
    <div className="w-full min-h-screen bg-[var(--background)] p-6 lg:p-8">
      <header className="w-full text-center mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-zinc-800 dark:text-zinc-100">
          Price Prediction Model Analysis
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Analisi statistica e previsionale dei prezzi
        </p>
      </header>

      {/* Landing page centrata quando non ci sono dati */}
      {!purchases && (
        <div className="w-full max-w-md mx-auto mt-12">
          <div className="w-full p-6 bg-[var(--surface)] rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800">
            <PriceHistoryUpload onUpload={handleUpload} />
          </div>
        </div>
      )}

      {/* Layout a due colonne quando ci sono dati */}
      {purchases && (
        <main className="w-full flex flex-col lg:flex-row gap-6">
          {/* Left column - Inputs & Data */}
          <aside className="w-full lg:w-1/2 flex flex-col gap-4 self-start">
            <div className="w-full p-4 bg-[var(--surface)] rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800">
              <PriceHistoryUpload onUpload={handleUpload} />
            </div>

            {/* Filtro per anni */}
            <div className="w-full p-4 bg-[var(--surface)] rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-3">
                Filtro per Anno
              </h3>
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[100px]">
                  <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">Da anno</label>
                  <input
                    type="text"
                    placeholder="es. 2020"
                    value={fromYear}
                    onChange={(e) => setFromYear(e.target.value)}
                    className={`input w-full text-sm py-1.5 px-3 ${invalidYearRange ? 'border-red-400' : ''}`}
                    maxLength={4}
                  />
                </div>
                <div className="flex-1 min-w-[100px]">
                  <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">A anno</label>
                  <input
                    type="text"
                    placeholder="es. 2025"
                    value={toYear}
                    onChange={(e) => setToYear(e.target.value)}
                    className={`input w-full text-sm py-1.5 px-3 ${invalidYearRange ? 'border-red-400' : ''}`}
                    maxLength={4}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleYearFilter}
                  disabled={invalidYearRange}
                  className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Applica
                </button>
              </div>
              {invalidYearRange && (
                <p className="text-xs text-red-500 mt-2">Intervallo anni non valido</p>
              )}
              {(appliedFromYear || appliedToYear) && !invalidYearRange && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                  Filtro attivo: {appliedFromYear || '...'} - {appliedToYear || '...'}
                </p>
              )}
            </div>

            {/* Storico prezzi e toggle Z-score */}
            <div className="w-full p-4 bg-[var(--surface)] rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Storico prezzi caricato
                </h3>
                {excludedIndices.size > 0 && (
                  <button
                    type="button"
                    onClick={resetExclusions}
                    className="text-xs text-blue-500 hover:text-blue-600 hover:underline"
                  >
                    Ripristina tutti ({excludedIndices.size} esclusi)
                  </button>
                )}
              </div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-2">
                Clicca su un valore per escluderlo/includerlo dall&apos;analisi
              </p>
              <div className="flex flex-wrap gap-2 text-sm mb-3 max-h-32 overflow-y-auto">
                {intervalPricesRaw.map((price, i) => {
                  const isOutlier = outlierFlags[i];
                  const isExcluded = excludedIndices.has(i);
                  const dateStr = intervalDatesRaw[i];
                  const formattedDate = dateStr ? new Date(dateStr).toLocaleDateString('it-IT') : '';
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleExclude(i)}
                      title={`${formattedDate}${isExcluded ? ' (escluso)' : isOutlier ? ' (outlier Z>2)' : ''} - Clicca per ${isExcluded ? 'includere' : 'escludere'}`}
                      className={`px-2.5 py-1 rounded-full text-sm font-medium transition-all cursor-pointer ${
                        isExcluded 
                          ? 'bg-zinc-300 dark:bg-zinc-600 text-zinc-500 dark:text-zinc-400 line-through opacity-60' 
                          : isOutlier 
                            ? 'bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 ring-1 ring-red-400' 
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-blue-100 dark:hover:bg-blue-900'
                      }`}
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {price.toFixed(2)}
                    </button>
                  );
                })}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeOutliers}
                  onChange={(e) => setRemoveOutliers(e.target.checked)}
                    className="w-4 h-4 rounded cursor-pointer accent-red-500"
                    aria-label="Rimuovi outlier (Z-score)"
                  />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">
                    Rimuovi outlier (|Z| {'>'} 2)
                  </span>
                </label>
              </div>

              {/* Selezione intervallo */}
              <div className="w-full p-4 bg-[var(--surface)] rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-3">
                  Intervallo dati
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[10, 20, 50, "all"].map((opt) => (
                    <button
                      key={String(opt)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${interval === opt ? "bg-blue-500 text-white border-blue-500" : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"}`}
                      onClick={() => { setInterval(opt as number | "all"); setCustomInterval(""); }}
                      disabled={typeof opt === "number" && filteredByYear.length < opt}
                      style={{ opacity: typeof opt === "number" && filteredByYear.length < opt ? 0.5 : 1 }}
                    >
                      {opt === "all" ? "Tutti" : `Ultimi ${opt}`}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min={1}
                    max={filteredByYear.length}
                    value={customInterval}
                    onChange={handleCustomIntervalChange}
                    onKeyDown={handleCustomIntervalKeyDown}
                    placeholder={`1-${filteredByYear.length}`}
                    className="input flex-1 text-sm py-1.5 px-3"
                  />
                  <button
                    type="button"
                    className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                    onClick={applyCustomInterval}
                    disabled={!customInterval || isNaN(parseInt(customInterval, 10)) || parseInt(customInterval, 10) < 1 || parseInt(customInterval, 10) > filteredByYear.length}
                  >
                    Applica
                  </button>
                </div>
              </div>

              <StatisticsPanel prices={intervalPrices} />

              {/* NewPriceDeviation - Decision evaluation */}
              <NewPriceDeviation
                prices={intervalPrices}
                isNewPriceOutlier={isNewPriceOutlier}
                onDeviationChange={(price, dev) => {
                  setNewPrice(price);
                  setDeviation(dev);
                }}
              />

              {stats && intervalPrices && intervalPrices.length > 0 && (
                <DownloadPdfButton
                  prices={intervalPrices}
                  stats={stats}
                  regression={regression}
                  newPrice={newPrice}
                  deviation={deviation}
                  fromYear={appliedFromYear || null}
                  toYear={appliedToYear || null}
                />
              )}
          </aside>

          {/* Right column - Chart & Analysis */}
          <section className="w-full lg:w-1/2 flex flex-col gap-4 self-start">
            {intervalPrices && intervalPrices.length > 0 ? (
              <div className="w-full p-4 bg-[var(--surface)] rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-3">
                  Grafico Prezzi
                </h3>
                <div className="w-full h-[480px] floating-chart" id="chart-prices">
                  <PriceChart
                    prices={intervalPrices}
                    regression={regression}
                    newPrice={newPrice}
                    isNewPriceOutlier={isNewPriceOutlier}
                    dates={intervalDates}
                  />
                </div>
              </div>
            ) : (
              <div className="w-full p-8 bg-[var(--surface)] rounded-xl border border-zinc-100 dark:border-zinc-800 text-center">
                <p className="text-zinc-500 dark:text-zinc-400">
                  Carica uno storico prezzi per visualizzare il grafico
                </p>
              </div>
            )}

            {intervalPrices && intervalPrices.length > 0 && (
              <div className="w-full p-4 bg-[var(--surface)] rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                <LinearRegressionResult prices={intervalPrices} />
              </div>
            )}

            {/* Grafico Probabilistico Prezzi Futuri */}
            {intervalPrices && intervalPrices.length > 0 && regression && (
              <div className="w-full p-4 bg-[var(--surface)] rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-3">
                  Previsione Probabilistica
                </h3>
                <div id="chart-probabilistic">
                  <ProbabilisticPriceChart
                    prices={intervalPrices}
                    regression={regression}
                    newPrice={newPrice}
                    futurePoints={5}
                    dates={intervalDates}
                  />
                </div>
              </div>
            )}

            {/* Overlay Storico vs Previsione Futura */}
            {intervalPrices && intervalPrices.length > 0 && regression && (
              <div className="w-full p-4 bg-[var(--surface)] rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-3">
                  Storico vs Previsione
                </h3>
                <div id="chart-overlay">
                  <OverlayHistoricalVsForecast
                    prices={intervalPrices}
                    regression={regression}
                    newPrice={newPrice}
                    futurePoints={5}
                    dates={intervalDates}
                  />
                </div>
              </div>
            )}
          </section>
        </main>
      )}
    </div>
  );
}

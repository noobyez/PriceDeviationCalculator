"use client";
import PriceHistoryUpload from "./PriceHistoryUpload";
import LinearRegressionResult from "./LinearRegressionResult";
import NewPriceDeviation from "./NewPriceDeviation";
import PriceChart from "./PriceChart";
import ProbabilisticPriceChart from "./ProbabilisticPriceChart";
import OverlayHistoricalVsForecast from "./OverlayHistoricalVsForecast";
import StatisticsPanel from "./StatisticsPanel";
import DownloadPdfButton from "./DownloadPdfButton";
import ProductCorrelationPanel from "./ProductCorrelationPanel";
import { ModularLayout, PanelConfig } from "./components/modular";
import { HelpPanel, HelpToggle } from "./components/help";
import { useState, useMemo, useCallback } from "react";
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
  
  // Date filter (formato dd/mm/yyyy)
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [appliedFromDate, setAppliedFromDate] = useState<string>("");
  const [appliedToDate, setAppliedToDate] = useState<string>("");

  // Toggle per rimuovere valori outlier identificati tramite Z-score (|Z| > 2)
  const [removeOutliers, setRemoveOutliers] = useState<boolean>(false);

  // Indici esclusi manualmente dall'utente (basati su filteredByYear)
  const [excludedIndices, setExcludedIndices] = useState<Set<number>>(new Set());

  // Stato per zoom grafici
  const [zoomedChart, setZoomedChart] = useState<string | null>(null);

  // Helper per parsare data nel formato dd/mm/yyyy
  const parseDateString = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    // Supporta dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy
    const parts = dateStr.split(/[\/\-\.]/);
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // mesi 0-based
      let year = parseInt(parts[2], 10);
      // Supporta anni a 2 cifre (es. 24 -> 2024)
      if (year < 100) {
        year = year > 50 ? 1900 + year : 2000 + year;
      }
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime()) && date.getDate() === day && date.getMonth() === month) {
        return date;
      }
    }
    return null;
  };

  // Formatta una data per la visualizzazione
  const formatDateDisplay = (dateStr: string): string => {
    const d = parseDateString(dateStr);
    if (d) {
      return d.toLocaleDateString('it-IT');
    }
    return dateStr;
  };

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

  // Apply date filter when user clicks Applica
  const handleDateFilter = () => {
    const fromRaw = fromDate.trim();
    const toRaw = toDate.trim();

    const fromParsed = parseDateString(fromRaw);
    const toParsed = parseDateString(toRaw);

    // Verifica validità se inseriti
    if (fromRaw !== "" && !fromParsed) return;
    if (toRaw !== "" && !toParsed) return;

    // Verifica che from <= to
    if (fromParsed && toParsed && fromParsed > toParsed) {
      return;
    }

    setAppliedFromDate(fromRaw);
    setAppliedToDate(toRaw);
  };

  // Validate date range to show UI feedback
  const invalidDateRange = useMemo((): boolean => {
    const fromRaw = fromDate.trim();
    const toRaw = toDate.trim();

    if (fromRaw !== "" && !parseDateString(fromRaw)) return true;
    if (toRaw !== "" && !parseDateString(toRaw)) return true;

    const fromParsed = parseDateString(fromRaw);
    const toParsed = parseDateString(toRaw);

    return !!(fromParsed && toParsed && fromParsed > toParsed);
  }, [fromDate, toDate]);

  // Reset date filter
  const resetDateFilter = () => {
    setFromDate("");
    setToDate("");
    setAppliedFromDate("");
    setAppliedToDate("");
  };

  // Filtra purchases per intervallo di date
  const filteredByDate = useMemo(() => {
    if (!purchases) return [];
    
    const fromParsed = parseDateString(appliedFromDate);
    const toParsed = parseDateString(appliedToDate);

    return purchases.filter((purchase) => {
      try {
        const d = new Date(purchase.date);
        if (isNaN(d.getTime())) return false;
        
        const afterFrom = !fromParsed || d >= fromParsed;
        const beforeTo = !toParsed || d <= toParsed;
        return afterFrom && beforeTo;
      } catch {
        return false;
      }
    });
  }, [purchases, appliedFromDate, appliedToDate]);

  // fullPrices: all prices within selected dates (preserve original order and duplicates)
  const fullPrices = useMemo(() =>
    filteredByDate
      .map((p) => Number(p.price))
      .filter((v) => Number.isFinite(v)),
    [filteredByDate]
  );

  // fullDates: date corrispondenti ai fullPrices
  const fullDates = useMemo(() =>
    filteredByDate
      .filter((p) => Number.isFinite(Number(p.price)))
      .map((p) => p.date),
    [filteredByDate]
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

  // Handler per zoom pannello
  const handleZoomPanel = useCallback((panelId: string) => {
    // Map panel id to zoom chart id
    const zoomMap: Record<string, string> = {
      'priceChart': 'prices',
      'probabilistic': 'probabilistic',
      'overlay': 'overlay',
    };
    if (zoomMap[panelId]) {
      setZoomedChart(zoomMap[panelId]);
    }
  }, []);

  // Render dei contenuti dei pannelli
  const renderPanelContent = useCallback((panelId: string, config: PanelConfig) => {
    switch (panelId) {
      case 'upload':
        return <PriceHistoryUpload onUpload={handleUpload} />;

      case 'dateFilter':
        return (
          <>
            <div className="flex items-center justify-between mb-3">
              {(appliedFromDate || appliedToDate) && (
                <button
                  type="button"
                  onClick={resetDateFilter}
                  className="text-xs text-blue-500 hover:text-blue-600 hover:underline ml-auto"
                >
                  Reset filtro
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[120px]">
                <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">Da data</label>
                <input
                  type="text"
                  placeholder="dd/mm/yyyy"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className={`input w-full text-sm py-1.5 px-3 ${invalidDateRange ? 'border-red-400' : ''}`}
                  maxLength={10}
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">A data</label>
                <input
                  type="text"
                  placeholder="dd/mm/yyyy"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className={`input w-full text-sm py-1.5 px-3 ${invalidDateRange ? 'border-red-400' : ''}`}
                  maxLength={10}
                />
              </div>
              <button
                type="button"
                onClick={handleDateFilter}
                disabled={invalidDateRange}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Applica
              </button>
            </div>
            {invalidDateRange && (
              <p className="text-xs text-red-500 mt-2">Formato data non valido (usa dd/mm/yyyy) o intervallo errato</p>
            )}
            {(appliedFromDate || appliedToDate) && !invalidDateRange && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Filtro attivo: {formatDateDisplay(appliedFromDate) || '...'} → {formatDateDisplay(appliedToDate) || '...'}
              </p>
            )}
          </>
        );

      case 'priceHistory':
        return (
          <>
            <div className="flex items-center justify-between mb-3">
              {excludedIndices.size > 0 && (
                <button
                  type="button"
                  onClick={resetExclusions}
                  className="text-xs text-blue-500 hover:text-blue-600 hover:underline ml-auto"
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
          </>
        );

      case 'interval':
        return (
          <>
            <div className="flex flex-wrap gap-2 mb-3">
              {[10, 20, 50, "all"].map((opt) => (
                <button
                  key={String(opt)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${interval === opt ? "bg-blue-500 text-white border-blue-500" : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"}`}
                  onClick={() => { setInterval(opt as number | "all"); setCustomInterval(""); }}
                  disabled={typeof opt === "number" && filteredByDate.length < opt}
                  style={{ opacity: typeof opt === "number" && filteredByDate.length < opt ? 0.5 : 1 }}
                >
                  {opt === "all" ? "Tutti" : `Ultimi ${opt}`}
                </button>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min={1}
                max={filteredByDate.length}
                value={customInterval}
                onChange={handleCustomIntervalChange}
                onKeyDown={handleCustomIntervalKeyDown}
                placeholder={`1-${filteredByDate.length}`}
                className="input flex-1 text-sm py-1.5 px-3"
              />
              <button
                type="button"
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                onClick={applyCustomInterval}
                disabled={!customInterval || isNaN(parseInt(customInterval, 10)) || parseInt(customInterval, 10) < 1 || parseInt(customInterval, 10) > filteredByDate.length}
              >
                Applica
              </button>
            </div>
          </>
        );

      case 'statistics':
        return <StatisticsPanel prices={intervalPrices} />;

      case 'newPrice':
        return (
          <NewPriceDeviation
            prices={intervalPrices}
            isNewPriceOutlier={isNewPriceOutlier}
            onDeviationChange={(price, dev) => {
              setNewPrice(price);
              setDeviation(dev);
            }}
          />
        );

      case 'download':
        return stats && intervalPrices && intervalPrices.length > 0 ? (
          <DownloadPdfButton
            prices={intervalPrices}
            stats={stats}
            regression={regression}
            newPrice={newPrice}
            deviation={deviation}
            fromDate={appliedFromDate || null}
            toDate={appliedToDate || null}
          />
        ) : (
          <p className="text-sm text-zinc-400">Carica dati per abilitare il download</p>
        );

      case 'priceChart':
        return intervalPrices && intervalPrices.length > 0 ? (
          <div className="w-full h-[400px]" id="chart-prices">
            <PriceChart
              prices={intervalPrices}
              regression={regression}
              newPrice={newPrice}
              isNewPriceOutlier={isNewPriceOutlier}
              dates={intervalDates}
            />
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-zinc-500 dark:text-zinc-400">
              Carica uno storico prezzi per visualizzare il grafico
            </p>
          </div>
        );

      case 'regression':
        return intervalPrices && intervalPrices.length > 0 ? (
          <LinearRegressionResult prices={intervalPrices} />
        ) : (
          <p className="text-sm text-zinc-400">Carica dati per vedere la regressione</p>
        );

      case 'correlation':
        return intervalPrices && intervalPrices.length > 0 ? (
          <ProductCorrelationPanel prices={intervalPrices} dates={intervalDates} />
        ) : (
          <p className="text-sm text-zinc-400">Carica dati per l&apos;analisi di correlazione</p>
        );

      case 'probabilistic':
        return intervalPrices && intervalPrices.length > 0 && regression ? (
          <div id="chart-probabilistic">
            <ProbabilisticPriceChart
              prices={intervalPrices}
              regression={regression}
              newPrice={newPrice}
              futurePoints={5}
              dates={intervalDates}
            />
          </div>
        ) : (
          <p className="text-sm text-zinc-400">Carica dati per la previsione probabilistica</p>
        );

      case 'overlay':
        return intervalPrices && intervalPrices.length > 0 && regression ? (
          <div id="chart-overlay">
            <OverlayHistoricalVsForecast
              prices={intervalPrices}
              regression={regression}
              newPrice={newPrice}
              futurePoints={5}
              dates={intervalDates}
            />
          </div>
        ) : (
          <p className="text-sm text-zinc-400">Carica dati per vedere storico vs previsione</p>
        );

      default:
        return <p className="text-sm text-zinc-400">Pannello non configurato</p>;
    }
  }, [
    appliedFromDate, appliedToDate, fromDate, toDate, invalidDateRange,
    excludedIndices, intervalPricesRaw, intervalDatesRaw, outlierFlags, removeOutliers,
    interval, customInterval, filteredByDate.length, intervalPrices, intervalDates,
    regression, newPrice, deviation, stats, isNewPriceOutlier,
    handleUpload, resetDateFilter, handleDateFilter, formatDateDisplay,
    resetExclusions, toggleExclude, handleCustomIntervalChange, handleCustomIntervalKeyDown,
    applyCustomInterval, setFromDate, setToDate, setRemoveOutliers, setInterval,
    setCustomInterval, setNewPrice, setDeviation
  ]);

  return (
    <div className="w-full min-h-screen bg-[var(--background)] p-6 lg:p-8">
      {/* Help Toggle in alto a destra */}
      <div className="fixed top-4 right-4 z-40">
        <HelpToggle />
      </div>

      {/* Help Panel (pulsante in basso a sinistra) */}
      <HelpPanel />

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

      {/* Layout modulare quando ci sono dati */}
      {purchases && (
        <main className="w-full">
          <ModularLayout
            renderPanel={renderPanelContent}
            onZoomPanel={handleZoomPanel}
            zoomablePanels={['priceChart', 'probabilistic', 'overlay']}
            hasPurchases={!!purchases}
          />
        </main>
      )}

      {/* Modal Zoom Grafico */}
      {zoomedChart && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setZoomedChart(null)}
        >
          <div 
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
              <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                {zoomedChart === 'prices' && 'Grafico Prezzi'}
                {zoomedChart === 'probabilistic' && 'Previsione Probabilistica'}
                {zoomedChart === 'overlay' && 'Storico vs Previsione'}
              </h2>
              <button
                type="button"
                onClick={() => setZoomedChart(null)}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>
            <div className="p-6">
              {zoomedChart === 'prices' && intervalPrices && (
                <div className="h-[70vh]">
                  <PriceChart
                    prices={intervalPrices}
                    regression={regression}
                    newPrice={newPrice}
                    isNewPriceOutlier={isNewPriceOutlier}
                    dates={intervalDates}
                  />
                </div>
              )}
              {zoomedChart === 'probabilistic' && intervalPrices && regression && (
                <div className="h-[70vh]">
                  <ProbabilisticPriceChart
                    prices={intervalPrices}
                    regression={regression}
                    newPrice={newPrice}
                    futurePoints={5}
                    dates={intervalDates}
                  />
                </div>
              )}
              {zoomedChart === 'overlay' && intervalPrices && regression && (
                <div className="h-[70vh]">
                  <OverlayHistoricalVsForecast
                    prices={intervalPrices}
                    regression={regression}
                    newPrice={newPrice}
                    futurePoints={5}
                    dates={intervalDates}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

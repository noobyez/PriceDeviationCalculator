"use client";
import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useLanguage } from "@/i18n";
import { Tooltip as HelpTooltip } from "./components/help";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Title, Tooltip, Legend);

interface OverlayHistoricalVsForecastProps {
  prices: number[];
  regression: { a: number; b: number; predicted: number } | null;
  newPrice?: number | null;
  futurePoints?: number; // Numero di periodi futuri da prevedere (default: 5)
  dates?: string[]; // Date ISO corrispondenti ai prezzi storici
}

/**
 * OverlayHistoricalVsForecast
 * 
 * Visualizza un overlay che combina:
 * - Prezzi storici (linea solida blu)
 * - Retta di regressione storica (linea tratteggiata verde)
 * - Previsione futura con bande di probabilità gaussiane
 *   - ±1σ (68% probabilità) - verde
 *   - ±2σ (95% probabilità) - ambra
 *   - ±3σ (99.7% probabilità) - rosso
 * - Eventuale nuovo prezzo evidenziato
 */
export default function OverlayHistoricalVsForecast({
  prices,
  regression,
  newPrice = null,
  futurePoints = 5,
  dates = [],
}: OverlayHistoricalVsForecastProps) {
  const { t, language } = useLanguage();
  
  // Helper to format date in DD-MM-YY format
  const formatDateLabel = (dateStr: string): string => {
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, year, month, day] = match;
      return `${day}-${month}-${year.slice(-2)}`;
    }
    return dateStr;
  };
  
  // ============================================================
  // CALCOLI STATISTICI
  // ============================================================
  const computedData = useMemo(() => {
    if (!regression || prices.length < 2) {
      return null;
    }

    const { a, b } = regression;
    const n = prices.length;

    // 1. Calcola errori storici: error_i = prezzo_i - (a + b * (i+1))
    const errors = prices.map((price, i) => price - (a + b * (i + 1)));

    // 2. Calcola deviazione standard σ degli errori
    const meanError = errors.reduce((sum, e) => sum + e, 0) / errors.length;
    const variance = errors.reduce((sum, e) => sum + Math.pow(e - meanError, 2), 0) / errors.length;
    const sigma = Math.sqrt(variance);

    // 3. Genera valori della retta di regressione per i dati storici
    const regressionLineHistorical = prices.map((_, i) => a + b * (i + 1));

    // 4. Genera previsioni future
    const futurePredictions: number[] = [];
    for (let i = 1; i <= futurePoints; i++) {
      const futureX = n + i;
      futurePredictions.push(a + b * futureX);
    }

    // 5. Costruisci bande di probabilità per la previsione futura
    const band1SigmaUpper = futurePredictions.map((p) => p + sigma);
    const band1SigmaLower = futurePredictions.map((p) => p - sigma);
    const band2SigmaUpper = futurePredictions.map((p) => p + 2 * sigma);
    const band2SigmaLower = futurePredictions.map((p) => p - 2 * sigma);
    const band3SigmaUpper = futurePredictions.map((p) => p + 3 * sigma);
    const band3SigmaLower = futurePredictions.map((p) => p - 3 * sigma);

    // 6. Genera etichette per l'asse X (usa date se disponibili, formato DD-MM-YY)
    const historicalLabels = prices.map((_, i) => {
      if (dates[i]) {
        return formatDateLabel(dates[i]);
      }
      return `${i + 1}`;
    });
    const futureLabels = Array.from({ length: futurePoints }, (_, i) => `T+${i + 1}`);
    const allLabels = [...historicalLabels, ...futureLabels];

    return {
      sigma,
      n,
      regressionLineHistorical,
      futurePredictions,
      band1SigmaUpper,
      band1SigmaLower,
      band2SigmaUpper,
      band2SigmaLower,
      band3SigmaUpper,
      band3SigmaLower,
      allLabels,
      historicalLabels,
      futureLabels,
    };
  }, [prices, regression, futurePoints, dates, formatDateLabel]);

  // Se non ci sono dati sufficienti, non renderizzare
  if (!computedData || !regression) {
    return null;
  }

  const {
    sigma,
    n,
    regressionLineHistorical,
    futurePredictions,
    band1SigmaUpper,
    band1SigmaLower,
    band2SigmaUpper,
    band2SigmaLower,
    band3SigmaUpper,
    band3SigmaLower,
    allLabels,
  } = computedData;

  // ============================================================
  // PREPARAZIONE DATI PER IL GRAFICO
  // ============================================================

  // Prezzi storici: riempiti fino a n, poi null per i periodi futuri
  const historicalPricesData = [...prices, ...Array(futurePoints).fill(null)];

  // Retta di regressione storica: riempita fino a n, poi null
  const regressionHistoricalData = [...regressionLineHistorical, ...Array(futurePoints).fill(null)];

  // Previsione futura: null per i periodi storici, poi valori previsti
  // Colleghiamo l'ultimo punto della regressione storica al primo punto della previsione
  const futurePredictionData = [
    ...Array(n - 1).fill(null),
    regressionLineHistorical[n - 1], // Punto di connessione
    ...futurePredictions,
  ];

  // Bande: null per i periodi storici, poi valori delle bande
  // Connessione: usiamo l'ultimo valore della regressione storica come punto di partenza
  const lastHistoricalValue = regressionLineHistorical[n - 1];
  
  const band3UpperData = [...Array(n - 1).fill(null), lastHistoricalValue, ...band3SigmaUpper];
  const band3LowerData = [...Array(n - 1).fill(null), lastHistoricalValue, ...band3SigmaLower];
  const band2UpperData = [...Array(n - 1).fill(null), lastHistoricalValue, ...band2SigmaUpper];
  const band2LowerData = [...Array(n - 1).fill(null), lastHistoricalValue, ...band2SigmaLower];
  const band1UpperData = [...Array(n - 1).fill(null), lastHistoricalValue, ...band1SigmaUpper];
  const band1LowerData = [...Array(n - 1).fill(null), lastHistoricalValue, ...band1SigmaLower];

  // Nuovo prezzo: linea orizzontale se fornito
  const newPriceData = newPrice !== null 
    ? allLabels.map(() => newPrice)
    : null;

  // ============================================================
  // CONFIGURAZIONE CHART.JS
  // ============================================================
  const data = {
    labels: allLabels,
    datasets: [
      // Banda ±3σ (sfondo rosso chiaro)
      {
        label: "±3σ (99.7%)",
        data: band3UpperData,
        borderColor: "transparent",
        backgroundColor: "rgba(239, 68, 68, 0.08)",
        fill: "+1",
        pointRadius: 0,
        tension: 0.2,
        order: 10,
      },
      {
        label: "±3σ lower",
        data: band3LowerData,
        borderColor: "transparent",
        backgroundColor: "transparent",
        fill: false,
        pointRadius: 0,
        tension: 0.2,
        order: 11,
      },
      // Banda ±2σ (sfondo ambra)
      {
        label: "±2σ (95%)",
        data: band2UpperData,
        borderColor: "transparent",
        backgroundColor: "rgba(251, 191, 36, 0.12)",
        fill: "+1",
        pointRadius: 0,
        tension: 0.2,
        order: 8,
      },
      {
        label: "±2σ lower",
        data: band2LowerData,
        borderColor: "transparent",
        backgroundColor: "transparent",
        fill: false,
        pointRadius: 0,
        tension: 0.2,
        order: 9,
      },
      // Banda ±1σ (sfondo verde)
      {
        label: "±1σ (68%)",
        data: band1UpperData,
        borderColor: "transparent",
        backgroundColor: "rgba(34, 197, 94, 0.15)",
        fill: "+1",
        pointRadius: 0,
        tension: 0.2,
        order: 6,
      },
      {
        label: "±1σ lower",
        data: band1LowerData,
        borderColor: "transparent",
        backgroundColor: "transparent",
        fill: false,
        pointRadius: 0,
        tension: 0.2,
        order: 7,
      },
      // Previsione futura (linea centrale tratteggiata)
      {
        label: t("charts.futureExpected"),
        data: futurePredictionData,
        borderColor: "#8b5cf6",
        backgroundColor: "#8b5cf6",
        borderWidth: 2,
        borderDash: [6, 4],
        pointRadius: 3,
        pointBackgroundColor: "#8b5cf6",
        fill: false,
        tension: 0.2,
        order: 3,
      },
      // Retta di regressione storica
      {
        label: t("charts.historicalTrend"),
        data: regressionHistoricalData,
        borderColor: "#22c55e",
        backgroundColor: "#22c55e",
        borderWidth: 2,
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
        tension: 0.1,
        order: 4,
      },
      // Prezzi storici (linea solida)
      {
        label: t("charts.historicalPrices"),
        data: historicalPricesData,
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f6",
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#fff",
        pointBorderWidth: 1,
        fill: false,
        tension: 0.1,
        order: 1,
      },
      // Nuovo prezzo (se fornito)
      ...(newPriceData
        ? [
            {
              label: t("charts.newPrice"),
              data: newPriceData,
              borderColor: "#f97316",
              backgroundColor: "#f97316",
              borderWidth: 2,
              borderDash: [8, 4],
              pointRadius: 0,
              fill: false,
              tension: 0,
              order: 2,
            },
          ]
        : []),
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 12,
          font: { size: 11 },
          filter: (item: { text: string }) => {
            // Nascondi le label "lower" duplicate
            return !item.text.includes("lower");
          },
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          title: (tooltipItems: { dataIndex: number }[]) => {
            const idx = tooltipItems[0]?.dataIndex;
            if (idx === undefined) return '';
            // Se è un punto storico, mostra la data in formato DD-MM-YY
            if (idx < n && dates[idx]) {
              return formatDateLabel(dates[idx]);
            }
            // Se è un punto futuro
            if (idx >= n) {
              return `Previsione T+${idx - n + 1}`;
            }
            return `Periodo ${idx + 1}`;
          },
          label: (context: { dataset: { label?: string }; parsed: { y: number | null } }) => {
            const label = context.dataset.label || "";
            if (label.includes("lower")) return "";
            const value = context.parsed.y;
            if (value === null) return "";
            return `${label}: ${value.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.04)",
        },
        ticks: {
          font: { size: 10 },
          maxRotation: 0,
        },
        title: {
          display: true,
          text: "Periodo",
          font: { size: 11, weight: 500 },
          color: "#71717a",
        },
      },
      y: {
        grid: {
          color: "rgba(0, 0, 0, 0.04)",
        },
        ticks: {
          font: { size: 10 },
          callback: (value: number | string) => {
            if (typeof value === "number") {
              return value.toFixed(0);
            }
            return value;
          },
        },
        title: {
          display: true,
          text: "Prezzo",
          font: { size: 11, weight: 500 },
          color: "#71717a",
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  };

  // ============================================================
  // CALCOLO INTERPRETAZIONE AUTOMATICA
  // ============================================================
  const interpretation = useMemo(() => {
    if (!regression || prices.length < 2) return null;

    const { a, b } = regression;
    const n = prices.length;
    const firstPrice = prices[0];
    const lastPrice = prices[n - 1];
    const priceChange = lastPrice - firstPrice;
    const priceChangePerc = ((lastPrice - firstPrice) / firstPrice) * 100;
    
    // Trend direction
    const trendDirection = b > 0 ? 'crescente' : b < 0 ? 'decrescente' : 'stabile';
    const trendStrength = Math.abs(b);
    
    // Variabilità (coefficiente di variazione)
    const meanPrice = prices.reduce((sum, p) => sum + p, 0) / n;
    const stdPrice = Math.sqrt(prices.reduce((sum, p) => sum + Math.pow(p - meanPrice, 2), 0) / n);
    const cv = (stdPrice / meanPrice) * 100; // Coefficiente di variazione %
    
    // Previsione prossimo periodo
    const nextPredicted = a + b * (n + 1);
    const predictedChangePerc = ((nextPredicted - lastPrice) / lastPrice) * 100;
    
    // Valutazione nuovo prezzo se presente
    let newPriceEval = null;
    if (newPrice !== null) {
      const diffFromPredicted = newPrice - nextPredicted;
      const diffPerc = (diffFromPredicted / nextPredicted) * 100;
      const sigmaDistance = Math.abs(diffFromPredicted) / (stdPrice || 1);
      
      if (sigmaDistance <= 1) {
        newPriceEval = { status: 'OK', text: 'nella norma attesa', color: 'emerald' };
      } else if (sigmaDistance <= 2) {
        newPriceEval = { status: 'ATTENZIONE', text: 'leggermente fuori dalla norma', color: 'amber' };
      } else {
        newPriceEval = { status: 'ANOMALO', text: 'significativamente anomalo', color: 'red' };
      }
      newPriceEval = { ...newPriceEval, diffPerc };
    }
    
    return {
      trendDirection,
      trendStrength,
      priceChangePerc,
      cv,
      nextPredicted,
      predictedChangePerc,
      newPriceEval,
      volatility: cv > 15 ? 'alta' : cv > 5 ? 'moderata' : 'bassa',
    };
  }, [prices, regression, newPrice]);

  // ============================================================
  // RENDERING
  // ============================================================
  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header con tooltip di aiuto */}
      <div className="flex items-center justify-between">
        <HelpTooltip content={t("charts.overlayTooltip") || "Compares historical prices with future forecasts"}>
          <h4 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {t("charts.overlayTitle") || t("charts.overlay")}
          </h4>
        </HelpTooltip>
      </div>

      {/* Descrizione breve */}
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {t("charts.overlayDescription") || "Combines historical data with future forecasts."}
      </p>

      {/* Grafico principale */}
      <div className="w-full h-[280px]">
        <Line data={data} options={options} />
      </div>

      {/* Legenda esplicativa delle bande con tooltip */}
      <div className="flex flex-wrap gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-blue-500"></span>
          <span>{t("charts.historicalData") || "Storico"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
          <span>{t("charts.historicalTrendLabel") || "Trend"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-violet-500"></span>
          <span>{t("charts.forecast") || "Previsione"}</span>
        </div>
        <HelpTooltip content={t("charts.band1SigmaExplanation") || "68% probability"} position="bottom">
          <div className="flex items-center gap-1.5 cursor-help">
            <span className="w-3 h-3 rounded-sm bg-emerald-500/30"></span>
            <span>{t("charts.sigma1")}</span>
          </div>
        </HelpTooltip>
        <HelpTooltip content={t("charts.band2SigmaExplanation") || "95% probability"} position="bottom">
          <div className="flex items-center gap-1.5 cursor-help">
            <span className="w-3 h-3 rounded-sm bg-amber-500/30"></span>
            <span>{t("charts.sigma2")}</span>
          </div>
        </HelpTooltip>
        <HelpTooltip content={t("charts.band3SigmaExplanation") || "99.7% probability"} position="bottom">
          <div className="flex items-center gap-1.5 cursor-help">
            <span className="w-3 h-3 rounded-sm bg-red-500/20"></span>
            <span>{t("charts.sigma3")}</span>
          </div>
        </HelpTooltip>
      </div>

      {/* Info sul nuovo prezzo se presente */}
      {newPrice !== null && (
        <div className="flex items-center gap-2 text-xs p-2 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
          <span className="w-3 h-0.5 bg-orange-500"></span>
          <span>
            <span className="font-medium">{t("charts.newPrice")}: {newPrice.toFixed(2)}</span>
            {" "}— {t("charts.newPriceCompared")}
          </span>
        </div>
      )}

      {/* Nota tecnica con tooltip */}
      <HelpTooltip content={t("charts.sigmaExplanation") || "Sigma represents the standard deviation of historical prediction errors"} position="top">
        <p className="text-xs text-zinc-400 dark:text-zinc-500 italic cursor-help">
          σ ({t("charts.sigmaStdError")}) = {sigma.toFixed(2)} | 
          {t("charts.historicalData")}: {n} {t("charts.periods")} | 
          {t("charts.forecast")}: {futurePoints} {t("charts.futurePeriods")}
        </p>
      </HelpTooltip>

      {/* Interpretazione automatica dei dati */}
      {interpretation && (
        <div className="mt-2 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-zinc-50 dark:from-slate-900/50 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-700">
          <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
            {t("charts.analysisInterpretation")}
          </h4>
          <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5">
            <li>
              <span className="font-medium">{t("charts.historicalTrendLabel")}:</span>{' '}
              <span className={interpretation.trendDirection === 'crescente' || interpretation.trendDirection === 'increasing' ? 'text-red-600 dark:text-red-400' : interpretation.trendDirection === 'decrescente' || interpretation.trendDirection === 'decreasing' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-600'}>
                {language === 'it' 
                  ? (interpretation.trendDirection === 'crescente' ? t("charts.trendIncreasing") : interpretation.trendDirection === 'decrescente' ? t("charts.trendDecreasing") : t("charts.trendStable"))
                  : (interpretation.trendDirection === 'increasing' ? t("charts.trendIncreasing") : interpretation.trendDirection === 'decreasing' ? t("charts.trendDecreasing") : t("charts.trendStable"))
                }
              </span>
              {' '}({interpretation.priceChangePerc >= 0 ? '+' : ''}{interpretation.priceChangePerc.toFixed(1)}% {t("charts.inAnalyzedPeriod")})
            </li>
            <li>
              <span className="font-medium">{t("charts.priceVolatility")}:</span>{' '}
              <span className={interpretation.volatility === 'alta' || interpretation.volatility === 'high' ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-600 dark:text-zinc-400'}>
                {language === 'it'
                  ? (interpretation.volatility === 'alta' ? t("charts.high") : interpretation.volatility === 'media' ? t("charts.medium") : t("charts.low"))
                  : (interpretation.volatility === 'high' ? t("charts.high") : interpretation.volatility === 'medium' ? t("charts.medium") : t("charts.low"))
                }
              </span>
              {' '}(CV: {interpretation.cv.toFixed(1)}%)
            </li>
            <li>
              <span className="font-medium">{t("charts.nextPeriodForecast")}:</span>{' '}
              <span className="font-semibold">{interpretation.nextPredicted.toFixed(2)}</span>
              {' '}({interpretation.predictedChangePerc >= 0 ? '+' : ''}{interpretation.predictedChangePerc.toFixed(1)}% {t("charts.vsLastPrice")})
            </li>
            {interpretation.newPriceEval && (
              <li className={`mt-2 p-2 rounded ${
                interpretation.newPriceEval.color === 'emerald' 
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : interpretation.newPriceEval.color === 'amber'
                  ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                  : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}>
                <span className="font-semibold">{interpretation.newPriceEval.status}:</span>{' '}
                {t("charts.theNewPrice")} ({newPrice?.toFixed(2)}) {interpretation.newPriceEval.text}
                {' '}({interpretation.newPriceEval.diffPerc >= 0 ? '+' : ''}{interpretation.newPriceEval.diffPerc.toFixed(1)}% {t("charts.comparedToForecast")})
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Title, Tooltip, Legend);

interface OverlayHistoricalVsForecastProps {
  prices: number[];
  regression: { a: number; b: number; predicted: number } | null;
  newPrice?: number | null;
  futurePoints?: number; // Numero di periodi futuri da prevedere (default: 5)
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
}: OverlayHistoricalVsForecastProps) {
  
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

    // 6. Genera etichette per l'asse X
    const historicalLabels = prices.map((_, i) => `${i + 1}`);
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
  }, [prices, regression, futurePoints]);

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
        label: "Previsione Futura",
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
        label: "Trend Storico",
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
        label: "Prezzi Storici",
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
              label: "Nuovo Prezzo",
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
  // RENDERING
  // ============================================================
  return (
    <div className="w-full flex flex-col gap-3">
      {/* Grafico principale */}
      <div className="w-full h-[280px]">
        <Line data={data} options={options} />
      </div>

      {/* Legenda esplicativa delle bande */}
      <div className="flex flex-wrap gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-blue-500"></span>
          <span>Storico</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
          <span>Trend</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-violet-500"></span>
          <span>Previsione</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-emerald-500/30"></span>
          <span>±1σ (68%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-amber-500/30"></span>
          <span>±2σ (95%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-500/20"></span>
          <span>±3σ (99.7%)</span>
        </div>
      </div>

      {/* Info sul nuovo prezzo se presente */}
      {newPrice !== null && (
        <div className="flex items-center gap-2 text-xs p-2 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
          <span className="w-3 h-0.5 bg-orange-500"></span>
          <span>
            <span className="font-medium">Nuovo prezzo: {newPrice.toFixed(2)}</span>
            {" "}— confrontato con la previsione futura
          </span>
        </div>
      )}

      {/* Nota tecnica */}
      <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">
        σ (deviazione standard errori) = {sigma.toFixed(2)} | 
        Dati storici: {n} periodi | 
        Previsione: {futurePoints} periodi futuri
      </p>
    </div>
  );
}

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

interface ProbabilisticPriceChartProps {
  prices: number[];
  regression: { a: number; b: number; predicted: number } | null;
  newPrice?: number | null;
  futurePoints?: number; // Numero di punti futuri da prevedere (default: 5)
  dates?: string[]; // Date ISO corrispondenti ai prezzi storici
}

/**
 * ProbabilisticPriceChart
 * 
 * Visualizza le previsioni future dei prezzi con bande di confidenza gaussiane.
 * 
 * - Linea centrale: prezzo atteso dalla regressione lineare
 * - Bande colorate: intervalli di probabilità
 *   - ±1σ (68% di probabilità)
 *   - ±2σ (95% di probabilità)  
 *   - ±3σ (99.7% di probabilità)
 * - Punto/linea del nuovo prezzo se fornito
 */
export default function ProbabilisticPriceChart({
  prices,
  regression,
  newPrice = null,
  futurePoints = 5,
  dates = [],
}: ProbabilisticPriceChartProps) {
  const { t } = useLanguage();
  
  // Calcola gli errori storici e la deviazione standard
  const { sigma, predictions, labels } = useMemo(() => {
    if (!regression || prices.length < 2) {
      return { sigma: 0, predictions: [], labels: [] };
    }

    const { a, b } = regression;
    const n = prices.length;

    // Calcola errori storici: error_i = prezzo_i - (a + b * (i+1))
    const errors = prices.map((price, i) => price - (a + b * (i + 1)));

    // Calcola deviazione standard degli errori
    const meanError = errors.reduce((sum, e) => sum + e, 0) / errors.length;
    const variance = errors.reduce((sum, e) => sum + Math.pow(e - meanError, 2), 0) / errors.length;
    const sigma = Math.sqrt(variance);

    // Genera previsioni future
    const predictions: number[] = [];
    const labels: string[] = [];

    for (let i = 1; i <= futurePoints; i++) {
      const futureX = n + i;
      const predictedPrice = a + b * futureX;
      predictions.push(predictedPrice);
      labels.push(`T+${i}`);
    }

    return { sigma, predictions, labels };
  }, [prices, regression, futurePoints]);

  // Se non ci sono dati sufficienti, non renderizzare
  if (!regression || prices.length < 2 || predictions.length === 0) {
    return null;
  }

  // Costruisci le bande di confidenza
  const band1SigmaUpper = predictions.map((p) => p + sigma);
  const band1SigmaLower = predictions.map((p) => p - sigma);
  const band2SigmaUpper = predictions.map((p) => p + 2 * sigma);
  const band2SigmaLower = predictions.map((p) => p - 2 * sigma);
  const band3SigmaUpper = predictions.map((p) => p + 3 * sigma);
  const band3SigmaLower = predictions.map((p) => p - 3 * sigma);

  // Trova dove cade il newPrice rispetto alle bande (per il primo punto futuro)
  const newPricePosition = useMemo(() => {
    if (newPrice === null || predictions.length === 0) return null;
    const expected = predictions[0];
    const diff = Math.abs(newPrice - expected);
    if (diff <= sigma) return "1σ";
    if (diff <= 2 * sigma) return "2σ";
    if (diff <= 3 * sigma) return "3σ";
    return ">3σ";
  }, [newPrice, predictions, sigma]);

  const data = {
    labels,
    datasets: [
      // Banda ±3σ (sfondo più chiaro)
      {
        label: "±3σ (99.7%)",
        data: band3SigmaUpper,
        borderColor: "transparent",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: "+1",
        pointRadius: 0,
        tension: 0.1,
      },
      {
        label: "±3σ lower",
        data: band3SigmaLower,
        borderColor: "transparent",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: false,
        pointRadius: 0,
        tension: 0.1,
      },
      // Banda ±2σ
      {
        label: "±2σ (95%)",
        data: band2SigmaUpper,
        borderColor: "transparent",
        backgroundColor: "rgba(251, 191, 36, 0.15)",
        fill: "+1",
        pointRadius: 0,
        tension: 0.1,
      },
      {
        label: "±2σ lower",
        data: band2SigmaLower,
        borderColor: "transparent",
        backgroundColor: "rgba(251, 191, 36, 0.15)",
        fill: false,
        pointRadius: 0,
        tension: 0.1,
      },
      // Banda ±1σ (più scura, più probabile)
      {
        label: "±1σ (68%)",
        data: band1SigmaUpper,
        borderColor: "transparent",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        fill: "+1",
        pointRadius: 0,
        tension: 0.1,
      },
      {
        label: "±1σ lower",
        data: band1SigmaLower,
        borderColor: "transparent",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        fill: false,
        pointRadius: 0,
        tension: 0.1,
      },
      // Linea centrale (prezzo atteso)
      {
        label: t("charts.expectedPrice"),
        data: predictions,
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f6",
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: "#3b82f6",
        fill: false,
        tension: 0.1,
      },
      // Nuovo prezzo (se fornito) - linea orizzontale
      ...(newPrice !== null
        ? [
            {
              label: t("charts.newPrice"),
              data: predictions.map(() => newPrice),
              borderColor: "#f97316",
              backgroundColor: "#f97316",
              borderWidth: 2,
              borderDash: [6, 4],
              pointRadius: 0,
              fill: false,
              tension: 0,
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
          color: "rgba(0,0,0,0.05)",
        },
        ticks: {
          font: { size: 11 },
        },
      },
      y: {
        grid: {
          color: "rgba(0,0,0,0.05)",
        },
        ticks: {
          font: { size: 11 },
          callback: (value: number | string) => {
            if (typeof value === "number") {
              return value.toFixed(0);
            }
            return value;
          },
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header con tooltip di aiuto */}
      <div className="flex items-center justify-between">
        <HelpTooltip content={t("charts.probabilisticTooltip") || "Shows future scenarios with probability bands"}>
          <h4 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {t("charts.probabilisticTitle") || t("charts.probabilistic")}
          </h4>
        </HelpTooltip>
      </div>

      {/* Descrizione breve */}
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {t("charts.probabilisticDescription") || "Future price forecasts with Gaussian probability bands."}
      </p>

      {/* Chart container */}
      <div className="w-full h-[280px]">
        <Line data={data} options={options} />
      </div>

      {/* Legenda esplicativa con tooltip */}
      <div className="flex flex-wrap gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <HelpTooltip content={t("charts.band1SigmaExplanation") || "68% probability the price falls in this range"} position="bottom">
          <div className="flex items-center gap-1.5 cursor-help">
            <span className="w-3 h-3 rounded-sm bg-emerald-500/30"></span>
            <span>{t("charts.sigma1")}</span>
          </div>
        </HelpTooltip>
        <HelpTooltip content={t("charts.band2SigmaExplanation") || "95% probability the price falls in this range"} position="bottom">
          <div className="flex items-center gap-1.5 cursor-help">
            <span className="w-3 h-3 rounded-sm bg-amber-500/30"></span>
            <span>{t("charts.sigma2")}</span>
          </div>
        </HelpTooltip>
        <HelpTooltip content={t("charts.band3SigmaExplanation") || "99.7% probability the price falls in this range"} position="bottom">
          <div className="flex items-center gap-1.5 cursor-help">
            <span className="w-3 h-3 rounded-sm bg-red-500/20"></span>
            <span>{t("charts.sigma3")}</span>
          </div>
        </HelpTooltip>
      </div>

      {/* Info sul nuovo prezzo */}
      {newPrice !== null && newPricePosition && (
        <div className={`text-xs p-2 rounded-lg ${
          newPricePosition === "1σ" 
            ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
            : newPricePosition === "2σ"
            ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
            : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300"
        }`}>
          <span className="font-medium">{t("charts.newPrice")} ({newPrice.toFixed(2)})</span>
          {" "}{t("charts.newPriceInBand")} <span className="font-semibold">{newPricePosition}</span>
          {newPricePosition === "1σ" && ` — ${t("charts.highlyProbable")}`}
          {newPricePosition === "2σ" && ` — ${t("charts.moderatelyProbable")}`}
          {newPricePosition === "3σ" && ` — ${t("charts.unlikelyProbable")}`}
          {newPricePosition === ">3σ" && ` — ${t("charts.anomalyOutlier")}`}
        </div>
      )}

      {/* Nota tecnica con tooltip */}
      <HelpTooltip content={t("charts.sigmaExplanation") || "Sigma represents the standard deviation of historical prediction errors"} position="top">
        <p className="text-xs text-zinc-400 dark:text-zinc-500 italic cursor-help">
          σ = {sigma.toFixed(2)} ({t("charts.sigmaNote")})
        </p>
      </HelpTooltip>
    </div>
  );
}

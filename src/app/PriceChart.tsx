"use client";
import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface PriceChartProps {
  prices: number[];
  regression: { a: number; b: number; predicted: number } | null;
  newPrice: number | null;
  isNewPriceOutlier?: boolean;
  dates?: string[]; // ISO date strings corresponding to each historic price
}

function getStdDev(arr: number[]) {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const sqDiffs = arr.map((v) => (v - mean) ** 2);
  const stdDev = Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / arr.length);
  return stdDev;
}

export default function PriceChart({ prices, regression, newPrice, isNewPriceOutlier = false, dates = [] }: PriceChartProps) {
  const n = prices.length;
  const labels = Array.from({ length: n + 1 }, (_, i) => (i + 1).toString());
  // Serie storica
  const priceData = [...prices, null];
  // Retta di regressione
  const regressionLine = regression
    ? Array.from({ length: n + 1 }, (_, i) => regression.a + regression.b * (i + 1))
    : [];
  // +5% e -5% rispetto alla retta di regressione
  const regressionPlus5 = regressionLine.map((y) => y * 1.05);
  const regressionMinus5 = regressionLine.map((y) => y * 0.95);
  // Punto prezzo atteso (regressione lineare)
  const expectedPriceData = regression ? Array(n).fill(null).concat([regression.predicted]) : [];
  // Punto nuovo prezzo offerto
  const newPriceData = Array(n).fill(null).concat(newPrice !== null ? [newPrice] : [null]);
  // Linea di collegamento tra prezzo atteso e prezzo offerto
  const connectionData = (regression && newPrice !== null)
    ? Array(n).fill(null).concat([regression.predicted, newPrice])
    : [];
  // Calcolo differenziale
  const diffAbs = regression && newPrice !== null ? newPrice - regression.predicted : null;
  const diffPerc = regression && newPrice !== null ? ((newPrice - regression.predicted) / regression.predicted) * 100 : null;

  const data = {
    labels,
    datasets: [
      {
        label: "Storico prezzi",
        data: priceData,
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f6",
        pointRadius: 4,
        fill: false,
        tension: 0.1,
      },
      {
        label: "Retta regressione",
        data: regressionLine,
        borderColor: "#22c55e",
        borderDash: [8, 4],
        pointRadius: 0,
        fill: false,
        tension: 0.1,
      },
      {
        label: "+5% regressione",
        data: regressionPlus5,
        borderColor: "#f59e42",
        borderDash: [2, 4],
        pointRadius: 0,
        fill: false,
        tension: 0.1,
      },
      {
        label: "-5% regressione",
        data: regressionMinus5,
        borderColor: "#f59e42",
        borderDash: [2, 4],
        pointRadius: 0,
        fill: false,
        tension: 0.1,
      },
      {
        label: "Prezzo atteso secondo trend storico",
        data: expectedPriceData,
        borderColor: "#eab308",
        backgroundColor: "#eab308",
        pointRadius: 8,
        pointStyle: "rectRot",
        fill: false,
        showLine: false,
      },
      {
        label: isNewPriceOutlier ? "Prezzo offerto (OUTLIER)" : "Prezzo offerto",
        data: newPriceData,
        borderColor: isNewPriceOutlier ? "#dc2626" : "#22c55e",
        backgroundColor: isNewPriceOutlier ? "#dc2626" : "#22c55e",
        pointRadius: isNewPriceOutlier ? 12 : 8,
        pointStyle: isNewPriceOutlier ? "crossRot" : "triangle",
        fill: false,
        showLine: false,
      },
      // Linea di collegamento corretta tra prezzo atteso e prezzo offerto
      ...(regression && newPrice !== null
        ? [{
            label: "Differenziale",
            data: Array(n).fill(null).concat([regression.predicted, newPrice]),
            borderColor: isNewPriceOutlier ? "#dc2626" : "#a855f7",
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            showLine: true,
            spanGaps: true, // collega solo i due punti
            segment: {
              borderDash: [2, 2],
            },
          }]
        : []),
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          boxWidth: 18,
          boxHeight: 10,
          font: { size: 13 },
          padding: 12,
        },
        align: "center" as const,
        display: true,
        fullSize: true,
        maxHeight: 80,
        maxWidth: 800,
      },
      title: { display: true, text: "Andamento prezzi e previsione" },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context: any) {
            const label = context.dataset.label;
            const value = context.parsed.y;
            const idx = context.dataIndex;
            const dateStr = Array.isArray(dates) && dates[idx] ? dates[idx] : null;
            const formattedValue = (typeof value === 'number') ? value.toFixed(2) : value;

            if (label === "Differenziale" && diffAbs !== null && diffPerc !== null) {
              return `Differenziale: ${diffAbs.toFixed(2)} (${diffPerc.toFixed(2)}%)`;
            }

            if (dateStr) {
              const d = new Date(dateStr);
              const formattedDate = isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('it-IT');
              if (label === "Storico prezzi") {
                return [`Storico prezzi: ${formattedValue}`, `Data: ${formattedDate}`];
              }
              if (label === "Retta regressione") {
                return [`Retta regressione: ${formattedValue}`, `Data: ${formattedDate}`];
              }
            }

            return `${label}: ${formattedValue}`;
          },
        },
      },
    },
    layout: {
      padding: { top: 30, right: 30, bottom: 30, left: 30 },
    },
    scales: {
      x: {
        title: { display: true, text: "Periodo" },
        grid: { display: true, color: "#e5e7eb" },
        ticks: { font: { size: 16 } },
      },
      y: {
        title: { display: true, text: "Prezzo" },
        grid: { display: true, color: "#e5e7eb" },
        ticks: { font: { size: 16 } },
        beginAtZero: false,
        min: Math.floor(Math.min(...prices, ...(newPrice !== null ? [newPrice] : []), ...(regression ? [regression.predicted * 0.95] : []))),
        max: Math.ceil(Math.max(...prices, ...(newPrice !== null ? [newPrice] : []), ...(regression ? [regression.predicted * 1.05] : [])) * 1.1),
      },
    },
    elements: {
      line: {
        borderWidth: 3,
      },
      point: {
        borderWidth: 2,
      },
    },
  };

  return (
    <div className="mt-12 floating-chart flex flex-col items-center w-full max-w-4xl mx-auto">
      <div style={{ width: "100%", maxWidth: 900, height: 500 }}>
        <Line data={data} options={options} />
      </div>
      {regression && newPrice !== null && (
        <div className="text-center mt-4 text-white font-semibold text-lg">
          Differenziale: <span>{diffAbs?.toFixed(2)} ({diffPerc?.toFixed(2)}%)</span>
        </div>
      )}
      <p className="mt-6 text-xs text-zinc-400 dark:text-zinc-500 text-center max-w-lg italic">
        Il modello utilizza una regressione lineare sui dati storici forniti. I risultati sono indicativi e non costituiscono previsione certa.
      </p>
    </div>
  );
}

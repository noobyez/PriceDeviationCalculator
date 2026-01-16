"use client";
import React, { useMemo } from "react";
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
  Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface PriceChartProps {
  prices: number[];
  regression: { a: number; b: number; predicted: number } | null;
  newPrice: number | null;
  isNewPriceOutlier?: boolean;
  dates?: string[]; // ISO date strings corresponding to each historic price
}

export default function PriceChart({ prices, regression, newPrice, isNewPriceOutlier = false, dates = [] }: PriceChartProps) {
  const n = prices.length;
  
  // Calcola dati derivati
  const chartData = useMemo(() => {
    // Labels con date formattate se disponibili
    const labels = Array.from({ length: n + 1 }, (_, i) => {
      if (i < n && dates[i]) {
        const d = new Date(dates[i]);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('it-IT', { month: 'short', year: '2-digit' });
        }
      }
      return i < n ? `${i + 1}` : 'Prev';
    });

    // Serie storica
    const priceData = [...prices, null];
    
    // Retta di regressione
    const regressionLine = regression
      ? Array.from({ length: n + 1 }, (_, i) => regression.a + regression.b * (i + 1))
      : [];
    
    // Banda ±5% (area tra +5% e -5%)
    const regressionPlus5 = regressionLine.map((y) => y * 1.05);
    const regressionMinus5 = regressionLine.map((y) => y * 0.95);
    
    // Punto prezzo atteso
    const expectedPriceData = regression ? Array(n).fill(null).concat([regression.predicted]) : [];
    
    // Punto nuovo prezzo offerto
    const newPriceData = Array(n).fill(null).concat(newPrice !== null ? [newPrice] : [null]);

    return {
      labels,
      priceData,
      regressionLine,
      regressionPlus5,
      regressionMinus5,
      expectedPriceData,
      newPriceData,
    };
  }, [prices, regression, newPrice, dates, n]);

  // Calcolo differenziale
  const diffAbs = regression && newPrice !== null ? newPrice - regression.predicted : null;
  const diffPerc = regression && newPrice !== null ? ((newPrice - regression.predicted) / regression.predicted) * 100 : null;

  // Configurazione colori più eleganti
  const colors = {
    primary: '#3b82f6',        // Blue per storico
    primaryLight: 'rgba(59, 130, 246, 0.1)',
    regression: '#10b981',     // Emerald per regressione
    band: 'rgba(251, 191, 36, 0.15)', // Amber trasparente per banda
    bandBorder: 'rgba(251, 191, 36, 0.4)',
    expected: '#8b5cf6',       // Violet per prezzo atteso
    newPriceOk: '#10b981',     // Emerald per prezzo ok
    newPriceOutlier: '#ef4444', // Red per outlier
    grid: 'rgba(0, 0, 0, 0.04)',
    gridDark: 'rgba(255, 255, 255, 0.06)',
  };

  const data = {
    labels: chartData.labels,
    datasets: [
      // Banda ±5% (area riempita)
      {
        label: "Banda ±5%",
        data: chartData.regressionPlus5,
        borderColor: colors.bandBorder,
        backgroundColor: colors.band,
        borderWidth: 1,
        borderDash: [4, 4],
        pointRadius: 0,
        fill: '+1',
        tension: 0,
        order: 5,
      },
      {
        label: "Banda -5%",
        data: chartData.regressionMinus5,
        borderColor: colors.bandBorder,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
        tension: 0,
        order: 6,
      },
      // Retta di regressione (trend)
      {
        label: "Trend (regressione)",
        data: chartData.regressionLine,
        borderColor: colors.regression,
        backgroundColor: colors.regression,
        borderWidth: 2.5,
        borderDash: [8, 4],
        pointRadius: 0,
        fill: false,
        tension: 0,
        order: 3,
      },
      // Serie storica prezzi
      {
        label: "Prezzi storici",
        data: chartData.priceData,
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight,
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 9,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: colors.primary,
        pointBorderWidth: 2.5,
        pointHoverBackgroundColor: colors.primary,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
        fill: false,
        tension: 0.2,
        order: 1,
      },
      // Prezzo atteso (punto singolo)
      ...(regression ? [{
        label: "Prezzo atteso",
        data: chartData.expectedPriceData,
        borderColor: colors.expected,
        backgroundColor: colors.expected,
        pointRadius: 10,
        pointHoverRadius: 13,
        pointStyle: 'rectRot' as const,
        pointBorderWidth: 0,
        fill: false,
        showLine: false,
        order: 2,
      }] : []),
      // Nuovo prezzo offerto (punto singolo)
      ...(newPrice !== null ? [{
        label: isNewPriceOutlier ? "Prezzo offerto ⚠️" : "Prezzo offerto",
        data: chartData.newPriceData,
        borderColor: isNewPriceOutlier ? colors.newPriceOutlier : colors.newPriceOk,
        backgroundColor: isNewPriceOutlier ? colors.newPriceOutlier : colors.newPriceOk,
        pointRadius: isNewPriceOutlier ? 12 : 10,
        pointHoverRadius: 15,
        pointStyle: isNewPriceOutlier ? 'crossRot' as const : 'triangle' as const,
        pointBorderWidth: 0,
        fill: false,
        showLine: false,
        order: 0,
      }] : []),
      // Linea di collegamento tra prezzo atteso e nuovo prezzo
      ...(regression && newPrice !== null ? [{
        label: "Scostamento",
        data: Array(n).fill(null).concat([regression.predicted, newPrice]),
        borderColor: isNewPriceOutlier ? 'rgba(239, 68, 68, 0.6)' : 'rgba(139, 92, 246, 0.6)',
        borderWidth: 2,
        borderDash: [3, 3],
        pointRadius: 0,
        fill: false,
        showLine: true,
        spanGaps: true,
        order: 4,
      }] : []),
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        align: "center" as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          boxHeight: 8,
          padding: 16,
          font: { 
            size: 11,
            family: 'system-ui, -apple-system, sans-serif',
          },
          color: '#71717a',
          filter: (item: { text: string }) => {
            // Nascondi label duplicate
            return !item.text.includes("-5%") && !item.text.includes("Scostamento");
          },
        },
      },
      title: { 
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#18181b',
        bodyColor: '#3f3f46',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: {
          size: 13,
          weight: 600,
        },
        bodyFont: {
          size: 12,
        },
        callbacks: {
          title: (tooltipItems: { dataIndex: number }[]) => {
            const idx = tooltipItems[0]?.dataIndex;
            if (idx === undefined) return '';
            if (idx < n && dates[idx]) {
              const d = new Date(dates[idx]);
              if (!isNaN(d.getTime())) {
                return d.toLocaleDateString('it-IT', { 
                  day: 'numeric',
                  month: 'long', 
                  year: 'numeric' 
                });
              }
            }
            return idx < n ? `Periodo ${idx + 1}` : 'Previsione';
          },
          label: (context: { dataset: { label?: string }; parsed: { y: number | null } }) => {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            
            if (value === null) return '';
            if (label.includes("-5%")) return '';
            
            const formattedValue = typeof value === 'number' ? `€ ${value.toFixed(2)}` : value;
            
            if (label === "Scostamento" && diffAbs !== null && diffPerc !== null) {
              const sign = diffPerc >= 0 ? '+' : '';
              return `Δ ${sign}${diffAbs.toFixed(2)} (${sign}${diffPerc.toFixed(1)}%)`;
            }
            
            return `${label}: ${formattedValue}`;
          },
        },
      },
    },
    layout: {
      padding: { top: 10, right: 16, bottom: 10, left: 10 },
    },
    scales: {
      x: {
        grid: { 
          display: true, 
          color: colors.grid,
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: { 
          font: { size: 10, family: 'system-ui, -apple-system, sans-serif' },
          color: '#a1a1aa',
          maxRotation: 45,
          minRotation: 0,
        },
        title: { 
          display: true, 
          text: "Periodo",
          font: { size: 11, weight: 500 },
          color: '#71717a',
          padding: { top: 8 },
        },
      },
      y: {
        grid: { 
          display: true, 
          color: colors.grid,
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: { 
          font: { size: 10, family: 'system-ui, -apple-system, sans-serif' },
          color: '#a1a1aa',
          callback: (value: number | string) => {
            if (typeof value === 'number') {
              return `€${value.toFixed(0)}`;
            }
            return value;
          },
          padding: 8,
        },
        title: { 
          display: true, 
          text: "Prezzo (€)",
          font: { size: 11, weight: 500 },
          color: '#71717a',
          padding: { bottom: 8 },
        },
        beginAtZero: false,
        grace: '10%',
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
    elements: {
      line: {
        borderCapStyle: 'round' as const,
        borderJoinStyle: 'round' as const,
      },
    },
  };

  return (
    <div className="flex flex-col w-full h-full min-h-0 gap-3">
      {/* Grafico principale */}
      <div className="flex-1 min-h-0" style={{ minHeight: '300px' }}>
        <Line data={data} options={options} />
      </div>
      
      {/* Card riepilogo differenziale */}
      {regression && newPrice !== null && (
        <div className={`flex items-center justify-between p-3 rounded-lg ${
          isNewPriceOutlier 
            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
            : Math.abs(diffPerc || 0) <= 2
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isNewPriceOutlier 
                ? 'bg-red-100 dark:bg-red-800' 
                : Math.abs(diffPerc || 0) <= 2
                  ? 'bg-emerald-100 dark:bg-emerald-800'
                  : 'bg-amber-100 dark:bg-amber-800'
            }`}>
              {isNewPriceOutlier ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 dark:text-red-300">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                  <path d="M12 9v4"/><path d="M12 17h.01"/>
                </svg>
              ) : Math.abs(diffPerc || 0) <= 2 ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 dark:text-emerald-300">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 dark:text-amber-300">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>
                </svg>
              )}
            </div>
            <div>
              <p className={`text-sm font-medium ${
                isNewPriceOutlier 
                  ? 'text-red-800 dark:text-red-200' 
                  : Math.abs(diffPerc || 0) <= 2
                    ? 'text-emerald-800 dark:text-emerald-200'
                    : 'text-amber-800 dark:text-amber-200'
              }`}>
                {isNewPriceOutlier ? 'Prezzo Anomalo' : Math.abs(diffPerc || 0) <= 2 ? 'Prezzo nella norma' : 'Scostamento moderato'}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Atteso: €{regression.predicted.toFixed(2)} → Offerto: €{newPrice.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-xl font-bold tabular-nums ${
              isNewPriceOutlier 
                ? 'text-red-600 dark:text-red-400' 
                : (diffPerc || 0) > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {(diffPerc || 0) >= 0 ? '+' : ''}{diffPerc?.toFixed(1)}%
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
              {(diffAbs || 0) >= 0 ? '+' : ''}€{diffAbs?.toFixed(2)}
            </p>
          </div>
        </div>
      )}
      
      {/* Nota disclaimer */}
      <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
        Regressione lineare sui dati storici • I risultati sono indicativi
      </p>
    </div>
  );
}

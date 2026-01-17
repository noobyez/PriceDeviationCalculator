/**
 * ItemComparisonDashboard - Dashboard for comparing two items side by side
 * Shows overlaid price charts and correlation analysis
 */
"use client";
import React, { useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from "chart.js";
import { useLanguage } from "@/i18n";
import { GroupedPurchaseData } from "@/models/Purchase";
import {
  alignItemsByDate,
  calculateItemCorrelation,
  calculateRollingCorrelation,
  ItemCorrelationResult
} from "@/utils/multiItemUtils";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

interface ItemComparisonDashboardProps {
  groupedData: GroupedPurchaseData;
}

export default function ItemComparisonDashboard({
  groupedData
}: ItemComparisonDashboardProps) {
  const { t } = useLanguage();
  const { items } = groupedData;

  // State for selected items
  const [itemA, setItemA] = useState<string>(items[0] || "");
  const [itemB, setItemB] = useState<string>(items[1] || items[0] || "");

  // Aligned data for comparison
  const alignedData = useMemo(() => {
    if (!itemA || !itemB || itemA === itemB) return null;
    return alignItemsByDate(groupedData, itemA, itemB);
  }, [groupedData, itemA, itemB]);

  // Correlation calculation
  const correlation = useMemo((): ItemCorrelationResult | null => {
    if (!itemA || !itemB || itemA === itemB) return null;
    return calculateItemCorrelation(groupedData, itemA, itemB);
  }, [groupedData, itemA, itemB]);

  // Rolling correlation
  const rollingCorr = useMemo(() => {
    if (!itemA || !itemB || itemA === itemB) return [];
    return calculateRollingCorrelation(groupedData, itemA, itemB, 5);
  }, [groupedData, itemA, itemB]);

  // Chart data for price comparison
  const priceChartData = useMemo(() => {
    if (!alignedData || alignedData.commonDates.length === 0) return null;

    return {
      labels: alignedData.commonDates.map(d => {
        const date = new Date(d);
        return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
      }),
      datasets: [
        {
          label: itemA,
          data: alignedData.pricesA,
          borderColor: 'rgb(59, 130, 246)', // Blue
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: 0.3,
          fill: false,
        },
        {
          label: itemB,
          data: alignedData.pricesB,
          borderColor: 'rgb(16, 185, 129)', // Emerald
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: 0.3,
          fill: false,
        },
      ],
    };
  }, [alignedData, itemA, itemB]);

  // Chart data for rolling correlation
  const corrChartData = useMemo(() => {
    if (rollingCorr.length === 0) return null;

    return {
      labels: rollingCorr.map(r => {
        const date = new Date(r.date);
        return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
      }),
      datasets: [
        {
          label: t("itemComparison.rollingCorrelation") || "Rolling Correlation",
          data: rollingCorr.map(r => r.correlation),
          borderColor: 'rgb(139, 92, 246)', // Violet
          backgroundColor: 'rgba(139, 92, 246, 0.2)',
          borderWidth: 2,
          pointRadius: 2,
          tension: 0.3,
          fill: true,
        },
      ],
    };
  }, [rollingCorr, t]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
  };

  const corrChartOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        min: -1,
        max: 1,
        ticks: {
          callback: (value: number | string) => `${Number(value).toFixed(1)}`,
        },
      },
    },
  };

  // Get correlation strength color
  const getCorrelationColor = (corr: ItemCorrelationResult | null) => {
    if (!corr) return 'text-zinc-400';
    if (corr.strength === 'strong') return corr.direction === 'positive' ? 'text-emerald-500' : 'text-red-500';
    if (corr.strength === 'moderate') return corr.direction === 'positive' ? 'text-amber-500' : 'text-orange-500';
    return 'text-zinc-500';
  };

  // If not enough items for comparison
  if (items.length < 2) {
    return (
      <div className="p-6 text-center bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
        <svg className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-zinc-500 dark:text-zinc-400">
          {t("itemComparison.needMultipleItems") || "Upload a dataset with multiple items to enable comparison"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Item Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {t("itemComparison.itemA") || "Item A"}
          </label>
          <select
            value={itemA}
            onChange={(e) => setItemA(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-blue-200 dark:border-blue-700 
                       bg-blue-50 dark:bg-blue-900/30 text-zinc-800 dark:text-zinc-200
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {items.map((item) => (
              <option key={item} value={item} disabled={item === itemB}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {t("itemComparison.itemB") || "Item B"}
          </label>
          <select
            value={itemB}
            onChange={(e) => setItemB(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-emerald-200 dark:border-emerald-700 
                       bg-emerald-50 dark:bg-emerald-900/30 text-zinc-800 dark:text-zinc-200
                       focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {items.map((item) => (
              <option key={item} value={item} disabled={item === itemA}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Warning if same item selected */}
      {itemA === itemB && (
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            {t("itemComparison.selectDifferentItems") || "Please select two different items for comparison"}
          </p>
        </div>
      )}

      {/* Correlation Summary */}
      {correlation && (
        <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border border-violet-100 dark:border-violet-800/30">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t("itemComparison.correlationTitle") || "Price Correlation"}
              </h4>
              <div className="flex items-center gap-3">
                <span className={`text-3xl font-bold ${getCorrelationColor(correlation)}`}>
                  {(correlation.correlation * 100).toFixed(1)}%
                </span>
                <div className="flex flex-col">
                  <span className={`text-sm font-medium ${getCorrelationColor(correlation)}`}>
                    {t(`itemComparison.${correlation.strength}`) || correlation.strength}
                    {' '}
                    {t(`itemComparison.${correlation.direction}`) || correlation.direction}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {correlation.commonDates} {t("itemComparison.commonDataPoints") || "common data points"}
                  </span>
                </div>
              </div>
            </div>
            
            {correlation.isSignificant && (
              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  {t("itemComparison.significant") || "Significant"}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No common data warning */}
      {itemA !== itemB && !alignedData?.commonDates.length && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-400">
            {t("itemComparison.noCommonDates") || "No common dates found between selected items"}
          </p>
        </div>
      )}

      {/* Price Comparison Chart */}
      {priceChartData && (
        <div className="bg-white dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700">
          <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
            {t("itemComparison.priceComparison") || "Price Comparison Over Time"}
          </h4>
          <div className="h-[300px]">
            <Line data={priceChartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Rolling Correlation Chart */}
      {corrChartData && rollingCorr.length >= 3 && (
        <div className="bg-white dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700">
          <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
            {t("itemComparison.correlationOverTime") || "Correlation Over Time (5-point window)"}
          </h4>
          <div className="h-[200px]">
            <Line data={corrChartData} options={corrChartOptions} />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 italic">
            {t("itemComparison.correlationNote") || "Values near +1 indicate prices move together, values near -1 indicate inverse movement"}
          </p>
        </div>
      )}
    </div>
  );
}

// StatisticsPanel.tsx
"use client";
import React from "react";
import { TooltipSimple } from "./components/help";
import { useLanguage } from "@/i18n";

interface StatisticsPanelProps {
  prices: number[];
}

// Descrizioni per tooltip
const statDescriptions: Record<string, string> = {
  "Media": "Prezzo medio pagato nel periodo selezionato",
  "Mediana": "Valore centrale: metà dei prezzi sono sopra, metà sotto",
  "Dev. Std": "Misura quanto i prezzi variano dalla media (più alto = più instabile)",
  "Min": "Prezzo più basso pagato nel periodo",
  "Max": "Prezzo più alto pagato nel periodo",
  "Q1": "25% dei prezzi sono sotto questo valore",
  "Q3": "75% dei prezzi sono sotto questo valore",
  "IQR": "Range tra Q1 e Q3: indica la dispersione centrale dei prezzi",
  "Varianza": "Misura statistica della variabilità dei prezzi",
};

function mean(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function median(arr: number[]) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function std(arr: number[]) {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((acc, val) => acc + (val - m) ** 2, 0) / arr.length);
}

function variance(arr: number[]) {
  const m = mean(arr);
  return arr.reduce((acc, val) => acc + (val - m) ** 2, 0) / arr.length;
}

function min(arr: number[]) {
  return Math.min(...arr);
}

function max(arr: number[]) {
  return Math.max(...arr);
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

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ prices }) => {
  const { t } = useLanguage();
  const m = mean(prices);
  const med = median(prices);
  const s = std(prices);
  const v = variance(prices);
  const minVal = min(prices);
  const maxVal = max(prices);
  const { q1, q3 } = quartiles(prices);
  const iqrVal = iqr(prices);

  // Map stat keys to i18n keys
  const statConfig = [
    { key: 'mean', label: t("statistics.mean"), desc: t("statistics.meanDesc"), value: m.toFixed(2) },
    { key: 'median', label: t("statistics.median"), desc: t("statistics.medianDesc"), value: med.toFixed(2) },
    { key: 'stdDev', label: t("statistics.stdDev"), desc: t("statistics.stdDevDesc"), value: s.toFixed(2) },
    { key: 'min', label: t("statistics.min"), desc: t("statistics.minDesc"), value: minVal.toFixed(2) },
    { key: 'max', label: t("statistics.max"), desc: t("statistics.maxDesc"), value: maxVal.toFixed(2) },
    { key: 'q1', label: t("statistics.q1"), desc: t("statistics.q1Desc"), value: q1.toFixed(2) },
    { key: 'q3', label: t("statistics.q3"), desc: t("statistics.q3Desc"), value: q3.toFixed(2) },
    { key: 'iqr', label: t("statistics.iqr"), desc: t("statistics.iqrDesc"), value: iqrVal.toFixed(2) },
    { key: 'variance', label: t("statistics.variance"), desc: t("statistics.varianceDesc"), value: v.toFixed(2) },
  ];

  const StatItem = ({ label, value, desc }: { label: string; value: string; desc: string }) => (
    <TooltipSimple content={desc} position="top">
      <div className="flex flex-col cursor-help">
        <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{label}</span>
        <span className="text-base font-semibold text-zinc-800 dark:text-zinc-100" style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      </div>
    </TooltipSimple>
  );

  return (
    <div className="w-full p-4 bg-[var(--surface)] shadow-sm rounded-xl border border-zinc-100 dark:border-zinc-800">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-3">
        {t("statistics.title")}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statConfig.map((stat) => (
          <StatItem key={stat.key} label={stat.label} value={stat.value} desc={stat.desc} />
        ))}
      </div>
    </div>
  );
};

export default StatisticsPanel;

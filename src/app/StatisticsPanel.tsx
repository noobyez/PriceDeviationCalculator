// StatisticsPanel.tsx
import React from "react";

interface StatisticsPanelProps {
  prices: number[];
}

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
  const m = mean(prices);
  const med = median(prices);
  const s = std(prices);
  const v = variance(prices);
  const minVal = min(prices);
  const maxVal = max(prices);
  const { q1, q3 } = quartiles(prices);
  const iqrVal = iqr(prices);

  return (
    <div className="w-full mt-6 mb-8 p-6 card bg-[var(--surface)] shadow-sm rounded-2xl flex flex-col gap-3">
      <div className="flex flex-wrap gap-4 justify-between">
        <div>
          <span className="font-medium">Prezzo medio:</span> {m.toFixed(2)}
        </div>
        <div>
          <span className="font-medium">Mediana:</span> {med.toFixed(2)}
        </div>
        <div>
          <span className="font-medium">Deviazione std:</span> {s.toFixed(2)}
        </div>
        <div>
          <span className="font-medium">Varianza:</span> {v.toFixed(2)}
        </div>
      </div>
      <div className="flex flex-wrap gap-4 justify-between">
        <div>
          <span className="font-medium">Min:</span> {minVal.toFixed(2)}
        </div>
        <div>
          <span className="font-medium">Max:</span> {maxVal.toFixed(2)}
        </div>
        <div>
          <span className="font-medium">Q1:</span> {q1.toFixed(2)}
        </div>
        <div>
          <span className="font-medium">Q3:</span> {q3.toFixed(2)}
        </div>
        <div>
          <span className="font-medium">IQR:</span> {iqrVal.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default StatisticsPanel;

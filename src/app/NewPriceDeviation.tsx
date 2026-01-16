"use client";
import React, { useState } from "react";
import { evaluateRdaPrice } from "../utils/rdaPriceAlert";
import StatusCard from "../components/StatusCard";
import SectionCard from "../components/SectionCard";
import { useLanguage } from "@/i18n";

interface NewPriceDeviationProps {
  prices: number[];
  isNewPriceOutlier?: boolean;
  onDeviationChange?: (price: number | null, deviation: { abs: number; perc: number } | null) => void;
  onRdaResult?: (result: { status: "OK" | "WARNING" | "ALERT"; reasons: string[]; comment?: string } | null) => void;
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

export default function NewPriceDeviation({ prices, isNewPriceOutlier = false, onDeviationChange, onRdaResult }: NewPriceDeviationProps) {
  const { t } = useLanguage();
  const [newPrice, setNewPrice] = useState<string>("");
  const [result, setResult] = useState<{ abs: number; perc: number } | null>(null);
  const [rdaPrice, setRdaPrice] = useState<string>("");
  const [rdaResult, setRdaResult] = useState<{ status: "OK" | "WARNING" | "ALERT"; reasons: string[]; comment?: string } | null>(null);
  
  const regression = linearRegression(prices);
  const prezzoAtteso = regression ? regression.predicted : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPrice(e.target.value);
    setResult(null);
    onDeviationChange?.(null, null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prezzoAtteso) return;
    const prezzo = parseFloat(newPrice.replace(",", "."));
    if (isNaN(prezzo)) return;
    const abs = prezzo - prezzoAtteso;
    const perc = ((prezzo - prezzoAtteso) / prezzoAtteso) * 100;
    setResult({ abs, perc });
    onDeviationChange?.(prezzo, { abs, perc });
  };

  const handleRdaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prezzoAtteso) return;
    const parsedRdaPrice = parseFloat(rdaPrice.replace(",", "."));
    if (isNaN(parsedRdaPrice)) {
      setRdaResult(null);
      onRdaResult?.(null);
      return;
    }
    const evalResult = evaluateRdaPrice(prices, parsedRdaPrice, prezzoAtteso);
    setRdaResult({ ...evalResult });
    onRdaResult?.({ ...evalResult });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Prezzo Atteso - Key reference point */}
      {prezzoAtteso && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
          <div className="text-xs text-blue-600 dark:text-blue-300 uppercase tracking-wide font-medium">
            {t("newPrice.expectedPriceTrend")}
          </div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-200" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {prezzoAtteso.toFixed(2)}
          </div>
        </div>
      )}

      {/* Nuovo prezzo offerto */}
      <SectionCard title={t("newPrice.offeredPrice")} compact>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="number"
            step="any"
            value={newPrice}
            onChange={handleChange}
            className="input w-full"
            placeholder={t("newPrice.inputPlaceholder")}
            required
          />
          <button type="submit" className="btn w-full">
            {t("newPrice.calculateDeviation")}
          </button>
        </form>

        {result && (
          <div className={`mt-3 p-3 rounded-lg text-sm ${isNewPriceOutlier ? "bg-red-50 dark:bg-red-900/40 text-red-800 dark:text-red-100" : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200"}`}>
            <div className="flex justify-between">
              <span>{t("newPrice.deviation")}:</span>
              <span className="font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {result.abs >= 0 ? "+" : ""}{result.abs.toFixed(2)} ({result.perc >= 0 ? "+" : ""}{result.perc.toFixed(1)}%)
              </span>
            </div>
            {isNewPriceOutlier && (
              <div className="mt-2 text-xs text-red-600 dark:text-red-300 font-medium">
                ⚠ {t("newPrice.exceedsThreshold")}
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {/* Valutazione RDA - Main decision point */}
      <SectionCard title={t("newPrice.rdaTitle")} subtitle={t("newPrice.rdaSubtitle")} compact>
        <form onSubmit={handleRdaSubmit} className="flex flex-col gap-3">
          <input
            type="number"
            step="any"
            value={rdaPrice}
            onChange={(e) => setRdaPrice(e.target.value)}
            className="input w-full"
            placeholder={t("newPrice.rdaPlaceholder")}
            required
          />
          <button type="submit" className="btn w-full">
            {t("newPrice.evaluateRda")}
          </button>
        </form>
      </SectionCard>

      {/* RDA Status - Decision-first, most prominent element */}
      {rdaResult && (
        <StatusCard
          status={rdaResult.status}
          reasons={rdaResult.reasons}
          comment={rdaResult.comment}
        />
      )}
    </div>
  );
}

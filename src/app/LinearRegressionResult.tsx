"use client";
import React from "react";
import { Tooltip } from "./components/help";
import { useLanguage } from "@/i18n";
import { RegressionMode, RegressionResult } from "@/models/Purchase";
import { calculateRegression, hasValidQuantities } from "@/utils/regression";

interface LinearRegressionResultProps {
  prices: number[];
  quantities?: number[];
  mode: RegressionMode;
  onModeChange: (mode: RegressionMode) => void;
}

export default function LinearRegressionResult({ 
  prices, 
  quantities,
  mode,
  onModeChange 
}: LinearRegressionResultProps) {
  const { t } = useLanguage();
  
  // Check if advanced mode is available (quantities present)
  const canUseAdvancedMode = hasValidQuantities(quantities);
  
  // Calculate regression based on current mode
  const result = calculateRegression(prices, mode, quantities);
  
  if (!result) return null;

  // Determine confidence level for visual feedback
  const confidenceLevel = result.r2 >= 0.7 ? 'high' : result.r2 >= 0.4 ? 'medium' : 'low';
  const confidenceColors = {
    high: 'text-emerald-600 dark:text-emerald-400',
    medium: 'text-amber-600 dark:text-amber-400',
    low: 'text-red-600 dark:text-red-400',
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Tooltip content={t("regression.titleTooltip")}>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {t("regression.title")}
          </h3>
        </Tooltip>
        
        {/* Regression Mode Selector */}
        <div className="flex items-center gap-2">
          <Tooltip content={t("regression.modeTooltip") || "Select regression mode"}>
            <select
              value={mode}
              onChange={(e) => onModeChange(e.target.value as RegressionMode)}
              className="text-xs px-2 py-1 rounded-md border border-zinc-300 dark:border-zinc-600 
                         bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!canUseAdvancedMode && mode === 'standard'}
            >
              <option value="standard">{t("regression.modeStandard") || "Standard (Time)"}</option>
              <option value="advanced" disabled={!canUseAdvancedMode}>
                {t("regression.modeAdvanced") || "Advanced (Qty + Time)"}
                {!canUseAdvancedMode && ` - ${t("regression.noQuantityData") || "No qty data"}`}
              </option>
            </select>
          </Tooltip>
        </div>
      </div>

      {/* Mode indicator badge */}
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
          ${result.mode === 'advanced' 
            ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' 
            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}
        >
          {result.mode === 'advanced' 
            ? (t("regression.advancedActive") || "Qty + Time Regression") 
            : (t("regression.standardActive") || "Time Regression")}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Tooltip content={t("regression.expectedPriceTooltip")} position="bottom">
            <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              {t("regression.expectedPrice")}
            </div>
          </Tooltip>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {result.predicted.toFixed(2)}
          </div>
        </div>
        <div>
          <Tooltip content={t("regression.confidenceTooltip")} position="bottom">
            <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              {t("regression.confidence")}
            </div>
          </Tooltip>
          <div className={`text-2xl font-bold ${confidenceColors[confidenceLevel]}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
            {(result.r2 * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Coefficients display based on mode */}
      {result.mode === 'advanced' && (
        <div className="mt-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-2">
            {t("regression.coefficients") || "Coefficients"}
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-zinc-500 dark:text-zinc-400">{t("regression.coeffQuantity") || "β Quantity"}:</span>
              <span className="ml-2 font-mono font-medium text-zinc-700 dark:text-zinc-300">
                {result.betaQuantity.toFixed(4)}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 dark:text-zinc-400">{t("regression.coeffTime") || "β Time"}:</span>
              <span className="ml-2 font-mono font-medium text-zinc-700 dark:text-zinc-300">
                {result.betaTime.toFixed(4)}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-zinc-500 dark:text-zinc-400">{t("regression.intercept") || "Intercept (α)"}:</span>
              <span className="ml-2 font-mono font-medium text-zinc-700 dark:text-zinc-300">
                {result.alpha.toFixed(4)}
              </span>
            </div>
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2 italic">
            {t("regression.avgQuantityUsed") || "Prediction uses avg qty"}: {result.avgQuantity.toFixed(2)}
          </p>
        </div>
      )}

      {result.mode === 'standard' && (
        <div className="mt-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-2">
            {t("regression.coefficients") || "Coefficients"}
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-zinc-500 dark:text-zinc-400">{t("regression.slope") || "Slope (β)"}:</span>
              <span className="ml-2 font-mono font-medium text-zinc-700 dark:text-zinc-300">
                {result.b.toFixed(4)}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 dark:text-zinc-400">{t("regression.intercept") || "Intercept (α)"}:</span>
              <span className="ml-2 font-mono font-medium text-zinc-700 dark:text-zinc-300">
                {result.a.toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
        {t("regression.confidenceDesc")}
      </p>
    </div>
  );
}

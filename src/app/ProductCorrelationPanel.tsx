"use client";
import React, { useMemo } from 'react';
import { Tooltip } from './components/help';

interface ProductCorrelationPanelProps {
  prices: number[];
  dates: string[];
}

// Calcola correlazione di Pearson tra due array
function pearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 2) return 0;
  
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
  const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  if (denominator === 0) return 0;
  return numerator / denominator;
}

// Calcola autocorrelazione (correlazione con lag)
function autoCorrelation(prices: number[], lag: number): number {
  if (prices.length <= lag) return 0;
  const x = prices.slice(0, prices.length - lag);
  const y = prices.slice(lag);
  return pearsonCorrelation(x, y);
}

// Calcola volatilità (deviazione standard percentuale)
function volatility(prices: number[]): number {
  if (prices.length < 2) return 0;
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] !== 0) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
  }
  if (returns.length === 0) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((acc, r) => acc + (r - mean) ** 2, 0) / returns.length;
  return Math.sqrt(variance) * 100; // percentuale
}

export default function ProductCorrelationPanel({ prices, dates }: ProductCorrelationPanelProps) {
  const analysis = useMemo(() => {
    if (!prices || prices.length < 5) {
      return null;
    }

    // Autocorrelazioni
    const lag1 = autoCorrelation(prices, 1);
    const lag2 = autoCorrelation(prices, 2);
    const lag3 = autoCorrelation(prices, 3);

    // Volatilità
    const vol = volatility(prices);

    // Trend strength (correlazione con indice tempo)
    const timeIndex = Array.from({ length: prices.length }, (_, i) => i);
    const trendStrength = pearsonCorrelation(timeIndex, prices);

    // Momentum (variazione media ultimi N periodi vs precedenti)
    const recentN = Math.min(5, Math.floor(prices.length / 2));
    const recentPrices = prices.slice(-recentN);
    const previousPrices = prices.slice(-recentN * 2, -recentN);
    const recentMean = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
    const previousMean = previousPrices.length > 0 
      ? previousPrices.reduce((a, b) => a + b, 0) / previousPrices.length 
      : recentMean;
    const momentum = previousMean !== 0 ? ((recentMean - previousMean) / previousMean) * 100 : 0;

    return {
      lag1,
      lag2,
      lag3,
      volatility: vol,
      trendStrength,
      momentum,
    };
  }, [prices]);

  if (!analysis) {
    return (
      <div className="text-sm text-zinc-500 dark:text-zinc-400">
        Servono almeno 5 dati per l&apos;analisi di correlazione.
      </div>
    );
  }

  const getCorrelationColor = (value: number) => {
    const abs = Math.abs(value);
    if (abs > 0.7) return 'text-emerald-600 dark:text-emerald-400';
    if (abs > 0.4) return 'text-amber-600 dark:text-amber-400';
    return 'text-zinc-500 dark:text-zinc-400';
  };

  const getCorrelationLabel = (value: number) => {
    const abs = Math.abs(value);
    if (abs > 0.7) return 'Forte';
    if (abs > 0.4) return 'Moderata';
    return 'Debole';
  };

  const getTrendIcon = (value: number) => {
    if (value > 0.3) return '📈';
    if (value < -0.3) return '📉';
    return '➡️';
  };

  return (
    <div className="space-y-4">
      {/* Autocorrelazioni */}
      <div>
        <Tooltip content="Misura quanto i prezzi seguono un pattern simile nel tempo. Valori alti indicano prezzi prevedibili.">
          <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
            Autocorrelazione
          </h4>
        </Tooltip>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Lag 1', value: analysis.lag1 },
            { label: 'Lag 2', value: analysis.lag2 },
            { label: 'Lag 3', value: analysis.lag3 },
          ].map(({ label, value }) => (
            <div key={label} className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-2 text-center">
              <p className="text-xs text-zinc-400">{label}</p>
              <p className={`text-sm font-semibold ${getCorrelationColor(value)}`}>
                {value.toFixed(3)}
              </p>
              <p className="text-[10px] text-zinc-400">{getCorrelationLabel(value)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Indicatori chiave */}
      <div className="grid grid-cols-2 gap-3">
        {/* Volatilità */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">📊</span>
            <Tooltip content="Indica quanto il prezzo è instabile nel tempo. Alta volatilità = maggiore rischio prezzo." position="right">
              <h4 className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase">
                Volatilità
              </h4>
            </Tooltip>
          </div>
          <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
            {analysis.volatility.toFixed(2)}%
          </p>
          <p className="text-[10px] text-purple-600 dark:text-purple-400">
            {analysis.volatility > 10 ? 'Alta variabilità' : analysis.volatility > 5 ? 'Media variabilità' : 'Bassa variabilità'}
          </p>
        </div>

        {/* Trend Strength */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{getTrendIcon(analysis.trendStrength)}</span>
            <Tooltip content="Mostra la direzione generale dei prezzi: rialzista (su), ribassista (giù) o stabile." position="left">
              <h4 className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase">
                Forza Trend
              </h4>
            </Tooltip>
          </div>
          <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
            {(analysis.trendStrength * 100).toFixed(1)}%
          </p>
          <p className="text-[10px] text-blue-600 dark:text-blue-400">
            {analysis.trendStrength > 0.3 ? 'Trend rialzista' : analysis.trendStrength < -0.3 ? 'Trend ribassista' : 'Nessun trend chiaro'}
          </p>
        </div>

        {/* Momentum */}
        <div className="col-span-2 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/30 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{analysis.momentum > 0 ? '🚀' : analysis.momentum < 0 ? '🔻' : '⚖️'}</span>
              <Tooltip content="Pressione recente di salita o discesa dei prezzi rispetto al periodo precedente.">
                <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase">
                  Momentum Recente
                </h4>
              </Tooltip>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${analysis.momentum > 0 ? 'text-emerald-600' : analysis.momentum < 0 ? 'text-red-600' : 'text-zinc-600'}`}>
                {analysis.momentum > 0 ? '+' : ''}{analysis.momentum.toFixed(2)}%
              </p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400">
                vs periodo precedente
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interpretazione */}
      <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3">
        <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
          💡 Interpretazione
        </h4>
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {analysis.lag1 > 0.5 && (
            <>I prezzi mostrano forte persistenza: un prezzo alto tende a seguire un altro prezzo alto. </>
          )}
          {analysis.volatility > 10 && (
            <>Elevata volatilità indica rischio prezzo significativo. </>
          )}
          {analysis.trendStrength > 0.5 && (
            <>Chiaro trend rialzista nel periodo analizzato. </>
          )}
          {analysis.trendStrength < -0.5 && (
            <>Chiaro trend ribassista nel periodo analizzato. </>
          )}
          {Math.abs(analysis.trendStrength) <= 0.3 && Math.abs(analysis.lag1) <= 0.3 && (
            <>I prezzi appaiono relativamente stabili senza trend marcati. </>
          )}
          {analysis.momentum > 5 && (
            <>Il momentum positivo suggerisce pressione rialzista recente.</>
          )}
          {analysis.momentum < -5 && (
            <>Il momentum negativo suggerisce pressione ribassista recente.</>
          )}
        </p>
      </div>
    </div>
  );
}

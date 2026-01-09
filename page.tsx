"use client";
import PriceHistoryUpload from "./PriceHistoryUpload";
import LinearRegressionResult from "./LinearRegressionResult";
import NewPriceDeviation from "./NewPriceDeviation";
import PriceChart from "./PriceChart";
import { useState } from "react";

export default function Home() {
  const [prices, setPrices] = useState<number[] | null>(null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)]">
      <main className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center">
        <h1 className="section-title mb-12">Price Deviation Calculator</h1>
        <PriceHistoryUpload onUpload={setPrices} />
        {prices && (
          <div className="card w-full max-w-xl mx-auto flex flex-col items-center">
            <h2 className="label text-lg mb-6">Storico prezzi caricato</h2>
            <div className="flex flex-wrap gap-3 text-lg mb-8">
              {prices.map((p, i) => (
                <span key={i} className="bg-zinc-100 dark:bg-zinc-800 px-4 py-1 rounded-full text-zinc-900 dark:text-zinc-100 shadow-sm font-medium" style={{fontVariantNumeric:'tabular-nums'}}>{p}</span>
              ))}
            </div>
            <div className="mt-2 mb-4 px-4 py-3 bg-blue-50/80 dark:bg-blue-900/60 rounded-lg text-blue-800 dark:text-blue-100 text-lg font-medium shadow-sm w-full text-center">
              <span className="font-medium">Media: </span>
              {(
                prices.reduce((acc, val) => acc + val, 0) / prices.length
              ).toFixed(2)}
            </div>
            <LinearRegressionResult prices={prices} />
            <NewPriceDeviation prices={prices} />
          </div>
        )}
      </main>
    </div>
  );
}

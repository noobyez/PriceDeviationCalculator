"use client";
import React, { useRef, useState } from "react";

interface PriceHistoryUploadProps {
  onUpload: (prices: number[]) => void;
}

export default function PriceHistoryUpload({ onUpload }: PriceHistoryUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    try {
      const text = await file.text();
      // Accept comma, semicolon, or newline separated values
      const prices = text
        .split(/[\n,;]+/)
        .map((v) => v.trim())
        .filter((v) => v.length > 0)
        .map(Number)
        .filter((n) => !isNaN(n));
      if (prices.length === 0) throw new Error("Nessun prezzo valido trovato nel file.");
      onUpload(prices);
    } catch (err: any) {
      setError(err.message || "Errore durante la lettura del file.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-6 card bg-[var(--surface)]">
      <label className="label text-zinc-700">Storico prezzi (CSV, TXT)</label>
      <input
        ref={fileInputRef}
        type="file"
        className="input"
        onChange={handleFileChange}
      />
      {fileName && <span className="text-zinc-500 text-sm italic">File selezionato: {fileName}</span>}
      {error && <span className="text-red-500 text-sm font-medium">{error}</span>}
    </div>
  );
}

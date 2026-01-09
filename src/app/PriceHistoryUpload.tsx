"use client";
import React, { useRef, useState, DragEvent } from "react";
import * as XLSX from "xlsx";

interface PriceHistoryUploadProps {
  onUpload: (prices: number[]) => void;
}

export default function PriceHistoryUpload({ onUpload }: PriceHistoryUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  const parseExcel = (buffer: ArrayBuffer): number[] => {
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    // Estrai tutti i numeri dal foglio (prima colonna o tutte le celle)
    const prices: number[] = [];
    for (const row of data) {
      for (const cell of row) {
        const num = typeof cell === "number" ? cell : parseFloat(String(cell).replace(",", "."));
        if (!isNaN(num)) prices.push(num);
      }
    }
    return prices;
  };

  // Funzione per estrarre testo puro da RTF
  const parseRtf = (rtfText: string): string => {
    // Rimuove i tag RTF e restituisce solo il testo
    return rtfText
      .replace(/\\par[d]?/g, "\n") // nuove righe
      .replace(/\{\*?\\[^{}]+}|[{}]|\\[A-Za-z]+\n?(?:-?\d+)?[ ]?/g, "") // rimuove comandi RTF
      .replace(/\\'([0-9a-fA-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))) // caratteri speciali
      .trim();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const processFile = async (file: File) => {
    setFileName(file.name);
    const ext = file.name.split(".").pop()?.toLowerCase();
    try {
      let prices: number[] = [];
      if (ext === "xlsx" || ext === "xls") {
        const buffer = await file.arrayBuffer();
        prices = parseExcel(buffer);
      } else if (ext === "rtf") {
        // File RTF (TextEdit Mac)
        const rtfText = await file.text();
        const plainText = parseRtf(rtfText);
        prices = plainText
          .split(/[\n,;]+/)
          .map((v) => v.trim())
          .filter((v) => v.length > 0)
          .map((v) => parseFloat(v.replace(",", ".")))
          .filter((n) => !isNaN(n));
      } else {
        // CSV, TXT o altri formati testuali
        const text = await file.text();
        prices = text
          .split(/[\n,;]+/)
          .map((v) => v.trim())
          .filter((v) => v.length > 0)
          .map((v) => parseFloat(v.replace(",", ".")))
          .filter((n) => !isNaN(n));
      }
      if (prices.length === 0) throw new Error("Nessun prezzo valido trovato nel file.");
      onUpload(prices);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Errore durante la lettura del file.");
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4 card bg-[var(--surface)]">
      <label className="label text-zinc-700">Storico prezzi (CSV, TXT, RTF, XLSX, XLS)</label>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
        className={`w-full border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
            : "border-zinc-300 dark:border-zinc-600 hover:border-blue-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt,.rtf,.xlsx,.xls,text/plain,text/csv,text/rtf,application/rtf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center gap-2">
          <svg className="w-10 h-10 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="text-zinc-600 dark:text-zinc-300 font-medium">
            {isDragging ? "Rilascia il file qui" : "Trascina un file o clicca per selezionare"}
          </span>
          <span className="text-zinc-400 text-sm">CSV, TXT, RTF, XLSX, XLS</span>
        </div>
      </div>
      {fileName && <span className="text-green-600 dark:text-green-400 text-sm font-medium">✓ File caricato: {fileName}</span>}
      {error && <span className="text-red-500 text-sm font-medium">{error}</span>}
    </div>
  );
}

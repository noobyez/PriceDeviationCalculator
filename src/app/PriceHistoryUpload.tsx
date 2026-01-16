"use client";
import React, { useRef, useState, DragEvent } from "react";
import * as XLSX from "xlsx";
import { Purchase } from "../models/Purchase"; // Importing the Purchase model

interface PriceHistoryUploadProps {
  onUpload: (purchases: Purchase[]) => void;
}

export default function PriceHistoryUpload({ onUpload }: PriceHistoryUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

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
      let purchases: Purchase[] = [];
      if (ext === "xlsx" || ext === "xls") {
        const buffer = await file.arrayBuffer();
        purchases = parseExcel(buffer);
      } else {
        const text = await file.text();
        purchases = parseTextFile(text);
      }
      if (purchases.length === 0) throw new Error("Nessun dato valido trovato nel file.");
      onUpload(purchases);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Errore durante la lettura del file.");
    }
  };

  const parseExcel = (buffer: ArrayBuffer): Purchase[] => {
    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });

    const purchases: Purchase[] = [];
    for (const row of data) {
      const quantity = typeof row[0] === "number" ? row[0] : parseFloat(String(row[0]).replace(",", "."));

      // Normalize date from different possible cell types (string, number, Date)
      let dateValue: string | null = null;
      const cell = row[1];

      if (typeof cell === "string") {
        const s = cell.trim();
        const standardized = s.replace(/\//g, "-");
        const m = standardized.match(/^(\d{1,2})-(\d{1,2})-(\d{2}|\d{4})$/);
        if (m) {
          const day = m[1].padStart(2, "0");
          const month = m[2].padStart(2, "0");
          let year = m[3];
          if (year.length === 2) year = `20${year}`;
          const iso = `${year}-${month}-${day}`; // YYYY-MM-DD
          const d = new Date(iso);
          if (!isNaN(d.getTime())) dateValue = d.toISOString();
        } else {
          const d = new Date(standardized);
          if (!isNaN(d.getTime())) dateValue = d.toISOString();
        }
      } else if (cell instanceof Date) {
        dateValue = cell.toISOString();
      } else if (typeof cell === "number") {
        // Excel stores dates as serial numbers; use XLSX utility to parse
        try {
          const dc = (XLSX as any).SSF.parse_date_code(cell);
          if (dc && dc.y) {
            const d = new Date(dc.y, dc.m - 1, dc.d);
            dateValue = d.toISOString();
          }
        } catch {
          // fallback: attempt JS conversion (most spreadsheets use 25569 offset)
          const jsDate = new Date(Math.round((cell - 25569) * 86400 * 1000));
          if (!isNaN(jsDate.getTime())) dateValue = jsDate.toISOString();
        }
      }

      if (!isNaN(quantity) && dateValue) {
        purchases.push({ price: quantity, date: dateValue });
      }
    }
    return purchases;
  };

  const parseTextFile = (text: string): Purchase[] => {
    const parseDateString = (s: string | undefined | null): string | null => {
      if (!s) return null;
      const standardized = s.trim().replace(/\//g, "-");
      const m = standardized.match(/^(\d{1,2})-(\d{1,2})-(\d{2}|\d{4})$/);
      if (m) {
        const day = m[1].padStart(2, "0");
        const month = m[2].padStart(2, "0");
        let year = m[3];
        if (year.length === 2) year = `20${year}`;
        const iso = `${year}-${month}-${day}`; // YYYY-MM-DD
        const d = new Date(iso);
        if (!isNaN(d.getTime())) return d.toISOString();
      }
      const d2 = new Date(standardized);
      if (!isNaN(d2.getTime())) return d2.toISOString();
      return null;
    };

    return text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const [quantityRaw, dateRaw] = line.split(/[,;\t]+/).map((v) => v.trim());
        const parsedQuantity = parseFloat(String(quantityRaw).replace(",", "."));
        const parsedDate = parseDateString(dateRaw);
        return !isNaN(parsedQuantity) && parsedDate ? { price: parsedQuantity, date: parsedDate } : null;
      })
      .filter((item): item is Purchase => item !== null);
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
    <div className="w-full flex flex-col gap-4 card bg-[var(--surface)]">
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

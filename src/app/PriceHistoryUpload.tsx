"use client";
import React, { useRef, useState, DragEvent } from "react";
import * as XLSX from "xlsx";
import { Purchase } from "../models/Purchase";
import { useLanguage } from "@/i18n";

interface PriceHistoryUploadProps {
  onUpload: (purchases: Purchase[]) => void;
}

export default function PriceHistoryUpload({ onUpload }: PriceHistoryUploadProps) {
  const { t } = useLanguage();
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
      if (purchases.length === 0) throw new Error(t("upload.noData"));
      onUpload(purchases);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("upload.fileError"));
    }
  };

  const parseExcel = (buffer: ArrayBuffer): Purchase[] => {
    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });

    console.log('=== EXCEL PARSER DEBUG ===');
    console.log('Total rows in Excel:', data.length);
    console.log('First 5 rows:', data.slice(0, 5));

    if (data.length === 0) return [];

    // Detect column indices from header row or use defaults
    // Supported column names (case-insensitive):
    // - Price: price, prezzo, costo, cost, amount, importo
    // - Date: date, data, datetime
    // - Quantity: quantity, qty, quantità, quantita, qta
    // - Item: item, pn, part_number, partnumber, product, prodotto, articolo, codice
    
    const firstRow = data[0];
    let priceCol = -1;
    let dateCol = -1;
    let quantityCol = -1;
    let itemCol = -1;
    let hasHeader = false;

    // Check if first row is a header
    if (firstRow && Array.isArray(firstRow)) {
      const headerCheck = firstRow.map(cell => String(cell || '').toLowerCase().trim());
      
      headerCheck.forEach((header, idx) => {
        if (priceCol === -1 && /^(price|prezzo|costo|cost|amount|importo|unit_price|unitprice)$/.test(header)) {
          priceCol = idx;
          hasHeader = true;
        }
        if (dateCol === -1 && /^(date|data|datetime|purchase_date|purchasedate|order_date)$/.test(header)) {
          dateCol = idx;
          hasHeader = true;
        }
        if (quantityCol === -1 && /^(quantity|qty|quantità|quantita|qta|amount|units)$/.test(header)) {
          quantityCol = idx;
          hasHeader = true;
        }
        if (itemCol === -1 && /^(item|pn|part_number|partnumber|product|prodotto|articolo|codice|sku|material|materiale)$/.test(header)) {
          itemCol = idx;
          hasHeader = true;
        }
      });
    }

    // If no header detected, use default column order: item, quantity, price, purchase_date
    if (!hasHeader) {
      itemCol = 0;
      quantityCol = 1;
      priceCol = 2;
      dateCol = 3;
    }

    // Ensure we have at least price and date columns
    if (priceCol === -1) priceCol = 2;
    if (dateCol === -1) dateCol = 3;

    console.log('Column mapping:', { itemCol, quantityCol, priceCol, dateCol, hasHeader });

    const purchases: Purchase[] = [];
    const startRow = hasHeader ? 1 : 0;

    for (let i = startRow; i < data.length; i++) {
      const row = data[i];
      if (!row || !Array.isArray(row)) continue;

      // Parse price - preserve full decimal precision
      const priceRaw = row[priceCol];
      const price = typeof priceRaw === "number" ? priceRaw : parseFloat(String(priceRaw || '').replace(",", "."));

      // Parse date - salva direttamente in formato DD-MM-YY
      let dateValue: string | null = null;
      let isoDate: string | null = null; // Per validazione e ordinamento
      const cell = row[dateCol];

      if (typeof cell === "string") {
        const s = cell.trim();
        const standardized = s.replace(/\//g, "-");
        // Formato DD-MM-YY o DD-MM-YYYY
        const m = standardized.match(/^(\d{1,2})-(\d{1,2})-(\d{2}|\d{4})$/);
        if (m) {
          const day = m[1].padStart(2, "0");
          const month = m[2].padStart(2, "0");
          let year = m[3];
          if (year.length === 4) year = year.slice(-2);
          dateValue = `${day}-${month}-${year}`;
          isoDate = `20${year}-${month}-${day}`;
        } else {
          // Formato ISO YYYY-MM-DD
          const isoMatch = standardized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
          if (isoMatch) {
            const year = isoMatch[1];
            const month = isoMatch[2].padStart(2, "0");
            const day = isoMatch[3].padStart(2, "0");
            dateValue = `${day}-${month}-${year.slice(-2)}`;
            isoDate = `${year}-${month}-${day}`;
          }
        }
      } else if (cell instanceof Date) {
        const year = cell.getFullYear();
        const month = String(cell.getMonth() + 1).padStart(2, "0");
        const day = String(cell.getDate()).padStart(2, "0");
        dateValue = `${day}-${month}-${String(year).slice(-2)}`;
        isoDate = `${year}-${month}-${day}`;
      } else if (typeof cell === "number") {
        // Excel stores dates as serial numbers
        try {
          const dc = (XLSX as any).SSF.parse_date_code(cell);
          if (dc && dc.y) {
            const year = dc.y;
            const month = String(dc.m).padStart(2, "0");
            const day = String(dc.d).padStart(2, "0");
            dateValue = `${day}-${month}-${String(year).slice(-2)}`;
            isoDate = `${year}-${month}-${day}`;
          }
        } catch {
          const jsDate = new Date(Math.round((cell - 25569) * 86400 * 1000));
          if (!isNaN(jsDate.getTime())) {
            const year = jsDate.getUTCFullYear();
            const month = String(jsDate.getUTCMonth() + 1).padStart(2, "0");
            const day = String(jsDate.getUTCDate()).padStart(2, "0");
            dateValue = `${day}-${month}-${String(year).slice(-2)}`;
            isoDate = `${year}-${month}-${day}`;
          }
        }
      }

      // Parse quantity (optional)
      let quantityValue: number | undefined = undefined;
      if (quantityCol >= 0 && row[quantityCol] !== undefined && row[quantityCol] !== null && row[quantityCol] !== "") {
        const qtyCell = row[quantityCol];
        const qtyRaw = typeof qtyCell === "number" ? qtyCell : parseFloat(String(qtyCell).replace(",", "."));
        if (Number.isFinite(qtyRaw) && qtyRaw >= 0) {
          quantityValue = qtyRaw;
        }
      }

      // Parse item/PN (optional)
      let itemValue: string | undefined = undefined;
      if (itemCol >= 0 && row[itemCol] !== undefined && row[itemCol] !== null && row[itemCol] !== "") {
        const itemStr = String(row[itemCol]).trim();
        if (itemStr.length > 0) {
          itemValue = itemStr;
        }
      }

      if (!isNaN(price) && dateValue) {
        purchases.push({ price, date: dateValue, quantity: quantityValue, item: itemValue });
      } else {
        console.log('Row skipped - price:', price, 'dateValue:', dateValue, 'raw row:', row);
      }
    }
    console.log('Total parsed purchases:', purchases.length);
    console.log('=== END EXCEL PARSER DEBUG ===');
    return purchases;
  };

  const parseTextFile = (text: string): Purchase[] => {
    console.log('=== TEXT PARSER DEBUG ===');
    
    // Parse date string preserving original date without timezone conversion
    const parseDateString = (s: string | undefined | null): string | null => {
      if (!s) return null;
      const standardized = s.trim().replace(/\//g, "-");
      
      // Formato DD-MM-YYYY o DD-MM-YY -> restituisce DD-MM-YY
      const m = standardized.match(/^(\d{1,2})-(\d{1,2})-(\d{2}|\d{4})$/);
      if (m) {
        const day = m[1].padStart(2, "0");
        const month = m[2].padStart(2, "0");
        let year = m[3];
        if (year.length === 4) year = year.slice(-2);
        return `${day}-${month}-${year}`;
      }
      
      // Formato YYYY-MM-DD -> restituisce DD-MM-YY
      const isoMatch = standardized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (isoMatch) {
        const year = isoMatch[1];
        const month = isoMatch[2].padStart(2, "0");
        const day = isoMatch[3].padStart(2, "0");
        return `${day}-${month}-${year.slice(-2)}`;
      }
      
      return null;
    };

    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length > 0);
    console.log('Total lines in file:', lines.length);
    console.log('First 5 lines:', lines.slice(0, 5));
    
    if (lines.length === 0) return [];

    // Detect separator and split first line for header check
    // Prefer semicolon (European CSV) over comma (may be used for decimals)
    let firstLineParts: string[];
    const firstLine = lines[0];
    if (firstLine.includes(';')) {
      firstLineParts = firstLine.split(';').map((v) => v.trim().toLowerCase());
    } else if (firstLine.includes('\t')) {
      firstLineParts = firstLine.split('\t').map((v) => v.trim().toLowerCase());
    } else {
      firstLineParts = firstLine.split(',').map((v) => v.trim().toLowerCase());
    }
    
    let priceCol = -1;
    let dateCol = -1;
    let quantityCol = -1;
    let itemCol = -1;
    let hasHeader = false;

    firstLineParts.forEach((header, idx) => {
      if (priceCol === -1 && /^(price|prezzo|costo|cost|amount|importo|unit_price|unitprice)$/.test(header)) {
        priceCol = idx;
        hasHeader = true;
      }
      if (dateCol === -1 && /^(date|data|datetime|purchase_date|purchasedate|order_date)$/.test(header)) {
        dateCol = idx;
        hasHeader = true;
      }
      if (quantityCol === -1 && /^(quantity|qty|quantità|quantita|qta|units)$/.test(header)) {
        quantityCol = idx;
        hasHeader = true;
      }
      if (itemCol === -1 && /^(item|pn|part_number|partnumber|product|prodotto|articolo|codice|sku|material|materiale)$/.test(header)) {
        itemCol = idx;
        hasHeader = true;
      }
    });

    // Default column order if no header: item, quantity, price, purchase_date
    if (!hasHeader) {
      itemCol = 0;
      quantityCol = 1;
      priceCol = 2;
      dateCol = 3;
    }

    if (priceCol === -1) priceCol = 2;
    if (dateCol === -1) dateCol = 3;

    console.log('CSV Column mapping:', { itemCol, quantityCol, priceCol, dateCol, hasHeader });

    const startIdx = hasHeader ? 1 : 0;

    const results = lines.slice(startIdx)
      .map((line, idx): Purchase | null => {
        // Detect the actual separator (semicolon or tab - NOT comma since it's used for decimals)
        // Try semicolon first (common in European CSV files)
        let parts: string[];
        if (line.includes(';')) {
          parts = line.split(';').map((v) => v.trim());
        } else if (line.includes('\t')) {
          parts = line.split('\t').map((v) => v.trim());
        } else {
          // Fallback to comma, but this may conflict with decimal separator
          parts = line.split(',').map((v) => v.trim());
        }
        
        // Parse price - replace comma with dot for decimal
        const priceRaw = parts[priceCol];
        const parsedPrice = parseFloat(String(priceRaw || '').replace(",", "."));
        
        // Parse date
        const dateRaw = parts[dateCol];
        const parsedDate = parseDateString(dateRaw);
        
        // Parse optional quantity
        let parsedQuantity: number | undefined = undefined;
        if (quantityCol >= 0 && parts[quantityCol] !== undefined && parts[quantityCol] !== "") {
          const qtyNum = parseFloat(String(parts[quantityCol]).replace(",", "."));
          if (Number.isFinite(qtyNum) && qtyNum >= 0) {
            parsedQuantity = qtyNum;
          }
        }
        
        // Parse optional item/PN
        let parsedItem: string | undefined = undefined;
        if (itemCol >= 0 && parts[itemCol] !== undefined && parts[itemCol] !== "") {
          const itemStr = String(parts[itemCol]).trim();
          if (itemStr.length > 0) {
            parsedItem = itemStr;
          }
        }
        
        if (!isNaN(parsedPrice) && parsedDate) {
          const purchase: Purchase = { price: parsedPrice, date: parsedDate };
          if (parsedQuantity !== undefined) {
            purchase.quantity = parsedQuantity;
          }
          if (parsedItem !== undefined) {
            purchase.item = parsedItem;
          }
          return purchase;
        }
        console.log(`Row ${idx} skipped - price: ${parsedPrice}, date: ${parsedDate}, parts:`, parts);
        return null;
      })
      .filter((item): item is Purchase => item !== null);
    
    console.log('Total parsed purchases:', results.length);
    console.log('=== END TEXT PARSER DEBUG ===');
    return results;
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
    <div className="w-full flex flex-col gap-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {t("upload.title")}
      </h3>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
        className={`w-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
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
          <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="text-zinc-600 dark:text-zinc-300 text-sm font-medium">
            {isDragging ? t("upload.dragDropActive") : t("upload.clickToUpload")}
          </span>
          <span className="text-zinc-400 text-xs">{t("upload.supportedFormats")}</span>
        </div>
      </div>
      {fileName && (
        <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span className="font-medium">{fileName}</span>
        </div>
      )}
      {error && <span className="text-red-500 text-sm font-medium">{error}</span>}
    </div>
  );
}

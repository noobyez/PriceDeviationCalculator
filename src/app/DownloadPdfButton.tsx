"use client";
import React from "react";
// jspdf, jspdf-autotable and html2canvas will be dynamically imported in the handler to avoid SSR/build issues

interface DownloadPdfButtonProps {
  prices: number[];
  stats: {
    mean: number;
    median: number;
    std: number;
    variance: number;
    min: number;
    max: number;
    q1: number;
    q3: number;
    iqr: number;
  };
  regression: { a: number; b: number; predicted: number; r2?: number } | null;
  newPrice: number | null;
  deviation: { abs: number; perc: number } | null;
  fromYear?: string | null;
  toYear?: string | null;
}

export default function DownloadPdfButton({
  prices,
  stats,
  regression,
  newPrice,
  deviation,
  fromYear,
  toYear,
}: DownloadPdfButtonProps) {
  const handleDownload = async () => {
    // dynamic imports to ensure these run only in the browser runtime
    const jspdfModule = await import("jspdf");
    const jsPDF = jspdfModule.jsPDF ?? jspdfModule.default;
    // load plugin and capture exported function
    const autoTableModule = await import("jspdf-autotable");
    const autoTable = (autoTableModule && (autoTableModule as any).default) || (autoTableModule as any);
    const html2canvasModule = await import("html2canvas");
    const html2canvas = html2canvasModule.default ?? html2canvasModule;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Titolo
    doc.setFontSize(20);
    doc.setTextColor(0, 122, 255);
    doc.text("Price Prediction Model Analysis", pageWidth / 2, 20, { align: "center" });

    // Data generazione
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Report generato il ${new Date().toLocaleDateString("it-IT")}`, pageWidth / 2, 28, { align: "center" });

    // Anni usati per l'analisi
    doc.setFontSize(10);
    doc.setTextColor(50);
    const yearsLabel = (fromYear && toYear) ? `${fromYear} - ${toYear}` : (fromYear ? `${fromYear} -` : (toYear ? `- ${toYear}` : "Tutti"));
    doc.text(`Anni analizzati: ${yearsLabel}`, 14, 36);

    // Statistiche
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Statistiche descrittive", 14, 46);

    autoTable(doc, {
      startY: 50,
      head: [["Metrica", "Valore"]],
      body: [
        ["Prezzo medio", stats.mean.toFixed(2)],
        ["Mediana", stats.median.toFixed(2)],
        ["Deviazione std", stats.std.toFixed(2)],
        ["Varianza", stats.variance.toFixed(2)],
        ["Min", stats.min.toFixed(2)],
        ["Max", stats.max.toFixed(2)],
        ["Q1", stats.q1.toFixed(2)],
        ["Q3", stats.q3.toFixed(2)],
        ["IQR", stats.iqr.toFixed(2)],
      ],
      theme: "striped",
      headStyles: { fillColor: [0, 122, 255] },
    });

    // Regressione
    const afterStatsY = (doc as any).lastAutoTable?.finalY ?? 110;
    doc.setFontSize(14);
    doc.text("Regressione lineare", 14, afterStatsY + 10);
    if (regression) {
      doc.setFontSize(11);
      doc.text(`Prezzo atteso (prossimo periodo): ${regression.predicted.toFixed(2)}`, 14, afterStatsY + 18);
      doc.text(`Coefficiente a: ${regression.a.toFixed(4)}`, 14, afterStatsY + 25);
      doc.text(`Coefficiente b: ${regression.b.toFixed(4)}`, 14, afterStatsY + 32);
      if (typeof regression.r2 === 'number') {
        doc.text(`Confidenza modello (R²): ${(regression.r2 * 100).toFixed(2)}%`, 14, afterStatsY + 40);
      }
    } else {
      doc.setFontSize(11);
      doc.text("Dati insufficienti per la regressione.", 14, afterStatsY + 18);
    }

    // Scostamento
    let deviationY = afterStatsY + 58;
    doc.setFontSize(14);
    doc.text("Analisi scostamento", 14, deviationY);
    if (newPrice !== null && deviation) {
      doc.setFontSize(11);
      doc.text(`Nuovo prezzo offerto: ${newPrice.toFixed(2)}`, 14, deviationY + 8);
      doc.text(`Scostamento assoluto: ${deviation.abs.toFixed(2)}`, 14, deviationY + 15);
      doc.text(`Scostamento percentuale: ${deviation.perc.toFixed(2)}%`, 14, deviationY + 22);
    } else {
      doc.setFontSize(11);
      doc.text("Nessun nuovo prezzo inserito.", 14, deviationY + 8);
    }

    // Cattura il grafico e aggiungilo al PDF
    const chartContainer = document.querySelector(".floating-chart") as HTMLElement;
    if (chartContainer) {
      try {
        const canvas = await html2canvas(chartContainer, {
          backgroundColor: "#ffffff",
          scale: 2,
        });
        const imgData = canvas.toDataURL("image/png");
        
        // Nuova pagina per il grafico
        doc.addPage();
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Grafico andamento prezzi", 14, 20);
        
        // Calcola dimensioni per adattare il grafico alla pagina
        const imgWidth = pageWidth - 28;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        doc.addImage(imgData, "PNG", 14, 28, imgWidth, imgHeight);
      } catch (err) {
        console.error("Errore nella cattura del grafico:", err);
      }
    }

    // Nuova pagina per lo storico prezzi
    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Storico prezzi", 14, 20);

    const pricesTable = prices.map((p, i) => [(i + 1).toString(), p.toFixed(2)]);
    autoTable(doc, {
      startY: 26,
      head: [["#", "Prezzo"]],
      body: pricesTable,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });

    doc.save("price_deviation_report.pdf");
  };

  return (
    <button
      type="button"
      className="w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm flex items-center justify-center gap-2"
      onClick={handleDownload}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      Scarica Report PDF
    </button>
  );
}

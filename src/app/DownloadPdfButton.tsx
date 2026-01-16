"use client";
import React from "react";
import { useLanguage } from "@/i18n";
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
  fromDate?: string | null;
  toDate?: string | null;
}

export default function DownloadPdfButton({
  prices,
  stats,
  regression,
  newPrice,
  deviation,
  fromDate,
  toDate,
}: DownloadPdfButtonProps) {
  const { t, language } = useLanguage();
  
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
    const dateLocale = language === 'it' ? 'it-IT' : 'en-US';

    // Titolo
    doc.setFontSize(20);
    doc.setTextColor(0, 122, 255);
    doc.text(t("app.title"), pageWidth / 2, 20, { align: "center" });

    // Data generazione
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${t("pdf.generatedOn")} ${new Date().toLocaleDateString(dateLocale)}`, pageWidth / 2, 28, { align: "center" });

    // Date/periodo usati per l'analisi
    doc.setFontSize(10);
    doc.setTextColor(50);
    const dateLabel = (fromDate && toDate) 
      ? `${fromDate} → ${toDate}` 
      : (fromDate 
        ? `${t("pdf.fromDate")} ${fromDate}` 
        : (toDate 
          ? `${t("pdf.toDate")} ${toDate}` 
          : t("pdf.allData")));
    doc.text(`${t("pdf.period")}: ${dateLabel}`, 14, 36);

    // Statistiche
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(t("pdf.descriptiveStats"), 14, 46);

    autoTable(doc, {
      startY: 50,
      head: [[t("pdf.metric"), t("pdf.value")]],
      body: [
        [t("pdf.averagePrice"), stats.mean.toFixed(2)],
        [t("statistics.median"), stats.median.toFixed(2)],
        [t("statistics.stdDev"), stats.std.toFixed(2)],
        [t("statistics.variance"), stats.variance.toFixed(2)],
        [t("statistics.min"), stats.min.toFixed(2)],
        [t("statistics.max"), stats.max.toFixed(2)],
        [t("statistics.q1"), stats.q1.toFixed(2)],
        [t("statistics.q3"), stats.q3.toFixed(2)],
        [t("statistics.iqr"), stats.iqr.toFixed(2)],
      ],
      theme: "striped",
      headStyles: { fillColor: [0, 122, 255] },
    });

    // Regressione
    const afterStatsY = (doc as any).lastAutoTable?.finalY ?? 110;
    doc.setFontSize(14);
    doc.text(t("pdf.linearRegression"), 14, afterStatsY + 10);
    if (regression) {
      doc.setFontSize(11);
      doc.text(`${t("pdf.expectedPriceNext")}: ${regression.predicted.toFixed(2)}`, 14, afterStatsY + 18);
      doc.text(`${t("pdf.coefficientA")}: ${regression.a.toFixed(4)}`, 14, afterStatsY + 25);
      doc.text(`${t("pdf.coefficientB")}: ${regression.b.toFixed(4)}`, 14, afterStatsY + 32);
      if (typeof regression.r2 === 'number') {
        doc.text(`${t("pdf.modelConfidence")}: ${(regression.r2 * 100).toFixed(2)}%`, 14, afterStatsY + 40);
      }
    } else {
      doc.setFontSize(11);
      doc.text(t("pdf.insufficientData"), 14, afterStatsY + 18);
    }

    // Scostamento
    let deviationY = afterStatsY + 58;
    doc.setFontSize(14);
    doc.text(t("pdf.deviationAnalysis"), 14, deviationY);
    if (newPrice !== null && deviation) {
      doc.setFontSize(11);
      doc.text(`${t("pdf.newOfferedPrice")}: ${newPrice.toFixed(2)}`, 14, deviationY + 8);
      doc.text(`${t("pdf.absoluteDeviation")}: ${deviation.abs.toFixed(2)}`, 14, deviationY + 15);
      doc.text(`${t("pdf.percentageDeviation")}: ${deviation.perc.toFixed(2)}%`, 14, deviationY + 22);
    } else {
      doc.setFontSize(11);
      doc.text(t("pdf.noNewPrice"), 14, deviationY + 8);
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
        doc.text(t("pdf.priceChartTitle"), 14, 20);
        
        // Calcola dimensioni per adattare il grafico alla pagina
        const imgWidth = pageWidth - 28;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        doc.addImage(imgData, "PNG", 14, 28, imgWidth, imgHeight);
      } catch (err) {
        console.error(t("pdf.chartCaptureError"), err);
      }
    }

    // Cattura il grafico Previsione Probabilistica
    const probabilisticChart = document.querySelector("#chart-probabilistic") as HTMLElement;
    if (probabilisticChart) {
      try {
        const canvas = await html2canvas(probabilisticChart, {
          backgroundColor: "#ffffff",
          scale: 2,
        });
        const imgData = canvas.toDataURL("image/png");
        
        doc.addPage();
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text(t("pdf.probabilisticForecast"), 14, 20);
        
        const imgWidth = pageWidth - 28;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const maxHeight = doc.internal.pageSize.getHeight() - 40;
        const finalHeight = Math.min(imgHeight, maxHeight);
        doc.addImage(imgData, "PNG", 14, 28, imgWidth, finalHeight);
      } catch (err) {
        console.error(t("pdf.chartCaptureError"), err);
      }
    }

    // Cattura il grafico Storico vs Previsione
    const overlayChart = document.querySelector("#chart-overlay") as HTMLElement;
    if (overlayChart) {
      try {
        const canvas = await html2canvas(overlayChart, {
          backgroundColor: "#ffffff",
          scale: 2,
        });
        const imgData = canvas.toDataURL("image/png");
        
        doc.addPage();
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text(t("pdf.historyVsForecast"), 14, 20);
        
        const imgWidth = pageWidth - 28;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const maxHeight = doc.internal.pageSize.getHeight() - 40;
        const finalHeight = Math.min(imgHeight, maxHeight);
        doc.addImage(imgData, "PNG", 14, 28, imgWidth, finalHeight);
      } catch (err) {
        console.error(t("pdf.chartCaptureError"), err);
      }
    }

    // Nuova pagina per lo storico prezzi
    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(t("pdf.priceHistory"), 14, 20);

    const pricesTable = prices.map((p, i) => [(i + 1).toString(), p.toFixed(2)]);
    autoTable(doc, {
      startY: 26,
      head: [["#", t("common.price")]],
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
      {t("pdf.download")}
    </button>
  );
}

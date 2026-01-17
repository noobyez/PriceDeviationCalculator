/**
 * UploadSection - Wrapper for the existing upload component
 * Adds landing page styling while preserving original functionality
 */
"use client";
import React, { forwardRef, ReactNode } from "react";
import { useLanguage } from "@/i18n";

interface UploadSectionProps {
  children: ReactNode; // The existing PriceHistoryUpload component
}

const UploadSection = forwardRef<HTMLDivElement, UploadSectionProps>(
  ({ children }, ref) => {
    const { t } = useLanguage();

    return (
      <section 
        ref={ref}
        id="upload-section"
        className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-slate-800"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header with step indicator */}
          <div className="text-center mb-10">
            {/* Step badge */}
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-500 text-white text-xs font-bold">
                1
              </span>
              {t("landing.upload.step") || "Step 1"}
            </span>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
              {t("landing.upload.title") || "Upload your historical price data"}
            </h2>

            <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
              {t("landing.upload.description") || "Start by uploading a CSV or Excel file with your price history. We'll take care of the rest."}
            </p>
          </div>

          {/* Upload component wrapper with enhanced styling */}
          <div className="relative">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-100/50 to-transparent dark:from-slate-700/20 rounded-2xl -m-4 p-4" />
            
            {/* Existing upload component */}
            <div className="relative">
              {children}
            </div>
          </div>

          {/* File format hints */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>CSV</span>
            </div>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Excel (.xlsx, .xls)</span>
            </div>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              <span>{t("landing.upload.columns") || "Columns: price, date"}</span>
            </div>
          </div>
        </div>
      </section>
    );
  }
);

UploadSection.displayName = "UploadSection";

export default UploadSection;

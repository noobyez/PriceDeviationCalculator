"use client";
import React, { useState } from 'react';
import { useHelpOptional } from './HelpContext';

interface HelpSection {
  id: string;
  title: string;
  icon: string;
  content: string[];
}

const helpSections: HelpSection[] = [
  {
    id: 'intro',
    title: 'Cosa fa questa app?',
    icon: '🎯',
    content: [
      'Ti aiuta a valutare se un prezzo proposto da un fornitore è ragionevole.',
      'Analizza lo storico dei prezzi passati e calcola una previsione del prezzo atteso.',
      'Ti indica se il nuovo prezzo è in linea con il trend o se è anomalo.',
    ],
  },
  {
    id: 'prices',
    title: 'Prezzi Storici',
    icon: '📊',
    content: [
      'Mostra tutti i prezzi pagati in passato per questo prodotto.',
      'I prezzi evidenziati in rosso sono considerati anomali (outlier).',
      'Puoi cliccare su un prezzo per escluderlo temporaneamente dall\'analisi.',
    ],
  },
  {
    id: 'regression',
    title: 'Linea di Regressione',
    icon: '📈',
    content: [
      'È una linea che rappresenta il trend medio dei prezzi nel tempo.',
      'Se la linea sale, i prezzi tendono ad aumentare.',
      'Se la linea scende, i prezzi tendono a diminuire.',
      'Il valore R² indica quanto questa previsione è affidabile (più alto = meglio).',
    ],
  },
  {
    id: 'forecast',
    title: 'Previsione Probabilistica',
    icon: '🔮',
    content: [
      'Mostra dove probabilmente si collocherà il prezzo futuro.',
      'La banda verde chiara (±1σ) indica dove cadrà il prezzo nel 68% dei casi.',
      'La banda più ampia (±2σ) copre il 95% delle possibilità.',
      'Se il nuovo prezzo è dentro la banda, è considerato normale.',
    ],
  },
  {
    id: 'indicators',
    title: 'Indicatori Chiave',
    icon: '📉',
    content: [
      '**Volatilità**: quanto il prezzo oscilla. Alta volatilità = maggiore rischio.',
      '**Trend**: direzione generale dei prezzi (su, giù, stabile).',
      '**Momentum**: pressione recente. Positivo = prezzi in salita, negativo = in calo.',
      '**Correlazione**: quanto i prezzi seguono uno schema prevedibile.',
    ],
  },
  {
    id: 'decision',
    title: 'Come Decidere',
    icon: '✅',
    content: [
      '🟢 Prezzo nella banda verde → ragionevole, puoi procedere.',
      '🟡 Prezzo vicino al limite → valuta con attenzione.',
      '🔴 Prezzo fuori dalla banda → richiedi chiarimenti al fornitore.',
      'Considera sempre il contesto: variazioni di mercato, qualità, volumi.',
    ],
  },
];

export default function HelpPanel() {
  const { helpEnabled } = useHelpOptional();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('intro');

  if (!helpEnabled) return null;

  return (
    <>
      {/* Help Button - Fixed bottom left */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-full shadow-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:shadow-xl transition-all duration-200 group"
      >
        <span className="text-lg group-hover:scale-110 transition-transform">ℹ️</span>
        <span className="text-sm font-medium">Help</span>
      </button>

      {/* Help Panel Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-start p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsOpen(false)}
        >
          {/* Panel */}
          <div
            className="w-full max-w-md max-h-[85vh] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slideInLeft"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📖</span>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    Guida Rapida
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Come usare l&apos;analisi prezzi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-zinc-500"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {helpSections.map((section) => (
                <div
                  key={section.id}
                  className="rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedSection(
                      expandedSection === section.id ? null : section.id
                    )}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <span className="text-xl">{section.icon}</span>
                    <span className="flex-1 font-medium text-zinc-800 dark:text-zinc-200">
                      {section.title}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`text-zinc-400 transition-transform duration-200 ${
                        expandedSection === section.id ? 'rotate-180' : ''
                      }`}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  
                  {expandedSection === section.id && (
                    <div className="px-4 pb-4 space-y-2 animate-fadeIn">
                      {section.content.map((line, i) => (
                        <p
                          key={i}
                          className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pl-9"
                          dangerouslySetInnerHTML={{
                            __html: line
                              .replace(/\*\*(.*?)\*\*/g, '<strong class="text-zinc-800 dark:text-zinc-200">$1</strong>')
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                💡 Puoi disattivare gli aiuti dal toggle in alto a destra
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CSS for slide-in animation */}
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}

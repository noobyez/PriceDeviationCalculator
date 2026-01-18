/**
 * Dizionario Italiano - Lingua predefinita
 * Struttura semi-nested per organizzazione logica
 */

export const it = {
  // ============================================
  // COMMON - Termini generici riutilizzabili
  // ============================================
  common: {
    price: "Prezzo",
    prices: "Prezzi",
    date: "Data",
    from: "Da",
    to: "A",
    apply: "Applica",
    reset: "Reset",
    download: "Scarica",
    upload: "Carica",
    close: "Chiudi",
    cancel: "Annulla",
    confirm: "Conferma",
    loading: "Caricamento...",
    error: "Errore",
    success: "Successo",
    warning: "Attenzione",
    info: "Info",
    yes: "Sì",
    no: "No",
    all: "Tutti",
    none: "Nessuno",
    last: "Ultimi",
    show: "Mostra",
    hide: "Nascondi",
    expand: "Espandi",
    collapse: "Comprimi",
    move: "Sposta",
    leftColumn: "Colonna sinistra",
    rightColumn: "Colonna destra",
  },

  // ============================================
  // APP - Header e struttura principale
  // ============================================
  app: {
    title: "Price Prediction Model Analysis",
    subtitle: "Analisi statistica e previsionale dei prezzi",
    essential: "Essential",
    fullView: "Vista Completa",
    essentialModeActive: "Modalità Essential attiva",
    essentialModeDescription: "Visualizzazione semplificata con i componenti principali. Clicca di nuovo su \"Vista Completa\" per ripristinare tutti i pannelli.",
    resetLayout: "Reset Layout",
    hiddenPanels: "pannelli nascosti",
    showAll: "Mostra tutti",
    dragHere: "Trascina qui un pannello",
  },

  // ============================================
  // PANELS - Titoli dei pannelli modulari
  // ============================================
  panels: {
    upload: "Carica Storico Prezzi",
    itemSelector: "Selezione Item",
    dateFilter: "Filtro per Data",
    priceHistory: "Storico Prezzi",
    interval: "Intervallo Dati",
    statistics: "Statistiche",
    newPrice: "Valutazione Nuovo Prezzo",
    download: "Download PDF",
    priceChart: "Grafico Prezzi",
    regression: "Risultato Regressione",
    correlation: "Analisi Correlazione",
    probabilistic: "Previsione Probabilistica",
    overlay: "Storico vs Previsione",
    itemComparison: "Confronto Item",
    hidePanel: "Nascondi pannello",
    movePanel: "Sposta pannello",
  },

  // ============================================
  // UPLOAD - Caricamento file
  // ============================================
  upload: {
    title: "Carica Storico Prezzi",
    dragDrop: "Trascina qui il file o clicca per selezionare",
    dragDropActive: "Rilascia il file qui",
    clickToUpload: "Trascina o clicca per caricare",
    supportedFormats: "CSV, TXT, RTF, XLSX, XLS",
    fileLoaded: "File caricato con successo",
    fileError: "Errore nel caricamento del file",
    noData: "Nessun dato valido trovato nel file",
    invalidFormat: "Formato file non valido",
    columnsRequired: "Il file deve contenere colonne 'price' e 'date'",
  },

  // ============================================
  // DATE FILTER - Filtro per data
  // ============================================
  dateFilter: {
    title: "Filtro per Data",
    fromDate: "Da data",
    toDate: "A data",
    placeholder: "gg/mm/aaaa",
    resetFilter: "Reset filtro",
    filterActive: "Filtro attivo",
    invalidFormat: "Formato data non valido (usa gg/mm/aaaa) o intervallo errato",
  },

  // ============================================
  // PRICE HISTORY - Storico prezzi
  // ============================================
  priceHistory: {
    title: "Storico prezzi caricato",
    clickToExclude: "Clicca su un valore per escluderlo/includerlo dall'analisi",
    excluded: "escluso",
    outlier: "outlier Z>2",
    clickToInclude: "Clicca per includere",
    clickToExcludeAction: "Clicca per escludere",
    restoreAll: "Ripristina tutti",
    excludedCount: "esclusi",
    removeOutliers: "Rimuovi outlier (|Z| > 2)",
  },

  // ============================================
  // INTERVAL - Selezione intervallo
  // ============================================
  interval: {
    title: "Intervallo dati",
    all: "Tutti",
    last: "Ultimi",
    custom: "Personalizzato",
    rangePlaceholder: "1-{max}",
  },

  // ============================================
  // STATISTICS - Pannello statistiche
  // ============================================
  statistics: {
    title: "Statistiche",
    mean: "Media",
    median: "Mediana",
    stdDev: "Dev. Std",
    min: "Min",
    max: "Max",
    q1: "Q1",
    q3: "Q3",
    iqr: "IQR",
    variance: "Varianza",
    // Tooltip descriptions
    meanDesc: "Prezzo medio pagato nel periodo selezionato",
    medianDesc: "Valore centrale: metà dei prezzi sono sopra, metà sotto",
    stdDevDesc: "Misura quanto i prezzi variano dalla media (più alto = più instabile)",
    minDesc: "Prezzo più basso pagato nel periodo",
    maxDesc: "Prezzo più alto pagato nel periodo",
    q1Desc: "25% dei prezzi sono sotto questo valore",
    q3Desc: "75% dei prezzi sono sotto questo valore",
    iqrDesc: "Range tra Q1 e Q3: indica la dispersione centrale dei prezzi",
    varianceDesc: "Misura statistica della variabilità dei prezzi",
  },

  // ============================================
  // NEW PRICE - Valutazione nuovo prezzo
  // ============================================
  newPrice: {
    title: "Valutazione Nuovo Prezzo",
    expectedPriceTrend: "Prezzo Atteso (Trend)",
    offeredPrice: "Prezzo Offerto",
    inputPlaceholder: "Inserisci prezzo fornitore",
    calculateDeviation: "Calcola scostamento",
    deviation: "Scostamento",
    exceedsThreshold: "Supera la soglia ±5%",
    // RDA Section
    rdaTitle: "Valutazione RDA",
    rdaSubtitle: "Inserisci il prezzo proposto per la valutazione",
    rdaPlaceholder: "Prezzo RDA",
    evaluateRda: "Valuta RDA",
    // Status
    statusOk: "OK",
    statusWarning: "ATTENZIONE",
    statusAlert: "ALERT",
    // Old keys for compatibility
    inputLabel: "Inserisci il nuovo prezzo proposto",
    evaluate: "Valuta",
    expectedPrice: "Prezzo atteso",
    absolute: "Assoluto",
    percentage: "Percentuale",
    verdict: "Verdetto",
    acceptable: "Prezzo accettabile",
    warning: "Attenzione: prezzo anomalo",
    withinRange: "Il prezzo è nella norma rispetto allo storico",
    outsideRange: "Il prezzo si discosta significativamente dal trend atteso",
    recommendation: "Raccomandazione",
    proceed: "Puoi procedere con l'acquisto",
    investigate: "Richiedi chiarimenti al fornitore",
  },

  // ============================================
  // STATUS CARD - Stato RDA
  // ============================================
  status: {
    rdaStatus: "Stato RDA",
    priceAcceptable: "Prezzo Accettabile",
    attentionRequired: "Attenzione Richiesta",
    priceNotAcceptable: "Prezzo Non Accettabile",
  },

  // ============================================
  // REGRESSION - Risultato regressione
  // ============================================
  regression: {
    title: "Analisi Trend",
    expectedPrice: "Prezzo Atteso",
    confidence: "Confidenza (R²)",
    confidenceDesc: "R² indica quanto i prezzi storici seguono un andamento coerente: più è alto, più il trend è affidabile.",
    high: "Alta",
    medium: "Media",
    low: "Bassa",
    standardError: "Errore Std Storico",
    standardErrorDesc: "Deviazione standard degli errori di regressione sui dati storici. Indica quanto i prezzi reali si discostano tipicamente dalla linea di trend.",
    // Tooltip
    titleTooltip: "La regressione lineare mostra il trend medio atteso dei prezzi basato sullo storico.",
    expectedPriceTooltip: "Prezzo previsto per il prossimo acquisto, calcolato dal trend storico.",
    confidenceTooltip: "Quanto è affidabile questa previsione: alto (>70%) = molto affidabile, basso (<40%) = poco affidabile.",
    // Regression mode selector
    modeTooltip: "Seleziona la modalità di regressione",
    modeStandard: "Standard (Tempo)",
    modeAdvanced: "Avanzata (Qtà + Tempo)",
    noQuantityData: "Nessun dato quantità",
    standardActive: "Regressione Tempo",
    advancedActive: "Regressione Qtà + Tempo",
    // Coefficients
    coefficients: "Coefficienti",
    coeffQuantity: "β Quantità",
    coeffTime: "β Tempo",
    intercept: "Intercetta (α)",
    slope: "Pendenza (β)",
    avgQuantityUsed: "Previsione con qtà media",
  },

  // ============================================
  // CORRELATION - Analisi correlazione
  // ============================================
  correlation: {
    title: "Analisi Correlazione",
    autocorrelation: "Autocorrelazione",
    lag: "Lag",
    strong: "Forte",
    moderate: "Moderata",
    weak: "Debole",
    volatility: "Volatilità",
    trendStrength: "Forza Trend",
    momentum: "Momentum Recente",
    vsPreviousPeriod: "vs periodo precedente",
    highVariability: "Alta variabilità",
    mediumVariability: "Media variabilità",
    lowVariability: "Bassa variabilità",
    bullishTrend: "Trend rialzista",
    bearishTrend: "Trend ribassista",
    noTrend: "Nessun trend chiaro",
    interpretation: "Interpretazione",
    // Tooltip
    autocorrelationTooltip: "Misura quanto i prezzi seguono un pattern simile nel tempo. Valori alti indicano prezzi prevedibili.",
    volatilityTooltip: "Indica quanto il prezzo è instabile nel tempo. Alta volatilità = maggiore rischio prezzo.",
    trendTooltip: "Mostra la direzione generale dei prezzi: rialzista (su), ribassista (giù) o stabile.",
    momentumTooltip: "Pressione recente di salita o discesa dei prezzi rispetto al periodo precedente.",
    // Interpretation texts
    highPersistence: "I prezzi mostrano forte persistenza: un prezzo alto tende a seguire un altro prezzo alto.",
    highVolatility: "Elevata volatilità indica rischio prezzo significativo.",
    bullishTrendClear: "Chiaro trend rialzista nel periodo analizzato.",
    bearishTrendClear: "Chiaro trend ribassista nel periodo analizzato.",
    stablePrices: "I prezzi appaiono relativamente stabili senza trend marcati.",
    positiveMomentum: "Il momentum positivo suggerisce pressione rialzista recente.",
    negativeMomentum: "Il momentum negativo suggerisce pressione ribassista recente.",
    minDataRequired: "Servono almeno 5 dati per l'analisi di correlazione.",
  },

  // ============================================
  // CHARTS - Grafici
  // ============================================
  charts: {
    priceChart: "Grafico Prezzi",
    probabilistic: "Previsione Probabilistica",
    overlay: "Storico vs Previsione",
    // Tooltip per i pannelli
    probabilisticTooltip: "Mostra scenari futuri con fasce di probabilità: verde (68%), ambra (95%), rosso (99.7%). Più il prezzo è vicino alla linea centrale, più è probabile.",
    overlayTooltip: "Confronta i prezzi storici con le previsioni future. Le bande colorate mostrano dove probabilmente cadrà il prezzo nei prossimi periodi.",
    probabilisticTitle: "Previsione Probabilistica",
    probabilisticDescription: "Questo grafico mostra le previsioni future dei prezzi con bande di probabilità gaussiane basate sugli errori storici della regressione.",
    overlayTitle: "Storico vs Previsione",
    overlayDescription: "Questo grafico combina i dati storici con le previsioni future, permettendo di vedere come il trend passato si proietta nel futuro.",
    // Spiegazioni delle bande
    band1SigmaExplanation: "Banda verde (±1σ): il prezzo ha il 68% di probabilità di cadere in questa fascia",
    band2SigmaExplanation: "Banda ambra (±2σ): il prezzo ha il 95% di probabilità di cadere in questa fascia",
    band3SigmaExplanation: "Banda rossa (±3σ): il prezzo ha il 99.7% di probabilità di cadere in questa fascia",
    sigmaExplanation: "σ (sigma) rappresenta la deviazione standard degli errori storici di previsione",
    historical: "Storico",
    predicted: "Previsto",
    trendLine: "Linea Trend",
    newPrice: "Nuovo Prezzo",
    confidenceBand: "Banda di confidenza",
    sigma1: "±1σ (68%)",
    sigma2: "±2σ (95%)",
    sigma3: "±3σ (99.7%)",
    loadDataPrompt: "Carica uno storico prezzi per visualizzare il grafico",
    noDataForChart: "Carica dati per vedere il grafico",
    zoomIn: "Zoom avanti",
    zoomOut: "Zoom indietro",
    resetZoom: "Reset zoom",
    expandChart: "Espandi grafico",
    // PriceChart labels
    bandPlus5: "Banda ±5%",
    bandMinus5: "Banda -5%",
    trendRegression: "Trend (regressione)",
    historicalPrices: "Prezzi storici",
    expectedPrice: "Prezzo atteso",
    offeredPrice: "Prezzo offerto",
    offeredPriceWarning: "Prezzo offerto ⚠️",
    deviation: "Scostamento",
    period: "Periodo",
    forecast: "Previsione",
    // ProbabilisticPriceChart labels
    newPriceInBand: "rientra nella banda",
    highlyProbable: "altamente probabile",
    moderatelyProbable: "moderatamente probabile",
    unlikelyProbable: "poco probabile",
    anomalyOutlier: "anomalo/outlier",
    sigmaNote: "deviazione standard degli errori storici di regressione",
    // OverlayHistoricalVsForecast labels
    historicalVsForecast: "Storico vs Previsione Futura",
    futureExpected: "Previsione Futura",
    historicalTrend: "Trend Storico",
    // PriceChart summary card labels
    anomalousPrice: "Prezzo Anomalo",
    priceWithinNorm: "Prezzo nella norma",
    moderateDeviation: "Scostamento moderato",
    expected: "Atteso",
    offered: "Offerto",
    regressionDisclaimer: "Regressione lineare sui dati storici • I risultati sono indicativi",
    // Overlay chart interpretation
    newPriceCompared: "confrontato con la previsione futura",
    sigmaStdError: "deviazione standard errori",
    historicalData: "Dati storici",
    periods: "periodi",
    futurePeriods: "periodi futuri",
    analysisInterpretation: "Interpretazione Analisi",
    historicalTrendLabel: "Trend storico",
    trendIncreasing: "crescente",
    trendDecreasing: "decrescente",
    trendStable: "stabile",
    inAnalyzedPeriod: "nel periodo analizzato",
    priceVolatility: "Volatilità prezzi",
    high: "alta",
    medium: "media",
    low: "bassa",
    nextPeriodForecast: "Previsione prossimo periodo",
    vsLastPrice: "vs ultimo prezzo",
    theNewPrice: "Il nuovo prezzo",
    comparedToForecast: "rispetto alla previsione",
  },

  // ============================================
  // PDF - Download PDF
  // ============================================
  pdf: {
    title: "Download PDF",
    download: "Scarica Report PDF",
    generating: "Generazione in corso...",
    noData: "Carica dati per abilitare il download",
    reportTitle: "Report Analisi Prezzi",
    generatedOn: "Report generato il",
    period: "Periodo analizzato",
    allData: "Tutti i dati",
    fromDate: "Dal",
    toDate: "Fino al",
    summary: "Riepilogo",
    // PDF content sections
    descriptiveStats: "Statistiche descrittive",
    metric: "Metrica",
    value: "Valore",
    averagePrice: "Prezzo medio",
    linearRegression: "Regressione lineare",
    expectedPriceNext: "Prezzo atteso (prossimo periodo)",
    coefficientA: "Coefficiente a",
    coefficientB: "Coefficiente b",
    modelConfidence: "Confidenza modello (R²)",
    insufficientData: "Dati insufficienti per la regressione.",
    deviationAnalysis: "Analisi scostamento",
    newOfferedPrice: "Nuovo prezzo offerto",
    absoluteDeviation: "Scostamento assoluto",
    percentageDeviation: "Scostamento percentuale",
    noNewPrice: "Nessun nuovo prezzo inserito.",
    priceHistory: "Storico prezzi",
    priceChartTitle: "Grafico Andamento Prezzi",
    probabilisticForecast: "Previsione Probabilistica",
    historyVsForecast: "Storico vs Previsione Futura",
    chartCaptureError: "Errore nella cattura del grafico",
  },

  // ============================================
  // HELP - Sistema di aiuto
  // ============================================
  help: {
    title: "Help",
    quickGuide: "Guida Rapida",
    howToUse: "Come usare l'analisi prezzi",
    toggleOn: "Aiuti ON",
    toggleOff: "Aiuti OFF",
    disableHint: "Puoi disattivare gli aiuti dal toggle in alto a destra",
    // Sections
    sections: {
      intro: {
        title: "Cosa fa questa app?",
        content: [
          "Ti aiuta a valutare se un prezzo proposto da un fornitore è ragionevole.",
          "Analizza lo storico dei prezzi passati e calcola una previsione del prezzo atteso.",
          "Ti indica se il nuovo prezzo è in linea con il trend o se è anomalo.",
        ],
      },
      prices: {
        title: "Prezzi Storici",
        content: [
          "Mostra tutti i prezzi pagati in passato per questo prodotto.",
          "I prezzi evidenziati in rosso sono considerati anomali (outlier).",
          "Puoi cliccare su un prezzo per escluderlo temporaneamente dall'analisi.",
        ],
      },
      regression: {
        title: "Linea di Regressione",
        content: [
          "È una linea che rappresenta il trend medio dei prezzi nel tempo.",
          "Se la linea sale, i prezzi tendono ad aumentare.",
          "Se la linea scende, i prezzi tendono a diminuire.",
          "Il valore R² indica quanto questa previsione è affidabile (più alto = meglio).",
        ],
      },
      forecast: {
        title: "Previsione Probabilistica",
        content: [
          "Mostra dove probabilmente si collocherà il prezzo futuro.",
          "La banda verde chiara (±1σ) indica dove cadrà il prezzo nel 68% dei casi.",
          "La banda più ampia (±2σ) copre il 95% delle possibilità.",
          "Se il nuovo prezzo è dentro la banda, è considerato normale.",
        ],
      },
      indicators: {
        title: "Indicatori Chiave",
        content: [
          "**Volatilità**: quanto il prezzo oscilla. Alta volatilità = maggiore rischio.",
          "**Trend**: direzione generale dei prezzi (su, giù, stabile).",
          "**Momentum**: pressione recente. Positivo = prezzi in salita, negativo = in calo.",
          "**Correlazione**: quanto i prezzi seguono uno schema prevedibile.",
        ],
      },
      decision: {
        title: "Come Decidere",
        content: [
          "🟢 Prezzo nella banda verde → ragionevole, puoi procedere.",
          "🟡 Prezzo vicino al limite → valuta con attenzione.",
          "🔴 Prezzo fuori dalla banda → richiedi chiarimenti al fornitore.",
          "Considera sempre il contesto: variazioni di mercato, qualità, volumi.",
        ],
      },
    },
  },

  // ============================================
  // LANGUAGE - Selettore lingua
  // ============================================
  language: {
    italian: "Italiano",
    english: "English",
    selectLanguage: "Seleziona lingua",
  },

  // ============================================
  // ERRORS - Messaggi di errore
  // ============================================
  errors: {
    generic: "Si è verificato un errore",
    loadingData: "Errore nel caricamento dei dati",
    invalidInput: "Input non valido",
    networkError: "Errore di rete",
    tryAgain: "Riprova",
  },

  // ============================================
  // LANDING - Landing page
  // ============================================
  landing: {
    hero: {
      subtitle: "Il tuo compagno predittivo per decisioni di acquisto più intelligenti",
      description: "Analizza i prezzi storici, prevedi scenari futuri e quantifica il rischio con modelli probabilistici pensati per il procurement.",
      cta: "Carica i tuoi dati per iniziare",
      trust1: "Sicurezza enterprise",
      trust2: "Analisi istantanea",
      trust3: "I dati non lasciano mai il tuo browser",
    },
    features: {
      title: "Perché Sense",
      subtitle: "Costruito per i professionisti del procurement che hanno bisogno di insight data-driven, non solo dati.",
      forecasting: {
        title: "Previsione Prezzi",
        description: "Regressione lineare e scenari probabilistici per anticipare i movimenti futuri dei prezzi.",
      },
      risk: {
        title: "Consapevolezza del Rischio",
        description: "Comprendi volatilità, bande di confidenza e incertezza dei prezzi prima di impegnarti.",
      },
      procurement: {
        title: "Pronto per il Procurement",
        description: "Progettato per buyer, category manager e professionisti della supply chain.",
      },
    },
    upload: {
      step: "Step 1",
      title: "Carica i tuoi dati storici dei prezzi",
      description: "Inizia caricando un file CSV o Excel con lo storico prezzi. Ci pensiamo noi al resto.",
      columns: "Colonne: price, date",
    },
    howItWorks: {
      title: "Come funziona",
      subtitle: "Dai dati grezzi agli insight azionabili in tre semplici step.",
      stepLabel: "Step",
      step1: {
        title: "Carica i dati",
        description: "Importa i tuoi dati storici dei prezzi da file CSV o Excel.",
      },
      step2: {
        title: "Analizza i trend",
        description: "Esplora statistiche, correlazioni e identifica pattern.",
      },
      step3: {
        title: "Simula scenari",
        description: "Genera previsioni probabilistiche e valuta i livelli di rischio.",
      },
    },
    footer: {
      tagline: "Analytics reso semplice",
    },
  },

  // ============================================
  // ITEM SELECTOR - Selezione item multi-item
  // ============================================
  itemSelector: {
    label: "Analizza Item:",
    tooltip: "Seleziona l'item da analizzare",
    itemsCount: "items",
    allItems: "Tutti gli item",
  },

  // ============================================
  // ITEM COMPARISON - Confronto tra item
  // ============================================
  itemComparison: {
    title: "Confronto Item",
    itemA: "Item A",
    itemB: "Item B",
    selectDifferentItems: "Seleziona due item diversi per il confronto",
    needMultipleItems: "Carica un dataset con più item per abilitare il confronto",
    noCommonDates: "Nessuna data comune trovata tra gli item selezionati",
    correlationTitle: "Correlazione Prezzi",
    priceComparison: "Confronto Prezzi nel Tempo",
    correlationOverTime: "Correlazione nel Tempo (finestra 5 punti)",
    rollingCorrelation: "Correlazione Rolling",
    commonDataPoints: "punti dati comuni",
    significant: "Significativa",
    strong: "Forte",
    moderate: "Moderata", 
    weak: "Debole",
    positive: "positiva",
    negative: "negativa",
    correlationNote: "Valori vicini a +1 indicano prezzi che si muovono insieme, valori vicini a -1 indicano movimento inverso",
  },
} as const;

// Export type per autocompletamento
export type TranslationKeys = typeof it;

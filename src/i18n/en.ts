/**
 * English Dictionary
 * Structure mirrors it.ts for consistency
 */

export const en = {
  // ============================================
  // COMMON - Generic reusable terms
  // ============================================
  common: {
    price: "Price",
    prices: "Prices",
    date: "Date",
    from: "From",
    to: "To",
    apply: "Apply",
    reset: "Reset",
    download: "Download",
    upload: "Upload",
    close: "Close",
    cancel: "Cancel",
    confirm: "Confirm",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    warning: "Warning",
    info: "Info",
    yes: "Yes",
    no: "No",
    all: "All",
    none: "None",
    last: "Last",
    show: "Show",
    hide: "Hide",
    expand: "Expand",
    collapse: "Collapse",
    move: "Move",
    leftColumn: "Left column",
    rightColumn: "Right column",
  },

  // ============================================
  // APP - Header and main structure
  // ============================================
  app: {
    title: "Price Prediction Model Analysis",
    subtitle: "Statistical and predictive price analysis",
    essential: "Essential",
    fullView: "Full View",
    essentialModeActive: "Essential mode active",
    essentialModeDescription: "Simplified view with main components only. Click \"Full View\" again to restore all panels.",
    resetLayout: "Reset Layout",
    hiddenPanels: "hidden panels",
    showAll: "Show all",
    dragHere: "Drag a panel here",
  },

  // ============================================
  // PANELS - Modular panel titles
  // ============================================
  panels: {
    upload: "Upload Price History",
    itemSelector: "Item Selection",
    dateFilter: "Date Filter",
    priceHistory: "Price History",
    interval: "Data Interval",
    statistics: "Statistics",
    newPrice: "New Price Evaluation",
    download: "PDF Download",
    priceChart: "Price Chart",
    regression: "Regression Result",
    correlation: "Correlation Analysis",
    probabilistic: "Probabilistic Forecast",
    overlay: "History vs Forecast",
    itemComparison: "Item Comparison",
    hidePanel: "Hide panel",
    movePanel: "Move panel",
  },

  // ============================================
  // UPLOAD - File upload
  // ============================================
  upload: {
    title: "Upload Price History",
    dragDrop: "Drag file here or click to select",
    dragDropActive: "Drop the file here",
    clickToUpload: "Drag or click to upload",
    supportedFormats: "CSV, TXT, RTF, XLSX, XLS",
    fileLoaded: "File loaded successfully",
    fileError: "Error loading file",
    noData: "No valid data found in file",
    invalidFormat: "Invalid file format",
    columnsRequired: "File must contain 'price' and 'date' columns",
  },

  // ============================================
  // DATE FILTER - Date filter
  // ============================================
  dateFilter: {
    title: "Date Filter",
    fromDate: "From date",
    toDate: "To date",
    placeholder: "mm/dd/yyyy",
    resetFilter: "Reset filter",
    filterActive: "Filter active",
    invalidFormat: "Invalid date format (use mm/dd/yyyy) or invalid range",
  },

  // ============================================
  // PRICE HISTORY - Price history
  // ============================================
  priceHistory: {
    title: "Loaded price history",
    clickToExclude: "Click a value to exclude/include it from analysis",
    excluded: "excluded",
    outlier: "outlier Z>2",
    clickToInclude: "Click to include",
    clickToExcludeAction: "Click to exclude",
    restoreAll: "Restore all",
    excludedCount: "excluded",
    removeOutliers: "Remove outliers (|Z| > 2)",
  },

  // ============================================
  // INTERVAL - Interval selection
  // ============================================
  interval: {
    title: "Data interval",
    all: "All",
    last: "Last",
    custom: "Custom",
    rangePlaceholder: "1-{max}",
  },

  // ============================================
  // STATISTICS - Statistics panel
  // ============================================
  statistics: {
    title: "Statistics",
    mean: "Mean",
    median: "Median",
    stdDev: "Std Dev",
    min: "Min",
    max: "Max",
    q1: "Q1",
    q3: "Q3",
    iqr: "IQR",
    variance: "Variance",
    // Tooltip descriptions
    meanDesc: "Average price paid in the selected period",
    medianDesc: "Central value: half of prices are above, half below",
    stdDevDesc: "Measures how prices vary from the mean (higher = more unstable)",
    minDesc: "Lowest price paid in the period",
    maxDesc: "Highest price paid in the period",
    q1Desc: "25% of prices are below this value",
    q3Desc: "75% of prices are below this value",
    iqrDesc: "Range between Q1 and Q3: indicates central price dispersion",
    varianceDesc: "Statistical measure of price variability",
  },

  // ============================================
  // NEW PRICE - New price evaluation
  // ============================================
  newPrice: {
    title: "New Price Evaluation",
    expectedPriceTrend: "Expected Price (Trend)",
    offeredPrice: "Offered Price",
    inputPlaceholder: "Enter supplier price",
    calculateDeviation: "Calculate deviation",
    deviation: "Deviation",
    exceedsThreshold: "Exceeds ±5% threshold",
    // RDA Section
    rdaTitle: "RDA Evaluation",
    rdaSubtitle: "Enter the proposed price for evaluation",
    rdaPlaceholder: "RDA Price",
    evaluateRda: "Evaluate RDA",
    // Status
    statusOk: "OK",
    statusWarning: "WARNING",
    statusAlert: "ALERT",
    // Old keys for compatibility
    inputLabel: "Enter the proposed new price",
    evaluate: "Evaluate",
    expectedPrice: "Expected Price",
    absolute: "Absolute",
    percentage: "Percentage",
    verdict: "Verdict",
    acceptable: "Acceptable price",
    warning: "Warning: anomalous price",
    withinRange: "Price is within normal range based on history",
    outsideRange: "Price deviates significantly from expected trend",
    recommendation: "Recommendation",
    proceed: "You may proceed with the purchase",
    investigate: "Request clarification from supplier",
  },

  // ============================================
  // STATUS CARD - RDA Status
  // ============================================
  status: {
    rdaStatus: "RDA Status",
    priceAcceptable: "Price Acceptable",
    attentionRequired: "Attention Required",
    priceNotAcceptable: "Price Not Acceptable",
  },

  // ============================================
  // REGRESSION - Regression result
  // ============================================
  regression: {
    title: "Trend Analysis",
    expectedPrice: "Expected Price",
    confidence: "Confidence (R²)",
    confidenceDesc: "R² indicates how consistently historical prices follow a pattern: the higher it is, the more reliable the trend.",
    high: "High",
    medium: "Medium",
    low: "Low",
    standardError: "Historical Std Error",
    standardErrorDesc: "Standard deviation of regression errors on historical data. Indicates how much actual prices typically deviate from the trend line.",
    // Tooltip
    titleTooltip: "Linear regression shows the expected average trend of prices based on history.",
    expectedPriceTooltip: "Predicted price for next purchase, calculated from historical trend.",
    confidenceTooltip: "How reliable this prediction is: high (>70%) = very reliable, low (<40%) = unreliable.",
    // Regression mode selector
    modeTooltip: "Select regression mode",
    modeStandard: "Standard (Time)",
    modeAdvanced: "Advanced (Qty + Time)",
    noQuantityData: "No qty data",
    standardActive: "Time Regression",
    advancedActive: "Qty + Time Regression",
    // Coefficients
    coefficients: "Coefficients",
    coeffQuantity: "β Quantity",
    coeffTime: "β Time",
    intercept: "Intercept (α)",
    slope: "Slope (β)",
    avgQuantityUsed: "Prediction uses avg qty",
  },

  // ============================================
  // CORRELATION - Correlation analysis
  // ============================================
  correlation: {
    title: "Correlation Analysis",
    autocorrelation: "Autocorrelation",
    lag: "Lag",
    strong: "Strong",
    moderate: "Moderate",
    weak: "Weak",
    volatility: "Volatility",
    trendStrength: "Trend Strength",
    momentum: "Recent Momentum",
    vsPreviousPeriod: "vs previous period",
    highVariability: "High variability",
    mediumVariability: "Medium variability",
    lowVariability: "Low variability",
    bullishTrend: "Bullish trend",
    bearishTrend: "Bearish trend",
    noTrend: "No clear trend",
    interpretation: "Interpretation",
    // Tooltip
    autocorrelationTooltip: "Measures how prices follow a similar pattern over time. High values indicate predictable prices.",
    volatilityTooltip: "Indicates how unstable the price is over time. High volatility = higher price risk.",
    trendTooltip: "Shows the general direction of prices: bullish (up), bearish (down) or stable.",
    momentumTooltip: "Recent upward or downward price pressure compared to the previous period.",
    // Interpretation texts
    highPersistence: "Prices show strong persistence: a high price tends to follow another high price.",
    highVolatility: "High volatility indicates significant price risk.",
    bullishTrendClear: "Clear bullish trend in the analyzed period.",
    bearishTrendClear: "Clear bearish trend in the analyzed period.",
    stablePrices: "Prices appear relatively stable without marked trends.",
    positiveMomentum: "Positive momentum suggests recent upward pressure.",
    negativeMomentum: "Negative momentum suggests recent downward pressure.",
    minDataRequired: "At least 5 data points required for correlation analysis.",
  },

  // ============================================
  // CHARTS - Charts
  // ============================================
  charts: {
    priceChart: "Price Chart",
    probabilistic: "Probabilistic Forecast",
    overlay: "History vs Forecast",
    historical: "Historical",
    predicted: "Predicted",
    trendLine: "Trend Line",
    newPrice: "New Price",
    confidenceBand: "Confidence band",
    sigma1: "±1σ (68%)",
    sigma2: "±2σ (95%)",
    sigma3: "±3σ (99.7%)",
    loadDataPrompt: "Load price history to view the chart",
    noDataForChart: "Load data to see the chart",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    resetZoom: "Reset zoom",
    expandChart: "Expand chart",
    // PriceChart labels
    bandPlus5: "±5% Band",
    bandMinus5: "-5% Band",
    trendRegression: "Trend (regression)",
    historicalPrices: "Historical prices",
    expectedPrice: "Expected price",
    offeredPrice: "Offered price",
    offeredPriceWarning: "Offered price ⚠️",
    deviation: "Deviation",
    period: "Period",
    forecast: "Forecast",
    // ProbabilisticPriceChart labels
    newPriceInBand: "falls within the band",
    highlyProbable: "highly probable",
    moderatelyProbable: "moderately probable",
    unlikelyProbable: "unlikely",
    anomalyOutlier: "anomaly/outlier",
    sigmaNote: "standard deviation of historical regression errors",
    // OverlayHistoricalVsForecast labels
    historicalVsForecast: "History vs Future Forecast",
    futureExpected: "Future Forecast",
    historicalTrend: "Historical Trend",
    // PriceChart summary card labels
    anomalousPrice: "Anomalous Price",
    priceWithinNorm: "Price within norm",
    moderateDeviation: "Moderate deviation",
    expected: "Expected",
    offered: "Offered",
    regressionDisclaimer: "Linear regression on historical data • Results are indicative",
    // Overlay chart interpretation
    newPriceCompared: "compared with future forecast",
    sigmaStdError: "standard deviation errors",
    historicalData: "Historical data",
    periods: "periods",
    futurePeriods: "future periods",
    analysisInterpretation: "Analysis Interpretation",
    historicalTrendLabel: "Historical trend",
    trendIncreasing: "increasing",
    trendDecreasing: "decreasing",
    trendStable: "stable",
    inAnalyzedPeriod: "in the analyzed period",
    priceVolatility: "Price volatility",
    high: "high",
    medium: "medium",
    low: "low",
    nextPeriodForecast: "Next period forecast",
    vsLastPrice: "vs last price",
    theNewPrice: "The new price",
    comparedToForecast: "compared to forecast",
  },

  // ============================================
  // PDF - PDF Download
  // ============================================
  pdf: {
    title: "PDF Download",
    download: "Download PDF Report",
    generating: "Generating...",
    noData: "Load data to enable download",
    reportTitle: "Price Analysis Report",
    generatedOn: "Report generated on",
    period: "Analyzed period",
    allData: "All data",
    fromDate: "From",
    toDate: "Until",
    summary: "Summary",
    // PDF content sections
    descriptiveStats: "Descriptive statistics",
    metric: "Metric",
    value: "Value",
    averagePrice: "Average price",
    linearRegression: "Linear regression",
    expectedPriceNext: "Expected price (next period)",
    coefficientA: "Coefficient a",
    coefficientB: "Coefficient b",
    modelConfidence: "Model confidence (R²)",
    insufficientData: "Insufficient data for regression.",
    deviationAnalysis: "Deviation analysis",
    newOfferedPrice: "New offered price",
    absoluteDeviation: "Absolute deviation",
    percentageDeviation: "Percentage deviation",
    noNewPrice: "No new price entered.",
    priceHistory: "Price history",
    priceChartTitle: "Price Trend Chart",
    probabilisticForecast: "Probabilistic Forecast",
    historyVsForecast: "History vs Future Forecast",
    chartCaptureError: "Error capturing chart",
  },

  // ============================================
  // HELP - Help system
  // ============================================
  help: {
    title: "Help",
    quickGuide: "Quick Guide",
    howToUse: "How to use price analysis",
    toggleOn: "Help ON",
    toggleOff: "Help OFF",
    disableHint: "You can disable help tooltips from the toggle in the top right",
    // Sections
    sections: {
      intro: {
        title: "What does this app do?",
        content: [
          "Helps you evaluate if a proposed supplier price is reasonable.",
          "Analyzes historical past prices and calculates an expected price forecast.",
          "Indicates whether the new price is in line with the trend or if it's anomalous.",
        ],
      },
      prices: {
        title: "Historical Prices",
        content: [
          "Shows all prices paid in the past for this product.",
          "Prices highlighted in red are considered anomalous (outliers).",
          "You can click on a price to temporarily exclude it from analysis.",
        ],
      },
      regression: {
        title: "Regression Line",
        content: [
          "A line representing the average price trend over time.",
          "If the line goes up, prices tend to increase.",
          "If the line goes down, prices tend to decrease.",
          "The R² value indicates how reliable this prediction is (higher = better).",
        ],
      },
      forecast: {
        title: "Probabilistic Forecast",
        content: [
          "Shows where the future price will likely fall.",
          "The light green band (±1σ) indicates where the price will fall in 68% of cases.",
          "The wider band (±2σ) covers 95% of possibilities.",
          "If the new price is within the band, it's considered normal.",
        ],
      },
      indicators: {
        title: "Key Indicators",
        content: [
          "**Volatility**: how much the price fluctuates. High volatility = higher risk.",
          "**Trend**: general direction of prices (up, down, stable).",
          "**Momentum**: recent pressure. Positive = rising prices, negative = falling.",
          "**Correlation**: how well prices follow a predictable pattern.",
        ],
      },
      decision: {
        title: "How to Decide",
        content: [
          "🟢 Price within green band → reasonable, you can proceed.",
          "🟡 Price near the limit → evaluate carefully.",
          "🔴 Price outside the band → request clarification from supplier.",
          "Always consider context: market changes, quality, volumes.",
        ],
      },
    },
  },

  // ============================================
  // LANGUAGE - Language selector
  // ============================================
  language: {
    italian: "Italian",
    english: "English",
    selectLanguage: "Select language",
  },

  // ============================================
  // ERRORS - Error messages
  // ============================================
  errors: {
    generic: "An error occurred",
    loadingData: "Error loading data",
    invalidInput: "Invalid input",
    networkError: "Network error",
    tryAgain: "Try again",
  },

  // ============================================
  // LANDING - Landing page
  // ============================================
  landing: {
    hero: {
      subtitle: "Your predictive companion for smarter procurement decisions",
      description: "Analyze historical prices, forecast future scenarios and quantify risk with probabilistic models tailored for procurement.",
      cta: "Upload your data to start",
      trust1: "Enterprise-grade security",
      trust2: "Instant analysis",
      trust3: "Data never leaves your browser",
    },
    features: {
      title: "Why Sense",
      subtitle: "Built for procurement professionals who need data-driven insights, not just data.",
      forecasting: {
        title: "Price Forecasting",
        description: "Linear regression and probabilistic scenarios to anticipate future price movements.",
      },
      risk: {
        title: "Risk Awareness",
        description: "Understand volatility, confidence bands and price uncertainty before committing.",
      },
      procurement: {
        title: "Procurement-Ready",
        description: "Designed for buyers, category managers and supply chain professionals.",
      },
    },
    upload: {
      step: "Step 1",
      title: "Upload your historical price data",
      description: "Start by uploading a CSV or Excel file with your price history. We'll take care of the rest.",
      columns: "Columns: price, date",
    },
    howItWorks: {
      title: "How it works",
      subtitle: "From raw data to actionable insights in three simple steps.",
      stepLabel: "Step",
      step1: {
        title: "Upload data",
        description: "Import your historical price data from CSV or Excel files.",
      },
      step2: {
        title: "Analyze trends",
        description: "Explore statistics, correlations and identify patterns.",
      },
      step3: {
        title: "Simulate scenarios",
        description: "Generate probabilistic forecasts and assess risk levels.",
      },
    },
    footer: {
      tagline: "Analytics made simple",
    },
  },

  // ============================================
  // ITEM SELECTOR - Multi-item selection
  // ============================================
  itemSelector: {
    label: "Analyze Item:",
    tooltip: "Select the item to analyze",
    itemsCount: "items",
    allItems: "All items",
  },

  // ============================================
  // ITEM COMPARISON - Item comparison
  // ============================================
  itemComparison: {
    title: "Item Comparison",
    itemA: "Item A",
    itemB: "Item B",
    selectDifferentItems: "Please select two different items for comparison",
    needMultipleItems: "Upload a dataset with multiple items to enable comparison",
    noCommonDates: "No common dates found between selected items",
    correlationTitle: "Price Correlation",
    priceComparison: "Price Comparison Over Time",
    correlationOverTime: "Correlation Over Time (5-point window)",
    rollingCorrelation: "Rolling Correlation",
    commonDataPoints: "common data points",
    significant: "Significant",
    strong: "Strong",
    moderate: "Moderate",
    weak: "Weak",
    positive: "positive",
    negative: "negative",
    correlationNote: "Values near +1 indicate prices move together, values near -1 indicate inverse movement",
  },
} as const;

export type TranslationKeys = typeof en;

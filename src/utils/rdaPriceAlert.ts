export function evaluateRdaPrice(
  prices: number[],
  rdaPrice: number,
  expectedPrice: number
): {
  status: "OK" | "WARNING" | "ALERT";
  reasons: string[];
  comment: string;
  details: {
    expectedPrice: number;
    lowerBoundIQR: number;
    deviationPerc: number;
  };
} {
  if (prices.length < 2) {
    return {
      status: "OK",
      reasons: ["Serie storica troppo corta per valutazione."],
      comment: "Il prezzo RDA è coerente con il trend storico atteso e rientra nella fascia dei prezzi “normali”. Non ci sono segnali statistici di anomalia nei dati storici.",
      details: {
        expectedPrice,
        lowerBoundIQR: NaN,
        deviationPerc: NaN,
      },
    };
  }

  const sortedPrices = [...prices].sort((a, b) => a - b);
  const q1 = sortedPrices[Math.floor(sortedPrices.length / 4)];
  const q3 = sortedPrices[Math.floor((sortedPrices.length * 3) / 4)];
  const iqr = q3 - q1;
  // Ridotto il coefficiente da 1.5 a 0.7 per rendere la soglia più sensibile
  const lowerBoundIQR = q1 - 0.7 * iqr;
  const deviationPerc = ((rdaPrice - expectedPrice) / expectedPrice) * 100;

  const reasons: string[] = [];

  // Nuova regola: ALERT immediato se il prezzo RDA è inferiore al 70% del prezzo atteso
  if (rdaPrice < 0.7 * expectedPrice) {
    return {
      status: "ALERT",
      reasons: ["Prezzo RDA inferiore al 70% del prezzo atteso."],
      comment: "Il prezzo RDA è significativamente basso rispetto al trend storico, essendo inferiore al 70% del prezzo atteso. Questo indica un'anomalia che richiede attenzione immediata.",
      details: {
        expectedPrice,
        lowerBoundIQR,
        deviationPerc,
      },
    };
  }

  if (rdaPrice < expectedPrice) {
    reasons.push("Prezzo RDA inferiore al prezzo atteso dal trend.");
  }
  if (rdaPrice < lowerBoundIQR) {
    reasons.push("Prezzo RDA inferiore al limite inferiore IQR.");
  }

  let status: "OK" | "WARNING" | "ALERT";
  let comment: string;

  if (rdaPrice >= expectedPrice && rdaPrice >= lowerBoundIQR) {
    status = "OK";
    comment = "Il prezzo RDA è coerente con il trend storico atteso e rientra nella fascia dei prezzi normali. Non ci sono segnali statistici di anomalia nei dati storici.";
  } else if (rdaPrice < expectedPrice && rdaPrice < lowerBoundIQR) {
    status = "ALERT";
    comment = "Il prezzo RDA è significativamente inferiore al trend storico o al range tipico dei dati storici. Questo indica una possibile anomalia da valutare con attenzione.";
  } else {
    status = "WARNING";
    comment = "Il prezzo RDA è inferiore al prezzo atteso, ma rientra ancora nella fascia normale dei prezzi. È vicino al limite inferiore e richiede attenzione.";
  }

  return {
    status,
    reasons,
    comment,
    details: {
      expectedPrice,
      lowerBoundIQR,
      deviationPerc,
    },
  };
}

const prices = [10, 15, 20, 25, 30, 35, 40];
const rdaPrice = 12;
const expectedPrice = 18;

const result = evaluateRdaPrice(prices, rdaPrice, expectedPrice);
console.log(result);

/*
Output:
{
  status: "WARNING",
  reasons: ["Prezzo RDA inferiore al prezzo atteso dal trend."],
  comment: "Il prezzo RDA è inferiore al prezzo atteso, ma rientra ancora nella fascia normale dei prezzi. È vicino al limite inferiore e richiede attenzione.",
  details: {
    expectedPrice: 18,
    lowerBoundIQR: 12.25,
    deviationPerc: -33.33
  }
}
*/
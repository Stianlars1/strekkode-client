export type FormatId =
  | "CODE128"
  | "CODE39"
  | "CODE93"
  | "codabar"
  | "ITF"
  | "EAN13"
  | "EAN8"
  | "UPC"
  | "UPCE"
  | "ITF14"
  | "ISBN"
  | "MSI"
  | "pharmacode";

export interface FormatDef {
  id: FormatId;
  /* Format string passed to JsBarcode ("ISBN" renders as EAN13) */
  jsbFormat: string;
  label: string;
  inputMode: "numeric" | "text";
  help: string;
}

export interface FormatGroup {
  label: string;
  formats: FormatDef[];
}

export const FORMAT_GROUPS: FormatGroup[] = [
  {
    label: "Intern bruk og lager",
    formats: [
      {
        id: "CODE128",
        jsbFormat: "CODE128",
        label: "CODE128 - standard",
        inputMode: "text",
        help: "Tall og bokstaver. Lager, logistikk og intern merking.",
      },
      {
        id: "CODE39",
        jsbFormat: "CODE39",
        label: "CODE39",
        inputMode: "text",
        help: "A–Z, 0–9 og - . $ / + % mellomrom.",
      },
      {
        id: "CODE93",
        jsbFormat: "CODE93",
        label: "CODE93",
        inputMode: "text",
        help: "Som CODE39, men mer kompakt.",
      },
      {
        id: "codabar",
        jsbFormat: "codabar",
        label: "Codabar",
        inputMode: "text",
        help: "Tall og - $ : / . +. Brukes i bibliotek og blodbanker.",
      },
      {
        id: "ITF",
        jsbFormat: "ITF",
        label: "ITF",
        inputMode: "numeric",
        help: "Partall antall siffer.",
      },
    ],
  },
  {
    label: "Butikk og netthandel",
    formats: [
      {
        id: "EAN13",
        jsbFormat: "EAN13",
        label: "EAN-13 - varer i butikk",
        inputMode: "numeric",
        help: "13 siffer. Krever GS1-nummer for salg i butikk.",
      },
      {
        id: "EAN8",
        jsbFormat: "EAN8",
        label: "EAN-8 - små produkter",
        inputMode: "numeric",
        help: "8 siffer.",
      },
      {
        id: "UPC",
        jsbFormat: "UPC",
        label: "UPC-A",
        inputMode: "numeric",
        help: "12 siffer. Amerikansk motstykke til EAN-13.",
      },
      {
        id: "UPCE",
        jsbFormat: "UPCE",
        label: "UPC-E",
        inputMode: "numeric",
        help: "Komprimert UPC, 6–8 siffer.",
      },
      {
        id: "ITF14",
        jsbFormat: "ITF14",
        label: "ITF-14 - D-pak/kartong",
        inputMode: "numeric",
        help: "14 siffer. Ytteremballasje.",
      },
    ],
  },
  {
    label: "Annet",
    formats: [
      {
        id: "ISBN",
        jsbFormat: "EAN13",
        label: "ISBN (bok)",
        inputMode: "text",
        help: "ISBN-10 eller ISBN-13, med eller uten bindestreker.",
      },
      {
        id: "MSI",
        jsbFormat: "MSI",
        label: "MSI",
        inputMode: "numeric",
        help: "Kun tall. Lagerhyller og inventar.",
      },
      {
        id: "pharmacode",
        jsbFormat: "pharmacode",
        label: "Pharmacode",
        inputMode: "numeric",
        help: "Tall mellom 3 og 131070. Legemiddelemballasje.",
      },
    ],
  },
];

export const getFormatDef = (id: FormatId): FormatDef => {
  for (const group of FORMAT_GROUPS) {
    const def = group.formats.find((f) => f.id === id);
    if (def) return def;
  }
  return FORMAT_GROUPS[0].formats[0];
};

export interface ValidationResult {
  ok: boolean;
  /* Value handed to JsBarcode when ok */
  renderValue: string;
  /* Error shown under the input (only when the user has typed something) */
  message?: string;
  /* Non-error notice, e.g. "Kontrollsiffer 8 lagt til automatisk" */
  info?: string;
  /* One-click correction offer */
  fix?: { label: string; value: string };
}

const invalid = (message?: string, fix?: ValidationResult["fix"]): ValidationResult => ({
  ok: false,
  renderValue: "",
  message,
  fix,
});

const valid = (renderValue: string, info?: string): ValidationResult => ({
  ok: true,
  renderValue,
  info,
});

/* GTIN mod-10: weight 3 on every other digit counted from the right. */
export const gtinCheckDigit = (digits: string): number => {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    const n = Number(digits[digits.length - 1 - i]);
    sum += i % 2 === 0 ? n * 3 : n;
  }
  return (10 - (sum % 10)) % 10;
};

const isDigits = (value: string) => /^\d+$/.test(value);

/* Shared for EAN-13 / EAN-8 / UPC-A / ITF-14: payload+1 total digits,
   auto-compute the check digit at payload length, verify at full length. */
const validateGtin = (
  value: string,
  totalLen: number,
  name: string
): ValidationResult => {
  if (!isDigits(value)) {
    return invalid(`${name} kan bare inneholde siffer.`);
  }
  const payloadLen = totalLen - 1;
  if (value.length < payloadLen) {
    return invalid(`Skriv inn ${payloadLen} eller ${totalLen} siffer.`);
  }
  if (value.length === payloadLen) {
    const cd = gtinCheckDigit(value);
    return valid(value + cd, `Kontrollsiffer ${cd} lagt til automatisk.`);
  }
  if (value.length === totalLen) {
    const expected = gtinCheckDigit(value.slice(0, payloadLen));
    if (Number(value[totalLen - 1]) === expected) {
      return valid(value);
    }
    return invalid(
      `Ugyldig kontrollsiffer - siste siffer skal være ${expected}.`,
      {
        label: `Rett til ${expected}`,
        value: value.slice(0, payloadLen) + expected,
      }
    );
  }
  return invalid(`${name} skal ha ${totalLen} siffer (${value.length} skrevet).`);
};

const isbn10CheckChar = (nineDigits: string): string => {
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(nineDigits[i]) * (10 - i);
  }
  const rest = (11 - (sum % 11)) % 11;
  return rest === 10 ? "X" : String(rest);
};

const validateIsbn = (raw: string): ValidationResult => {
  const value = raw.replace(/[-\s]/g, "").toUpperCase();
  if (!/^[\dX]*$/.test(value)) {
    return invalid("ISBN kan bare inneholde siffer, bindestreker og X.");
  }
  if (value.length < 10) {
    return invalid("Skriv inn et ISBN-10 (10 tegn) eller ISBN-13 (13 siffer).");
  }
  if (value.length === 10) {
    const expected = isbn10CheckChar(value.slice(0, 9));
    if (value[9] !== expected) {
      return invalid(`Ugyldig ISBN-10 - siste tegn skal være ${expected}.`);
    }
    const payload = "978" + value.slice(0, 9);
    const cd = gtinCheckDigit(payload);
    return valid(payload + cd, "ISBN-10 konvertert til EAN-13 automatisk.");
  }
  if (value.length === 12 && /^(978|979)/.test(value)) {
    const cd = gtinCheckDigit(value);
    return valid(value + cd, `Kontrollsiffer ${cd} lagt til automatisk.`);
  }
  if (value.length === 13) {
    if (!/^(978|979)/.test(value)) {
      return invalid("Et ISBN-13 starter med 978 eller 979.");
    }
    if (!isDigits(value)) {
      return invalid("Et ISBN-13 består av 13 siffer.");
    }
    const expected = gtinCheckDigit(value.slice(0, 12));
    if (Number(value[12]) === expected) {
      return valid(value);
    }
    return invalid(`Ugyldig kontrollsiffer - siste siffer skal være ${expected}.`, {
      label: `Rett til ${expected}`,
      value: value.slice(0, 12) + expected,
    });
  }
  return invalid("Et ISBN har 10 eller 13 tegn.");
};

export const validateForFormat = (
  formatId: FormatId,
  rawValue: string
): ValidationResult => {
  const value = rawValue.trim();
  if (!value) return invalid();

  switch (formatId) {
    case "CODE128": {
      // eslint-disable-next-line no-control-regex
      if (!/^[\x00-\x7F]+$/.test(value)) {
        return invalid(
          "Ugyldig tegn for CODE128 - kun ASCII (bokstaver uten æøå, tall og vanlige tegn)."
        );
      }
      return valid(value);
    }
    case "CODE39": {
      const upper = value.toUpperCase();
      if (!/^[A-Z0-9\-.$/+% ]+$/.test(upper)) {
        return invalid(
          "Ugyldig tegn for CODE39 - bruk A–Z, 0–9 og - . $ / + % mellomrom."
        );
      }
      return upper === value
        ? valid(value)
        : valid(upper, "Små bokstaver gjort om til store (CODE39 har kun store).");
    }
    case "CODE93": {
      const upper = value.toUpperCase();
      if (!/^[A-Z0-9\-.$/+% ]+$/.test(upper)) {
        return invalid(
          "Ugyldig tegn for CODE93 - bruk A–Z, 0–9 og - . $ / + % mellomrom."
        );
      }
      return upper === value
        ? valid(value)
        : valid(upper, "Små bokstaver gjort om til store (CODE93 har kun store).");
    }
    case "codabar": {
      const upper = value.toUpperCase();
      if (!/^[ABCD]?[0-9\-$:/.+]+[ABCD]?$/.test(upper)) {
        return invalid(
          "Ugyldig Codabar - bruk tall og - $ : / . +, eventuelt A–D i start og slutt."
        );
      }
      return valid(upper);
    }
    case "ITF": {
      if (!isDigits(value)) {
        return invalid("ITF kan bare inneholde siffer.");
      }
      if (value.length % 2 !== 0) {
        return invalid("ITF krever et partall antall siffer.", {
          label: `Legg til 0 foran`,
          value: "0" + value,
        });
      }
      return valid(value);
    }
    case "EAN13":
      return validateGtin(value, 13, "EAN-13");
    case "EAN8":
      return validateGtin(value, 8, "EAN-8");
    case "UPC":
      return validateGtin(value, 12, "UPC-A");
    case "UPCE": {
      if (!isDigits(value)) {
        return invalid("UPC-E kan bare inneholde siffer.");
      }
      if (value.length < 6 || value.length > 8) {
        return invalid("UPC-E skal ha 6–8 siffer.");
      }
      return valid(value);
    }
    case "ITF14":
      return validateGtin(value, 14, "ITF-14");
    case "ISBN":
      return validateIsbn(value);
    case "MSI": {
      if (!isDigits(value)) {
        return invalid("MSI kan bare inneholde siffer.");
      }
      return valid(value);
    }
    case "pharmacode": {
      const n = Number(value);
      if (!isDigits(value) || n < 3 || n > 131070) {
        return invalid("Pharmacode er et tall mellom 3 og 131070.");
      }
      return valid(value);
    }
  }
};

export interface FormatSuggestion {
  formatId: FormatId;
  message: string;
}

/* Non-blocking hint when the typed value looks like another format.
   Never auto-switches - the user clicks to accept. */
export const suggestFormat = (
  rawValue: string,
  current: FormatId
): FormatSuggestion | null => {
  const value = rawValue.trim();
  if (!isDigits(value)) return null;

  if (value.length === 13 && /^70[0-9]/.test(value) && current !== "EAN13") {
    return {
      formatId: "EAN13",
      message: "Dette ser ut som en norsk EAN-13 (GS1 Norge)",
    };
  }
  if (value.length === 13 && /^(978|979)/.test(value) && current !== "ISBN") {
    return { formatId: "ISBN", message: "Dette ser ut som et ISBN" };
  }
  if (current === "CODE128") {
    if (value.length === 12) {
      return {
        formatId: "EAN13",
        message: "12 siffer - EAN-13 uten kontrollsiffer?",
      };
    }
    if (value.length === 8) {
      return { formatId: "EAN8", message: "8 siffer - EAN-8?" };
    }
    if (value.length === 14) {
      return { formatId: "ITF14", message: "14 siffer - ITF-14 (D-pak)?" };
    }
  }
  return null;
};

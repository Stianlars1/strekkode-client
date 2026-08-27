"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { FormatId, validateForFormat } from "./lib/formats";

export const MAX_BULK_LINES = 500;

type BulkSource = "list" | "series";

interface SkippedLine {
  lineNo: number;
  raw: string;
  message: string;
}

interface BulkPanelProps {
  formatId: FormatId;
  /* Fires with the validated render values (check digits included) whenever
     the input changes - the container owns download and preview. */
  onValidValuesChange: (values: string[]) => void;
}

/* First column of a CSV/text line. Handles simple quoting and the semicolon
   separator Norwegian Excel uses. */
const firstCsvColumn = (line: string): string => {
  const trimmed = line.trim();
  if (trimmed.startsWith('"')) {
    const inner = trimmed.slice(1);
    const end = inner.indexOf('"');
    return end === -1 ? inner : inner.slice(0, end);
  }
  const sep = trimmed.search(/[,;\t]/);
  return sep === -1 ? trimmed : trimmed.slice(0, sep);
};

const shorten = (value: string, max = 24): string =>
  value.length > max ? value.slice(0, max) + "..." : value;

export const BulkPanel = ({ formatId, onValidValuesChange }: BulkPanelProps) => {
  const [source, setSource] = useState<BulkSource>("list");
  const [listText, setListText] = useState("");
  const [csvNotice, setCsvNotice] = useState<string | null>(null);
  const [prefix, setPrefix] = useState("");
  const [startNumber, setStartNumber] = useState("1");
  const [count, setCount] = useState("10");
  const [suffix, setSuffix] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const startTrimmed = startNumber.trim();
  const startInvalid = startTrimmed !== "" && !/^\d+$/.test(startTrimmed);

  const seriesValues = useMemo(() => {
    if (!/^\d+$/.test(startTrimmed)) return [];
    const n = Math.min(
      Math.max(Math.floor(Number(count)) || 0, 0),
      MAX_BULK_LINES
    );
    const width = startTrimmed.length;
    const start = Number(startTrimmed);
    const values: string[] = [];
    for (let i = 0; i < n; i++) {
      values.push(prefix + String(start + i).padStart(width, "0") + suffix);
    }
    return values;
  }, [startTrimmed, count, prefix, suffix]);

  const allEntries = useMemo(() => {
    if (source === "series") {
      return seriesValues.map((raw, i) => ({ raw, lineNo: i + 1 }));
    }
    return listText
      .split(/\r?\n/)
      .map((line, i) => ({ raw: line.trim(), lineNo: i + 1 }))
      .filter((entry) => entry.raw.length > 0);
  }, [source, listText, seriesValues]);

  const truncated = allEntries.length > MAX_BULK_LINES;
  const entries = truncated ? allEntries.slice(0, MAX_BULK_LINES) : allEntries;

  const { validValues, skipped } = useMemo(() => {
    const valid: string[] = [];
    const skippedLines: SkippedLine[] = [];
    for (const entry of entries) {
      const result = validateForFormat(formatId, entry.raw);
      if (result.ok) {
        valid.push(result.renderValue);
      } else {
        skippedLines.push({
          lineNo: entry.lineNo,
          raw: entry.raw,
          message: result.message ?? "Ugyldig verdi.",
        });
      }
    }
    return { validValues: valid, skipped: skippedLines };
  }, [entries, formatId]);

  useEffect(() => {
    onValidValuesChange(validValues);
  }, [validValues, onValidValuesChange]);

  const handleCsvChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const values = text
      .replace(/^\uFEFF/, "")
      .split(/\r?\n/)
      .map(firstCsvColumn)
      .map((value) => value.trim())
      .filter(Boolean);
    setListText(values.join("\n"));
    setCsvNotice(`${values.length} verdier lest fra ${file.name} (første kolonne).`);
    e.target.value = "";
  };

  return (
    <div className="generator__bulk">
      <fieldset className="generator__seg">
        <legend className="generator__sr-only">Kilde for verdier</legend>
        <input
          type="radio"
          id="bulk-source-list"
          name="bulk-source"
          className="generator__seg-input"
          checked={source === "list"}
          onChange={() => setSource("list")}
        />
        <label htmlFor="bulk-source-list" className="generator__seg-label">
          Liste
        </label>
        <input
          type="radio"
          id="bulk-source-series"
          name="bulk-source"
          className="generator__seg-input"
          checked={source === "series"}
          onChange={() => setSource("series")}
        />
        <label htmlFor="bulk-source-series" className="generator__seg-label">
          Tallserie
        </label>
      </fieldset>

      {source === "list" ? (
        <div className="generator__field">
          <label htmlFor="bulk-lines" className="generator__label">
            Én verdi per linje
          </label>
          <textarea
            id="bulk-lines"
            className="generator__textarea"
            rows={7}
            value={listText}
            onChange={(e) => {
              setListText(e.target.value);
              setCsvNotice(null);
            }}
            placeholder={"7038010013966\n7038010013973\n7038010013980"}
            spellCheck={false}
          />
          <div className="generator__bulk-tools">
            <button
              type="button"
              className="generator__csv-button"
              onClick={() => fileInputRef.current?.click()}
            >
              Last opp CSV-fil
            </button>
            <span className="generator__help">Første kolonne brukes.</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt,text/csv,text/plain"
            onChange={handleCsvChange}
            hidden
          />
          {csvNotice && (
            <p className="generator__info" role="status">
              {csvNotice}
            </p>
          )}
        </div>
      ) : (
        <div className="generator__field">
          <div className="generator__series">
            <div className="generator__field">
              <label htmlFor="bulk-prefix" className="generator__label">
                Prefiks
              </label>
              <input
                id="bulk-prefix"
                type="text"
                className="generator__input"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="VARE-"
              />
            </div>
            <div className="generator__field">
              <label htmlFor="bulk-start" className="generator__label">
                Startnummer
              </label>
              <input
                id="bulk-start"
                type="text"
                inputMode="numeric"
                className="generator__input"
                value={startNumber}
                onChange={(e) => setStartNumber(e.target.value)}
              />
            </div>
            <div className="generator__field">
              <label htmlFor="bulk-count" className="generator__label">
                Antall
              </label>
              <input
                id="bulk-count"
                type="number"
                min={1}
                max={MAX_BULK_LINES}
                className="generator__input"
                value={count}
                onChange={(e) => setCount(e.target.value)}
              />
            </div>
            <div className="generator__field">
              <label htmlFor="bulk-suffix" className="generator__label">
                Suffiks (valgfritt)
              </label>
              <input
                id="bulk-suffix"
                type="text"
                className="generator__input"
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
              />
            </div>
          </div>
          {startInvalid && (
            <p className="generator__bulk-error" role="alert">
              Startnummer må være et tall.
            </p>
          )}
          {seriesValues.length > 0 && (
            <p className="generator__help">
              Første verdi: {shorten(seriesValues[0])} - siste:{" "}
              {shorten(seriesValues[seriesValues.length - 1])}. Startnummerets
              lengde beholdes, så 001 gir 001, 002, 003.
            </p>
          )}
        </div>
      )}

      {entries.length > 0 && (
        <p className="generator__info" role="status">
          {validValues.length} av {entries.length} linjer klare
          {skipped.length > 0 && ` - ${skipped.length} hoppes over`}.
        </p>
      )}
      {truncated && (
        <p className="generator__bulk-error" role="alert">
          Maks {MAX_BULK_LINES} linjer - kun de første {MAX_BULK_LINES} brukes.
        </p>
      )}
      {skipped.length > 0 && (
        <details className="generator__skipped">
          <summary>Linjer som hoppes over ({skipped.length})</summary>
          <ul>
            {skipped.map((line) => (
              <li key={line.lineNo}>
                Linje {line.lineNo}: «{shorten(line.raw)}» - {line.message}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
};

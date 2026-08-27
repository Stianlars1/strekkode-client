"use client";
import { createBarcode, updateBarcodeDownloadedCount } from "@/utils/supabase/crud";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";
import {
  BarcodeOptions,
  BulkProgress,
  copyPngToClipboard,
  downloadBarcode,
  drawBarcodeInto,
  generateBulkZip,
  renderBarcodeSvg,
  svgToDataUri,
} from "./barcodeUtils";
import {
  LabelPresetId,
  PrintJob,
  PrintSheet,
  resolveLabelGrid,
} from "./printSheet";
import {
  FORMAT_GROUPS,
  FormatId,
  getFormatDef,
  suggestFormat,
  validateForFormat,
} from "./lib/formats";
import "./css/barcodeContainer.css";

/* Bulk mode loads on first use so single mode stays light. */
const BulkPanel = dynamic(
  () => import("./bulkPanel").then((m) => m.BulkPanel),
  {
    ssr: false,
    loading: () => <p className="generator__help">Laster inn bulk-verktøyet...</p>,
  }
);

const DEBOUNCE_MS = 150;

interface Customization {
  width: number;
  height: number;
  displayValue: boolean;
  margin: number;
}

const DEFAULT_CUSTOMIZATION: Customization = {
  width: 2,
  height: 100,
  displayValue: true,
  margin: 10,
};

export const BarcodeContainer = () => {
  const [rawValue, setRawValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [formatId, setFormatId] = useState<FormatId>("CODE128");
  const [custom, setCustom] = useState<Customization>(DEFAULT_CUSTOMIZATION);
  const [scale, setScale] = useState(3);
  const [wantTransparent, setWantTransparent] = useState(false);
  const [wantNoText, setWantNoText] = useState(false);
  const [copied, setCopied] = useState(false);
  const [renderFailed, setRenderFailed] = useState(false);
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [bulkMounted, setBulkMounted] = useState(false);
  const [bulkValues, setBulkValues] = useState<string[]>([]);
  const [bulkProgress, setBulkProgress] = useState<BulkProgress | null>(null);
  const [labelPreset, setLabelPreset] = useState<LabelPresetId>("L7160");
  const [customCols, setCustomCols] = useState("3");
  const [customRows, setCustomRows] = useState("8");
  const [labelCount, setLabelCount] = useState("");
  const [printJob, setPrintJob] = useState<PrintJob | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(rawValue), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [rawValue]);

  const formatDef = getFormatDef(formatId);
  const validation = useMemo(
    () => validateForFormat(formatId, debouncedValue),
    [formatId, debouncedValue]
  );
  const suggestion = useMemo(
    () => suggestFormat(debouncedValue, formatId),
    [debouncedValue, formatId]
  );

  const barcodeOptions: BarcodeOptions = useMemo(
    () => ({
      format: formatDef.jsbFormat,
      width: custom.width,
      height: custom.height,
      displayValue: custom.displayValue,
      margin: custom.margin,
    }),
    [formatDef.jsbFormat, custom]
  );

  const hasTyped = debouncedValue.trim().length > 0;
  const showError = hasTyped && !validation.ok && Boolean(validation.message);
  const canDownload = validation.ok && !renderFailed;

  const previewValue =
    mode === "single"
      ? validation.ok
        ? validation.renderValue
        : null
      : bulkValues[0] ?? null;

  useEffect(() => {
    setRenderFailed(false);
  }, [previewValue, formatId]);

  const registerDownload = () => {
    // Fire-and-forget stats - never in the way of the download itself.
    void createBarcode(validation.renderValue).catch(() => {});
    void updateBarcodeDownloadedCount(validation.renderValue).catch(() => {});
  };

  const handleDownload = async (kind: "png" | "svg") => {
    if (!canDownload) return;
    registerDownload();
    await downloadBarcode(validation.renderValue, barcodeOptions, kind, scale, {
      transparent: wantTransparent,
      noText: wantNoText,
    });
  };

  const closePrintJob = useCallback(() => setPrintJob(null), []);

  const labelGrid = resolveLabelGrid(
    labelPreset,
    Number(customCols),
    Number(customRows)
  );
  const perSheet = labelGrid.cols * labelGrid.rows;
  const canPrint = mode === "single" ? canDownload : bulkValues.length > 0;

  const handlePrint = () => {
    let values: string[];
    if (mode === "single") {
      if (!canDownload) return;
      const copies = Math.min(
        Math.max(Math.floor(Number(labelCount)) || perSheet, 1),
        500
      );
      values = Array<string>(copies).fill(validation.renderValue);
    } else {
      values = bulkValues;
    }
    if (values.length === 0) return;
    const uris = values.map((value) =>
      svgToDataUri(renderBarcodeSvg(value, barcodeOptions))
    );
    setPrintJob({ grid: labelGrid, uris });
  };

  const handleBulkDownload = async (kind: "png" | "svg") => {
    if (bulkValues.length === 0 || bulkProgress) return;
    try {
      await generateBulkZip(bulkValues, barcodeOptions, kind, scale, setBulkProgress);
    } finally {
      setBulkProgress(null);
    }
  };

  const handleCopy = async () => {
    if (!canDownload) return;
    registerDownload();
    const ok = await copyPngToClipboard(
      validation.renderValue,
      barcodeOptions,
      scale
    );
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="generator" aria-label="Strekkodegenerator">
      <div className="generator__form">
        <fieldset className="generator__seg">
          <legend className="generator__sr-only">Modus</legend>
          <input
            type="radio"
            id="mode-single"
            name="generator-mode"
            className="generator__seg-input"
            checked={mode === "single"}
            onChange={() => setMode("single")}
          />
          <label htmlFor="mode-single" className="generator__seg-label">
            Én strekkode
          </label>
          <input
            type="radio"
            id="mode-bulk"
            name="generator-mode"
            className="generator__seg-input"
            checked={mode === "bulk"}
            onChange={() => {
              setMode("bulk");
              setBulkMounted(true);
            }}
          />
          <label htmlFor="mode-bulk" className="generator__seg-label">
            Flere strekkoder
          </label>
        </fieldset>

        <div className="generator__field">
          <label htmlFor="format" className="generator__label">
            Format
          </label>
          <select
            id="format"
            className="generator__select"
            value={formatId}
            onChange={(e) => setFormatId(e.target.value as FormatId)}
          >
            {FORMAT_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.formats.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <p className="generator__help">{formatDef.help}</p>
        </div>

        {bulkMounted && (
          <div hidden={mode !== "bulk"}>
            <BulkPanel formatId={formatId} onValidValuesChange={setBulkValues} />
          </div>
        )}

        {mode === "single" && (
        <div className="generator__field">
          <label htmlFor="barcode" className="generator__label">
            Verdi
          </label>
          <input
            type="text"
            id="barcode"
            name="barcode"
            className="generator__input"
            placeholder="Skriv inn verdi her..."
            inputMode={formatDef.inputMode}
            value={rawValue}
            onChange={(e) => setRawValue(e.target.value)}
            aria-invalid={showError || undefined}
            aria-describedby={showError ? "barcode-error" : undefined}
          />
          {showError && (
            <div
              id="barcode-error"
              className="generator__error"
              role="alert"
              key={`${formatId}|${validation.message}`}
            >
              <p>{validation.message}</p>
              {validation.fix && (
                <button
                  type="button"
                  className="generator__fix"
                  onClick={() => setRawValue(validation.fix!.value)}
                >
                  {validation.fix.label}
                </button>
              )}
            </div>
          )}
          {validation.ok && validation.info && (
            <p className="generator__info" role="status">
              {validation.info}
            </p>
          )}
          {suggestion && (
            <p className="generator__hint">
              {suggestion.message} -{" "}
              <button
                type="button"
                className="generator__hint-switch"
                onClick={() => setFormatId(suggestion.formatId)}
              >
                bytt format?
              </button>
            </p>
          )}
        </div>
        )}

        <details className="generator__details">
          <summary>Tilpass strekkoden</summary>
          <div className="generator__details-body">
            <div className="generator__range-row">
              <label htmlFor="opt-width">Strektykkelse</label>
              <input
                type="range"
                id="opt-width"
                min={1}
                max={4}
                step={0.5}
                value={custom.width}
                onChange={(e) =>
                  setCustom({ ...custom, width: Number(e.target.value) })
                }
              />
              <output htmlFor="opt-width">{custom.width}</output>
            </div>
            <div className="generator__range-row">
              <label htmlFor="opt-height">Høyde</label>
              <input
                type="range"
                id="opt-height"
                min={40}
                max={160}
                step={10}
                value={custom.height}
                onChange={(e) =>
                  setCustom({ ...custom, height: Number(e.target.value) })
                }
              />
              <output htmlFor="opt-height">{custom.height}</output>
            </div>
            <div className="generator__range-row">
              <label htmlFor="opt-margin">Marg (lyssone)</label>
              <input
                type="range"
                id="opt-margin"
                min={0}
                max={40}
                step={2}
                value={custom.margin}
                onChange={(e) =>
                  setCustom({ ...custom, margin: Number(e.target.value) })
                }
              />
              <output htmlFor="opt-margin">{custom.margin}</output>
            </div>
            <p className="generator__help">
              Anbefalt marg er minst 10 for skanning på trykk.
            </p>
            <div className="generator__check-row">
              <input
                type="checkbox"
                id="opt-text"
                checked={custom.displayValue}
                onChange={(e) =>
                  setCustom({ ...custom, displayValue: e.target.checked })
                }
              />
              <label htmlFor="opt-text">Vis tekst under koden</label>
            </div>
          </div>
        </details>

        <details className="generator__details">
          <summary>Nedlastingsvalg</summary>
          <div className="generator__details-body">
            <div className="generator__field">
              <label htmlFor="opt-scale" className="generator__label">
                PNG-oppløsning
              </label>
              <select
                id="opt-scale"
                className="generator__select"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
              >
                <option value={1}>1× - skjerm</option>
                <option value={3}>3× - standard</option>
                <option value={6}>6× - trykk (ca. 300 DPI)</option>
              </select>
            </div>
            {mode === "single" && (
              <>
                <div className="generator__check-row">
                  <input
                    type="checkbox"
                    id="opt-transparent"
                    checked={wantTransparent}
                    onChange={(e) => setWantTransparent(e.target.checked)}
                  />
                  <label htmlFor="opt-transparent">
                    Også med gjennomsiktig bakgrunn
                  </label>
                </div>
                <div className="generator__check-row">
                  <input
                    type="checkbox"
                    id="opt-notext"
                    checked={wantNoText}
                    onChange={(e) => setWantNoText(e.target.checked)}
                  />
                  <label htmlFor="opt-notext">Også uten tekst</label>
                </div>
                <p className="generator__help">
                  Flere varianter samles automatisk i én .zip.
                </p>
              </>
            )}
          </div>
        </details>

        <details className="generator__details">
          <summary>Skriv ut etiketter</summary>
          <div className="generator__details-body">
            <div className="generator__field">
              <label htmlFor="label-preset" className="generator__label">
                Etikettark
              </label>
              <select
                id="label-preset"
                className="generator__select"
                value={labelPreset}
                onChange={(e) => setLabelPreset(e.target.value as LabelPresetId)}
              >
                <option value="L7160">
                  Avery L7160 - 3×7, 63.5×38.1 mm
                </option>
                <option value="L7651">
                  Avery L7651 - 5×13, 38.1×21.2 mm
                </option>
                <option value="custom">Egendefinert rutenett</option>
              </select>
            </div>
            {labelPreset === "custom" && (
              <div className="generator__series">
                <div className="generator__field">
                  <label htmlFor="custom-cols" className="generator__label">
                    Kolonner
                  </label>
                  <input
                    id="custom-cols"
                    type="number"
                    min={1}
                    max={8}
                    className="generator__input"
                    value={customCols}
                    onChange={(e) => setCustomCols(e.target.value)}
                  />
                </div>
                <div className="generator__field">
                  <label htmlFor="custom-rows" className="generator__label">
                    Rader
                  </label>
                  <input
                    id="custom-rows"
                    type="number"
                    min={1}
                    max={20}
                    className="generator__input"
                    value={customRows}
                    onChange={(e) => setCustomRows(e.target.value)}
                  />
                </div>
              </div>
            )}
            {mode === "single" && (
              <div className="generator__field">
                <label htmlFor="label-count" className="generator__label">
                  Antall etiketter
                </label>
                <input
                  id="label-count"
                  type="number"
                  min={1}
                  max={500}
                  className="generator__input"
                  placeholder={`${perSheet} (fullt ark)`}
                  value={labelCount}
                  onChange={(e) => setLabelCount(e.target.value)}
                />
              </div>
            )}
            <p className="generator__help">
              {mode === "bulk"
                ? `Skriver ut alle klare strekkoder på A4-ark med ${perSheet} etiketter per ark.`
                : "Skrives ut på A4-etikettark."}{" "}
              Velg 100 % størrelse (ingen skalering) i utskriftsdialogen.
            </p>
            <button
              type="button"
              className="button button--secondary generator__print"
              disabled={!canPrint}
              onClick={handlePrint}
            >
              Skriv ut
            </button>
          </div>
        </details>

        {mode === "single" ? (
          <div className="generator__actions">
            <button
              type="button"
              className="button button--primary generator__download"
              disabled={!canDownload}
              onClick={() => handleDownload("png")}
            >
              Last ned PNG
            </button>
            <button
              type="button"
              className="button button--secondary"
              disabled={!canDownload}
              onClick={() => handleDownload("svg")}
            >
              SVG
            </button>
            <button
              type="button"
              className="button button--secondary generator__copy"
              disabled={!canDownload}
              onClick={handleCopy}
              aria-label={copied ? "Kopiert til utklippstavlen" : "Kopier til utklippstavlen"}
            >
              {copied ? <FiCheck aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
            </button>
          </div>
        ) : (
          <div className="generator__actions">
            <button
              type="button"
              className="button button--primary generator__download"
              disabled={bulkValues.length === 0 || Boolean(bulkProgress)}
              onClick={() => handleBulkDownload("png")}
            >
              Last ned ZIP (PNG)
            </button>
            <button
              type="button"
              className="button button--secondary"
              disabled={bulkValues.length === 0 || Boolean(bulkProgress)}
              onClick={() => handleBulkDownload("svg")}
            >
              ZIP (SVG)
            </button>
          </div>
        )}

        {bulkProgress && (
          <div className="generator__progress" role="status">
            <progress value={bulkProgress.done} max={bulkProgress.total} />
            <span>
              {bulkProgress.zipping
                ? "Pakker zip..."
                : `Genererer ${bulkProgress.done} av ${bulkProgress.total}...`}
            </span>
          </div>
        )}

        <p className="generator__qr-note">
          Trenger du QR-kode? Prøv søstertjenesten vår{" "}
          <a href="https://qr-kode.app" target="_blank" rel="noopener noreferrer">
            qr-kode.app
          </a>
          .
        </p>
      </div>

      <div className="generator__preview">
        {previewValue && !renderFailed ? (
          <LivePreview
            key={`${previewValue}|${formatDef.jsbFormat}`}
            value={previewValue}
            options={barcodeOptions}
            onRenderResult={(ok) => setRenderFailed(!ok)}
          />
        ) : (
          <div className="generator__placeholder" aria-hidden="true">
            <span>
              {renderFailed
                ? "Verdien kan ikke kodes i valgt format"
                : "Forhåndsvisning"}
            </span>
          </div>
        )}
        <span className="generator__caption">
          {mode === "single"
            ? "Forhåndsvisning - oppdateres mens du skriver"
            : bulkValues.length > 0
              ? `Forhåndsvisning av første strekkode - ${bulkValues.length} klare`
              : "Forhåndsvisning av første strekkode"}
        </span>
      </div>

      {printJob && <PrintSheet job={printJob} onDone={closePrintJob} />}
    </section>
  );
};

const LivePreview = ({
  value,
  options,
  onRenderResult,
}: {
  value: string;
  options: BarcodeOptions;
  onRenderResult: (ok: boolean) => void;
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    try {
      drawBarcodeInto(svgRef.current, value, options);
      onRenderResult(true);
    } catch {
      onRenderResult(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, options]);

  return (
    <div
      className="generator__preview-card"
      role="img"
      aria-label={`Strekkode for verdien ${value}`}
    >
      <svg ref={svgRef} />
    </div>
  );
};

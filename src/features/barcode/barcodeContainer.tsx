"use client";
import { createBarcode, updateBarcodeDownloadedCount } from "@/utils/supabase/crud";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";
import {
  BarcodeOptions,
  copyPngToClipboard,
  downloadBarcode,
  drawBarcodeInto,
} from "./barcodeUtils";
import {
  FORMAT_GROUPS,
  FormatId,
  getFormatDef,
  suggestFormat,
  validateForFormat,
} from "./lib/formats";
import "./css/barcodeContainer.css";

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

  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(rawValue), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [rawValue]);

  useEffect(() => {
    setRenderFailed(false);
  }, [debouncedValue, formatId]);

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

  const registerDownload = () => {
    // Fire-and-forget stats — never in the way of the download itself.
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
              {suggestion.message} —{" "}
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
                <option value={1}>1× — skjerm</option>
                <option value={3}>3× — standard</option>
                <option value={6}>6× — trykk (ca. 300 DPI)</option>
              </select>
            </div>
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
          </div>
        </details>

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

        <p className="generator__qr-note">
          Trenger du QR-kode? Prøv søstertjenesten vår{" "}
          <a href="https://qr-kode.app" target="_blank" rel="noopener noreferrer">
            qr-kode.app
          </a>
          .
        </p>
      </div>

      <div className="generator__preview">
        {validation.ok && !renderFailed ? (
          <LivePreview
            key={`${validation.renderValue}|${formatDef.jsbFormat}`}
            value={validation.renderValue}
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
          Forhåndsvisning — oppdateres mens du skriver
        </span>
      </div>
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

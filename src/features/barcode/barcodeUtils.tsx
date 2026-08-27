"use client";
import { saveAs } from "file-saver";
import JsBarcode from "jsbarcode";
import JSZip from "jszip";

export interface BarcodeOptions {
  format: string;
  width: number;
  height: number;
  displayValue: boolean;
  margin: number;
  background?: string;
}

const JSBARCODE_DEFAULTS = {
  lineColor: "#000000",
  font: "monospace",
  fontSize: 16,
  textMargin: 6,
};

/* Renders a barcode into a detached SVG node — used for downloads so no
   hidden React components have to stay mounted. Throws on invalid input;
   callers validate first. */
export const renderBarcodeSvg = (
  value: string,
  options: BarcodeOptions
): SVGSVGElement => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  JsBarcode(svg, value, {
    ...JSBARCODE_DEFAULTS,
    format: options.format,
    width: options.width,
    height: options.height,
    displayValue: options.displayValue,
    margin: options.margin,
    background: options.background ?? "#ffffff",
  });
  return svg;
};

export const drawBarcodeInto = (
  svg: SVGSVGElement,
  value: string,
  options: BarcodeOptions
): void => {
  JsBarcode(svg, value, {
    ...JSBARCODE_DEFAULTS,
    format: options.format,
    width: options.width,
    height: options.height,
    displayValue: options.displayValue,
    margin: options.margin,
    background: options.background ?? "#ffffff",
  });
};

const svgToString = (svg: SVGSVGElement): string =>
  new XMLSerializer().serializeToString(svg);

export const convertSvgToPngBlob = async (
  svgElement: SVGSVGElement,
  scale = 3
): Promise<Blob> => {
  const width =
    svgElement.width?.baseVal?.value ||
    svgElement.getBoundingClientRect().width;
  const height =
    svgElement.height?.baseVal?.value ||
    svgElement.getBoundingClientRect().height;
  if (!width || !height) throw new Error("SVG has no dimensions");

  const svgData = svgToString(svgElement);
  const base64EncodedSvg = btoa(unescape(encodeURIComponent(svgData)));

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  const img = new Image();
  img.src = `data:image/svg+xml;base64,${base64EncodedSvg}`;
  await new Promise((resolve, reject) => {
    img.onload = () => resolve(true);
    img.onerror = reject;
  });

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to create PNG blob"));
    }, "image/png");
  });
};

export const sanitizeFilename = (value: string): string =>
  value.replace(/[^a-zA-Z0-9_-]+/g, "_").slice(0, 40) || "strekkode";

export interface VariantSelection {
  transparent: boolean;
  noText: boolean;
}

interface Variant {
  suffix: string;
  options: BarcodeOptions;
}

const buildVariants = (
  base: BarcodeOptions,
  selection: VariantSelection
): Variant[] => {
  const variants: Variant[] = [{ suffix: "", options: base }];
  if (selection.transparent) {
    variants.push({
      suffix: "-transparent",
      options: { ...base, background: "transparent" },
    });
  }
  if (selection.noText) {
    variants.push({
      suffix: "-uten-tekst",
      options: { ...base, displayValue: false },
    });
  }
  if (selection.transparent && selection.noText) {
    variants.push({
      suffix: "-transparent-uten-tekst",
      options: { ...base, background: "transparent", displayValue: false },
    });
  }
  return variants;
};

/* One selected variant -> single file; several -> one zip. */
export const downloadBarcode = async (
  value: string,
  base: BarcodeOptions,
  kind: "png" | "svg",
  scale: number,
  selection: VariantSelection
): Promise<void> => {
  const name = sanitizeFilename(value);
  const variants = buildVariants(base, selection);

  if (variants.length === 1) {
    const svg = renderBarcodeSvg(value, variants[0].options);
    if (kind === "svg") {
      const blob = new Blob([svgToString(svg)], {
        type: "image/svg+xml;charset=utf-8",
      });
      saveAs(blob, `${name}.svg`);
    } else {
      const blob = await convertSvgToPngBlob(svg, scale);
      saveAs(blob, `${name}.png`);
    }
    return;
  }

  const zip = new JSZip();
  for (const variant of variants) {
    const svg = renderBarcodeSvg(value, variant.options);
    if (kind === "svg") {
      zip.file(`${name}${variant.suffix}.svg`, svgToString(svg));
    } else {
      zip.file(
        `${name}${variant.suffix}.png`,
        await convertSvgToPngBlob(svg, scale)
      );
    }
  }
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, `${name}.zip`);
};

export const copyPngToClipboard = async (
  value: string,
  base: BarcodeOptions,
  scale: number
): Promise<boolean> => {
  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
    return false;
  }
  try {
    const svg = renderBarcodeSvg(value, base);
    const blob = await convertSvgToPngBlob(svg, scale);
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob }),
    ]);
    return true;
  } catch {
    return false;
  }
};

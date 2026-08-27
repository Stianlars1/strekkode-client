"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import "./css/printSheet.css";

export type LabelPresetId = "L7160" | "L7651" | "custom";

/* All dimensions in mm on an A4 sheet (210 x 297). */
export interface LabelGrid {
  cols: number;
  rows: number;
  labelW: number;
  labelH: number;
  marginLeft: number;
  marginTop: number;
  gapX: number;
  gapY: number;
}

/* Avery specs: label size + sheet margins; columns are separated by a 2.5 mm
   gutter, rows sit edge to edge. */
const AVERY_PRESETS: Record<Exclude<LabelPresetId, "custom">, LabelGrid> = {
  L7160: {
    cols: 3,
    rows: 7,
    labelW: 63.5,
    labelH: 38.1,
    marginLeft: 7.25,
    marginTop: 15.15,
    gapX: 2.5,
    gapY: 0,
  },
  L7651: {
    cols: 5,
    rows: 13,
    labelW: 38.1,
    labelH: 21.2,
    marginLeft: 4.75,
    marginTop: 10.7,
    gapX: 2.5,
    gapY: 0,
  },
};

const CUSTOM_PAGE_MARGIN = 10;

export const resolveLabelGrid = (
  preset: LabelPresetId,
  customCols: number,
  customRows: number
): LabelGrid => {
  if (preset !== "custom") return AVERY_PRESETS[preset];
  const cols = Math.min(Math.max(Math.floor(customCols) || 1, 1), 8);
  const rows = Math.min(Math.max(Math.floor(customRows) || 1, 1), 20);
  return {
    cols,
    rows,
    labelW: (210 - CUSTOM_PAGE_MARGIN * 2) / cols,
    labelH: (297 - CUSTOM_PAGE_MARGIN * 2) / rows,
    marginLeft: CUSTOM_PAGE_MARGIN,
    marginTop: CUSTOM_PAGE_MARGIN,
    gapX: 0,
    gapY: 0,
  };
};

export interface PrintJob {
  grid: LabelGrid;
  /* One data-URI-encoded SVG per label, in print order. */
  uris: string[];
}

const chunk = <T,>(items: T[], size: number): T[][] => {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
};

/* Mounted only while a job is active: tags <body> so the print stylesheet can
   hide the rest of the page, fires window.print once the images have a frame
   to load in, and reports back on afterprint. */
export const PrintSheet = ({
  job,
  onDone,
}: {
  job: PrintJob;
  onDone: () => void;
}) => {
  useEffect(() => {
    document.body.classList.add("printing-labels");
    const timer = window.setTimeout(() => window.print(), 150);
    window.addEventListener("afterprint", onDone);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("afterprint", onDone);
      document.body.classList.remove("printing-labels");
    };
  }, [job, onDone]);

  const { grid } = job;
  const pages = chunk(job.uris, grid.cols * grid.rows);

  return createPortal(
    <div className="print-sheet" aria-hidden="true">
      {pages.map((page, pageIndex) => (
        <div className="print-sheet__page" key={pageIndex}>
          {page.map((uri, i) => {
            const col = i % grid.cols;
            const row = Math.floor(i / grid.cols);
            return (
              <div
                key={i}
                className="print-sheet__cell"
                style={{
                  left: `${grid.marginLeft + col * (grid.labelW + grid.gapX)}mm`,
                  top: `${grid.marginTop + row * (grid.labelH + grid.gapY)}mm`,
                  width: `${grid.labelW}mm`,
                  height: `${grid.labelH}mm`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={uri} alt="" />
              </div>
            );
          })}
        </div>
      ))}
    </div>,
    document.body
  );
};

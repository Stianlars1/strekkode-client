"use client";
import { saveAs } from "file-saver";
import JSZip from "jszip";

export const downloadAsZip = async (
  svgElement: SVGElement,
  svgTransparentElement: SVGElement,
  svgNoTextElement: SVGElement,
  svgTransparentNoTextElement: SVGElement,
  filenamePrefix: string
) => {
  const zip = new JSZip();

  // Check if the svgElement is truly an SVGElement and not null
  if (svgElement && svgElement instanceof SVGElement) {
    // Serialize the SVG elements to strings
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgTransparentData = new XMLSerializer().serializeToString(
      svgTransparentElement
    );
    const svgNoTextData = new XMLSerializer().serializeToString(
      svgNoTextElement
    );
    const svgTransparentNoTextData = new XMLSerializer().serializeToString(
      svgTransparentNoTextElement
    );

    // Convert the SVG elements to PNG blobs
    const pngBlob = await convertSvgToPngBlob(svgElement);
    const pngTransparentBlob = await convertSvgToPngBlob(svgTransparentElement);
    const pngNoTextBlob = await convertSvgToPngBlob(svgNoTextElement);
    const pngTransparentNoTextBlob = await convertSvgToPngBlob(
      svgTransparentNoTextElement
    );

    // ZIP the SVG images
    zip.file(`svg/${filenamePrefix}.svg`, svgData);
    zip.file(`svg/${filenamePrefix}-transparent.svg`, svgTransparentData);
    zip.file(`svg/${filenamePrefix}-no-text.svg`, svgNoTextData);
    zip.file(
      `svg/${filenamePrefix}-transparent-no-text.svg`,
      svgTransparentNoTextData
    );

    // ZIP the PNG images
    zip.file(`png/${filenamePrefix}.png`, pngBlob);
    zip.file(`png/${filenamePrefix}-transparent.png`, pngTransparentBlob);
    zip.file(`png/${filenamePrefix}-no-text.png`, pngNoTextBlob);
    zip.file(
      `png/${filenamePrefix}-transparent-no-text.png`,
      pngTransparentNoTextBlob
    );
  }

  // Only generate the ZIP if it has contents
  if (zip.file.length > 0) {
    zip.generateAsync({ type: "blob" }).then(function (content) {
      saveAs(content, `${filenamePrefix}.zip`);
    });
  } else {
    console.error("No elements to add to ZIP.");
  }
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link); // Required for Firefox
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url); // Clean up
};

export const downloadBarcodes = async (
  svg: SVGElement,
  svgTransparent: SVGElement,
  svgNoText: SVGElement,
  svgTransparentNoText: SVGElement,
  filenamePrefix: string
) => {
  if (!svg || !svgTransparent || !svgNoText || !svgTransparentNoText) return;
  // Serialize the SVG elements to strings
  const svgData = new XMLSerializer().serializeToString(svg);
  const svgTransparentData = new XMLSerializer().serializeToString(
    svgTransparent
  );
  const svgNoTextData = new XMLSerializer().serializeToString(svgNoText);
  const svgTransparentNoTextData = new XMLSerializer().serializeToString(
    svgTransparentNoText
  );

  // Create SVG blobs
  const svgBlob = new Blob([svgData], {
    type: "image/svg+xml;charset=utf-8",
  });
  const svgTransparentBlob = new Blob([svgTransparentData], {
    type: "image/svg+xml;charset=utf-8",
  });
  const svgNoTextBlob = new Blob([svgNoTextData], {
    type: "image/svg+xml;charset=utf-8",
  });
  const svgTransparentNoTextBlob = new Blob([svgTransparentNoTextData], {
    type: "image/svg+xml;charset=utf-8",
  });

  // Convert the SVG elements to PNG blobs
  const pngBlob = await convertSvgToPngBlob(svg);
  const pngTransparentBlob = await convertSvgToPngBlob(svgTransparent);
  const pngNoTextBlob = await convertSvgToPngBlob(svgNoText);
  const pngTransparentNoTextBlob = await convertSvgToPngBlob(
    svgTransparentNoText
  );

  // SVG
  downloadBlob(svgBlob, `${filenamePrefix}.svg`);
  downloadBlob(svgTransparentBlob, `${filenamePrefix}-transparent.svg`);
  downloadBlob(svgNoTextBlob, `${filenamePrefix}-no-text.svg`);
  downloadBlob(
    svgTransparentNoTextBlob,
    `${filenamePrefix}-transparent-no-text.svg`
  );

  // PNG
  downloadBlob(pngBlob, `${filenamePrefix}-transparent.png`);
  downloadBlob(pngTransparentBlob, `${filenamePrefix}-transparent.png`);
  downloadBlob(pngNoTextBlob, `${filenamePrefix}-no-text.png`);
  downloadBlob(
    pngTransparentNoTextBlob,
    `${filenamePrefix}-transparent-no-text.png`
  );
};

export const convertSvgToPngBlob = async (
  svgElement: SVGElement,
  scale = 3
) => {
  if (!svgElement) throw new Error("SVG element not found");

  // Clone the SVG element to avoid modifying the original
  const clonedSvgElement = svgElement.cloneNode(true) as SVGElement;

  // Attempt to read the viewBox attribute directly
  const viewBox = clonedSvgElement.getAttribute("viewBox");
  // Assuming the viewBox is in the format "minX minY width height"
  const viewBoxValues = viewBox ? viewBox.split(" ") : [];
  const originalWidth =
    viewBoxValues.length === 4
      ? parseFloat(viewBoxValues[2])
      : clonedSvgElement.clientWidth ||
        clonedSvgElement.getBoundingClientRect().width;
  const originalHeight =
    viewBoxValues.length === 4
      ? parseFloat(viewBoxValues[3])
      : clonedSvgElement.clientHeight ||
        clonedSvgElement.getBoundingClientRect().height;

  // Adjusted dimensions
  const scaledWidth = originalWidth * scale;
  const scaledHeight = originalHeight * scale;

  // Update the clone's attributes to reflect the new size
  clonedSvgElement.setAttribute("width", `${scaledWidth}px`);
  clonedSvgElement.setAttribute("height", `${scaledHeight}px`);

  // Serialize the modified SVG to a string
  const svgData = new XMLSerializer().serializeToString(clonedSvgElement);
  const base64EncodedSvg = btoa(unescape(encodeURIComponent(svgData)));

  const canvas = document.createElement("canvas");
  canvas.width = scaledWidth;
  canvas.height = scaledHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  const img = new Image();
  img.src = `data:image/svg+xml;base64,${base64EncodedSvg}`;

  await new Promise((resolve, reject) => {
    img.onload = () => resolve(true);
    img.onerror = reject;
  });

  ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

  const format = "image/png";
  const pngBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to create PNG blob"));
    }, format);
  });

  return pngBlob;
};

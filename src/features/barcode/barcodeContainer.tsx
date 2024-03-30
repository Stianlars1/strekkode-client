"use client";
import { Modal } from "@/components/modal/modal";
import { Button } from "@/components/ui/button/button";
import { CreateBarcodeReturnType } from "@/types/types";
import { GeistSans } from "geist/font/sans";
import { useRef, useState } from "react";
import Barcode from "react-barcode";
import { useFormState } from "react-dom";
import { generateBarcode } from "./action";
import { downloadAsZip, downloadBarcodes } from "./barcodeUtils";
import { BarcodeInputContainer } from "./components/barcodeInput/barcodeInput";
import "./css/barcodeContainer.css";

export const BarcodeContainer = () => {
  const [state, dispatch] = useFormState(generateBarcode, undefined);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [saveAsZip, setSaveAsZip] = useState<boolean>(true);
  const svgBarcode = useRef<Barcode | null>(null);
  const svgTransparentBarcode = useRef<Barcode | null>(null);
  const svgNoTextBarcode = useRef<Barcode | null>(null);
  const svgTransparentNoTextBarcode = useRef<Barcode | null>(null);

  const showModal = renderModal(state) && isOpen;

  const handleDownload = async () => {
    const renderedSVGElement = svgBarcode?.current?.renderElementRef.current;
    const renderedTransparentSVGElement =
      svgTransparentBarcode?.current?.renderElementRef.current;
    const renderedSVGNoTextElement =
      svgNoTextBarcode?.current?.renderElementRef.current;
    const renderedSVGTransparentNoTextElement =
      svgTransparentNoTextBarcode?.current?.renderElementRef.current;

    if (
      !renderedSVGElement ||
      !renderedTransparentSVGElement ||
      !renderedSVGNoTextElement ||
      !renderedSVGTransparentNoTextElement
    )
      return;

    // Check user preference
    if (saveAsZip) {
      // User opted to save as ZIP
      await downloadAsZip(
        renderedSVGElement as SVGElement,
        renderedTransparentSVGElement as SVGElement,
        renderedSVGNoTextElement as SVGElement,
        renderedSVGTransparentNoTextElement as SVGElement,
        "strekkoder"
      );
    } else {
      // Download SVG and PNG individually
      await downloadBarcodes(
        renderedSVGElement as SVGElement,
        renderedTransparentSVGElement as SVGElement,
        renderedSVGNoTextElement as SVGElement,
        renderedSVGTransparentNoTextElement as SVGElement,
        "strekkode"
      );
    }
  };

  return (
    <section className={`barcode-container ${GeistSans.className}`}>
      <BarcodeInputContainer
        state={state}
        dispatch={dispatch}
        saveAsZip={saveAsZip}
        setSaveAsZip={() => setSaveAsZip(!saveAsZip)}
        onGenerateClick={() => setIsOpen(true)}
      />

      {showModal && (
        <Modal onClose={() => setIsOpen(false)} position="center">
          <div className="modal-content-barcode">
            <Barcode ref={svgBarcode} value={state?.barcodeValue || ""} />
            <div
              style={{
                visibility: "hidden",
                display: "none",
                position: "absolute",
              }}
            >
              <Barcode
                ref={svgTransparentBarcode}
                value={state?.barcodeValue || ""}
                background="transparent"
              />
              <Barcode
                ref={svgNoTextBarcode}
                value={state?.barcodeValue || ""}
                displayValue={false}
              />
              <Barcode
                ref={svgTransparentNoTextBarcode}
                value={state?.barcodeValue || ""}
                displayValue={false}
                background="transparent"
              />
            </div>
            <Button
              variant="primary"
              style={{
                backgroundColor: "hsl(240 5.9% 10%)",
                color: "hsl(0 0% 98%)",
              }}
              onClick={handleDownload}
            >
              Last ned strekkode
            </Button>
          </div>
        </Modal>
      )}
    </section>
  );
};

const renderModal = (state: CreateBarcodeReturnType | undefined): boolean => {
  return !!state?.isSuccess && !!state?.barcodeValue && !state.errorMessage;
};

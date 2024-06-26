"use client";
import { Button } from "@/components/ui/button/button";
import { CreateBarcodeReturnType } from "@/types/types";
import { useState } from "react";
import { FaCircleInfo } from "react-icons/fa6";
import { Tooltip } from "react-tooltip";
import "./css/barcodeInput.css";

export const BarcodeInputContainer = ({
  state,
  saveAsZip,
  setSaveAsZip,
  dispatch,
  onGenerateClick,
}: {
  state: CreateBarcodeReturnType | undefined;
  saveAsZip: boolean;
  setSaveAsZip?: () => void;
  dispatch: (payload: FormData) => void;
  onGenerateClick: () => void;
}) => {
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const showErrorMessage = Boolean(!state?.isSuccess && state?.errorMessage);
  return (
    <div className="input-container">
      <form
        className="input-container__form"
        action={dispatch}
        key={state?.isSuccess ? "true" : "false"}
      >
        <div className="input-container__form__input-content">
          <label className="input-container__form__input-content__label">
            Skriv inn verdi for strekkode
          </label>
          <input
            type="text"
            id="barcode"
            name="barcode"
            placeholder="Skriv inn verdi her..."
            aria-live="polite"
            aria-label="Skriv inn verdi her"
            className="input-container__form__input-content__input"
          />
          <InputError show={showErrorMessage} message={state?.errorMessage} />
          <div className="input-container__form__input-content__checkbox-container">
            <input
              type="checkbox"
              checked={saveAsZip}
              onChange={() => setSaveAsZip && setSaveAsZip()}
              className="input-container__form__input-content__checkbox-container__input"
            />

            <div className="input-container__form__input-content__checkbox-container__text">
              <p>Samle filer for nedlasting i .zip?</p>
              <a className="info-icon">
                <FaCircleInfo
                  tabIndex={0}
                  size={16}
                  className="input-container__form__input-content__checkbox-container__text__info"
                />
              </a>
              <Tooltip anchorSelect=".info-icon" place="top">
                Samler filene dine i én enkelt pakke for raskere og enklere
                nedlasting
              </Tooltip>
            </div>
          </div>
        </div>
        <Button
          variant="primary"
          className="input-container__form__button"
          type="submit"
          aria-label="Trykk for å generere strekkode"
          onClick={() => {
            onGenerateClick && onGenerateClick();
          }}
        >
          Generer strekkode
        </Button>
      </form>
    </div>
  );
};

const InputError = ({
  show,
  message,
}: {
  show: boolean;
  message: string | undefined;
}) => {
  return show ? (
    <div
      className="input-container__form__input-content__input-error"
      role="alert"
      aria-live="assertive"
      aria-label={message || "En generell error har oppstått (Sjekket VPN?)"}
      tabIndex={0}
    >
      <p>{message || "En generell error har oppstått (Sjekket VPN?)"}</p>
    </div>
  ) : null;
};

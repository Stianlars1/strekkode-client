"use client";
import { Button } from "@/components/ui/button/button";
import { CreateBarcodeReturnType } from "@/types/types";
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
  const showErrorMessage = Boolean(!state?.isSuccess && state?.errorMessage);
  return (
    <div className="input-container">
      <form
        className="input-container__form"
        action={dispatch}
        key={state?.isSuccess ? "true" : "false"}
      >
        <div className="input-container__form__input-content">
          <label
            htmlFor="barcode"
            className="input-container__form__input-content__label"
          >
            Skriv inn verdi for strekkode
          </label>
          <input
            type="text"
            id="barcode"
            name="barcode"
            placeholder="Skriv inn verdi her..."
            aria-invalid={showErrorMessage || undefined}
            aria-describedby={showErrorMessage ? "barcode-error" : undefined}
            className="input-container__form__input-content__input"
          />
          <InputError
            key={state?.ts}
            show={showErrorMessage}
            message={state?.errorMessage}
          />
          <div className="input-container__form__input-content__checkbox-container">
            <input
              type="checkbox"
              id="save-as-zip"
              checked={saveAsZip}
              onChange={() => setSaveAsZip && setSaveAsZip()}
              className="input-container__form__input-content__checkbox-container__input"
            />

            <div className="input-container__form__input-content__checkbox-container__text">
              <label htmlFor="save-as-zip">
                Samle filer for nedlasting i .zip?
              </label>
              <button
                type="button"
                className="info-icon"
                aria-label="Mer informasjon om zip-nedlasting"
              >
                <FaCircleInfo size={16} aria-hidden="true" />
              </button>
              <Tooltip
                anchorSelect=".info-icon"
                place="top"
                delayShow={300}
                opacity={1}
              >
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
      id="barcode-error"
      className="input-container__form__input-content__input-error"
      role="alert"
    >
      <p>{message || "En generell feil har oppstått"}</p>
    </div>
  ) : null;
};

"use client";
import { ReactNode, useEffect, useRef, useState } from "react";
import { IoIosCloseCircle } from "react-icons/io";
import "./css/modal.css";

interface ModalProps {
  isOpen: boolean;
  hasCloseBtn?: boolean;
  onClose?: () => void;
  children: ReactNode;
  noPadding?: boolean;
  ariaLabel?: string;
}

export const Modal = ({
  isOpen,
  hasCloseBtn,
  onClose,
  children,
  noPadding,
  ariaLabel,
}: ModalProps) => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const modalRef = useRef<HTMLDialogElement | null>(null);

  const handleCloseModal = () => {
    if (onClose) {
      onClose();
    }
  };

  useEffect(() => {
    const modalElement = modalRef.current;
    if (!modalElement) return;

    const handleScroll = () => {
      setShowScrollButton(modalElement.scrollTop > 80);
    };

    if (isOpen && !modalElement.open) {
      modalElement.showModal();
    } else if (!isOpen && modalElement.open) {
      modalElement.close();
    }

    modalElement.addEventListener("scroll", handleScroll);
    return () => {
      modalElement.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen]);

  return (
    <dialog
      id="modal"
      ref={modalRef}
      className={`modal ${noPadding ? "no-padding" : ""}`}
      aria-label={ariaLabel}
      onCancel={(event) => {
        // Native Escape: let the dialog close, but keep parent state in sync
        // so the next open works (the old desync bug).
        event.preventDefault();
        handleCloseModal();
      }}
    >
      <div className="modal-backdrop" onClick={handleCloseModal} />
      {showScrollButton && (
        <button
          type="button"
          className="scroll-button"
          onClick={handleCloseModal}
        >
          <IoIosCloseCircle size={24} aria-hidden="true" /> Lukk
        </button>
      )}
      {hasCloseBtn && !showScrollButton && (
        <button
          type="button"
          className="close-button"
          aria-label="Lukk"
          onClick={handleCloseModal}
        >
          <IoIosCloseCircle size={32} aria-hidden="true" />
        </button>
      )}
      {children}
    </dialog>
  );
};

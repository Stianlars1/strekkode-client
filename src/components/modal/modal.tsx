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
}
export const Modal = ({
  isOpen,
  hasCloseBtn,
  onClose,
  children,
  noPadding,
}: ModalProps) => {
  const [isModalOpen, setModalOpen] = useState(isOpen);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const modalRef = useRef<HTMLDialogElement | null>(null);

  const handleCloseModal = () => {
    if (onClose) {
      onClose();
    }
    setModalOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "Escape") {
      handleCloseModal();
    }
  };

  useEffect(() => {
    setModalOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    const modalElement = modalRef.current;
    if (!modalElement) return;

    const handleScroll = () => {
      // Sjekk scroll-posisjonen til modal__content
      const isScrolled = modalElement.scrollTop > 80;
      if (isScrolled) {
        setShowScrollButton(isScrolled);
      } else {
        setShowScrollButton(false);
      }
    };

    if (modalElement) {
      if (isModalOpen) {
        modalElement.showModal();
      } else {
        modalElement.close();
      }
    }
    modalElement.addEventListener("scroll", handleScroll);

    return () => {
      modalElement.removeEventListener("scroll", handleScroll);
    };
  }, [isModalOpen]);

  return (
    <dialog
      id="modal"
      ref={modalRef}
      className={`modal ${noPadding ? "no-padding" : ""}`}
      onKeyDown={handleKeyDown}
    >
      <div
        className="modal-backdrop" // This acts as the clickable backdrop
        onClick={handleCloseModal} // Close the modal if this backdrop is clicked
      />
      {showScrollButton && (
        <div className="scroll-button" onClick={() => onClose && onClose()}>
          <IoIosCloseCircle size={24} /> Lukk
        </div>
      )}
      {hasCloseBtn && !showScrollButton && (
        <div className="close-button">
          <IoIosCloseCircle size={32} onClick={() => onClose && onClose()} />
        </div>
      )}
      {children}
    </dialog>
  );
};

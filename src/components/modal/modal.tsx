"use client";
import { ReactNode, ReactPortal, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { IoIosCloseCircle } from "react-icons/io";

import "./css/modal.css";

interface ModalProps {
  children: ReactNode;
  className?: string;
  position?: "top" | "center" | "bottom" | "";
  showCloseButton?: boolean;
  onClose?: () => void;
}

export const Modal = ({
  children,
  onClose,
  position,
  className = "",
  showCloseButton = false,
}: ModalProps): ReactPortal | null => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const modalPosition = position ? `modal__content-${position}` : "";
  const closeButtonScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!closeButtonScrollRef.current) return;
      // Sjekk scroll-posisjonen til modal__content
      const isScrolled = closeButtonScrollRef.current?.scrollTop > 100;
      if (window.innerWidth < 640) {
        setShowScrollButton(isScrolled);
      }
    };

    const modalContent = closeButtonScrollRef.current;
    if (modalContent) {
      modalContent.addEventListener("scroll", handleScroll);

      // Fjern event listener ved cleanup
      return () => modalContent.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return ReactDOM.createPortal(
    <div
      className={"modal "}
      ref={closeButtonScrollRef}
      onClick={() => onClose && onClose()}
    >
      <div
        className={`modal__content ${className} ${modalPosition}`}
        onClick={(e) => e.stopPropagation()}
      >
        {showScrollButton && (
          <div className="scroll-button" onClick={() => onClose && onClose()}>
            <IoIosCloseCircle size={24} /> Lukk
          </div>
        )}
        {showCloseButton && !showScrollButton && (
          <div className="close-button">
            <IoIosCloseCircle size={32} onClick={() => onClose && onClose()} />
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
};

import { Modal } from "@/components/modal/modal";
import { CompanyLogo } from "@/components/company-logo/company-logo";
import { COMPANY } from "@/utils/company";
import { FiArrowUpRight } from "react-icons/fi";
import "./css/aboutMeModal.css";

const LINKS = [
  {
    href: "https://qr-kode.app",
    label: "qr-kode.app",
    desc: "Søstertjenesten for QR-koder",
  },
  {
    href: COMPANY.url,
    label: COMPANY.name,
    desc: "Personlig hjelp, tilpasninger og kontakt",
  },
  {
    href: "https://github.com/stianlars1",
    label: "github.com/stianlars1",
    desc: "Åpen kildekode",
  },
];

export const AboutMeModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return;
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      hasCloseBtn={true}
      ariaLabel="Om strek-kode.no"
    >
      <article className="about-modal">
        <header className="about-modal__header">
          <CompanyLogo size={44} />
          <div>
            <h2>Om strek-kode.no</h2>
            <p className="about-modal__byline">Et produkt fra {COMPANY.name}</p>
          </div>
        </header>

        <p>
          Strek-kode.no eies og drives av {COMPANY.name}, og er utviklet av
          Stian Larsen. Her kan du lage strekkoder rett i nettleseren, gratis og
          uten registrering eller vannmerker.
        </p>

        <p>
          Trenger du personlig hjelp med strekkoder, etiketter eller en
          tilpasset løsning? Ta kontakt med {COMPANY.name} for å avklare behov
          og pris. Selve strekkodegeneratoren er fortsatt gratis.
        </p>

        <ul className="about-modal__links">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                <span className="about-modal__link-text">
                  <span className="about-modal__link-label">{link.label}</span>
                  <span className="about-modal__link-desc">{link.desc}</span>
                </span>
                <FiArrowUpRight aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </article>
    </Modal>
  );
};

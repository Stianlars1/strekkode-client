import { Modal } from "@/components/modal/modal";
import Image from "next/image";
import { FiArrowUpRight } from "react-icons/fi";
import "./css/aboutMeModal.css";

const LINKS = [
  {
    href: "https://qr-kode.app",
    label: "qr-kode.app",
    desc: "Søstertjenesten for QR-koder",
  },
  {
    href: "https://stianlarsen.com",
    label: "stianlarsen.com",
    desc: "Flere prosjekter og kontakt",
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
          <Image
            src="/stian-bitmoji.png"
            width={44}
            height={44}
            alt=""
            aria-hidden="true"
          />
          <div>
            <h2>Om strek-kode.no</h2>
            <p className="about-modal__byline">Laget av Stian Larsen</p>
          </div>
        </header>

        <p>
          Hei! Jeg er en fullstack-utvikler som liker å bygge verktøy som
          forenkler hverdagen. Strek-kode.no lager strekkoder rett i
          nettleseren - enkelt, raskt og helt gratis. Ingen registrering, ingen
          vannmerker, ingen begrensninger.
        </p>

        <p>
          Verktøyet brukes av både bedrifter og privatpersoner, til alt fra
          lagermerking til varer som skal ut i butikk. Målet er det samme som
          alltid: teknologi som er tilgjengelig for alle, uten kostnad.
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

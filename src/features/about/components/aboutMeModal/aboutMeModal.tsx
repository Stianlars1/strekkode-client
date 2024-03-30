import { Modal } from "@/components/modal/modal";
import Link from "next/link";
import "./css/aboutMeModal.css";

export const AboutMeModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return;
  return (
    <>
      <Modal
        onClose={() => onClose && onClose()}
        position="top"
        showCloseButton={true}
      >
        <div className="modal-content-about-us">
          <h2>Om oss</h2>
          <h3>Hei, jeg er Stian Larsen! 👋</h3>
          <p>
            Som en 27 år gammel fullstack utvikler med en brennende lidenskap
            for teknologi, har jeg alltid vært drevet av en nysgjerrighet for
            hvordan digitale løsninger kan forenkle hverdagen vår. Med dette i
            hjertet, er jeg stolt av å introdusere{" "}
            <Link
              aria-label="Click this link to return to strk-kode.no's homepage"
              href={"https://strek-kode.no"}
            >
              strek-kode.no
            </Link>{" "}
            – et verktøy jeg har utviklet for å tilby enkel, rask og kostnadsfri
            generering av strekkoder.
          </p>

          <p>
            Enten du representerer en bedrift på utkikk etter effektive
            løsninger, eller du er en enkeltperson med behov for å skape
            strekkoder for personlig bruk, er dette verktøyet designet for å
            møte dine behov – uten kompleksitet, og viktigst av alt, uten
            kostnad. Ingen registrering er nødvendig for å ta det i bruk.
          </p>

          <p>
            Dette prosjektet springer ut fra samme kilde som tidligere ga liv
            til{" "}
            <Link
              aria-label="Click this link to go to qr-kode.app's website"
              href={"https://qr-kode.app"}
            >
              QR-kode.app
            </Link>
            , en annen nettside jeg skapte for å tilgjengeliggjøre
            QR-kodegenerering for alle. Med Strekkodegenerator ønsker jeg å
            utvide verktøykassen din enda mer, ved å tilby en like direkte og
            brukervennlig opplevelse.
          </p>

          <p>
            <strong>Mitt mål?</strong> Å gjøre teknologiske verktøy
            tilgjengelige for alle, åpne for kreativ bruk og innovasjon, og
            gjøre det uten kostnad for brukeren.
          </p>

          <p>
            Utforsk gjerne, generer dine strekkoder, og se selv hvor enkelt det
            kan være. Dette er teknologi gjort tilgjengelig, fra meg til deg.
          </p>

          <p>Lykke til med strekkodegenereringen!</p>

          <div className="footnote">
            <strong>
              <Link
                aria-label="Click this link to go to stian larsen's pesonal website"
                href={"https://stianlarsen.com"}
              >
                Stian Larsen
              </Link>
            </strong>
            <p>
              Besøk{" "}
              <Link
                aria-label="Click this link to go to stian larsen's pesonal website"
                href={"https://stianlarsen.com"}
              >
                min hjemmeside
              </Link>{" "}
              for å lære mer om mine prosjekter og lidenskap for teknologi.
            </p>
          </div>

          <p>© {new Date().getFullYear()} Stian Larsen. All Rights Reserved.</p>
        </div>
      </Modal>
    </>
  );
};

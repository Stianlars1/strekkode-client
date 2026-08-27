import "./css/guide.css";

/* Visible FAQ answers must stay in sync with the FAQPage JSON-LD in layout.tsx. */
export const FAQ_ITEMS = [
  {
    q: "Hvordan lager jeg en strekkode?",
    a: "Velg format, skriv inn tallet eller teksten du vil kode, og last ned strekkoden som PNG eller SVG. Det tar under ett minutt og krever ingen registrering.",
  },
  {
    q: "Er det gratis å lage strekkoder?",
    a: "Ja, strek-kode.no er helt gratis. Du kan lage og laste ned så mange strekkoder du vil, uten registrering og uten vannmerker.",
  },
  {
    q: "Hva er en strekkode?",
    a: "En strekkode er en maskinlesbar fremstilling av tall eller tekst, bygget opp av streker og mellomrom som en skanner kan lese. Strekkoder brukes til å identifisere varer, utstyr og dokumenter raskt og uten feiltasting.",
  },
  {
    q: "Hvilken strekkodetype trenger jeg?",
    a: "Til intern bruk som lager, utstyr og medlemskort holder CODE128, som er standardvalget her. Skal varen selges i butikk, trenger du en EAN-13-kode med et GS1-nummer du kjøper hos GS1 Norway.",
  },
  {
    q: "Hva er forskjellen på EAN-13 og CODE128?",
    a: "EAN-13 består av 13 siffer og brukes på varer i detaljhandelen, med nummerserie fra GS1. CODE128 kan inneholde både bokstaver og tall, er mer kompakt, og brukes til logistikk og intern merking.",
  },
  {
    q: "Hvordan skriver jeg ut strekkoder?",
    a: "Last ned strekkoden som PNG i høy oppløsning og skriv den ut i 100 % størrelse på hvitt papir eller etiketter. Bruk gjerne en etikettskriver, og test alltid utskriften med en skanner før du tar den i bruk.",
  },
];

const FORMAT_ROWS = [
  {
    name: "CODE128",
    desc: "Lager, logistikk og intern merking - tall og bokstaver. Gratis å bruke.",
  },
  {
    name: "EAN-13",
    desc: "Varer som selges i butikk. Krever GS1-nummer fra GS1 Norway.",
  },
  { name: "EAN-8", desc: "Små produkter med liten emballasje." },
  { name: "ISBN", desc: "Bøker - konverteres automatisk til EAN-13 her." },
  { name: "ITF-14", desc: "D-pak og kartonger i logistikk." },
  { name: "QR-kode", desc: "Lenker og tekst - prøv søstertjenesten qr-kode.app." },
];

export const Guide = () => {
  return (
    <div className="guide">
      <section className="guide__columns">
        <section className="guide__block" aria-labelledby="guide-typer">
          <h2 id="guide-typer">Hvilken strekkodetype trenger du?</h2>
          <dl className="guide__table">
            {FORMAT_ROWS.map((row) => (
              <div className="guide__row" key={row.name}>
                <dt>{row.name}</dt>
                <dd>{row.desc}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="guide__block" aria-labelledby="guide-faq">
          <h2 id="guide-faq">Ofte stilte spørsmål</h2>
          <div className="guide__faq">
            {FAQ_ITEMS.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </section>

      <section className="guide__columns guide__columns--three">
        <section className="guide__block" aria-labelledby="guide-steg">
          <h2 id="guide-steg">Hvordan lage strekkode - steg for steg</h2>
          <ol className="guide__steps">
            <li>Velg strekkodetype - CODE128 passer for det meste.</li>
            <li>Skriv inn verdien og se strekkoden med en gang.</li>
            <li>Last ned som PNG eller SVG, eller kopier den rett inn i dokumentet ditt.</li>
          </ol>
        </section>

        <section className="guide__block" aria-labelledby="guide-print">
          <h2 id="guide-print">Slik skriver du ut strekkoder</h2>
          <p>
            Last ned i 6×-oppløsning (ca. 300 DPI) og skriv ut i 100 % størrelse
            på hvitt papir eller etiketter. Etikettskrivere som Zebra og Dymo
            gir skarpest resultat. La det være lys marg rundt strekene, og test
            alltid med en skanner før du tar etikettene i bruk.
          </p>
        </section>

        <section className="guide__block" aria-labelledby="guide-hva">
          <h2 id="guide-hva">Hva er en strekkode?</h2>
          <p>
            En strekkode er en maskinlesbar fremstilling av tall eller tekst,
            bygget opp av streker og mellomrom som en skanner leser på
            brøkdelen av et sekund. De brukes overalt der ting skal
            identifiseres raskt og uten feiltasting - i butikk, på lager og i
            logistikk.
          </p>
        </section>
      </section>
    </div>
  );
};

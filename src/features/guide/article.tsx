import Link from "next/link";
import styles from "./article.module.css";

export const BarcodeGuideArticle = () => (
  <main className={styles.page}>
    <Link href="/">← Til strekkodegeneratoren</Link>
    <h1>Fra ISBN eller varenummer til ferdig strekkode</h1>
    <p className={styles.updated}>Praktisk veiledning · Oppdatert 14. oktober 2026</p>
    <p className={styles.intro}>
      En lesbar strekkode begynner med riktig nummer. Denne veiledningen viser
      hvor nummeret kommer fra, hvilket format du kan bruke, og hvordan du lager
      en fil eller etikett du kan kontrollere før bruk.
    </p>

    <section>
      <h2>Skal du gi ut en bok?</h2>
      <ol>
        <li>
          Søk om ISBN hos <a href="https://www.nb.no/tjenester/standardnummerering/isbn/">ISBN Norge ved Nasjonalbiblioteket</a>.
          Det er gratis å få tildelt ISBN. Hver utgave og hvert format av en bok
          trenger sitt eget nummer.
        </li>
        <li>
          Bruk ISBN-13 som grunnlag for EAN-13. ISBN Norge opplyser at nummeret
          brukes som GTIN/EAN på bøker, og at strekkodesymbolet er EAN-13.
        </li>
        <li>
          Velg «ISBN» i generatoren og skriv inn ISBN-10 eller ISBN-13, med
          eller uten bindestreker. Generatoren validerer nummeret og tegner
          strekkoden; trykkeriet kan også lage den ferdige strekkoden for
          omslaget.
        </li>
      </ol>
      <p>
        Et gyldig ISBN-format betyr ikke i seg selv at nummeret er tildelt deg.
        Skaff nummeret fra ISBN Norge før du lager strekkoden. Se også ISBN
        Norges <a href="https://www.nb.no/tjenester/standardnummerering/isbn/omregning-10-13-siffers-isbn/">veiledning for omregning fra ISBN-10 til ISBN-13</a>.
      </p>
    </section>

    <section>
      <h2>Skal varen selges i butikk?</h2>
      <p>
        Avklar med distributøren eller forhandleren hvilket nummer og format
        de krever. EAN-13 er et strekkodesymbol som kan bære GTIN-13. GTIN-et
        må være et nummer som er tildelt virksomheten din; generatoren kan
        kontrollere format og kontrollsiffer, men kan ikke bekrefte eierskap,
        tildeling eller at varen er registrert hos en handelsplattform.
      </p>
      <p>
        Skaff GTIN fra <a href="https://gs1.no/trenger-du-en-strekkode/">GS1 Norway</a> før
        du trykker emballasje. GS1 forklarer <a href="https://gs1.no/ean-upc-strekkoder/">forskjellen på EAN/UPC-symbolene</a> og
        hvilke GTIN-numre de kan representere. Et tilfeldig tall med riktig
        lengde blir ikke et gyldig GS1-varenummer av å få streker rundt seg.
      </p>
    </section>

    <section>
      <h2>Skal du merke eget lager eller utstyr?</h2>
      <p>
        Når kodene bare skal brukes i ditt eget system, kan CODE128 passe fordi
        den støtter både bokstaver og tall. Bestem først hvordan etiketten skal
        kobles til varen i lager- eller inventarsystemet. Lag deretter en unik
        verdi per objekt, og test at skanneren leser verdien systemet forventer.
        En intern kode er ikke automatisk et varenummer for butikkhandel.
      </p>
    </section>

    <section>
      <h2>Lag mange koder fra en liste</h2>
      <ol>
        <li>Velg «Flere strekkoder» og riktig format i generatoren.</li>
        <li>
          Lim inn én verdi per linje, eller last opp CSV/TXT. Ved opplasting
          leses første kolonne; komma, semikolon og tabulator brukes som skilletegn.
        </li>
        <li>
          Kontroller antallet og eventuelle ugyldige rader. Generatoren lager
          opptil 500 koder per omgang og lar deg laste dem ned samlet som ZIP.
        </li>
      </ol>
      <p>
        Test først med noen få rader hvis regnearket har formler, overskrifter
        eller ekstra kolonner. Eksporter gjerne en ren CSV med bare verdiene du
        vil kode. Filene og verdiene behandles lokalt i nettleseren; de sendes
        ikke til oss eller lagres av generatoren.
      </p>
    </section>

    <section>
      <h2>Skriv ut på etikettark</h2>
      <p>
        «Skriv ut etiketter» har maler for Avery L7160 (3 × 7 etiketter,
        63,5 × 38,1 mm) og L7651 (5 × 13, 38,1 × 21,2 mm), samt et egendefinert
        rutenett. Velg samme mal som på pakken med etikettarkene.
      </p>
      <ol>
        <li>Lag en testutskrift på vanlig papir.</li>
        <li>
          I utskriftsdialogen velger du A4 og 100 % størrelse uten skalering.
          Legg testarket bak etikettarket mot lys for å kontrollere plasseringen.
        </li>
        <li>
          Skann en etikett etter utskrift og sammenlign resultatet med
          originalverdien før du merker hele opplaget.
        </li>
      </ol>
    </section>

    <section className={styles.sources}>
      <h2>Kilder og videre hjelp</h2>
      <ul>
        <li><a href="https://www.nb.no/tjenester/standardnummerering/isbn/">ISBN Norge: søk om ISBN og informasjon om strekkoder til bøker</a></li>
        <li><a href="https://www.nb.no/tjenester/standardnummerering/isbn/faq/">ISBN Norge: ofte stilte spørsmål</a></li>
        <li><a href="https://gs1.no/gtin_/">GS1 Norway: hva er GTIN?</a></li>
        <li><a href="https://gs1.no/verifisering-av-strekkoder/">GS1 Norway: verifisering av strekkoder</a></li>
      </ul>
      <p>
        Strek-kode.no lager strekkodebilder og etikettark fra verdiene du oppgir.
        Vi tildeler ikke ISBN eller GTIN, registrerer ikke varer hos forhandlere
        og kan ikke garantere at en utskrift oppfyller en bestemt trykkeri- eller
        skannerløsning. Be om spesifikasjonen fra mottakeren når koden skal brukes
        i en produksjon.
      </p>
    </section>
  </main>
);

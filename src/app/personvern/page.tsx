import { COMPANY } from "@/utils/company";
import type { Metadata } from "next";
import Link from "next/link";
import styles from "./privacy.module.css";

export const metadata: Metadata = {
  title: "Personvern og informasjonskapsler | Strek-kode.no",
  description: "Slik behandles opplysninger på strek-kode.no, og slik styrer du samtykke til annonser.",
  alternates: { canonical: "/personvern" },
};

export default function PrivacyPage() {
  return (
    <main className={styles.page}>
      <Link href="/">← Til strekkodegeneratoren</Link>
      <h1>Personvern og informasjonskapsler</h1>
      <p className={styles.updated}>Sist oppdatert 13. oktober 2026</p>

      <section>
        <h2>Hvem er ansvarlig?</h2>
        <p>
          Strek-kode.no eies og drives av {COMPANY.name}, organisasjonsnummer
          937 464 819. {COMPANY.name} er behandlingsansvarlig for opplysningene
          vi behandler i forbindelse med nettstedet og henvendelser til oss.
          Du kan kontakte oss på <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
        </p>
      </section>

      <section>
        <h2>Det du lager i generatoren</h2>
        <p>
          Strekkodeverdier, lister og CSV-filer behandles lokalt i nettleseren din.
          Vi sender ikke dette innholdet til serveren, lagrer det ikke i en
          database og bruker det ikke til annonsering. Strekkodebilder, zip-filer
          og etikettark lages i nettleseren. Filer du laster ned, lagres der du
          selv velger på enheten din.
        </p>
      </section>

      <section>
        <h2>Drift og sikkerhet</h2>
        <p>
          Nettstedet leveres av Vercel. Når du besøker siden, mottar
          hostingleverandøren tekniske opplysninger som IP-adresse, tidspunkt,
          nettadresse og informasjon om nettleseren. Disse brukes til å levere
          og beskytte tjenesten og til nødvendig feilsøking. Behandlingen bygger
          på vår berettigede interesse i stabil og sikker drift.
        </p>
        <p>
          Vi har ikke egen besøksanalyse eller en database med brukerprofiler.
          Tekniske driftsopplysninger håndteres etter leverandørens
          lagringsrutiner, og beholdes så lenge det er nødvendig for drift,
          sikkerhet og feilhåndtering. Les mer i <a href="https://vercel.com/legal/privacy-policy">Vercels personverninformasjon</a>.
        </p>
      </section>

      <section>
        <h2>Annonser og samtykke</h2>
        <p>
          Vi bruker Google AdSense for annonser og Googles samtykkeløsning for
          personvernvalg. Samtykkeløsningen hentes fra Google og husker valgene
          dine. Den gir informasjon om formål, annonsepartnere og lagringstidene
          de oppgir.
        </p>
        <p>
          Vi ber bare om en annonse når samtykkeløsningen bekrefter at du har
          tillatt annonselagring og Google som annonseleverandør. Du kan si nei
          og fortsatt bruke hele generatoren. Mangler samtykke, eller er
          samtykkeløsningen utilgjengelig, ber vi ikke om annonser.
        </p>
        <p>
          Etter samtykke kan Google og annonsepartnere bruke informasjonskapsler,
          enhetsidentifikatorer, IP-adresse og informasjon om annonsevisninger
          og klikk til å levere, tilpasse og måle annonser. Behandlingen avhenger
          av valgene dine i samtykkemeldingen. Les mer om <a href="https://policies.google.com/technologies/partner-sites">hvordan Google bruker opplysninger fra nettsteder som bruker Googles tjenester</a> og <a href="https://policies.google.com/technologies/cookies">Googles bruk av informasjonskapsler</a>.
        </p>
        <p>
          Du kan når som helst velge «Endre samtykke» nederst på siden for å
          endre eller trekke tilbake valget ditt. Tilbaketrekking påvirker ikke
          behandling som allerede har skjedd på grunnlag av samtykke. Du kan
          også slette informasjonskapsler i nettleserens innstillinger.
        </p>
      </section>

      <section>
        <h2>Når du kontakter oss</h2>
        <p>
          Sender du oss e-post, bruker vi kontaktopplysningene og innholdet til å
          besvare og følge opp henvendelsen. Ved spørsmål om et oppdrag er
          behandlingen nødvendig for å kunne gi et tilbud eller oppfylle en
          avtale. Andre henvendelser behandles ut fra vår berettigede interesse
          i å svare deg. Opplysningene beholdes så lenge oppfølgingen krever det.
          Opplysninger knyttet til et betalt oppdrag kan også være omfattet av
          lovpålagte oppbevaringskrav.
        </p>
      </section>

      <section>
        <h2>Leverandører og behandling utenfor EØS</h2>
        <p>
          Google og Vercel kan behandle opplysninger utenfor EØS. Leverandørenes
          personverninformasjon beskriver hvor opplysningene behandles og
          hvilke overføringsgrunnlag som brukes. Se <a href="https://policies.google.com/privacy/frameworks">Googles informasjon om dataoverføringer</a> og <a href="https://vercel.com/legal/dpa">Vercels databehandlingsvilkår</a>.
        </p>
      </section>

      <section>
        <h2>Dine rettigheter</h2>
        <p>
          Du kan kontakte oss for å be om innsyn, retting, sletting, begrensning
          eller utlevering av personopplysninger, og for å protestere mot
          behandling basert på berettiget interesse. Hvilke rettigheter som
          gjelder, avhenger av behandlingen. Du kan også <a href="https://www.datatilsynet.no/om-datatilsynet/kontakt-oss/klage-til-datatilsynet/">klage til Datatilsynet</a>.
        </p>
      </section>
    </main>
  );
}

# Annonser og samtykke

Oppsett kontrollert 13. oktober 2026. Google avgjør godkjenning av nettstedet.

- Utgiver: Larsen Utvikling, Google-konto `stian@larsenutvikling.no`.
- Utgiver-ID: `pub-7638629114587725` (offentlig, også i `public/ads.txt`).
- Én responsiv bannerannonse: `1625766726`, «strek-kode.no – under generatoren».
- Automatiske annonser, automatisk annonseoptimalisering og automatisk
  størrelsesoptimalisering på mobil er av i AdSense.
- Google Privacy & Messaging: «Strek-kode.no – samtykke», publisert med norsk
  som standardspråk og engelsk som tillegg. Avvisning er på i alle regioner som
  meldingen dekker. Samtykkeoptimalisering er av.
- Personvernadresse: `https://strek-kode.no/personvern`.

## Innlasting

`ConsentProvider` laster Googles separate Privacy & Messaging-tagg.
AdSense-taggen lastes først av `AdSlot` når TCF-meldingen bekrefter et ferdig
samtykke med formål 1 (lagring/tilgang på enhet) og Google Advertising Products
(leverandør 755). Google håndterer øvrige TCF-formål og annonsepartnere.

Ukjent, manglende, avvist eller utilgjengelig samtykke gir ingen annonseforespørsel.
Dette gjelder også besøk der Googles CMP ikke gir oss et TCF-samtykke. En slik
besøkende får bruke generatoren uten annonser.

«Endre samtykke» fjerner den manuelle annonseplassen før Googles dialog åpnes
igjen. TCF-lytteren følger nye valg. Annonser som ikke fylles, skjules.

Bannerets størrelser følger Googles opplegg for faste responsive størrelser:
234×60 på smale skjermer, 320×100 fra 360 px, 468×60 fra 520 px og 728×90 fra
800 px. Ingen annonser klippes med en maksimalhøyde.

## Generatorens data

Nedlasting og kopiering kaller ikke lenger de gamle Supabase-statistikkfunksjonene.
Strekkodeverdier og innleste CSV-filer behandles i nettleseren. Ingen eksisterende
database eller historiske data er endret eller slettet som del av dette oppsettet.

## Målrettet kontroll

Kjør `npm run build`. Kontroller i nettleseren at:

1. Uten samtykke og etter avvisning lastes ikke `adsbygoogle.js`, og det sendes
   ingen forespørsel til `/pagead/ads`.
2. Etter samtykke finnes maksimalt én `ins.strekkode_banner` under generatoren.
3. «Endre samtykke» åpner Googles dialog og tar bort annonseplassen.
4. Generering, PNG/SVG-nedlasting og kopiering virker uten at verdien sendes til
   en server. `/personvern` har riktig canonical og ingen FAQ-JSON-LD.

En synlig annonse kan først bekreftes når Google har godkjent nettstedet og fyller
annonseenheten. Ikke klikk på egne annonser under kontrollen.

## Kilder

- [Google Privacy & Messaging API](https://developers.google.com/funding-choices/fc-api-docs)
- [Googles TCF-integrasjon og leverandør 755](https://support.google.com/adsense/answer/9999955)
- [Tillatt tilpasning av responsive annonseenheter](https://support.google.com/adsense/answer/9183363)
- [Datatilsynets informasjon om samtykke](https://www.datatilsynet.no/personvern-pa-ulike-omrader/internett-og-apper/cookies/)

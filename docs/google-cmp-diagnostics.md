# Google CMP: meldingen leveres ikke

Kontrollert 13. oktober 2026. Ingen vellykket visning av den faktiske Google-dialogen er bekreftet.

## Observasjoner

- AdSense bekrefter at alle oppstartstrinn er fullført. Nettstedet er «Klargjøres», og ads.txt er «Autorisert».
- «Strek-kode.no – samtykke» er publisert og valgt for akkurat `strek-kode.no`. Norsk og engelsk er valgt. Avvisning er aktivert.
- Google Advertising Products (TCF-leverandør 755) finnes i den lagrede listen med 198 vanlige partnere.
- AdSense-taggen bruker riktig utgiver-ID og lastes i toppvinduet. Google mottar `Referer: https://strek-kode.no/`.
- Googles dokumenterte parametere `fc=alwaysshow&fctype=gdpr` følger med forespørselen til Funding Choices.
- `/i/ca-pub-7638629114587725` og `/f/...` svarer HTTP 200, og `/el/...` svarer HTTP 204.
- Google initialiserer TCF med CMP-ID 300, `cmpLoaded: true`, `cmpStatus: loaded`, `gdprApplies: true`, `displayStatus: hidden`.
- Det nedlastede `/f/...`-svaret inneholder modulen `cookie_refresh_executable`, men ingen synlig samtykkemelding. TCF gir ikke et ferdig samtykkevalg.

## Isolering

`/cmp-check.html?fc=alwaysshow&fctype=gdpr` er en midlertidig side med `noindex, nofollow`. Den laster Googles ordinære async AdSense-tag med annonseforespørsler på pause. Den har ingen Next.js, React, egen TCF-lytter, styling eller annonseplasser. Samme feil oppstår der.

Kontrollsiden ble også åpnet i et nytt Chrome-inkognitovindu uten tidligere samtykkedata. Ingen dialog ble vist. Testvinduet er lukket.

En kort, isolert test i testfanen slapp pauseflagget med annonsenettverkene blokkert på nettverksnivå. Dialogen uteble også da. Blokkeringen og DOM-endringene ble fjernet, og siden ble lastet på nytt med pause aktivert.

Meldingen ble publisert på nytt gjennom AdSense. Publiseringsdialogen opplyser at levering kan ta opptil én time. Dette er et forsøk på å oppdatere leveringskonfigurasjonen, ikke dokumentasjon på at feilen er løst.

Ingen annonseforespørsler ble sendt i den vanlige produksjonskontrollen. Beskyttelsen i hovedappen beholdes.

AdSense sin kontaktveiviser for GDPR tilbyr ingen direkte brukerstøttespesialist for denne kontoen. Ingen henvendelse er sendt.

## Mulig løsning uavhengig av Google-leveringen

InMobi Choice er oppført hos Google som sertifisert CMP med ID 10. Registreringssiden oppgir støtte for TCF 2.3. CMP Essentials er gratis; Premium er en separat, valgfri tjeneste.

14. oktober 2026 godkjente eieren uttrykkelig gratis Essentials, registrering og vilkår for Larsen Utvikling. Registreringen med `stian@larsenutvikling.no` er sendt inn, og InMobi bekreftet «User registered successfully. Please check your email to confirm». Ingen betalingsmetode, betalt abonnement eller Premium-funksjon er aktivert. Kontoaktivering gjenstår. Eieren er bedt om å fullføre aktivering og eventuell oppretting av passord direkte hos leverandøren.

Nettstedskode og egenskaper skal hentes fra den aktiverte portalen før integrasjonen endres. Dagens produksjonskode bruker fortsatt Google CMP med annonseforespørsler på pause uten gyldig samtykke.

14. oktober bekreftet InMobi også «Sign up email resent successfully» etter ny utsending til firmapostkassen. E-postlevering er ikke bekreftet. Outlooks firmapostkasse og tomme søppelpost ble kontrollert. Domenets MX er `mx.domeneshop.no`. InMobis Google-innlogging for firmakontoen ender gjentatte ganger på `/auth/openid/return` med feilen `Required request parameter 'id_token' ... is not present`. Det er ikke fastslått hvorfor tokenet mangler.

Eieren godkjente en teknisk henvendelse til InMobi. Supportskjemaet ble sendt under «Choice CMP → Account Management → Registration and login issues». Portalen svarte «Inquiry Submitted Successfully» 14. oktober ca. kl. 10:03 CEST. Ingen saks-ID ble vist; svar ventes til den registrerte firmapostkassen. Meldingen ber InMobi undersøke aktiveringsstatus, e-postleveringslogger og Google-innloggingsfeilen. Utkastet ligger lokalt i `docs/inmobi-support-request.txt` og er ikke lagt i Git.

- https://support.google.com/adsense/answer/13554116
- https://choice.inmobi.com/login
- https://advertising.inmobi.com/cmp-terms
- https://support.inmobi.com/choice/how-to-guide/callbacks/web-callbacks

Viktig ved eventuell registrering: Leverandøren beskriver automatisk Premium-prøvetilgang for nye nettsteder i sin FAQ. Gratisnivået må velges og verifiseres eksplisitt, og ingen betalingsmetode eller betalt prøveavtale skal aktiveres uten ny godkjenning. Bruk bare funksjoner som inngår i Essentials.

## Avgrensning

Feilen reproduseres uten applikasjonsintegrasjonen. Google leverer foreløpig ingen dialog. Dette avgrenser feilen til Googles levering/konfigurasjon for nettstedet, men fastslår ikke hvorfor tjenesten holder meldingen tilbake. Ventende nettstedsgodkjenning er en mulig forklaring som ikke er bekreftet av Google.

Det finnes derfor ikke grunnlag for å fjerne samtykkesperren eller hevde at et ekstra lokalt banner erstatter en sertifisert CMP.

Den midlertidige kontrollsiden er fjernet etter isoleringstesten. Kilden finnes i Git-commit `60b952d94072487ec6c39aa151966b89c06892c3` dersom testen må gjentas. URL-en i utkastet nedenfor må gjenopprettes før en eventuell henvendelse sendes.

## Utkast til teknisk henvendelse (ikke sendt)

**Published Google CMP does not display, including forced preview on a minimal page**

Google's published European regulations message does not appear on strek-kode.no. The message is assigned to the correct site, with Consent, Do not consent and Manage options enabled. Google Advertising Products (vendor 755) is included in the account's common ad partners.

AdSense says all onboarding steps are complete. The site is Getting ready and ads.txt is Authorized. We are not assuming that pending site approval causes this CMP problem.

Minimal reproduction: https://strek-kode.no/cmp-check.html?fc=alwaysshow&fctype=gdpr

The page contains only the standard async AdSense tag for ca-pub-7638629114587725, with ad requests paused. There is no framework, second CMP, application consent listener, or ad placement. The tag is in the top-level window, and the request includes the site's HTTP Referer. The preview parameters reach Funding Choices.

Funding Choices /i/ and /f/ return 200; /el/ returns 204. TCF ping reports cmpId 300, cmpLoaded true, cmpStatus loaded, gdprApplies true and displayStatus hidden. No completed TCF choice or visible message is delivered. The /f/ response runs cookie_refresh_executable. The same issue occurs in the full application.

The message was republished on 13 October 2026. Could you check the account/site's CMP delivery configuration and explain why no message is returned, including in forced preview? Is message delivery conditional on site or account activation, and is there a supported way to verify the consent flow before ad approval?

## Kilder

- https://developers.google.com/funding-choices/fc-api-docs
- https://support.google.com/adsense/answer/14660912
- https://support.google.com/adsense/answer/7670312

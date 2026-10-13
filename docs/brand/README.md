# Ikoner

`Logo.dc.html` er den uendrede HTML-originalen fra `Logo-html.zip`, levert
13. oktober 2026. Eksportens React-runtime er ikke inkludert; filen bevarer
designverdiene. `favicon.html` er en selvstendig eksportflate for det store
S-monogrammet. Den bruker originalens stripeverdier, farge og Geist 700 fra
prosjektets låste npm-avhengigheter, på hvit bakgrunn.

## Filer og metadata

| Fil i `public/` | Faktisk størrelse | Bruk |
| --- | --- | --- |
| `favicon.ico` | 16×16 og 32×32 | Eksisterende småikoner, uendret innhold |
| `android-chrome-192x192.png` | 192×192 | Rendret fra `favicon.html` |
| `apple-touch-icon.png` | 180×180 | Eksisterende Apple-ikon, uendret |

Alle tre referanser defineres i `src/app/metadata.tsx`. Ikonene ligger i
`public/` for å beholde faste adresser og kunne angi begge ICO-størrelsene.
Ikke legg samtidig `favicon.ico` eller `icon.png` i `src/app/`: Next.js 14
kan da legge til eller overstyre ikonreferanser automatisk.

`android-chrome-512x512.png` er en eksisterende, uendret eksport som ikke
refereres i sidens ikonmetadata.

## Eksporter 192×192 på nytt

Kjør `npm ci` dersom avhengighetene mangler. Fra prosjektroten, start en
lokal filserver:

```sh
python3 -m http.server 3107 --bind 127.0.0.1
```

Åpne `http://127.0.0.1:3107/docs/brand/favicon.html` med Playwright. Vent på
skriften og eksporter elementet med én bildepiksel per CSS-piksel:

```js
await page.evaluate(() => document.fonts.ready);
if (!(await page.evaluate(() => document.fonts.check("700 110px Geist")))) {
  throw new Error("Geist må være lastet før eksport");
}
await page.locator("#icon").screenshot({
  path: "public/android-chrome-192x192.png",
  scale: "css",
});
```

Dette rasteriserer originalens tekst og CSS direkte i målstørrelsen.
Ingen liten PNG eller ICO oppskaleres. Småikonene har enklere mønstre og
beholdes separat.

## Målrettet kontroll

Kjør `npm run build` og `npm run start -- --hostname 127.0.0.1 --port 3108`.
Kontroller at HTML har nøyaktig to `rel="icon"`-referanser (ICO og PNG),
én `rel="apple-touch-icon"`, korrekte typer/størrelser og HTTP 200 for alle
tre adresser. Kontroller ICO-bildene individuelt og se ikonene ved 16/32 px.

Googles [favicon-veiledning](https://developers.google.com/search/docs/appearance/favicon-in-search)
anbefaler et kvadratisk ikon større enn 48×48. Det er ikke dokumentasjon
på at ikonstørrelsen forklarer den gamle kopien i Search Console-menyen,
eller at denne endringen vil oppdatere den.

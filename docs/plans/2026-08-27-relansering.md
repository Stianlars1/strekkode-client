# Strek-kode.no relansering — plan (2026-08-27)

Basert på full audit (5 dimensjoner, 56 funn) — rådata i `2026-08-27-audit-funn.md`.
Mål: moderne, profesjonell, **monokrom svart/hvit**, lett og enkel. Ikke AI-slop.
GSC-kontekst: +60 % klikk siste 28 dager, kun forsiden indeksert, «strekkode» (848 visninger, pos 9, 1 % CTR) er største uutnyttede mulighet.

## Status

- [x] Fase 1 — Hygiene & quick wins (commit a2cd455)
- [x] Fase 2 — Monokromt designsystem (commit a46be75)
- [x] Fase 3 — Motion & tilgjengelighet (commit a46be75)
- [x] Fase 4 — Generator v2 (live preview + 13 formater) (commit ac0ad76)
- [x] Fase 5 — SEO-innhold + JSON-LD + OG-bilde + ikoner (ac0ad76 + 8ce7618)
- [ ] Fase 6 — P2-features (bulk, print/Avery) — gjenstår
- [x] Logo — B (wordmark) + C (S-monogram) implementert i navbar/favicon/OG

Gjenstår ellers: deploy + GSC URL-inspeksjon etterpå. Ikke pushet — venter på klarsignal.

---

## Fase 1 — Hygiene & quick wins (½ dag, ingen designendring)

1. `layout.tsx:20`: `lang="en"` → `lang="nb"`.
2. `metadata.tsx`:
   - Tittel → `"Strekkodegenerator – lag strekkoder gratis | Strekkode"` (54 tegn).
   - Beskrivelse → `"Gratis strekkodegenerator: skriv inn tall eller tekst, generer strekkode (CODE128) og last ned som PNG. Ingen registrering – lag strekkoden din nå!"`.
   - `alternates: { canonical: "/" }`.
   - Slett `keywords`-array, hele `verification`-objektet (placeholder-junk), fake Twitter app-card → `card: "summary_large_image"`.
   - `openGraph.locale: "nb_NO"`.
3. `next.config.mjs`: redirect `/index` → `/` (permanent). `/index` serverer i dag 200-duplikat — trolig årsak til «gjennomsøkt – ikke indeksert».
4. Slett `src/app/api/strekkode/` (død scaffolding, returnerer HTTP 500 live, ingen imports).
5. `public/robots.txt`: legg til `Sitemap: https://strek-kode.no/sitemap.xml`.
6. `sitemap.ts`: hardkod `lastModified` (bump ved reelle endringer) i stedet for `new Date()`.
7. Bugfiks `barcodeUtils.tsx:126`: vanlig PNG lagres som `-transparent.png` (filnavnkollisjon).
8. `action.ts:12`: engelsk feilmelding → «Du må skrive inn en verdi for strekkoden».
9. Merk: `strekkode-server/` (Kotlin/Spring) er død kode — klienten bruker Supabase RPC. Ikke rør; vurder arkivering separat.

## Fase 2 — Monokromt designsystem (1 dag)

Alt eksakt spesifisert i audit-funn → «Visuell design».

1. **Tokens** (`globals.css`): bytt zinc (hue 240) → ren nøytral (hue 0, 0 % sat). Full palett klar til innliming i audit-doc. `--ring` blir 9 % (lys) / 83 % (mørk). Behold `--destructive` rød.
2. **Button** (`button.scss`): slett hele den duplikate token-blokken (54 linjer m/ lilla `--button-primary: 263.4 70% 50.4%` og ugyldig komma+slash-HSL som brekker alle hover-states i dag) → alias til globale tokens. Primærknapp = solid svart/hvit, ingen skygge. Slett inline-lilla-hack i `barcodeContainer.tsx:104-107`.
3. **Typografi**: h1 `3.75rem/700/-0.05em` → `clamp(2.25rem, 1.4rem + 3.4vw, 3.25rem)/600/-0.025em/1.1` (én clamp erstatter tre media queries). Subtitle 1.125rem/1.6. Label 0.875rem/500. Slett Arial i `footer.scss:6` og ugyldig `font-family: inherit, …` i `globals.css:74`. Font-smoothing på body.
4. **Layout**: `globals.css` `height: 100dvh` → `min-height` + sentrer hero-kolonnen (fjerner dødsonen under fold). Header-padding → `clamp(2rem, 6vh, 4rem)`.
5. **Input**: border-first — `1px solid hsl(var(--input))`, radius, focus-ring `0 0 0 3px hsl(var(--ring) / 0.15)`. Fast `max-width: 26rem` (fjerner tre breakpoint-hopp).
6. **Modal**: `#ccc`-border og muted-bakgrunn → popover-tokens; sletter ~40 linjer overrides.
7. **Barcode-preview**: bevisst «trykket etikett»-kort — hvit i BEGGE temaer (skannbarhet), `2rem 2.5rem` padding (garantert quiet zone), 1px border, radius. Nedlastingsknapp UT av det hvite kortet.
8. **Navbar**: lilla PNG (145 KB) → inline SVG-strekkode-glyph i `currentColor` + wordmark «strekkode»; `<Link href="/">`. −145 KB, temafølsom.
9. **Footer**: fjern `margin: 0 -25px`-hack og alpha-tint → 1px `--border` hairline topp.

## Fase 3 — Motion & tilgjengelighet (1 dag)

Motion (eksakte snippets i audit-doc, Emil Kowalski-skole — behersket):

1. Easing-tokens: `--ease-out-quart: cubic-bezier(0.22,1,0.36,1)`. Durations 150/250/500 ms.
2. Dialog: `@starting-style` + `allow-discrete` — enter 250 ms scale 0.96→1, exit 150 ms, backdrop-fade. Progressive enhancement.
3. **Barcode-reveal** (produktets aha-øyeblikk): clip-path venstre→høyre «print»-wipe 500 ms + knapp fade-rise 250 ms forsinket. NB: i Fase 4 flyttes denne til inline-preview.
4. Button: konsolider transition-liste (dagens `:active`-scale er død kode), loader → `currentColor` (dagens er lilla `#7983ff`), 0.7 s spin.
5. Error: slide-down + settle-shake, replay via `ts`-key fra action.
6. Tooltip: 125 ms fade+scale, `delayShow={300}`.
7. `prefers-reduced-motion`: målrettet blokk (fades beholdes, bevegelse fjernes) — IKKE 0.01 ms-nuken (den dreper spinneren).

A11y (16 funn, 2 kritiske):

1. **KRITISK**: «Om oss» = `<a>` uten href — tastatur-uoppnåelig. Button-komponenten må rendre `<button>` når variant="link" uten href.
2. Focus-ring på alle knapper (`:focus-visible` setter i dag border-color på `border: 0` — usynlig).
3. `htmlFor="barcode"` på label (0 htmlFor i hele kodebasen); slett motstridende `aria-label`.
4. Checkbox: `id` + ekte `<label>` (har i dag intet tilgjengelig navn).
5. Tooltip-trigger → `<button aria-label>` (i dag hover-only på ikke-fokuserbar `<a>`).
6. Modal: `hasCloseBtn` + `onClose` på barcode-modalen (fikser også Escape-desync-bugen); lukkekontroller `<div onClick>` → `<button aria-label="Lukk">`; `aria-labelledby` på dialog.
7. ARIA-opprydding: `aria-live` av input, redundant aria-labels bort, InputError → kun `role="alert"` + `aria-describedby`/`aria-invalid`-kobling.
8. Norske accessible names overalt (i dag engelske, m/ skrivefeil «strk-kode», «pesonal»).
9. `role="img"` + `aria-label` rundt barcode-SVG.
10. Touch targets ≥24 px (infoikon 16 px, checkbox 13 px).
11. `<header><nav>` landmark, logo → `href="/"`, valgfri skip-link.
12. Kontrast: modal-tekst 4.39:1 (lys) og `#007bff`-linker 3.6:1 — løses av token-bytte + underline-linker.

## Fase 4 — Generator v2 (2–3 dager) ⭐ størst produktverdi

1. **Live inline preview** i stedet for modal + Supabase-rundtur: `<Barcode>` rendres debounced (~150 ms) direkte ved input. Supabase-telling → fire-and-forget ved nedlasting. Fikser arkitektonisk: offline-feil, Escape-desync, 4 console-errors ved load, stille valideringsfeil.
2. **Formatvelger** (react-barcode støtter alt allerede — 22 formater verifisert): gruppert `<select>` — Butikk (EAN-13, EAN-8, UPC-A, UPC-E, ITF-14), Intern bruk (CODE128 standard, CODE39, CODE93, Codabar, ITF), Annet (MSI, Pharmacode). Default CODE128.
3. **Validering per format + kontrollsiffer**: EAN-13: 12 siffer → auto-beregn mod-10 («Kontrollsiffer 8 lagt til automatisk»); 13 siffer → valider + én-klikks retting. Samme for EAN-8/UPC-A/ITF-14. `valid`-callback → norske feilmeldinger inline.
4. **Format-hint**: 700–709+13 siffer → «Ser ut som norsk EAN-13 (GS1) — bytt format?»; 978/979 → ISBN. Aldri auto-bytt.
5. **Tilpassing** (collapsed «Tilpass strekkoden»): strektykkelse (width 1–4), høyde (40–160), vis/skjul tekst, marg/lyssone (0–40, hjelpetekst). Ikke fargevelgere — monokrom er både design og skanne-beste-praksis.
6. **Nedlastingspanel**: «Last ned PNG» primær + SVG sekundær + «Kopier til utklippstavle» (ClipboardItem). PNG-oppløsning 1×/3×/6× (trykk). Variant-checkboxes (transparent / uten tekst) → zip kun ved >1 fil. Erstatter dagens tvungne 8-fils-dump.
7. **ISBN-modus**: ISBN-10/13 m/ bindestreker → normaliser, konverter, valider, render som EAN-13 med ISBN som `text`. Valgfritt EAN-5 prisfelt.
8. Koble inn `updateBarcodeDownloadedCount` (finnes, kalles aldri) i ny download-handler.

## Fase 5 — SEO-innhold (1 dag)

1. **Innholdsseksjon** under generatoren (~400–600 ord bokmål, rolig typografisk): H2 «Hvordan lage strekkode – steg for steg» (ol), H2 «Hvilken strekkodetype trenger du?» (tabell CODE128/EAN-13/EAN-8/QR — ærlig om GS1 Norway for butikk-EAN), H2 «Slik skriver du ut strekkoder» (målretter «skriv ut strekkoder», pos 28), H2 «Hva er en strekkode?», H2 FAQ (speiler JSON-LD).
2. **JSON-LD**: WebApplication (offers price 0 NOK) + FAQPage m/ 6 norske Q&A — komplette blokker klare i audit-doc.
3. **OG-bilde**: ekte 1200×630 (`public/og.png` er i dag md5-identisk med 192px-ikonet). Monokrom: hvit bakgrunn, stor CODE128, «Lag strekkoder gratis – strek-kode.no». Lages sammen med ny logo.
4. Etter deploy: GSC URL-inspeksjon på de 4 ikke-indekserte URL-ene; bekreft 404-en i GSC → Sider (trolig `/om` eller `/about`).

## Fase 6 — P2 (senere)

1. Bulk: «Flere strekkoder»-tab — én verdi per linje / CSV / tallserie (prefiks+start+antall) → zip m/ progresjon. JSZip + file-saver allerede installert.
2. Print: «Skriv ut etiketter» — print-CSS m/ mm-enheter, presets Avery L7160 (3×7) / L7651 (5×13) / egendefinert.
3. QR: IKKE bygg — lenke til søsterside qr-kode.app (footer + entry i formatvelger). Be om tilbakelenke (SEO).

## Logo

**Besluttet 27.08.2026:** Retning B — wordmark «stre|||kode» (tre streker erstatter første k; Geist 600, -0.02em, streker i ascender-høyde) som hovedlogo. Retning C — S fylt med strekkode-striper — som favicon/app-ikon (mønsteret forenkles til 3 → 2 striper ved 32/16 px). Begge én farge (`currentColor`), aldri gradient, aldri ramme. Referanse: rebrand-canvaset (side «Design», artboard «Logo — endelig identitet») + brand-kortet i «Strekkode Design System» på claude.ai/design. Implementeres som inline SVG i navbar (Fase 2 pkt. 8), favicon.ico/icon.png og OG-bilde (Fase 5 pkt. 3).

## Åpne spørsmål

1. Fase 4 pkt. 1 fjerner modalen for barcode — OK? (About-modal beholdes.)
2. Skal Kotlin-serveren arkiveres/slettes fra repoet?
3. Innholdsseksjonen (Fase 5) endrer siden fra «ren tool» til «tool + innhold» — greit for deg?

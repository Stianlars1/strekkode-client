# Audit-funn strek-kode.no — 2026-08-27

Full rådata fra 5 parallelle spesialist-audits (Claude Code, ultracode). Se `2026-08-27-relansering.md` for prioritert plan.

## Tilgjengelighet (WCAG 2.2)

**Sammendrag:** Full WCAG 2.2 AA audit of strekkode-client (static code review of every listed component; contrast ratios computed mathematically from the declared HSL/hex values; no browser/screen-reader pass was run). 16 findings: 2 critical, 6 high, 6 medium, 2 low. The most systemic problems: html lang="en" on an all-Norwegian page (3.1.1); the only nav control ("Om oss") renders as an <a> with no href and is completely keyboard-unreachable (2.1.1); buttons have no visible focus indicator because :focus-visible only sets border-color on a border: 0 element (2.4.7); the form label is not associated with the input, the checkbox has no accessible name at all, and the info tooltip is hover-only, Escape-undismissible and anchored to a non-focusable <a> (1.4.13). The barcode result modal ships with no close button and all Modal close affordances are click-only <div>s. Notably, the pre-flagged pair hsl(240 5% 64.9%) on hsl(240 10% 3.9%) PASSES at 7.77:1 — the real contrast failures are the modal body text in light mode (4.39:1), the #007bff links on --muted (3.62:1 light / 3.74:1 dark), and a latent CSS bug where invalid hsl() alpha syntax makes primary/default button backgrounds compute to transparent on hover (~1.05:1 white-on-white while hovered). No prefers-reduced-motion handling exists anywhere, and zero htmlFor attributes exist in the codebase. Known bugs from the shared context (Escape desync, silent JsBarcode failure, PNG filename collision, console errors, Supabase round-trip) were excluded as instructed. The upcoming monochrome refresh is an opportunity: killing the purple --button-primary also removes the invalid-alpha hover rules, and a real focus ring token can be added while the button CSS is rewritten.

### [CRITICAL] html lang="en" on a fully Norwegian page
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/app/layout.tsx`

Line 20: <html lang="en"> while every heading, paragraph, label, button and error string is Norwegian ("Lag strekkoder gratis og enkelt", "Generer strekkode", etc.). Screen readers select their speech synthesizer from the lang attribute, so VoiceOver/NVDA read the entire site with English pronunciation rules, rendering it near-unintelligible. WCAG 3.1.1 Language of Page (Level A).

**Fiks:**

Change to <html lang="nb"> (or lang="no"). One-character-class fix, zero visual impact. The few genuinely English strings (footer copyright) can carry lang="en" on their own element per 3.1.2.

### [CRITICAL] "Om oss" nav control is an <a> with no href — keyboard-unreachable
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/components/ui/button/button.tsx`

button.tsx lines 32-55: variant="link" renders <a {...} href={href}> where href is undefined when only onClick is passed. about.tsx line 10 uses exactly that: <Button variant="link" onClick={...}>Om oss</Button>. An <a> without href has no implicit role, is NOT in the tab order, and does not fire onClick from Enter/Space. The only piece of site navigation (the About modal) is therefore invisible and inoperable for keyboard and most screen-reader users. WCAG 2.1.1 Keyboard (A), 4.1.2 Name, Role, Value (A).

**Fiks:**

In Button, when variant="link" has an onClick but no href, render a real <button type="button"> styled as a link instead of an <a>. Native <button> restores tab order, role, and Enter/Space activation with no ARIA needed.

### [HIGH] No visible focus indicator on any button (:focus-visible only changes border-color on border: 0)
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/components/ui/button/css/button.css`

Lines 68-70: .button:focus-visible { border-color: hsl(var(--button-border)); } — but line 53 sets border: 0, so changing border-color renders nothing. Buttons also get the UA outline suppressed by having a background/appearance reset in some browsers via -webkit-appearance: button + border: 0 styling; in practice there is no perceivable focus state on "Generer strekkode", "Last ned strekkode", or "Om oss". Keyboard users cannot see where they are. WCAG 2.4.7 Focus Visible (AA); the indicator would also fail 2.4.13/1.4.11 if rebuilt too faintly.

**Fiks:**

Replace with .button:focus-visible { outline: 2px solid hsl(var(--ring)); outline-offset: 2px; } using the existing --ring token from globals.css (240 5% 64.9% dark / 240 5% 64.9%→adjust for light). Fits the planned monochrome refresh: black ring on light, white ring on dark.

### [HIGH] Form label not associated with the barcode input; aria-label contradicts the visible label
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/features/barcode/components/barcodeInput/barcodeInput.tsx`

Lines 32-34: <label className="..."> "Skriv inn verdi for strekkode" has no htmlFor and does not wrap the input (grep confirms ZERO htmlFor in the whole codebase). Lines 35-43: the input instead gets aria-label="Skriv inn verdi her" (line 41) — a placeholder-style phrase that overrides the label, so the accessible name ("Skriv inn verdi her") does not contain the visible label text ("Skriv inn verdi for strekkode"): voice-control users saying the visible label cannot target the field. Clicking the label also does not focus the input. WCAG 1.3.1 Info and Relationships (A), 3.3.2 Labels or Instructions (A), 2.5.3 Label in Name (A).

**Fiks:**

Add htmlFor="barcode" to the label (input already has id="barcode" on line 37) and delete the aria-label on line 41. The label becomes the accessible name and its hit area extends to the field.

### [HIGH] ZIP checkbox has no accessible name and its text does not toggle it
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/features/barcode/components/barcodeInput/barcodeInput.tsx`

Lines 46-51: <input type="checkbox"> has no id, no label, no aria-label, no aria-labelledby. The text "Samle filer for nedlasting i .zip?" sits in a sibling <div><p> (lines 53-54). Screen readers announce a bare "checkbox, checked" with no purpose; clicking the text does nothing; and the bare native checkbox (~13×13 CSS px) is also below the 24×24 target minimum with the info icon nearby. WCAG 4.1.2 (A), 1.3.1 (A), 3.3.2 (A), 2.5.8 Target Size Minimum (AA).

**Fiks:**

Give the checkbox id="save-as-zip" and wrap the text in <label htmlFor="save-as-zip">Samle filer for nedlasting i .zip?</label>. This names it, makes the full text a click/touch target (fixing 2.5.8), and needs no ARIA.

### [HIGH] Info tooltip is hover-only: anchored to a non-focusable <a>, tabIndex on the raw SVG, no Escape dismissal
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/features/barcode/components/barcodeInput/barcodeInput.tsx`

Lines 55-65: <a className="info-icon"> has no href so it is not focusable; the tabIndex={0} sits on the FaCircleInfo SVG child (line 57) instead. react-tooltip (v5.26) attaches its open events (mouseenter/focus) to the anchorSelect element — the <a> — so keyboard focus landing on the inner SVG does not reliably open the tooltip: it is hover-only in practice, and unavailable entirely on touch. react-tooltip's Escape close (globalCloseEvents.escape) defaults to off, so the hover content is not dismissible without moving the pointer. The focused SVG also has no role or accessible name — a keyboard user tabs onto an unnamed, apparently inert element. WCAG 1.4.13 Content on Hover or Focus (AA), 2.1.1 Keyboard (A), 4.1.2 (A), 1.1.1 (A).

**Fiks:**

Replace the <a>/SVG with <button type="button" className="info-icon" aria-label="Mer informasjon om zip-nedlasting"> wrapping the icon (icon gets aria-hidden="true"), remove tabIndex from the SVG, and pass globalCloseEvents={{ escape: true }} to <Tooltip>. Better: drop the tooltip and render the sentence as always-visible helper text — it is one short line.

### [HIGH] Barcode result modal has no close button
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/features/barcode/barcodeContainer.tsx`

Line 75: <Modal isOpen={showModal} noPadding={true}> — neither hasCloseBtn nor onClose is passed, so the dialog renders with no visible dismiss control. The only exits are Escape (undiscoverable on touch, and it desyncs state — known bug) and clicking an invisible backdrop <div>. A touch or screen-reader user who does not want to download is stuck staring at a modal with a single "Last ned strekkode" action. Fails the dialog pattern's requirement for a discoverable close affordance; WCAG 2.1.2-adjacent, 4.1.2 dialog semantics.

**Fiks:**

Pass hasCloseBtn={true} and onClose={() => setIsOpen(false)} to the Modal on line 75 (which also repairs the Escape desync since onClose will sync parent state). Combine with the Modal close-button fix below so the control is a real <button>.

### [HIGH] Modal close/scroll/backdrop controls are click-only <div>s and icon-only SVGs with no role or name
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/components/modal/modal.tsx`

Lines 75-78: backdrop is a <div onClick>. Lines 79-83: the sticky "Lukk" scroll-button is <div onClick>. Lines 84-88: the close control is a <div> containing IoIosCloseCircle with onClick on the SVG itself — no tab stop, no Enter/Space handling, no role, no accessible name (icon-only). None of the three close affordances in the About modal is keyboard-operable or announced. The <dialog> itself (lines 69-74) also has no accessible name (no aria-labelledby pointing at the modal heading). WCAG 2.1.1 Keyboard (A), 4.1.2 Name, Role, Value (A), 1.1.1 (A).

**Fiks:**

Make both close affordances <button type="button" aria-label="Lukk" onClick={handleCloseModal}> with the icon aria-hidden="true"; keep the div backdrop as a pointer-only bonus. Add aria-labelledby on the <dialog> referencing the modal's heading id (e.g. the "Om oss" h2), or aria-label="Din strekkode" for the barcode modal. Native <dialog>.showModal() already handles focus trap and focus return, so no extra trap code is needed.

### [MEDIUM] Contrast: modal body text 4.39:1 in light mode; #007bff links 3.62:1 / 3.74:1
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/components/modal/css/modal.css`

modal.css lines 11-12: .modal uses color: hsl(var(--muted-foreground)) on background hsl(var(--muted)). Light mode: hsl(240 3.8% 46.1%) on hsl(240 4.8% 95.9%) = 4.39:1 — fails the 4.5:1 minimum for the About modal's body text (dark mode passes at 5.81:1). aboutMeModal.css lines 13-16: links are #007bff on that same --muted background = 3.62:1 light / 3.74:1 dark — fails in BOTH modes. Note: the pre-flagged pair hsl(240 5% 64.9%) on hsl(240 10% 3.9%) (header subtitle, dark mode) actually PASSES at 7.77:1; light-mode subtitle passes at 4.83:1; footer light passes at 4.74:1. WCAG 1.4.3 Contrast Minimum (AA).

**Fiks:**

In the modal, use hsl(var(--foreground)) on hsl(var(--background)) for body text (the planned monochrome refresh does this for free). Replace #007bff links with the monochrome pattern: hsl(var(--foreground)) + underline (underline already present, satisfying 1.4.1 use-of-color).

### [MEDIUM] Invalid hsl() alpha syntax makes primary/default button backgrounds transparent on hover (~1.05:1 text contrast)
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/components/ui/button/css/button.css`

Line 10 defines --button-primary-hover: 262.1 83.3% 57.8% / 0.75 (alpha baked into the token). Line 99 then writes background-color: hsl(var(--button-primary-hover)/0.9), which substitutes to hsl(262.1 83.3% 57.8% / 0.75/0.9) — two slashes, invalid. Line 91 has the same class of bug: hsl(var(--button-default)/0.75) where --button-default uses comma syntax (240, 5.9%, 10%), producing hsl(240, 5.9%, 10%/0.75) — legacy comma syntax cannot take slash alpha (line 117 .button--secondary:hover likewise). A custom-property value invalid at computed-value time resets background-color to its initial value: transparent. Result: hovering "Generer strekkode" (light mode) leaves hsl(210 20% 98%) text on the white page — about 1.05:1, invisible while hovered. WCAG 1.4.3 (AA).

**Fiks:**

Normalize every button token to space-separated HSL without embedded alpha (e.g. --button-primary-hover: 262.1 83.3% 57.8%) and apply alpha only at the call site: hsl(var(--button-primary-hover) / 0.9). Since the monochrome refresh kills --button-primary: 263.4 70% 50.4% anyway, rewrite the hover states against the new black/white tokens and verify each hover pair still clears 4.5:1.

### [MEDIUM] Generated barcode SVG has no text alternative
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/features/barcode/barcodeContainer.tsx`

Line 77: <Barcode ref={svgBarcode} value={state?.barcodeValue || ""} /> — react-barcode renders a bare <svg> with no role, title, or aria-label. The primary deliverable of the entire site is unnamed for screen-reader users; at best they hit an unlabeled graphic, at worst the SVG <text> node is read out of context. WCAG 1.1.1 Non-text Content (A).

**Fiks:**

react-barcode does not forward aria props reliably, so wrap it: <div role="img" aria-label={`Strekkode for verdien ${state?.barcodeValue}`}> around the visible <Barcode> (the hidden variants on lines 78-101 are display:none and need nothing).

### [MEDIUM] ARIA misuse cluster: aria-live on a text input, redundant aria-labels breaking Label in Name, tabIndex on the error div
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/features/barcode/components/barcodeInput/barcodeInput.tsx`

Line 40: aria-live="polite" on the plain <input> — a live region on a field the user types into is meaningless at best and causes double-speak in some SR/browser pairs. Line 73: the submit button has aria-label="Trykk for å generere strekkode" overriding its visible text "Generer strekkode"; the visible string is not a substring of the accessible name, failing 2.5.3 Label in Name (A) for voice-control users. Lines 96-98: the InputError div stacks role="alert" + aria-live="assertive" + aria-label duplicating its own text + tabIndex={0}, putting a non-interactive element in the tab order and double-announcing the message. WCAG 4.1.2 (A), 2.5.3 (A), 2.4.3 (A, tab-order clutter).

**Fiks:**

Delete aria-live from the input (line 40), delete the button aria-label (line 73 — visible text is the name), and reduce InputError to <div role="alert"><p>{message}</p></div> (drop aria-live, aria-label, tabIndex; role="alert" alone gives assertive announcement). Also connect it to the field with aria-describedby="barcode-error" + aria-invalid on the input when showErrorMessage is true.

### [MEDIUM] English accessible names and alt text on a Norwegian page; several aria-labels contradict visible link text
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/features/about/components/aboutMeModal/aboutMeModal.tsx`

aboutMeModal.tsx lines 27, 48, 75, 84: aria-labels like "Click this link to return to strk-kode.no's homepage" (note the typo strk-kode) and "Click this link to go to stian larsen's pesonal website" on the link whose visible text is "min hjemmeside" — the accessible name neither matches the page language nor contains the visible text (2.5.3 fail for that link). navbar.tsx line 12: alt="The logo for strekkode" (English). footer.tsx lines 16, 30, 39, 48: English aria-labels ("Visit Stian Larsen's GitHub profile") on a Norwegian site — these also fully replace the visible Norwegian-adjacent text. action.ts line 12: error string "Barcode value is required" surfaces in the Norwegian UI. WCAG 3.1.2 Language of Parts (AA), 2.5.3 Label in Name (A).

**Fiks:**

Drop the aria-labels on links that already have visible text (the text IS the name); where a label adds value, write it in Norwegian (e.g. alt="Strekkode-logo", aria-label="GitHub-profilen til Stian Larsen"). Translate the action.ts error to "Du må skrive inn en verdi for strekkoden". Never prefix names with "Click this link".

### [MEDIUM] Touch targets below 24×24: 16px info icon and bare checkbox
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/features/barcode/components/barcodeInput/barcodeInput.tsx`

Lines 56-60: the FaCircleInfo interactive icon is size={16} with no padding — a 16×16 CSS-px target. Lines 46-51: the unstyled native checkbox is ~13×13 px and, with no associated label, the text next to it does not enlarge the target. Both sit adjacent in the same row (barcodeInput.css lines 30-44, gap 0.5rem), so the spacing exception is not a safe assumption. WCAG 2.5.8 Target Size Minimum (AA, 24×24).

**Fiks:**

Convert the icon to a <button> with padding so the rendered box is at least 24×24 (e.g. padding: 4px on a 16px icon = 24px, or use a ::after overlay to reach 44×44 in this touch-first context). Associating the label with the checkbox (finding above) extends its target across the full text.

### [LOW] No prefers-reduced-motion handling anywhere
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/components/ui/button/components/loader/css/loader.css`

Grep confirms zero @media (prefers-reduced-motion) blocks in the codebase. Motion present: infinite spin animation (loader.css lines 5-11), button scale-on-active + multi-property transitions (button.css lines 62-66, 75-77). The current motion is mild, so this is advisory at AA (WCAG 2.3.3 Animation from Interactions is AAA), but the refresh should not ship new motion without the guard. Related: the loader's #7983ff arc on the purple primary button is 2.20:1 (fails 1.4.11 non-text contrast) — moot once the purple dies, but pick a spinner color that clears 3:1 against the new button background.

**Fiks:**

Add once in globals.css: @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; } } and give the loader a reduced-motion fallback (static icon or opacity pulse). In the monochrome refresh use currentColor for the spinner arc.

### [LOW] Navbar is a bare <div>, logo links to "#", and there is no skip link
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/components/navbar/navbar.tsx`

Line 8: the site header/navigation is <div className="navbar"> — no <nav> (or <header>) landmark, so SR landmark navigation skips it (1.3.1 advisory). Line 9: the logo is Link href="#" — a link that navigates nowhere and dumps focus at the page top. No skip-to-content link exists (layout.tsx lines 19-27); impact is low because only two focusable items precede <main>, but 2.4.1 Bypass Blocks (A) is technically satisfied only by the main landmark itself.

**Fiks:**

Wrap in <header><nav aria-label="Hovedmeny">…</nav></header>, point the logo at href="/" and once the About fix lands the tab order is: logo → Om oss → input. A skip link is optional at this page size but one line: <a className="skip-link" href="#main">Hopp til innhold</a> with id="main" on the <main> in hero.tsx line 5.

## Visuell design / monokrom

**Sammendrag:** Monochrome design-token upgrade and layout critique for strek-kode.no. The site is already 90% zinc-neutral in globals.css — the purple lives only in a duplicate, half-broken token block in button.scss (comma-syntax HSL triplets that make every slash-alpha hover an invalid color). Deliverables: (1) a complete ready-to-paste pure-neutral HSL palette for globals.css light+dark keeping all shadcn token names, with the purple --button-primary replaced by aliases to the global tokens; (2) an exact editorial type scale (h1 drops from 3.75rem/700/-0.05em to clamp-based 3.25rem/600/-0.025em/1.1, one clamp() replacing three media queries; footer's stray Arial removed); (3) layout fixes for the below-fold void (height:100dvh → min-height, center the hero column in the flex:1 wrapper, retire the 6rem paddings) and the detached footer (kill the margin:0 -25px hack, anchor with a 1px --border top hairline); (4) a border-first surface system — 1px --input border + 3px ring-alpha focus halo on the input, tokenized modal replacing the hardcoded #ccc border and muted background, and the barcode preview made a deliberate framed card: forced hsl(0 0% 100%) background in both themes (scannability), 2rem padding as guaranteed CODE128 quiet zone, 0.75rem radius, 1px border. The 50px purple PNG navbar logo (580px source) should become a currentColor inline SVG so the mark flips with the theme. 11 findings, each with exact values and file:line citations.

### [HIGH] Complete monochrome HSL palette (light + dark) — ready to paste into globals.css
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/app/globals.css`

globals.css:10-53 is already shadcn-zinc (hue 240, ~4-10% sat) — a faint blue cast, not true monochrome. For a strict black/white system, move every neutral to hue 0, 0% saturation (the shadcn 'neutral' scale). Keep --destructive red: it is the one deliberate non-neutral because the InputError banner (barcodeInput.scss:22-28) needs error semantics. Contrast checks on the proposed values: muted-foreground 0 0% 40% (#666) on white = 5.74:1 (AA normal text, comfortably above the current 46.1% value's 4.7:1); dark muted-foreground 0 0% 65% on 3.9% bg = 7.4:1. Also fix the helper tokens --white/--black (globals.css:6-7) which modal.scss:21 consumes: --black is currently 240 10% 3.9% (zinc, not black).

**Fiks:**

Replace globals.css:10-28 (light) with:
  --background: 0 0% 100%;
  --foreground: 0 0% 9%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 9%;
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  --secondary: 0 0% 96.1%;
  --secondary-foreground: 0 0% 9%;
  --muted: 0 0% 96.1%;
  --muted-foreground: 0 0% 40%;
  --accent: 0 0% 96.1%;
  --accent-foreground: 0 0% 9%;
  --destructive: 0 72.2% 42%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 89.8%;
  --input: 0 0% 89.8%;
  --ring: 0 0% 9%;
and globals.css:33-51 (dark) with:
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --card: 0 0% 7%;
  --card-foreground: 0 0% 98%;
  --popover: 0 0% 7%;
  --popover-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 0 0% 9%;
  --secondary: 0 0% 14.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 0 0% 14.9%;
  --muted-foreground: 0 0% 65%;
  --accent: 0 0% 14.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 85.7% 97.3%;
  --border: 0 0% 16.5%;
  --input: 0 0% 16.5%;
  --ring: 0 0% 83.1%;
Also set globals.css:6-7 to --white: 0 0% 100%; --black: 0 0% 3.9%;

### [HIGH] Purple --button-primary plus invalid comma+slash HSL syntax silently breaks every button hover
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/components/ui/button/css/button.scss`

Two problems in one block. (1) The purple lives at button.scss:10-12 (light) and 37-39 (dark): --button-primary: 263.4 70% 50.4%. (2) Most other --button-* tokens use COMMA-separated triplets (e.g. line 5: --button-border: 240, 5.9%, 90%), so every slash-alpha use — hsl(var(--button-default) / 0.75) at :119, hsl(var(--button-destructive) / 0.9) at :136, hsl(var(--button-secondary) / 0.75) at :146, hsl(var(--button-accent) / 0.9) at :157 — expands to hsl(240, 5.9%, 10% / 0.75), which is invalid CSS (legacy comma syntax rejects slash alpha). Those hover states currently do nothing; the buttons only hover-respond where the value happens to be space-separated. This duplicate 54-line palette also drifts from globals.css.

**Fiks:**

Delete both :root blocks (button.scss:1-54) and alias to the global tokens so buttons inherit dark mode for free:
:root {
  --button-radius: var(--radius);
  --button-border: var(--border);
  --button-background: var(--background);
  --button-foreground: var(--foreground);
  --button-primary: var(--primary);
  --button-primary-foreground: var(--primary-foreground);
  --button-default: var(--primary);
  --button-default-foreground: var(--primary-foreground);
  --button-destructive: var(--destructive);
  --button-destructive-foreground: var(--destructive-foreground);
  --button-secondary: var(--secondary);
  --button-secondary-foreground: var(--secondary-foreground);
  --button-accent: var(--accent);
  --button-accent-foreground: var(--accent-foreground);
}
All triplets become space-separated, so the existing hsl(var(--x) / a) hovers start working. For .button--primary (:122-128), drop --button-primary-hover and use background-color: hsl(var(--button-primary) / 0.85) on hover — near-black at 85% over white reads as gray-800 in light mode, white at 85% over black reads as gray-200 in dark. Also delete the inline purple-override hack in barcodeContainer.tsx:104-107 (style={{ backgroundColor: "hsl(240 5.9% 10%)" ... }}) — it exists only to hide the purple and hardcodes light-mode colors into dark mode.

### [HIGH] Type scale: replace 3.75rem/700/-0.05em display slop with an editorial clamp-based scale
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/components/header/css/header.scss`

header.scss:10-13 sets the h1 to 3.75rem / 700 / -0.05em / line-height 1 — oversized, over-bold, over-tracked; exactly the 'huge bold AI hero' pattern the owner wants gone. -0.05em at 60px visibly crushes Geist; line-height 1 clips descenders on two-line wraps at ≤1024px. Three media queries (header.scss:32-61) re-declare the size. Subtitle (header.scss:23-24) is 1.25rem/1.75rem — slightly loud for supporting copy — and declares text-wrap: balance AND pretty (:27-28, the first is dead). Label (barcodeInput.scss:15) is an odd 1.1rem/400, larger than the input it labels. Footer (footer.scss:6) hard-codes font-family: Arial, sans-serif, so the footer renders in Arial while the rest of the page is Geist. globals.css:74 'font-family: inherit, system-ui, ...' is invalid CSS (CSS-wide keyword in a list) and is silently dropped — dead code. No font smoothing is set on the root.

**Fiks:**

Exact scale (Geist Sans stays):
- h1 (header.scss:10-13): font-size: clamp(2.25rem, 1.4rem + 3.4vw, 3.25rem); font-weight: 600; letter-spacing: -0.025em; line-height: 1.1; keep text-wrap: balance. Delete the font-size overrides in all three media queries (:36-38, :46-48, :56-58).
- subtitle (header.scss:20-29): font-size: 1.125rem; font-weight: 400; letter-spacing: 0; line-height: 1.6; max-width: 34rem; color: hsl(var(--muted-foreground)); keep only text-wrap: pretty (delete :27).
- label (barcodeInput.scss:15): font-size: 0.875rem; font-weight: 500; letter-spacing: 0; line-height: 1.4; color: hsl(var(--foreground)).
- input (barcodeInput.scss:19): keep font-size: 1rem (16px floor prevents iOS zoom); line-height: 1.5.
- button (button.scss:72-74): keep 0.875rem / 500; set line-height: 1.25; letter-spacing: 0.
- footer: font-size: 0.875rem; font-weight: 400; line-height: 1.5; color: hsl(var(--muted-foreground)); DELETE footer.scss:6 (Arial).
- root: add -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; to body in globals.css:68, and delete the invalid font-family at globals.css:74-75.

### [HIGH] Below-fold void on desktop: fixed 100dvh body + top-hugging hero leaves a dead zone above the footer
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/app/globals.css`

globals.css:61-66 sets html, body { height: 100dvh } (fixed, not min). The .whole-page-wrapper (page.scss:9) is flex: 1 1 auto, so it stretches to fill the viewport, but its content is top-aligned: navbar 70px + header padding 6rem top (header.scss:2) + ~200px of hero content + 6rem wrapper bottom padding (page.scss:2), then ~300-400px of empty stretched wrapper before the footer on a 900px-tall desktop viewport. The page reads as 'content, void, orphaned footer'.

**Fiks:**

Three exact changes: (1) globals.css:64 → min-height: 100dvh (allow natural growth; keeps the footer pinned via the existing body flex column). (2) page.scss: add justify-content: center to .whole-page-wrapper and reduce padding to 0 1.5rem 4rem — the hero block then sits optically centered in the leftover space instead of hugging the top. (3) header.scss:2 → padding: clamp(2rem, 6vh, 4rem) 0 2.5rem (from 6rem 0 48px), and gap: 1rem (from 1.2rem, header.scss:7). Resulting vertical rhythm on desktop: 64px navbar, ~viewport-centered [h1 → 16px → subtitle → 40px → form], ≤64px to footer. The three header media queries (:32-61) can then drop their padding overrides too — clamp covers all widths.

### [MEDIUM] Footer is visually detached: negative-margin hack, 20%-alpha tint band, and no anchor line
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/components/footer/css/footer.scss`

footer.scss:3 uses margin: 0 -25px + min-width: 100% (:9) to fake full-bleed — fragile and currently causes the footer edges to depend on parent padding. Its background hsl(var(--muted) / 0.2) (:7) is a barely-visible gray wash that reads as a rendering artifact rather than a section. In a monochrome system a section boundary should be a hairline, not a tint. Link rows also sit on 25px gaps (:20) with no vertical padding, giving small hover/touch targets.

**Fiks:**

Replace footer.scss:1-9 with:
footer {
  width: 100%;
  margin: 0;
  padding: 2rem 1.5rem;
  background: hsl(var(--background));
  border-top: 1px solid hsl(var(--border));
  text-align: center;
  color: hsl(var(--muted-foreground));
  font-size: 0.875rem;
}
Keep .social-links gap: 1.5rem but add padding: 0.25rem 0 to each link for hit area. The 1px --border hairline is what ties the footer to the page — same articulation as the input and card borders (one border language across the whole site).

### [MEDIUM] Navbar: 50px purple PNG logo (580px source) breaks monochrome and cannot theme-switch
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/components/navbar/navbar.tsx`

navbar.tsx:11-15 renders /public/strekkode.png (580x580, 145KB, purple mark) at 50x50. A raster logo can't follow prefers-color-scheme, so it will stay purple in both themes — the single loudest non-monochrome element on the page. The wrapping Link href="#" (:9) is a dead link. navbar.scss:5-6 pads 20px 20px 0 with a fixed height: 70px, so the logo sits high and the 'Om oss' link is not vertically centered against it.

**Fiks:**

Replace the PNG with an inline SVG mark or a text wordmark using currentColor, e.g. a minimal barcode glyph:
<svg width="28" height="28" viewBox="0 0 28 28" fill="currentColor" aria-hidden="true"><rect x="2" width="3" height="28"/><rect x="7" width="1.5" height="28"/><rect x="11" width="4" height="28"/><rect x="17" width="1.5" height="28"/><rect x="21" width="2" height="28"/><rect x="25.5" width="1" height="28"/></svg>
next to a 0.9375rem/600 'strekkode' wordmark, inside <Link href="/">. It inherits --foreground, so it is black in light and white in dark with zero extra CSS. navbar.scss: height: 64px; padding: 0 1.5rem; align-items: center (drop the top-only padding). This also deletes 145KB from the critical path.

### [HIGH] Input field has no designed surface: give it the border-first treatment that defines the whole system
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/features/barcode/components/barcodeInput/css/barcodeInput.scss`

barcodeInput.scss:17-21 styles the product's single most important control with only padding/font-size/width — it renders with the browser default UA border (2px inset gray on some engines), which looks dated and ignores the token system entirely in both themes. The min-width: 50% column (:11, then 70%/90% in media queries :76-93) makes the input's width a percentage of the hero, so it jumps between breakpoints. Monochrome surface doctrine for the whole site: borders articulate, shadows only whisper (one soft shadow max, light mode only); hierarchy comes from border + background lightness steps, never from color.

**Fiks:**

Input (barcodeInput.scss:17-21):
  width: 100%;
  padding: 0.625rem 0.875rem;
  font-size: 1rem;
  font-family: inherit;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
  border: 1px solid hsl(var(--input));
  border-radius: calc(var(--radius) - 2px);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  &::placeholder { color: hsl(var(--muted-foreground) / 0.7); }
  &:focus-visible { outline: none; border-color: hsl(var(--ring)); box-shadow: 0 0 0 3px hsl(var(--ring) / 0.15); }
Column (:7-13): replace min-width: 50% with width: 100%; max-width: 26rem — one fixed comfortable measure at every viewport; the 768px/500px media queries (:76-93) then delete entirely. Reduce form gap (:6) from 40px to 1.75rem so the button reads as part of the form group (inter-group spacing stays ≥2x the 0.34rem→0.5rem intra-group gap).

### [MEDIUM] Modal surface: hardcoded #ccc border, muted background, and low-contrast muted-foreground body text
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/components/modal/css/modal.scss`

modal.scss:10 hardcodes border: 1px solid #ccc — a literal light-gray line that glows wrongly in dark mode. :11-12 paints the dialog hsl(var(--muted)) with color: hsl(var(--muted-foreground)), i.e. gray-on-gray body text as the default. Headings are patched back to readable via hsl(var(--black)) at :21 plus a 20-line dark-mode override block (:92-111) — all of which becomes dead code once the surface uses popover tokens. :13 overflow-y: scroll forces a permanent scrollbar gutter even when content fits (same at barcodeContainer.scss:29).

**Fiks:**

Replace modal.scss:9-13 with:
  background: hsl(var(--popover));
  color: hsl(var(--popover-foreground));
  border: 1px solid hsl(var(--border));
  border-radius: 0.75rem;
  box-shadow: 0 16px 40px -12px hsl(0 0% 0% / 0.25);
  overflow-y: auto;
In dark mode the shadow is invisible against near-black anyway — add @media (prefers-color-scheme: dark) { .modal { box-shadow: none; } } (this generalizes the one-off .modal-content-about-us shadow removal at globals.css:83-87, which can then be deleted). Delete modal.scss:15-30 heading/strong color overrides and the whole dark block :92-111 — popover tokens make them redundant. Keep ::backdrop at hsl(0 0% 0% / 0.5) (:44) — correct for monochrome.

### [MEDIUM] Barcode preview: make the forced-white card a deliberate framed object with a guaranteed quiet zone
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/features/barcode/css/barcodeContainer.scss`

The preview already forces white (barcodeContainer.scss:18) — correct, because a CODE128 symbol must sit on white to scan, including in dark mode. But it reads as an accident: line 17 is background-color: var(--white), which is invalid (the var holds a raw HSL triplet, not a color) and is only rescued by line 18; padding is a cramped 20px (:20) which does not guarantee the CODE128 quiet zone (spec: ≥10 module widths, ≥ 6.4mm — at JsBarcode's default 2px module that is ≥20px minimum with zero margin for error); and in dark mode the white rectangle floats with no frame relationship to the near-black dialog behind it.

**Fiks:**

In .modal-content-barcode (barcodeContainer.scss:11-30): delete line 17 (invalid var()); set
  background: hsl(0 0% 100%); /* literal white in BOTH themes — scannability, not theming */
  color: hsl(0 0% 9%);
  padding: 2rem 2.5rem; /* 32/40px: quiet zone with 2x headroom over the 20px CODE128 minimum */
  border-radius: 0.75rem;
  border: 1px solid hsl(var(--border));
  box-shadow: none;
  overflow-y: auto;
The intent: dark modal (popover 0 0% 7%) → 1px border → white card = a deliberate three-step framed 'printed label' object, matching how a real barcode sticker looks. In light mode the same card reads as a bordered sheet on white. Move the download button OUTSIDE the white card (below it, on the modal surface) so the white area contains only the symbol and its human-readable digits — this is what makes it look designed rather than 'white box because the library needed it'.

### [LOW] Button surface: layered default shadow and scale-transition remnants fight the border-first system
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/components/ui/button/css/button.scss`

button.scss:87 gives every button a two-layer shadow, re-declared identically on destructive (:133) and secondary (:143); combined with the purple fill this is the shadcn-default look the owner calls AI-generated. :81-85 declares transition twice (transition: scale then transition-property list without scale), so the :active scale 0.98 (:99) snaps un-eased in some engines. :89-91 sets focus-visible border-color on a border: 0 element (no visible effect; the UA outline is what actually shows).

**Fiks:**

Monochrome button doctrine: primary = solid hsl(var(--primary)) fill, NO shadow (a black fill needs no elevation); secondary/outline = 1px solid hsl(var(--border)) + transparent background, hover background hsl(var(--accent)). Delete the box-shadow at :87, :133, :143. Replace :81-85 with one declaration: transition: background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.15s, color 0.15s, scale 0.15s;. Replace :89-91 with a real ring matching the input: &:focus-visible { outline: none; box-shadow: 0 0 0 3px hsl(var(--ring) / 0.2); } (on filled primary in light mode the 9%-lightness ring alpha reads as a soft black halo; in dark the 83.1% ring reads white). Bump padding to 0.5625rem 1.125rem so the primary CTA has slightly more presence than the 14px label suggests.

### [LOW] Modal 'Lukk' controls are non-semantic divs styled with foreground/background token swap
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/components/modal/css/modal.scss`

Surface-adjacent note from the same files: .scroll-button (modal.scss:49-74) is an inverted pill (foreground bg / background text) — visually fine in monochrome and worth keeping as the one inverted element in the dialog — but it and .close-button (:76-86) are rendered as <div onClick> in modal.tsx:80-88, so they are invisible to keyboard and screen readers. Escape state-desync is already known and excluded; this is the surface/semantics side only.

**Fiks:**

Render both as <button type="button" aria-label="Lukk"> and add to modal.scss: .scroll-button, .close-button { border: 0; font: inherit; } plus &:focus-visible { outline: none; box-shadow: 0 0 0 3px hsl(var(--ring) / 0.2); } — the same 3px ring token used on input and buttons, keeping one focus language across every interactive surface.

## Motion & interaksjon

**Sammendrag:** Motion audit of strek-kode.no (read-only). Current inventory: one button color transition plus an :active scale that actually snaps (button.scss line 81's `transition: scale 0.15s ease-in-out` is dead code — lines 82–85 override transition-property to colors only), a purple 1s spinner, and nothing else: the native <dialog> pops open with no animation, the barcode (the product's payoff moment) appears instantly, inputs have no focus transition, errors mount abruptly, and there is zero prefers-reduced-motion handling in src/. Proposed system (Emil Kowalski school — restrained, fast, asymmetric): two easings (cubic-bezier(0.22,1,0.36,1) for enter/exit movement, plain `ease` for hover/color) and four durations (150ms quick/exit, 250ms enter, 500ms reserved solely for the one earned moment — the barcode printing itself in via clip-path wipe). Modal uses @starting-style + `transition-behavior: allow-discrete` (progressive enhancement: older browsers keep today's instant pop), enter 250ms scale 0.96→1 / exit 150ms, ::backdrop fades with it. All animations are keyed to `.modal[open]` so they replay per open and never fire on the hidden dialog at page load. Reduced-motion strategy: keep opacity/color fades, strip transform/clip-path/shake, deliberately not the blanket 0.01ms nuke (it would kill the loading spinner). Everything is plain CSS/SCSS in the existing per-component files — no motion library needed. All snippets below are exact and drop-in; verify in-browser at 10% speed via DevTools Animations panel after applying.

### [HIGH] Modal/dialog opens and closes with zero animation — add @starting-style enter + allow-discrete exit with backdrop fade
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/components/modal/css/modal.scss`

src/components/modal/modal.tsx lines 54-60 call showModal()/close() with no transition, and src/components/modal/css/modal.scss (lines 1-47) defines no opacity/transform states, so the dialog and its ::backdrop pop in and out instantly. This is the most jarring moment on the site since the modal is how every generated barcode is presented. A modal is centered and unanchored, so it should scale from center (transform-origin stays default) — 0.96 → 1, enter 250ms, exit 150ms (exits softer and faster than enters). The native close() path needs `transition-behavior: allow-discrete` on `display` and `overlay` so the dialog stays in the top layer while fading out; browsers without support (pre-Chrome 117 / Safri 17.4) simply keep today's instant behavior — pure progressive enhancement, no JS changes to modal.tsx required.

**Fiks:**

Add to src/app/globals.css :root (line 5 area): `--ease-out-quart: cubic-bezier(0.22, 1, 0.36, 1);`. Then in modal.scss, keep all existing layout rules and add:

.modal {
  opacity: 0;
  transform: scale(0.96);
  transition:
    opacity 150ms var(--ease-out-quart),
    transform 150ms var(--ease-out-quart),
    overlay 150ms allow-discrete,
    display 150ms allow-discrete;
}
.modal[open] {
  opacity: 1;
  transform: scale(1);
  transition:
    opacity 250ms var(--ease-out-quart),
    transform 250ms var(--ease-out-quart),
    overlay 250ms allow-discrete,
    display 250ms allow-discrete;
}
.modal::backdrop {
  background: hsl(0 0% 0% / 0);
  transition:
    background-color 150ms ease-out,
    overlay 150ms allow-discrete,
    display 150ms allow-discrete;
}
.modal[open]::backdrop {
  background: hsl(0 0% 0% / 0.5);
  transition-duration: 250ms;
}
@starting-style {
  .modal[open] { opacity: 0; transform: scale(0.96); }
  .modal[open]::backdrop { background: hsl(0 0% 0% / 0); }
}

Also delete the dead `padding: 20px; overflow: hidden;` from the current ::backdrop block (modal.scss lines 45-46) — they have no effect on a backdrop. Enter timing lives on `.modal[open]`, exit timing on the base selector, which is how CSS picks 250ms in / 150ms out automatically.

### [HIGH] Barcode reveal: make the product's aha moment feel printed, not pasted — clip-path wipe keyed to dialog [open]
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/features/barcode/css/barcodeContainer.scss`

src/features/barcode/barcodeContainer.tsx line 77 renders the JsBarcode SVG which appears fully-formed the instant the modal opens. This is the one place a 500ms animation is earned. JsBarcode's SVG structure is `<svg><rect(background)/><g><rect/>... <text/></g></svg>`, so a left-to-right `clip-path: inset()` wipe on the whole `<svg>` reads as the barcode printing itself (bars first, the human-readable digits wipe in under them) — on-brand for a barcode tool and implementable with zero JS. Critical detail: the dialog and its SVG are mounted (closed) at initial page load, so a plain mount-triggered keyframe would run once, invisibly, at load and never replay. Scoping the animation to `.modal[open]` makes it restart on every open and never fire while hidden. Keyframes (not transitions) are correct here per the interruptible-animations rule: this is a one-shot staged sequence, not an interactive state. The download button fades up 4px after the wipe finishes so the eye lands on the barcode first.

**Fiks:**

Append to barcodeContainer.scss (current content ends line 33):

.modal[open] .modal-content-barcode > svg {
  animation: barcode-print 500ms cubic-bezier(0.22, 1, 0.36, 1) 120ms both;
}

.modal[open] .modal-content-barcode > .button {
  animation: fade-rise 250ms cubic-bezier(0.22, 1, 0.36, 1) 380ms both;
}

@keyframes barcode-print {
  from { clip-path: inset(0 100% 0 0); }
  to   { clip-path: inset(0 0 0 0); }
}

@keyframes fade-rise {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

The 120ms delay lets the 250ms modal enter get underway before the print starts (overlapping, not sequential — sequential feels slow); `both` fill keeps the SVG hidden during the delay. The `.button` selector works because getButtonClasses (src/components/ui/button/utils/utils.tsx line 8) always emits the `button` base class. Total choreography: backdrop+dialog 0-250ms, bars 120-620ms, button 380-630ms — one composed moment just over half a second, once per generation.

### [MEDIUM] Button :active scale snaps with no transition (dead declaration), focus ring is invisible, loader is purple — consolidate into one transition list
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/components/ui/button/css/button.scss`

Three defects in src/components/ui/button/css/button.scss: (1) line 81 sets `transition: scale 0.15s ease-in-out` but lines 82-85 immediately override `transition-property` to colors only, so the `:active { scale: 0.98 }` on lines 98-100 snaps instantly with zero animation today — the site's only intended motion is dead code (line 65's `transition-property: color` is also redundant). (2) Lines 89-91 style :focus-visible by changing border-color, but the button has `border: 0` (line 69), so keyboard focus is completely invisible. (3) The loading spinner (src/components/ui/button/components/loader/css/loader.scss lines 1-6) is hardcoded purple `#7983ff` — violates the monochrome direction — and 1s per revolution reads sluggish; a faster spinner increases perceived speed. Additionally the loading state swaps children abruptly (button.tsx lines 59-68).

**Fiks:**

In button.scss, delete line 65 (`transition-property: color;`) and replace lines 81-85 with a single declaration, and update :active/:focus-visible:

.button {
  transition:
    scale 160ms ease-out,
    background-color 150ms ease,
    color 150ms ease,
    border-color 150ms ease;

  &:active { scale: 0.97; }

  &:focus-visible {
    outline: 2px solid hsl(var(--ring));
    outline-offset: 2px;
  }
}

(0.97 press scale per the Kowalski range 0.95-0.98; 160ms ease-out makes press and release both feel tracked. Never `transition: all`.) In loader.scss replace lines 1-6 with:

.loader {
  border: 3px solid color-mix(in srgb, currentColor 25%, transparent);
  border-left-color: currentColor;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.isLoading { animation: fade-in 150ms ease-out; }
@keyframes fade-in { from { opacity: 0; } }

currentColor makes the spinner inherit each variant's text color automatically (white on the dark primary button) — monochrome with no per-variant CSS, and it survives the planned purple-token removal untouched.

### [MEDIUM] Input has no styled focus state or transition — add a token-based ring with 150ms ease
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/features/barcode/components/barcodeInput/css/barcodeInput.scss`

src/features/barcode/components/barcodeInput/css/barcodeInput.scss lines 17-21: the barcode input (the first thing every visitor touches) has only padding/font-size/width — browser-default border and default focus outline that pops with no transition and ignores the design tokens. globals.css already defines `--input` (line 27) and `--ring` (line 28, zinc 240 5% 64.9%) which are unused here. A 150ms `ease` transition on border-color + box-shadow is the correct class for a color-only state change (not ease-out, which is for movement). Using box-shadow for the ring keeps it non-layout-shifting; `outline: none` is safe only because the shadow ring replaces it, and :focus-visible always matches on text inputs regardless of pointer vs keyboard.

**Fiks:**

Replace the `&__input` block (lines 17-21) with:

&__input {
  padding: 0.475rem 0.875rem;
  font-size: 1rem;
  width: 100%;
  border: 1px solid hsl(var(--input));
  border-radius: calc(var(--radius) - 2px);
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  outline: none;
  box-shadow: 0 0 0 3px hsl(var(--ring) / 0);
  transition: border-color 150ms ease, box-shadow 150ms ease;

  &:focus-visible {
    border-color: hsl(var(--ring));
    box-shadow: 0 0 0 3px hsl(var(--ring) / 0.2);
  }
}

Animating from `hsl(var(--ring) / 0)` (transparent ring already 3px) rather than `none` means only alpha interpolates — the ring fades in instead of growing, which is the subtler read.

### [MEDIUM] Error message mounts abruptly — slide-down enter followed by a small settle-shake, with a replay key
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/features/barcode/components/barcodeInput/css/barcodeInput.scss`

src/features/barcode/components/barcodeInput/barcodeInput.tsx lines 85-103: InputError is conditionally rendered (`show ? <div> : null`) with no enter animation; the red box (barcodeInput.scss lines 22-28) blinks into existence. Proposal: 200ms slide-down+fade (movement -4px, ease-out-quart) then a single restrained shake (±4px, 300ms) starting as the slide lands — 'this is wrong' feedback without theatrics. Two implementation traps: (a) the shake must NOT have a `both`/`backwards` fill, because its backwards-filled `translateX(0)` would override the slide's translateY during the delay — default `fill: none` lets the slide own transform until 200ms; (b) React won't remount the div when the same error message occurs on a second failed submit, so the animation never replays — key the element on a per-attempt timestamp from the server action (src/features/barcode/action.ts lines 8-15 currently returns only isSuccess/barcodeValue/errorMessage).

**Fiks:**

In barcodeInput.scss, extend `&__input-error` (lines 22-28) and add keyframes at file scope:

&__input-error {
  /* existing declarations stay */
  animation:
    error-in 200ms cubic-bezier(0.22, 1, 0.36, 1) both,
    error-shake 300ms ease-in-out 200ms; /* no fill — deliberate, see note */
}

@keyframes error-in {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes error-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(2px); }
}

For replay: add `ts: Date.now()` to the error return objects in action.ts (line 9-13) and utils/supabase/crud.ts error paths, add `ts?: number` to CreateBarcodeReturnType in src/types/types.ts, then in barcodeInput.tsx line 44 render `<InputError key={state?.ts} show={showErrorMessage} message={state?.errorMessage} />` — a fresh key remounts the div so the animation replays even for the identical message.

### [LOW] Tooltip uses react-tooltip's 300ms opacity-only default — tighten to 125ms fade+scale with show delay
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/features/barcode/components/barcodeInput/barcodeInput.tsx`

src/features/barcode/components/barcodeInput/barcodeInput.tsx lines 62-65: the zip-info Tooltip runs react-tooltip v5.26 defaults — 0.3s opacity ease-out, no delay, no transform, and 0.9 opacity. 300ms is double the tooltip class (125-200ms); no show-delay means it flashes on accidental hover-through. react-tooltip positions with inline left/top (not transform), so adding our own transform is safe, and it exposes the state classes `react-tooltip__show` / `react-tooltip__closing` for styling. place="top" means the tooltip should grow toward its trigger from its bottom edge (origin-aware popover; only modals stay center-origin).

**Fiks:**

In barcodeInput.tsx line 62 add delay and full opacity:

<Tooltip anchorSelect=".info-icon" place="top" delayShow={300} opacity={1}>

Then add to barcodeInput.scss (file scope, not nested — react-tooltip portals near the anchor but keep the selector global):

.react-tooltip {
  transition: opacity 125ms ease-out, transform 125ms ease-out !important;
  transform: translateY(2px) scale(0.98);
  transform-origin: 50% 100%; /* place="top": grows toward the trigger */
}
.react-tooltip__show { transform: translateY(0) scale(1); }
.react-tooltip__closing { transform: translateY(1px) scale(0.99); }

(`!important` is required once here to beat the library's bundled `transition: opacity 0.3s ease-out`.) Scale from 0.98 — never 0; the exit relaxes only to 0.99 so closing is quieter than opening. 125ms both ways keeps the hint feeling instant without the flash-on-pass-through the 300ms delayShow prevents.

### [MEDIUM] No prefers-reduced-motion handling anywhere — add a targeted reduce block (fades kept, movement removed), not the blanket 0.01ms nuke
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/app/globals.css`

grep across src/ confirms zero `prefers-reduced-motion` rules. Once the motion above lands this becomes an accessibility gap (WCAG 2.3.3). Strategy: reduced motion means fewer and gentler animations, not zero — keep opacity/color fades (they aid comprehension: the modal appearing, the error appearing), remove everything that moves (scale, translate, clip-path wipe, shake, press scale). Deliberately avoid the popular `* { animation-duration: 0.01ms !important }` reset: it would also freeze the loading spinner, which communicates in-progress state and must keep spinning. A single opt-down block in globals.css covers every surface introduced by this audit.

**Fiks:**

Append to globals.css (after line 100):

@media (prefers-reduced-motion: reduce) {
  /* Modal: fade only, quicker */
  .modal, .modal[open] { transform: none; transition-duration: 100ms; }
  .modal::backdrop, .modal[open]::backdrop { transition-duration: 100ms; }

  /* Barcode + download button: simple fade instead of wipe/rise */
  .modal[open] .modal-content-barcode > svg,
  .modal[open] .modal-content-barcode > .button {
    animation: rm-fade 160ms ease-out both;
  }

  /* Button: no press scale (color feedback remains) */
  .button:active { scale: 1; }

  /* Error: fade only, no slide, no shake */
  .input-container__form__input-content__input-error {
    animation: rm-fade 160ms ease-out both;
  }

  /* Tooltip: fade only */
  .react-tooltip,
  .react-tooltip__show,
  .react-tooltip__closing { transform: none; }
}

@keyframes rm-fade { from { opacity: 0; } }

The loader's `spin` keyframe is intentionally untouched. Note motion is never the only feedback channel here: every animated change also has a static cue (backdrop dim, red error surface, ring color, spinner presence), so removing movement loses nothing semantically.

## Generator-funksjonalitet

**Sammendrag:** Gap analysis for strek-kode.no as a complete professional barcode tool. VERIFIED CAPABILITY HEADROOM: the already-installed stack (react-barcode ^1.5.1 wrapping JsBarcode) supports 22 formats confirmed from JsBarcode's src/barcodes/index.js — CODE128 auto/A/B/C, EAN-13/8/5/2, UPC-A, UPC-E, CODE39, CODE93 (+FullASCII), ITF, ITF-14, MSI/MSI10/MSI11/MSI1010/MSI1110, Pharmacode, Codabar — and a full options object confirmed from the JsBarcode wiki (format, width=2, height=100, displayValue=true, text, fontOptions, font, textAlign, textPosition, textMargin, fontSize=20, background=#ffffff, lineColor=#000000, margin=10 + per-side margins, flat, valid callback). The site currently uses ONE format and ZERO options (barcodeContainer.tsx:77 passes only value/background/displayValue), so ~90% of a professional feature set is unlockable without any new dependency. COMPETITORS: TEC-IT (barcode.tec-it.com) exposes format menu, auto check digit, module width/DPI, rotation, quiet zone with units, text/font controls, colors, GIF/JPG/PNG/SVG, sequence generation; Orca Scan exposes 12 formats, caption, font size, bulk quantity/spreadsheet import, PNG/JPG/SVG/PDF, label designer. barcode-generator.org is dead (301-redirects to Bitly's QR pages) — its Nordic traffic is an SEO opening. NORWEGIAN MARKET: 'lage strekkode' intent clusters around EAN-13 for retail (GS1 Norway prefixes 700-709; structure prefix + leverandornummer 4/5/7 digits + artikkelnummer + mod-10 kontrollsiffer — JsBarcode's EAN13 encoder rejects a wrong check digit outright, so auto-compute/validate is mandatory, not nice-to-have), ISBN for books (renderable as EAN-13 after 978-conversion), and CODE128/39 for internal inventory. ROADMAP: P0/critical = format selector with per-format validation + check-digit auto-compute, and live inline preview replacing the modal + Supabase-gated generate flow (also removes the hidden-variant console errors and offline failure architecturally). P1/high = size/text/quiet-zone controls (4 props), download panel with single-file default + PNG resolution + copy-to-clipboard, ISBN mode, format auto-suggestion from input shape (70x->EAN-13, 978->ISBN, 12 digits->check-digit offer). P2/medium = bulk list/CSV/sequence to zip (JSZip already installed), print sheet with Avery L7160/L7651 presets via print CSS, and a QR cross-link to sister site qr-kode.app instead of duplicating QR. One low finding: crud.ts:82-97 updateBarcodeDownloadedCount is never called anywhere, so download insights never increment — wire it into the new download handler or delete it.

### [CRITICAL] Format selector with per-format validation and EAN check-digit auto-compute
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/features/barcode/components/barcodeInput/barcodeInput.tsx (lines 35-43); /Users/stian/Developer/nettsider/strekkode/strekkode-client/src/features/barcode/barcodeContainer.tsx (line 77)`

The single text input renders CODE128-auto only — <Barcode> at barcodeContainer.tsx:77 passes no `format` prop. Verified against JsBarcode source (src/barcodes/index.js export): the already-installed library (react-barcode ^1.5.1, package.json) supports CODE39, CODE128/A/B/C, EAN13, EAN8, EAN5, EAN2, UPC (UPC-A), UPCE, ITF14, ITF, MSI/MSI10/MSI11/MSI1010/MSI1110, pharmacode, codabar, CODE93, CODE93FullASCII. Norwegian 'lage strekkode' searchers largely need EAN-13 (GTIN-13) for products sold in Norwegian stores — GS1 Norway prefixes 700-709, structure: prefix + leverandornummer (4/5/7 digits) + artikkelnummer + kontrollsiffer. JsBarcode's EAN13 encoder REFUSES an invalid check digit (renders nothing, fires the `valid(false)` callback), so without check-digit handling the format is unusable for exactly the users who need it most. Both competitors (TEC-IT barcode.tec-it.com, Orca Scan) lead with a format picker; TEC-IT auto-computes the EAN-13 check digit.

**Fiks:**

Add a <select name="format"> above the input with grouped Norwegian labels: 'Butikk og netthandel' (EAN-13 - varer i butikk, EAN-8, UPC-A, UPC-E, ITF-14 - D-pak/kartong), 'Intern bruk og lager' (CODE128 - standard, CODE39, CODE93, Codabar, ITF), 'Annet' (MSI, Pharmacode). Default CODE128. Per-format input rules: EAN-13 -> inputMode="numeric", maxLength 13; on 12 digits compute the mod-10 check digit ((10 - (sum of digits, x3 on alternate positions from the right) % 10) % 10) and show 'Kontrollsiffer 8 lagt til automatisk'; on 13 digits validate and offer one-click 'Rett kontrollsiffer til X'. Same logic for EAN-8 (7+1), UPC-A (11+1), ITF-14 (13+1). Wire JsBarcode's `valid` callback (react-barcode passes it through) to show inline Norwegian errors, e.g. 'Ugyldig tegn for CODE39 - bruk A-Z, 0-9, - . $ / + % mellomrom'.

### [CRITICAL] Live inline preview instead of generate-button + modal + Supabase round-trip
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/features/barcode/barcodeContainer.tsx (lines 75-113); /Users/stian/Developer/nettsider/strekkode/strekkode-client/src/features/barcode/action.ts (line 15); /Users/stian/Developer/nettsider/strekkode/strekkode-client/src/utils/supabase/crud.ts (lines 46-81)`

Today the barcode only appears after submitting a form whose server action does a Supabase RPC (`create_barcode`, crud.ts:56) and then opens a modal. Barcode rendering is 100% client-side in JsBarcode — the network round-trip adds latency and a failure mode for zero functional benefit (counting can happen asynchronously). TEC-IT and Orca Scan both render the barcode live as you type. This restructure also eliminates the 3 hidden always-mounted variant <Barcode> instances (barcodeContainer.tsx:84-101): render ONE visible preview and build the 4 download variants at download time by re-rendering with different props.

**Fiks:**

UI: replace the modal flow with a two-column card (input + options left, live preview right; stacked on mobile). Debounce ~150ms, render <Barcode value={value} format={format} .../> directly under/beside the input as soon as the value validates; show a neutral placeholder barcode ('Forhandsvisning') when empty. Move the Supabase count to a fire-and-forget call on the Download click (also fixes offline/VPN generation failure architecturally). Keep 'Last ned' as a persistent button under the preview — no modal at all. Delete the modal-open state (isOpen, barcodeContainer.tsx:16) for the preview path.

### [HIGH] Size, show/hide text, and quiet-zone (margin) controls — all zero-dependency, props already supported
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/features/barcode/barcodeContainer.tsx (lines 77-100)`

Verified full JsBarcode options object (github.com/lindell/JsBarcode/wiki/Options): format (default 'auto'=CODE128), width 2, height 100, displayValue true, text, fontOptions '', font 'monospace', textAlign 'center', textPosition 'bottom', textMargin 2, fontSize 20, background '#ffffff', lineColor '#000000', margin 10 (+ marginTop/Bottom/Left/Right), flat false (EAN/UPC only), valid callback. The site currently exposes NONE of these except hardcoded background/displayValue for the hidden variants. TEC-IT exposes module width, quiet zone with units, rotation, text toggle, font; Orca Scan exposes caption and font size. A quiet-zone control matters for print: EAN-13 needs a quiet zone (JsBarcode margin default 10px is often too tight when users crop).

**Fiks:**

Add a collapsed 'Tilpass strekkoden' section under the input with exactly four controls (keeps the page simple, monochrome): (1) 'Strektykkelse' range slider 1-4 step 0.5 -> width prop, default 2; (2) 'Hoyde' range 40-160 -> height prop, default 100; (3) 'Vis tekst under koden' switch -> displayValue (kills the need for the hidden no-text variants); (4) 'Marg (lyssone)' range 0-40 -> margin prop, default 10, with helper text 'Anbefalt minst 10 for skanning pa trykk'. Skip color pickers — monochrome black/white is both the design goal and the scanning best practice (lineColor #000 on #fff).

### [HIGH] Download control: pick variants, PNG resolution, and copy-to-clipboard
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/features/barcode/barcodeUtils.tsx (lines 117-132, 137); /Users/stian/Developer/nettsider/strekkode/strekkode-client/src/features/barcode/components/barcodeInput/barcodeInput.tsx (lines 45-67)`

Download is all-or-nothing: 8 files (4 SVG + 4 PNG) or one zip, at a fixed PNG scale of 3 (convertSvgToPngBlob default, barcodeUtils.tsx:137). Most users want ONE file. Non-zip mode fires 8 sequential downloadBlob() calls — browsers (Safari especially) throttle/block multi-download bursts. Competitors let users pick one output format: Orca Scan offers PNG/JPG/SVG/PDF; TEC-IT offers GIF/JPG/PNG/SVG plus DPI.

**Fiks:**

Replace the zip checkbox with a small download panel: primary button 'Last ned PNG' + secondary 'SVG', plus a 'Kopier til utklippstavle' button using navigator.clipboard.write([new ClipboardItem({'image/png': blob})]) reusing convertSvgToPngBlob. Advanced row: PNG-opplosning select '1x / 3x (standard) / 6x (trykk, ca. 300 DPI)' mapped to the scale param, and checkboxes 'Ogsa gjennomsiktig bakgrunn' / 'Uten tekst' that add files to a zip only when >1 file is selected. This turns the current 4-variant machinery into an opt-in instead of a forced dump.

### [HIGH] ISBN support for books (ISBN-10/13 to EAN-13 conversion)
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/features/barcode/components/barcodeInput/barcodeInput.tsx`

Norwegian self-publishers searching 'strekkode bok / ISBN strekkode' need an ISBN rendered as EAN-13 (Bookland prefix 978/979). JsBarcode has no ISBN format, but ISBN-13 IS an EAN-13; ISBN-10 converts deterministically (strip hyphens, prepend 978, drop old check char, recompute mod-10). TEC-IT ships dedicated ISBN entries (e.g. barcode.tec-it.com/en/ISBN13P5) including the +5 price add-on via EAN-5 — which JsBarcode also supports (EAN5 format).

**Fiks:**

Add 'ISBN (bok)' as an entry in the format selector: accepts input with hyphens/spaces ('978-82-...'), normalizes, converts ISBN-10 to ISBN-13, validates the check digit, renders format="EAN13" with the hyphenated ISBN as the `text` prop override so the human-readable line shows the ISBN formatting. Optional second field 'Prisfelt (valgfritt, 5 siffer)' rendered as an adjacent EAN5 barcode for the full Bookland pattern.

### [HIGH] Format auto-suggestion from typed input
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/features/barcode/components/barcodeInput/barcodeInput.tsx (lines 35-43)`

With a format selector added, first-time users may still leave the default. The input shape is highly predictive: 13 digits starting 700-709 = Norwegian GS1 EAN-13; 13 digits starting 978/979 = ISBN; exactly 12 digits = UPC-A or EAN-13 missing its check digit; 8 digits = EAN-8; 14 digits = ITF-14; anything alphanumeric = CODE128. No competitor does this well — it is a cheap differentiator.

**Fiks:**

Non-blocking hint chip under the input when detection disagrees with the selected format, e.g. input '7038010013966' while CODE128 is selected shows 'Dette ser ut som en norsk EAN-13 (GS1 Norge) - bytt format?' with a one-click switch. Pure client-side regex/prefix table; never auto-switch without the click.

### [MEDIUM] Bulk generation: paste a list / CSV upload to zip
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/features/barcode/barcodeUtils.tsx (JSZip already imported at line 3)`

Inventory/lager users need 50-500 codes, not one. Orca Scan offers quantity + spreadsheet import; TEC-IT offers sequence generation (prefix, suffix, start/end, increment). All building blocks are already installed: JSZip and file-saver are dependencies, and JsBarcode can render to a detached SVG node in a loop without React.

**Fiks:**

Add a 'Flere strekkoder' tab: (1) textarea 'En verdi per linje' (cap ~500) and/or CSV file input taking the first column; (2) 'Tallserie' mode with prefiks + startnummer + antall fields; (3) same format/size options apply to all; (4) generate SVG strings + PNG blobs in a loop into JSZip, filename = the encoded value (sanitized), download as strekkoder.zip with a progress indicator. Per-row validation errors listed, invalid rows skipped with a summary '3 av 120 linjer hoppet over'.

### [MEDIUM] Print sheet / label layout (A4 and Avery presets)
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/features/barcode (new component)`

Users printing shelf/product labels currently download files and fight Word. Orca Scan upsells a Label Designer for this; TEC-IT sells label software. A simple print-CSS sheet is enough for a free tool and requires no new dependency.

**Fiks:**

Add 'Skriv ut etiketter' action: opens a print view (window.print + @media print CSS with mm units) that tiles the current barcode (or the bulk list) into a preset grid: 'A4 rutenett 3x7 (Avery L7160, 63.5x38.1 mm)', 'A4 rutenett 5x13 (Avery L7651, 38.1x21.2 mm)', 'Egendefinert (kolonner x rader)'. Each cell centers the SVG with enforced quiet zone; page margins per Avery spec. PDF export via jsPDF can come later — print CSS ships first.

### [MEDIUM] QR codes: cross-link to qr-kode.app, do not build
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/components/footer/footer.tsx; /Users/stian/Developer/nettsider/strekkode/strekkode-client/src/features/about/about.tsx`

Both competitors bundle QR generation, and QR will be the most-requested missing format. The owner already runs qr-kode.app; JsBarcode does not do QR (2D), so building it here would mean a new dependency and duplicated product.

**Fiks:**

Add a quiet card/link in the footer and in the format selector itself: an entry 'QR-kode' that is not a format but a link — 'Trenger du QR-kode? Prov var sostertjeneste qr-kode.app'. This captures the intent, costs one anchor tag, and keeps each product focused. Ask the sister site to link back for SEO reciprocity.

### [LOW] downloaded_count RPC exists but is never called — download insight is dead
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/utils/supabase/crud.ts (lines 82-97)`

updateBarcodeDownloadedCount (Supabase RPC update_downloaded_count) has zero call sites in src/ (verified by grep), so the BarcodeType.downloaded_count column (types.ts:20) never increments and the disabled Insights component would show 0 downloads. When the download flow is reworked (preview-first, count-on-download), this is the natural hook point.

**Fiks:**

Call updateBarcodeDownloadedCount(value) fire-and-forget inside handleDownload in barcodeContainer.tsx (after the blob download starts, not awaited), or delete the dead function and column if insights are being dropped in the redesign.

## SEO

**Sammendrag:** Live audit of https://strek-kode.no confirms: <title> is just "Strekkode" with no canonical tag, no JSON-LD, lang="en" on a fully Norwegian page, and only ~54 words of indexable text (one H1, zero H2s). robots.txt (3 lines) has no Sitemap directive; sitemap.xml lists only the homepage. URL probing found the likely non-indexed URLs: https://strek-kode.no/index serves a 200 byte-for-byte duplicate of the homepage with no canonical to resolve it (prime "crawled - not indexed" candidate); www and http variants 308-redirect correctly (GSC counts these as discovered-but-not-indexed variants); /api/strekkode returns HTTP 500 due to a code bug (route.ts reads context.params.strekkode on a non-dynamic route); /om, /about, /index.html all 404 — the GSC 404 is most likely /om or /about probed from the "Om oss" nav label or an old external link (only the GSC Pages report can confirm the exact URL). The OG image is the 512px app icon, public/og.png is secretly a byte-identical copy of the 192px icon (md5 match), the twitter card is a fake "app" card with twitter_app:// placeholder URLs pointing its image at stianlarsen.com, and verification meta tags render literal placeholder values (content="google"). Biggest traffic lever: the head term "strekkode" (848 impr, pos 9, 1.06% CTR) vs 40-52% CTR on "lage strekkode" queries at pos ~1.5 — a descriptive title + ~500 words of on-page Norwegian content (FAQ H2s + format table) is the path to moving it, and to rescuing "skriv ut strekkoder" (pos 28), "eankoder" (pos 42) and "hvordan lage strekkode" (pos 1.62, 0 clicks).

### [CRITICAL] Title tag is just "Strekkode" - rewrite to target strekkode + strekkodegenerator + gratis
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/app/metadata.tsx`

metadata.tsx:7 sets title: "Strekkode" (9 chars). This is the single biggest CTR/ranking lever: query "strekkode" has 848 impressions at position 9 with 1.06% CTR, while "lage strekkode" variants at pos ~1.5 convert at 40-52% CTR. A one-word title gives Google no relevance signal for "strekkodegenerator" or "gratis" and nothing for users to click. Mobile CTR (9.25%) being half of desktop (18.43%) is consistent with a weak, non-descriptive SERP snippet. The commented-out better title at metadata.tsx:3-5 shows this regressed at some point.

**Fiks:**

In metadata.tsx line 7 set exactly: title: "Strekkodegenerator – lag strekkoder gratis | Strekkode" (54 chars). Mirror it in openGraph.title (line 35) and twitter.title (line 56, currently the junk value "strek-kode-no"). Keep the brand "Strekkode" at the end so the pos-1.5 branded/task queries keep their 40-52% CTR while the front-loaded "Strekkodegenerator" attacks the head term.

### [HIGH] Page has ~54 words of text - add SEO content section below the tool
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/app/page.tsx`

The rendered page contains ~54 words, one H1 ("Lag strekkoder gratis og enkelt" in src/components/header/header.tsx:6) and zero H2s; the About section is commented out (page.tsx:10). There is no on-page text answering the queries Google already ranks the site for: "hvordan lage strekkode" is pos 1.62 with 0 clicks/8 impr (no answer text = weak snippet), "skriv ut strekkoder" is stuck at pos 28 and "eankoder" at pos 42 because those words literally do not appear on the page. Thin content is also the classic cause of a head term ("strekkode", pos 9) plateauing below competitors with explainer text.

**Fiks:**

Add a <section> below the generator in page.tsx (~400-600 words, Norwegian bokmål, plain typographic styling to match the monochrome refresh): (1) H2 "Hvordan lage strekkode – steg for steg" with a 3-step <ol> (skriv inn verdi, trykk Generer strekkode, last ned som PNG); (2) H2 "Hvilken strekkodetype trenger du?" with a small table [Type | Tegn | Brukes til] covering CODE128 (tall + bokstaver, lager/logistikk/intern merking – det denne generatoren lager), EAN-13 (13 siffer, varer som skal selges i butikk, krever GS1-nummer fra GS1 Norway), EAN-8 (små produkter), QR-kode (URL-er) – this targets "eankoder"/"ean koder" and honestly explains that butikk-EAN må kjøpes via GS1 mens CODE128 er gratis; (3) H2 "Slik skriver du ut strekkoder" (last ned PNG, skriv ut i 100 % størrelse på hvitt papir/etiketter, etikettskrivere som Zebra/Dymo, test med skanner) targeting "skriv ut strekkoder"; (4) H2 "Hva er en strekkode?" (2-3 setninger); (5) H2 "Ofte stilte spørsmål" whose visible Q&As mirror the FAQPage JSON-LD exactly (Google requires FAQ markup content to be visible on the page).

### [HIGH] lang="en" on a Norwegian page - change to lang="nb"
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/app/layout.tsx`

layout.tsx:20 renders <html lang="en"> while every string on the page is Norwegian bokmål. This contradicts Google's language detection for a site whose entire market is google.no queries, and it makes screen readers pronounce Norwegian text with English phonemes.

**Fiks:**

layout.tsx line 20: change <html lang="en"> to <html lang="nb">. Optionally also add openGraph.locale: "nb_NO" in metadata.tsx.

### [HIGH] No canonical tag + /index serves a 200 duplicate of the homepage (likely cause of "crawled - not indexed" URLs)
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/app/metadata.tsx`

Verified live: the rendered <head> has no <link rel="canonical"> (metadataBase is set at metadata.tsx:30 but alternates.canonical is missing). https://strek-kode.no/index returns HTTP 200 with the identical page (<title>Strekkode</title>) and /index/ 308-redirects to /index - a crawlable duplicate URL with no canonical to resolve it. Host variants behave correctly (https://www.strek-kode.no/ -> 308 -> non-www, http -> 308 -> https), and these redirect variants plus /index and any query-string URLs (e.g. ?utm from the reddit/portfolio backlinks, which nothing canonicalizes) are the most plausible identities of the 4 "crawled - not indexed" URLs in GSC. The 404: /om, /om-oss, /about and /index.html all return 404 - most likely Google probed /om or /about from the "Om oss" nav label (About is a modal, not a route) or followed a stale external link; confirm the exact URL in GSC > Pages > Not found (404). A single 404 on a one-page site is harmless once confirmed to be a junk URL.

**Fiks:**

In metadata.tsx add: alternates: { canonical: "/" } (resolves against metadataBase to https://strek-kode.no). Additionally add to next.config.mjs: async redirects() { return [{ source: "/index", destination: "/", permanent: true }]; }. After deploy, use GSC URL Inspection on the 4 not-indexed URLs to confirm they now report the user-declared canonical.

### [MEDIUM] /api/strekkode returns HTTP 500 - broken route handler crawlable by Google
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/app/api/strekkode/route.ts`

Verified live: GET https://strek-kode.no/api/strekkode returns 500 with an empty body. Cause is route.ts:5 - const team = context.params.strekkode; - the route is not dynamic (no [param] segment) so context.params is undefined and the property access throws. The whole file is dead scaffolding (returns a hardcoded JSON, empty HEAD/POST/PUT/DELETE/PATCH stubs); the app talks to Supabase directly via src/utils/supabase/crud, not this route. Googlebot discovering it (e.g. via JS chunks) logs server errors against the property and wastes crawl budget.

**Fiks:**

Delete src/app/api/strekkode/ entirely (nothing imports it). If it must stay, remove line 5-6 so it returns 200, and add a robots.txt line 'Disallow: /api/' to keep crawlers out.

### [MEDIUM] No JSON-LD structured data - add WebApplication + FAQPage blocks
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/app/layout.tsx`

Verified live: zero application/ld+json blocks in the rendered page. A free-tool page is the textbook WebApplication/Offer(price 0) case, and FAQ markup mirrors the exact queries GSC shows. Caveat stated honestly: since Aug 2023 Google only shows FAQ rich results for authoritative gov/health sites, so expect no FAQ rich snippet - the value is entity understanding, eligibility for app/price treatment, and being quotable in AI overviews; the visible FAQ text (see content finding) does the ranking work.

**Fiks:**

Paste into the <body> in layout.tsx (Next.js-recommended pattern):
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Strekkode",
  "alternateName": "Strekkodegenerator",
  "url": "https://strek-kode.no",
  "inLanguage": "nb",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Any",
  "isAccessibleForFree": true,
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "NOK" },
  "description": "Gratis strekkodegenerator på norsk. Lag CODE128-strekkoder og last dem ned som PNG – uten registrering.",
  "featureList": "CODE128-strekkoder, PNG-nedlasting, transparent bakgrunn, ZIP-nedlasting av flere strekkoder",
  "author": { "@type": "Person", "name": "Stian Larsen", "url": "https://stianlarsen.com" }
}) }} />
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Hvordan lager jeg en strekkode?", "acceptedAnswer": { "@type": "Answer", "text": "Skriv inn tallet eller teksten du vil kode, trykk «Generer strekkode», og last ned strekkoden som PNG. Det tar under ett minutt og krever ingen registrering." } },
    { "@type": "Question", "name": "Er det gratis å lage strekkoder?", "acceptedAnswer": { "@type": "Answer", "text": "Ja, strek-kode.no er helt gratis. Du kan lage og laste ned så mange strekkoder du vil, uten registrering og uten vannmerker." } },
    { "@type": "Question", "name": "Hva er en strekkode?", "acceptedAnswer": { "@type": "Answer", "text": "En strekkode er en maskinlesbar fremstilling av tall eller tekst, bygget opp av streker og mellomrom som en skanner kan lese. Strekkoder brukes til å identifisere varer, utstyr og dokumenter raskt og uten feiltasting." } },
    { "@type": "Question", "name": "Hvilken strekkodetype trenger jeg?", "acceptedAnswer": { "@type": "Answer", "text": "Til intern bruk som lager, utstyr og medlemskort holder CODE128, som denne generatoren lager. Skal varen selges i butikk, trenger du en EAN-13-kode med et GS1-nummer du kjøper hos GS1 Norway." } },
    { "@type": "Question", "name": "Hva er forskjellen på EAN-13 og CODE128?", "acceptedAnswer": { "@type": "Answer", "text": "EAN-13 består av 13 siffer og brukes på varer i detaljhandelen, med nummerserie fra GS1. CODE128 kan inneholde både bokstaver og tall, er mer kompakt, og brukes til logistikk og intern merking." } },
    { "@type": "Question", "name": "Hvordan skriver jeg ut strekkoder?", "acceptedAnswer": { "@type": "Answer", "text": "Last ned strekkoden som PNG og skriv den ut i 100 % størrelse på hvitt papir eller etiketter. Bruk gjerne en etikettskriver, og test alltid utskriften med en skanner før du tar den i bruk." } }
  ]
}) }} />
The same six Q&As must appear as visible text in the new FAQ section on the page.

### [MEDIUM] Meta description is generic - rewrite with features + CTA
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/app/metadata.tsx`

metadata.tsx:8-9: "Generer og lag en gratis strekkode for din bedrift eller produkt." (65 chars) - short, no CTA, no differentiators (no registrering, PNG, CODE128), wastes half the snippet. Contributes to the 1.06% CTR on "strekkode" and the weak mobile CTR.

**Fiks:**

Replace with exactly (147 chars): "Gratis strekkodegenerator: skriv inn tall eller tekst, generer strekkode (CODE128) og last ned som PNG. Ingen registrering – lag strekkoden din nå!" Mirror in openGraph.description (line 36-37) and twitter.description (line 57-58).

### [MEDIUM] OG image is the 512px app icon and public/og.png is a byte-identical copy of the 192px icon
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/app/metadata.tsx`

openGraph.images (metadata.tsx:38-51) points to /android-chrome-512x512.png and /android-chrome-192x192.png - square icons, far from the 1200x630 spec, so shares on Facebook/LinkedIn/Slack render a tiny logo. Verified: public/og.png exists but is 192x192 and md5-identical to android-chrome-192x192.png (37e103b96e9407baf9964f4b87959970) - it is NOT a usable OG image and must be recreated. twitter.images (line 62-65) points to https://stianlarsen.com/og.png on a different domain, which 307-redirects to www.stianlarsen.com.

**Fiks:**

Create a real 1200x630 public/og.png (monochrome: white background, a large crisp CODE128 barcode, text "Lag strekkoder gratis – strek-kode.no" - fits the planned black/white redesign). Then set openGraph.images to [{ url: "/og.png", width: 1200, height: 630, alt: "Strekkodegenerator – lag strekkoder gratis" }] and point twitter images at the same file. This affects social CTR (reddit/portfolio referrals), not Google ranking.

### [LOW] Fake Twitter "app" card with placeholder deep links
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/app/metadata.tsx`

metadata.tsx:54-78 declares twitter.card: "app" with name "twitter_app" and placeholder URLs (twitter_app://iphone, https://iphone_url, https://ipad_url) that render live as twitter:app:url:iphone etc. There is no app; the card type is invalid for this site and X will fail to render it, falling back to a bare link.

**Fiks:**

Replace the whole twitter block with: twitter: { card: "summary_large_image", title: <same as new title>, description: <same as new description>, creator: "@Litehode", images: ["/og.png"] }. Delete siteId/creatorId/app entirely.

### [LOW] Verification placeholders render as literal junk meta tags
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/app/metadata.tsx`

metadata.tsx:85-92 outputs <meta name="google-site-verification" content="google">, <meta name="yandex-verification" content="yandex">, <meta name="y_key" content="yahoo"> - literal placeholder values verified in the live head. GSC is clearly verified through another method (DNS or file), so these do nothing except signal template-copy sloppiness; an invalid google-site-verification token is pure noise.

**Fiks:**

Delete the entire verification object (lines 85-92). Keep nothing unless a real token is needed - if GSC is DNS-verified, none is.

### [LOW] robots.txt has no Sitemap directive; sitemap lastmod is fake build-time freshness
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/public/robots.txt`

Live robots.txt is only "User-agent: * / Allow: /" - no Sitemap: line, so crawlers must discover sitemap.xml on their own or via GSC. Also src/app/sitemap.ts:7 sets lastModified: new Date().toISOString() at build time (live value 2026-03-11T04:03:10Z), which claims the page changed on every deploy regardless of content - Google learns to ignore unreliable lastmod.

**Fiks:**

Append to public/robots.txt: "Sitemap: https://strek-kode.no/sitemap.xml" (and "Disallow: /api/" if the API route is kept). In sitemap.ts, replace new Date() with a hardcoded date bumped on real content changes, e.g. lastModified: "2026-08-27".

### [LOW] meta keywords tag is dead weight - Google ignores it
Fil: `/Users/stian/Developer/nettsider/strekkode/strekkode-client/src/app/metadata.tsx`

metadata.tsx:10-27 ships 16 keywords (with a duplicate "Strekkode generator" at lines 13 and 21) into a <meta name="keywords"> tag. Google has publicly ignored this tag since 2009; it has zero ranking effect and only exposes the target-keyword list to competitors. The actual keyword targeting must live in the title, H2s and body text (see the content finding).

**Fiks:**

Delete the keywords array (lines 10-27). No replacement needed - noted explicitly so the effort goes into visible content instead.

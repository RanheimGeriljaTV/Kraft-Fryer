# Plan: Kraft-Fryer – stekeovn til airfryer-kalkulator

En mobilvennlig kalkulator for **ranheimkraft.no** som gjør om en stekeovnsoppskrift til airfryer-innstillinger, med hurtigvalg for vanlige varer og en innebygd nedtellingsklokke.

Kalkulatoren lages i dette repoet (`RanheimGeriljaTV/Kraft-Fryer`) og hentes inn på nettsiden på samme måte som Tabell Kraft og TRD Events. Den blir tilgjengelig på **https://ranheimkraft.no/airfryer/**.

---

## 1. Mål

- Brukeren skal få riktig temperatur og tid på under 5 sekunder, med én tommel.
- Ingen «Beregn»-knapp: resultatet oppdateres i sanntid.
- Skal se ut og føles som resten av ranheimkraft.no.

## 2. Teknologi

| Valg                                      | Begrunnelse                                                                       |
| ----------------------------------------- | --------------------------------------------------------------------------------- |
| **Vite 8 + React 19 + TypeScript 6.0**    | Rask utvikling, typesikker logikk, liten bundle                                   |
| **Tailwind CSS v4** (`@tailwindcss/vite`) | Mobile-first-klasser, bygges ved deploy (ikke via CDN)                            |
| **Vitest + React Testing Library**        | Enhetstester for utregning og timer                                               |
| **GitHub Actions**                        | Tester, bygger og publiserer ferdige filer til grenen `build` og til GitHub Pages |
| Ingen backend, ingen API-nøkler           | Alt kjører i nettleseren                                                          |

`base: './'` i `vite.config.ts` (relative stier), slik at samme bygg fungerer både på `ranheimgeriljatv.github.io/Kraft-Fryer/` og på `ranheimkraft.no/airfryer/`.

## 3. Design (felles med ranheimkraft.no)

Hentet fra nettside-repoet (`index.html`, `assets/layout.js`, `assets/style.css`, `events/index.html`).

| Element      | Verdi                                                                                                                                                                 |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bakgrunn     | `#08080a` (`brand-dark`), alltid mørkt tema (`<html class="dark">`), `theme-color` `#08080a`                                                                          |
| Kort         | `bg-white/[0.02]`, `border border-white/5`–`/10`, `rounded-2xl`. Sticky resultatkort: `#0d111a` (`brand-navy`)                                                        |
| Tekst        | `text-zinc-200` brødtekst, `text-white` overskrifter, `text-zinc-400`/`500` hjelpetekst                                                                               |
| Overskrifter | **Syne** 700–900, `uppercase`, `tracking-tighter`                                                                                                                     |
| Brødtekst    | **Plus Jakarta Sans** 400–700 (Google Fonts, samme lenke som nettsiden)                                                                                               |
| Etiketter    | Syne `text-xs uppercase tracking-wider`, f.eks. `01 / Ovn` · `02 / Temperatur` · `03 / Tid` · `04 / Mengde`                                                           |
| Hovedknapp   | `rounded-full bg-white text-black font-syne font-bold uppercase tracking-wider` (som «Åpne galleriet →»)                                                              |
| Aksentfarge  | **Oransje** `orange-400` (varme), på samme måte som Quiz = amber, QR = cyan, Tabell = sky, Events = emerald. Brukes på aktive valg, slider, resultattall og timerring |
| Merkevare    | Isbjørn-maskoten (`logo-320.webp`) og favicon `polarICON.ico`, kopieres inn i `public/`                                                                               |
| Topp         | Kompakt header som på TRD Events: isbjørn, «← Ranheim Kraft» tilbake til forsiden, tittel «Kraft-Fryer»                                                               |
| Bunn         | Samme bunntekst som nettsiden: © Ranheim Kraft · Rapporter feil · GitHub                                                                                              |
| Statistikk   | Umami med `data-umami-event` på hurtigvalg og «Start nedtelling»                                                                                                      |
| Detaljer     | Safe-area-insets for iPhone, ingen horisontal skrolling, `-webkit-tap-highlight-color: transparent`, `prefers-reduced-motion` respekteres                             |

Fargene og fontene legges som tokens i `src/index.css` (Tailwind v4 `@theme`), slik at de bare står ett sted:

```css
@theme {
  --font-syne: 'Syne', sans-serif;
  --font-sans: 'Plus Jakarta Sans', sans-serif;
  --color-brand-dark: #08080a;
  --color-brand-navy: #0d111a;
  --color-brand-cyan: #00f0ff;
}
```

## 4. Brukergrensesnitt (mobile-first)

Én kolonne, maks bredde ca. 480 px sentrert på desktop. Rekkefølge fra topp til bunn:

1. **Hurtigvalg** – horisontalt sveipbar rad (`no-scrollbar`) med store chips (ikon + navn).
2. **Ovnstype** – segmentert toggle: `Over-/undervarme` (standard) | `Varmluft`.
3. **Temperatur i oppskrift** – stor verdi i Syne (f.eks. «200 °C») med `−` / `+`-knapper (steg 5 °C) og en slider under (150–250 °C).
4. **Tid i oppskrift** – stor verdi med `−` / `+` (steg 1 min), slider (5–90 min) og hurtigknapper `15` `20` `30` `45`.
5. **Mengde i kurven** – segmentert valg: `Normalt (1 lag)` | `Full kurv / Mye mat`.
6. **Resultatkort** – fast nederst på skjermen (sticky), alltid synlig:
   - Airfryer-temperatur og tid i stor skrift
   - «Rist kurven etter X min»
   - Notis ved maksgrense på 200 °C
   - Knappen **Start nedtelling**

**Touch-krav**

- Alle trykkflater minst 48 × 48 px, god avstand mellom knapper.
- Ingen tekstfelt. Slideren får tykk «thumb» (minst 28 px).
- `−` / `+` gjentar seg ved langt trykk.
- Tydelig fokusmarkering og `aria-label` på alle knapper (tilgjengelighet).

## 5. Utregningslogikk

Ren funksjon i `src/lib/convert.ts`, uten React, slik at den er enkel å teste.

```ts
type OvenType = 'conventional' | 'fan';   // over-/undervarme | varmluft
type Load = 'normal' | 'full';            // 1 lag | full kurv

convert({ ovenType, ovenTemp, ovenMinutes, load }) => {
  airTemp,        // °C, maks 200
  capped,         // true hvis temperaturen ble kuttet til 200
  airMinutes,     // hele minutter
  shakeAtSeconds, // 50 % av ny tid
}
```

| Regel                        | Verdi                                                                               |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| Temperatur, over-/undervarme | oppskrift − 20 °C                                                                   |
| Temperatur, varmluft         | oppskrift − 10 °C                                                                   |
| Maksgrense                   | 200 °C, viser notis: «De fleste airfryere går maks til 200 °C»                      |
| Tid, normalt (1 lag)         | oppskrift × 0,80                                                                    |
| Tid, full kurv               | oppskrift × 0,90                                                                    |
| Avrunding av tid             | `Math.round` til nærmeste hele minutt, minst 1 min                                  |
| Ristevarsel                  | 50 % av ny tid. Timeren bruker eksakt halvtid i sekunder; teksten viser «ca. X min» |

**Eksempler (blir testtilfeller)**

| Ovn              | Temp   | Tid    | Mengde | → Airfryer                                |
| ---------------- | ------ | ------ | ------ | ----------------------------------------- |
| Over-/undervarme | 200 °C | 30 min | Normal | 180 °C, 24 min, rist etter 12 min         |
| Varmluft         | 200 °C | 30 min | Full   | 190 °C, 27 min, rist etter ca. 14 min     |
| Over-/undervarme | 250 °C | 15 min | Normal | 200 °C (kuttet), 12 min, rist etter 6 min |
| Varmluft         | 150 °C | 5 min  | Normal | 140 °C, 4 min, rist etter 2 min           |

## 6. Hurtigvalg (presets)

Data i `src/data/presets.ts`. Et hurtigvalg viser ferdige airfryer-verdier direkte og hopper over omregningen.

| Vare                        | Temp   | Tid    | Rist/snu         |
| --------------------------- | ------ | ------ | ---------------- |
| Frosne pommes frites        | 200 °C | 16 min | Rist etter 8 min |
| Kyllingbryst                | 180 °C | 18 min | Snu etter 10 min |
| Laksefilet                  | 180 °C | 10 min | –                |
| Frossenpizza / pizzastykker | 180 °C | 8 min  | –                |
| Ovnsbakte rotgrønnsaker     | 190 °C | 15 min | Rist etter 7 min |

**Oppførsel**

- Trykk på et hurtigvalg → resultatkortet viser varen (navn, temp, tid, ev. rist/snu-tekst) og chippen markeres med oransje.
- Endrer brukeren noe i oppskriftsfeltene, går appen tilbake til omregningsmodus og markeringen fjernes.
- Varer uten ristetid får ikke halvveis-varsel i timeren.
- «Rist» og «Snu» lagres per vare, slik at teksten blir riktig.

## 7. Nedtellingsklokke

Logikk i en egen hook, `src/hooks/useCountdown.ts`.

- **Knapper:** `Start nedtelling` → `Pause` / `Fortsett` → `Nullstill`.
- **Presis tid:** lagrer sluttidspunkt (`Date.now() + varighet`) og regner gjenstående tid fra det. Da går ikke klokka feil når fanen ligger i bakgrunnen eller skjermen dimmes.
- **Visning:** stor `mm:ss` i Syne og en oransje fremdriftsring.
- **Halvveis-varsel:** lyd (to korte pip), vibrasjon (`navigator.vibrate`) og et banner: «Rist kurven nå!» / «Snu maten nå!».
- **Ferdig-varsel:** lengre lydsignal som gjentas til brukeren trykker «OK», kraftig vibrasjon og et blinkende kort (stille kort ved «redusert bevegelse»).
- **Lyd:** genereres med Web Audio API (`OscillatorNode`), så det trengs ingen lydfiler. `AudioContext` låses opp ved første trykk på «Start», fordi iOS Safari krever et brukertrykk før lyd kan spilles.
- **Hold skjermen på:** Screen Wake Lock API mens timeren går (der nettleseren støtter det).
- **Tittel i fanen:** viser gjenstående tid (`⏱ 07:32 – Kraft-Fryer`).
- Endrer brukeren innstillingene mens timeren går, spør appen om timeren skal startes på nytt med ny tid.

## 8. Mappestruktur

```
Kraft-Fryer/
├─ .github/workflows/deploy.yml   # test, bygg, publiser til build-grenen og Pages
├─ public/
│  ├─ logo-320.webp               # isbjørn (kopi fra ranheimkraft.no)
│  └─ polarICON.ico
├─ src/
│  ├─ components/
│  │  ├─ Header.tsx               # isbjørn + «← Ranheim Kraft»
│  │  ├─ Footer.tsx
│  │  ├─ PresetBar.tsx
│  │  ├─ SectionLabel.tsx         # «01 / Ovn»-etiketter
│  │  ├─ SegmentedToggle.tsx      # ovnstype + mengde
│  │  ├─ Stepper.tsx              # −/+ med slider og hurtigknapper
│  │  ├─ ResultCard.tsx
│  │  └─ Timer.tsx
│  ├─ hooks/
│  │  ├─ useCountdown.ts
│  │  ├─ useRepeatPress.ts        # −/+ gjentas ved langt trykk
│  │  └─ useWakeLock.ts
│  ├─ lib/
│  │  ├─ convert.ts               # ren utregning
│  │  ├─ convert.test.ts
│  │  └─ sound.ts                 # Web Audio-pip
│  ├─ data/presets.ts
│  ├─ index.css                   # Tailwind + @theme med merkevarefarger
│  ├─ App.tsx
│  └─ main.tsx
├─ index.html
├─ CHANGELOG.md
├─ CLAUDE.md
├─ PLAN.md
├─ README.md
└─ package.json
```

## 9. Publisering på ranheimkraft.no

Nettsiden er statisk HTML på GitHub Pages (`RanheimGeriljaTV/ranheimkraft.no`, CNAME `ranheimkraft.no`). Den henter allerede inn Tabell Kraft, TRD Events, Quiz Kraft og QR Kraft fra egne repoer med `scripts/sync_subprojects.py`. Kraft-Fryer følger samme mønster.

**Flyten**

```
Kraft-Fryer: push til main
  → Action: npm ci, lint, test, build
  → dist/ publiseres til grenen «build» (+ GitHub Pages for forhåndsvisning)
  → (valgfritt) repository_dispatch «fryer-updated» til ranheimkraft.no

ranheimkraft.no: Auto-Sync (hver 3. time, manuelt, eller ved dispatch)
  → sync_kraft_fryer(): git clone --depth 1 --branch build Kraft-Fryer
  → kopierer filene til airfryer/
  → legger inn Umami-skript og gjør lenker relative (som for TRD Events)
  → commit + push → live på ranheimkraft.no/airfryer/
```

Den ferdige `build`-grenen gjør at nettside-repoet slipper Node og byggesteg; synk-skriptet kopierer bare ferdige filer.

**Endringer i nettside-repoet** (gjøres i fase 5, i eget commit der):

| Fil                                      | Endring                                                       |
| ---------------------------------------- | ------------------------------------------------------------- |
| `scripts/sync_subprojects.py`            | Ny `sync_kraft_fryer()`, valgbar med `--project fryer`        |
| `.github/workflows/sync-subprojects.yml` | Legg til `fryer-updated` i `repository_dispatch.types`        |
| `index.html`                             | Nytt kort «05 / Kraft-Fryer» med `hover:border-orange-400/40` |
| `assets/layout.js`                       | Ny lenke i `NAV_LINKS` med `text-orange-400`                  |
| `assets/site.css`                        | Bygg på nytt med `npm run build:css` (nye oransje klasser)    |
| `sitemap.xml`                            | Legg til `https://ranheimkraft.no/airfryer/`                  |
| `README.md`, `CHANGELOG.md`              | Beskriv det nye verktøyet og ny versjon                       |

**Valgfritt: umiddelbar synk.** For at nettsiden skal oppdateres med en gang (ikke først etter opptil 3 timer), sender Kraft-Fryer en `repository_dispatch`. Det krever en fine-grained token med tilgang kun til `ranheimkraft.no` (Contents: read and write), lagret som repo-hemmelighet `SITE_DISPATCH_TOKEN` i Kraft-Fryer. Tokenet skal aldri ligge i koden.

**Lenker i appen:** «← Ranheim Kraft» peker til `https://ranheimkraft.no/`. Synk-skriptet gjør den om til `../index.html`, på samme måte som for TRD Events.

## 10. Faser og milepæler

| Fase               | Innhold                                                                                                                                 | Versjon |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| **0 – Oppsett**    | Vite + React + TS + Tailwind, ESLint/Prettier, Vitest, merkevaretokens, header og bunntekst, Action som publiserer til `build` og Pages | `0.1.0` |
| **1 – Kjerne**     | `convert.ts` med tester, inputfelter, sanntidsresultat, maksgrense-notis                                                                | `0.2.0` |
| **2 – Hurtigvalg** | Presets, aktiv-markering, overgang tilbake til omregning                                                                                | `0.3.0` |
| **3 – Timer**      | Nedtelling, halvveis- og ferdigvarsel (lyd, vibrasjon, visuelt), wake lock                                                              | `0.4.0` |
| **4 – Polering**   | Tilgjengelighet (WCAG AA), animasjoner, Umami-hendelser, testing på iOS og Android                                                      | `0.5.0` |
| **5 – Lansering**  | Endringene i nettside-repoet (avsnitt 9), første synk, sluttsjekk på ranheimkraft.no/airfryer/                                          | `1.0.0` |

Hver fase avsluttes med oppdatert `CHANGELOG.md` og `README.md`, en commit etter Conventional Commits og et GitHub-issue/milepæl.

## 11. Testplan

- **Enhetstester (Vitest):** alle eksemplene i avsnitt 5, grenseverdier (150/250 °C, 5/90 min), avrunding, maksgrense.
- **Hook-tester:** `useCountdown` med falske tidtakere (`vi.useFakeTimers`): halvveis-hendelse, ferdig-hendelse, pause/fortsett.
- **Komponenttester:** endring av input oppdaterer resultatet umiddelbart; hurtigvalg setter riktige verdier.
- **Manuelt på enhet:** iPhone Safari (lyd og wake lock), Android Chrome (vibrasjon), smal skjerm på 320 px.
- **Etter synk:** sjekk at `ranheimkraft.no/airfryer/` laster alle filer (relative stier), at tilbake-lenken virker og at Umami teller.
- **Lighthouse:** mål om 95+ på Performance og Accessibility.

## 12. Mulige utvidelser (etter 1.0)

- Huske siste valg i `localStorage`.
- PWA (installer på hjemskjermen, fungerer uten nett).
- Flere hurtigvalg og søk i varer.
- Egen maksgrense for airfryere som går over 200 °C.
- «Rapporter feil» og Vipps-støtte fra nettsidens `assets/feedback.js` og `assets/vipps.js`.
- Engelsk språkversjon.

## 13. Avklart og åpne spørsmål

**Avklart**

- Design: samme uttrykk som ranheimkraft.no (avsnitt 3).
- Nettsiden er et GitHub-repo; Kraft-Fryer synkes inn som de andre verktøyene (avsnitt 9).

**Åpent**

- **Offentlig repo:** synk-skriptet kloner uten innlogging, så Kraft-Fryer må være offentlig (som de andre verktøyrepoene). Et privat repo krever et eget token i nettsidens workflow.
- **Adresse:** `/airfryer/` er foreslått fordi folk søker på «airfryer kalkulator». Alternativet er `/fryer/`.
- **Navn i menyen:** «Kraft-Fryer», eller «Fryer Kraft» for å ligne «Quiz Kraft» og «QR Kraft»?

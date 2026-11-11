# Kraft-Fryer

**Stekeovn til airfryer-kalkulator** for [ranheimkraft.no](https://ranheimkraft.no).

Gjør om temperatur og tid fra en vanlig stekeovnsoppskrift til airfryer-innstillinger, med hurtigvalg for populære varer og en innebygd nedtellingsklokke. Laget for å kunne brukes med én tommel på mobil.

> **Status:** v1.3.0 – live på **https://ranheimkraft.no/airfryer/** (nettsiden henter nye versjoner innen 3 timer). Se [`PLAN.md`](PLAN.md) for plan og milepæler.
>
> **Forhåndsvisning:** https://ranheimgeriljatv.github.io/Kraft-Fryer/

## Funksjoner

### Omregning i sanntid (ferdig)

Resultatet oppdateres med en gang du endrer noe, uten «Beregn»-knapp. Det ligger fast nederst på skjermen.

| Input                    | Styring                                                          | Regel                                                          |
| ------------------------ | ---------------------------------------------------------------- | -------------------------------------------------------------- |
| Ovnstype                 | To store valgknapper (piltaster virker)                          | Over-/undervarme −20 °C, varmluft −10 °C                       |
| Temperatur i oppskriften | −/+ (steg 5 °C, holdes inne for å gå fort) og slider, 150–250 °C | Maks 200 °C i airfryeren. Kuttes den, økes tiden (se under)    |
| Tid i oppskriften        | −/+ (steg 1 min), slider 5–90 min og hurtigknapper 15/20/30/45   | × 0,80 for ett lag, × 0,90 for full kurv, nærmeste hele minutt |
| Mengde i kurven          | To store valgknapper                                             | Se tid                                                         |

**Over 200 °C:** de fleste airfryere går ikke høyere, så temperaturen kuttes til 200 °C, og tiden økes for å veie opp: × (ønsket − 70) / (200 − 70). For eksempel gir ønsket 230 °C ca. 23 % lengre tid. Notisen i resultatkortet viser hvor mye tiden er økt. Se [`PLAN.md`](PLAN.md), avsnitt 5.

**Ristevarsel** vises etter halve den nye tiden («ca.» når halvtiden ikke er et helt minutt).

Standardverdier: over-/undervarme, 200 °C, 20 min, ett lag → 180 °C i 16 min, rist etter 8 min.

Logikken ligger i [`src/lib/convert.ts`](src/lib/convert.ts) og er testet i [`convert.test.ts`](src/lib/convert.test.ts).

Reglene er tommelfingerregler, og vanlige kilder anbefaler omtrent det samme (−10 til −20 °C og ca. 20 % kortere tid). Se [`PLAN.md`](PLAN.md), avsnitt 5. Sjekk maten litt før tiden er ute.

### Hurtigvalg (ferdig)

Et rutenett med små bokser øverst (3 i bredden, alle synlige uten sveiping) gir ferdige airfryer-innstillinger med ett trykk, for varer uten oppskrift:

| Vare                           | Temp   | Tid       | Halvveis         |
| ------------------------------ | ------ | --------- | ---------------- |
| 🍟 Frosne pommes frites        | 200 °C | 16 min    | Rist etter 8 min |
| 🍗 Kyllingbryst                | 180 °C | 18 min    | Snu etter 10 min |
| 🐟 Laksefilet                  | 180 °C | 10 min    | –                |
| 🍕 Frossenpizza / pizzastykker | 180 °C | 8 min     | –                |
| 🥕 Ovnsbakte rotgrønnsaker     | 190 °C | 15 min    | Rist etter 7 min |
| 🥚 Kokte egg                   | 125 °C | 11–13 min | –                |

- **Egg** er testet på Philips Airfryer XL. Nedtellingen bruker 12 min (midt i intervallet). Kortere tid gir mykere plomme.
- Resultatkortet viser varens navn og en liten × for å gå tilbake til oppskriften.
- Oppskriftsfeltene dempes mens et hurtigvalg er i bruk. Endrer du noe der, eller trykker på hurtigvalget igjen, går appen tilbake til omregning. Verdiene du hadde skrevet inn, beholdes.
- Varene ligger i [`src/data/presets.ts`](src/data/presets.ts). Legg til en ny ved å legge til et objekt i listen. Har varen et tidsintervall, bruk `minutesRange` (vises som «11–13 min») og sett `minutes` til tiden nedtellingen skal bruke. Et kort tips kan legges i `note`.

### Nedtellingsklokke (ferdig)

Trykk **▶ 16:00** ved siden av tallene i resultatkortet. Klokka bruker tiden fra omregningen eller hurtigvalget. Mens den går, tar den plassen til tallene (temperatur og tid flyttes opp i toppraden), så kortet holder seg rundt 100 px høyt.

| Når             | Hva skjer                                                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Mens den går    | `m:ss` på én rad med liten oransje ring (prikk ved halvveis), «Rist om …» og deretter «Ferdig kl. …». Pause/Fortsett og Nullstill. |
| Halvveis        | To pip, vibrasjon og banneret «Rist kurven nå!» eller «Snu maten nå!» (ikke for laks og pizza).                                    |
| Ferdig          | Tre stigende pip som gjentas hvert 2,5 sekund, kraftig vibrasjon og blinkende «Maten er ferdig!» til du trykker OK.                |
| Du endrer tiden | Spørsmål om å starte på nytt med ny tid, eller beholde nedtellingen.                                                               |
| I en annen fane | Fanetittelen viser gjenstående tid (`⏱ 7:32 – …`, `✅ Ferdig! – …`).                                                               |

- Tiden regnes fra et fast sluttidspunkt, så den er riktig selv om fanen har ligget i bakgrunnen.
- Skjermen holdes på mens klokka går (Screen Wake Lock), der nettleseren støtter det.

**Begrensninger i nettleseren:**

- **iPhone:** står telefonen på lydløs, spilles ingen lyd. iPhone har heller ikke vibrasjon i nettleseren. Det visuelle varselet virker alltid.
- **Låst skjerm:** nettlesere kjører ikke JavaScript pålitelig når skjermen er låst. Varselet kommer da når du låser opp. Derfor holder appen skjermen på.

## Design

Samme uttrykk som resten av ranheimkraft.no: mørk bakgrunn (`#08080a`), Syne og Plus Jakarta Sans, isbjørn-maskoten og oransje som aksentfarge for Kraft-Fryer.

Farger og fonter er definert som tokens i [`src/index.css`](src/index.css) (`@theme`): `brand-dark`, `brand-navy`, `brand-cyan`, `accent` og `accent-strong`. Isbjørnen, faviconet og `apple-touch-icon.png` i `public/` er kopiert fra nettside-repoet.

Animasjonene er korte og rolige: resultattallene «spretter» når de endres, og varslene glir inn. Alt slås av når telefonen står på «redusert bevegelse».

## Tilgjengelighet

Målet er WCAG 2.1 AA.

- **Kontrast:** all tekst er minst 4,5:1 mot bakgrunnen, også i de dempede oppskriftsfeltene.
- **Trykkflater:** minst 48 × 48 px. Ingen tekstfelt.
- **Tastatur:** alt kan styres med Tab, Enter/Mellomrom og piltaster. Fokus vises med oransje ramme.
- **Skjermleser:** hver del har en overskrift. Nytt resultat leses opp når verdien har stått stille i 0,7 sekunder, ikke for hvert steg. Varsler leses opp straks (`role="alert"`).
- **Talestyring:** knappenavnene er de samme som teksten på knappene.
- **Automatisk sjekk:** [`src/a11y.test.tsx`](src/a11y.test.tsx) kjører axe-core på alle tilstander. Lighthouse (mobil): Ytelse 99, Tilgjengelighet 100, Beste praksis 100.

## Søkeord

Siden skal vinne disse presise søkene (se CLAUDE.md, avsnitt 2c):

1. stekeovn til airfryer omregning
2. oppskrift fra stekeovn til airfryer tid og temperatur
3. airfryer kalkulator
4. hvor lenge egg i airfryer
5. airfryer temperatur 200 grader stekeovn

Ordene brukes i `<title>`, `<meta name="description">`, `<h1>` (skjult tilleggstekst), «Spørsmål og svar» og JSON-LD i [`index.html`](index.html). Spørsmålene ligger i [`src/data/faq.ts`](src/data/faq.ts), og [`src/seo.test.ts`](src/seo.test.ts) sjekker at tittel, beskrivelse, canonical, Open Graph og JSON-LD følger reglene, og at FAQPage er lik teksten på siden.

## Statistikk

Umami-hendelser (telles når appen ligger på ranheimkraft.no): `preset_<id>`, `preset_clear`, `timer_start`, `timer_restart` og `timer_keep`.

## Teknologi

| Verktøy                  | Versjon                                     |
| ------------------------ | ------------------------------------------- |
| React                    | 19                                          |
| Vite                     | 8                                           |
| TypeScript               | 6.0 (typescript-eslint støtter ikke 7 ennå) |
| Tailwind CSS             | 4 (`@tailwindcss/vite`)                     |
| Vitest + Testing Library | 5                                           |
| ESLint + Prettier        | 10 / 3                                      |

## Kom i gang

Krever Node 22 eller nyere.

```bash
npm install
npm run dev
```

| Kommando          | Hva den gjør                                                   |
| ----------------- | -------------------------------------------------------------- |
| `npm run dev`     | Utviklingsserver med automatisk oppdatering                    |
| `npm run build`   | Typesjekk og bygg til `dist/`                                  |
| `npm run preview` | Vis det ferdige bygget lokalt                                  |
| `npm test`        | Kjør testene én gang (`npm run test:watch` for løpende)        |
| `npm run lint`    | ESLint                                                         |
| `npm run format`  | Formater alle filer med Prettier (`format:check` sjekker bare) |

## Publisering

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) kjører ved hver push og pull request:

1. **Sjekk:** formatering, lint, tester og bygg.
2. **Grenen `build`** (bare `main`): de ferdige filene fra `dist/` pushes hit. Nettsiden ([`RanheimGeriljaTV/ranheimkraft.no`](https://github.com/RanheimGeriljaTV/ranheimkraft.no)) henter dem inn med `scripts/sync_subprojects.py`, og appen blir liggende på **https://ranheimkraft.no/airfryer/**.
3. **GitHub Pages** (bare `main`): forhåndsvisning på https://ranheimgeriljatv.github.io/Kraft-Fryer/.

Bygget bruker relative stier (`base: './'` i [`vite.config.ts`](vite.config.ts)), så det virker fra hvilken som helst mappe.

**Hvor lang tid tar det før en endring er på ranheimkraft.no?** Nettsidens Auto-Sync kjører hver 3. time. Vil du ha den ut med en gang, kjør arbeidsflyten «Auto-Sync Subprosjekter» manuelt med prosjekt `fryer`:

```bash
gh workflow run sync-subprojects.yml --repo RanheimGeriljaTV/ranheimkraft.no -f project=fryer
```

Filene i `airfryer/` i nettside-repoet skal aldri redigeres der; de overskrives ved hver synk.

## Bidra

Les [`CLAUDE.md`](CLAUDE.md) for arbeidsregler: Conventional Commits, oppdatering av `CHANGELOG.md` og `README.md`, og håndtering av hemmeligheter.

## Endringslogg

Se [`CHANGELOG.md`](CHANGELOG.md).

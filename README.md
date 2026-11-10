# Kraft-Fryer

**Stekeovn til airfryer-kalkulator** for [ranheimkraft.no](https://ranheimkraft.no).

Gjør om temperatur og tid fra en vanlig stekeovnsoppskrift til airfryer-innstillinger, med hurtigvalg for populære varer og en innebygd nedtellingsklokke. Laget for å kunne brukes med én tommel på mobil.

> **Status:** v0.4.0 – omregning, hurtigvalg og nedtellingsklokke virker. Neste steg er polering (0.5.0) og lansering på ranheimkraft.no (1.0.0). Se [`PLAN.md`](PLAN.md) for plan og milepæler.
>
> **Forhåndsvisning:** https://ranheimgeriljatv.github.io/Kraft-Fryer/

## Funksjoner

### Omregning i sanntid (ferdig)

Resultatet oppdateres med en gang du endrer noe, uten «Beregn»-knapp. Det ligger fast nederst på skjermen.

| Input                    | Styring                                                          | Regel                                                          |
| ------------------------ | ---------------------------------------------------------------- | -------------------------------------------------------------- |
| Ovnstype                 | To store valgknapper (piltaster virker)                          | Over-/undervarme −20 °C, varmluft −10 °C                       |
| Temperatur i oppskriften | −/+ (steg 5 °C, holdes inne for å gå fort) og slider, 150–250 °C | Maks 200 °C i airfryeren, med notis når den kuttes             |
| Tid i oppskriften        | −/+ (steg 1 min), slider 5–90 min og hurtigknapper 15/20/30/45   | × 0,80 for ett lag, × 0,90 for full kurv, nærmeste hele minutt |
| Mengde i kurven          | To store valgknapper                                             | Se tid                                                         |

**Ristevarsel** vises etter halve den nye tiden («ca.» når halvtiden ikke er et helt minutt).

Standardverdier: over-/undervarme, 200 °C, 20 min, ett lag → 180 °C i 16 min, rist etter 8 min.

Logikken ligger i [`src/lib/convert.ts`](src/lib/convert.ts) og er testet i [`convert.test.ts`](src/lib/convert.test.ts).

### Hurtigvalg (ferdig)

En sveipbar rad øverst gir ferdige airfryer-innstillinger med ett trykk, for varer uten oppskrift:

| Vare                           | Temp   | Tid    | Halvveis         |
| ------------------------------ | ------ | ------ | ---------------- |
| 🍟 Frosne pommes frites        | 200 °C | 16 min | Rist etter 8 min |
| 🍗 Kyllingbryst                | 180 °C | 18 min | Snu etter 10 min |
| 🐟 Laksefilet                  | 180 °C | 10 min | –                |
| 🍕 Frossenpizza / pizzastykker | 180 °C | 8 min  | –                |
| 🥕 Ovnsbakte rotgrønnsaker     | 190 °C | 15 min | Rist etter 7 min |

- Resultatkortet viser varens navn og en ×-knapp for å gå tilbake til oppskriften.
- Oppskriftsfeltene dempes mens et hurtigvalg er i bruk. Endrer du noe der, eller trykker på hurtigvalget igjen, går appen tilbake til omregning. Verdiene du hadde skrevet inn, beholdes.
- Varene ligger i [`src/data/presets.ts`](src/data/presets.ts). Legg til en ny ved å legge til et objekt i listen.

### Nedtellingsklokke (ferdig)

Trykk **Start nedtelling** i resultatkortet. Klokka bruker tiden fra omregningen eller hurtigvalget.

| Når             | Hva skjer                                                                                                              |
| --------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Mens den går    | Stor `m:ss`, oransje ring med prikk ved halvveis, «Rist om …» og deretter «Ferdig kl. …». Pause/Fortsett og Nullstill. |
| Halvveis        | To pip, vibrasjon og banneret «Rist kurven nå!» eller «Snu maten nå!» (ikke for laks og pizza).                        |
| Ferdig          | Tre stigende pip som gjentas hvert 2,5 sekund, kraftig vibrasjon og blinkende «Maten er ferdig!» til du trykker OK.    |
| Du endrer tiden | Spørsmål om å starte på nytt med ny tid, eller beholde nedtellingen.                                                   |
| I en annen fane | Fanetittelen viser gjenstående tid (`⏱ 7:32 – …`, `✅ Ferdig! – …`).                                                   |

- Tiden regnes fra et fast sluttidspunkt, så den er riktig selv om fanen har ligget i bakgrunnen.
- Skjermen holdes på mens klokka går (Screen Wake Lock), der nettleseren støtter det.

**Begrensninger i nettleseren:**

- **iPhone:** står telefonen på lydløs, spilles ingen lyd. iPhone har heller ikke vibrasjon i nettleseren. Det visuelle varselet virker alltid.
- **Låst skjerm:** nettlesere kjører ikke JavaScript pålitelig når skjermen er låst. Varselet kommer da når du låser opp. Derfor holder appen skjermen på.

## Design

Samme uttrykk som resten av ranheimkraft.no: mørk bakgrunn (`#08080a`), Syne og Plus Jakarta Sans, isbjørn-maskoten og oransje som aksentfarge for Kraft-Fryer.

Farger og fonter er definert som tokens i [`src/index.css`](src/index.css) (`@theme`): `brand-dark`, `brand-navy`, `brand-cyan`, `accent` og `accent-strong`. Isbjørnen og faviconet i `public/` er kopiert fra nettside-repoet.

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

## Bidra

Les [`CLAUDE.md`](CLAUDE.md) for arbeidsregler: Conventional Commits, oppdatering av `CHANGELOG.md` og `README.md`, og håndtering av hemmeligheter.

## Endringslogg

Se [`CHANGELOG.md`](CHANGELOG.md).

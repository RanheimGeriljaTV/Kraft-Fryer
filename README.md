# Kraft-Fryer

**Stekeovn til airfryer-kalkulator** for [ranheimkraft.no](https://ranheimkraft.no).

Gjør om temperatur og tid fra en vanlig stekeovnsoppskrift til airfryer-innstillinger, med hurtigvalg for populære varer og en innebygd nedtellingsklokke. Laget for å kunne brukes med én tommel på mobil.

> **Status:** v0.1.0 – grunnoppsett med design, header og bunntekst. Selve kalkulatoren kommer i 0.2.0. Se [`PLAN.md`](PLAN.md) for plan og milepæler.
>
> **Forhåndsvisning:** https://ranheimgeriljatv.github.io/Kraft-Fryer/

## Funksjoner (planlagt)

- **Omregning i sanntid**, uten «Beregn»-knapp
  - Ovnstype: over-/undervarme (−20 °C) eller varmluft (−10 °C)
  - Temperatur 150–250 °C, maks 200 °C i airfryer (med notis)
  - Tid 5–90 min: × 0,80 for ett lag, × 0,90 for full kurv
  - Ristevarsel etter halve tiden
- **Hurtigvalg:** pommes frites, kyllingbryst, laksefilet, frossenpizza og rotgrønnsaker
- **Nedtellingsklokke** med lyd, vibrasjon og visuelt varsel halvveis og når maten er ferdig

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

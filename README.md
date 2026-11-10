# Kraft-Fryer

**Stekeovn til airfryer-kalkulator** for [ranheimkraft.no](https://ranheimkraft.no).

Gjør om temperatur og tid fra en vanlig stekeovnsoppskrift til airfryer-innstillinger, med hurtigvalg for populære varer og en innebygd nedtellingsklokke. Laget for å kunne brukes med én tommel på mobil.

> **Status:** planlegging. Ingen kode ennå. Se [`PLAN.md`](PLAN.md) for plan og milepæler.

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

## Teknologi og publisering

Vite, React, TypeScript, Tailwind CSS og Vitest.

GitHub Actions bygger appen og legger de ferdige filene i grenen `build`. Nettsiden ([`RanheimGeriljaTV/ranheimkraft.no`](https://github.com/RanheimGeriljaTV/ranheimkraft.no)) henter dem inn med `scripts/sync_subprojects.py`, og appen blir liggende på **https://ranheimkraft.no/airfryer/**.

## Kom i gang

Kommer i versjon 0.1.0.

## Bidra

Les [`CLAUDE.md`](CLAUDE.md) for arbeidsregler: Conventional Commits, oppdatering av `CHANGELOG.md` og `README.md`, og håndtering av hemmeligheter.

## Endringslogg

Se [`CHANGELOG.md`](CHANGELOG.md).

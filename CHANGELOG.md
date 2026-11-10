# Endringslogg

Alle viktige endringer i dette prosjektet dokumenteres i denne filen.

Formatet er basert på [Keep a Changelog](https://keepachangelog.com/no/1.0.0/),
og prosjektet følger [Semantic Versioning](https://semver.org/lang/no/).

## [Unreleased]

## [0.2.0] - 2026-11-10

### Lagt til

- Omregning i sanntid (`src/lib/convert.ts`): −20 °C ved over-/undervarme, −10 °C ved varmluft, maks 200 °C, tid × 0,80 (ett lag) eller × 0,90 (full kurv), og ristevarsel etter halve tiden.
- Inputfelter for ovnstype, temperatur (150–250 °C), tid (5–90 min med hurtigknapper 15/20/30/45) og mengde.
- −/+-knapper som gjentar seg når de holdes inne, og sliders med stor «thumb» i oransje.
- Resultatkort festet nederst på skjermen, med notis når temperaturen kuttes til 200 °C.
- Tastaturstyring: piltaster i valgknappene, Enter/Mellomrom på −/+.
- 27 nye tester for utregning og skjermbilde (30 totalt).

### Endret

- GitHub Actions oppgradert til nyeste versjoner (`checkout@v7`, `setup-node@v7`, `upload-pages-artifact@v5`, `download-artifact@v8`, `deploy-pages@v5`), som ikke lenger bruker Node 20.

## [0.1.0] - 2026-11-10

### Lagt til

- Prosjektoppsett med Vite 8, React 19, TypeScript 6.0 og Tailwind CSS 4.
- Merkevaretokens fra ranheimkraft.no i `src/index.css`: farger, Syne og Plus Jakarta Sans, og oransje aksentfarge.
- Header med «← Ranheim Kraft», isbjørn (sover ved hover) og tittel, og bunntekst med versjon, «Rapporter feil» og GitHub-lenke.
- Midlertidig startside som viser at kalkulatoren er under bygging.
- ESLint, Prettier og Vitest med Testing Library, med de første testene for header og bunntekst.
- GitHub Action som sjekker formatering, lint, tester og bygg, og som publiserer til grenen `build` og til GitHub Pages.
- `.claude/launch.json` for forhåndsvisning av bygget, og `.gitattributes` for like linjeskift.

### Endret

- `PLAN.md` oppdatert til React 19 og TypeScript 6.0.

## [0.0.1] - 2026-11-10

### Lagt til

- `PLAN.md` med plan for kalkulatoren: UI, utregningslogikk, hurtigvalg, nedtellingsklokke, mappestruktur og milepæler.
- Design i `PLAN.md` basert på ranheimkraft.no: mørkt tema, Syne og Plus Jakarta Sans, isbjørn-maskoten og oransje aksentfarge.
- Plan for publisering på `ranheimkraft.no/airfryer/` via `build`-grenen og nettsidens `sync_subprojects.py`.
- `CLAUDE.md` med arbeidsregler for dokumentasjon, versjonering, hemmeligheter og GitHub-arbeidsflyt.
- `README.md`, `CHANGELOG.md` og `.gitignore`.

[Unreleased]: https://github.com/RanheimGeriljaTV/Kraft-Fryer/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/RanheimGeriljaTV/Kraft-Fryer/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/RanheimGeriljaTV/Kraft-Fryer/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/RanheimGeriljaTV/Kraft-Fryer/releases/tag/v0.0.1

# Endringslogg

Alle viktige endringer i dette prosjektet dokumenteres i denne filen.

Formatet er basert på [Keep a Changelog](https://keepachangelog.com/no/1.0.0/),
og prosjektet følger [Semantic Versioning](https://semver.org/lang/no/).

## [Unreleased]

## [1.2.0] - 2026-11-11

### Endret

- **Lengre tid når temperaturen kuttes til 200 °C.** Før ble bare temperaturen kuttet, og tiden var den samme, så maten kunne bli for lite stekt ved oppskrifter over 220 °C. Nå ganges tiden med (ønsket − 70) / (200 − 70): for eksempel +23 % ved ønsket 230 °C og +31 % ved 240 °C. Notisen sier hvor mye tiden er økt.
- **Hurtigvalgene er et rutenett med små bokser** (3 i bredden) i stedet for en sveipbar rad med brede knapper. Alle seks synes med en gang, og nye varer gir bare en ny rad.
- Nedtellingen spør om omstart også når tiden endres fordi temperaturen kuttes.

### Lagt til

- `capTimeFactor()`, `wantedTemp` og `timeBoostPercent` i `src/lib/convert.ts`, med 5 nye tester (87 totalt).
- `PLAN.md` forklarer modellen for tidsøkningen, med tabell.

## [1.1.0] - 2026-11-11

### Lagt til

- Hurtigvalget **🥚 Kokte egg**: 125 °C i 11–13 min, testet på Philips Airfryer XL. Nedtellingen bruker 12 min, og et tips i kortet sier at kortere tid gir mykere plomme.
- Hurtigvalg kan ha et tidsintervall (`minutesRange`, vises som «11–13 min») og et kort tips (`note`).
- `PLAN.md` forklarer hvor omregningsreglene kommer fra, med kilder.
- 7 nye tester for egg og kompakt nedtelling (82 totalt).

### Endret

- **Mye lavere resultatkort:** fra 162 til 97 px på en vanlig mobil.
  - Startknappen er en liten «▶ 16:00» på samme rad som tallene, i stedet for en egen rad i full bredde.
  - Mens klokka går, tar nedtellingen plassen til tallene, og temperatur og tid flyttes opp i toppraden. Kortet vokser ikke lenger når du starter.
  - ×-knappen for å fjerne et hurtigvalg står ved varenavnet (fortsatt 48 × 48 px trykkflate).
  - Mindre fremdriftsring (44 px) og spørsmålet om omstart på én linje.
  - Notisen om 200 °C-grensen er kortet ned til én linje.
- Timer-logikken er flyttet til `src/hooks/useAirfryerTimer.ts`, og `src/components/Timer.tsx` inneholder nå bare små visningsdeler.

## [1.0.0] - 2026-11-10

### Lagt til

- Lansert på **https://ranheimkraft.no/airfryer/**, med kort på forsiden og lenke i menyen (nettsiden v2.10.0).
- Nettsidens `sync_subprojects.py` henter `build`-grenen inn i `airfryer/` og legger til Umami.
- README forklarer hvor lang tid det tar før en endring er på nettsiden, og hvordan synken kjøres manuelt.

### Endret

- `PLAN.md`: avklarte spørsmål er flyttet til «Avklart», og det som gjenstår er listet under «Åpent».

## [0.5.0] - 2026-11-10

### Lagt til

- Automatiske tilgjengelighetstester med axe-core (WCAG 2.1 A/AA) for startside, hurtigvalg, maksgrense, halvveis- og ferdig-varsel (`src/a11y.test.tsx`).
- Meta-tagger for søk og deling: utvidet beskrivelse, `canonical` til `ranheimkraft.no/airfryer/`, Open Graph, Twitter og `apple-touch-icon`.
- Melding når JavaScript er slått av (`<noscript>`).
- Animasjoner: resultattallene «spretter» ved endring, og varslene glir inn. Av ved «redusert bevegelse».
- Umami-hendelser `preset_clear`, `timer_restart` og `timer_keep`.
- 7 nye tester (75 totalt).

### Endret

- Etikettene «01 / Ovn» osv. er nå `h2`-overskrifter, så skjermlesere kan hoppe mellom delene. Nummeret leses ikke opp.
- Skjermlesere får nytt resultat først når verdien har stått stille i 0,7 sekunder, ikke for hvert steg på slideren.
- Spørsmålet om omstart av timeren har `role="status"` og leses opp.
- Hurtigvalgene heter det samme for skjermlesere og talestyring som det som står på knappen (WCAG 2.5.3).
- Ingen «kopier/del»-meny på iPhone når −/+ holdes inne.

### Rettet

- Liten grå hjelpetekst hadde for lav kontrast (3,9–4,1:1). Den er nå 7,4:1 eller mer.
- De dempede oppskriftsfeltene hadde for lav kontrast (3,4:1). De er nå dempet med farge og 80 % synlighet (5,2:1).
- Skjermlesere leste «Pommes frites200 °C», «Over-/undervarme−20 °C» og «Start nedtelling16:00» uten mellomrom.

## [0.4.0] - 2026-11-10

### Lagt til

- Nedtellingsklokke i resultatkortet med «Start nedtelling», Pause/Fortsett og Nullstill.
- Oransje fremdriftsring med prikk ved halvveis, «Rist om …» og «Ferdig kl. …».
- Halvveis-varsel med to pip, vibrasjon og banneret «Rist kurven nå!» / «Snu maten nå!».
- Ferdig-varsel med gjentatt lyd, kraftig vibrasjon og blinkende kort til brukeren trykker OK.
- Lyd laget med Web Audio API (`src/lib/sound.ts`), låst opp ved trykk på Start for iOS.
- Skjermen holdes på mens klokka går (`src/hooks/useWakeLock.ts`).
- Gjenstående tid i fanetittelen.
- Spørsmål om omstart når tiden eller ristetiden endres mens klokka går.
- `useCountdown` regner fra sluttidspunktet, så klokka er riktig etter tid i bakgrunnen.
- Umami-hendelse `timer_start`.
- 19 nye tester (68 totalt).

## [0.3.0] - 2026-11-10

### Lagt til

- Hurtigvalg øverst for frosne pommes frites, kyllingbryst, laksefilet, frossenpizza og ovnsbakte rotgrønnsaker, med ferdige temperaturer og tider (`src/data/presets.ts`).
- Resultatkortet viser varens navn, «Rist» eller «Snu» etter riktig tid, «Trenger ikke ristes» for laks og pizza, og en ×-knapp for å gå tilbake til oppskriften.
- Felles format for resultatet (`src/lib/settings.ts`), som timeren i 0.4.0 skal bruke.
- Umami-hendelser (`preset_<id>`) på hurtigvalgene.
- 19 nye tester (49 totalt).

### Endret

- Oppskriftsfeltene dempes mens et hurtigvalg er i bruk, og enhver endring der går tilbake til omregning.
- Teksten over oppskriftsfeltene begynner nå med «Eller …», siden hurtigvalgene står først.

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

[Unreleased]: https://github.com/RanheimGeriljaTV/Kraft-Fryer/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/RanheimGeriljaTV/Kraft-Fryer/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/RanheimGeriljaTV/Kraft-Fryer/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/RanheimGeriljaTV/Kraft-Fryer/compare/v0.5.0...v1.0.0
[0.5.0]: https://github.com/RanheimGeriljaTV/Kraft-Fryer/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/RanheimGeriljaTV/Kraft-Fryer/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/RanheimGeriljaTV/Kraft-Fryer/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/RanheimGeriljaTV/Kraft-Fryer/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/RanheimGeriljaTV/Kraft-Fryer/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/RanheimGeriljaTV/Kraft-Fryer/releases/tag/v0.0.1

# Arbeidsregler for Kraft-Fryer

Disse reglene gjelder for alt arbeid i dette repoet, både for mennesker og AI-assistenter.

Se `PLAN.md` for funksjonell plan, arkitektur og milepæler.

## 1. Dokumentasjon og versjonering (obligatorisk)

- **Oppdater alltid `CHANGELOG.md`:**
  - Hver gang det gjøres endringer, feilrettinger eller legges til nye funksjoner, skal `CHANGELOG.md` oppdateres med en ny eller oppdatert versjonsseksjon.
  - Formatet følger [Keep a Changelog](https://keepachangelog.com/no/1.0.0/).
  - Versjonsnummer følger [Semantic Versioning](https://semver.org/lang/no/) (`MAJOR.MINOR.PATCH`).
  - Uferdige endringer samles under `## [Unreleased]` til de slippes som en versjon.
  - Versjonen i `package.json` skal alltid stemme med siste versjon i `CHANGELOG.md`.
- **Oppdater alltid `README.md`:**
  - Hvis en endring påvirker funksjonalitet, oppsett, styring, design eller API-er som er beskrevet i `README.md`, skal `README.md` oppdateres i samme endring, slik at dokumentasjonen alltid er 100 % oppdatert.

## 2. Kode

- React + TypeScript + Tailwind CSS, mobile-first.
- Utregningslogikk ligger i rene funksjoner i `src/lib/` og skal ha enhetstester.
- Alle trykkflater er minst 48 × 48 px. Ingen tekstfelt i kalkulatoren.
- Kjør `npm run lint` og `npm test` før commit.
- Design følger ranheimkraft.no (se `PLAN.md`, avsnitt 3). Farger og fonter ligger som tokens i `src/index.css`; ikke hardkod nye farger i komponentene.
- Bruk relative stier (`base: './'`), slik at bygget virker både på GitHub Pages og under `ranheimkraft.no/airfryer/`.

## 2b. Nettsiden

- Nettsiden ligger i et eget repo: `RanheimGeriljaTV/ranheimkraft.no`. Lokalt: `..\ranheimkraft.no`.
- Endringer der (synk-skript, kort på forsiden, meny) gjøres i det repoet, med egne commits og egen `CHANGELOG.md`.

## 3. Hemmeligheter

- Ingen hemmeligheter (API-nøkler, tokens, passord) skal noen gang committes.
- Lokale miljøvariabler ligger i `.env` / `.env.local`, som er ignorert i `.gitignore`.
- Trengs en variabel, dokumenteres den med en dummy-verdi i `.env.example`.

## 4. GitHub og GitHub CLI (`gh`)

- **Repository:** `RanheimGeriljaTV/Kraft-Fryer`
- **Autentisering:** `gh` er globalt autentisert som **`RanheimGeriljaTV`**.
- **Ikke-interaktive kommandoer:** alle `gh`-kommandoer kjøres ikke-interaktivt med parametere:

  ```powershell
  # Eksempel: opprette issue
  gh issue create --title "feat: Ny minnemodul" --body "Beskrivelse av funksjonen."
  ```

- **Git-oppdateringer:**
  - Bruk [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `chore:` (og `test:` for tester).
  - Kontroller alltid med `git status` før commit, og sjekk at ingen hemmeligheter eller byggfiler er med.

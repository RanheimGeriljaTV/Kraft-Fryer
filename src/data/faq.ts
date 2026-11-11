/**
 * Spørsmål og svar under kalkulatoren (SEO, se CLAUDE.md 2c).
 * Teksten MÅ være lik FAQPage i index.html; src/seo.test.ts sjekker det.
 */
export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ: readonly FaqItem[] = [
  {
    question: 'Hvordan regner jeg om fra stekeovn til airfryer?',
    answer:
      'Senk temperaturen med 20 °C for over-/undervarme eller 10 °C for varmluft, og korte tiden med 20 % (10 % ved full kurv). Kalkulatoren gjør dette for deg mens du justerer.',
  },
  {
    question: 'Hvilken temperatur skal jeg bruke i airfryeren når oppskriften sier 200 grader?',
    answer:
      'Med over-/undervarme blir det 180 °C, og med varmluft 190 °C. Tiden blir ca. 20 % kortere. Sjekk maten litt før tiden er ute.',
  },
  {
    question: 'Hva gjør jeg når oppskriften krever mer enn 220 grader?',
    answer:
      'De fleste airfryere går bare til 200 °C. Kalkulatoren kutter da temperaturen til 200 °C og øker tiden for å veie opp, for eksempel ca. 23 % mer tid når oppskriften egentlig tilsier 230 °C.',
  },
  {
    question: 'Hvor lenge skal egg være i airfryeren?',
    answer:
      'Kokte egg tar 11–13 minutter på 125 °C, testet på Philips Airfryer XL. Kortere tid gir mykere plomme.',
  },
  {
    question: 'Når skal jeg riste kurven eller snu maten?',
    answer:
      'Halvveis i tiden. Nedtellingsklokken varsler med lyd og vibrasjon når det er tid, og igjen når maten er ferdig.',
  },
];

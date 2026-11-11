/**
 * Omregning fra stekeovnsoppskrift til airfryer.
 * Rene funksjoner uten React, slik at reglene er enkle å teste.
 */

export type OvenType = 'conventional' | 'fan'; // over-/undervarme | varmluft
export type Load = 'normal' | 'full'; // 1 lag | full kurv

export interface ConvertInput {
  ovenType: OvenType;
  ovenTemp: number; // °C
  ovenMinutes: number;
  load: Load;
}

export interface ConvertResult {
  airTemp: number; // °C, maks AIRFRYER_MAX_TEMP
  capped: boolean; // true hvis temperaturen ble kuttet til maksgrensen
  /** Ønsket temperatur før kuttet (lik airTemp når den ikke er kuttet). */
  wantedTemp: number;
  /** Hvor mange prosent tiden er økt for å veie opp for kuttet (0 uten kutt). */
  timeBoostPercent: number;
  airMinutes: number; // hele minutter, minst 1
  shakeAtSeconds: number; // 50 % av ny tid, i sekunder
}

/** Grenser og steg for inputfeltene. */
export const OVEN_TEMP = { min: 150, max: 250, step: 5, default: 200 } as const;
export const OVEN_MINUTES = { min: 5, max: 90, step: 1, default: 20 } as const;
export const QUICK_MINUTES = [15, 20, 30, 45] as const;

/** De fleste airfryere går ikke høyere enn dette. */
export const AIRFRYER_MAX_TEMP = 200;

export const TEMP_REDUCTION: Record<OvenType, number> = {
  conventional: 20,
  fan: 10,
};

export const TIME_FACTOR: Record<Load, number> = {
  normal: 0.8,
  full: 0.9,
};

/**
 * Omtrent temperaturen maten skal opp i (kjerne/overflate). Brukes til å regne ut
 * hvor mye lengre tid det tar når lufta er kaldere enn oppskriften ville hatt.
 */
export const FOOD_TARGET_TEMP = 70;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * Tidsfaktor når temperaturen kuttes. Varme overføres omtrent i takt med forskjellen
 * mellom lufta og maten, så tiden økes med forholdet mellom de to forskjellene:
 * (ønsket − 70) / (200 − 70). Eksempel: ønsket 230 °C → 160 / 130 = ×1,23.
 * Gir ×1 når det ikke er kuttet, så kurven er sammenhengende ved grensen.
 */
export function capTimeFactor(wantedTemp: number, airTemp: number): number {
  if (wantedTemp <= airTemp) return 1;
  return (wantedTemp - FOOD_TARGET_TEMP) / (airTemp - FOOD_TARGET_TEMP);
}

export function convert({ ovenType, ovenTemp, ovenMinutes, load }: ConvertInput): ConvertResult {
  const wantedTemp = ovenTemp - TEMP_REDUCTION[ovenType];
  const capped = wantedTemp > AIRFRYER_MAX_TEMP;
  const airTemp = capped ? AIRFRYER_MAX_TEMP : wantedTemp;
  const boost = capTimeFactor(wantedTemp, airTemp);

  // Avrunder til to desimaler først, så flyttallsfeil (f.eks. 15 × 0,9 = 13,499…)
  // ikke gir feil avrunding til nærmeste minutt.
  const exactMinutes = Math.round(ovenMinutes * TIME_FACTOR[load] * boost * 100) / 100;
  const airMinutes = Math.max(1, Math.round(exactMinutes));
  const shakeAtSeconds = (airMinutes * 60) / 2;

  return {
    airTemp,
    capped,
    wantedTemp,
    timeBoostPercent: Math.round((boost - 1) * 100),
    airMinutes,
    shakeAtSeconds,
  };
}

/** «Rist etter ca. X min» – halvtid avrundet til nærmeste minutt, minst 1. */
export function shakeMinutesLabel(shakeAtSeconds: number): { minutes: number; approx: boolean } {
  const exact = shakeAtSeconds / 60;
  return { minutes: Math.max(1, Math.round(exact)), approx: !Number.isInteger(exact) };
}

/** Hurtigvalg: ferdige airfryer-innstillinger for populære varer uten oppskrift. */

export type MidwayAction = 'shake' | 'flip'; // rist kurven | snu maten

export interface Preset {
  id: string;
  /** Kort navn på knappen. */
  label: string;
  /** Fullt navn i resultatkortet. */
  name: string;
  emoji: string;
  temp: number; // °C
  /** Tiden nedtellingen bruker. Ved et tidsintervall: midt i intervallet. */
  minutes: number;
  /** Tidsintervall når tiden varierer, f.eks. egg: [11, 13]. */
  minutesRange?: readonly [number, number];
  /** Når maten skal ristes eller snus. Mangler for varer som ikke trenger det. */
  midway?: { action: MidwayAction; atMinutes: number };
  /** Kort tips som vises i resultatkortet. */
  note?: string;
}

export const PRESETS: readonly Preset[] = [
  {
    id: 'pommes',
    label: 'Pommes frites',
    name: 'Frosne pommes frites',
    emoji: '🍟',
    temp: 200,
    minutes: 16,
    midway: { action: 'shake', atMinutes: 8 },
  },
  {
    id: 'kylling',
    label: 'Kyllingbryst',
    name: 'Kyllingbryst',
    emoji: '🍗',
    temp: 180,
    minutes: 18,
    midway: { action: 'flip', atMinutes: 10 },
  },
  {
    id: 'laks',
    label: 'Laksefilet',
    name: 'Laksefilet',
    emoji: '🐟',
    temp: 180,
    minutes: 10,
  },
  {
    id: 'pizza',
    label: 'Pizza',
    name: 'Frossenpizza / pizzastykker',
    emoji: '🍕',
    temp: 180,
    minutes: 8,
  },
  {
    id: 'rotgronnsaker',
    label: 'Rotgrønnsaker',
    name: 'Ovnsbakte rotgrønnsaker',
    emoji: '🥕',
    temp: 190,
    minutes: 15,
    midway: { action: 'shake', atMinutes: 7 },
  },
  {
    // Testet på Philips Airfryer XL (brukerens egne forsøk, november 2026).
    id: 'egg',
    label: 'Egg',
    name: 'Kokte egg',
    emoji: '🥚',
    temp: 125,
    minutes: 12,
    minutesRange: [11, 13],
    note: 'Philips XL: 11–13 min. Kortere tid gir mykere plomme.',
  },
];

/** «16» eller «11–13» – tiden slik den vises på knapper og i kortet. */
export const formatPresetMinutes = (preset: Pick<Preset, 'minutes' | 'minutesRange'>) =>
  preset.minutesRange ? `${preset.minutesRange[0]}–${preset.minutesRange[1]}` : `${preset.minutes}`;

export const findPreset = (id: string | null) => PRESETS.find((preset) => preset.id === id);

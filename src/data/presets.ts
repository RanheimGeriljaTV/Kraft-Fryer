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
  minutes: number;
  /** Når maten skal ristes eller snus. Mangler for varer som ikke trenger det. */
  midway?: { action: MidwayAction; atMinutes: number };
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
];

export const findPreset = (id: string | null) => PRESETS.find((preset) => preset.id === id);

/**
 * Felles format for det resultatkortet (og senere timeren) viser,
 * uansett om verdiene kommer fra omregning eller fra et hurtigvalg.
 */
import type { MidwayAction, Preset } from '../data/presets';
import type { ConvertResult } from './convert';

export interface AirfryerSettings {
  temp: number; // °C
  minutes: number;
  /** true når temperaturen ble kuttet til airfryerens maksgrense. */
  capped: boolean;
  /** Halvveis-varsel. null betyr at maten ikke trenger å ristes eller snus. */
  midway: { action: MidwayAction; atSeconds: number } | null;
  /** Satt når verdiene kommer fra et hurtigvalg. */
  preset?: Pick<Preset, 'id' | 'name' | 'emoji'>;
}

export function fromConvert(result: ConvertResult): AirfryerSettings {
  return {
    temp: result.airTemp,
    minutes: result.airMinutes,
    capped: result.capped,
    midway: { action: 'shake', atSeconds: result.shakeAtSeconds },
  };
}

export function fromPreset(preset: Preset): AirfryerSettings {
  return {
    temp: preset.temp,
    minutes: preset.minutes,
    capped: false,
    midway: preset.midway
      ? { action: preset.midway.action, atSeconds: preset.midway.atMinutes * 60 }
      : null,
    preset: { id: preset.id, name: preset.name, emoji: preset.emoji },
  };
}

export const MIDWAY_VERB: Record<MidwayAction, string> = {
  shake: 'Rist',
  flip: 'Snu',
};

export const MIDWAY_ICON: Record<MidwayAction, string> = {
  shake: '🔄',
  flip: '↕️',
};

import { PRESETS, findPreset, formatPresetMinutes } from './presets';
import { fromPreset } from '../lib/settings';

describe('hurtigvalg', () => {
  // Verdiene fra kravspesifikasjonen i PLAN.md, avsnitt 6.
  it.each([
    ['pommes', 'Frosne pommes frites', 200, 16, { action: 'shake', atMinutes: 8 }],
    ['kylling', 'Kyllingbryst', 180, 18, { action: 'flip', atMinutes: 10 }],
    ['laks', 'Laksefilet', 180, 10, undefined],
    ['pizza', 'Frossenpizza / pizzastykker', 180, 8, undefined],
    ['rotgronnsaker', 'Ovnsbakte rotgrønnsaker', 190, 15, { action: 'shake', atMinutes: 7 }],
  ] as const)('%s: %s %i °C i %i min', (id, name, temp, minutes, midway) => {
    const preset = findPreset(id);
    expect(preset).toMatchObject({ name, temp, minutes });
    expect(preset?.midway).toEqual(midway);
  });

  it('egg: 125 °C i 11–13 min (testet på Philips Airfryer XL), nedtelling midt i', () => {
    const egg = findPreset('egg');
    expect(egg).toMatchObject({
      name: 'Kokte egg',
      temp: 125,
      minutes: 12,
      minutesRange: [11, 13],
    });
    expect(egg?.midway).toBeUndefined();
    expect(egg?.note).toMatch(/Philips XL/);
    expect(formatPresetMinutes(egg!)).toBe('11–13');
    expect(formatPresetMinutes(findPreset('pommes')!)).toBe('16');
  });

  it('har nedtellingstid innenfor tidsintervallet', () => {
    for (const preset of PRESETS) {
      if (!preset.minutesRange) continue;
      const [min, max] = preset.minutesRange;
      expect(preset.minutes).toBeGreaterThanOrEqual(min);
      expect(preset.minutes).toBeLessThanOrEqual(max);
    }
  });

  it('har unike id-er', () => {
    expect(new Set(PRESETS.map((p) => p.id)).size).toBe(PRESETS.length);
  });

  it('holder seg innenfor airfryerens maksgrense, og ristetid kommer før ferdig', () => {
    for (const preset of PRESETS) {
      expect(preset.temp).toBeLessThanOrEqual(200);
      if (preset.midway) expect(preset.midway.atMinutes).toBeLessThan(preset.minutes);
    }
  });

  it('gjør om til felles format med ristetid i sekunder', () => {
    expect(fromPreset(findPreset('kylling')!)).toEqual({
      temp: 180,
      minutes: 18,
      capped: false,
      midway: { action: 'flip', atSeconds: 600 },
      preset: { id: 'kylling', name: 'Kyllingbryst', emoji: '🍗' },
    });
  });

  it('gir ingen halvveis-varsel for varer uten ristetid', () => {
    expect(fromPreset(findPreset('laks')!).midway).toBeNull();
  });

  it('finner ingenting for ukjent eller manglende id', () => {
    expect(findPreset(null)).toBeUndefined();
    expect(findPreset('finnes-ikke')).toBeUndefined();
  });
});

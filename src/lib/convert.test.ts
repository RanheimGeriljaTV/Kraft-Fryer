import { AIRFRYER_MAX_TEMP, clamp, convert, shakeMinutesLabel } from './convert';

describe('convert – eksemplene i PLAN.md', () => {
  it.each([
    // ovnstype, temp, tid, mengde → temp, kuttet, tid, ristesekunder
    ['conventional', 200, 30, 'normal', 180, false, 24, 720],
    ['fan', 200, 30, 'full', 190, false, 27, 810],
    ['conventional', 250, 15, 'normal', 200, true, 12, 360],
    ['fan', 150, 5, 'normal', 140, false, 4, 120],
  ] as const)(
    '%s %i °C %i min (%s) → %i °C',
    (ovenType, ovenTemp, ovenMinutes, load, airTemp, capped, airMinutes, shakeAtSeconds) => {
      expect(convert({ ovenType, ovenTemp, ovenMinutes, load })).toEqual({
        airTemp,
        capped,
        airMinutes,
        shakeAtSeconds,
      });
    },
  );
});

describe('convert – temperatur', () => {
  it('trekker fra 20 °C ved over-/undervarme', () => {
    expect(
      convert({ ovenType: 'conventional', ovenTemp: 180, ovenMinutes: 20, load: 'normal' }).airTemp,
    ).toBe(160);
  });

  it('trekker fra 10 °C ved varmluft', () => {
    expect(
      convert({ ovenType: 'fan', ovenTemp: 180, ovenMinutes: 20, load: 'normal' }).airTemp,
    ).toBe(170);
  });

  it('kutter ikke når resultatet er nøyaktig 200 °C', () => {
    const result = convert({
      ovenType: 'conventional',
      ovenTemp: 220,
      ovenMinutes: 20,
      load: 'normal',
    });
    expect(result).toMatchObject({ airTemp: 200, capped: false });
  });

  it('kutter til 200 °C når resultatet blir høyere', () => {
    const result = convert({ ovenType: 'fan', ovenTemp: 215, ovenMinutes: 20, load: 'normal' });
    expect(result).toMatchObject({ airTemp: AIRFRYER_MAX_TEMP, capped: true });
  });
});

describe('convert – tid', () => {
  it('ganger med 0,80 for ett lag og 0,90 for full kurv', () => {
    expect(
      convert({ ovenType: 'fan', ovenTemp: 200, ovenMinutes: 40, load: 'normal' }).airMinutes,
    ).toBe(32);
    expect(
      convert({ ovenType: 'fan', ovenTemp: 200, ovenMinutes: 40, load: 'full' }).airMinutes,
    ).toBe(36);
  });

  it('runder halve minutter opp, også når flyttall gir 13,4999…', () => {
    // 15 × 0,9 = 13,5 → 14
    expect(
      convert({ ovenType: 'fan', ovenTemp: 200, ovenMinutes: 15, load: 'full' }).airMinutes,
    ).toBe(14);
    // 45 × 0,9 = 40,5 → 41
    expect(
      convert({ ovenType: 'fan', ovenTemp: 200, ovenMinutes: 45, load: 'full' }).airMinutes,
    ).toBe(41);
  });

  it('runder ned under halvt minutt', () => {
    // 13 × 0,8 = 10,4 → 10
    expect(
      convert({ ovenType: 'fan', ovenTemp: 200, ovenMinutes: 13, load: 'normal' }).airMinutes,
    ).toBe(10);
  });

  it('håndterer grenseverdiene 5 og 90 min', () => {
    expect(
      convert({ ovenType: 'fan', ovenTemp: 200, ovenMinutes: 5, load: 'full' }).airMinutes,
    ).toBe(5); // 4,5 → 5
    expect(
      convert({ ovenType: 'fan', ovenTemp: 200, ovenMinutes: 90, load: 'normal' }).airMinutes,
    ).toBe(72);
  });

  it('gir aldri mindre enn 1 minutt', () => {
    expect(
      convert({ ovenType: 'fan', ovenTemp: 200, ovenMinutes: 0, load: 'normal' }).airMinutes,
    ).toBe(1);
  });

  it('setter ristetid til halvparten av ny tid', () => {
    expect(
      convert({ ovenType: 'fan', ovenTemp: 200, ovenMinutes: 15, load: 'full' }).shakeAtSeconds,
    ).toBe(420);
  });
});

describe('shakeMinutesLabel', () => {
  it('viser hele minutter uten «ca.»', () => {
    expect(shakeMinutesLabel(720)).toEqual({ minutes: 12, approx: false });
  });

  it('runder halve minutter og markerer som omtrentlig', () => {
    expect(shakeMinutesLabel(810)).toEqual({ minutes: 14, approx: true }); // 13,5
  });
});

describe('clamp', () => {
  it('holder verdien innenfor grensene', () => {
    expect(clamp(260, 150, 250)).toBe(250);
    expect(clamp(140, 150, 250)).toBe(150);
    expect(clamp(200, 150, 250)).toBe(200);
  });
});

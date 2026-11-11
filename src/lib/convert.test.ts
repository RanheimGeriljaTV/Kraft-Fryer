import { AIRFRYER_MAX_TEMP, capTimeFactor, clamp, convert, shakeMinutesLabel } from './convert';

describe('convert – eksemplene i PLAN.md', () => {
  it.each([
    // ovnstype, temp, tid, mengde → temp, kuttet, ønsket, +%, tid, ristesekunder
    ['conventional', 200, 30, 'normal', 180, false, 180, 0, 24, 720],
    ['fan', 200, 30, 'full', 190, false, 190, 0, 27, 810],
    ['conventional', 250, 15, 'normal', 200, true, 230, 23, 15, 450],
    ['fan', 150, 5, 'normal', 140, false, 140, 0, 4, 120],
  ] as const)(
    '%s %i °C %i min (%s) → %i °C',
    (
      ovenType,
      ovenTemp,
      ovenMinutes,
      load,
      airTemp,
      capped,
      wantedTemp,
      timeBoostPercent,
      airMinutes,
      shakeAtSeconds,
    ) => {
      expect(convert({ ovenType, ovenTemp, ovenMinutes, load })).toEqual({
        airTemp,
        capped,
        wantedTemp,
        timeBoostPercent,
        airMinutes,
        shakeAtSeconds,
      });
    },
  );
});

describe('convert – lengre tid når temperaturen kuttes', () => {
  it('gir ×1 uten kutt og øker jevnt fra grensen', () => {
    expect(capTimeFactor(180, 180)).toBe(1);
    expect(capTimeFactor(200, 200)).toBe(1);
    expect(capTimeFactor(205, 200)).toBeCloseTo(135 / 130);
    expect(capTimeFactor(230, 200)).toBeCloseTo(160 / 130);
  });

  it('øker tiden ca. 23 % når 230 °C kuttes til 200 °C', () => {
    // 250 °C over-/undervarme, 20 min: 16 min × 1,23 = 19,7 → 20 min
    const result = convert({
      ovenType: 'conventional',
      ovenTemp: 250,
      ovenMinutes: 20,
      load: 'normal',
    });
    expect(result).toMatchObject({ airTemp: 200, wantedTemp: 230, timeBoostPercent: 23 });
    expect(result.airMinutes).toBe(20);
  });

  it('øker mest ved 250 °C varmluft (ønsket 240 °C, +31 %)', () => {
    // 20 min × 0,8 = 16 min × 170/130 = 20,9 → 21 min
    const result = convert({ ovenType: 'fan', ovenTemp: 250, ovenMinutes: 20, load: 'normal' });
    expect(result).toMatchObject({ wantedTemp: 240, timeBoostPercent: 31, airMinutes: 21 });
  });

  it('endrer ikke tiden når temperaturen er nøyaktig 200 °C', () => {
    const result = convert({
      ovenType: 'conventional',
      ovenTemp: 220,
      ovenMinutes: 20,
      load: 'normal',
    });
    expect(result).toMatchObject({ timeBoostPercent: 0, airMinutes: 16 });
  });

  it('gir aldri kortere tid med høyere temperatur i oppskriften', () => {
    let previous = 0;
    for (let temp = 150; temp <= 250; temp += 5) {
      const { airMinutes } = convert({
        ovenType: 'conventional',
        ovenTemp: temp,
        ovenMinutes: 30,
        load: 'normal',
      });
      expect(airMinutes).toBeGreaterThanOrEqual(previous);
      previous = airMinutes;
    }
  });
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

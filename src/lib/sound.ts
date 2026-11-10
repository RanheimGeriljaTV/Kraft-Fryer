/**
 * Varsellyder laget med Web Audio API, så appen trenger ingen lydfiler.
 *
 * iOS Safari spiller bare lyd etter et brukertrykk. Kall derfor unlockAudio()
 * fra klikket på «Start nedtelling», så virker varslene senere.
 * Står telefonen på lydløs, spiller iOS ikke Web Audio-lyd; vibrasjon og
 * visuelt varsel virker likevel.
 */

let context: AudioContext | null = null;

type AudioContextConstructor = typeof AudioContext;

function getContext(): AudioContext | null {
  if (context) return context;
  const Ctor: AudioContextConstructor | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext;
  if (!Ctor) return null;
  context = new Ctor();
  return context;
}

/** Låser opp lyd. Må kalles direkte fra et klikk/trykk. */
export function unlockAudio() {
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') void ctx.resume();
  // Et kort, stille lydklipp «vekker» lyden på eldre iOS.
  const source = ctx.createBufferSource();
  source.buffer = ctx.createBuffer(1, 1, 22050);
  source.connect(ctx.destination);
  source.start(0);
}

function tone(ctx: AudioContext, frequency: number, start: number, duration: number) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  // Myk start og slutt, så det ikke klikker i høyttaleren.
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.3, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
}

/** To korte pip: rist kurven / snu maten. */
export function playMidway() {
  const ctx = getContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  tone(ctx, 880, t, 0.18);
  tone(ctx, 880, t + 0.3, 0.18);
}

/** Tre stigende pip: maten er ferdig. Gjentas av timeren til brukeren trykker OK. */
export function playDone() {
  const ctx = getContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  tone(ctx, 784, t, 0.22);
  tone(ctx, 988, t + 0.28, 0.22);
  tone(ctx, 1319, t + 0.56, 0.4);
}

export const VIBRATE_MIDWAY = [200, 100, 200];
export const VIBRATE_DONE = [500, 200, 500, 200, 500];

/** Vibrerer der det støttes (Android). iPhone har ikke Vibration API. */
export function vibrate(pattern: number[]) {
  navigator.vibrate?.(pattern);
}

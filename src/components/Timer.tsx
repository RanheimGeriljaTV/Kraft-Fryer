/**
 * Kompakte deler av nedtellingsklokken. Resultatkortet setter dem sammen, slik at
 * klokka tar plassen til tallene mens den går i stedet for å legge til en ny rad.
 */
import type { MidwayAction } from '../data/presets';
import type { AirfryerTimer } from '../hooks/useAirfryerTimer';
import { MIDWAY_ICON } from '../lib/settings';
import { formatClock } from '../lib/time';

const MIDWAY_NOW: Record<MidwayAction, string> = {
  shake: 'Rist kurven nå!',
  flip: 'Snu maten nå!',
};

const roundButton =
  'flex size-12 shrink-0 touch-manipulation items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-lg text-white transition select-none hover:border-accent/50 active:scale-95';

/** Liten startknapp på samme rad som temperatur og tid. */
export function StartButton({ timer, minutes }: { timer: AirfryerTimer; minutes: number }) {
  const clock = formatClock(minutes * 60);
  return (
    <button
      type="button"
      onClick={timer.start}
      data-umami-event="timer_start"
      aria-label={`Start nedtelling ${clock}`}
      className="flex h-12 min-w-12 shrink-0 touch-manipulation items-center justify-center gap-1.5 rounded-full bg-white px-4 font-mono text-sm font-bold text-black transition select-none hover:bg-zinc-200 active:scale-95"
    >
      <span aria-hidden="true">▶</span>
      <span className="hidden min-[360px]:inline">{clock}</span>
    </button>
  );
}

/** Nedtellingen på én rad: ring, tid, status og knapper. */
export function TimerRow({ timer }: { timer: AirfryerTimer }) {
  const paused = timer.status === 'paused';
  const clock = formatClock(timer.remainingSeconds);

  return (
    <div className="flex items-center gap-3">
      <ProgressRing progress={timer.progress} midway={timer.midwayFraction} />
      <div className="min-w-0 flex-1">
        <div
          role="timer"
          aria-label={`${clock} igjen`}
          className={`font-syne text-3xl leading-none font-black tracking-tighter tabular-nums ${
            paused ? 'text-zinc-400' : 'text-white'
          }`}
        >
          {clock}
        </div>
        <div className="mt-0.5 truncate font-mono text-xs text-zinc-400">{timer.statusText}</div>
      </div>
      {paused ? (
        <button
          type="button"
          onClick={timer.resume}
          aria-label="Fortsett nedtellingen"
          className={`${roundButton} border-accent bg-accent text-black`}
        >
          ▶
        </button>
      ) : (
        <button
          type="button"
          onClick={timer.pause}
          aria-label="Pause nedtellingen"
          className={roundButton}
        >
          ⏸
        </button>
      )}
      <button
        type="button"
        onClick={timer.stop}
        aria-label="Nullstill nedtellingen"
        className={roundButton}
      >
        ↺
      </button>
    </div>
  );
}

/** «Maten er ferdig» med OK, i stedet for tallraden. */
export function DoneRow({ timer }: { timer: AirfryerTimer }) {
  return (
    <div
      role="alert"
      className="flex animate-pulse items-center justify-between gap-3 rounded-2xl border-2 border-accent bg-accent/15 py-1 pr-1 pl-3"
    >
      <span className="font-syne text-base font-black tracking-tight text-white uppercase">
        <span aria-hidden="true">✅ </span>Maten er ferdig!
      </span>
      <button
        type="button"
        onClick={timer.stop}
        className="min-h-12 shrink-0 touch-manipulation rounded-full bg-white px-6 font-syne text-sm font-bold tracking-wider text-black uppercase"
      >
        OK
      </button>
    </div>
  );
}

/** Oransje varsel halvveis: «Rist kurven nå!» / «Snu maten nå!». */
export function MidwayBanner({ timer }: { timer: AirfryerTimer }) {
  if (!timer.midwayAlert || !timer.action) return null;
  return (
    <div
      role="alert"
      className="flex animate-slide-up items-center justify-between gap-3 rounded-2xl bg-accent py-1 pr-1 pl-3 text-black"
    >
      <span className="font-syne text-base font-black tracking-tight uppercase">
        <span aria-hidden="true">{MIDWAY_ICON[timer.action]} </span>
        {MIDWAY_NOW[timer.action]}
      </span>
      <button
        type="button"
        onClick={timer.dismissMidway}
        className="min-h-12 shrink-0 touch-manipulation rounded-full bg-black px-5 font-syne text-sm font-bold text-white uppercase"
      >
        OK
      </button>
    </div>
  );
}

/** Spørsmål om omstart når tiden endres mens klokka går, på én linje. */
export function ChangedPrompt({ timer, minutes }: { timer: AirfryerTimer; minutes: number }) {
  if (!timer.settingsChanged) return null;
  const pill =
    'min-h-12 touch-manipulation rounded-full px-4 font-syne text-xs font-bold tracking-wider uppercase';
  return (
    <div role="status" className="flex animate-slide-up flex-wrap items-center gap-2">
      <p className="mr-auto text-sm text-zinc-200">
        Tiden er endret til <strong className="text-white">{minutes} min</strong>.
      </p>
      <button
        type="button"
        onClick={timer.start}
        data-umami-event="timer_restart"
        className={`${pill} bg-accent text-black`}
      >
        Start på nytt
      </button>
      <button
        type="button"
        onClick={timer.keepCurrent}
        data-umami-event="timer_keep"
        className={`${pill} border border-white/10 text-zinc-200 hover:border-accent/50`}
      >
        Behold
      </button>
    </div>
  );
}

const RING_SIZE = 44;
const RING_STROKE = 4;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

/** Oransje fremdriftsring med en prikk der halvveis-varselet kommer. */
function ProgressRing({ progress, midway }: { progress: number; midway: number | null }) {
  const center = RING_SIZE / 2;
  const angle = midway !== null ? midway * 2 * Math.PI - Math.PI / 2 : 0;

  return (
    <svg
      width={RING_SIZE}
      height={RING_SIZE}
      viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
      aria-hidden="true"
      className="shrink-0"
    >
      <circle
        cx={center}
        cy={center}
        r={RING_RADIUS}
        fill="none"
        strokeWidth={RING_STROKE}
        className="stroke-white/10"
      />
      <circle
        cx={center}
        cy={center}
        r={RING_RADIUS}
        fill="none"
        strokeWidth={RING_STROKE}
        strokeLinecap="round"
        strokeDasharray={RING_LENGTH}
        strokeDashoffset={RING_LENGTH * (1 - Math.min(1, Math.max(0, progress)))}
        transform={`rotate(-90 ${center} ${center})`}
        className="stroke-accent transition-[stroke-dashoffset] duration-300"
      />
      {midway !== null && (
        <circle
          cx={center + RING_RADIUS * Math.cos(angle)}
          cy={center + RING_RADIUS * Math.sin(angle)}
          r={3}
          className="fill-white"
        />
      )}
    </svg>
  );
}

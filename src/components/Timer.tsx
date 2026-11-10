import { useEffect, useState } from 'react';
import { useCountdown } from '../hooks/useCountdown';
import { useWakeLock } from '../hooks/useWakeLock';
import type { MidwayAction } from '../data/presets';
import { MIDWAY_ICON, MIDWAY_VERB, type AirfryerSettings } from '../lib/settings';
import {
  VIBRATE_DONE,
  VIBRATE_MIDWAY,
  playDone,
  playMidway,
  unlockAudio,
  vibrate,
} from '../lib/sound';
import { formatClock, formatTimeOfDay } from '../lib/time';

interface Props {
  settings: AirfryerSettings;
}

/** Det som avgjør nedtellingen. Endres dette mens klokka går, spør vi om omstart. */
const timerKey = ({ minutes, midway }: AirfryerSettings) =>
  `${minutes}|${midway?.action ?? '-'}|${midway?.atSeconds ?? '-'}`;

const ALARM_REPEAT_MS = 2500;
const MIDWAY_BANNER_MS = 30_000;

const MIDWAY_NOW: Record<MidwayAction, string> = {
  shake: 'Rist kurven nå!',
  flip: 'Snu maten nå!',
};

const roundButton =
  'flex size-12 shrink-0 touch-manipulation items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-lg text-white transition select-none hover:border-accent/50 active:scale-95';

/** Nedtellingsklokke med varsel halvveis og når maten er ferdig. */
export default function Timer({ settings }: Props) {
  const [startedWith, setStartedWith] = useState<{
    key: string;
    action: MidwayAction | null;
  } | null>(null);
  const [keptKey, setKeptKey] = useState<string | null>(null);
  const [midwayAlert, setMidwayAlert] = useState(false);
  const [baseTitle] = useState(() => document.title);

  const countdown = useCountdown({
    onMidway: () => {
      playMidway();
      vibrate(VIBRATE_MIDWAY);
      setMidwayAlert(true);
    },
    onDone: () => {
      setMidwayAlert(false);
      vibrate(VIBRATE_DONE);
    },
  });
  const { status, remainingSeconds, elapsedMs, progress, endsAt, config } = countdown;
  const active = status === 'running' || status === 'paused';

  useWakeLock(status === 'running');

  // Ferdig-lyden gjentas til brukeren trykker OK.
  useEffect(() => {
    if (status !== 'done') return;
    playDone();
    const id = window.setInterval(playDone, ALARM_REPEAT_MS);
    return () => window.clearInterval(id);
  }, [status]);

  // Halvveis-banneret forsvinner av seg selv etter en stund.
  useEffect(() => {
    if (!midwayAlert) return;
    const id = window.setTimeout(() => setMidwayAlert(false), MIDWAY_BANNER_MS);
    return () => window.clearTimeout(id);
  }, [midwayAlert]);

  // Gjenstående tid i fanen, så den synes også når man er i en annen fane.
  useEffect(() => {
    if (status === 'idle') document.title = baseTitle;
    else if (status === 'done') document.title = `✅ Ferdig! – ${baseTitle}`;
    else
      document.title = `${status === 'paused' ? '⏸' : '⏱'} ${formatClock(remainingSeconds)} – ${baseTitle}`;
  }, [status, remainingSeconds, baseTitle]);

  useEffect(() => () => void (document.title = baseTitle), [baseTitle]);

  const start = () => {
    unlockAudio();
    setMidwayAlert(false);
    setKeptKey(null);
    setStartedWith({ key: timerKey(settings), action: settings.midway?.action ?? null });
    countdown.start({
      durationSeconds: settings.minutes * 60,
      midwaySeconds: settings.midway?.atSeconds ?? null,
    });
  };

  const stop = () => {
    setMidwayAlert(false);
    setStartedWith(null);
    countdown.reset();
  };

  const currentKey = timerKey(settings);
  const settingsChanged =
    active && startedWith !== null && startedWith.key !== currentKey && keptKey !== currentKey;

  if (status === 'idle') {
    return (
      <button
        type="button"
        onClick={start}
        data-umami-event="timer_start"
        className="flex min-h-14 w-full touch-manipulation items-center justify-center gap-2 rounded-full bg-white font-syne text-sm font-bold tracking-wider text-black uppercase transition select-none hover:bg-zinc-200 active:scale-[0.98]"
      >
        <span aria-hidden="true">▶</span>
        Start nedtelling
        <span className="font-mono text-xs font-normal tracking-normal text-zinc-600 normal-case">
          {formatClock(settings.minutes * 60)}
        </span>
      </button>
    );
  }

  if (status === 'done') {
    return (
      <div
        role="alert"
        className="flex animate-pulse items-center justify-between gap-3 rounded-2xl border-2 border-accent bg-accent/15 p-3"
      >
        <span className="font-syne text-lg font-black tracking-tight text-white uppercase">
          <span aria-hidden="true">✅ </span>Maten er ferdig!
        </span>
        <button
          type="button"
          onClick={stop}
          className="min-h-12 shrink-0 touch-manipulation rounded-full bg-white px-6 font-syne text-sm font-bold tracking-wider text-black uppercase"
        >
          OK
        </button>
      </div>
    );
  }

  const midwaySeconds = config?.midwaySeconds ?? null;
  const midwayPending = midwaySeconds !== null && elapsedMs < midwaySeconds * 1000;
  const action = startedWith?.action ?? null;

  let statusText: string;
  if (status === 'paused') statusText = 'Pauset';
  else if (midwayPending && action)
    statusText = `${MIDWAY_VERB[action]} om ${formatClock(midwaySeconds - elapsedMs / 1000)}`;
  else if (endsAt) statusText = `Ferdig kl. ${formatTimeOfDay(endsAt)}`;
  else statusText = '';

  return (
    <div className="space-y-2.5">
      {midwayAlert && action && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-2xl bg-accent py-1.5 pr-1.5 pl-4 text-black"
        >
          <span className="font-syne text-base font-black tracking-tight uppercase">
            <span aria-hidden="true">{MIDWAY_ICON[action]} </span>
            {MIDWAY_NOW[action]}
          </span>
          <button
            type="button"
            onClick={() => setMidwayAlert(false)}
            className="min-h-12 shrink-0 touch-manipulation rounded-full bg-black px-5 font-syne text-sm font-bold text-white uppercase"
          >
            OK
          </button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <ProgressRing
          progress={progress}
          midway={midwaySeconds && config ? midwaySeconds / config.durationSeconds : null}
        />
        <div className="min-w-0 flex-1">
          <div
            role="timer"
            aria-label={`${formatClock(remainingSeconds)} igjen`}
            className={`font-syne text-4xl leading-none font-black tracking-tighter tabular-nums ${
              status === 'paused' ? 'text-zinc-400' : 'text-white'
            }`}
          >
            {formatClock(remainingSeconds)}
          </div>
          <div className="mt-1 truncate font-mono text-xs text-zinc-400">{statusText}</div>
        </div>
        {status === 'running' ? (
          <button
            type="button"
            onClick={countdown.pause}
            aria-label="Pause nedtellingen"
            className={roundButton}
          >
            ⏸
          </button>
        ) : (
          <button
            type="button"
            onClick={countdown.resume}
            aria-label="Fortsett nedtellingen"
            className={`${roundButton} border-accent bg-accent text-black`}
          >
            ▶
          </button>
        )}
        <button
          type="button"
          onClick={stop}
          aria-label="Nullstill nedtellingen"
          className={roundButton}
        >
          ↺
        </button>
      </div>

      {settingsChanged && (
        <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <p className="text-sm text-zinc-200">
            Innstillingene er endret til{' '}
            <strong className="text-white">{settings.minutes} min</strong>. Starte nedtellingen på
            nytt?
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={start}
              className="min-h-12 touch-manipulation rounded-full bg-accent font-syne text-xs font-bold tracking-wider text-black uppercase"
            >
              Start på nytt
            </button>
            <button
              type="button"
              onClick={() => setKeptKey(currentKey)}
              className="min-h-12 touch-manipulation rounded-full border border-white/10 font-syne text-xs font-bold tracking-wider text-zinc-200 uppercase hover:border-accent/50"
            >
              Behold
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const RING_SIZE = 56;
const RING_STROKE = 5;
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
          r={3.5}
          className="fill-white"
        />
      )}
    </svg>
  );
}

import { useEffect, useState } from 'react';
import { useCountdown } from './useCountdown';
import { useWakeLock } from './useWakeLock';
import type { MidwayAction } from '../data/presets';
import { MIDWAY_VERB, type AirfryerSettings } from '../lib/settings';
import {
  VIBRATE_DONE,
  VIBRATE_MIDWAY,
  playDone,
  playMidway,
  unlockAudio,
  vibrate,
} from '../lib/sound';
import { formatClock, formatTimeOfDay } from '../lib/time';

/** Det som avgjør nedtellingen. Endres dette mens klokka går, spør vi om omstart. */
const timerKey = ({ minutes, midway }: AirfryerSettings) =>
  `${minutes}|${midway?.action ?? '-'}|${midway?.atSeconds ?? '-'}`;

const ALARM_REPEAT_MS = 2500;
const MIDWAY_BANNER_MS = 30_000;

/**
 * All logikk for nedtellingsklokken i resultatkortet: lyd, vibrasjon, wake lock,
 * fanetittel og spørsmål om omstart når innstillingene endres.
 */
export function useAirfryerTimer(settings: AirfryerSettings) {
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
  const { status, remainingSeconds, elapsedMs, endsAt, config } = countdown;
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
  const action = startedWith?.action ?? null;
  const midwaySeconds = config?.midwaySeconds ?? null;
  const midwayPending = midwaySeconds !== null && elapsedMs < midwaySeconds * 1000;

  let statusText = '';
  if (status === 'paused') statusText = 'Pauset';
  else if (midwayPending && action && midwaySeconds !== null)
    statusText = `${MIDWAY_VERB[action]} om ${formatClock(midwaySeconds - elapsedMs / 1000)}`;
  else if (endsAt) statusText = `Ferdig kl. ${formatTimeOfDay(endsAt)}`;

  return {
    ...countdown,
    active,
    action,
    statusText,
    /** 0–1: hvor på ringen halvveis-prikken står, eller null. */
    midwayFraction: midwaySeconds && config ? midwaySeconds / config.durationSeconds : null,
    midwayAlert,
    dismissMidway: () => setMidwayAlert(false),
    settingsChanged:
      active && startedWith !== null && startedWith.key !== currentKey && keptKey !== currentKey,
    keepCurrent: () => setKeptKey(currentKey),
    start,
    stop,
  };
}

export type AirfryerTimer = ReturnType<typeof useAirfryerTimer>;

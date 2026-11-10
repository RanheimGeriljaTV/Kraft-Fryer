import { useCallback, useEffect, useRef, useState } from 'react';

export type CountdownStatus = 'idle' | 'running' | 'paused' | 'done';

export interface CountdownConfig {
  durationSeconds: number;
  /** Sekunder etter start da halvveis-varselet skal gå. null = ingen varsel. */
  midwaySeconds: number | null;
}

interface Callbacks {
  onMidway?: () => void;
  onDone?: () => void;
}

const TICK_MS = 250;

/**
 * Nedtelling basert på et fast sluttidspunkt (Date.now() + varighet), ikke på å telle
 * intervaller. Da går klokka riktig selv om fanen ligger i bakgrunnen og nettleseren
 * struper setInterval. Når fanen blir synlig igjen, oppdateres den med en gang.
 */
export function useCountdown({ onMidway, onDone }: Callbacks = {}) {
  const [status, setStatus] = useState<CountdownStatus>('idle');
  const [config, setConfig] = useState<CountdownConfig | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const [endsAt, setEndsAt] = useState<number | null>(null);

  const configRef = useRef<CountdownConfig | null>(null);
  const endAtRef = useRef(0);
  const pausedRemainingRef = useRef(0);
  const runningRef = useRef(false);
  const midwayFiredRef = useRef(false);
  const callbacksRef = useRef({ onMidway, onDone });

  useEffect(() => {
    callbacksRef.current = { onMidway, onDone };
  }, [onMidway, onDone]);

  const tick = useCallback(() => {
    const cfg = configRef.current;
    if (!runningRef.current || !cfg) return;

    const left = Math.max(0, endAtRef.current - Date.now());
    setRemainingMs(left);

    if (left === 0) {
      // Kommer man tilbake etter at tiden er ute, er halvveis-varselet uten verdi.
      runningRef.current = false;
      midwayFiredRef.current = true;
      setStatus('done');
      setEndsAt(null);
      callbacksRef.current.onDone?.();
      return;
    }

    const elapsedMs = cfg.durationSeconds * 1000 - left;
    if (
      !midwayFiredRef.current &&
      cfg.midwaySeconds !== null &&
      elapsedMs >= cfg.midwaySeconds * 1000
    ) {
      midwayFiredRef.current = true;
      callbacksRef.current.onMidway?.();
    }
  }, []);

  useEffect(() => {
    if (status !== 'running') return;
    const id = window.setInterval(tick, TICK_MS);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [status, tick]);

  const start = useCallback((cfg: CountdownConfig) => {
    const durationMs = cfg.durationSeconds * 1000;
    const midwayValid =
      cfg.midwaySeconds !== null &&
      cfg.midwaySeconds > 0 &&
      cfg.midwaySeconds < cfg.durationSeconds;

    configRef.current = cfg;
    midwayFiredRef.current = !midwayValid;
    endAtRef.current = Date.now() + durationMs;
    runningRef.current = true;

    setConfig(cfg);
    setRemainingMs(durationMs);
    setEndsAt(endAtRef.current);
    setStatus('running');
  }, []);

  const pause = useCallback(() => {
    if (!runningRef.current) return;
    const left = Math.max(0, endAtRef.current - Date.now());
    pausedRemainingRef.current = left;
    runningRef.current = false;
    setRemainingMs(left);
    setEndsAt(null);
    setStatus('paused');
  }, []);

  const resume = useCallback(() => {
    if (runningRef.current || !configRef.current) return;
    endAtRef.current = Date.now() + pausedRemainingRef.current;
    runningRef.current = true;
    setEndsAt(endAtRef.current);
    setStatus('running');
  }, []);

  const reset = useCallback(() => {
    configRef.current = null;
    runningRef.current = false;
    setConfig(null);
    setRemainingMs(0);
    setEndsAt(null);
    setStatus('idle');
  }, []);

  const durationMs = (config?.durationSeconds ?? 0) * 1000;

  return {
    status,
    config,
    remainingMs,
    /** Hele sekunder igjen, rundet opp (viser 16:00 helt til første sekund er gått). */
    remainingSeconds: Math.ceil(remainingMs / 1000),
    elapsedMs: durationMs - remainingMs,
    /** 0–1, hvor langt nedtellingen har kommet. */
    progress: durationMs > 0 ? 1 - remainingMs / durationMs : 0,
    /** Klokkeslett (ms) da tiden er ute, bare mens klokka går. */
    endsAt,
    start,
    pause,
    resume,
    reset,
  };
}

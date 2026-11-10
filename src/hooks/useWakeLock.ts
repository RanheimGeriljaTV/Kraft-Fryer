import { useEffect } from 'react';

/**
 * Holder skjermen på mens `active` er true (Screen Wake Lock API).
 * Nettleseren slipper låsen når fanen skjules, så den hentes på nytt når fanen blir synlig.
 * Gjør ingenting i nettlesere uten støtte.
 */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const request = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const lock = await navigator.wakeLock.request('screen');
        if (cancelled) void lock.release();
        else sentinel = lock;
      } catch {
        // Kan bli nektet, f.eks. ved lavt batteri. Timeren virker likevel.
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') void request();
    };

    void request();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      void sentinel?.release();
    };
  }, [active]);
}

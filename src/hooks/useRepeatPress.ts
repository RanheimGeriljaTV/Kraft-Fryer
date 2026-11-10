import { useCallback, useEffect, useRef } from 'react';

const INITIAL_DELAY = 400; // ms før gjentakelsen starter
const REPEAT_INTERVAL = 80; // ms mellom hvert steg mens knappen holdes inne

/**
 * Kjører `action` én gang ved trykk, og gjentar den så lenge knappen holdes inne.
 * Tastatur (Enter/Mellomrom) gir ett steg per trykk via onClick.
 */
export function useRepeatPress(action: () => void, enabled = true) {
  const actionRef = useRef(action);
  const timeout = useRef<number | undefined>(undefined);
  const interval = useRef<number | undefined>(undefined);

  useEffect(() => {
    actionRef.current = action;
  }, [action]);

  const stop = useCallback(() => {
    window.clearTimeout(timeout.current);
    window.clearInterval(interval.current);
  }, []);

  useEffect(() => stop, [stop]);

  // En deaktivert knapp får ikke pointerup, så gjentakelsen stoppes her når grensen nås.
  useEffect(() => {
    if (!enabled) stop();
  }, [enabled, stop]);

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.button !== 0) return;
    stop();
    actionRef.current();
    timeout.current = window.setTimeout(() => {
      interval.current = window.setInterval(() => actionRef.current(), REPEAT_INTERVAL);
    }, INITIAL_DELAY);
  };

  // Klikk med detail 0 kommer fra tastaturet; museklikk er allerede håndtert i onPointerDown.
  const onClick = (event: React.MouseEvent) => {
    if (event.detail === 0) actionRef.current();
  };

  return {
    onPointerDown,
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
    onClick,
    onContextMenu: (event: React.MouseEvent) => event.preventDefault(),
  };
}

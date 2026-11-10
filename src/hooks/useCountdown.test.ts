import { act, renderHook } from '@testing-library/react';
import { useCountdown } from './useCountdown';

const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('teller ned fra start og er ferdig når tiden er ute', () => {
    const onDone = vi.fn();
    const { result } = renderHook(() => useCountdown({ onDone }));

    act(() => result.current.start({ durationSeconds: 60, midwaySeconds: null }));
    expect(result.current.status).toBe('running');
    expect(result.current.remainingSeconds).toBe(60);

    advance(20_000);
    expect(result.current.remainingSeconds).toBe(40);
    expect(result.current.progress).toBeCloseTo(1 / 3);

    advance(40_000);
    expect(result.current.status).toBe('done');
    expect(result.current.remainingSeconds).toBe(0);
    expect(onDone).toHaveBeenCalledTimes(1);

    advance(10_000);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('gir halvveis-varsel én gang, på riktig tidspunkt', () => {
    const onMidway = vi.fn();
    const { result } = renderHook(() => useCountdown({ onMidway }));

    act(() => result.current.start({ durationSeconds: 16 * 60, midwaySeconds: 8 * 60 }));

    advance(8 * 60 * 1000 - 500);
    expect(onMidway).not.toHaveBeenCalled();

    advance(500);
    expect(onMidway).toHaveBeenCalledTimes(1);

    advance(60_000);
    expect(onMidway).toHaveBeenCalledTimes(1);
  });

  it('gir ikke halvveis-varsel når midwaySeconds er null', () => {
    const onMidway = vi.fn();
    const { result } = renderHook(() => useCountdown({ onMidway }));

    act(() => result.current.start({ durationSeconds: 60, midwaySeconds: null }));
    advance(60_000);

    expect(onMidway).not.toHaveBeenCalled();
    expect(result.current.status).toBe('done');
  });

  it('står stille under pause og fortsetter der den slapp', () => {
    const { result } = renderHook(() => useCountdown());

    act(() => result.current.start({ durationSeconds: 60, midwaySeconds: null }));
    advance(10_000);
    act(() => result.current.pause());
    expect(result.current.status).toBe('paused');
    expect(result.current.endsAt).toBeNull();

    advance(30_000);
    expect(result.current.remainingSeconds).toBe(50);

    act(() => result.current.resume());
    advance(10_000);
    expect(result.current.remainingSeconds).toBe(40);
  });

  it('nullstiller til start', () => {
    const { result } = renderHook(() => useCountdown());

    act(() => result.current.start({ durationSeconds: 60, midwaySeconds: 30 }));
    advance(5_000);
    act(() => result.current.reset());

    expect(result.current.status).toBe('idle');
    expect(result.current.config).toBeNull();
    advance(60_000);
    expect(result.current.status).toBe('idle');
  });

  it('regner fra sluttidspunktet, så klokka er riktig etter tid i bakgrunnen', () => {
    const onMidway = vi.fn();
    const onDone = vi.fn();
    const { result } = renderHook(() => useCountdown({ onMidway, onDone }));

    act(() => result.current.start({ durationSeconds: 600, midwaySeconds: 300 }));

    // Nettleseren struper intervallene i bakgrunnen; klokka hopper 7 min frem.
    act(() => {
      vi.setSystemTime(Date.now() + 7 * 60 * 1000);
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(result.current.remainingSeconds).toBe(180);
    expect(onMidway).toHaveBeenCalledTimes(1);
    expect(onDone).not.toHaveBeenCalled();
  });

  it('hopper over halvveis-varselet hvis tiden allerede er ute når man kommer tilbake', () => {
    const onMidway = vi.fn();
    const onDone = vi.fn();
    const { result } = renderHook(() => useCountdown({ onMidway, onDone }));

    act(() => result.current.start({ durationSeconds: 600, midwaySeconds: 300 }));
    act(() => {
      vi.setSystemTime(Date.now() + 20 * 60 * 1000);
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(onDone).toHaveBeenCalledTimes(1);
    expect(onMidway).not.toHaveBeenCalled();
  });

  it('ignorerer halvveis-tidspunkt som ikke er før slutt', () => {
    const onMidway = vi.fn();
    const { result } = renderHook(() => useCountdown({ onMidway }));

    act(() => result.current.start({ durationSeconds: 60, midwaySeconds: 60 }));
    advance(60_000);

    expect(onMidway).not.toHaveBeenCalled();
  });
});

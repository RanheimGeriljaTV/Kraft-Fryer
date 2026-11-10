import { act, fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';
import * as sound from './lib/sound';

vi.mock('./lib/sound', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./lib/sound')>();
  return {
    ...actual,
    unlockAudio: vi.fn(),
    playMidway: vi.fn(),
    playDone: vi.fn(),
    vibrate: vi.fn(),
  };
});

const card = () => within(screen.getByRole('region', { name: 'Airfryer-innstillinger' }));
const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));
const click = (element: HTMLElement) => act(() => fireEvent.click(element));
const startButton = () => card().getByRole('button', { name: /Start nedtelling/ });

describe('Nedtellingsklokke', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    document.title = 'Kraft-Fryer';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starter med tiden fra resultatet og låser opp lyd', () => {
    render(<App />);
    expect(startButton()).toHaveTextContent('16:00');

    click(startButton());

    expect(sound.unlockAudio).toHaveBeenCalledTimes(1);
    expect(card().getByRole('timer')).toHaveTextContent('16:00');
    expect(card().getByText(/Rist om 8:00/)).toBeInTheDocument();

    advance(61_000);
    expect(card().getByRole('timer')).toHaveTextContent('14:59');
  });

  it('varsler halvveis med lyd, vibrasjon og banner', () => {
    render(<App />);
    click(startButton());

    advance(8 * 60 * 1000);

    expect(sound.playMidway).toHaveBeenCalledTimes(1);
    expect(sound.vibrate).toHaveBeenCalledWith(sound.VIBRATE_MIDWAY);
    expect(card().getByRole('alert')).toHaveTextContent('Rist kurven nå!');
    expect(card().getByText(/Ferdig kl\./)).toBeInTheDocument();

    click(within(card().getByRole('alert')).getByRole('button', { name: 'OK' }));
    expect(card().queryByRole('alert')).not.toBeInTheDocument();
  });

  it('sier «Snu maten nå!» for kyllingbryst', () => {
    render(<App />);
    click(screen.getByRole('button', { name: /Kyllingbryst/ }));
    click(startButton());

    advance(10 * 60 * 1000);

    expect(card().getByRole('alert')).toHaveTextContent('Snu maten nå!');
  });

  it('gir ikke halvveis-varsel for laks', () => {
    render(<App />);
    click(screen.getByRole('button', { name: /Laksefilet/ }));
    click(startButton());

    advance(9 * 60 * 1000);

    expect(sound.playMidway).not.toHaveBeenCalled();
    expect(card().queryByRole('alert')).not.toBeInTheDocument();
  });

  it('varsler når maten er ferdig, gjentar lyden og stopper på OK', () => {
    render(<App />);
    click(screen.getByRole('button', { name: /Frossenpizza/ }));
    click(startButton());

    advance(8 * 60 * 1000);

    expect(card().getByRole('alert')).toHaveTextContent('Maten er ferdig!');
    expect(sound.vibrate).toHaveBeenCalledWith(sound.VIBRATE_DONE);
    expect(sound.playDone).toHaveBeenCalledTimes(1);

    advance(5_000);
    expect(sound.playDone).toHaveBeenCalledTimes(3);

    click(card().getByRole('button', { name: 'OK' }));
    advance(10_000);
    expect(sound.playDone).toHaveBeenCalledTimes(3);
    expect(startButton()).toBeInTheDocument();
  });

  it('kan pauses, fortsettes og nullstilles', () => {
    render(<App />);
    click(startButton());
    advance(60_000);

    click(card().getByRole('button', { name: 'Pause nedtellingen' }));
    expect(card().getByText('Pauset')).toBeInTheDocument();
    advance(60_000);
    expect(card().getByRole('timer')).toHaveTextContent('15:00');

    click(card().getByRole('button', { name: 'Fortsett nedtellingen' }));
    advance(30_000);
    expect(card().getByRole('timer')).toHaveTextContent('14:30');

    click(card().getByRole('button', { name: 'Nullstill nedtellingen' }));
    expect(startButton()).toBeInTheDocument();
  });

  it('viser gjenstående tid i fanen', () => {
    render(<App />);
    click(startButton());
    advance(1_000);

    expect(document.title).toBe('⏱ 15:59 – Kraft-Fryer');

    click(card().getByRole('button', { name: 'Pause nedtellingen' }));
    expect(document.title).toBe('⏸ 15:59 – Kraft-Fryer');

    click(card().getByRole('button', { name: 'Nullstill nedtellingen' }));
    expect(document.title).toBe('Kraft-Fryer');
  });

  it('spør om omstart når tiden endres mens klokka går', () => {
    render(<App />);
    click(startButton());
    advance(60_000);

    click(screen.getByRole('button', { name: '30 min' }));

    expect(card().getByText(/endret til/)).toHaveTextContent('24 min');
    click(card().getByRole('button', { name: 'Start på nytt' }));

    expect(card().getByRole('timer')).toHaveTextContent('24:00');
    expect(card().queryByText(/endret til/)).not.toBeInTheDocument();
  });

  it('kan beholde nedtellingen når tiden endres', () => {
    render(<App />);
    click(startButton());
    advance(60_000);

    click(screen.getByRole('button', { name: '30 min' }));
    click(card().getByRole('button', { name: 'Behold' }));

    expect(card().queryByText(/endret til/)).not.toBeInTheDocument();
    expect(card().getByRole('timer')).toHaveTextContent('15:00');
  });

  it('spør ikke når bare temperaturen endres', () => {
    render(<App />);
    click(startButton());

    act(() => {
      fireEvent.change(screen.getByRole('slider', { name: 'Temperatur i oppskriften' }), {
        target: { value: '220' },
      });
    });

    expect(card().queryByText(/endret til/)).not.toBeInTheDocument();
  });

  it('holder skjermen på mens klokka går', async () => {
    const release = vi.fn().mockResolvedValue(undefined);
    const request = vi.fn().mockResolvedValue({ release });
    Object.defineProperty(navigator, 'wakeLock', { value: { request }, configurable: true });

    render(<App />);
    click(startButton());
    await act(async () => {});
    expect(request).toHaveBeenCalledWith('screen');

    click(card().getByRole('button', { name: 'Pause nedtellingen' }));
    expect(release).toHaveBeenCalled();

    delete (navigator as { wakeLock?: unknown }).wakeLock;
  });
});

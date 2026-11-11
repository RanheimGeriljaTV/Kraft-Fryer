import { act, fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';

vi.mock('./lib/sound', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./lib/sound')>()),
  unlockAudio: vi.fn(),
  playMidway: vi.fn(),
  playDone: vi.fn(),
  vibrate: vi.fn(),
}));

const card = () => within(screen.getByRole('region', { name: 'Airfryer-innstillinger' }));
const click = (element: HTMLElement) => act(() => fireEvent.click(element));

describe('Egg', () => {
  it('viser 125 °C og tidsintervallet på knappen', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Egg 125 °C · 11–13 min' })).toBeInTheDocument();
  });

  it('viser verdier, tips og at egg ikke trenger risting', () => {
    render(<App />);
    click(screen.getByRole('button', { name: /^Egg/ }));

    expect(card().getByText('Kokte egg: 125 grader i 12 minutter.')).toBeInTheDocument();
    expect(card().getByText('Trenger ikke ristes')).toBeInTheDocument();
    expect(card().getByText(/Philips XL: 11–13 min/)).toBeInTheDocument();
    expect(card().getByRole('button', { name: 'Start nedtelling 12:00' })).toBeInTheDocument();
  });

  it('teller ned 12 min uten halvveis-varsel', () => {
    vi.useFakeTimers();
    render(<App />);
    click(screen.getByRole('button', { name: /^Egg/ }));
    click(card().getByRole('button', { name: /Start nedtelling/ }));

    act(() => vi.advanceTimersByTime(6 * 60 * 1000));
    expect(card().queryByRole('alert')).not.toBeInTheDocument();
    expect(card().getByRole('timer')).toHaveTextContent('6:00');

    act(() => vi.advanceTimersByTime(6 * 60 * 1000));
    expect(card().getByRole('alert')).toHaveTextContent('Maten er ferdig!');
    vi.useRealTimers();
  });
});

describe('Kompakt nedtelling', () => {
  it('erstatter tallraden mens klokka går, og viser temperatur og tid i toppraden', () => {
    vi.useFakeTimers();
    render(<App />);
    expect(card().getByText('16')).toBeInTheDocument();

    click(card().getByRole('button', { name: /Start nedtelling/ }));

    expect(card().getByRole('timer')).toHaveTextContent('16:00');
    expect(card().getByText('180 °C · 16 min')).toBeInTheDocument();
    expect(card().queryByRole('button', { name: /Start nedtelling/ })).not.toBeInTheDocument();
    expect(card().queryByText('16')).not.toBeInTheDocument();

    click(card().getByRole('button', { name: 'Nullstill nedtellingen' }));
    expect(card().getByRole('button', { name: /Start nedtelling/ })).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('skjuler maksgrense-notisen mens klokka går', () => {
    vi.useFakeTimers();
    render(<App />);
    fireEvent.change(screen.getByRole('slider', { name: 'Temperatur i oppskriften' }), {
      target: { value: '250' },
    });
    expect(card().getByRole('note')).toBeInTheDocument();

    click(card().getByRole('button', { name: /Start nedtelling/ }));
    expect(card().queryByRole('note')).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});

import axe from 'axe-core';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';

vi.mock('./lib/sound', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./lib/sound')>()),
  unlockAudio: vi.fn(),
  playMidway: vi.fn(),
  playDone: vi.fn(),
  vibrate: vi.fn(),
}));

/**
 * Kjører axe-core (WCAG 2.1 A/AA) på det som er tegnet.
 * Fargekontrast kan ikke måles i jsdom (ingen ekte CSS) og er sjekket for hånd i CHANGELOG 0.5.0.
 */
async function expectNoViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] },
    rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
  });
  const summary = results.violations.map(
    (v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`,
  );
  expect(summary).toEqual([]);
}

const card = () => within(screen.getByRole('region', { name: 'Airfryer-innstillinger' }));

describe('Tilgjengelighet (axe)', () => {
  it('startsiden', async () => {
    const { container } = render(<App />);
    await expectNoViolations(container);
  });

  it('med hurtigvalg og maksgrense-notis', async () => {
    const { container } = render(<App />);
    fireEvent.change(screen.getByRole('slider', { name: 'Temperatur i oppskriften' }), {
      target: { value: '250' },
    });
    await expectNoViolations(container);

    fireEvent.click(screen.getByRole('button', { name: /Kyllingbryst/ }));
    await expectNoViolations(container);
  });

  describe('med nedtelling', () => {
    // axe bruker setTimeout internt, så bare klokka og intervallene forfalskes.
    beforeEach(() => vi.useFakeTimers({ toFake: ['setInterval', 'Date'] }));
    afterEach(() => vi.useRealTimers());

    it('mens den går, halvveis og ferdig', async () => {
      const { container } = render(<App />);
      act(() => fireEvent.click(card().getByRole('button', { name: /Start nedtelling/ })));

      act(() => fireEvent.click(screen.getByRole('button', { name: '30 min' })));
      act(() => vi.advanceTimersByTime(8 * 60 * 1000));
      expect(card().getByRole('alert')).toHaveTextContent('Rist kurven nå!');
      expect(card().getByRole('status')).toHaveTextContent('endret til');
      await expectNoViolations(container);

      act(() => vi.advanceTimersByTime(8 * 60 * 1000));
      expect(card().getByRole('alert')).toHaveTextContent('Maten er ferdig!');
      await expectNoViolations(container);
    });
  });
});

describe('Skjermleser', () => {
  it('har overskrifter for hver del', () => {
    render(<App />);
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Hurtigvalg uten oppskrift',
      '01 / Ovnstype i oppskriften',
      '02 / Temperatur i oppskriften',
      '03 / Tid i oppskriften',
      '04 / Mengde i kurven',
    ]);
  });

  it('gir hurtigvalg samme navn som teksten på knappen (WCAG 2.5.3, talestyring)', () => {
    render(<App />);
    for (const label of ['Pommes frites', 'Kyllingbryst', 'Laksefilet', 'Pizza', 'Rotgrønnsaker']) {
      expect(
        screen.getByRole('button', { name: new RegExp(`^${label} \\d+ °C · \\d+ min$`) }),
      ).toBeInTheDocument();
    }
  });

  it('har mellomrom mellom tekstdelene i knappenavn', () => {
    render(<App />);
    expect(screen.getByRole('radio', { name: 'Over-/undervarme −20 °C' })).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: 'Full kurv / Mye mat tid × 0,90' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start nedtelling 16:00' })).toBeInTheDocument();
  });

  it('melder nytt resultat først når verdien har stått stille', () => {
    vi.useFakeTimers();
    render(<App />);
    const live = screen.getByTestId('announcement');
    expect(live).toBeEmptyDOMElement();

    const slider = screen.getByRole('slider', { name: 'Temperatur i oppskriften' });
    act(() => {
      fireEvent.change(slider, { target: { value: '210' } });
      vi.advanceTimersByTime(300);
      fireEvent.change(slider, { target: { value: '220' } });
      vi.advanceTimersByTime(300);
    });
    expect(live).toBeEmptyDOMElement();

    act(() => vi.advanceTimersByTime(700));
    expect(live).toHaveTextContent('Nytt resultat: 200 grader i 16 minutter.');
    vi.useRealTimers();
  });
});

import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

const card = () => within(screen.getByRole('region', { name: 'Airfryer-innstillinger' }));
const presetButton = (name: RegExp) => screen.getByRole('button', { name });

describe('Hurtigvalg i appen', () => {
  it('viser ferdige verdier og ristetid for pommes frites', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(presetButton(/Frosne pommes frites/));

    expect(presetButton(/Frosne pommes frites/)).toHaveAttribute('aria-pressed', 'true');
    expect(card().getByText('Frosne pommes frites: 200 grader i 16 minutter.')).toBeInTheDocument();
    expect(card().getByText(/Rist etter/)).toHaveTextContent('Rist etter 8 min');
  });

  it('sier «Snu» for kyllingbryst, ikke «Rist»', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(presetButton(/Kyllingbryst/));

    expect(card().getByText(/Snu etter/)).toHaveTextContent('Snu etter 10 min');
    expect(card().queryByText(/Rist etter/)).not.toBeInTheDocument();
  });

  it('viser at laks ikke trenger risting', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(presetButton(/Laksefilet/));

    expect(card().getByText('Trenger ikke ristes')).toBeInTheDocument();
  });

  it('bytter direkte mellom hurtigvalg', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(presetButton(/Laksefilet/));
    await user.click(presetButton(/rotgrønnsaker/));

    expect(presetButton(/Laksefilet/)).toHaveAttribute('aria-pressed', 'false');
    expect(
      card().getByText('Ovnsbakte rotgrønnsaker: 190 grader i 15 minutter.'),
    ).toBeInTheDocument();
  });

  it('går tilbake til omregning når det aktive hurtigvalget trykkes igjen', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(presetButton(/Frossenpizza/));
    await user.click(presetButton(/Frossenpizza/));

    expect(presetButton(/Frossenpizza/)).toHaveAttribute('aria-pressed', 'false');
    expect(card().getByText('180 grader i 16 minutter.')).toBeInTheDocument();
  });

  it('går tilbake til omregning med ×-knappen', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(presetButton(/Frossenpizza/));
    await user.click(screen.getByRole('button', { name: /Fjern hurtigvalg/ }));

    expect(card().getByText('180 grader i 16 minutter.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Fjern hurtigvalg/ })).not.toBeInTheDocument();
    expect(presetButton(/Frossenpizza/)).toHaveFocus();
  });

  it('går tilbake til omregning når et oppskriftsfelt endres', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(presetButton(/Frosne pommes frites/));
    fireEvent.change(screen.getByRole('slider', { name: 'Tid i oppskriften' }), {
      target: { value: '30' },
    });

    expect(presetButton(/Frosne pommes frites/)).toHaveAttribute('aria-pressed', 'false');
    expect(card().getByText('180 grader i 24 minutter.')).toBeInTheDocument();
  });

  it('går tilbake til omregning også når valgt ovnstype trykkes på nytt', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(presetButton(/Kyllingbryst/));
    await user.click(screen.getByRole('radio', { name: /Over-\/undervarme/ }));

    expect(presetButton(/Kyllingbryst/)).toHaveAttribute('aria-pressed', 'false');
    expect(card().getByText('180 grader i 16 minutter.')).toBeInTheDocument();
  });

  it('beholder oppskriftsverdiene mens et hurtigvalg er i bruk', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: '45 min' }));
    await user.click(presetButton(/Laksefilet/));
    await user.click(presetButton(/Laksefilet/));

    expect(card().getByText('180 grader i 36 minutter.')).toBeInTheDocument();
  });
});

import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

const result = () => within(screen.getByRole('region', { name: 'Airfryer-innstillinger' }));

/** Leser skjermleserteksten «180 grader i 16 minutter.» fra resultatkortet. */
const expectResult = (temp: number, minutes: number) =>
  expect(result().getByText(`${temp} grader i ${minutes} minutter.`)).toBeInTheDocument();

describe('Kalkulator', () => {
  it('viser standardresultatet uten at noe må trykkes', () => {
    render(<App />);
    // 200 °C over-/undervarme, 20 min, 1 lag → 180 °C, 16 min, rist etter 8 min
    expectResult(180, 16);
    expect(result().getByText('8 min')).toBeInTheDocument();
  });

  it('oppdaterer resultatet når ovnstypen endres', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('radio', { name: /Varmluft/ }));

    expect(screen.getByRole('radio', { name: /Varmluft/ })).toHaveAttribute('aria-checked', 'true');
    expectResult(190, 16);
  });

  it('oppdaterer tiden ved full kurv', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('radio', { name: /Full kurv/ }));

    expectResult(180, 18);
  });

  it('endrer tid med hurtigknapper', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: '45 min' }));

    expect(screen.getByRole('button', { name: '45 min' })).toHaveAttribute('aria-pressed', 'true');
    expectResult(180, 36);
  });

  it('endrer temperatur med − og + fra tastaturet', async () => {
    const user = userEvent.setup();
    render(<App />);

    screen.getByRole('button', { name: 'Mer temperatur i oppskriften' }).focus();
    await user.keyboard('{Enter}');
    expectResult(185, 16);

    screen.getByRole('button', { name: 'Mindre temperatur i oppskriften' }).focus();
    await user.keyboard('{Enter}{Enter}');
    expectResult(175, 16);
  });

  it('endrer temperatur med − og + ved trykk', () => {
    render(<App />);
    const plus = screen.getByRole('button', { name: 'Mer temperatur i oppskriften' });

    fireEvent.pointerDown(plus, { button: 0 });
    fireEvent.pointerUp(plus);

    expectResult(185, 16);
  });

  it('endrer verdier med slideren', () => {
    render(<App />);

    fireEvent.change(screen.getByRole('slider', { name: 'Tid i oppskriften' }), {
      target: { value: '60' },
    });

    expectResult(180, 48);
  });

  it('viser maksgrense-notis over 200 °C', () => {
    render(<App />);
    expect(screen.queryByRole('note')).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole('slider', { name: 'Temperatur i oppskriften' }), {
      target: { value: '250' },
    });

    // Ønsket 230 °C kuttes til 200 °C, så 16 min økes med 23 % til 20 min.
    expectResult(200, 20);
    expect(screen.getByRole('note')).toHaveTextContent('200 °C');
    expect(screen.getByRole('note')).toHaveTextContent('tiden er økt 23 %');
  });

  it('deaktiverer + ved maks og − ved min', () => {
    render(<App />);
    const slider = screen.getByRole('slider', { name: 'Temperatur i oppskriften' });

    fireEvent.change(slider, { target: { value: '250' } });
    expect(screen.getByRole('button', { name: 'Mer temperatur i oppskriften' })).toBeDisabled();

    fireEvent.change(slider, { target: { value: '150' } });
    expect(screen.getByRole('button', { name: 'Mindre temperatur i oppskriften' })).toBeDisabled();
  });

  it('flytter valget med piltaster i ovnstype', async () => {
    const user = userEvent.setup();
    render(<App />);

    screen.getByRole('radio', { name: /Over-\/undervarme/ }).focus();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('radio', { name: /Varmluft/ })).toHaveFocus();
    expectResult(190, 16);
  });
});

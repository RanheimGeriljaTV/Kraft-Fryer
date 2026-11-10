import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('viser tittel og tilbakelenke til ranheimkraft.no', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Kraft-Fryer');
    expect(screen.getByRole('link', { name: /Ranheim Kraft/i })).toHaveAttribute(
      'href',
      'https://ranheimkraft.no/',
    );
  });

  it('viser versjonsnummer og lenke for feilrapportering i bunnteksten', () => {
    render(<App />);

    expect(screen.getByText(new RegExp(`v${__APP_VERSION__}`))).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Rapporter feil/i })).toHaveAttribute(
      'href',
      expect.stringContaining('/issues/new'),
    );
  });

  // Relativ sti (./) i bygget kontrolleres ikke her: Vitest kjører i utviklingsmodus,
  // der BASE_URL alltid er «/».
  it('viser isbjørnen fra public/', () => {
    render(<App />);

    expect(screen.getByAltText('Ranheim-isbjørnen')).toHaveAttribute(
      'src',
      `${import.meta.env.BASE_URL}logo-320.webp`,
    );
  });
});

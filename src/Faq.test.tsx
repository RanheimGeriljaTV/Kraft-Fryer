import { render, screen } from '@testing-library/react';
import App from './App';
import { FAQ } from './data/faq';

describe('Spørsmål og svar', () => {
  it('viser alle spørsmål og svar, og hovedordet i h1', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 2, name: 'Spørsmål og svar' })).toBeInTheDocument();
    for (const { question, answer } of FAQ) {
      expect(screen.getByRole('heading', { level: 3, name: question })).toBeInTheDocument();
      expect(screen.getByText(answer)).toBeInTheDocument();
    }
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/stekeovn til airfryer/i);
  });
});

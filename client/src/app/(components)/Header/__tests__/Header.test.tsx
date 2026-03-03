import { render, screen } from '@testing-library/react';
import Header from '../index';

describe('Header Component', () => {
  it('renders the header with the correct name', () => {
    render(<Header name='Test Header' />);
    expect(screen.getByText('Test Header')).toBeInTheDocument();
  });

  it('renders as an h1 element', () => {
    render(<Header name='Products' />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Products');
  });

  it('applies correct styling classes', () => {
    render(<Header name='Inventory' />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-2xl', 'font-semibold');
  });
});

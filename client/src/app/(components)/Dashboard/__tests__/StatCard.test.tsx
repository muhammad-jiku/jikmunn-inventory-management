import { render, screen } from '@testing-library/react';
import { TrendingUp } from 'lucide-react';
import StatCard from '../StatCard';

describe('StatCard', () => {
  const defaultProps = {
    title: 'Revenue',
    primaryIcon: <span data-testid='primary-icon'>$</span>,
    dateRange: 'Jan 1 - Jan 31',
    details: [
      {
        title: 'Total Revenue',
        amount: '$10,000',
        changePercentage: 15,
        IconComponent: TrendingUp,
      },
      {
        title: 'Expenses',
        amount: '$3,000',
        changePercentage: -5,
        IconComponent: TrendingUp,
      },
    ],
  };

  it('should render title and date range', () => {
    render(<StatCard {...defaultProps} />);

    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Jan 1 - Jan 31')).toBeInTheDocument();
  });

  it('should render all detail items', () => {
    render(<StatCard {...defaultProps} />);

    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('$10,000')).toBeInTheDocument();
    expect(screen.getByText('Expenses')).toBeInTheDocument();
    expect(screen.getByText('$3,000')).toBeInTheDocument();
  });

  it('should render primary icon', () => {
    render(<StatCard {...defaultProps} />);

    expect(screen.getByTestId('primary-icon')).toBeInTheDocument();
  });

  it('should show positive change with + prefix', () => {
    render(<StatCard {...defaultProps} />);

    expect(screen.getByText('+15%')).toBeInTheDocument();
  });

  it('should show negative change without + prefix', () => {
    render(<StatCard {...defaultProps} />);

    expect(screen.getByText('-5%')).toBeInTheDocument();
  });

  it('should apply green color for positive changes', () => {
    render(<StatCard {...defaultProps} />);

    const positiveEl = screen.getByText('+15%');
    expect(positiveEl.className).toContain('text-green-500');
  });

  it('should apply red color for negative changes', () => {
    render(<StatCard {...defaultProps} />);

    const negativeEl = screen.getByText('-5%');
    expect(negativeEl.className).toContain('text-red-500');
  });

  it('should render separator between detail items', () => {
    const { container } = render(<StatCard {...defaultProps} />);

    // There should be separators: 1 main + (details.length - 1)
    const hrs = container.querySelectorAll('hr');
    expect(hrs.length).toBeGreaterThanOrEqual(2); // 1 header + 1 between details
  });
});

import { render } from '@testing-library/react';
import Rating from '../index';

describe('Rating Component', () => {
  it('renders 5 stars', () => {
    const { container } = render(<Rating rating={3} />);
    const stars = container.querySelectorAll('svg');
    expect(stars).toHaveLength(5);
  });

  it('highlights correct number of stars for rating 4', () => {
    const { container } = render(<Rating rating={4} />);
    const stars = container.querySelectorAll('svg');
    expect(stars).toHaveLength(5);
    // lucide-react passes color as stroke attribute on SVG
    const coloredStars = Array.from(stars).filter(
      (star) => star.getAttribute('stroke') === '#FFC107'
    );
    expect(coloredStars).toHaveLength(4);
  });

  it('renders all grey stars for rating 0', () => {
    const { container } = render(<Rating rating={0} />);
    const stars = container.querySelectorAll('svg');
    const greyStars = Array.from(stars).filter(
      (star) => star.getAttribute('stroke') === '#E4E5E9'
    );
    expect(greyStars).toHaveLength(5);
  });
});

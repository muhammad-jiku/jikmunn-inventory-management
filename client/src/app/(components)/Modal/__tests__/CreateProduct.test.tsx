import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CreateProduct from '../CreateProduct';

describe('CreateProduct Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onCreate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render nothing when isOpen is false', () => {
    const { container } = render(
      <CreateProduct {...defaultProps} isOpen={false} />
    );

    expect(container.innerHTML).toBe('');
  });

  it('should render the form when isOpen is true', () => {
    render(<CreateProduct {...defaultProps} />);

    expect(screen.getByText('Create New Product')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Price')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Stock Quantity')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Rating (0-5)')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Low stock alert threshold')
    ).toBeInTheDocument();
  });

  it('should render Create and Cancel buttons', () => {
    render(<CreateProduct {...defaultProps} />);

    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should call onClose when Cancel is clicked', () => {
    render(<CreateProduct {...defaultProps} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should submit form with valid data', async () => {
    render(<CreateProduct {...defaultProps} />);

    fireEvent.change(screen.getByPlaceholderText('Name'), {
      target: { value: 'Test Product' },
    });
    fireEvent.change(screen.getByPlaceholderText('Price'), {
      target: { value: '29.99' },
    });
    fireEvent.change(screen.getByPlaceholderText('Stock Quantity'), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByPlaceholderText('Rating (0-5)'), {
      target: { value: '4' },
    });

    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(defaultProps.onCreate).toHaveBeenCalled();
    });
  });

  it('should render all form labels', () => {
    render(<CreateProduct {...defaultProps} />);

    expect(screen.getByText('Product Name')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Stock Quantity')).toBeInTheDocument();
    expect(screen.getByText('Rating')).toBeInTheDocument();
    expect(screen.getByText('Low Stock Threshold')).toBeInTheDocument();
  });
});

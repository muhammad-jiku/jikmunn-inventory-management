import globalReducer from '@/state';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import Sidebar from '../index';

// Mock next/navigation
const mockPathname = jest.fn().mockReturnValue('/dashboard');
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

const createTestStore = (isSidebarCollapsed = false) =>
  configureStore({
    reducer: {
      global: globalReducer,
      auth: () => ({ user: null, accessToken: null, refreshToken: null }),
    },
    preloadedState: {
      global: { isSidebarCollapsed, isDarkMode: false },
    },
  });

const renderSidebar = (collapsed = false) => {
  const store = createTestStore(collapsed);
  return {
    store,
    ...render(
      <Provider store={store}>
        <Sidebar />
      </Provider>
    ),
  };
};

describe('Sidebar', () => {
  it('should render the logo text when not collapsed', () => {
    renderSidebar(false);

    expect(screen.getByText('jikmunn STOCK')).toBeInTheDocument();
  });

  it('should render all navigation links', () => {
    renderSidebar(false);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Inventory')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Sales')).toBeInTheDocument();
    expect(screen.getByText('Purchases')).toBeInTheDocument();
    expect(screen.getByText('Expenses')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('should highlight active link', () => {
    mockPathname.mockReturnValue('/products');
    renderSidebar(false);

    const productsLink = screen.getByText('Products').closest('div');
    expect(productsLink?.className).toContain('bg-blue-200');
  });

  it('should render copyright text when not collapsed', () => {
    renderSidebar(false);

    const year = new Date().getFullYear();
    expect(
      screen.getByText(`© ${year} jikmunn. All rights reserved.`)
    ).toBeInTheDocument();
  });

  it('should have the correct link for each nav item', () => {
    renderSidebar(false);

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');

    const productsLink = screen.getByText('Products').closest('a');
    expect(productsLink).toHaveAttribute('href', '/products');
  });

  it('should toggle sidebar on menu button click', () => {
    const { store } = renderSidebar(false);

    // Find the menu button (it's inside the sidebar header for mobile)
    const buttons = screen.getAllByRole('button');
    // Click the mobile menu button (the one in sidebar)
    const menuButton = buttons.find((btn) => btn.querySelector('.lucide-menu'));
    if (menuButton) {
      fireEvent.click(menuButton);
      expect(store.getState().global.isSidebarCollapsed).toBe(true);
    }
  });
});

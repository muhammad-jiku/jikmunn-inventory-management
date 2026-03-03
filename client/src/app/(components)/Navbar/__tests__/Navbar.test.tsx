/* eslint-disable @typescript-eslint/no-unused-vars */
import globalReducer from '@/state';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import Navbar from '../index';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/dashboard',
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

// Mock CommandPalette
jest.mock('../../CommandPalette', () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid='command-palette'>Search Open</div> : null,
}));

const createTestStore = (overrides = {}) =>
  configureStore({
    reducer: {
      global: globalReducer,
      auth: () => ({
        user: {
          userId: 'u1',
          name: 'John',
          email: 'john@test.com',
          role: 'admin',
        },
        accessToken: 'token',
        refreshToken: 'refresh',
        ...overrides,
      }),
    },
    preloadedState: {
      global: { isSidebarCollapsed: false, isDarkMode: false },
    },
  });

const renderNavbar = (authOverrides = {}) => {
  const store = createTestStore(authOverrides);
  return {
    store,
    ...render(
      <Provider store={store}>
        <Navbar />
      </Provider>
    ),
  };
};

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render search button', () => {
    renderNavbar();

    expect(screen.getByText('Search…')).toBeInTheDocument();
  });

  it('should render user name', () => {
    renderNavbar();

    expect(screen.getByText('John')).toBeInTheDocument();
  });

  it('should render user role badge', () => {
    renderNavbar();

    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('should show Guest when no user', () => {
    const store = configureStore({
      reducer: {
        global: globalReducer,
        auth: () => ({ user: null, accessToken: null, refreshToken: null }),
      },
      preloadedState: {
        global: { isSidebarCollapsed: false, isDarkMode: false },
      },
    });

    render(
      <Provider store={store}>
        <Navbar />
      </Provider>
    );

    expect(screen.getByText('Guest')).toBeInTheDocument();
  });

  it('should open command palette when search button is clicked', () => {
    renderNavbar();

    fireEvent.click(screen.getByText('Search…'));

    expect(screen.getByTestId('command-palette')).toBeInTheDocument();
  });

  it('should render settings link', () => {
    renderNavbar();

    const settingsLink = screen.getByRole('link', { name: '' });
    // Any link pointing to /settings
    const allLinks = screen.getAllByRole('link');
    const settingsLinkEl = allLinks.find(
      (link) => link.getAttribute('href') === '/settings'
    );
    expect(settingsLinkEl).toBeTruthy();
  });

  it('should have Ctrl+K keyboard shortcut text', () => {
    renderNavbar();

    expect(screen.getByText('Ctrl+K')).toBeInTheDocument();
  });
});

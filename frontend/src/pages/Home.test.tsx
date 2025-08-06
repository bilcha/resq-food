import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Home from './Home';

// Mock the auth store
vi.mock('../store/auth', () => ({
  useAuthStore: vi.fn(() => ({
    user: null,
    business: null,
    isAuthenticated: false,
    isAdmin: false,
    initAuth: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  })),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Home', () => {
  it('renders the hero section with title', () => {
    renderWithRouter(<Home />);
    
    // Check if the hero title is rendered (using the translation key as fallback)
    expect(screen.getByText('home.hero_title')).toBeInTheDocument();
  });

  it('renders the hero subtitle', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByText('home.hero_subtitle')).toBeInTheDocument();
  });

  it('renders browse listings link', () => {
    renderWithRouter(<Home />);
    
    const browseLinks = screen.getAllByText('common.browse_listings');
    expect(browseLinks).toHaveLength(2); // One in hero, one in CTA
    expect(browseLinks[0].closest('a')).toHaveAttribute('href', '/listings');
  });

  it('renders register business link', () => {
    renderWithRouter(<Home />);
    
    const registerLink = screen.getByText('navigation.register_business');
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
  });

  it('renders features section', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByText('common.how_it_works')).toBeInTheDocument();
    expect(screen.getByText('home.features_subtitle')).toBeInTheDocument();
  });

  it('renders all three feature steps', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByText('home.step1_title')).toBeInTheDocument();
    expect(screen.getByText('home.step2_title')).toBeInTheDocument();
    expect(screen.getByText('home.step3_title')).toBeInTheDocument();
  });

  it('renders CTA section', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByText('common.ready_to_start')).toBeInTheDocument();
    expect(screen.getByText('home.cta_subtitle')).toBeInTheDocument();
  });

  it('renders multiple browse listings links', () => {
    renderWithRouter(<Home />);
    
    const browseLinks = screen.getAllByText('common.browse_listings');
    expect(browseLinks).toHaveLength(2); // One in hero, one in CTA
  });
}); 
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { Menu, X, LogOut, Settings, Building2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../ui/LanguageSwitcher';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { business, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-xl font-bold text-gray-900">ResQ Food</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              {t('navigation.home')}
            </Link>
            <Link
              to="/listings"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              {t('navigation.listings')}
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              {t('navigation.about')}
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              {t('navigation.contact')}
            </Link>
          </nav>

          {/* Business Name Display */}
          {isAuthenticated && business?.name && (
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-primary-50 rounded-lg border border-primary-200">
              <Building2 size={16} className="text-primary-600" />
              <span className="text-sm font-medium text-primary-700">
                {business.name}
              </span>
            </div>
          )}

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/business-dashboard"
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <Settings size={18} />
                  <span>{t('navigation.dashboard')}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut size={18} />
                  <span>{t('navigation.logout')}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  {t('navigation.login')}
                </Link>
                <Link to="/register" className="btn btn-primary">
                  {t('navigation.register_business')}
                </Link>
              </div>
            )}

            {/* Language Switcher */}
            <LanguageSwitcher />
          </div>

          {/* Mobile menu button */}
          <button
            aria-label='Toggle menu'
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-4">
            <Link
              to="/"
              className="block text-gray-700 hover:text-primary-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('navigation.home')}
            </Link>
            <Link
              to="/listings"
              className="block text-gray-700 hover:text-primary-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('navigation.listings')}
            </Link>
            <Link
              to="/about"
              className="block text-gray-700 hover:text-primary-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('navigation.about')}
            </Link>
            <Link
              to="/contact"
              className="block text-gray-700 hover:text-primary-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('navigation.contact')}
            </Link>

            {/* Mobile Business Name Display */}
            {isAuthenticated && business?.name && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-primary-50 rounded-lg border border-primary-200">
                <Building2 size={16} className="text-primary-600" />
                <span className="text-sm font-medium text-primary-700">
                  {business.name}
                </span>
              </div>
            )}

            {isAuthenticated ? (
              <div className="space-y-4 border-t border-gray-200 pt-4">
                <Link
                  to="/business-dashboard"
                  className="block text-gray-700 hover:text-primary-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('navigation.dashboard')}
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-700 hover:text-red-600 transition-colors"
                >
                  {t('navigation.logout')}
                </button>
              </div>
            ) : (
              <div className="space-y-4 border-t border-gray-200 pt-4">
                <Link
                  to="/login"
                  className="block text-gray-700 hover:text-primary-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('navigation.login')}
                </Link>
                <Link
                  to="/register"
                  className="block btn btn-primary w-full text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('navigation.register_business')}
                </Link>
              </div>
            )}

            {/* Mobile Language Switcher */}
            <div className="border-t border-gray-200 pt-4">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

export function Header({ onNavigate, currentPage = 'home' }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: '시설찾기', page: 'facilities' },
    { name: '구인구직', page: 'jobs' },
    { name: '커뮤니티', page: 'community' },
    { name: '코디네이터', page: 'coordinator' },
    { name: '건강평가', page: 'health-assessment' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-border-light">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              {/* Brand Logo Icon */}
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <button 
                onClick={() => onNavigate?.('home')}
                className="text-text-main font-bold text-lg tracking-tight hover:text-primary transition-colors"
              >
                Elderberry
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => onNavigate?.(item.page)}
                className={`transition-colors duration-200 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-50 ${
                  currentPage === item.page 
                    ? 'text-primary bg-primary/10' 
                    : 'text-text-muted hover:text-primary'
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <button 
              onClick={() => onNavigate?.('login')}
              className="text-text-muted hover:text-text-main transition-colors duration-200 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              Log in
            </button>
            <button 
              onClick={() => onNavigate?.('signup')}
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm"
            >
              Sign up
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-text-muted hover:text-text-main transition-colors duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-border-light bg-white/95">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => onNavigate?.(item.page)}
                  className={`block w-full text-left px-3 py-2 transition-colors duration-200 text-sm font-medium rounded-lg hover:bg-gray-50 ${
                    currentPage === item.page 
                      ? 'text-primary bg-primary/10' 
                      : 'text-text-muted hover:text-primary'
                  }`}
                >
                  {item.name}
                </button>
              ))}
              <div className="flex flex-col space-y-2 px-3 pt-4">
                <button 
                  onClick={() => onNavigate?.('login')}
                  className="text-left text-text-muted hover:text-text-main transition-colors duration-200 text-sm font-medium"
                >
                  Log in
                </button>
                <button 
                  onClick={() => onNavigate?.('signup')}
                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 text-left"
                >
                  Sign up
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
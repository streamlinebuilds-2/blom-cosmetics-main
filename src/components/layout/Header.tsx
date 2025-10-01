import React, { useState } from 'react';
import { Container } from './Container';
import { Button } from '../ui/Button';
import { User, Menu, X, ShoppingBag } from 'lucide-react';
import { CartButton } from '../cart/CartButton';
import { AnnouncementSignup } from './AnnouncementSignup';

interface HeaderProps {
  showMobileMenu?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ showMobileMenu = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    try {
      const currentPath = window.location.pathname.replace(/\/$/, '');
      const targetPath = href.replace(/\/$/, '');
      const isSamePage = currentPath === targetPath;

      // Always intercept to apply smooth scroll effect for consistency
      e.preventDefault();

      // Smooth scroll to top first
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Close mobile menu if open
      if (isMobileMenuOpen) setIsMobileMenuOpen(false);

      // If navigating to a different page, perform navigation after brief delay
      if (!isSamePage) {
        const delayMs = 500; // allow scroll animation to be perceived

        // Show page transition overlay to avoid white flash and keep continuity
        const overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';
        document.body.appendChild(overlay);

        // Ensure overlay remains during unload
        const beforeUnload = () => {
          try { document.body.appendChild(overlay); } catch {}
        };
        window.addEventListener('beforeunload', beforeUnload, { once: true });

        window.setTimeout(() => {
          window.location.assign(href);
        }, delayMs);
      }
      // If same page, the smooth scroll already achieved the effect
    } catch {
      // no-op safeguard
    }
  };

  const navigationItems = [
    {
      name: 'HOME',
      href: '/'
    },
    {
      name: 'SHOP',
      href: '/shop'
    },
    {
      name: 'COURSES & BLOG',
      href: '/courses'
    },
    {
      name: 'ABOUT',
      href: '/about'
    },
    {
      name: 'CONTACT',
      href: '/contact'
    }
  ];

  // Get current page for active highlighting
  const getCurrentPath = () => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.replace(/\/$/, '') || '/';
    }
    return '/';
  };

  const currentPath = getCurrentPath();

  return (
    <>
      <AnnouncementSignup />

      {/* Main Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <Container>
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="/" className="text-2xl font-bold text-gray-900 header-logo" onClick={(e) => handleNavClick(e, '/')}>
                <img src="/blom_logo.webp" alt="BLOM Cosmetics" className="h-10" />
              </a>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => {
                const isActive = currentPath === item.href;
                return (
                  <div key={item.name} className="relative group">
                    <a
                      href={item.href}
                      className={`px-3 py-2 text-sm font-medium header-nav transition-colors ${
                        isActive 
                          ? 'bg-blue-100 text-gray-900 rounded-md' 
                          : 'text-gray-700 hover:text-gray-900'
                      }`}
                      onClick={(e) => handleNavClick(e, item.href)}
                    >
                      {item.name}
                    </a>

                  {/* Dropdown/Mega Menu */}
                  {(item.dropdown || item.megaMenu) && (
                    <div className="absolute top-full left-0 mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      {item.dropdown && (
                        <div className="bg-white rounded-lg shadow-lg border py-2 min-w-48">
                          {item.dropdown.map((subItem) => (
                            <a
                              key={subItem.name}
                              href={subItem.href}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-400"
                            >
                              {subItem.name}
                            </a>
                          ))}
                        </div>
                      )}

                      {item.megaMenu && (
                        <div className="bg-white rounded-lg shadow-lg border p-6 w-96 lg:w-[800px]">
                          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                            {item.megaMenu.columns.map((column) => (
                              <div key={column.title}>
                                <h4 className="font-semibold text-gray-900 mb-3">
                                  {column.title}
                                </h4>
                                <ul className="space-y-2">
                                  {column.items.map((subItem) => (
                                    <li key={subItem.name}>
                                      <a
                                        href={subItem.href}
                                        className="text-sm text-gray-600 hover:text-pink-400 transition-colors"
                                      >
                                        {subItem.name}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            </nav>

            {/* Action Icons */}
            <div className="flex items-center space-x-4">
              <a
                href="/account"
                className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
                onClick={(e) => handleNavClick(e, '/account')}
                aria-label="Account"
              >
                <User className="h-5 w-5" />
              </a>
              <CartButton />

              {/* Mobile menu button */}
              {showMobileMenu && (
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 text-gray-400 hover:text-gray-500"
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              )}
            </div>
          </div>
        </Container>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div
            id="mobile-menu"
            className={`lg:hidden border-t bg-white shadow-lg overflow-hidden transition-all duration-300 ease-out ${
              isMobileMenuOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
            }`}
            aria-hidden={!isMobileMenuOpen}
          >
            <Container>
              <div className="py-6 space-y-1">
                {navigationItems.map((item) => (
                  <div key={item.name}>
                    <a
                      href={item.href}
                      className="block py-3 px-4 text-gray-700 hover:text-pink-400 hover:bg-pink-50 font-medium rounded-lg transition-colors"
                      onClick={(e) => handleNavClick(e, item.href)}
                    >
                      {item.name}
                    </a>
                    {item.dropdown && (
                      <div className="pl-6 space-y-1">
                        {item.dropdown.map((subItem) => (
                          <a
                            key={subItem.name}
                            href={subItem.href}
                            className="block py-2 text-sm text-gray-600 hover:text-pink-400 hover:bg-pink-50 rounded-lg transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {subItem.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Mobile Contact Info */}
                <div className="pt-6 border-t mt-6 bg-gray-50 -mx-4 px-4 py-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Contact Info</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 flex items-center">
                      <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                      shopblomcosmetics@gmail.com
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                      +27 79 548 3317
                    </p>
                  </div>
                </div>
              </div>
            </Container>
          </div>
        )}
      </header>
    </>
  );
};

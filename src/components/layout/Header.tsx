import React, { useState, useEffect } from 'react';
import { Container } from './Container';
import { User, Menu, X, Minus, Plus } from 'lucide-react';
import { CartButton } from '../cart/CartButton';
import { WishlistButton } from '../wishlist/WishlistButton';
import { AnnouncementSignup } from './AnnouncementSignup';
import { AnnouncementBar } from './AnnouncementBar';

interface HeaderProps {
  showMobileMenu?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ showMobileMenu = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // Mobile Accordion State for Shop
  const [isShopExpanded, setIsShopExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsScrolledDown(true);
      } else {
        // Scrolling up
        setIsScrolledDown(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Allow default behavior for external links or if we want standard navigation
    // But for SPA feel and smooth scroll reset:
    
    const isSamePage = window.location.pathname === href.split('?')[0] && href.split('?')[0] === '/shop';

    if (isSamePage && href.includes('?category=')) {
       // We are on shop page and clicking a category filter
       // Let the browser handle the history push, but we might want to close menu
       setIsMobileMenuOpen(false);
       window.scrollTo({ top: 0, behavior: 'smooth' });
       return; // Let default anchor click happen so URL updates
    }

    // For other navigations
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigationItems = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Courses & Blog', href: '/courses' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ];

  const shopCategories = [
    { name: 'Shop All', href: '/shop' },
    { name: 'Acrylic System', href: '/shop?category=acrylic-system' },
    { name: 'Gel System', href: '/shop?category=gel-system' },
    { name: 'Prep & Finishing', href: '/shop?category=prep-finishing' },
    { name: 'Tools & Essentials', href: '/shop?category=tools-essentials' },
    { name: 'Nail Art', href: '/shop?category=nail-art' },
    { name: 'Bundle Deals', href: '/shop?category=bundle-deals' },
    { name: 'Furniture', href: '/shop?category=furniture' }
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
      <AnnouncementBar />
      <AnnouncementSignup />

      {/* Main Header */}
      <header className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        isScrolledDown 
          ? 'bg-white/40 backdrop-blur-md shadow-lg' 
          : 'bg-white shadow-sm'
      }`}>
        <Container>
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu button - Left side (mobile only) */}
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

            {/* Logo - Left on desktop, center on mobile */}
            <div className="flex-shrink-0 lg:flex-shrink-0 lg:flex-none flex-1 flex justify-center lg:justify-start">
              <a href="/" className="text-2xl font-bold text-gray-900 header-logo" onClick={(e) => handleNavClick(e, '/')}>
                <img src="/blom_logo.webp" alt="BLOM Cosmetics" className="h-12 md:h-10" />
              </a>
            </div>

            {/* Desktop Navigation - Center */}
            <nav className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
              {navigationItems.map((item) => {
                const isActive = currentPath === item.href;
                return (
                  <div key={item.name} className="relative group">
                    <a
                      href={item.href}
                      className={`px-4 py-2 text-sm font-medium transition-all duration-200 relative ${
                        isActive 
                          ? 'text-gray-900 rounded-md' 
                          : 'text-gray-700 hover:text-gray-900'
                      }`}
                      style={{
                        backgroundColor: isActive ? '#CEE5FF' : 'transparent'
                      }}
                      onClick={(e) => handleNavClick(e, item.href)}
                    >
                      {item.name}
                      <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-pink-400 transition-all duration-200 opacity-0 group-hover:opacity-100"></span>
                      <span className={`absolute inset-0 bg-pink-50 rounded-md transition-all duration-200 -z-10 ${
                        isActive ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
                      }`}></span>
                    </a>
                  </div>
                );
              })}
            </nav>

            {/* Action Icons - Right side */}
            <div className="flex items-center space-x-4">
              <a
                href="/account"
                className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
                onClick={(e) => {
                  // Standard link behavior for account check
                }}
                aria-label="Account"
              >
                <User className="h-5 w-5" />
              </a>
              <WishlistButton />
              <CartButton />
            </div>
          </div>
        </Container>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div
            id="mobile-menu"
            className={`lg:hidden border-t bg-white shadow-lg overflow-hidden transition-all duration-300 ease-out fixed inset-0 top-[105px] z-40 overflow-y-auto ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            style={{ height: 'calc(100vh - 105px)' }} // Adjust based on header height
            aria-hidden={!isMobileMenuOpen}
          >
            <div className="bg-white h-full pb-20">
              <div className="py-2">
                {navigationItems.map((item) => {
                  if (item.name === 'Shop') {
                    return (
                      <div key={item.name} className="py-2 border-b border-gray-50">
                        <button 
                          onClick={() => setIsShopExpanded(!isShopExpanded)}
                          className="flex items-center justify-between w-full px-6 py-3 text-left hover:bg-gray-50"
                        >
                          <span className="text-black text-base font-medium">{item.name}</span>
                          {isShopExpanded ? <Minus className="w-4 h-4 text-gray-900" /> : <Plus className="w-4 h-4 text-gray-900" />}
                        </button>
                        
                        <div className={`overflow-hidden transition-all duration-300 ${isShopExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                          <div className="bg-gray-50 py-2">
                            {shopCategories.map((subItem, subIndex) => (
                              <a
                                key={subIndex}
                                href={subItem.href}
                                className="block py-2.5 px-10 text-gray-600 text-sm hover:text-black transition-colors border-l-2 border-transparent hover:border-black"
                                onClick={(e) => handleNavClick(e, subItem.href)}
                              >
                                {subItem.name}
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      className="block py-4 px-6 text-black text-base font-medium hover:bg-gray-50 transition-colors border-b border-gray-50"
                      onClick={(e) => handleNavClick(e, item.href)}
                    >
                      {item.name}
                    </a>
                  );
                })}
              </div>
              
              {/* Footer Links in Menu */}
              <div className="border-t border-gray-100 mt-4 pt-4 px-6 pb-8">
                 <div className="flex flex-col space-y-3">
                    <a href="/login" className="text-gray-500 text-sm">Log in</a>
                    <a href="/signup" className="text-gray-500 text-sm">Create account</a>
                 </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

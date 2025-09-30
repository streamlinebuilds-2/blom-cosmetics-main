import React, { useState } from 'react';
import { Container } from './Container';
import { Button } from '../ui/Button';
import { Search, User, Menu, X } from 'lucide-react';
import { CartButton } from '../cart/CartButton';

interface HeaderProps {
  showMobileMenu?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ showMobileMenu = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      name: 'HOME',
      href: '/'
    },
    {
      name: 'SHOP',
      href: '/shop',
      megaMenu: {
        columns: [
          {
            title: 'Acrylic System',
            items: [
              { name: 'Acrylic Powders', href: '/shop/acrylic-powders' },
              { name: 'Liquid Monomers', href: '/shop/liquid-monomers' },
              { name: 'Acrylic Brushes', href: '/shop/acrylic-brushes' },
              { name: 'Sculpting Forms', href: '/shop/sculpting-forms' }
            ]
          },
          {
            title: 'Gel System',
            items: [
              { name: 'Gel Polish', href: '/shop/gel-polish' },
              { name: 'Base Coats', href: '/shop/base-coats' },
              { name: 'Top Coats', href: '/shop/top-coats' },
              { name: 'LED Lamps', href: '/shop/led-lamps' }
            ]
          },
          {
            title: 'Prep & Finishing',
            items: [
              { name: 'Primers', href: '/shop/primers' },
              { name: 'Cleansers', href: '/shop/cleansers' },
              { name: 'Cuticle Care', href: '/shop/cuticle-care' },
              { name: 'Nail Art', href: '/shop/nail-art' }
            ]
          },
          {
            title: 'Tools & Essentials',
            items: [
              { name: 'Files & Buffers', href: '/shop/files-buffers' },
              { name: 'Electric Files', href: '/shop/electric-files' },
              { name: 'Professional Kits', href: '/shop/professional-kits' },
              { name: 'Accessories', href: '/shop/accessories' }
            ]
          }
        ]
      }
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

  return (
    <>
      {/* Announcement Banner */}
      <div className="bg-gradient-to-r from-pink-400 to-blue-300 text-white text-center py-2 px-4">
        <p className="text-sm font-medium">
          Join the BLOM Beauty Club & Get 15% Off Your First Order
        </p>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <Container>
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="/" className="text-2xl font-bold text-gradient">
                BLOM
              </a>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <div key={item.name} className="relative group">
                  <a
                    href={item.href}
                    className="text-gray-700 hover:text-pink-400 px-3 py-2 text-sm font-medium transition-colors"
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
              ))}
            </nav>

            {/* Action Icons */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Search className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <User className="h-5 w-5" />
              </button>
              <CartButton />

              {/* Mobile menu button */}
              {showMobileMenu && (
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 text-gray-400 hover:text-gray-500"
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
        {showMobileMenu && isMobileMenuOpen && (
          <div className="lg:hidden border-t bg-white">
            <Container>
              <div className="py-4 space-y-2">
                {navigationItems.map((item) => (
                  <div key={item.name}>
                    <a
                      href={item.href}
                      className="block py-2 text-gray-700 hover:text-pink-400 font-medium"
                    >
                      {item.name}
                    </a>
                    {item.dropdown && (
                      <div className="pl-4 space-y-1">
                        {item.dropdown.map((subItem) => (
                          <a
                            key={subItem.name}
                            href={subItem.href}
                            className="block py-1 text-sm text-gray-600 hover:text-pink-400"
                          >
                            {subItem.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Mobile Contact Info */}
                <div className="pt-4 border-t mt-4">
                  <p className="text-sm text-gray-600">shopblomcosmetics@gmail.com</p>
                  <p className="text-sm text-gray-600">+27 79 548 3317</p>
                </div>
              </div>
            </Container>
          </div>
        )}
      </header>
    </>
  );
};
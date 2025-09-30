import React, { useState } from 'react';
import { Container } from './Container';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ChevronDown } from 'lucide-react';

export const Footer: React.FC = () => {
  const [isSupportDropdownOpen, setIsSupportDropdownOpen] = useState(false);
  const footerLinks = {
    shop: [],
    courses: [],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Story', href: '/about#story' },
      { name: 'Our Team', href: '/about#team' },
      { name: 'Our Mission', href: '/about#mission' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' }
    ],
    support: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'Customer Support', href: '/support' },
      { name: 'Shipping Info', href: '/shipping' },
      { name: 'Returns & Exchanges', href: '/returns' },
      { name: 'Size Guide', href: '/size-guide' },
      { name: 'FAQ', href: '/faq' }
    ]
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-pink-400 to-blue-300 text-white">
        <Container>
          <div className="py-12 text-center">
            <h3 className="text-2xl font-bold mb-4">Join the BLOM Beauty Club</h3>
            <p className="mb-6 text-blue-100">Get exclusive offers, tutorials, and nail art inspiration delivered to your inbox</p>
            <div className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="input-field flex-1 text-gray-900"
              />
              <button className="btn btn-secondary px-8">
                Subscribe
              </button>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Footer Content */}
      <Container>
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info & Contact */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Company Info */}
                <div>
                  <h3 className="text-2xl font-bold text-gradient mb-4">BLOM</h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    Empowering nail professionals with premium products and expert training.
                    Bloom, Blossom, Believe with BLOM Cosmetics.
                  </p>

              {/* Social Media moved to bottom bar */}
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="font-semibold text-white mb-4">Contact Info</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-pink-400 flex-shrink-0" />
                      <span className="text-sm text-gray-300">shopblomcosmetics@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-pink-400 flex-shrink-0" />
                      <span className="text-sm text-gray-300">+27 79 548 3317</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-pink-400 flex-shrink-0" />
                      <span className="text-sm text-gray-300">South Africa</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shop, Education & Support */}
            <div className="lg:col-span-2">
              <div className="space-y-8 ml-8">
                {/* Mobile: Education and Shop side by side horizontally */}
                <div className="grid grid-cols-2 gap-6 lg:hidden">
                  {/* Education */}
                  <div>
                    <h4 className="font-semibold text-white mb-4">Education</h4>
                    <ul className="space-y-2">
                      {footerLinks.courses.map((link) => (
                        <li key={link.name}>
                          <a
                            href={link.href}
                            className="text-gray-400 hover:text-pink-400 transition-colors text-sm"
                          >
                            {link.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Shop Links */}
                  <div>
                    <h4 className="font-semibold text-white mb-4">Shop</h4>
                    <ul className="space-y-2">
                      {footerLinks.shop.map((link) => (
                        <li key={link.name}>
                          <a
                            href={link.href}
                            className="text-gray-400 hover:text-pink-400 transition-colors text-sm"
                          >
                            {link.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Desktop: Education */}
                <div className="hidden lg:block">
                  <h4 className="font-semibold text-white mb-4">Education</h4>
                  <ul className="space-y-2">
                    {footerLinks.courses.map((link) => (
                      <li key={link.name}>
                        <a
                          href={link.href}
                          className="text-gray-400 hover:text-pink-400 transition-colors text-sm"
                        >
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Desktop: Shop */}
                <div className="hidden lg:block">
                  <h4 className="font-semibold text-white mb-4">Shop</h4>
                  <ul className="space-y-2">
                    {footerLinks.shop.map((link) => (
                      <li key={link.name}>
                        <a
                          href={link.href}
                          className="text-gray-400 hover:text-pink-400 transition-colors text-sm"
                        >
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Support Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsSupportDropdownOpen(!isSupportDropdownOpen)}
                    className="flex items-center gap-2 font-semibold text-white mb-4 hover:text-pink-400 transition-colors"
                    aria-expanded={isSupportDropdownOpen}
                  >
                    Support
                    <ChevronDown className={`h-4 w-4 transition-transform ${isSupportDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <div
                    className={`absolute left-0 right-auto bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-2 min-w-48 z-10 transition-all duration-200 ease-out origin-bottom ${
                      isSupportDropdownOpen ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-2'
                    } ${'bottom-8'}`}
                    style={{ transformOrigin: 'bottom left' }}
                  >
                      {footerLinks.support.map((link) => (
                        <a
                          key={link.name}
                          href={link.href}
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-pink-400 transition-colors"
                        >
                          {link.name}
                        </a>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © 2024 BLOM Cosmetics. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="/privacy" className="text-gray-500 hover:text-pink-400 text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-gray-500 hover:text-pink-400 text-sm transition-colors">
                Terms of Service
              </a>
              <a href="/returns" className="text-gray-500 hover:text-pink-400 text-sm transition-colors">
                Returns Policy
              </a>
              {/* Social Media at bottom, slightly larger for visibility */}
              <div className="flex gap-3 ml-4">
                <a href="#" aria-label="Facebook" className="p-2.5 bg-gray-800 rounded-lg hover:bg-pink-400 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" aria-label="Instagram" className="p-2.5 bg-gray-800 rounded-lg hover:bg-pink-400 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" aria-label="Twitter" className="p-2.5 bg-gray-800 rounded-lg hover:bg-pink-400 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};
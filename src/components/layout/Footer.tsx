import React, { useEffect } from 'react';
import { Instagram, Facebook, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
  useEffect(() => {
    const el = document.getElementById('footer-year');
    if (el) el.textContent = String(new Date().getFullYear());
  }, []);

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-wrap">
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><a href="/">Home</a></li>
            <li><a href="/shop">Shop</a></li>
            <li><a href="/courses">Courses & Blog</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Customer Care</h4>
          <ul className="footer-links">
            <li><a href="/contact">Contact</a></li>
            <li><a href="/faq">FAQ</a></li>
            <li><a href="/shipping">Shipping</a></li>
            <li><a href="/returns">Returns & Refunds</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>About</h4>
          <ul className="footer-links">
            <li><a href="/about#story">Our Story</a></li>
            <li><a href="/courses">Education</a></li>
            <li><a href="/pro-services">Professional Services</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Connect</h4>
          <div className="footer-socials">
            <a aria-label="Instagram" className="social-link" href="#" target="_blank" rel="noopener"><Instagram className="h-4 w-4" /></a>
            <a aria-label="Facebook" className="social-link" href="#" target="_blank" rel="noopener"><Facebook className="h-4 w-4" /></a>
            <a aria-label="Twitter" className="social-link" href="#" target="_blank" rel="noopener"><Twitter className="h-4 w-4" /></a>
          </div>

          <h5 className="newsletter-title">Newsletter Signup</h5>
          <form className="newsletter" id="footer-newsletter" noValidate onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget as HTMLFormElement;
            const input = form.querySelector('input[type="email"]') as HTMLInputElement | null;
            const email = input?.value.trim() || '';
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('Please enter a valid email.'); return; }
            setTimeout(() => { alert('Thanks for subscribing!'); form.reset(); }, 400);
          }}>
            <input className="newsletter-input" type="email" placeholder="Your email" required />
            <button className="btn btn-blue" type="submit">Subscribe</button>
          </form>
          <p className="newsletter-helper">Get exclusive discounts + updates.</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© <span id="footer-year" /> BLOM Cosmetics. All rights reserved.</p>
        <nav className="footer-legal" aria-label="Legal links">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms & Conditions</a>
          <a href="/returns">Returns & Refunds</a>
        </nav>
      </div>
    </footer>
  );
};
import React, { useEffect } from 'react';
import { Instagram, Facebook, MessageCircle, Music } from 'lucide-react';

export const Footer: React.FC = () => {
  useEffect(() => {
    const y = document.getElementById('year');
    if (y) y.textContent = String(new Date().getFullYear());
  }, []);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector('input[type="email"]') as HTMLInputElement | null;
    const email = input?.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('Please enter a valid email.'); return; }
    setTimeout(() => { alert('Thanks for subscribing!'); input!.value = ''; }, 400);
  };

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
            <li><a href="/shop?q=best">Best Sellers</a></li>
            <li><a href="/shop?q=new">New Arrivals</a></li>
            <li><a href="/shop?q=sale">Sale</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Customer Care</h4>
          <ul className="footer-links">
            <li><a href="/contact">Contact</a></li>
            <li><a href="/faq">FAQ</a></li>
            <li><a href="/shipping">Shipping</a></li>
            <li><a href="/returns">Returns</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>About</h4>
          <ul className="footer-links">
            <li><a href="/about#story">Our Story</a></li>
            <li><a href="/courses">Education</a></li>
            <li><a href="/pro-services">Professional Services</a></li>
            <li><a href="/careers">Careers</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Connect</h4>
          <div className="footer-socials">
            <a aria-label="Instagram" href="https://instagram.com/yourhandle" target="_blank" rel="noopener" className="social-link">
              <Instagram className="h-6 w-6" strokeWidth={2} />
            </a>
            <a aria-label="Facebook" href="https://facebook.com/yourhandle" target="_blank" rel="noopener" className="social-link">
              <Facebook className="h-6 w-6" strokeWidth={2} />
            </a>
            <a aria-label="WhatsApp" href="https://wa.me/yourwhatsapp" target="_blank" rel="noopener" className="social-link">
              <MessageCircle className="h-6 w-6" strokeWidth={2} />
            </a>
            <a aria-label="TikTok" href="https://tiktok.com/@yourhandle" target="_blank" rel="noopener" className="social-link">
              <Music className="h-6 w-6" strokeWidth={2} />
            </a>
          </div>

          <h5 className="newsletter-title">Newsletter Signup</h5>
          <form className="newsletter" id="footer-newsletter" noValidate onSubmit={onSubmit}>
            <input className="newsletter-input" type="email" placeholder="Your email" required />
            <button className="btn btn-blue" type="submit">Subscribe</button>
          </form>
          <p className="newsletter-helper">Sign up for our newsletter and get exclusive discounts + updates.</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© <span id="year" /> BLOM Cosmetics. All rights reserved.</p>
        <nav className="footer-legal" aria-label="Legal links">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms & Conditions</a>
          <a href="/returns">Returns & Refunds</a>
          <a href="/track-order">Track Order</a>
        </nav>
      </div>
    </footer>
  );
};

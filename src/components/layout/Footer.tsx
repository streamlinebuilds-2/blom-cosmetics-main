import React, { useEffect } from 'react';

// Local social media icons (Lucide doesn't export these)
const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
  </svg>
);

const TikTokIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M21 8.5c-2.36-.46-4.3-1.88-5.35-3.9V16a6 6 0 1 1-6-6c.23 0 .46.01.68.04V12.5a3.5 3.5 0 1 0 3.5 3.5V2h3.05c.67 2.53 2.72 4.47 5.12 5.01V8.5z" />
  </svg>
);

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
            <a aria-label="Instagram" href="https://instagram.com/yourhandle" target="_blank" rel="noopener" className="social-link"><InstagramIcon className="h-5 w-5 icon" /></a>
            <a aria-label="Facebook" href="https://facebook.com/yourhandle" target="_blank" rel="noopener" className="social-link"><FacebookIcon className="h-5 w-5 icon" /></a>
            <a aria-label="WhatsApp" href="https://wa.me/yourwhatsapp" target="_blank" rel="noopener" className="social-link"><WhatsAppIcon className="h-5 w-5 icon" /></a>
            <a aria-label="TikTok" href="https://tiktok.com/@yourhandle" target="_blank" rel="noopener" className="social-link"><TikTokIcon className="h-5 w-5 icon" /></a>
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

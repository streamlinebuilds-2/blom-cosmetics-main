import React, { useEffect, useRef, useState } from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { promoIsLive } from '../../config/birthdayPromo';

// "Back in stock" announcement for the 500ml Nail Liquid.
// Modeled on the Beauty Club signup popup (AnnouncementSignup) so the styling
// stays consistent. It only appears if the product is genuinely in stock, so it
// auto-disables itself once the restock sells out.
//
// It shows on the first visit, then resurfaces every 3rd–5th visit (a fresh
// random interval each time) so returning shoppers get an occasional reminder
// without being nagged on every visit. A "visit" is counted once per browser
// session (sessionStorage), not per page navigation.

const PRODUCT_SLUG = '500ml-nail-liquid';
const VISITS_KEY = 'blom_restock_500ml_visits';
const SHOW_AT_KEY = 'blom_restock_500ml_show_at';
const SESSION_KEY = 'blom_restock_500ml_session';
const SHOW_DELAY_MS = 3500;

const readInt = (key: string, fallback: number): number => {
  try {
    const v = parseInt(localStorage.getItem(key) || '', 10);
    return Number.isFinite(v) ? v : fallback;
  } catch {
    return fallback;
  }
};

// Random interval of 3, 4 or 5 visits until the popup should reappear.
const nextInterval = (): number => 3 + Math.floor(Math.random() * 3);

interface RestockProduct {
  name: string;
  price: number;
  image: string;
  blurb: string;
}

const formatPrice = (value: number) =>
  `R${Number(value || 0).toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const BackInStockPopup: React.FC = () => {
  const [product, setProduct] = useState<RestockProduct | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Load the product and decide whether to show.
  useEffect(() => {
    // During the birthday promo, only the birthday popup shows — stay dormant.
    if (promoIsLive()) return;

    // Count this visit once per browser session.
    let visits = readInt(VISITS_KEY, 0);
    const showAt = readInt(SHOW_AT_KEY, 1); // show on the very first visit
    try {
      if (!sessionStorage.getItem(SESSION_KEY)) {
        visits += 1;
        localStorage.setItem(VISITS_KEY, String(visits));
        sessionStorage.setItem(SESSION_KEY, '1');
      }
    } catch {}

    // Not due yet — skip the query entirely.
    if (visits < showAt) return;

    // Another auto-popup (e.g. the birthday promo) already claimed this visit — yield to avoid stacking.
    if (typeof window !== 'undefined' && window.__blomSignup?.hasShown) return;

    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('name, slug, price, short_description, thumbnail_url, image_url, status, out_of_stock, stock, stock_on_hand, stock_available, inventory_quantity')
          .eq('slug', PRODUCT_SLUG)
          .maybeSingle();

        if (error || !data || cancelled) return;

        const stockLevel = Math.max(
          Number(data.stock_on_hand) || 0,
          Number(data.stock_available) || 0,
          Number(data.stock) || 0,
          Number(data.inventory_quantity) || 0,
        );
        const available = data.status === 'active' && data.out_of_stock !== true && stockLevel > 0;
        if (!available) return;

        setProduct({
          name: data.name,
          price: Number(data.price) || 0,
          image: data.thumbnail_url || data.image_url || '/sign-up-image.webp',
          blurb: 'The pro-favourite HEMA-free, low-odour nail liquid is back. Limited stock — grab yours before it sells out again.',
        });

        // We're going to show it — schedule the next appearance 3–5 visits out
        // so it won't re-open again this session and returns later.
        try { localStorage.setItem(SHOW_AT_KEY, String(visits + nextInterval())); } catch {}

        // Don't collide with the Beauty Club popup's auto-timer this visit.
        if (typeof window !== 'undefined') {
          window.__blomSignup = window.__blomSignup || {};
          window.__blomSignup.hasShown = true;
        }

        timerRef.current = window.setTimeout(() => {
          if (!cancelled) setIsOpen(true);
        }, SHOW_DELAY_MS);
      } catch {
        /* fail silent — popup is non-critical */
      }
    })();

    return () => {
      cancelled = true;
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  // Lock body scroll while open.
  useEffect(() => {
    const html = document.documentElement;
    if (isOpen) {
      html.classList.add('no-scroll');
      document.body.classList.add('no-scroll');
    } else {
      html.classList.remove('no-scroll');
      document.body.classList.remove('no-scroll');
    }
    return () => {
      html.classList.remove('no-scroll');
      document.body.classList.remove('no-scroll');
    };
  }, [isOpen]);

  const dismiss = () => {
    const currentScrollY = window.scrollY;
    setIsOpen(false);
    // Schedule already advanced when shown — nothing else to persist here.
    requestAnimationFrame(() => {
      window.scrollTo({ top: currentScrollY, left: 0, behavior: 'instant' as ScrollBehavior });
    });
  };

  const goToProduct = () => {
    window.location.href = `/products/${PRODUCT_SLUG}`;
  };

  if (!isOpen || !product) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="500ml Nail Liquid back in stock"
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-[min(820px,95vw)] max-h-[92vh] overflow-hidden flex flex-col md:grid md:grid-cols-2 animate-[bounce-in_0.4s_ease]">
        {/* Visual Panel */}
        <div className="relative shrink-0 overflow-hidden bg-pink-50 h-44 sm:h-52 md:h-auto" aria-hidden="true">
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-contain md:object-cover object-center"
            loading="lazy"
          />
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-pink-500 text-white text-[11px] md:text-xs font-bold uppercase tracking-wide px-2.5 py-1 md:px-3 md:py-1.5 rounded-full shadow">
            <Sparkles className="w-3.5 h-3.5" /> Back in Stock
          </span>
        </div>

        {/* Content Panel */}
        <div className="relative p-5 md:p-7 flex-1 min-h-0 overflow-y-auto">
          <button
            aria-label="Close"
            className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
            onClick={dismiss}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>

          <div className="max-w-md mx-auto">
            <div className="mb-3">
              <img src="/blom_logo.webp" alt="BLOM Cosmetics" className="h-12 mb-3" />
              <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-pink-500">Restocked</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-2">
              {product.name} is back!
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">{product.blurb}</p>

            <ul className="mb-5 space-y-2 text-sm text-gray-600">
              {['HEMA-free & low odour', 'Salon-size 500ml value', 'Strong, crystal-clear finish'].map((point) => (
                <li key={point} className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-pink-100 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-pink-500" />
                  </div>
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-baseline gap-2 mb-5">
              <span className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</span>
              <span className="text-sm text-gray-400">incl. VAT</span>
            </div>

            <button
              onClick={goToProduct}
              className="w-full bg-pink-400 hover:bg-pink-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              Shop Now
            </button>
            <button
              onClick={dismiss}
              className="w-full mt-2 text-gray-500 hover:text-gray-700 text-sm font-medium py-2 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Container } from './Container';
import { CAT_EYE_DESKTOP_IMAGE } from '../../lib/catEyeAssets';

// Permanent shop-page reinforcement for the Nude Cat Eye Collection —
// CatEyeSpecialsPopup only shows once per session, so this slim strip keeps
// the collection visible on /shop after the popup's been dismissed. Reuses
// the popup's palette/pill/serif treatment so it reads as the same promo,
// not a competing one.
export const CatEyeShopBanner: React.FC = () => {
  return (
    <a
      href="/shop?category=gel-system"
      className="group block border-b border-[#ecdccb] bg-[#fffaf5]"
    >
      <Container>
        <div className="flex items-center gap-3 py-2.5 sm:gap-4 sm:py-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#f3e1d3] sm:h-14 sm:w-14">
            <img
              src={CAT_EYE_DESKTOP_IMAGE}
              alt=""
              className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>

          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#a9715c] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              New Collection
            </span>
            <p className="mt-0.5 truncate font-serif text-sm text-[#3f2a22] sm:text-base">
              Nude Cat Eye Collection — 5 new shades
            </p>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#a9715c] px-3.5 py-2 text-xs font-bold text-white transition-colors group-hover:bg-[#8f5c44] sm:px-4">
            <span className="hidden sm:inline">Shop Now</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </Container>
    </a>
  );
};

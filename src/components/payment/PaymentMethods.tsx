import React from 'react';

interface PaymentMethodsProps {
  /** 'full' shows all methods (checkout/footer). 'compact' hides less common methods (product pages). */
  variant?: 'full' | 'compact';
}

export const PaymentMethods: React.FC<PaymentMethodsProps> = ({ variant = 'full' }) => {
  return (
    <div className={variant === 'full' ? 'mt-6 pt-6 border-t border-gray-200' : ''}>
      <div className="flex flex-col gap-3">
        <p className="text-xs text-gray-500 font-medium text-center">
          Secure payment via
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* PayFast */}
          <img src="https://res.cloudinary.com/dnlgohkcc/image/upload/q_auto/f_auto/v1776237198/Payfast_logo_fsryos.png" alt="PayFast" className="h-8 w-auto object-contain bg-white border border-gray-200 rounded-md px-2 py-1" />
          {/* Payflex BNPL */}
          <img src="https://res.cloudinary.com/dnlgohkcc/image/upload/q_auto/f_auto/v1776237251/a65340aacf8a80f5029d90f502460b539230993ffc89107fa4adbd83800f6d07-Payflex_Logo_-_Navy_v1tbdx.png" alt="Payflex" className="h-8 w-auto object-contain bg-white border border-gray-200 rounded-md px-2 py-1" />
          <img src="/moretyme.svg" alt="MoreTyme" className="h-8 w-12 object-contain bg-white border border-gray-200 rounded-md p-1" />
          <img src="/credit-card.svg" alt="Visa / Mastercard" className="h-8 w-12 object-contain bg-white border border-gray-200 rounded-md p-1" />
          <img src="/debit-card.svg" alt="Debit Card" className="h-8 w-12 object-contain bg-white border border-gray-200 rounded-md p-1" />
          <img src="/instantEFT (1).svg" alt="Instant EFT" className="h-8 w-12 object-contain bg-white border border-gray-200 rounded-md p-1" />
          <img src="/mobicred.svg" alt="Mobicred" className="h-8 w-12 object-contain bg-white border border-gray-200 rounded-md p-1" />
          {variant === 'full' && (
            <>
              <img src="/amex.svg" alt="American Express" className="h-8 w-12 object-contain bg-white border border-gray-200 rounded-md p-1" />
              <img src="/applepay.svg" alt="Apple Pay" className="h-8 w-12 object-contain bg-white border border-gray-200 rounded-md p-1" />
              <img src="/samsungpay.svg" alt="Samsung Pay" className="h-8 w-12 object-contain bg-white border border-gray-200 rounded-md p-1" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

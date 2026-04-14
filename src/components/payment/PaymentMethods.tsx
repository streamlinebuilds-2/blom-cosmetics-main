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
          {/* Payflex BNPL badge */}
          <div className="h-8 px-2 flex items-center bg-white border border-gray-200 rounded-md">
            <span className="text-xs font-bold" style={{ color: '#6B2D8B' }}>Pay</span>
            <span className="text-xs font-bold text-gray-800">flex</span>
            <span className="ml-1 text-[9px] text-gray-500 leading-tight">4×<br/>interest<br/>free</span>
          </div>
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

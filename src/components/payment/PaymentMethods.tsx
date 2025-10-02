import React from 'react';

export const PaymentMethods: React.FC = () => {
  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600 font-medium text-center">
          We accept the following payment methods:
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <img src="/amex.svg" alt="American Express" className="h-8 w-12 object-contain bg-white border border-gray-200 rounded-md p-1" />
          <img src="/applepay.svg" alt="Apple Pay" className="h-8 w-12 object-contain bg-white border border-gray-200 rounded-md p-1" />
          <img src="/credit-card.svg" alt="Credit Card" className="h-8 w-12 object-contain bg-white border border-gray-200 rounded-md p-1" />
          <img src="/debit-card.svg" alt="Debit Card" className="h-8 w-12 object-contain bg-white border border-gray-200 rounded-md p-1" />
          <img src="/instantEFT.svg" alt="Instant EFT" className="h-8 w-12 object-contain bg-white border border-gray-200 rounded-md p-1" />
          <img src="/mobicred.svg" alt="Mobicred" className="h-8 w-12 object-contain bg-white border border-gray-200 rounded-md p-1" />
          <img src="/moretyme.svg" alt="MoreTyme" className="h-8 w-12 object-contain bg-white border border-gray-200 rounded-md p-1" />
          <img src="/samsungpay.svg" alt="Samsung Pay" className="h-8 w-12 object-contain bg-white border border-gray-200 rounded-md p-1" />
        </div>
      </div>
    </div>
  );
};

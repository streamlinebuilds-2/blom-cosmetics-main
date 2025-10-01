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
          <div className="h-8 px-3 bg-white border border-gray-200 rounded-md flex items-center justify-center">
            <span className="text-xs font-bold text-gray-700">Visa</span>
          </div>
          <div className="h-8 px-3 bg-white border border-gray-200 rounded-md flex items-center justify-center">
            <span className="text-xs font-bold text-gray-700">Mastercard</span>
          </div>
          <div className="h-8 px-3 bg-white border border-gray-200 rounded-md flex items-center justify-center">
            <span className="text-xs font-bold text-gray-700">PayFast</span>
          </div>
          <div className="h-8 px-3 bg-white border border-gray-200 rounded-md flex items-center justify-center">
            <span className="text-xs font-bold text-gray-700">EFT</span>
          </div>
          <div className="h-8 px-3 bg-white border border-gray-200 rounded-md flex items-center justify-center">
            <span className="text-xs font-bold text-gray-700">PayPal</span>
          </div>
          <div className="h-8 px-3 bg-white border border-gray-200 rounded-md flex items-center justify-center">
            <span className="text-xs font-bold text-gray-700">Google Pay</span>
          </div>
        </div>
      </div>
    </div>
  );
};

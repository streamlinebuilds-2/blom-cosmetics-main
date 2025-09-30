import React from 'react';

export const PaymentMethods: React.FC = () => {
  const paymentMethods = [
    { name: 'Visa', icon: '💳' },
    { name: 'Mastercard', icon: '💳' },
    { name: 'American Express', icon: '💳' },
    { name: 'Apple Pay', icon: '📱' },
    { name: 'Samsung Pay', icon: '📱' },
    { name: 'PayPal', icon: '💰' },
    { name: 'Google Pay', icon: '📱' },
    { name: 'Zelle', icon: '💸' }
  ];

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-sm text-gray-600 font-medium">
          We accept the following payment methods:
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {paymentMethods.map((method, index) => (
            <div
              key={index}
              className="flex items-center justify-center w-12 h-8 bg-white border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow"
              title={method.name}
            >
              <span className="text-lg">{method.icon}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

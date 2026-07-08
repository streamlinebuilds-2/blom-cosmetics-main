import React, { useState } from 'react';
import { stockists } from '../../data/stockists';

interface StockistMapProps {
  className?: string;
}

export const StockistMap: React.FC<StockistMapProps> = ({ className = '' }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className={`grid sm:grid-cols-3 gap-4 ${className}`}>
      {stockists.map((stockist) => (
        <div
          key={stockist.id}
          className="rounded-lg border border-gray-200 overflow-hidden bg-white"
        >
          <div
            className="aspect-square relative"
            onMouseEnter={() => setHoveredId(stockist.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent(stockist.fullAddress)}&output=embed`}
              width="100%"
              height="100%"
              style={{
                border: 0,
                pointerEvents: hoveredId === stockist.id ? 'auto' : 'none'
              }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`${stockist.name} — ${stockist.fullAddress}`}
            />
            {hoveredId !== stockist.id && (
              <div className="absolute inset-0 bg-transparent cursor-pointer" />
            )}
          </div>
          <div className="px-3 py-2 border-t border-gray-100">
            <p
              className={`text-xs font-semibold uppercase tracking-wide ${
                stockist.kind === 'main' ? 'text-pink-500' : 'text-blue-500'
              }`}
            >
              {stockist.kind === 'main' ? 'Main Store' : 'Stockist'}
            </p>
            <p className="text-sm font-medium text-gray-900 truncate">{stockist.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

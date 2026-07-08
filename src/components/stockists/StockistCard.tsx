import React from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { ClickableContact } from '../ui/ClickableContact';
import { Stockist } from '../../data/stockists';

interface StockistCardProps {
  stockist: Stockist;
}

export const StockistCard: React.FC<StockistCardProps> = ({ stockist }) => {
  const isMain = stockist.kind === 'main';

  return (
    <Card className="h-full">
      <CardContent className="pt-8 pb-6 px-6 h-full flex flex-col">
        <div className="flex items-start gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isMain ? 'bg-pink-100' : 'bg-blue-100'
            }`}
          >
            <MapPin className={`h-5 w-5 ${isMain ? 'text-pink-400' : 'text-blue-500'}`} />
          </div>
          <div>
            <span
              className={`inline-block text-xs font-semibold uppercase tracking-wide mb-1 ${
                isMain ? 'text-pink-500' : 'text-blue-500'
              }`}
            >
              {isMain ? 'Main Store' : 'Stockist'}
            </span>
            <h3 className="font-bold text-lg">{stockist.name}</h3>
          </div>
        </div>

        <div className="text-gray-600 text-sm mb-4 space-y-0.5">
          {stockist.addressLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        {stockist.hours && (
          <div className="text-xs text-gray-500 mb-4 space-y-0.5">
            {stockist.hours.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        )}

        <div className="mt-auto space-y-2">
          {stockist.contactName && (
            <p className="text-sm text-gray-500">Contact: {stockist.contactName}</p>
          )}
          {stockist.phone && (
            <ClickableContact type="phone" value={stockist.phone} className="text-gray-700" />
          )}
          {stockist.email && (
            <ClickableContact type="email" value={stockist.email} className="text-gray-700" />
          )}
          <ClickableContact type="address" value={stockist.fullAddress} className="text-gray-700">
            Get Directions
          </ClickableContact>
        </div>
      </CardContent>
    </Card>
  );
};

import React, { useState } from 'react';
import { MapPin, Search } from 'lucide-react';

type Address = {
  street_address: string;
  local_area: string;  // suburb
  city: string;
  zone: string;        // province
  code: string;        // postal code
  country: string;     // 'ZA'
};

interface AddressSmartZAProps {
  value: Address;
  onChange: (addr: Address) => void;
  className?: string;
}

export const AddressSmartZA: React.FC<AddressSmartZAProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function searchAddresses(query: string) {
    setSearchQuery(query);
    if (query.trim().length < 2) { 
      setSuggestions([]); 
      setOpen(false); 
      return; 
    }
    
    try {
      setLoading(true);
      const response = await fetch(`/.netlify/functions/za-postal-search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSuggestions(Array.isArray(data) ? data : []);
      setOpen(true);
    } catch (error) {
      console.error('Address search error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }

  function selectAddress(address: any) {
    onChange({
      ...value,
      local_area: address.suburb,
      city: address.city,
      zone: address.province,
      code: address.postal_code,
      country: 'ZA'
    });
    setSearchQuery(`${address.suburb}, ${address.city}`);
    setOpen(false);
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Delivery Address <span className="text-red-500">*</span>
      </label>
      
      {/* Street Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Street & Number <span className="text-red-500">*</span>
        </label>
        <input
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none"
          placeholder="e.g. 34 Horingbek Ave"
          value={value.street_address}
          onChange={(e) => onChange({...value, street_address: e.target.value})}
        />
      </div>

      {/* Suburb/City Autocomplete */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Suburb / City (autocomplete) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none"
              placeholder="Start typing suburb or city..."
              value={searchQuery}
              onChange={(e) => searchAddresses(e.target.value)}
              onFocus={() => { if (suggestions.length) setOpen(true); }}
              onBlur={() => setTimeout(() => setOpen(false), 150)} // allow click
            />
          </div>
          
          {/* Dropdown Suggestions */}
          {open && (
            <div className="absolute z-10 mt-1 w-full max-h-64 overflow-auto rounded-md border border-gray-300 bg-white shadow-lg">
              {loading && (
                <div className="p-3 text-sm text-gray-500 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-400"></div>
                  Searching...
                </div>
              )}
              {!loading && suggestions.length === 0 && searchQuery.length >= 2 && (
                <div className="p-3 text-sm text-gray-500 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  No matches found
                </div>
              )}
              {!loading && suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectAddress(suggestion)}
                  className="block w-full text-left px-3 py-2 hover:bg-pink-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{suggestion.suburb}</div>
                  <div className="text-xs text-gray-600">
                    {suggestion.city}, {suggestion.province} · {suggestion.postal_code}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Auto-filled Fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none"
            value={value.city}
            onChange={(e) => onChange({...value, city: e.target.value})}
            placeholder="Auto-filled"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none"
            value={value.zone}
            onChange={(e) => onChange({...value, zone: e.target.value})}
            placeholder="Auto-filled"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none"
            value={value.code}
            onChange={(e) => onChange({...value, code: e.target.value})}
            placeholder="Auto-filled"
            maxLength={4}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none"
            value={value.country || 'ZA'}
            onChange={(e) => onChange({...value, country: e.target.value || 'ZA'})}
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-blue-800">Address Tip</span>
        </div>
        <p className="text-xs text-blue-700">
          Choose your suburb/city from the dropdown to auto-fill province and postal code. 
          This ensures accurate delivery information.
        </p>
      </div>
    </div>
  );
};

import React, { useRef, useEffect, useState } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

type Address = {
  street_address: string;
  local_area: string; // suburb
  city: string;
  zone: string;       // province
  code: string;       // postal code
  country: string;    // ZA
  lat?: number;
  lng?: number;
};

interface AddressAutocompleteProps {
  value: Address;
  onChange: (addr: Address) => void;
  className?: string;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const [center, setCenter] = useState<{lat: number; lng: number}>({ 
    lat: -26.2041, 
    lng: 28.0473 
  }); // Johannesburg default

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: ['za'] },
      fields: ['address_components', 'geometry', 'formatted_address', 'name']
    });

    const handlePlaceChanged = () => {
      const place = autocomplete.getPlace();
      if (!place || !place.address_components) return;

      const getComponent = (types: string[]) =>
        place.address_components?.find(c => types.every(t => c.types.includes(t)))?.long_name || '';

      // Extract address components
      const streetNumber = getComponent(['street_number']);
      const route = getComponent(['route']);
      const suburb = getComponent(['sublocality_level_1']) || 
                    getComponent(['sublocality']) || 
                    getComponent(['neighborhood']);
      const city = getComponent(['locality']) || 
                  getComponent(['postal_town']) || 
                  getComponent(['administrative_area_level_2']);
      const province = getComponent(['administrative_area_level_1']); // e.g., Gauteng
      const postal = getComponent(['postal_code']);
      const country = getComponent(['country']);

      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();
      
      if (lat && lng) {
        setCenter({ lat, lng });
      }

      const newAddress: Address = {
        street_address: [streetNumber, route].filter(Boolean).join(' ') || place.name || '',
        local_area: suburb || '',
        city: city || '',
        zone: province || '',
        code: postal || '',
        country: country || 'ZA',
        lat: lat || undefined,
        lng: lng || undefined
      };

      onChange(newAddress);
    };

    autocomplete.addListener('place_changed', handlePlaceChanged);

    return () => {
      google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [isLoaded, onChange]);

  const handleFieldChange = (field: keyof Address, newValue: string) => {
    onChange({
      ...value,
      [field]: newValue
    });
  };

  if (!isLoaded) {
    return (
      <div className={`space-y-3 ${className}`}>
        <label className="block text-sm font-medium text-gray-700">Delivery Address</label>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Delivery Address <span className="text-red-500">*</span>
      </label>
      
      <input
        ref={inputRef}
        placeholder="Start typing your address..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none"
        defaultValue=""
      />
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Street Address</label>
          <input
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-400 focus:border-pink-400 outline-none"
            value={value.street_address || ''}
            onChange={(e) => handleFieldChange('street_address', e.target.value)}
            placeholder="123 Main Street"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Suburb</label>
          <input
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-400 focus:border-pink-400 outline-none"
            value={value.local_area || ''}
            onChange={(e) => handleFieldChange('local_area', e.target.value)}
            placeholder="Sandton"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">City</label>
          <input
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-400 focus:border-pink-400 outline-none"
            value={value.city || ''}
            onChange={(e) => handleFieldChange('city', e.target.value)}
            placeholder="Johannesburg"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Province</label>
          <input
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-400 focus:border-pink-400 outline-none"
            value={value.zone || ''}
            onChange={(e) => handleFieldChange('zone', e.target.value)}
            placeholder="Gauteng"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Postal Code</label>
          <input
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-400 focus:border-pink-400 outline-none"
            value={value.code || ''}
            onChange={(e) => handleFieldChange('code', e.target.value)}
            placeholder="2000"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Country</label>
          <input
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-400 focus:border-pink-400 outline-none"
            value={value.country || 'ZA'}
            onChange={(e) => handleFieldChange('country', e.target.value)}
            placeholder="ZA"
          />
        </div>
      </div>

      {isLoaded && (value.lat && value.lng) && (
        <div className="h-48 overflow-hidden rounded-md border border-gray-300">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={center}
            zoom={14}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false
            }}
          >
            <Marker position={center} />
          </GoogleMap>
        </div>
      )}

      <p className="text-xs text-gray-500">
        We'll validate & normalize your address to ensure smooth delivery.
      </p>
    </div>
  );
};

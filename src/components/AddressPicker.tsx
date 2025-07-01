'use client';

import { useState, useCallback } from 'react';
import { env } from '@/lib/env';

interface AddressPickerProps {
  onAddressSelect: (lat: number, lng: number, address: string) => void;
  placeholder?: string;
  className?: string;
}

interface AzureMapsSearchResult {
  position: {
    lat: number;
    lon: number;
  };
  address: {
    freeformAddress?: string;
  };
}

export default function AddressPicker({ 
  onAddressSelect, 
  placeholder = "Enter your address",
  className = ""
}: AddressPickerProps) {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Azure Maps search endpoint
  const SEARCH_URL = 'https://atlas.microsoft.com/search/address/json';
  
  const geocodeAddress = useCallback(async (address: string) => {
    try {
      // Clean the address (remove newlines and special characters)
      const cleanedAddress = address.split('\n')[0].split('⋅')[0].trim();
      
      // Build the search URL with parameters
      const params = new URLSearchParams({
        'api-version': '1.0',
        'subscription-key': env.azureMaps.publicKey,
        'query': cleanedAddress
      });
      
      const response = await fetch(`${SEARCH_URL}?${params.toString()}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid Azure Maps key. Please check your configuration.');
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please try again later.');
        } else {
          throw new Error(`Failed to search address. Please try again.`);
        }
      }
      
      const data = await response.json();
      const results = data.results as AzureMapsSearchResult[];
      
      if (results && results.length > 0) {
        const firstResult = results[0];
        const { lat, lon } = firstResult.position;
        const formattedAddress = firstResult.address?.freeformAddress || cleanedAddress;
        
        return { lat, lng: lon, address: formattedAddress };
      } else {
        throw new Error('Address not found. Please try a different address.');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      // Re-throw with a user-friendly message if it's not already one
      if (err instanceof Error && err.message.includes('Azure Maps')) {
        throw err;
      }
      throw new Error('Unable to search address. Please check your internet connection and try again.');
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (!inputValue.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await geocodeAddress(inputValue);
      onAddressSelect(result.lat, result.lng, result.address);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search address');
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, onAddressSelect, geocodeAddress]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSearch();
    }
  };

  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError(null);
          }}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          aria-label="Address input"
          aria-invalid={!!error}
          aria-describedby={error ? 'address-error' : undefined}
          className={`flex-1 px-4 py-3 border ${error ? 'border-red-500' : 'border-slate-300'} rounded-lg text-lg focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'} focus:border-transparent`}
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={!inputValue.trim() || isLoading}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] flex items-center justify-center"
          aria-label="Search for health services"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching...
            </>
          ) : (
            'Search'
          )}
        </button>
      </div>
      {error && (
        <p id="address-error" className="mt-2 text-sm text-red-600" role="alert">
          <span className="font-medium">Error:</span> {error}
        </p>
      )}
    </div>
  );
} 
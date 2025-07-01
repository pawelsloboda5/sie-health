'use client';

import { useState } from 'react';
import AddressPicker from '@/components/AddressPicker';
import ResultsCard from '@/components/ResultsCard';

interface SearchResult {
  _id: string | { $oid: string };
  Name: string;
  Address: string;
  Category: string;
  Phone?: string;
  email?: string;
  Website?: string;
  Rating?: string;
  'Total Reviews'?: string;
  distance: number;
  free_services: Array<{
    service: string;
    description: string;
    limitations: string;
    found_on_page: string;
  }>;
}

export default function Home() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');

  const handleAddressSelect = async (lat: number, lng: number, address: string) => {
    setIsLoading(true);
    setHasSearched(true);
    setSearchAddress(address);

    try {
      const response = await fetch(`/api/nearby?lat=${lat}&lng=${lng}&km=100`);
      if (!response.ok) throw new Error('Failed to fetch results');
      
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error fetching results:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Find Free Health Services Near You
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-8">
            Discover dental care, primary care, screenings, and more in your community.
            100% free services for those who qualify.
          </p>
          
          {/* Address Input Section */}
          <div className="bg-slate-50 rounded-lg p-6 md:p-8 shadow-sm">
            <label htmlFor="address" className="block text-lg font-medium text-slate-900 mb-4">
              Enter your address to get started
            </label>
            <AddressPicker 
              onAddressSelect={handleAddressSelect}
              placeholder="123 Main St, City, State"
            />
          </div>
        </div>

        {/* Results Section */}
        {hasSearched && (
          <div className="mt-12 max-w-4xl mx-auto">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-slate-600">Searching for free health services near {searchAddress}...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <h2 className="text-2xl font-semibold text-slate-900 mb-6">
                  Found {searchResults.length} provider{searchResults.length !== 1 ? 's' : ''} near you
                </h2>
                <div className="space-y-4">
                  {searchResults.map((result) => (
                    <ResultsCard
                      key={typeof result._id === 'string' ? result._id : result._id.$oid}
                      name={result.Name}
                      address={result.Address}
                      category={result.Category}
                      distance={result.distance}
                      rating={result.Rating}
                      totalReviews={result['Total Reviews']}
                      phone={result.Phone}
                      email={result.email}
                      website={result.Website}
                      freeServices={result.free_services}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-600">No free health services found within 100km of your location.</p>
                <p className="mt-2 text-sm text-slate-500">Try searching for a different address.</p>
              </div>
            )}
          </div>
        )}

        {/* Features Section - Only show before search */}
        {!hasSearched && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏥</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Primary Care</h3>
              <p className="text-slate-600">Annual checkups, vaccinations, and preventive care</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🦷</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Dental Services</h3>
              <p className="text-slate-600">Cleanings, fillings, and emergency dental care</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔬</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Health Screenings</h3>
              <p className="text-slate-600">Blood pressure, diabetes, and cancer screenings</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

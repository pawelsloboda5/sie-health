'use client';

import { useState, useEffect, useCallback } from 'react';
import AddressPicker from '@/components/AddressPicker';
import ResultsCard from '@/components/ResultsCard';
import FilterSidebar from '@/components/FilterSidebar';
import QuickAccessButtons from '@/components/QuickAccessButtons';

interface SearchFilters {
  category?: string;
  insuranceType?: 'medicaid' | 'medicare' | 'self-pay' | 'any';
  freeServicesOnly?: boolean;
  acceptsUninsured?: boolean;
  noDocumentsRequired?: boolean;
  telehealth?: boolean;
  walkInsAccepted?: boolean;
  slidingScale?: boolean;
  searchText?: string;
}

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
  freeServicesCount: number;
  extractedFreeServices: any[];
  services_offered?: any;
  insurance_accepted?: any;
  eligibility_requirements?: any;
  financial_assistance?: any;
  documentation_requirements?: any;
  telehealth_info?: any;
  accessibility_info?: any;
}

export default function Home() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');
  const [searchCoords, setSearchCoords] = useState<{lat: number, lng: number} | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Array<{name: string, count: number, icon: string}>>([]);

  // Load categories on mount
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Failed to load categories:', err));
  }, []);

  const handleAddressSelect = async (lat: number, lng: number, address: string) => {
    setSearchAddress(address);
    setSearchCoords({ lat, lng });
    setHasSearched(true);
    performSearch(lat, lng, filters);
  };

  const performSearch = async (lat: number, lng: number, currentFilters: SearchFilters) => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        km: '50', // 50km radius
        ...Object.entries(currentFilters).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== '') {
            acc[key] = value.toString();
          }
          return acc;
        }, {} as Record<string, string>)
      });

      const response = await fetch(`/api/nearby?${params}`);
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

  const handleFilterChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    if (searchCoords) {
      performSearch(searchCoords.lat, searchCoords.lng, newFilters);
    }
  }, [searchCoords]);

  const quickFilterOptions = [
    { label: 'Free Services', key: 'freeServicesOnly', icon: '🆓' },
    { label: 'No Documents Required', key: 'noDocumentsRequired', icon: '📋' },
    { label: 'Accepts Uninsured', key: 'acceptsUninsured', icon: '��' },
    { label: 'Walk-ins Welcome', key: 'walkInsAccepted', icon: '🚶' },
    { label: 'Telehealth Available', key: 'telehealth', icon: '💻' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              SIE Health
            </h1>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              aria-label="Toggle filters"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Find Free and Low-Cost Health Services Near You
          </h2>
          <AddressPicker 
            onAddressSelect={handleAddressSelect}
            placeholder="Enter your address or zip code"
            className="mb-4"
          />
          
          {/* Quick Filter Buttons */}
          {!hasSearched && (
            <QuickAccessButtons 
              options={quickFilterOptions}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          )}
        </div>

        {/* Results Section */}
        {hasSearched && (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Filter Sidebar */}
            <aside className={`${showFilters ? 'block' : 'hidden'} md:block md:w-80`}>
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
                <FilterSidebar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  categories={categories}
                />
              </div>
            </aside>

            {/* Results List */}
            <div className="flex-1">
              {isLoading ? (
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Finding health services near {searchAddress}...</p>
                  </div>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Found {searchResults.length} provider{searchResults.length !== 1 ? 's' : ''} near you
                    </h3>
                    <span className="text-sm text-gray-600">
                      {searchResults.filter(r => r.freeServicesCount > 0).length} with free services
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {searchResults.map((result) => (
                      <ResultsCard
                        key={typeof result._id === 'string' ? result._id : result._id.$oid}
                        result={result}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
                  </svg>
                  <p className="text-gray-600 mb-2">No providers found matching your criteria.</p>
                  <p className="text-sm text-gray-500">Try adjusting your filters or searching a different area.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Section - Show before search */}
        {!hasSearched && (
          <div className="mt-12">
            <h3 className="text-2xl font-semibold text-gray-900 text-center mb-8">
              We Help You Find
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-3xl mb-3">🆓</div>
                <h4 className="font-semibold text-lg mb-2">Free Services</h4>
                <p className="text-gray-600">Find providers offering completely free health services, from checkups to dental care.</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-3xl mb-3">💳</div>
                <h4 className="font-semibold text-lg mb-2">Sliding Scale Fees</h4>
                <p className="text-gray-600">Locate clinics with payment plans based on your income level.</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-3xl mb-3">📋</div>
                <h4 className="font-semibold text-lg mb-2">Low Barriers</h4>
                <p className="text-gray-600">Find care that doesn't require SSN, insurance, or extensive documentation.</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-3xl mb-3">🌐</div>
                <h4 className="font-semibold text-lg mb-2">Language Support</h4>
                <p className="text-gray-600">Many providers offer services in multiple languages.</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-3xl mb-3">💻</div>
                <h4 className="font-semibold text-lg mb-2">Telehealth Options</h4>
                <p className="text-gray-600">Access care from home with virtual appointment options.</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-3xl mb-3">🚶</div>
                <h4 className="font-semibold text-lg mb-2">Walk-in Services</h4>
                <p className="text-gray-600">Get immediate care without an appointment at walk-in clinics.</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

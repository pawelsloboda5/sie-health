'use client';

import { useState } from 'react';

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

interface FilterSidebarProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  categories: Array<{ name: string; count: number; icon: string }>;
}

export default function FilterSidebar({ filters, onFilterChange, categories }: FilterSidebarProps) {
  const [isExpanded, setIsExpanded] = useState({
    services: true,
    insurance: true,
    accessibility: true,
    documentation: false,
  });

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const toggleSection = (section: string) => {
    setIsExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Filter Results</h3>

      {/* Search Text */}
      <div>
        <label htmlFor="searchText" className="block text-sm font-medium text-gray-700 mb-2">
          Search by keyword
        </label>
        <input
          id="searchText"
          type="text"
          value={filters.searchText || ''}
          onChange={(e) => updateFilter('searchText', e.target.value)}
          placeholder="e.g., diabetes, dental, mental health"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Category Filter */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Service Category
        </label>
        <select
          id="category"
          value={filters.category || ''}
          onChange={(e) => updateFilter('category', e.target.value || undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.name} value={cat.name}>
              {cat.icon} {cat.name} ({cat.count})
            </option>
          ))}
        </select>
      </div>

      {/* Services & Cost Section */}
      <div className="border-t pt-4">
        <button
          onClick={() => toggleSection('services')}
          className="flex items-center justify-between w-full text-left"
          aria-expanded={isExpanded.services}
        >
          <span className="font-medium text-gray-900">Services & Cost</span>
          <svg
            className={`w-5 h-5 text-gray-500 transform transition-transform ${
              isExpanded.services ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isExpanded.services && (
          <div className="mt-4 space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.freeServicesOnly || false}
                onChange={(e) => updateFilter('freeServicesOnly', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Free services only</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.slidingScale || false}
                onChange={(e) => updateFilter('slidingScale', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Sliding scale payment</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.acceptsUninsured || false}
                onChange={(e) => updateFilter('acceptsUninsured', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Accepts uninsured patients</span>
            </label>
          </div>
        )}
      </div>

      {/* Insurance Section */}
      <div className="border-t pt-4">
        <button
          onClick={() => toggleSection('insurance')}
          className="flex items-center justify-between w-full text-left"
          aria-expanded={isExpanded.insurance}
        >
          <span className="font-medium text-gray-900">Insurance</span>
          <svg
            className={`w-5 h-5 text-gray-500 transform transition-transform ${
              isExpanded.insurance ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isExpanded.insurance && (
          <div className="mt-4 space-y-3">
            <label className="flex items-center">
              <input
                type="radio"
                name="insurance"
                value=""
                checked={!filters.insuranceType}
                onChange={() => updateFilter('insuranceType', undefined)}
                className="border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Any insurance</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="insurance"
                value="medicaid"
                checked={filters.insuranceType === 'medicaid'}
                onChange={() => updateFilter('insuranceType', 'medicaid')}
                className="border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Accepts Medicaid</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="insurance"
                value="medicare"
                checked={filters.insuranceType === 'medicare'}
                onChange={() => updateFilter('insuranceType', 'medicare')}
                className="border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Accepts Medicare</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="insurance"
                value="self-pay"
                checked={filters.insuranceType === 'self-pay'}
                onChange={() => updateFilter('insuranceType', 'self-pay')}
                className="border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Self-pay options</span>
            </label>
          </div>
        )}
      </div>

      {/* Accessibility Section */}
      <div className="border-t pt-4">
        <button
          onClick={() => toggleSection('accessibility')}
          className="flex items-center justify-between w-full text-left"
          aria-expanded={isExpanded.accessibility}
        >
          <span className="font-medium text-gray-900">Accessibility</span>
          <svg
            className={`w-5 h-5 text-gray-500 transform transition-transform ${
              isExpanded.accessibility ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isExpanded.accessibility && (
          <div className="mt-4 space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.walkInsAccepted || false}
                onChange={(e) => updateFilter('walkInsAccepted', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Walk-ins accepted</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.telehealth || false}
                onChange={(e) => updateFilter('telehealth', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Telehealth available</span>
            </label>
          </div>
        )}
      </div>

      {/* Documentation Section */}
      <div className="border-t pt-4">
        <button
          onClick={() => toggleSection('documentation')}
          className="flex items-center justify-between w-full text-left"
          aria-expanded={isExpanded.documentation}
        >
          <span className="font-medium text-gray-900">Documentation</span>
          <svg
            className={`w-5 h-5 text-gray-500 transform transition-transform ${
              isExpanded.documentation ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isExpanded.documentation && (
          <div className="mt-4 space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.noDocumentsRequired || false}
                onChange={(e) => updateFilter('noDocumentsRequired', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">No SSN or ID required</span>
            </label>
          </div>
        )}
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => onFilterChange({})}
        className="w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Clear all filters
      </button>
    </div>
  );
} 
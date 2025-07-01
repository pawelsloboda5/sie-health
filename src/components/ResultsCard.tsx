import React, { useState } from 'react';

interface FreeService {
  service: string;
  description: string;
  limitations: string;
  found_on_page: string;
}

interface ResultsCardProps {
  name: string;
  address: string;
  category: string;
  distance: number;
  rating?: string;
  totalReviews?: string;
  phone?: string;
  email?: string;
  website?: string;
  freeServices: FreeService[];
}

export default function ResultsCard({
  name,
  address,
  category,
  distance,
  rating,
  totalReviews,
  phone,
  email,
  website,
  freeServices
}: ResultsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Show max 2 services in preview, with "+ n more" indicator
  const visibleServices = freeServices.slice(0, 2);
  const remainingCount = freeServices.length - 2;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow">
      {/* Header with name and distance */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
        <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          {distance} km
        </span>
      </div>

      {/* Category and Rating */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mb-3">
        <span className="font-medium">{category}</span>
        {rating && (
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span>{rating}</span>
            {totalReviews && <span className="text-slate-400">{totalReviews}</span>}
          </div>
        )}
      </div>

      {/* Address and Contact Info */}
      <div className="mb-3">
        <p className="text-sm text-slate-600">{address}</p>
        {phone && (
          <p className="text-sm text-slate-600 mt-1">
            <span className="font-medium">Phone:</span> {phone}
          </p>
        )}
        {email && (
          <p className="text-sm text-slate-600 mt-1">
            <span className="font-medium">Email:</span> {email}
          </p>
        )}
      </div>

      {/* Free Services - Preview or Expanded */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-900 mb-2">Free Services:</h4>
        
        {isExpanded ? (
          // Expanded view - show all services with full details
          <div className="space-y-3">
            {freeServices.map((service, index) => (
              <div key={index} className="bg-slate-50 rounded-lg p-3 text-sm">
                <p className="font-semibold text-slate-900 mb-1">{service.service}</p>
                <p className="text-slate-700 mb-2">{service.description}</p>
                <p className="text-slate-600 text-xs mb-1">
                  <span className="font-medium">Limitations:</span> {service.limitations}
                </p>
                <a 
                  href={service.found_on_page} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  View on provider website
                </a>
              </div>
            ))}
          </div>
        ) : (
          // Preview - show only service names
          <div className="space-y-1">
            {visibleServices.map((service, index) => (
              <p key={index} className="text-sm text-slate-700">
                • {service.service}
              </p>
            ))}
            {remainingCount > 0 && (
              <p className="text-sm text-blue-600 font-medium">
                + {remainingCount} more
              </p>
            )}
          </div>
        )}
      </div>

      {/* Contact Information Actions */}
      <div className="flex flex-wrap gap-4 pt-3 border-t border-slate-100">
        {phone && (
          <a
            href={`tel:${phone}`}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            aria-label={`Call ${name}`}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call
          </a>
        )}
        {email && (
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            aria-label={`Email ${name}`}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email
          </a>
        )}
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            aria-label={`Visit ${name} website`}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Website
          </a>
        )}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          aria-label={isExpanded ? `Hide details for ${name}` : `View details for ${name}`}
        >
          <svg 
            className={`w-4 h-4 mr-1 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {isExpanded ? 'Hide Details' : 'View Details'}
        </button>
      </div>
    </div>
  );
} 
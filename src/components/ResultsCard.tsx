'use client';

import React, { useState } from 'react';

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
  services_offered?: {
    general_services?: any[];
    specialized_services?: any[];
    diagnostic_services?: any[];
  };
  insurance_accepted?: {
    medicaid?: boolean;
    medicare?: boolean;
    self_pay_options?: boolean;
    payment_plans?: boolean;
    major_providers?: string[];
    notes?: string;
  };
  eligibility_requirements?: {
    new_patients_accepted?: boolean;
    walk_ins_accepted?: boolean;
    appointment_process?: string;
    age_groups?: string[];
    required_documentation?: string[];
  };
  financial_assistance?: {
    sliding_scale_available?: boolean;
    sliding_scale_details?: string;
    accepts_uninsured?: boolean;
  };
  documentation_requirements?: {
    ssn_required?: boolean;
    id_required?: boolean;
    accepts_foreign_ids?: boolean;
  };
  telehealth_info?: {
    telehealth_available?: boolean;
    services_offered_virtually?: string[];
  };
  accessibility_info?: {
    walk_ins_accepted?: boolean;
    same_day_appointments?: boolean;
    after_hours_care?: boolean;
  };
  special_programs?: {
    medicaid_enrollment_assistance?: boolean;
    chip_enrollment_assistance?: boolean;
    patient_navigators?: boolean;
  };
}

interface ResultsCardProps {
  result: SearchResult;
}

export default function ResultsCard({ result }: ResultsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'services' | 'insurance' | 'requirements' | 'programs'>('services');

  // Helper to get category icon
  const getCategoryIcon = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('dental')) return '🦷';
    if (categoryLower.includes('eye') || categoryLower.includes('vision')) return '👁️';
    if (categoryLower.includes('mental')) return '🧠';
    if (categoryLower.includes('primary')) return '🏥';
    if (categoryLower.includes('urgent')) return '🚑';
    if (categoryLower.includes('pharmacy')) return '💊';
    return '🏥';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      {/* Header Section */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl" aria-hidden="true">{getCategoryIcon(result.Category)}</span>
              <h3 className="text-lg font-semibold text-gray-900">{result.Name}</h3>
              {result.freeServicesCount > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {result.freeServicesCount} free service{result.freeServicesCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
              <span className="font-medium">{result.Category}</span>
              <span className="inline-flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {result.distance} km away
              </span>
              {result.Rating && (
                <span className="inline-flex items-center">
                  <span className="text-yellow-500 mr-1">★</span>
                  {result.Rating} {result['Total Reviews'] && <span className="text-gray-400">{result['Total Reviews']}</span>}
                </span>
              )}
            </div>

            {/* Quick Info Pills */}
            <div className="flex flex-wrap gap-2 mb-3">
              {result.insurance_accepted?.medicaid && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Accepts Medicaid
                </span>
              )}
              {result.insurance_accepted?.medicare && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Accepts Medicare
                </span>
              )}
              {result.financial_assistance?.sliding_scale_available && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Sliding Scale
                </span>
              )}
              {result.telehealth_info?.telehealth_available && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  Telehealth Available
                </span>
              )}
              {result.accessibility_info?.walk_ins_accepted && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Walk-ins Welcome
                </span>
              )}
              {!result.documentation_requirements?.ssn_required && !result.documentation_requirements?.id_required && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  No ID Required
                </span>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-1 text-sm text-gray-600">
              <p>{result.Address}</p>
              {result.Phone && <p><span className="font-medium">Phone:</span> {result.Phone}</p>}
            </div>
          </div>
        </div>

        {/* Free Services Preview (if any) */}
        {result.extractedFreeServices && result.extractedFreeServices.length > 0 && !isExpanded && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-900 mb-2">Free Services Available:</p>
            <ul className="space-y-1">
              {result.extractedFreeServices.slice(0, 2).map((service, idx) => (
                <li key={idx} className="text-sm text-green-800">• {service.name}</li>
              ))}
              {result.extractedFreeServices.length > 2 && (
                <li className="text-sm text-green-700 font-medium">
                  + {result.extractedFreeServices.length - 2} more
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
          {result.Phone && (
            <a
              href={`tel:${result.Phone}`}
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Now
            </a>
          )}
          {result.Website && (
            <a
              href={result.Website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Visit Website
            </a>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <svg 
              className={`w-4 h-4 mr-1.5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {isExpanded ? 'Show Less' : 'View Full Details'}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('services')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'services' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Services
            </button>
            <button
              onClick={() => setActiveTab('insurance')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'insurance' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Insurance & Payment
            </button>
            <button
              onClick={() => setActiveTab('requirements')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'requirements' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Requirements
            </button>
            <button
              onClick={() => setActiveTab('programs')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'programs' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Special Programs
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'services' && (
              <div className="space-y-6">
                {/* Free/Discounted Services */}
                {result.extractedFreeServices && result.extractedFreeServices.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Free & Discounted Services</h4>
                    <div className="space-y-3">
                      {result.extractedFreeServices.map((service, idx) => (
                        <div key={idx} className="p-4 bg-green-50 rounded-lg">
                          <p className="font-medium text-green-900">{service.name}</p>
                          {service.description && (
                            <p className="text-sm text-green-800 mt-1">{service.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {service.is_free && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-200 text-green-800">
                                FREE
                              </span>
                            )}
                            {service.is_discounted && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-200 text-blue-800">
                                DISCOUNTED
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Services */}
                {result.services_offered && (
                  <>
                    {result.services_offered.general_services && result.services_offered.general_services.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">General Services</h4>
                        <ul className="space-y-2">
                          {result.services_offered.general_services.map((service: any, idx: number) => (
                            <li key={idx} className="text-sm text-gray-700">
                              <span className="font-medium">{service.name}</span>
                              {service.description && <span className="text-gray-600"> - {service.description}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.services_offered.specialized_services && result.services_offered.specialized_services.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Specialized Services</h4>
                        <ul className="space-y-2">
                          {result.services_offered.specialized_services.map((service: any, idx: number) => (
                            <li key={idx} className="text-sm text-gray-700">
                              <span className="font-medium">{service.name}</span>
                              {service.description && <span className="text-gray-600"> - {service.description}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'insurance' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Accepted Insurance</h4>
                  <div className="space-y-2">
                    {result.insurance_accepted?.medicaid && (
                      <p className="text-sm text-gray-700">✓ Medicaid accepted</p>
                    )}
                    {result.insurance_accepted?.medicare && (
                      <p className="text-sm text-gray-700">✓ Medicare accepted</p>
                    )}
                    {result.insurance_accepted?.major_providers && result.insurance_accepted.major_providers.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Major providers:</p>
                        <ul className="ml-4 space-y-1">
                          {result.insurance_accepted.major_providers.map((provider, idx) => (
                            <li key={idx} className="text-sm text-gray-600">• {provider}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.insurance_accepted?.notes && (
                      <p className="text-sm text-gray-600 italic mt-2">{result.insurance_accepted.notes}</p>
                    )}
                  </div>
                </div>

                {result.financial_assistance && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Financial Assistance</h4>
                    <div className="space-y-2">
                      {result.financial_assistance.sliding_scale_available && (
                        <div>
                          <p className="text-sm text-gray-700">✓ Sliding scale fees available</p>
                          {result.financial_assistance.sliding_scale_details && (
                            <p className="text-sm text-gray-600 ml-4">{result.financial_assistance.sliding_scale_details}</p>
                          )}
                        </div>
                      )}
                      {result.financial_assistance.accepts_uninsured && (
                        <p className="text-sm text-gray-700">✓ Accepts uninsured patients</p>
                      )}
                      {result.insurance_accepted?.self_pay_options && (
                        <p className="text-sm text-gray-700">✓ Self-pay options available</p>
                      )}
                      {result.insurance_accepted?.payment_plans && (
                        <p className="text-sm text-gray-700">✓ Payment plans available</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'requirements' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Documentation Requirements</h4>
                  <div className="space-y-2">
                    {result.documentation_requirements?.ssn_required === false && (
                      <p className="text-sm text-green-700">✓ No SSN required</p>
                    )}
                    {result.documentation_requirements?.id_required === false && (
                      <p className="text-sm text-green-700">✓ No ID required</p>
                    )}
                    {result.documentation_requirements?.accepts_foreign_ids && (
                      <p className="text-sm text-green-700">✓ Accepts foreign IDs</p>
                    )}
                    {result.eligibility_requirements?.required_documentation && result.eligibility_requirements.required_documentation.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Required documents:</p>
                        <ul className="ml-4 space-y-1">
                          {result.eligibility_requirements.required_documentation.map((doc, idx) => (
                            <li key={idx} className="text-sm text-gray-600">• {doc}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Eligibility & Access</h4>
                  <div className="space-y-2">
                    {result.eligibility_requirements?.new_patients_accepted && (
                      <p className="text-sm text-gray-700">✓ Accepting new patients</p>
                    )}
                    {result.eligibility_requirements?.walk_ins_accepted && (
                      <p className="text-sm text-gray-700">✓ Walk-ins accepted</p>
                    )}
                    {result.eligibility_requirements?.appointment_process && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Appointment process:</span> {result.eligibility_requirements.appointment_process}
                      </p>
                    )}
                    {result.eligibility_requirements?.age_groups && result.eligibility_requirements.age_groups.length > 0 && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Serves:</span> {result.eligibility_requirements.age_groups.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'programs' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Enrollment Assistance</h4>
                  <div className="space-y-2">
                    {result.special_programs?.medicaid_enrollment_assistance && (
                      <p className="text-sm text-gray-700">✓ Medicaid enrollment assistance</p>
                    )}
                    {result.special_programs?.chip_enrollment_assistance && (
                      <p className="text-sm text-gray-700">✓ CHIP enrollment assistance</p>
                    )}
                    {result.special_programs?.patient_navigators && (
                      <p className="text-sm text-gray-700">✓ Patient navigators available</p>
                    )}
                  </div>
                </div>

                {result.telehealth_info?.telehealth_available && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Telehealth Services</h4>
                    {result.telehealth_info.services_offered_virtually && result.telehealth_info.services_offered_virtually.length > 0 && (
                      <ul className="ml-4 space-y-1">
                        {result.telehealth_info.services_offered_virtually.map((service, idx) => (
                          <li key={idx} className="text-sm text-gray-600">• {service}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 
'use client';

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

interface QuickAccessOption {
  label: string;
  key: keyof SearchFilters;
  icon: string;
}

interface QuickAccessButtonsProps {
  options: QuickAccessOption[];
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
}

export default function QuickAccessButtons({ options, filters, onFilterChange }: QuickAccessButtonsProps) {
  const toggleFilter = (key: keyof SearchFilters) => {
    onFilterChange({
      ...filters,
      [key]: !filters[key]
    });
  };

  return (
    <div>
      <p className="text-sm text-gray-600 mb-3">Quick filters:</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = !!filters[option.key];
          return (
            <button
              key={option.key}
              onClick={() => toggleFilter(option.key)}
              className={`
                inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all
                ${isActive 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
              aria-pressed={isActive}
            >
              <span className="mr-2" aria-hidden="true">{option.icon}</span>
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
} 
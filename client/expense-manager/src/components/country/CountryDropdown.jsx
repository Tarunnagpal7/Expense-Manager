import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const countries = [
  { name: 'United States', code: 'US', currency: 'USD' },
  { name: 'United Kingdom', code: 'GB', currency: 'GBP' },
  { name: 'Canada', code: 'CA', currency: 'CAD' },
  { name: 'Australia', code: 'AU', currency: 'AUD' },
  { name: 'Germany', code: 'DE', currency: 'EUR' },
  { name: 'France', code: 'FR', currency: 'EUR' },
  { name: 'Italy', code: 'IT', currency: 'EUR' },
  { name: 'Spain', code: 'ES', currency: 'EUR' },
  { name: 'Netherlands', code: 'NL', currency: 'EUR' },
  { name: 'India', code: 'IN', currency: 'INR' },
  { name: 'Japan', code: 'JP', currency: 'JPY' },
  { name: 'China', code: 'CN', currency: 'CNY' },
  { name: 'Singapore', code: 'SG', currency: 'SGD' },
  { name: 'Hong Kong', code: 'HK', currency: 'HKD' },
  { name: 'South Korea', code: 'KR', currency: 'KRW' },
  { name: 'Brazil', code: 'BR', currency: 'BRL' },
  { name: 'Mexico', code: 'MX', currency: 'MXN' },
  { name: 'South Africa', code: 'ZA', currency: 'ZAR' },
  { name: 'Russia', code: 'RU', currency: 'RUB' },
  { name: 'Turkey', code: 'TR', currency: 'TRY' },
  { name: 'Switzerland', code: 'CH', currency: 'CHF' },
  { name: 'Sweden', code: 'SE', currency: 'SEK' },
  { name: 'Norway', code: 'NO', currency: 'NOK' },
  { name: 'New Zealand', code: 'NZ', currency: 'NZD' }
];

const CountryDropdown = ({ value, onChange, placeholder = "Select Country" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCountry = countries.find(country => country.name === value);

  const handleSelect = (country) => {
    onChange(country.name);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
      >
        <span className={selectedCountry ? 'text-gray-900' : 'text-gray-500'}>
          {selectedCountry ? selectedCountry.name : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          <div className="px-3 py-2">
            <input
              type="text"
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          {filteredCountries.map((country) => (
            <button
              key={country.code}
              type="button"
              onClick={() => handleSelect(country)}
              className="w-full text-left px-3 py-2 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:bg-emerald-50 focus:text-emerald-700"
            >
              <div className="flex items-center justify-between">
                <span>{country.name}</span>
                <span className="text-xs text-gray-500">{country.currency}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CountryDropdown;
// components/CountryDropdown.js
import React, { useState, useEffect } from 'react';

const CountryDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies');
      
      if (!response.ok) {
        throw new Error('Failed to fetch countries');
      }
      
      const data = await response.json();
      
      // Transform the API data to our required format
      const formattedCountries = data
        .map(country => {
          const countryName = country.name?.common || 'Unknown Country';
          const currencyCode = Object.keys(country.currencies || {})[0];
          const currencyName = currencyCode ? country.currencies[currencyCode]?.name : 'Unknown Currency';
          const currencySymbol = currencyCode ? country.currencies[currencyCode]?.symbol : '';
          
          return {
            name: countryName,
            currencyCode: currencyCode || 'N/A',
            currencyName: currencyName,
            currencySymbol: currencySymbol
          };
        })
        // Filter out countries without currencies and sort alphabetically
        .filter(country => country.currencyCode !== 'N/A')
        .sort((a, b) => a.name.localeCompare(b.name));

      setCountries(formattedCountries);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      console.error('Error fetching countries:', err);
    }
  };

  const selectedCountry = countries.find(country => country.name === value);

  const handleSelect = (country) => {
    onChange(country.name);
    setIsOpen(false);
    
    // Set the company's base currency in environment
    setCompanyBaseCurrency(country.currencyCode);
  };

  const setCompanyBaseCurrency = (currencyCode) => {
    // Here you would typically set this in your environment/state management
    // For now, we'll log it and you can integrate with your backend
    console.log('Setting company base currency:', currencyCode);
    
    // Example of how you might set it in localStorage or context
    localStorage.setItem('companyBaseCurrency', currencyCode);
    
    // You can also make an API call to set this in your backend
    // await updateCompanyCurrency(currencyCode);
  };

  if (loading) {
    return (
      <div className="relative">
        <div className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left sm:text-sm">
          <span className="block truncate text-gray-500">Loading countries...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative">
        <div className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left sm:text-sm">
          <span className="block truncate text-red-500">Error loading countries</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
      >
        <span className="block truncate">
          {selectedCountry 
            ? `${selectedCountry.name} (${selectedCountry.currencyCode})` 
            : 'Select a country'
          }
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {countries.map((country) => (
            <div
              key={country.name}
              className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 ${
                country.name === value ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
              }`}
              onClick={() => handleSelect(country)}
            >
              <span className="block truncate font-medium">
                {country.name}
              </span>
              <span className="block truncate text-sm text-gray-500">
                {country.currencyCode} - {country.currencyName} {country.currencySymbol && `(${country.currencySymbol})`}
              </span>
              {country.name === value && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CountryDropdown;
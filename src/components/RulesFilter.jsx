import { useState, useEffect } from "react";
import { Calendar,CircleDollarSign , AlertTriangle, Coins } from "lucide-react";

export default function RulesFilter({ onFiltersChange }) {
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedSeverity, setSelectedSeverity] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState([]);
  const Currencies = ['PAB', 'GTQ', 'CRC', 'BRL', 'USD', 'MXN', 'COP'];

  useEffect(() => {
    onFiltersChange?.({ priceRange, selectedSeverity, selectedCurrency })
  }, [priceRange, selectedSeverity, selectedCurrency, onFiltersChange])





  return (
    <div className="w-full mx-auto p-4 bg-white rounded-xl shadow-sm border border-slate-200 h-full overflow-y-auto">

      
      {/* Date Range Filter */}
      <div className="mb-3 p-2 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-600" />
          <span>Date Range</span>
        </h3>
        <div className="flex space-x-2">
          <input
            type="date"
            className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
          />
          <span className="text-xs text-gray-600 self-center">to</span>
          <input
            type="date"
            className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
          />
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-3 p-2 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          < CircleDollarSign  className="w-4 h-4 text-gray-600" />
          <span>Price Range</span>
        </h3>
        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
            className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
          />
          <span className="text-xs text-gray-600 self-center">to</span>
          <input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
            className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
          />
        </div>
      </div>

      {/* Priority Filter */}
      <div className="mb-3 p-2 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-gray-600" />
          <span>Priority</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {['high', 'medium', 'low'].map(level => (
            <label key={level} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="priority"
                value={level}
                checked={selectedSeverity.includes(level)}
                onChange={() => setSelectedSeverity([level])}
                className="sr-only"
              />
              <div className={`px-3 py-2 border-2 rounded-lg text-xs font-medium transition-colors ${
                selectedSeverity.includes(level)
                  ? level === 'high'
                    ? 'bg-red-200 text-red-900 border-red-400 shadow-md'
                    : level === 'medium'
                    ? 'bg-yellow-200 text-yellow-900 border-yellow-400 shadow-md'
                    : 'bg-green-200 text-green-900 border-green-400 shadow-md'
                  : level === 'high'
                    ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                    : level === 'medium'
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                    : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
              }`}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Currency Filter */}
      <div className="mb-3 p-2 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Coins className="w-4 h-4 text-gray-600" />
          <span>Currency</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {Currencies.map((currency, index) => {
            return (
              <button
                key={index}
                onClick={() => {
                  if (selectedCurrency.includes(currency)) {
                    setSelectedCurrency(selectedCurrency.filter(c => c !== currency))
                  } else {
                    setSelectedCurrency([...selectedCurrency, currency])
                  }
                }}
                className={`px-3 py-2 border-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedCurrency.includes(currency)
                    ? 'bg-gray-200 text-gray-900 border-gray-400 shadow-md'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {currency}
              </button>
            );
          })}
        </div>
      </div>


      

    </div>
  );
}
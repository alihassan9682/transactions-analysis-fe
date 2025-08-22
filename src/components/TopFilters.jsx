import { useState ,useEffect, useRef} from "react";
import { Search, Calendar, DollarSign, AlertCircle } from "lucide-react";

export default function TopFilters({ onFiltersChange }) {
 const [selectedRules, setSelectedRules] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRule, setExpandedRule] = useState(null);
  const dropdownRef = useRef()
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("");

  useEffect(() => {
    const mappedRules = selectedRules.map(ruleId => {
      const rule = rules.find(r => r.rule_id === ruleId);
      if (!rule) {
        console.warn(`Rule with ID ${ruleId} not found`);
        return null;
      }
      return { rule_id: ruleId, ...rule };
    }).filter(Boolean);

    onFiltersChange({
      search,
      selectedRules: mappedRules
    });
  }, [search, selectedRules, rules, onFiltersChange]);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await fetch('/data/example_rules.json')
        const data = await response.json()
        
        const processedRules = data.map(rule => ({
          rule_id: rule.rule_id,
          name: rule.name,
          description: rule.description,
          action: rule.action,
          severity: rule.severity.toLowerCase()
        }))
        
        setRules(processedRules)
      } catch (error) {
        console.error('Error fetching rules:', error)
        setRules([
          { rule_id: "RULE_001", name: "High Value Transaction Alert", description: "Flag transactions with an amount greater than a specified threshold.", action: "Alert", severity: "high" },
          { rule_id: "RULE_002", name: "Multiple Small Transactions in Short Period", description: "Identify users with a high frequency of small transactions within a short time frame.", action: "Review", severity: "medium" },
          { rule_id: "RULE_004", name: "Transaction to High-Risk Merchant", description: "Alert on transactions made to merchants identified as high-risk.", action: "Block", severity: "critical" }
        ])
      } finally {
        setLoading(false)
      }
    }
    
    fetchRules()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleExpand = (ruleId) => {
    setExpandedRule(expandedRule === ruleId ? null : ruleId);
  };
  return (
    <div className="bg-gradient-to-r from-white to-gray-50 shadow-lg rounded-xl border border-gray-200 px-6 py-5 mb-4 w-full">
      <div className="flex items-center space-x-4">
  
        <div className="flex flex-col min-w-[300px]">
          <label className="text-sm font-semibold text-gray-800 mb-1">Active Rules</label>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              className={`relative border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:bg-gray-50 shadow-sm w-full text-left cursor-pointer ${
                selectedRules.length > 0 ? 'bg-indigo-50 border-indigo-200' : ''
              }`}
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className={`flex items-center text-xs ${selectedRules.length > 0 ?"bg-indigo-100 text-indigo-800 p-2 rounded-full w-fit":""}  `}>
                <span>{selectedRules.length > 0 ? 'Rules selected' : 'Select rules...'}</span>
                <div className="flex items-center gap-1">
                  {selectedRules.length > 0 && (
                    <>
                      <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium ">
                        {selectedRules.length}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRules([]);
                        }}
                        className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors p-0.5 rounded-full hover:bg-gray-100"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </button>
            {isOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-auto [&::-webkit-scrollbar]:hidden">
                {loading ? (
                  <div className="text-center py-4 text-slate-500">Loading rules...</div>
                ) : (
                  <div className="space-y-2 p-2">
                    {rules.map((rule) => (
                      <div key={rule.rule_id}>
                        <div className={`p-3 rounded-lg border-2 transition-colors ${
                          selectedRules.includes(rule.rule_id)
                            ? rule.severity === "high" || rule.severity === "critical"
                              ? "bg-red-100 border-red-400 shadow-md"
                              : rule.severity === "medium"
                                ? "bg-yellow-100 border-yellow-400 shadow-md"
                                : "bg-green-100 border-green-400 shadow-md"
                            : rule.severity === "high" || rule.severity === "critical"
                              ? "bg-red-50 border-red-200 hover:bg-red-100"
                              : rule.severity === "medium"
                                ? "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
                                : "bg-green-50 border-green-200 hover:bg-green-100"
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={selectedRules.includes(rule.rule_id)}
                                onChange={(e) => {
                                  const newSelectedRules = e.target.checked
                                    ? [...selectedRules, rule.rule_id]
                                    : selectedRules.filter(id => id !== rule.rule_id);
                                  
                                  console.log("Rule selection changed:", {
                                    ruleId: rule.rule_id,
                                    checked: e.target.checked,
                                    newSelectedRules
                                  });
                                  
                                  setSelectedRules(newSelectedRules);
                                }}
                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                              />
                              <span className={`text-sm font-medium ${
                                rule.severity === "high" || rule.severity === "critical"
                                  ? "text-red-900"
                                  : rule.severity === "medium"
                                    ? "text-yellow-900"
                                    : "text-green-900"
                              }`}>{rule.name}</span>
                            </div>
                            <button
                              onClick={() => toggleExpand(rule.rule_id)}
                              className={`p-1 rounded cursor-pointer ${
                                rule.severity === "high" || rule.severity === "critical"
                                  ? "bg-red-200 text-red-800 hover:bg-red-300"
                                  : rule.severity === "medium"
                                    ? "bg-yellow-200 text-yellow-800 hover:bg-yellow-300"
                                    : "bg-green-200 text-green-800 hover:bg-green-300"
                              } transition-colors`}
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                {expandedRule === rule.rule_id ? (
                                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                ) : (
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                )}
                              </svg>
                            </button>
                          </div>
                        </div>

                        {expandedRule === rule.rule_id && (
                          <div className={`mt-1 p-3 rounded-lg border-l-4 mb-2 ${
                            rule.severity === "high" || rule.severity === "critical"
                              ? "bg-red-25 border-red-300"
                              : rule.severity === "medium"
                                ? "bg-yellow-25 border-yellow-300"
                                : "bg-green-25 border-green-300"
                          }`}>
                            <p className="text-xs text-gray-600 mb-2">{rule.description}</p>
                            <div className="flex justify-between items-center">
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">Action:</span> {rule.action}
                              </div>
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">ID:</span> {rule.rule_id}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col flex-1 min-w-[300px]">
          <label className="text-sm font-semibold text-gray-800 mb-1">Search</label>
          <div className="flex">
            <input
              type="text"
              placeholder="Search by receiver, city, country, or merchant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-l-md px-4 py-2 flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white border-r-0 hover:bg-gray-50 shadow-sm"
            />
            <button
              type="button"
              className="border cursor-pointer border-gray-300 rounded-r-md px-4 py-2 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 flex items-center justify-center text-indigo-700 font-medium shadow-sm"
            >
              <Search className="h-5 w-5 " />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
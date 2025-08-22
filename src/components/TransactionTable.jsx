import { useState, useEffect } from "react"
import { useTransactionRules } from './useTransactionRules'

export default function TransactionTable({ filters }) {
    const [selectedTransaction, setSelectedTransaction] = useState(null)
    const [transactions, setTransactions] = useState([])
    const [filteredTransactions, setFilteredTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [showOnlyMatching, setShowOnlyMatching] = useState(false)
    const [rules, setRules] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [totalPages, setTotalPages] = useState(1)
   

    const { evaluateRules, assessRisk } = useTransactionRules(rules, filters.selectedRules)
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const [transactionsResponse, rulesResponse] = await Promise.all([
                    fetch(`/src/data/transactions.json`),
                    fetch(`/src/data/example_rules.json`)
                ])
                
                const transactionsText = await transactionsResponse.text()
                const cleanText = transactionsText.replace(/: NaN([,}])/g, ': null$1')
                const rawData = JSON.parse(cleanText)
                const rulesData = await rulesResponse.json()
                
                setRules(rulesData)
                
                // Filter out transactions with NaN values
                const validData = rawData
                    .filter(txn => 
                        txn.amount != null && 
                        !isNaN(txn.amount) &&
                        txn.sender_account_id &&
                        txn.receiver_account_id
                    )
                
                const processedData = validData.map((txn, index) => ({
                    id: `txn-${index}`,
                    amount: txn.amount,
                    sender: txn.sender_account_id,
                    receiver: txn.receiver_account_id,
                    timestamp: txn.txn_date_time,
                    currency: txn.currency,
                    type: txn.transaction_type,
                    city: txn.merchant_city || 'Unknown',
                    country: txn.merchant_country || 'Unknown',
                    risk: assessRisk(txn),
                    rawFeatures: txn
                }))
                
                setTransactions(processedData)
                setLoading(false)
            } catch (error) {
                console.error('Error fetching transactions:', error)
                setTransactions([])
                setLoading(false)
            }
        }
        
        fetchTransactions()
    }, [assessRisk])
    
    useEffect(() => {
        console.log("Filtering with:", { filters, showOnlyMatching });
        
        if (!Array.isArray(transactions) || transactions.length === 0) {
            console.log("No transactions to filter");
            setFilteredTransactions([]);
            return;
        }

        let filtered = [...transactions];

        // Process each transaction to evaluate rules and add analysis data
        filtered = filtered.map(transaction => {
            try {
                // Get rule evaluation results
                const evaluatedRules = evaluateRules(transaction.rawFeatures);
                
                if (!Array.isArray(evaluatedRules)) {
                    console.warn("evaluateRules returned non-array:", evaluatedRules);
                    return transaction;
                }
                
                // Count triggered rules and store which ones triggered
                const triggeredRules = evaluatedRules.filter(r => r?.triggered);
                
                return {
                    ...transaction,
                    evaluatedRules,
                    triggeredRulesCount: triggeredRules.length,
                    hasTriggeredRules: triggeredRules.length > 0,
                    matchingRulesDetails: evaluatedRules
                };
            } catch (error) {
                console.error("Error processing transaction:", error);
                return transaction;
            }
        });

        // Handle rule filtering
        if (filters.selectedRules?.length > 0) {
            console.log("Applying rule filters:", filters.selectedRules);
            
            // Separate transactions that trigger rules from those that don't
            const triggeredTransactions = filtered.filter(t => t.hasTriggeredRules);
            const nonTriggeredTransactions = filtered.filter(t => !t.hasTriggeredRules);

            console.log(
                `Found ${triggeredTransactions.length} triggered and ${nonTriggeredTransactions.length} non-triggered transactions`
            );

            // Sort transactions by number of triggered rules and risk level
            const sortByRulesAndRisk = (a, b) => {
                // First by number of triggered rules
                if (a.triggeredRulesCount !== b.triggeredRulesCount) {
                    return b.triggeredRulesCount - a.triggeredRulesCount;
                }
                
                // Then by risk level
                const riskOrder = { high: 3, medium: 2, low: 1 };
                return (riskOrder[b.risk] || 0) - (riskOrder[a.risk] || 0);
            };

            // Sort both groups
            triggeredTransactions.sort(sortByRulesAndRisk);
            nonTriggeredTransactions.sort(sortByRulesAndRisk);

            // Show only triggered transactions if toggle is on, otherwise show all
            filtered = showOnlyMatching 
                ? triggeredTransactions 
                : [...triggeredTransactions, ...nonTriggeredTransactions];
        }

        // Apply search filter if present
        if (filters.search?.trim()) {
            console.log("Applying search filter:", filters.search);
            
            const searchTerm = filters.search.toLowerCase().trim();
            const searchTerms = searchTerm.split(/\s+/);
            
            filtered = filtered.filter(transaction => {
                const searchableText = [
                    transaction.sender,
                    transaction.receiver,
                    transaction.city,
                    transaction.country,
                    transaction.type,
                    transaction.amount?.toString(),
                    transaction.currency
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                
                return searchTerms.every(term => searchableText.includes(term));
            });
        }

        // Apply date filter
        if (filters.date) {
            console.log("Applying date filter:", filters.date);
            filtered = filtered.filter(transaction =>
                transaction.timestamp?.startsWith(filters.date)
            );
        }

        // Apply priority/severity filter
        if (filters.priority) {
            console.log("Applying priority filter:", filters.priority);
            filtered = filtered.filter(transaction =>
                transaction.risk === filters.priority.toLowerCase()
            );
        }

        if (filters.priceRange) {
            const { min, max } = filters.priceRange;
            if (min !== "") {
                filtered = filtered.filter(t => t.amount >= parseFloat(min));
            }
            if (max !== "") {
                filtered = filtered.filter(t => t.amount <= parseFloat(max));
            }
        }

        if (filters.selectedCurrency?.length > 0) {
            filtered = filtered.filter(t => 
                filters.selectedCurrency.includes(t.currency)
            );
        }

        console.log(`Filtering complete. Showing ${filtered.length} transactions`);
        setFilteredTransactions(filtered);
        setTotalPages(Math.ceil(filtered.length / pageSize));
    }, [filters, transactions, rules, evaluateRules, showOnlyMatching, pageSize])

    return(
        <>
         {/* Enhanced Transaction Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
          <div className="px-4 sm:px-6 lg:px-8 py-1 border-b border-slate-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Transaction Analysis</h2>
              {filters.selectedRules?.length > 0 && (
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-600">Show only matching transactions</label>
                  <button
                    onClick={() => setShowOnlyMatching(!showOnlyMatching)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer ${
                      showOnlyMatching ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className="sr-only">Toggle filter mode</span>
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        showOnlyMatching ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>
            <p className="text-slate-600 text-sm">
              {loading ? 'Loading transactions...' : `Showing ${filteredTransactions.length} transactions`}
            </p>
          </div>

          {/* Pagination Controls Top */}
          <div className="px-4 sm:px-6 py-3 border-b border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">Show entries:</label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="border border-slate-200 rounded-md text-sm p-2 pr-8 cursor-pointer bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none"
              >
                <option value={20}>20 entries</option>
                <option value={30}>30 entries</option>
                <option value={50}>50 entries</option>
                <option value={75}>75 entries</option>
                <option value={100}>100 entries</option>
              </select>
            </div>
            <div className="text-sm text-slate-600">
              Showing {Math.min((currentPage - 1) * pageSize + 1, filteredTransactions.length)} to {Math.min(currentPage * pageSize, filteredTransactions.length)} of {filteredTransactions.length} entries
            </div>
          </div>

          <div className="flex flex-col">
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-slate-500">Loading transactions...</div>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-slate-500">No transactions found</div>
                </div>
              ) : (
                <div className="hidden sm:block">
                <table className="w-full min-w-full">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Sender
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Receiver
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Risk
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Rules
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredTransactions
                      .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                      .map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-slate-700">
                          <div className="font-mono text-xs text-slate-500">{transaction.sender?.slice(0, 8)}...</div>
                          <div className="text-xs text-slate-600">{transaction.city}, {transaction.country}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-slate-700 truncate max-w-32">{transaction.receiver}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-slate-900 font-semibold">
                          {transaction.amount?.toLocaleString()} {transaction.currency}
                        </td>
                        <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 text-sm text-slate-600">
                          {new Date(transaction.timestamp).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true
                          })}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                            transaction.risk === "high" ? "bg-red-100 text-red-700" :
                            transaction.risk === "medium" ? "bg-yellow-100 text-yellow-700" :
                            "bg-green-100 text-green-700"
                          }`}>
                            {transaction.risk}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          {filters.selectedRules?.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {transaction.matchingRulesDetails.slice(0, 2).map(rule => (
                                <span
                                  key={rule.rule_id}
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                    rule.triggered
                                      ? rule.severity === 'high' || rule.severity === 'critical'
                                        ? 'bg-red-100 text-red-700'
                                        : rule.severity === 'medium'
                                          ? 'bg-yellow-100 text-yellow-700'
                                          : 'bg-green-100 text-green-700'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                   {rule.rule_id}
                                </span>
                              ))}
                              {transaction.matchingRulesDetails.length > 2 && (
                                <span className="text-xs text-gray-500">+{transaction.matchingRulesDetails.length - 2} more</span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">NA</span>
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <button
                            onClick={() => setSelectedTransaction({
                              ...transaction,
                              appliedRules: evaluateRules(transaction.rawFeatures),
                              features: {
                                transaction_count: transaction.rawFeatures.transaction_count,
                                avg_transaction_amount: transaction.rawFeatures.avg_transaction_amount,
                                hour_of_day: transaction.rawFeatures.hour_of_day,
                                day_of_week: transaction.rawFeatures.day_of_week,
                                merchant_avg_transaction_amount: transaction.rawFeatures.merchant_avg_transaction_amount
                              }
                            })}
                            className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-2 bg-indigo-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-indigo-700 transition-all duration-200 cursor-pointer"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span className="hidden sm:inline">Analyze</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Mobile Card View */}
            </div>
            
            {/* Pagination Controls Bottom - Always Visible */}
            {!loading && filteredTransactions.length > 0 && (
              <div className="px-4 sm:px-6 py-1 border-t border-slate-200 flex justify-center items-center gap-2 bg-white sticky bottom-0">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 cursor-pointer border border-slate-200 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  First
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-2 cursor-pointer py-1 border border-slate-200 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {(() => {
                    const totalPages = Math.ceil(filteredTransactions.length / pageSize);
                    const visiblePages = [];
                    let startPage = Math.max(1, currentPage - 2);
                    let endPage = Math.min(totalPages, startPage + 4);
                    
                    // Adjust start page if we're near the end
                    if (endPage - startPage < 4) {
                      startPage = Math.max(1, endPage - 4);
                    }

                    // Add first page and ellipsis if needed
                    if (startPage > 1) {
                      visiblePages.push(1);
                      if (startPage > 2) visiblePages.push('...');
                    }

                    // Add visible page numbers
                    for (let i = startPage; i <= endPage; i++) {
                      visiblePages.push(i);
                    }

                    // Add last page and ellipsis if needed
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) visiblePages.push('...');
                      visiblePages.push(totalPages);
                    }

                    return visiblePages.map((pageNum, index) => {
                      if (pageNum === '...') {
                        return <span key={`ellipsis-${index}`} className="px-2">...</span>;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 rounded-md text-sm cursor-pointer ${
                            currentPage === pageNum
                              ? 'bg-indigo-600 text-white'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    });
                  })()}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredTransactions.length / pageSize), prev + 1))}
                  disabled={currentPage === Math.ceil(filteredTransactions.length / pageSize)}
                  className="px-2 py-1 border cursor-pointer border-slate-200 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Next
                </button>
                <button
                  onClick={() => setCurrentPage(Math.ceil(filteredTransactions.length / pageSize))}
                  disabled={currentPage === Math.ceil(filteredTransactions.length / pageSize)}
                  className="px-2 py-1 cursor-pointer border border-slate-200 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Last
                </button>
              </div>
            )}
            <div className="sm:hidden space-y-4 p-4">
              {filteredTransactions
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .map((transaction) => (
                <div key={transaction.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="font-mono text-xs text-slate-500 mb-1">{transaction.sender?.slice(0, 12)}...</div>
                      <div className="text-sm font-semibold text-slate-900">
                        {transaction.amount?.toLocaleString()} {transaction.currency}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.risk === "high" ? "bg-red-100 text-red-700" :
                      transaction.risk === "medium" ? "bg-yellow-100 text-yellow-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      {transaction.risk}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mb-3">
                    <div>To: {transaction.receiver}</div>
                    <div>{new Date(transaction.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                      hour12: true
                    })}</div>
                  </div>
                  <button
                    onClick={() => setSelectedTransaction(transaction)}
                    className="w-full inline-flex justify-center items-center px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-all duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Analyze Transaction
                  </button>
                </div>
              ))}
              
              {/* Mobile Pagination Controls */}
              <div className="flex flex-col items-center gap-2 mt-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-600">Show entries:</label>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="border border-slate-200 rounded-md text-sm p-2 pr-8 cursor-pointer bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none"
                  >
                    <option value={20}>20 entries</option>
                    <option value={30}>30 entries</option>
                    <option value={50}>50 entries</option>
                    <option value={75}>75 entries</option>
                    <option value={100}>100 entries</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border cursor-pointer border-slate-200 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-600">
                    Page {currentPage} of {Math.ceil(filteredTransactions.length / pageSize)}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredTransactions.length / pageSize), prev + 1))}
                    disabled={currentPage === Math.ceil(filteredTransactions.length / pageSize)}
                    className="px-3 py-1 cursor-pointer border border-slate-200 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Analysis Modal */}
        {selectedTransaction && (
          <div className="fixed inset-0 bg-opacity-10 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="rounded-xl shadow-2xl bg-white max-w-4xl max-h-[90vh] overflow-y-auto w-full [scrollbar-width:none] [-ms-overflow-style:none] 
                [&::-webkit-scrollbar]:hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Transaction Analysis</h3>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Transaction Details</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs text-gray-500">Transaction ID</span>
                        <p className="font-mono text-sm">{selectedTransaction.id}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Amount</span>
                        <p className="text-lg font-semibold">{selectedTransaction.amount.toLocaleString()} {selectedTransaction.currency}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Timestamp</span>
                        <p className="text-sm">{new Date(selectedTransaction.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric',
                          hour12: true
                        })}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Type</span>
                        <p className="text-sm capitalize">{selectedTransaction.type}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Parties & Location</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs text-gray-500">Sender</span>
                        <p className="font-mono text-sm">{selectedTransaction.sender}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Receiver</span>
                        <p className="text-sm">{selectedTransaction.receiver}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Location</span>
                        <p className="text-sm">{selectedTransaction.city}, {selectedTransaction.country}</p>
                      </div>
                      <div className="space-x-2">
                        <span className="text-xs text-gray-500">Risk Level</span>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          selectedTransaction.risk === "high" ? "bg-red-100 text-red-700" :
                          selectedTransaction.risk === "medium" ? "bg-yellow-100 text-yellow-700" :
                          "bg-green-100 text-green-700"
                        }`}>
                          {selectedTransaction.risk.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Applied Rules & Features</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="bg-white rounded p-3 border-l-4 border-blue-500">
                        <div className="text-sm font-medium text-gray-900 mb-2">RULE_001: High Value Transaction Alert</div>
                        <div className="text-xs text-gray-600 mb-2">Condition: amount `&gt; 1000</div>
                        <div className="flex justify-between text-sm">
                          <span>Current Amount:</span>
                          <span className={selectedTransaction.amount > 1000 ? "text-red-600 font-semibold" : "text-green-600"}>
                            {selectedTransaction.amount.toLocaleString()} {selectedTransaction.currency}
                          </span>
                        </div>
                        <div className="text-xs mt-1">
                          <span className={`px-2 py-1 rounded ${selectedTransaction.amount > 1000 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                            {selectedTransaction.amount > 1000 ? "TRIGGERED" : "NOT TRIGGERED"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded p-3 border-l-4 border-yellow-500">
                        <div className="text-sm font-medium text-gray-900 mb-2">RULE_002: Multiple Transactions Alert</div>
                        <div className="text-xs text-gray-600 mb-2">Condition: transaction_count &gt; 5</div>
                        <div className="flex justify-between text-sm">
                          <span>Transaction Count:</span>
                          <span className={selectedTransaction.features?.transaction_count > 5 ? "text-red-600 font-semibold" : "text-green-600"}>
                            {selectedTransaction.features?.transaction_count || 0}
                          </span>
                        </div>
                        <div className="text-xs mt-1">
                          <span className={`px-2 py-1 rounded ${selectedTransaction.features?.transaction_count > 5 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                            {selectedTransaction.features?.transaction_count > 5 ? "TRIGGERED" : "NOT TRIGGERED"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded p-3 border-l-4 border-purple-500">
                        <div className="text-sm font-medium text-gray-900 mb-2">RULE_003: Off-Hours Transaction</div>
                        <div className="text-xs text-gray-600 mb-2">Condition: hour_of_day &gt; 22 OR hour_of_day &lt; 6</div>
                        <div className="flex justify-between text-sm">
                          <span>Hour of Day:</span>
                          <span className={(selectedTransaction.features?.hour_of_day > 22 || selectedTransaction.features?.hour_of_day < 6) ? "text-red-600 font-semibold" : "text-green-600"}>
                            {selectedTransaction.features?.hour_of_day || 0}:00
                          </span>
                        </div>
                        <div className="text-xs mt-1">
                          <span className={`px-2 py-1 rounded ${(selectedTransaction.features?.hour_of_day > 22 || selectedTransaction.features?.hour_of_day < 6) ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                            {(selectedTransaction.features?.hour_of_day > 22 || selectedTransaction.features?.hour_of_day < 6) ? "TRIGGERED" : "NOT TRIGGERED"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </>
    )
}

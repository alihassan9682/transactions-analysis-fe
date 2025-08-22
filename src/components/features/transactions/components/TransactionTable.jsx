import { useMemo, useState } from "react";
import { useTransactions } from "../hooks/useTransactions";
import { useTransactionFiltering } from "../hooks/useTransactionFiltering";
import { usePagination } from "../hooks/usePagination";
import { formatWhen, riskPillClasses } from "../utils/format";
import Pagination from "./Pagination";
import RuleChips from "./RuleChips";
import AnalysisModal from "./AnalysisModal";
import { useTransactionRules } from "../../../useTransactionRules";

export default function TransactionTable({ filters }) {
  const { transactions: base, rules, loading } = useTransactions();
  const [showOnlyMatching, setShowOnlyMatching] = useState(false);
  const { evaluateRules, assessRisk } = useTransactionRules(rules, filters?.selectedRules || []);

  const filtered = useTransactionFiltering(base, filters || {}, { evaluateRules, assessRisk }, showOnlyMatching);
  const { currentPage, totalPages, pageItems, pageSize, setPageSize, setCurrentPage } =
    usePagination(filtered, 20);

  const shownCount = filtered.length;
  const [selected, setSelected] = useState(null);

  const pageSummary = useMemo(() => {
    const start = Math.min((currentPage - 1) * pageSize + 1, shownCount);
    const end = Math.min(currentPage * pageSize, shownCount);
    return `Showing ${start} to ${end} of ${shownCount} entries`;
  }, [currentPage, pageSize, shownCount]);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full w-full">
        <div className="px-4 sm:px-6 lg:px-8 py-1 border-b border-slate-200">
          <div className="flex justify-between items-center border-b border-slate-300 py-2">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-600 mt-2 ">Transaction Analysis</h2>
            {filters?.selectedRules?.length ? (
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600">Show only matching transactions</label>
                <button
                  onClick={() => setShowOnlyMatching((v) => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer ${
                    showOnlyMatching ? "bg-indigo-600" : "bg-gray-200"
                  }`}
                >
                  <span className="sr-only">Toggle filter mode</span>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showOnlyMatching ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>
              </div>
            ) : null}
          </div>
          <div className="flex items-center justify-between py-3 mt-2">
             <p className="text-slate-500 text-xs mt-1">{pageSummary}</p>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">Show entries:</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border border-slate-200 rounded-md text-xs px-2 py-2  cursor-pointer bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none"
              >
                <option value={20}>20 entries</option>
                <option value={30}>30 entries</option>
                <option value={50}>50 entries</option>
                <option value={75}>75 entries</option>
                <option value={100}>100 entries</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-slate-500">Loading transactions...</div>
              </div>
            ) : !filtered.length ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-slate-500">No transactions found</div>
              </div>
            ) : (
              <>
                <div className="hidden sm:block">
                  <table className="w-full min-w-full">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Sender</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Receiver</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Amount</th>
                        <th className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Timestamp</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Risk</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Rules</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {pageItems.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-slate-700">
                            <div className="font-mono text-xs text-slate-500">{t.sender?.slice(0, 8)}...</div>
                            <div className="text-xs text-slate-600">{t.city}, {t.country}</div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-slate-700 truncate max-w-32">{t.receiver}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-slate-900 font-semibold">
                            {t.amount.toLocaleString()} {t.currency}
                          </td>
                          <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 text-sm text-slate-600">
                            {formatWhen(t.timestamp)}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${riskPillClasses(t.risk)}`}>
                              {t.risk}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            {filters?.selectedRules?.length ? (
                              <RuleChips rules={t.evaluatedRules} />
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">NA</span>
                            )}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <button
                              onClick={() => setSelected(t)}
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

                {/* Mobile card list (no per-card pagination) */}
                <div className="sm:hidden space-y-4 p-4">
                  {pageItems.map((t) => (
                    <div key={t.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="font-mono text-xs text-slate-500 mb-1">{t.sender?.slice(0, 12)}...</div>
                          <div className="text-sm font-semibold text-slate-900">
                            {t.amount.toLocaleString()} {t.currency}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskPillClasses(t.risk)}`}>
                          {t.risk}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mb-3">
                        <div>To: {t.receiver}</div>
                        <div>{formatWhen(t.timestamp)}</div>
                      </div>
                      <button
                        onClick={() => setSelected(t)}
                        className="w-full inline-flex justify-center items-center px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-all duration-200"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" />
                        </svg>
                        Analyze Transaction
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {!loading && filtered.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onFirst={() => setCurrentPage(1)}
              onPrev={() => setCurrentPage(currentPage - 1)}
              onJump={(n) => setCurrentPage(n)}
              onNext={() => setCurrentPage(currentPage + 1)}
              onLast={() => setCurrentPage(totalPages)}
            />
          )}
        </div>
      </div>

      {selected && (
        <AnalysisModal
          tx={{
            ...selected,
            features: {
              transaction_count: selected.raw?.transaction_count,
              avg_transaction_amount: selected.raw?.avg_transaction_amount,
              hour_of_day: selected.raw?.hour_of_day,
              day_of_week: selected.raw?.day_of_week,
              merchant_avg_transaction_amount: selected.raw?.merchant_avg_transaction_amount,
            },
          }}
                    selectedRules ={filters?.selectedRules?.length ? selected.evaluatedRules : []}

          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

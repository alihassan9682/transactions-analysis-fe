import { formatWhen, riskPillClasses } from "../utils/format";
import { useTransactions } from "../hooks/useTransactions";

export default function AnalysisModal({ tx, onClose, selectedRules }) {
  const { rules } = useTransactions();

const appliedRules = selectedRules?.length
  ? rules.filter((r) => selectedRules.some((rule) => rule.rule_id === r.rule_id))
  : [];

    console.log(appliedRules)

  return (
    <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="rounded-xl shadow-2xl bg-white max-w-4xl max-h-[90vh] overflow-y-auto w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Transaction Analysis</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Transaction details */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Transaction Details</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500">Transaction ID</span>
                  <p className="font-mono text-sm">{tx.id}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Amount</span>
                  <p className="text-lg font-semibold">
                    {tx.amount.toLocaleString()} {tx.currency}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Timestamp</span>
                  <p className="text-sm">{formatWhen(tx.timestamp)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Type</span>
                  <p className="text-sm capitalize">{tx.type}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Parties & Location</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500">Sender</span>
                  <p className="font-mono text-sm">{tx.sender}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Receiver</span>
                  <p className="text-sm">{tx.receiver}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Location</span>
                  <p className="text-sm">
                    {tx.city}, {tx.country}
                  </p>
                </div>
                <div className="space-x-2">
                  <span className="text-xs text-gray-500">Risk Level</span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${riskPillClasses(tx.risk)}`}>
                    {String(tx.risk || "").toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rules Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-500 mb-3">Applied Rules & Features</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              {appliedRules.length > 0 ? (
                <div className="space-y-3">
                  {appliedRules.map((rule) => (
                    <div
                      key={rule.rule_id}
                      className={`bg-white rounded p-3 border-l-4 ${
                        rule.severity === "High"
                          ? "border-red-500"
                          : rule.severity === "Medium"
                          ? "border-yellow-500"
                          : rule.severity === "Low"
                          ? "border-green-500"
                          : "border-gray-400"
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900 mb-2">
                        {rule.rule_id}: {rule.name}
                      </div>
                      <div className="text-xs text-gray-600 mb-2">{rule.description}</div>
                      <div className="flex justify-between text-sm">
                        <span>Action:</span>
                        <span className="font-semibold">{rule.action}</span>
                      </div>
                      <div className="text-xs mt-1">
                        <span
                          className={`px-2 py-1 rounded ${
                            tx?.evaluatedRules?.some((r) => r.rule_id === rule.rule_id && r.triggered)
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {tx?.evaluatedRules?.some((r) => r.rule_id === rule.rule_id && r.triggered)
                            ? "TRIGGERED"
                            : "NOT TRIGGERED"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No rules applied.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

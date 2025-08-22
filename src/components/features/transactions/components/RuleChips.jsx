export default function RuleChips({ rules }) {
  if (!rules || rules.length === 0) return null; // safeguard

  const displayed = rules.slice(0, 2);
  const extraCount = rules.length - displayed.length;

  return (
    <div className="flex gap-2 flex-wrap">
      {displayed.map((rule) => (
        <span
          key={rule.rule_id}
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
            ${
              rule.triggered
                ? rule.severity?.toLowerCase() === "high" || rule.severity?.toLowerCase() === "critical"
                  ? "bg-red-100 text-red-700"
                  : rule.severity?.toLowerCase() === "medium"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
        >
          {rule.rule_id}
        </span>
      ))}

      {extraCount > 0 && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          +{extraCount} more
        </span>
      )}
    </div>
  );
}

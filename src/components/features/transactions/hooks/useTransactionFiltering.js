import { useMemo } from "react";

export function useTransactionFiltering(base, filters, fns, showOnlyMatching) {
  const enriched = useMemo(() => {
    return base.map((t) => {
      let evaluated = [];
      try {
        const maybe = fns.evaluateRules(t.raw);
        evaluated = Array.isArray(maybe) ? maybe : [];
      } catch {
        evaluated = [];
      }
      const triggered = evaluated.filter((r) => r && r.triggered);
      let risk = "low";
      try {
        risk = fns.assessRisk(t.raw) || "low";
      } catch {
        risk = "low";
      }
      return {
        ...t,
        risk,
        evaluatedRules: evaluated,
        triggeredRulesCount: triggered.length,
        hasTriggeredRules: triggered.length > 0,
      };
    });
  }, [base, fns]);

  const filtered = useMemo(() => {
    let arr = enriched;

    if (filters?.selectedRules?.length) {
      const triggered = arr.filter((t) => t.hasTriggeredRules);
      const nonTriggered = arr.filter((t) => !t.hasTriggeredRules);
      const riskOrder = { high: 3, medium: 2, low: 1 };
      const sortFn = (a, b) => {
        if (a.triggeredRulesCount !== b.triggeredRulesCount)
          return b.triggeredRulesCount - a.triggeredRulesCount;
        return (riskOrder[b.risk] || 0) - (riskOrder[a.risk] || 0);
        };
      triggered.sort(sortFn);
      nonTriggered.sort(sortFn);
      arr = showOnlyMatching ? triggered : [...triggered, ...nonTriggered];
    }

    if (filters?.search?.trim()) {
      const terms = filters.search.toLowerCase().trim().split(/\s+/);
      arr = arr.filter((t) => {
        const blob = [
          t.sender,
          t.receiver,
          t.city,
          t.country,
          t.type,
          t.amount?.toString(),
          t.currency,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return terms.every((term) => blob.includes(term));
      });
    }
if (filters?.selectedDateRange?.start || filters?.selectedDateRange?.end) {
  arr = arr.filter((t) => {
    if (!t.timestamp) return false;
    
    const txDate = new Date(t.timestamp);
    if (isNaN(txDate.getTime())) return false;
    
    const txDateStr = txDate.toISOString().split('T')[0];
    
    if (filters.selectedDateRange.start && txDateStr < filters.selectedDateRange.start) {
      return false;
    }
    if (filters.selectedDateRange.end && txDateStr > filters.selectedDateRange.end) {
      return false;
    }
    
    return true;
  });
  
  // If no results after date filtering, return empty array
  if (arr.length === 0) {
    return [];
  }
}


    if (filters?.priority) {
      arr = arr.filter((t) => t.risk === filters.priority);
    }

    if (filters?.priceRange) {
      const { min, max } = filters.priceRange;
      if (min !== "") arr = arr.filter((t) => t.amount >= parseFloat(min));
      if (max !== "") arr = arr.filter((t) => t.amount <= parseFloat(max));
    }

    if (filters?.selectedCurrency?.length) {
      const set = new Set(filters.selectedCurrency);
      arr = arr.filter((t) => set.has(t.currency));
    }

    return arr;
  }, [enriched, filters, showOnlyMatching]);

  return filtered;
}

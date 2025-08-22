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

      // 🟢 Precompute dayStamp (midnight timestamp for date-only comparison)
      let dayStamp = null;
      if (t.timestamp) {
        const d = new Date(t.timestamp);
        if (!isNaN(d.getTime())) {
          d.setHours(0, 0, 0, 0); // normalize to start of day
          dayStamp = d.getTime();
        }
      }

      return {
        ...t,
        risk,
        evaluatedRules: evaluated,
        triggeredRulesCount: triggered.length,
        hasTriggeredRules: triggered.length > 0,
        dayStamp, // fast date-only value
      };
    });
  }, [base, fns]);

  const filtered = useMemo(() => {
    let arr = enriched;

    // 🟢 Rule filter
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

    // 🟢 Search filter
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

    if (filters?.selectedDateRange?.start && filters?.selectedDateRange?.end) {
      const start = filters.selectedDateRange.start
        ? new Date(filters.selectedDateRange.start).setHours(0, 0, 0, 0)
        : null;

      const end = filters.selectedDateRange.end
        ? new Date(filters.selectedDateRange.end).setHours(0, 0, 0, 0)
        : null;

      arr = arr.filter((t) => {
        if (t.dayStamp == null) return false;
        if (start !== null && t.dayStamp < start) return false;
        if (end !== null && t.dayStamp > end) return false;
        return true;
      });
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

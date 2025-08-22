import { useEffect, useState } from "react";
import { cleanNaNJson } from "../utils/cleanJson";

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [tRes, rRes] = await Promise.all([
          fetch(`/data/transactions.json`),
          fetch(`/data/example_rules.json`),
        ]);
        const tText = await tRes.text();
        const raw = JSON.parse(cleanNaNJson(tText));
        const rulesData = await rRes.json();
        if (cancelled) return;

        setRules(rulesData);

        const valid = (Array.isArray(raw) ? raw : []).filter(
          (x) =>
            x &&
            x.amount != null &&
            !Number.isNaN(x.amount) &&
            x.sender_account_id &&
            x.receiver_account_id
        );

        const mapped = valid.map((txn, i) => ({
          id: `txn-${i}`,
          amount: txn.amount,
          sender: txn.sender_account_id,
          receiver: txn.receiver_account_id,
          timestamp: txn.txn_date_time,
          currency: txn.currency,
          type: txn.transaction_type,
          city: txn.merchant_city || "Unknown",
          country: txn.merchant_country || "Unknown",
          raw: txn,
        }));

        setTransactions(mapped);
      } catch {
        setTransactions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { transactions, rules, loading };
}

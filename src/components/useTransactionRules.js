import { useCallback } from 'react';

export function useTransactionRules(rules, selectedRules) {
  const evaluateRules = useCallback((txn) => {
    // Define rule conditions and evaluations with more sophisticated logic
    const ruleEvaluations = {
      'RULE_001': {
        condition: 'amount > 1000',
        evaluate: (t) => {
          const amount = parseFloat(t.amount);
          return !isNaN(amount) && amount > 1000;
        }
      },
      'RULE_002': {
        condition: 'transaction_count > 5',
        evaluate: (t) => {
          const count = parseInt(t.transaction_count);
          return !isNaN(count) && count > 5;
        }
      },
      'RULE_003': {
        condition: 'unusual transaction type',
        evaluate: (t) => {
          const unusualTypes = ['refund', 'reversal', 'chargeback'];
          return unusualTypes.includes(t.transaction_type?.toLowerCase());
        }
      },
      'RULE_004': {
        condition: 'high-risk merchant locations',
        evaluate: (t) => {
          // Example: Consider certain locations as high-risk
          const highRiskCountries = ['COL', 'VEN', 'NIC'];
          return highRiskCountries.includes(t.merchant_country);
        }
      },
      'RULE_005': {
        condition: 'cross-border transaction with high amount',
        evaluate: (t) => {
          const amount = parseFloat(t.amount);
          // If transaction currency is different from merchant's typical currency
          const isCrossBorder = t.currency !== 'PAB';
          return !isNaN(amount) && isCrossBorder && amount > 500;
        }
      },
      'RULE_006': {
        condition: 'hour_of_day > 22 OR hour_of_day < 6',
        evaluate: (t) => {
          const hour = parseInt(t.hour_of_day);
          return !isNaN(hour) && (hour > 22 || hour < 6);
        }
      },
      'RULE_007': {
        condition: 'large cash withdrawal',
        evaluate: (t) => {
          const amount = parseFloat(t.amount);
          return !isNaN(amount) && 
                 t.transaction_type?.toLowerCase() === 'withdrawal' && 
                 amount > 1000;
        }
      }
    };

    // Helper function to evaluate a single rule
    const evaluateRule = (rule) => {
      if (!rule || !rule.rule_id) {
        console.warn('Invalid rule object:', rule);
        return null;
      }

      const ruleEval = ruleEvaluations[rule.rule_id] || {
        condition: 'No condition defined',
        evaluate: () => false
      };

      const triggered = ruleEval.evaluate(txn);
      
      return {
        ...rule,
        condition: ruleEval.condition,
        triggered,
        featureValues: {
          amount: txn.amount,
          transaction_count: txn.transaction_count,
          hour_of_day: txn.hour_of_day,
          transaction_type: txn.transaction_type,
          merchant_country: txn.merchant_country,
          currency: txn.currency
        }
      };
    };

    // Evaluate only selected rules if any are selected, otherwise evaluate all rules
    const rulesToEvaluate = selectedRules?.length > 0 
      ? selectedRules.filter(Boolean)
      : rules;

    return rulesToEvaluate.map(evaluateRule).filter(Boolean);
  }, [rules, selectedRules]);
  
  const assessRisk = useCallback((txn) => {
    // Evaluate all rules for the transaction
    const triggeredRules = evaluateRules(txn);
    
    // Check for any critical severity rules
    if (triggeredRules.some(rule => 
      rule.triggered && (rule.severity === 'critical' || rule.severity === 'Critical'))) {
      return 'high';
    }
    
    // Check for high severity rules
    if (triggeredRules.some(rule => 
      rule.triggered && (rule.severity === 'high' || rule.severity === 'High'))) {
      return 'high';
    }
    
    // Check for medium severity rules
    if (triggeredRules.some(rule => 
      rule.triggered && (rule.severity === 'medium' || rule.severity === 'Medium'))) {
      return 'medium';
    }
    
    // Check for low severity rules
    if (triggeredRules.some(rule => 
      rule.triggered && (rule.severity === 'low' || rule.severity === 'Low'))) {
      return 'low';
    }
    
    // If no rules are triggered
    return 'low';
  }, [evaluateRules]);

  return { evaluateRules, assessRisk };
}

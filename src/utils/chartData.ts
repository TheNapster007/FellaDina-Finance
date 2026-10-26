import { Transaction, CategoryBudget, MonthlyDataPoint } from '../types';

export interface CategoryChartItem {
  id: string;
  label: string;
  labelDarija: string;
  amount: number;
  percentage: number;
  color: string;
  count: number;
}

export interface MonthlyChartItem {
  monthKey: string; // YYYY-MM
  label: string;
  shortLabel: string;
  income: number;
  expense: number;
  net: number;
  savingsRate: number;
}

const MONTH_NAMES_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const MONTH_NAMES_SHORT = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'
];

/**
 * Dynamically aggregates transactions by calendar month
 */
export function computeMonthlyAggregation(transactions: Transaction[]): MonthlyChartItem[] {
  const monthMap = new Map<string, { income: number; expense: number }>();

  // If no transactions, return current month with 0
  if (!transactions || transactions.length === 0) {
    const now = new Date();
    const currKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthIndex = now.getMonth();
    return [
      {
        monthKey: currKey,
        label: `${MONTH_NAMES_FR[monthIndex]} ${now.getFullYear()}`,
        shortLabel: `${MONTH_NAMES_SHORT[monthIndex]}`,
        income: 0,
        expense: 0,
        net: 0,
        savingsRate: 0,
      },
    ];
  }

  // Aggregate user transactions
  transactions.forEach((tx) => {
    if (!tx.date) return;
    const monthKey = tx.date.substring(0, 7); // YYYY-MM
    const current = monthMap.get(monthKey) || { income: 0, expense: 0 };
    if (tx.type === 'income') {
      current.income += tx.amount;
    } else {
      current.expense += tx.amount;
    }
    monthMap.set(monthKey, current);
  });

  // Sort chronologically
  const sortedKeys = Array.from(monthMap.keys()).sort();

  return sortedKeys.map((key) => {
    const [yearStr, monthStr] = key.split('-');
    const monthIndex = parseInt(monthStr, 10) - 1;
    const data = monthMap.get(key) || { income: 0, expense: 0 };
    const net = data.income - data.expense;
    const savingsRate = data.income > 0 ? (net / data.income) * 100 : 0;

    return {
      monthKey: key,
      label: `${MONTH_NAMES_FR[monthIndex] || monthStr} ${yearStr}`,
      shortLabel: `${MONTH_NAMES_SHORT[monthIndex] || monthStr}`,
      income: data.income,
      expense: data.expense,
      net,
      savingsRate,
    };
  });
}

/**
 * Computes expense or income breakdown by category with percentages
 */
export function computeCategoryBreakdown(
  transactions: Transaction[],
  categories: CategoryBudget[],
  type: 'expense' | 'income'
): CategoryChartItem[] {
  const filtered = transactions.filter((t) => t.type === type);
  const totalAmount = filtered.reduce((acc, t) => acc + t.amount, 0);

  const categoryMap = new Map<string, { amount: number; count: number }>();

  filtered.forEach((t) => {
    const curr = categoryMap.get(t.category) || { amount: 0, count: 0 };
    curr.amount += t.amount;
    curr.count += 1;
    categoryMap.set(t.category, curr);
  });

  // Map to list
  const results: CategoryChartItem[] = [];

  categoryMap.forEach((val, catId) => {
    const cat = categories.find((c) => c.id === catId);
    const percentage = totalAmount > 0 ? (val.amount / totalAmount) * 100 : 0;

    results.push({
      id: catId,
      label: cat?.label || catId,
      labelDarija: cat?.labelDarija || catId,
      amount: val.amount,
      percentage: Math.round(percentage * 10) / 10,
      color: cat?.color || '#A24824',
      count: val.count,
    });
  });

  // Sort descending by amount
  results.sort((a, b) => b.amount - a.amount);

  return results;
}

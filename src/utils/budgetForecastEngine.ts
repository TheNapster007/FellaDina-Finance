import {
  Transaction,
  CategoryBudget,
  ForecastScenario,
  ForecastReport,
  ForecastTimelineMonth,
  CategoryForecastItem,
  Language,
} from '../types';

const MONTH_NAMES_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const MONTH_NAMES_SHORT = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'
];

const MONTH_NAMES_DARIJA = [
  'Yanayer', 'Febrayer', 'Mars', 'Avril', 'May', 'Yonyo',
  'Yolyoz', 'Ghot', 'Choutanbir', 'Oktobar', 'Nowanbir', 'Dojanbir'
];

/**
 * Helper to compute the next month string YYYY-MM
 */
export function getNextMonthKey(monthKey: string, offset: number = 1): string {
  const [yearStr, monthStr] = monthKey.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);

  month += offset;
  while (month > 12) {
    month -= 12;
    year += 1;
  }
  while (month < 1) {
    month += 12;
    year -= 1;
  }

  return `${year}-${String(month).padStart(2, '0')}`;
}

export function formatMonthName(monthKey: string, lang: Language): { full: string; short: string } {
  const [yearStr, monthStr] = monthKey.split('-');
  const monthIdx = parseInt(monthStr, 10) - 1;
  const year = yearStr;

  if (monthIdx < 0 || monthIdx > 11) {
    return { full: monthKey, short: monthKey };
  }

  if (lang === 'ar_ma') {
    return {
      full: `${MONTH_NAMES_DARIJA[monthIdx]} ${year}`,
      short: `${MONTH_NAMES_SHORT[monthIdx]} '${year.slice(-2)}`,
    };
  }

  return {
    full: `${MONTH_NAMES_FR[monthIdx]} ${year}`,
    short: `${MONTH_NAMES_SHORT[monthIdx]} '${year.slice(-2)}`,
  };
}

/**
 * Primary predictive budget forecasting engine
 */
export function computeBudgetForecast({
  transactions,
  categories,
  scenario = 'baseline',
  discretionaryAdjustmentPct = 0,
  language = 'fr',
}: {
  transactions: Transaction[];
  categories: CategoryBudget[];
  scenario: ForecastScenario;
  discretionaryAdjustmentPct?: number;
  language?: Language;
}): ForecastReport {
  // 1. Calculate allocated monthly expense budget cap
  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const allocatedMonthlyBudgetCap = expenseCategories.reduce((sum, c) => sum + (c.allocatedBudget || 0), 0) || 18500;

  // 2. Aggregate monthly actual data strictly from user transactions
  const historicalMonthMap = new Map<string, { income: number; expense: number; catExpenses: Record<string, number> }>();

  // Aggregate user transactions
  transactions.forEach((tx) => {
    if (!tx.date || tx.date.length < 7) return;
    const mKey = tx.date.substring(0, 7);
    const existing = historicalMonthMap.get(mKey) || { income: 0, expense: 0, catExpenses: {} };

    if (tx.type === 'income') {
      existing.income += tx.amount;
    } else {
      existing.expense += tx.amount;
      existing.catExpenses[tx.category] = (existing.catExpenses[tx.category] || 0) + tx.amount;
    }
    historicalMonthMap.set(mKey, existing);
  });

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  if (!historicalMonthMap.has(currentMonthKey)) {
    historicalMonthMap.set(currentMonthKey, { income: 0, expense: 0, catExpenses: {} });
  }

  // Sort historical months chronologically
  const sortedMonthKeys = Array.from(historicalMonthMap.keys()).sort();
  // Take the last 4 historical months
  const recentHistoricalKeys = sortedMonthKeys.slice(-4);
  const latestMonthKey = recentHistoricalKeys[recentHistoricalKeys.length - 1] || currentMonthKey;

  const historicalExpenseSeries = recentHistoricalKeys.map((k) => historicalMonthMap.get(k)?.expense || 0);
  const historicalIncomeSeries = recentHistoricalKeys.map((k) => historicalMonthMap.get(k)?.income || 0);

  // Compute average historical expense and standard deviation
  const n = historicalExpenseSeries.length;
  const avgHistoricalExpense = historicalExpenseSeries.reduce((s, v) => s + v, 0) / (n || 1);
  const avgHistoricalIncome = historicalIncomeSeries.reduce((s, v) => s + v, 0) / (n || 1);

  const variance = historicalExpenseSeries.reduce((acc, v) => acc + Math.pow(v - avgHistoricalExpense, 2), 0) / (n || 1);
  const stdDev = avgHistoricalExpense > 0 ? Math.sqrt(variance) : 0;

  // Simple weighted trend calculation (m = slope)
  let weightedSumDiff = 0;
  for (let i = 1; i < n; i++) {
    const diff = historicalExpenseSeries[i] - historicalExpenseSeries[i - 1];
    weightedSumDiff += diff * (i / n);
  }
  const rawMonthlyTrendSlope = avgHistoricalExpense > 0 && n > 1 ? (weightedSumDiff / (n - 1)) : 0;

  // Scenario multipliers
  let scenarioSlopeMultiplier = 1.0;
  let scenarioLevelOffset = 0;
  let confidenceWidthMultiplier = 1.0;

  if (scenario === 'optimistic') {
    // Controlled spending, -8% spending level, slope dampened
    scenarioSlopeMultiplier = 0.25;
    scenarioLevelOffset = -avgHistoricalExpense * 0.08;
    confidenceWidthMultiplier = 0.85;
  } else if (scenario === 'conservative') {
    // Inflation / holiday buffer (+10% buffer and steeper slope)
    scenarioSlopeMultiplier = 1.35;
    scenarioLevelOffset = avgHistoricalExpense * 0.09;
    confidenceWidthMultiplier = 1.3;
  }

  // User discretionary slider factor (applied on discretionary/variable portion ~ 40% of budget)
  const userSliderOffset = (avgHistoricalExpense * 0.4) * (discretionaryAdjustmentPct / 100);

  // Base starting point for forward projection: weighted average of last 2 months
  const recentWeightExpense = (
    historicalExpenseSeries[historicalExpenseSeries.length - 1] * 0.6 +
    (historicalExpenseSeries[historicalExpenseSeries.length - 2] || avgHistoricalExpense) * 0.4
  );

  // Generate 3 Future Months: M+1, M+2, M+3
  const futureMonthKeys = [
    getNextMonthKey(latestMonthKey, 1),
    getNextMonthKey(latestMonthKey, 2),
    getNextMonthKey(latestMonthKey, 3),
  ];

  const timelineMonths: ForecastTimelineMonth[] = [];

  // Add the 3 most recent historical months for contextual continuity
  const displayHistoricalKeys = recentHistoricalKeys.slice(-3);
  displayHistoricalKeys.forEach((key) => {
    const item = historicalMonthMap.get(key) || { income: 0, expense: 0, catExpenses: {} };
    const monthNames = formatMonthName(key, language);
    timelineMonths.push({
      monthKey: key,
      label: monthNames.full,
      shortLabel: monthNames.short,
      isProjection: false,
      actualOrExpectedExpense: Math.round(item.expense),
      minExpense: Math.round(item.expense),
      maxExpense: Math.round(item.expense),
      projectedIncome: Math.round(item.income),
      projectedSavings: Math.round(item.income - item.expense),
      budgetCap: allocatedMonthlyBudgetCap,
    });
  });

  // Calculate 3 projected months
  const futureProjectedExpenses: number[] = [];

  futureMonthKeys.forEach((key, stepIndex) => {
    const step = stepIndex + 1; // 1, 2, 3
    // Cumulative projected trend:
    const projectedExp = Math.max(
      3000,
      Math.round(
        recentWeightExpense +
        (rawMonthlyTrendSlope * scenarioSlopeMultiplier * step) +
        scenarioLevelOffset +
        userSliderOffset
      )
    );

    // Confidence bands widen over time (fan of uncertainty)
    const corridorExpansion = Math.sqrt(step) * stdDev * 0.9 * confidenceWidthMultiplier;
    const minExp = Math.max(2500, Math.round(projectedExp - corridorExpansion));
    const maxExp = Math.round(projectedExp + corridorExpansion);

    // Projected income assuming stable run rate plus slight growth
    const projIncome = Math.round(avgHistoricalIncome * (1 + (step * 0.005)));
    const projSavings = projIncome - projectedExp;

    const monthNames = formatMonthName(key, language);

    timelineMonths.push({
      monthKey: key,
      label: monthNames.full,
      shortLabel: monthNames.short,
      isProjection: true,
      actualOrExpectedExpense: projectedExp,
      minExpense: minExp,
      maxExpense: maxExp,
      projectedIncome: projIncome,
      projectedSavings: projSavings,
      budgetCap: allocatedMonthlyBudgetCap,
    });

    futureProjectedExpenses.push(projectedExp);
  });

  // 3. Category-level projection modeling
  // Discretionary category keywords
  const isDiscretionary = (catId: string) => {
    const lower = catId.toLowerCase();
    return lower.includes('loisir') || lower.includes('sort') || lower.includes('shop') || lower.includes('voyage') || lower.includes('autre');
  };

  const isFixed = (catId: string) => {
    const lower = catId.toLowerCase();
    return lower.includes('logement') || lower.includes('loyer') || lower.includes('syndic') || lower.includes('abonn');
  };

  const categoryForecasts: CategoryForecastItem[] = expenseCategories.map((cat) => {
    // Historical avg for this category across recent months
    const pastValues: number[] = [];
    recentHistoricalKeys.forEach((k) => {
      const mData = historicalMonthMap.get(k);
      if (mData && mData.catExpenses[cat.id] !== undefined) {
        pastValues.push(mData.catExpenses[cat.id]);
      }
    });

    const catHistAvg = pastValues.length > 0
      ? pastValues.reduce((s, v) => s + v, 0) / pastValues.length
      : cat.allocatedBudget * 0.85;

    let growthRate = 0.02; // 2% normal trend
    if (isFixed(cat.id)) {
      growthRate = 0.0; // stable
    } else if (isDiscretionary(cat.id)) {
      growthRate = scenario === 'optimistic' ? -0.10 : scenario === 'conservative' ? 0.12 : 0.04;
      growthRate += (discretionaryAdjustmentPct / 100);
    } else {
      // Variable groceries / transport
      growthRate = scenario === 'optimistic' ? -0.03 : scenario === 'conservative' ? 0.07 : 0.025;
    }

    const m1 = Math.round(catHistAvg * (1 + growthRate));
    const m2 = Math.round(catHistAvg * (1 + growthRate * 1.8));
    const m3 = Math.round(catHistAvg * (1 + growthRate * 2.6));

    const isOver = Math.max(m1, m2, m3) > cat.allocatedBudget;

    return {
      categoryId: cat.id,
      label: cat.label,
      labelDarija: cat.labelDarija,
      color: cat.color || '#A24824',
      icon: cat.icon || 'Folder',
      historicalAverage: Math.round(catHistAvg),
      projectedM1: m1,
      projectedM2: m2,
      projectedM3: m3,
      allocatedBudget: cat.allocatedBudget,
      growthRatePct: Math.round(growthRate * 100),
      isOverBudget: isOver,
    };
  });

  // Sort categories by highest projected expenditure
  categoryForecasts.sort((a, b) => b.projectedM1 - a.projectedM1);

  // Identify fastest growing category
  let fastestGrowing: { label: string; labelDarija: string; growthPct: number } | null = null;
  const variableCats = categoryForecasts.filter((c) => !isFixed(c.categoryId));
  if (variableCats.length > 0) {
    const highestGrowth = [...variableCats].sort((a, b) => b.growthRatePct - a.growthRatePct)[0];
    if (highestGrowth && highestGrowth.growthRatePct > 0) {
      fastestGrowing = {
        label: highestGrowth.label,
        labelDarija: highestGrowth.labelDarija,
        growthPct: highestGrowth.growthRatePct,
      };
    }
  }

  // 4. Summaries & Risk check
  const projectedThreeMonthExpenseTotal = futureProjectedExpenses.reduce((s, v) => s + v, 0);
  const projectedAverageExpense = Math.round(projectedThreeMonthExpenseTotal / 3);

  // Total projected savings across the 3 months
  const projectedThreeMonthSavingsTotal = timelineMonths
    .filter((m) => m.isProjection)
    .reduce((s, m) => s + m.projectedSavings, 0);

  // First month with budget risk
  const riskMonthObj = timelineMonths.find((m) => m.isProjection && m.actualOrExpectedExpense > allocatedMonthlyBudgetCap);
  const budgetRiskMonth = riskMonthObj ? riskMonthObj.label : null;

  return {
    scenario,
    discretionaryAdjustmentPct,
    timelineMonths,
    historicalAverageExpense: Math.round(avgHistoricalExpense),
    projectedAverageExpense,
    projectedThreeMonthExpenseTotal,
    projectedThreeMonthSavingsTotal,
    allocatedMonthlyBudgetCap,
    fastestGrowingCategory: fastestGrowing,
    budgetRiskMonth,
    categoryForecasts,
  };
}

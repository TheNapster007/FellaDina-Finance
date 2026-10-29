export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'virement' | 'carte' | 'especes' | 'cheque';

export type PeriodFilter = 'Q1' | 'Q2' | 'Q3' | 'YTD';

export type Currency = 'MAD' | 'EUR' | 'USD';

export type Language = 'fr' | 'ar_ma' | 'en';

export type Theme = 'light' | 'dark';

export interface TransactionItem {
  id: string;
  name: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice: number;
}

export interface SubCategory {
  id: string;
  categoryId: string; // ID of the parent CategoryBudget (e.g. 'alimentation', 'transport')
  name: string;
  nameDarija?: string;
  color?: string;
  isCustom?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  subCategory?: string; // ID of the subcategory
  amount: number;
  date: string; // ISO YYYY-MM-DD
  note: string;
  paymentMethod: PaymentMethod;
  recipientOrSource?: string;
  items?: TransactionItem[];
}

export interface CategoryBudget {
  id: string;
  label: string;
  labelDarija: string;
  labelEn: string;
  type: TransactionType;
  allocatedBudget: number;
  color: string;
  icon: string;
  isCustom?: boolean;
}

export interface MonthlyDataPoint {
  month: string;
  monthShort: string;
  actualIncome: number;
  planIncome: number;
  actualExpense: number;
  planExpense: number;
  netSavings: number;
}

export interface WaterfallItem {
  id: string;
  label: string;
  labelDarija: string;
  amount: number;
  type: 'base' | 'inflow' | 'outflow' | 'total';
  color?: string;
}

export type ToastType = 'warning' | 'danger' | 'success' | 'info';

export interface ToastNotification {
  id: string;
  type: ToastType;
  title: string;
  titleDarija?: string;
  message: string;
  messageDarija?: string;
  category?: string;
  categoryLabel?: string;
  spentAmount?: number;
  budgetAmount?: number;
  percentage?: number;
  currency?: Currency;
  durationMs?: number;
  actionLabel?: string;
  onAction?: () => void;
}

export type ForecastScenario = 'baseline' | 'optimistic' | 'conservative';

export interface CategoryForecastItem {
  categoryId: string;
  label: string;
  labelDarija: string;
  color: string;
  icon: string;
  historicalAverage: number;
  projectedM1: number;
  projectedM2: number;
  projectedM3: number;
  allocatedBudget: number;
  growthRatePct: number;
  isOverBudget: boolean;
}

export interface ForecastTimelineMonth {
  monthKey: string; // "2026-11"
  label: string; // "Novembre 2026"
  shortLabel: string; // "Nov"
  isProjection: boolean;
  actualOrExpectedExpense: number;
  minExpense: number; // lower confidence bound
  maxExpense: number; // upper confidence bound
  projectedIncome: number;
  projectedSavings: number;
  budgetCap: number; // total allocated monthly expense budget
}

export interface ForecastReport {
  scenario: ForecastScenario;
  discretionaryAdjustmentPct: number;
  timelineMonths: ForecastTimelineMonth[]; // includes 3 historical + 3 future months
  yearlyTimelineMonths: ForecastTimelineMonth[]; // includes 12 projected months
  historicalAverageExpense: number;
  projectedAverageExpense: number;
  projectedThreeMonthExpenseTotal: number;
  projectedThreeMonthSavingsTotal: number;
  projectedYearlyExpenseTotal: number;
  projectedYearlySavingsTotal: number;
  allocatedMonthlyBudgetCap: number;
  allocatedYearlyBudgetCap: number;
  fastestGrowingCategory: {
    label: string;
    labelDarija: string;
    growthPct: number;
  } | null;
  budgetRiskMonth: string | null; // e.g. "Décembre 2026" if over budget
  categoryForecasts: CategoryForecastItem[];
}

export interface UserIncomeSource {
  id: string;
  name: string;
  nameDarija?: string;
  amount: number;
  frequency: 'monthly' | 'one-time';
  dayOfMonth?: number;
}

export interface UserExpenseBudgetPlan {
  categoryId: string;
  name: string;
  nameDarija?: string;
  amount: number;
  isFixedCharge?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarSeed?: string;
  avatarUrl?: string;
  currency: Currency;
  initialBalance?: number;
  createdAt: string;
  incomes: UserIncomeSource[];
  expenses: UserExpenseBudgetPlan[];
}

export type SavingsGoalCategory =
  | 'emergency'
  | 'real_estate'
  | 'travel'
  | 'vehicle'
  | 'education'
  | 'investment'
  | 'family'
  | 'project';

export type GoalPriority = 'high' | 'medium' | 'low';

export interface SavingsGoal {
  id: string;
  name: string;
  nameDarija?: string;
  targetAmount: number;
  currentAmount: number;
  monthlyAllocation: number; // Planned contribution from monthly cash surplus
  targetDate: string; // ISO format: YYYY-MM-DD
  category: SavingsGoalCategory;
  priority: GoalPriority;
  color?: string;
  icon?: string;
  notes?: string;
  createdAt: string;
}



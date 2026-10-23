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

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
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

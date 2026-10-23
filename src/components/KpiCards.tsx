import React from 'react';
import { Currency, Language, CategoryBudget, Transaction } from '../types';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Percent,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { BalanceHistoryLineChart } from './charts/BalanceHistoryLineChart';

interface KpiCardsProps {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  incomeGrowth: number;
  expenseRatioVsBudget: number;
  currency: Currency;
  language: Language;
  categories?: CategoryBudget[];
  transactions?: Transaction[];
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  totalIncome,
  totalExpense,
  netSavings,
  savingsRate,
  incomeGrowth,
  expenseRatioVsBudget,
  currency,
  language,
  categories = [],
  transactions = [],
}) => {
  // Compute categories exceeding their allocated budget threshold
  const exceededCategories = categories
    .filter((c) => c.type === 'expense' && c.allocatedBudget > 0)
    .map((cat) => {
      const txList = transactions.filter((t) => t.category === cat.id);
      const spent = txList.reduce((acc, t) => acc + t.amount, 0);
      const overAmount = spent - cat.allocatedBudget;
      const overPercent = Math.round((overAmount / cat.allocatedBudget) * 100);
      return {
        ...cat,
        spent,
        overAmount,
        overPercent,
        isExceeded: spent > cat.allocatedBudget,
      };
    })
    .filter((c) => c.isExceeded);

  const totalOverBudgetAmount = exceededCategories.reduce((sum, c) => sum + c.overAmount, 0);
  const hasExceededBudget = exceededCategories.length > 0;
  const isSavingsAtRisk = savingsRate < 25;

  // Formatters
  const formatMoney = (val: number) => {
    const formatted = Math.round(val).toLocaleString('fr-FR');
    if (currency === 'MAD') return `${formatted} DH`;
    if (currency === 'EUR') return `${formatted} €`;
    return `$${formatted}`;
  };

  const formatShort = (val: number) => {
    if (Math.abs(val) >= 1_000_000) {
      const v = (val / 1_000_000).toFixed(1);
      return currency === 'USD' ? `$${v}M` : `${v}M ${currency === 'MAD' ? 'DH' : '€'}`;
    }
    if (Math.abs(val) >= 10_000) {
      const v = (val / 1_000).toFixed(1);
      return currency === 'USD' ? `$${v}k` : `${v}k ${currency === 'MAD' ? 'DH' : '€'}`;
    }
    return formatMoney(val);
  };

  return (
    <section className="mb-10">
      {/* 3 Executive Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Card 1: Total Inflows / Net Revenue */}
      <div className="relative overflow-hidden bg-white dark:bg-[#1E1D19] rounded-xl border border-[#E5E0D5] dark:border-[#312E28] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#D6CEBF] dark:hover:border-[#423E36] transition-all flex flex-col justify-between">
        <div>
          {/* Header line with badge */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#EFECE4] dark:bg-[#2A2722] flex items-center justify-center text-[#A24824]">
                <Wallet className="w-3 h-3" />
              </div>
              <span className="text-xs font-semibold text-[#797063] dark:text-[#9A9184] uppercase tracking-wider">
                {language === 'ar_ma'
                  ? 'Lmadkhoul Lkamel (Kandkhel)'
                  : language === 'en'
                  ? 'Total Inflows (Revenue)'
                  : 'Revenus Totaux (Entrées)'}
              </span>
            </div>

            {/* Subtle trajectory badge */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EAF3EC] dark:bg-[#1C2C20] text-[#2C6E43] dark:text-[#67B882] border border-[#D1E8D7] dark:border-[#27442F]">
              <CheckCircle2 className="w-3 h-3" />
              {language === 'ar_ma' ? 'Ittijah Ijabi' : '+12.6% vs plan'}
            </span>
          </div>

          {/* Big number in prominent tabular display */}
          <div className="text-3xl sm:text-4xl font-bold font-serif tracking-tight text-[#221F1C] dark:text-[#F2EFEA] tabular-nums">
            {formatShort(totalIncome)}
          </div>

          {/* Change indicator */}
          <div className="mt-2.5 flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center text-[#2D7349] dark:text-[#52A36F] font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              +{incomeGrowth.toFixed(1)}% vs prévision
            </span>
          </div>

          {/* Subtext */}
          <div className="mt-1 text-[11px] text-[#8C8375] dark:text-[#887F72] font-sans">
            +18.6% YoY · Prévision: {formatShort(totalIncome * 0.9)}
          </div>
        </div>

        {/* Bottom-right smooth sparkline in terracotta tone matching screenshot */}
        <div className="absolute right-0 bottom-0 w-36 h-16 pointer-events-none opacity-80">
          <svg viewBox="0 0 140 60" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="terracottaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A24824" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#A24824" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 0,50 Q 30,48 60,38 T 100,24 T 140,12 L 140,60 L 0,60 Z"
              fill="url(#terracottaGrad)"
            />
            <path
              d="M 0,50 Q 30,48 60,38 T 100,24 T 140,12"
              fill="none"
              stroke="#A24824"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Card 2: Net Expense Control & Visual Warning for Exceeded Categories */}
      <div
        className={`relative overflow-hidden bg-white dark:bg-[#1E1D19] rounded-xl border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all flex flex-col justify-between ${
          hasExceededBudget
            ? 'border-[#F0CFC8] dark:border-[#522921] bg-[#FDFBF9] dark:bg-[#221816] ring-1 ring-[#F3D7D2] dark:ring-[#5E2B21]'
            : 'border-[#E5E0D5] dark:border-[#312E28] hover:border-[#D6CEBF] dark:hover:border-[#423E36]'
        }`}
      >
        <div>
          {/* Header line with visual warning badge */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                  hasExceededBudget
                    ? 'bg-[#FBEBE7] dark:bg-[#341C18] text-[#A24824]'
                    : 'bg-[#EAEFEA] dark:bg-[#1F2E25] text-[#3B6B55]'
                }`}
              >
                {hasExceededBudget ? (
                  <AlertTriangle className="w-3 h-3 text-[#A24824] dark:text-[#E8734C]" />
                ) : (
                  <ShieldCheck className="w-3 h-3" />
                )}
              </div>
              <span className="text-xs font-semibold text-[#797063] dark:text-[#9A9184] uppercase tracking-wider">
                {language === 'ar_ma'
                  ? 'Tadbir Lmasrouf'
                  : language === 'en'
                  ? 'Budget Retention'
                  : 'Maîtrise Budgétaire'}
              </span>
            </div>

            {/* Subtle Visual Warning Badge when categories exceed threshold */}
            {hasExceededBudget ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FDECE8] dark:bg-[#341C18] text-[#A24824] dark:text-[#E8734C] border border-[#F5CBC2] dark:border-[#582B23] shadow-2xs animate-pulse">
                <AlertCircle className="w-3 h-3" />
                <span>
                  {exceededCategories.length}{' '}
                  {language === 'ar_ma'
                    ? 'fathom l-budget'
                    : exceededCategories.length > 1
                    ? 'postes hors budget'
                    : 'poste hors budget'}
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EAF3EC] dark:bg-[#1C2C20] text-[#2C6E43] dark:text-[#67B882] border border-[#D1E8D7] dark:border-[#27442F]">
                <CheckCircle2 className="w-3 h-3" />
                {language === 'ar_ma' ? 'Kolchi mzyan' : 'Tous budgets respectés'}
              </span>
            )}
          </div>

          {/* Big number: text color shifts to terracotta warning if budget exceeded */}
          <div
            className={`text-3xl sm:text-4xl font-bold font-serif tracking-tight tabular-nums transition-colors ${
              hasExceededBudget ? 'text-[#A24824] dark:text-[#E8734C]' : 'text-[#221F1C] dark:text-[#F2EFEA]'
            }`}
          >
            {Math.round(expenseRatioVsBudget)}%
          </div>

          {/* Status line with text color change */}
          <div className="mt-2.5 flex items-center gap-1.5 text-xs">
            {hasExceededBudget ? (
              <span className="inline-flex items-center text-[#A24824] dark:text-[#E8734C] font-semibold">
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                Dépassement net : +{formatMoney(totalOverBudgetAmount)}
              </span>
            ) : (
              <span className="inline-flex items-center text-[#2D7349] dark:text-[#52A36F] font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                Budget maîtrisé à {Math.round(100 - (totalExpense / (totalIncome || 1)) * 100)}%
              </span>
            )}
          </div>

          {/* Subtext and visual highlight of the exceeded categories */}
          {hasExceededBudget ? (
            <div className="mt-2 pt-2 border-t border-[#F3E6E2] dark:border-[#3A2420] text-[11px] space-y-1">
              <span className="text-[10px] font-semibold uppercase text-[#A24824] dark:text-[#E8734C] block">
                {language === 'ar_ma' ? 'L&apos;asnâaf li fathoum l-budget :' : 'Catégories en dépassement :'}
              </span>
              <div className="flex flex-wrap gap-1">
                {exceededCategories.map((cat) => (
                  <span
                    key={cat.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FCECE8] dark:bg-[#2D1A17] text-[#913B1B] dark:text-[#E8734C] text-[10px] font-semibold border border-[#F3D0C7] dark:border-[#4E2720]"
                    title={`Budget: ${cat.allocatedBudget} | Réel: ${cat.spent} (+${cat.overAmount} DH)`}
                  >
                    <span>{language === 'ar_ma' ? cat.labelDarija : cat.label}</span>
                    <span className="font-mono text-[#B91C1C] dark:text-[#F87171]">+{cat.overPercent}%</span>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-1 text-[11px] text-[#8C8375] dark:text-[#887F72] font-sans">
              Cible sécurité &gt; 110% · Dépenses: {formatShort(totalExpense)}
            </div>
          )}
        </div>

        {/* Bottom-right smooth sparkline in sage green (or soft terracotta if exceeded) */}
        <div className="absolute right-0 bottom-0 w-36 h-16 pointer-events-none opacity-80">
          <svg viewBox="0 0 140 60" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="budgetGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={hasExceededBudget ? '#A24824' : '#3B6B55'}
                  stopOpacity="0.25"
                />
                <stop
                  offset="100%"
                  stopColor={hasExceededBudget ? '#A24824' : '#3B6B55'}
                  stopOpacity="0.0"
                />
              </linearGradient>
            </defs>
            <path
              d="M 0,55 Q 35,52 65,40 T 105,30 T 140,16 L 140,60 L 0,60 Z"
              fill="url(#budgetGrad)"
            />
            <path
              d="M 0,55 Q 35,52 65,40 T 105,30 T 140,16"
              fill="none"
              stroke={hasExceededBudget ? '#A24824' : '#3B6B55'}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Card 3: Gross Margin / Net Savings Rate with Visual Threshold Warning */}
      <div
        className={`relative overflow-hidden bg-white dark:bg-[#1E1D19] rounded-xl border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all flex flex-col justify-between ${
          isSavingsAtRisk
            ? 'border-[#F0CFC8] dark:border-[#522921] bg-[#FDFBF9] dark:bg-[#221816] ring-1 ring-[#F3D7D2] dark:ring-[#5E2B21]'
            : 'border-[#E5E0D5] dark:border-[#312E28] hover:border-[#D6CEBF] dark:hover:border-[#423E36]'
        }`}
      >
        <div>
          {/* Header line with badge */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  isSavingsAtRisk ? 'bg-[#FBEBE7] dark:bg-[#341C18] text-[#A24824]' : 'bg-[#F5EEE8] dark:bg-[#2A231F] text-[#A24824]'
                }`}
              >
                <Percent className="w-3 h-3" />
              </div>
              <span className="text-xs font-semibold text-[#797063] dark:text-[#9A9184] uppercase tracking-wider">
                {language === 'ar_ma'
                  ? 'Nisbat L\'épargne'
                  : language === 'en'
                  ? 'Net Savings Margin'
                  : 'Taux d\'Épargne Net'}
              </span>
            </div>

            {/* Warning badge if savings rate is low or negative */}
            {isSavingsAtRisk ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FDECE8] dark:bg-[#341C18] text-[#A24824] dark:text-[#E8734C] border border-[#F5CBC2] dark:border-[#582B23]">
                <AlertCircle className="w-3 h-3" />
                <span>
                  {savingsRate <= 0
                    ? language === 'ar_ma'
                      ? '3ajz (Déficit)'
                      : 'Déficit net'
                    : language === 'ar_ma'
                    ? 'Épargne d3ifa (<25%)'
                    : 'Épargne sous seuil'}
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EAF3EC] dark:bg-[#1C2C20] text-[#2C6E43] dark:text-[#67B882] border border-[#D1E8D7] dark:border-[#27442F]">
                <CheckCircle2 className="w-3 h-3" />
                {language === 'ar_ma' ? 'Épargne mzyana' : 'Objectif atteint'}
              </span>
            )}
          </div>

          {/* Big number: turns alert terracotta if savings is below threshold */}
          <div
            className={`text-3xl sm:text-4xl font-bold font-serif tracking-tight tabular-nums transition-colors ${
              isSavingsAtRisk ? 'text-[#A24824] dark:text-[#E8734C]' : 'text-[#221F1C] dark:text-[#F2EFEA]'
            }`}
          >
            {savingsRate.toFixed(1)}%
          </div>

          {/* Change indicator */}
          <div className="mt-2.5 flex items-center gap-1.5 text-xs">
            {isSavingsAtRisk ? (
              <span className="inline-flex items-center text-[#A24824] dark:text-[#E8734C] font-semibold">
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                Capacité d&apos;épargne sous tension (&lt; 25%)
              </span>
            ) : (
              <span className="inline-flex items-center text-[#2D7349] dark:text-[#52A36F] font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                Marge d&apos;épargne confortable
              </span>
            )}
          </div>

          {/* Subtext */}
          <div className="mt-1 text-[11px] text-[#8C8375] dark:text-[#887F72] font-sans">
            Solde net: {formatShort(netSavings)} · Prévision: 73.3%
          </div>
        </div>

        {/* Bottom-right smooth sparkline in subtle terracotta */}
        <div className="absolute right-0 bottom-0 w-36 h-16 pointer-events-none opacity-80">
          <svg viewBox="0 0 140 60" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="marginGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A24824" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#A24824" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 0,42 Q 40,40 70,32 T 110,36 T 140,26 L 140,60 L 0,60 Z"
              fill="url(#marginGrad)"
            />
            <path
              d="M 0,42 Q 40,40 70,32 T 110,36 T 140,26"
              fill="none"
              stroke="#A24824"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
      </div>

      {/* Historical Line Chart of Total Balance Over Time */}
      <BalanceHistoryLineChart
        transactions={transactions}
        currency={currency}
        language={language}
      />
    </section>
  );
};

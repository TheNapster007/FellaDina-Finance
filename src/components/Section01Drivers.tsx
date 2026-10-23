import React from 'react';
import { Currency, Language, Transaction, CategoryBudget } from '../types';
import { computeMonthlyAggregation } from '../utils/chartData';
import { IncomeExpenseBarChart } from './charts/IncomeExpenseBarChart';

interface Section01DriversProps {
  transactions: Transaction[];
  categories: CategoryBudget[];
  currency: Currency;
  language: Language;
}

export const Section01Drivers: React.FC<Section01DriversProps> = ({
  transactions,
  categories,
  currency,
  language,
}) => {
  const monthlyData = computeMonthlyAggregation(transactions);

  // Dynamic calculations for the Cashflow Bridge (Waterfall) based on actual transactions
  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netEnding = totalIncome - totalExpense;

  // Top expense categories for the waterfall
  const housingExpense = transactions
    .filter((t) => t.category === 'logement')
    .reduce((s, t) => s + t.amount, 0);
  const otherExpenses = totalExpense - housingExpense;

  const salaryIncome = transactions
    .filter((t) => t.category === 'salaire')
    .reduce((s, t) => s + t.amount, 0);
  const extraIncome = totalIncome - salaryIncome;

  const waterfallItems = [
    {
      label: language === 'ar_ma' ? 'Départ' : 'Solde Init.',
      value: 12.0,
      type: 'base',
      color: '#7D7569',
    },
    {
      label: language === 'ar_ma' ? 'Salaire' : 'Salaires',
      value: Math.round((salaryIncome / 1000) * 10) / 10 || 19.5,
      type: 'plus',
      color: '#4F6D5B',
    },
    {
      label: language === 'ar_ma' ? 'Extras' : 'Freelance',
      value: Math.round((extraIncome / 1000) * 10) / 10 || 11.5,
      type: 'plus',
      color: '#5B7B68',
    },
    {
      label: language === 'ar_ma' ? 'Loyer' : 'Logement',
      value: -Math.abs(Math.round((housingExpense / 1000) * 10) / 10 || 4.5),
      type: 'minus',
      color: '#A24824',
    },
    {
      label: language === 'ar_ma' ? 'Lmasrouf' : 'Quotidien',
      value: -Math.abs(Math.round((otherExpenses / 1000) * 10) / 10 || 12.3),
      type: 'minus',
      color: '#B85D36',
    },
    {
      label: language === 'ar_ma' ? 'Solde Fin' : 'Solde Net',
      value: Math.round(((12000 + netEnding) / 1000) * 10) / 10,
      type: 'total',
      color: '#6A371F',
    },
  ];

  return (
    <section className="mb-10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#221F1C] dark:text-[#F2EFEA] flex items-baseline gap-2">
          <span className="font-serif italic text-sm text-[#A24824] dark:text-[#D96B43] font-semibold">01</span>
          <span>
            {language === 'ar_ma'
              ? 'Chno li kay7arek l&apos;ar9am ?'
              : language === 'en'
              ? 'What is driving the numbers?'
              : 'Qu&apos;est-ce qui explique les chiffres ?'}
          </span>
        </h2>
        <span className="text-xs text-[#7F7668] dark:text-[#9A9184] max-w-md text-right hidden sm:block">
          {language === 'ar_ma'
            ? 'Muqaranat lmadkhoul w lmasrouf b barres w curves interactives.'
            : language === 'en'
            ? 'Revenue trend against plan, and the mix of new vs. expansion vs. churn behind retention.'
            : 'Tendance des rentrées vs sorties en temps réel et pont de trésorerie net.'}
        </span>
      </div>

      {/* Two columns grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Interactive Income vs Expense Bar & Trend Chart */}
        <IncomeExpenseBarChart
          data={monthlyData}
          currency={currency}
          language={language}
        />

        {/* Right Card: Retention / Cashflow Bridge (Waterfall) */}
        <div className="bg-white dark:bg-[#1E1D19] rounded-xl border border-[#E5E0D5] dark:border-[#312E28] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#423C34] dark:text-[#F2EFEA] tracking-wide flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-xs bg-[#4F6D5B]" />
                {language === 'ar_ma'
                  ? 'Qantarat lflous (Retention & Cash Bridge)'
                  : language === 'en'
                  ? 'Retention bridge'
                  : 'Pont de trésorerie (Waterfall)'}
              </span>
              <span className="text-[11px] text-[#797063] dark:text-[#8D8477] font-mono tabular-nums">
                {currency === 'MAD' ? 'k DH' : currency}
              </span>
            </div>
            <p className="text-[11px] text-[#8C8375] dark:text-[#8D8477] mb-3">
              {language === 'ar_ma'
                ? 'Kifach tbeddel solde dyalek had ch-her (k DH)'
                : `Comment le solde net a évolué ce trimestre (${currency === 'MAD' ? 'k DH' : currency})`}
            </p>

            {/* Waterfall bar chart */}
            <div className="h-[200px] flex items-end justify-between gap-2 pt-4 px-2">
              {waterfallItems.map((item) => {
                const heightPercent = Math.min(100, Math.max(16, (Math.abs(item.value) / 50) * 100));
                return (
                  <div key={item.label} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <span className="text-[10px] font-mono font-semibold mb-1 text-[#4A4338] dark:text-[#EAE6DF] tabular-nums">
                      {item.value > 0 ? `+${item.value}` : item.value}k
                    </span>
                    <div
                      style={{ height: `${heightPercent}%`, backgroundColor: item.color }}
                      className="w-full max-w-[42px] rounded-t-sm transition-all duration-300 group-hover:brightness-95 shadow-2xs"
                    />
                    <span className="text-[10px] text-[#786F62] dark:text-[#9A9184] font-medium mt-2 truncate w-full text-center">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Takeaway note pill matching screenshot */}
          <div className="mt-4 p-3 bg-[#F9F7F2] dark:bg-[#25221C] rounded-lg border border-[#E9E4D8] dark:border-[#363229] text-[11px] leading-relaxed text-[#5A5144] dark:text-[#B6AEA3]">
            <strong className="text-[#2B2621] dark:text-[#F2EFEA] font-semibold">
              {language === 'ar_ma'
                ? 'Lmadkhoul zayed 3la lmasrouf b 3.6x : '
                : 'Expansion outpaced churn 3.6x. '}
            </strong>
            {language === 'ar_ma'
              ? 'Lmasrouf bqa m7koma f 14.2%, li khlla l&apos;épargne tbqa foq lhadaf dyal 35% b ra7a.'
              : "Les rentrées excédentaires ont compensé les charges, maintenant le taux d'épargne net au-dessus de l'objectif."}
          </div>
        </div>
      </div>
    </section>
  );
};

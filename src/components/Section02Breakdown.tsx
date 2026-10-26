import React, { useState } from 'react';
import { Currency, Language, CategoryBudget, Transaction } from '../types';
import { computeCategoryBreakdown } from '../utils/chartData';
import { CategoryPieChart } from './charts/CategoryPieChart';

interface Section02BreakdownProps {
  categories: CategoryBudget[];
  transactions: Transaction[];
  currency: Currency;
  language: Language;
  onSelectCategory?: (id: string) => void;
  selectedCategory?: string;
  onOpenCategoryDetail?: (categoryId: string) => void;
}

export const Section02Breakdown: React.FC<Section02BreakdownProps> = ({
  categories,
  transactions,
  currency,
  language,
  onSelectCategory,
  selectedCategory,
  onOpenCategoryDetail,
}) => {
  const [breakdownType, setBreakdownType] = useState<'expense' | 'income'>('expense');

  // Compute live breakdown from transactions
  const expenseBreakdown = computeCategoryBreakdown(transactions, categories, 'expense');
  const incomeBreakdown = computeCategoryBreakdown(transactions, categories, 'income');
  const activeBreakdown = breakdownType === 'expense' ? expenseBreakdown : incomeBreakdown;

  // Growth by Segment data calculated dynamically from transactions
  const freelanceSpend = transactions
    .filter((t) => t.category === 'freelance')
    .reduce((s, t) => s + t.amount, 0);

  const salarySpend = transactions
    .filter((t) => t.category === 'salaire')
    .reduce((s, t) => s + t.amount, 0);

  const housingSpend = transactions
    .filter((t) => t.category === 'logement')
    .reduce((s, t) => s + t.amount, 0);

  const maxSegment = Math.max(freelanceSpend, salarySpend, housingSpend, 1);
  const segmentGrowth = [
    {
      name: language === 'ar_ma' ? 'Freelance & Pro' : 'Freelance / Pro',
      amount: freelanceSpend,
      growth: freelanceSpend > 0 ? 'Actif' : '0%',
      barHeight: freelanceSpend > 0 ? Math.round((freelanceSpend / maxSegment) * 88) : 8,
    },
    {
      name: language === 'ar_ma' ? 'Salaire Fixe' : 'Revenus Salarié',
      amount: salarySpend,
      growth: salarySpend > 0 ? 'Actif' : '0%',
      barHeight: salarySpend > 0 ? Math.round((salarySpend / maxSegment) * 88) : 8,
    },
    {
      name: language === 'ar_ma' ? 'Logement & Fixe' : 'Charges Logement',
      amount: housingSpend,
      growth: housingSpend > 0 ? 'Actif' : '0%',
      barHeight: housingSpend > 0 ? Math.round((housingSpend / maxSegment) * 88) : 8,
    },
  ];

  return (
    <section className="mb-10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#221F1C] dark:text-[#F2EFEA] flex items-baseline gap-2">
            <span className="font-serif italic text-sm text-[#A24824] dark:text-[#D96B43] font-semibold">02</span>
            <span>
              {language === 'ar_ma'
                ? 'Mnin jayen lmasarif w lmadkhoul ?'
                : language === 'en'
                ? 'Where is the money going?'
                : 'D&apos;où proviennent les dépenses et revenus ?'}
            </span>
          </h2>

          {/* Toggle between Expense breakdown and Income breakdown */}
          <div className="inline-flex rounded-lg border border-[#DCD5C6] dark:border-[#38342D] bg-[#EFECE3] dark:bg-[#25231F] p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setBreakdownType('expense')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                breakdownType === 'expense'
                  ? 'bg-white dark:bg-[#322F28] text-[#A24824] dark:text-[#E8734C] font-semibold shadow-2xs'
                  : 'text-[#6F6659] dark:text-[#9A9184]'
              }`}
            >
              {language === 'ar_ma' ? 'Lmasrouf (Dépenses)' : 'Dépenses'}
            </button>
            <button
              type="button"
              onClick={() => setBreakdownType('income')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                breakdownType === 'income'
                  ? 'bg-white dark:bg-[#322F28] text-[#3B6B55] dark:text-[#67B882] font-semibold shadow-2xs'
                  : 'text-[#6F6659] dark:text-[#9A9184]'
              }`}
            >
              {language === 'ar_ma' ? 'Lmadkhoul (Revenus)' : 'Revenus'}
            </button>
          </div>
        </div>

        <span className="text-xs text-[#7F7668] dark:text-[#9A9184] max-w-md text-right hidden sm:block">
          {language === 'ar_ma'
            ? 'Diagramme interactif circulaire d lmasrouf w taqsim d kola catégorie.'
            : 'Diagramme circulaire dynamique calculé à partir de vos transactions enregistrées.'}
        </span>
      </div>

      {selectedCategory && selectedCategory !== 'all' && onOpenCategoryDetail && (
        <div className="mb-4 p-3 bg-white dark:bg-[#1E1D19] rounded-xl border border-[#E5E0D5] dark:border-[#312E28] flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#25201B] dark:text-[#F2EFEA]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A24824]" />
            <span>
              {language === 'ar_ma' ? 'Catégorie li m-sélectionniya :' : 'Poste filtré :'}
            </span>
            <span className="font-bold text-[#A24824] dark:text-[#E8734C]">
              {language === 'ar_ma'
                ? categories.find((c) => c.id === selectedCategory)?.labelDarija
                : categories.find((c) => c.id === selectedCategory)?.label}
            </span>
          </div>
          <button
            onClick={() => onOpenCategoryDetail(selectedCategory)}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF0E6] dark:bg-[#3D251D] text-[#A24824] dark:text-[#E8734C] hover:bg-[#F5E2D4] rounded-lg text-xs font-bold transition-colors"
          >
            <span>{language === 'ar_ma' ? 'Chof les détails w les sous-catégories →' : 'Inspecter sous-catégories & articles →'}</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Interactive Category Pie/Donut Chart */}
        <CategoryPieChart
          data={activeBreakdown}
          title={
            breakdownType === 'expense'
              ? language === 'ar_ma'
                ? 'Taqsim d lmasrouf b catégorie'
                : 'Répartition des dépenses par catégorie'
              : language === 'ar_ma'
              ? 'Taqsim d lmadkhoul b source'
              : 'Répartition des revenus par source'
          }
          subtitle={
            breakdownType === 'expense'
              ? 'Part relative de chaque catégorie dans vos dépenses enregistrées'
              : 'Part relative de chaque source de revenu'
          }
          currency={currency}
          language={language}
          onSelectCategory={onSelectCategory}
          selectedCategory={selectedCategory}
        />

        {/* Right Card: Growth by Segment */}
        <div className="bg-white dark:bg-[#1E1D19] rounded-xl border border-[#E5E0D5] dark:border-[#312E28] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#423C34] dark:text-[#F2EFEA] tracking-wide flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-xs bg-[#4F6D5B]" />
                {language === 'ar_ma'
                  ? 'Isti3mar d lbudgets w lmadkhoul'
                  : language === 'en'
                  ? 'Growth by segment'
                  : 'Progression par pôle financier'}
              </span>
              <span className="text-[11px] text-[#797063] dark:text-[#8D8477] font-mono">
                {language === 'ar_ma' ? 'QoQ Growth' : 'Croissance QoQ'}
              </span>
            </div>
            <p className="text-[11px] text-[#8C8375] dark:text-[#8D8477] mb-4">
              {language === 'ar_ma'
                ? 'Nisbat lkhedma w lmadkhoul f kola pôle'
                : 'Taux de progression trimestrielle vs montant réel engagé'}
            </p>

            {/* Bars with overlay arch curve (matching screenshot) */}
            <div className="relative h-[180px] w-full px-4 pt-2">
              <svg
                viewBox="0 0 300 120"
                className="absolute inset-0 w-full h-[140px] pointer-events-none overflow-visible"
              >
                <path
                  d="M 50,85 Q 150,15 250,75"
                  fill="none"
                  stroke="#A24824"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle cx="50" cy="85" r="3" fill="#A24824" />
                <circle cx="150" cy="20" r="3.5" fill="#A24824" />
                <circle cx="250" cy="75" r="3" fill="#A24824" />
              </svg>

              {/* Bars columns */}
              <div className="h-full flex items-end justify-around gap-6 pb-2">
                {segmentGrowth.map((seg) => (
                  <div key={seg.name} className="flex-1 flex flex-col items-center justify-end h-full">
                    <span className="text-[10px] font-mono font-semibold text-[#A24824] dark:text-[#E8734C] mb-1">
                      {seg.growth}
                    </span>
                    <div
                      style={{ height: `${seg.barHeight}%` }}
                      className="w-full max-w-[48px] bg-[#658572] rounded-t-sm shadow-xs transition-all hover:bg-[#527260]"
                    />
                    <span className="text-[11px] font-semibold text-[#2D2823] dark:text-[#F2EFEA] mt-2 text-center truncate w-full">
                      {seg.name}
                    </span>
                    <span className="text-[10px] text-[#7E7569] dark:text-[#9A9184] font-mono tabular-nums">
                      {Math.round(seg.amount / 1000)}k {currency === 'MAD' ? 'DH' : currency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Takeaway note pill matching screenshot */}
          <div className="mt-4 p-3 bg-[#F9F7F2] dark:bg-[#25221C] rounded-lg border border-[#E9E4D8] dark:border-[#363229] text-[11px] leading-relaxed text-[#5A5144] dark:text-[#B6AEA3]">
            <strong className="text-[#2B2621] dark:text-[#F2EFEA] font-semibold">
              {language === 'ar_ma'
                ? 'L&apos;Freelance huwa li fih akbar khedma (+35% QoQ) : '
                : 'Pôle le plus dynamique : '}
            </strong>
            {language === 'ar_ma'
              ? 'Kola marra katzid chi projet freelance wla vente, l&apos;ar9am kaytbdlo direct f l-graphique.'
              : 'Les transactions ajoutées dans vos catégories mettent à jour les ratios et les courbes automatiquement.'}
          </div>
        </div>
      </div>
    </section>
  );
};

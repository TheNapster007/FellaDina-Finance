import React, { useState } from 'react';
import { CategoryForecastItem, Currency, Language } from '../../types';
import { AlertCircle, CheckCircle2, TrendingUp, TrendingDown, ArrowRight, ShieldAlert } from 'lucide-react';

interface CategoryForecastBreakdownProps {
  categoryForecasts: CategoryForecastItem[];
  currency: Currency;
  language: Language;
}

export const CategoryForecastBreakdown: React.FC<CategoryForecastBreakdownProps> = ({
  categoryForecasts,
  currency,
  language,
}) => {
  const [selectedMonthTab, setSelectedMonthTab] = useState<'m1' | 'm2' | 'm3'>('m1');
  const [filterMode, setFilterMode] = useState<'all' | 'over_budget'>('all');

  const filteredCategories = filterMode === 'over_budget'
    ? categoryForecasts.filter((c) => c.isOverBudget)
    : categoryForecasts;

  const getMonthLabel = (tab: 'm1' | 'm2' | 'm3') => {
    if (tab === 'm1') return language === 'ar_ma' ? 'Ch-har 1 (M+1)' : 'Mois 1 (M+1)';
    if (tab === 'm2') return language === 'ar_ma' ? 'Ch-har 2 (M+2)' : 'Mois 2 (M+2)';
    return language === 'ar_ma' ? 'Ch-har 3 (M+3)' : 'Mois 3 (M+3)';
  };

  return (
    <div className="bg-white dark:bg-[#1C1B17] rounded-xl border border-[#E7E2D6] dark:border-[#2F2C26] p-5 sm:p-6 shadow-xs transition-colors">
      {/* Header with Month Tabs & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-xs font-bold text-[#2B2621] dark:text-[#F2EFEA] uppercase tracking-wide flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#5B7B68] inline-block" />
            {language === 'ar_ma'
              ? 'Taqdir d kol categorie f telt chhor jaya'
              : 'Ventilation Prédictive par Poste Budgétaire'}
          </h3>
          <p className="text-[11px] text-[#786F62] dark:text-[#9A9184] mt-0.5">
            {language === 'ar_ma'
              ? 'Chof wach kol categorie ghadi tbqa ta7t l-plafond aw la.'
              : 'Évolution anticipée des charges par catégorie face aux plafonds budgétaires cibles.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Month Step Switcher */}
          <div className="inline-flex rounded-lg border border-[#DDD7C9] dark:border-[#38352F] bg-[#F4F1EA] dark:bg-[#25231F] p-0.5 text-xs">
            {(['m1', 'm2', 'm3'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedMonthTab(tab)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  selectedMonthTab === tab
                    ? 'bg-white dark:bg-[#1C1B17] text-[#A24824] dark:text-[#E8734C] shadow-xs font-bold'
                    : 'text-[#6A6154] dark:text-[#A69E91] hover:text-[#231F1C]'
                }`}
              >
                {getMonthLabel(tab)}
              </button>
            ))}
          </div>

          {/* Over-budget filter toggle */}
          <button
            type="button"
            onClick={() => setFilterMode(filterMode === 'all' ? 'over_budget' : 'all')}
            className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-colors ${
              filterMode === 'over_budget'
                ? 'bg-[#C2410C] text-white border-[#C2410C]'
                : 'bg-[#F4F1EA] dark:bg-[#252420] text-[#6E6457] dark:text-[#C5BEB3] border-[#DDD7C9] dark:border-[#38352F] hover:bg-[#EAE5DA]'
            }`}
          >
            {filterMode === 'over_budget'
              ? (language === 'ar_ma' ? 'Kolchi (Afficher tout)' : 'Tous les postes')
              : (language === 'ar_ma' ? '⚠️ Postes à risque' : '⚠️ Postes sous tension')}
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-3.5">
        {filteredCategories.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#8A8174] dark:text-[#9A9184]">
            <CheckCircle2 className="w-6 h-6 text-[#4F6D5B] mx-auto mb-1.5 opacity-80" />
            {language === 'ar_ma'
              ? 'Masha Allah! 7ta chi poste ma fih risque d dépassement had l-fatra.'
              : 'Excellente tenue budgétaire : Aucun poste ne dépasse son plafond sur cette période.'}
          </div>
        ) : (
          filteredCategories.map((item) => {
            const projectedVal = selectedMonthTab === 'm1'
              ? item.projectedM1
              : selectedMonthTab === 'm2'
              ? item.projectedM2
              : item.projectedM3;

            const budgetCap = item.allocatedBudget || 1;
            const ratioPct = Math.round((projectedVal / budgetCap) * 100);
            const isOver = projectedVal > budgetCap;
            const isWarning = ratioPct >= 85 && !isOver;

            return (
              <div
                key={item.categoryId}
                className="p-3 rounded-lg border border-[#EDE8DE] dark:border-[#2D2A24] bg-[#FAF8F4] dark:bg-[#181714] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold text-xs sm:text-sm text-[#24201B] dark:text-[#F2EFEA]">
                      {language === 'ar_ma' ? item.labelDarija || item.label : item.label}
                    </span>
                    {isOver ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#C2410C] bg-[#FFF1EB] dark:bg-[#381B10] px-2 py-0.5 rounded border border-[#FFCCB8] dark:border-[#662812]">
                        <AlertCircle className="w-3 h-3" />
                        {language === 'ar_ma' ? 'Khatar l-mizaniya' : 'Dépassement prévu'}
                      </span>
                    ) : isWarning ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#B45309] bg-[#FEF3C7] dark:bg-[#342407] px-2 py-0.5 rounded border border-[#FDE68A] dark:border-[#5B3D0A]">
                        {language === 'ar_ma' ? 'Ihtiyat (≥85%)' : 'Zone de vigilance'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#3B6B55] bg-[#EAF5EF] dark:bg-[#14281E] px-2 py-0.5 rounded border border-[#C5E5D4] dark:border-[#234A36]">
                        {language === 'ar_ma' ? 'Mzyan' : 'Sous contrôle'}
                      </span>
                    )}
                  </div>

                  {/* Values */}
                  <div className="flex items-baseline gap-3 text-xs">
                    <div className="text-[11px] text-[#7E7466] dark:text-[#9A9184]">
                      Hist. Moy: <span className="font-mono">{Math.round(item.historicalAverage).toLocaleString('fr-FR')}</span>
                    </div>
                    <div className="font-mono font-bold text-[#A24824] dark:text-[#E8734C] text-sm">
                      {Math.round(projectedVal).toLocaleString('fr-FR')} {currency === 'MAD' ? 'DH' : currency}
                    </div>
                    <div className="text-[11px] text-[#8C8375] font-mono">
                      / {Math.round(item.allocatedBudget).toLocaleString('fr-FR')}
                    </div>
                    <div
                      className={`text-[11px] font-bold font-mono ${
                        isOver
                          ? 'text-[#C2410C]'
                          : isWarning
                          ? 'text-[#B45309]'
                          : 'text-[#3B6B55]'
                      }`}
                    >
                      ({ratioPct}%)
                    </div>
                  </div>
                </div>

                {/* Progress Bar comparing Projected against Allocated Budget */}
                <div className="w-full bg-[#E8E3D7] dark:bg-[#2C2923] h-2 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOver
                        ? 'bg-[#C2410C]'
                        : isWarning
                        ? 'bg-[#D97706]'
                        : 'bg-[#4F6D5B]'
                    }`}
                    style={{ width: `${Math.min(100, ratioPct)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

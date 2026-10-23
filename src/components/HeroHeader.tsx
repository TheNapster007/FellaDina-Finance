import React from 'react';
import { PeriodFilter, Currency, Language } from '../types';
import { Filter } from 'lucide-react';

interface HeroHeaderProps {
  period: PeriodFilter;
  currency: Currency;
  language: Language;
  selectedCategoryName: string;
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({
  period,
  currency,
  language,
  selectedCategoryName,
}) => {
  return (
    <section className="mb-8 pt-2">
      {/* Category Kicker */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#8A8071] dark:text-[#9A9184]">
          {language === 'ar_ma'
            ? 'TABLEAU DE BORD · SUIVI FLOUS 2026'
            : language === 'en'
            ? 'PERFORMANCE DASHBOARD — FY2026'
            : 'TABLEAU DE BORD FINANCIER — FY2026'}
        </span>
      </div>

      {/* Main Editorial Headline with italic terracotta emphasis */}
      <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-serif leading-[1.15] tracking-[-0.015em] text-[#221F1C] dark:text-[#F2EFEA] max-w-4xl text-balance">
        {language === 'ar_ma' ? (
          <>
            Wach ghadyin mzyan f{' '}
            <span className="italic font-normal text-[#A24824] dark:text-[#D96B43]">
              l&apos;ahdaf d l&apos;épargne w lmasarif
            </span>{' '}
            had l&apos;fatra ?
          </>
        ) : language === 'en' ? (
          <>
            Are we hitting our{' '}
            <span className="italic font-normal text-[#A24824] dark:text-[#D96B43]">
              growth and efficiency
            </span>{' '}
            targets this quarter?
          </>
        ) : (
          <>
            Est-ce qu&apos;on respecte nos{' '}
            <span className="italic font-normal text-[#A24824] dark:text-[#D96B43]">
              objectifs d&apos;épargne et d&apos;efficience
            </span>{' '}
            ce trimestre ?
          </>
        )}
      </h1>

      {/* Subtitle */}
      <p className="mt-3 text-[#6A6154] dark:text-[#B6AEA3] text-sm sm:text-base leading-relaxed max-w-3xl">
        {language === 'ar_ma'
          ? 'Chof b deqqa chehal kankhser w chehal kandkhel — mizaneyat lmasrouf, lmadkhoul d ch-har, w flous li kaychito — m9arna m3a lhadaf li knti mssatar.'
          : language === 'en'
          ? 'A single view of the metrics that matter — income momentum, expense health, and net savings rate — benchmarked against budget and the prior period.'
          : "Une vue unifiée des métriques essentielles — dynamique des rentrées (kandkhel), maîtrise des dépenses (kankhser) et capacité d'épargne nette — comparées au budget prévisionnel."}
      </p>

      {/* Filter status pill matching screenshot */}
      <div className="mt-4 flex items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/70 dark:bg-[#1E1D19]/80 border border-[#DDD6C8] dark:border-[#38342D] rounded-full text-xs text-[#5E5549] dark:text-[#B6AEA3] shadow-2xs">
          <Filter className="w-3.5 h-3.5 text-[#A24824] dark:text-[#D96B43]" />
          <span>
            <strong className="font-semibold text-[#2C2722] dark:text-[#F2EFEA]">
              {language === 'ar_ma' ? 'Affichage : ' : language === 'en' ? 'Showing: ' : 'Filtres actifs : '}
            </strong>
            {period} · {selectedCategoryName} · {currency === 'MAD' ? 'Dirham Marocain (MAD)' : currency}
          </span>
        </div>
      </div>
    </section>
  );
};

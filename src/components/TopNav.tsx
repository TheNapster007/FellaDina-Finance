import React from 'react';
import { PeriodFilter, Currency, Language, Theme } from '../types';
import { Plus, ChevronDown, RefreshCw, FileSpreadsheet, FileText, Sun, Moon } from 'lucide-react';

interface TopNavProps {
  period: PeriodFilter;
  onPeriodChange: (p: PeriodFilter) => void;
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  language: Language;
  onLanguageChange: (l: Language) => void;
  theme: Theme;
  onToggleTheme: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  categories: { id: string; label: string; labelDarija: string }[];
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
  onOpenPdfModal?: () => void;
  onResetData: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  period,
  onPeriodChange,
  currency,
  onCurrencyChange,
  language,
  onLanguageChange,
  theme,
  onToggleTheme,
  selectedCategory,
  onSelectCategory,
  categories,
  onOpenAddModal,
  onOpenExportModal,
  onOpenPdfModal,
  onResetData,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#F7F5F0]/95 dark:bg-[#1A1916]/95 backdrop-blur-md border-b border-[#E7E2D6] dark:border-[#2E2B25] px-4 sm:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Earthy branded icon matching screenshot */}
            <div className="w-8 h-8 rounded-lg bg-[#A24824] text-[#F7F5F0] flex items-center justify-center font-bold text-sm shadow-sm ring-1 ring-[#8A3B1B]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <span className="font-serif font-bold text-lg tracking-tight text-[#2B2621] dark:text-[#F2EFEA]">
                {language === 'ar_ma' ? 'Mizan · Suivi Flous' : 'Mizan Finance'}
              </span>
              <span className="ml-2 text-[11px] font-sans uppercase tracking-wider text-[#8C8275] dark:text-[#8D8477] border-l border-[#D6CFBE] dark:border-[#3D382F] pl-2 hidden sm:inline">
                KPIs & Trésorerie
              </span>
            </div>
          </div>

          {/* Mobile Quick Actions */}
          <div className="flex items-center gap-1.5 md:hidden">
            {/* Mobile Theme Toggle */}
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
              className="p-1.5 bg-white dark:bg-[#22201C] border border-[#DCD5C6] dark:border-[#38342D] text-[#4A4237] dark:text-[#EAE6DF] rounded-lg shadow-2xs"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[#F59E0B]" /> : <Moon className="w-4 h-4 text-[#6F6659]" />}
            </button>

            {/* Mobile PDF Report */}
            {onOpenPdfModal && (
              <button
                onClick={onOpenPdfModal}
                title="Générer le rapport PDF / Relevé mensuel"
                className="p-1.5 bg-white dark:bg-[#22201C] border border-[#DCD5C6] dark:border-[#38342D] text-[#A24824] dark:text-[#E8734C] rounded-lg shadow-2xs"
              >
                <FileText className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onOpenExportModal}
              title="Exporter vers Excel (CSV)"
              className="p-1.5 bg-white dark:bg-[#22201C] border border-[#DCD5C6] dark:border-[#38342D] text-[#4A4237] dark:text-[#EAE6DF] rounded-lg shadow-2xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#3B6B55]" />
            </button>

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#A24824] hover:bg-[#8F3E1E] text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter</span>
            </button>
          </div>
        </div>

        {/* Controls Zone */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          {/* Segmented Period Switcher [Q1][Q2][Q3][YTD] */}
          <div className="inline-flex rounded-lg border border-[#DCD5C6] dark:border-[#38342D] bg-[#EFECE3] dark:bg-[#24221D] p-0.5">
            {(['Q1', 'Q2', 'Q3', 'YTD'] as PeriodFilter[]).map((p) => {
              const active = period === p;
              return (
                <button
                  key={p}
                  onClick={() => onPeriodChange(p)}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    active
                      ? 'bg-white dark:bg-[#322F28] text-[#2B2621] dark:text-[#F5F2EB] shadow-xs font-semibold'
                      : 'text-[#6F6659] dark:text-[#9A9284] hover:text-[#2B2621] dark:hover:text-[#F2EFEA]'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => onSelectCategory(e.target.value)}
              className="appearance-none bg-white dark:bg-[#22201C] border border-[#DCD5C6] dark:border-[#38342D] rounded-lg px-3 py-1.5 pr-7 text-[#2B2621] dark:text-[#F2EFEA] font-medium hover:border-[#BEB5A3] dark:hover:border-[#4E483F] focus:outline-none focus:ring-1 focus:ring-[#A24824] cursor-pointer"
            >
              <option value="all">
                {language === 'ar_ma' ? 'Kolchi (Toutes catégories)' : 'Toutes les catégories'}
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {language === 'ar_ma' ? c.labelDarija : c.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#8C8275] dark:text-[#887F72] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Currency Dropdown */}
          <div className="relative">
            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value as Currency)}
              className="appearance-none bg-white dark:bg-[#22201C] border border-[#DCD5C6] dark:border-[#38342D] rounded-lg px-2.5 py-1.5 pr-6 text-[#2B2621] dark:text-[#F2EFEA] font-medium hover:border-[#BEB5A3] dark:hover:border-[#4E483F] focus:outline-none focus:ring-1 focus:ring-[#A24824] cursor-pointer"
            >
              <option value="MAD">MAD (DH)</option>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#8C8275] dark:text-[#887F72] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Language Switch */}
          <div className="inline-flex rounded-lg border border-[#DCD5C6] dark:border-[#38342D] bg-[#EFECE3] dark:bg-[#24221D] p-0.5">
            <button
              onClick={() => onLanguageChange('fr')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium ${
                language === 'fr'
                  ? 'bg-white dark:bg-[#322F28] text-[#2B2621] dark:text-[#F5F2EB] font-semibold shadow-xs'
                  : 'text-[#6F6659] dark:text-[#9A9284]'
              }`}
              title="Français"
            >
              FR
            </button>
            <button
              onClick={() => onLanguageChange('ar_ma')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium ${
                language === 'ar_ma'
                  ? 'bg-white dark:bg-[#322F28] text-[#A24824] font-semibold shadow-xs'
                  : 'text-[#6F6659] dark:text-[#9A9284]'
              }`}
              title="Darija (Marocain)"
            >
              Darija
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium ${
                language === 'en'
                  ? 'bg-white dark:bg-[#322F28] text-[#2B2621] dark:text-[#F5F2EB] font-semibold shadow-xs'
                  : 'text-[#6F6659] dark:text-[#9A9284]'
              }`}
              title="English"
            >
              EN
            </button>
          </div>

          {/* Dark Mode Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Basculer en Mode Clair' : 'Basculer en Mode Sombre'}
            className="p-1.5 bg-white dark:bg-[#22201C] hover:bg-[#F3EFE7] dark:hover:bg-[#2C2924] border border-[#DCD5C6] dark:border-[#38342D] text-[#554C40] dark:text-[#EAE6DF] rounded-lg transition-colors shadow-2xs"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-[#F59E0B]" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-[#6F6659]" />
            )}
          </button>

          {/* Export CSV Button */}
          <button
            onClick={onOpenExportModal}
            title="Exporter vers Excel (Transactions & Budgets en CSV)"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-[#22201C] hover:bg-[#F3EFE7] dark:hover:bg-[#2C2924] border border-[#DCD5C6] dark:border-[#38342D] text-[#343029] dark:text-[#E8E4DC] rounded-lg transition-colors font-medium shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#3B6B55]" />
            <span className="hidden xl:inline">Export Excel</span>
          </button>

          {/* PDF Report Button */}
          {onOpenPdfModal && (
            <button
              onClick={onOpenPdfModal}
              title="Générer un relevé financier mensuel en PDF (A4)"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-[#22201C] hover:bg-[#FAF4F0] dark:hover:bg-[#2C2522] border border-[#DCD5C6] dark:border-[#38342D] hover:border-[#A24824]/40 text-[#2B2621] dark:text-[#F2EFEA] rounded-lg transition-colors font-medium shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-[#A24824]" />
              <span className="hidden lg:inline">Rapport PDF</span>
            </button>
          )}

          {/* Reset / Reload Demo Data */}
          <button
            onClick={onResetData}
            title="Réinitialiser les données de démonstration"
            className="p-1.5 bg-white dark:bg-[#22201C] hover:bg-[#F3EFE7] dark:hover:bg-[#2C2924] border border-[#DCD5C6] dark:border-[#38342D] text-[#6F6659] dark:text-[#A8A092] hover:text-[#2B2621] dark:hover:text-[#F2EFEA] rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Desktop Primary CTA */}
          <button
            onClick={onOpenAddModal}
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#A24824] hover:bg-[#8F3E1E] text-white text-xs font-semibold rounded-lg shadow-sm transition-all hover:shadow"
          >
            <Plus className="w-4 h-4" />
            <span>
              {language === 'ar_ma'
                ? '+ Zid Flous / Masrouf'
                : language === 'en'
                ? '+ New Entry'
                : '+ Nouvelle Transaction'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

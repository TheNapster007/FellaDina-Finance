import React, { useState } from 'react';
import { Transaction, CategoryBudget, Currency, Language } from '../types';
import { exportFinancialDataToCsv } from '../utils/exportCsv';
import { X, Download, FileSpreadsheet, Check, CheckCircle2, Sliders } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  categories: CategoryBudget[];
  currency: Currency;
  language: Language;
  onExportSuccess?: (filename: string) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  categories,
  currency,
  language,
  onExportSuccess,
}) => {
  const [includeBudgets, setIncludeBudgets] = useState(true);
  const [includeTransactions, setIncludeTransactions] = useState(true);
  const [includeMonthlySummary, setIncludeMonthlySummary] = useState(true);
  const [delimiter, setDelimiter] = useState<';' | ','>(';');
  const [exportedSuccess, setExportedSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const result = exportFinancialDataToCsv(transactions, categories, currency, language, {
      includeBudgets,
      includeTransactions,
      includeMonthlySummary,
      delimiter,
    });
    setExportedSuccess(result.filename);
    if (onExportSuccess) {
      onExportSuccess(result.filename);
    }
    setTimeout(() => {
      setExportedSuccess(null);
      onClose();
    }, 1600);
  };

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#FAF8F5] dark:bg-[#1C1A17] rounded-xl border border-[#DED7C9] dark:border-[#38342D] shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E2D5] dark:border-[#312E28] bg-white dark:bg-[#23211D]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3B6B55] text-white flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#25201B] dark:text-[#F2EFEA]">
                {language === 'ar_ma'
                  ? 'Exporter CSV l-Excel'
                  : 'Exporter vers Excel (CSV)'}
              </h3>
              <p className="text-xs text-[#807669] dark:text-[#9A9184]">
                {language === 'ar_ma'
                  ? 'Sauvegarder les transactions w les budgets dyalk'
                  : 'Sauvegarde complète & analyse financière'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8A8071] hover:text-[#25201B] dark:hover:text-[#F2EFEA] rounded-lg hover:bg-[#F2EEE4] dark:hover:bg-[#2F2C26] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Summary Preview Box */}
          <div className="p-3.5 bg-white dark:bg-[#24221D] rounded-lg border border-[#E5E0D5] dark:border-[#36322A] text-xs space-y-2">
            <div className="flex justify-between items-center text-[#5A5144] dark:text-[#A69E91]">
              <span>Transactions enregistrées :</span>
              <strong className="text-[#25201B] dark:text-[#F2EFEA] font-mono tabular-nums">{transactions.length} opérations</strong>
            </div>
            <div className="flex justify-between items-center text-[#5A5144] dark:text-[#A69E91]">
              <span>Postes budgétaires :</span>
              <strong className="text-[#25201B] dark:text-[#F2EFEA] font-mono tabular-nums">{categories.length} catégories</strong>
            </div>
            <div className="flex justify-between items-center text-[#5A5144] dark:text-[#A69E91]">
              <span>Devise active :</span>
              <strong className="text-[#A24824] dark:text-[#E8734C] font-semibold">{currency === 'MAD' ? 'Dirham Marocain (MAD)' : currency}</strong>
            </div>
            <div className="pt-2 border-t border-[#F0ECE1] dark:border-[#332F28] flex justify-between items-center text-[11px] text-[#8C8375] dark:text-[#887F72]">
              <span>Volume total :</span>
              <span className="font-mono tabular-nums text-[#25201B] dark:text-[#F2EFEA]">
                +{(totalIncome / 1000).toFixed(1)}k / -{(totalExpense / 1000).toFixed(1)}k
              </span>
            </div>
          </div>

          {/* Export Sections Checkboxes */}
          <div className="space-y-2.5">
            <span className="block text-xs font-semibold text-[#484036] dark:text-[#D5CFC5]">
              {language === 'ar_ma' ? 'Chno bghiti t-exporter ?' : 'Données à inclure dans le fichier :'}
            </span>

            <label className="flex items-center gap-2.5 p-2.5 bg-white dark:bg-[#24221D] rounded-lg border border-[#E5E0D5] dark:border-[#36322A] cursor-pointer hover:border-[#D6CEBF] dark:hover:border-[#4E473C] transition-colors">
              <input
                type="checkbox"
                checked={includeBudgets}
                onChange={(e) => setIncludeBudgets(e.target.checked)}
                className="w-4 h-4 text-[#A24824] rounded border-[#D0C8B7] dark:border-[#4B4438] bg-transparent focus:ring-[#A24824]"
              />
              <div className="text-xs">
                <span className="font-semibold text-[#25201B] dark:text-[#F2EFEA] block">
                  Paramètres et objectifs budgétaires
                </span>
                <span className="text-[#7A7063] dark:text-[#9A9184] text-[11px]">
                  Budgets alloués, montants réels engagés, écarts et statuts
                </span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 bg-white dark:bg-[#24221D] rounded-lg border border-[#E5E0D5] dark:border-[#36322A] cursor-pointer hover:border-[#D6CEBF] dark:hover:border-[#4E473C] transition-colors">
              <input
                type="checkbox"
                checked={includeTransactions}
                onChange={(e) => setIncludeTransactions(e.target.checked)}
                className="w-4 h-4 text-[#A24824] rounded border-[#D0C8B7] dark:border-[#4B4438] bg-transparent focus:ring-[#A24824]"
              />
              <div className="text-xs">
                <span className="font-semibold text-[#25201B] dark:text-[#F2EFEA] block">
                  Journal complet des transactions
                </span>
                <span className="text-[#7A7063] dark:text-[#9A9184] text-[11px]">
                  Date, type (entrée/sortie), catégorie, description, tiers et montant
                </span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 bg-white dark:bg-[#24221D] rounded-lg border border-[#E5E0D5] dark:border-[#36322A] cursor-pointer hover:border-[#D6CEBF] dark:hover:border-[#4E473C] transition-colors">
              <input
                type="checkbox"
                checked={includeMonthlySummary}
                onChange={(e) => setIncludeMonthlySummary(e.target.checked)}
                className="w-4 h-4 text-[#A24824] rounded border-[#D0C8B7] dark:border-[#4B4438] bg-transparent focus:ring-[#A24824]"
              />
              <div className="text-xs">
                <span className="font-semibold text-[#25201B] dark:text-[#F2EFEA] block">
                  Synthèse mensuelle agrégée
                </span>
                <span className="text-[#7A7063] dark:text-[#9A9184] text-[11px]">
                  Évolution mois par mois, solde net et taux d&apos;épargne
                </span>
              </div>
            </label>
          </div>

          {/* Delimiter / Format for Excel */}
          <div>
            <label className="block text-xs font-semibold text-[#484036] dark:text-[#D5CFC5] mb-1.5">
              Séparateur de colonnes (Format Excel) :
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDelimiter(';')}
                className={`py-2 px-3 rounded-lg border text-left font-medium transition-all ${
                  delimiter === ';'
                    ? 'bg-[#2B2621] dark:bg-[#433E35] text-white border-[#2B2621] dark:border-[#575043] shadow-2xs'
                    : 'bg-white dark:bg-[#24221D] border-[#DCD5C6] dark:border-[#38342D] text-[#605648] dark:text-[#A69E91] hover:border-[#BEB4A2] dark:hover:border-[#524B3F]'
                }`}
              >
                <div className="font-bold">Point-virgule ( ; )</div>
                <div className="text-[10px] opacity-80">Recommandé pour Excel FR/Europe</div>
              </button>
              <button
                type="button"
                onClick={() => setDelimiter(',')}
                className={`py-2 px-3 rounded-lg border text-left font-medium transition-all ${
                  delimiter === ','
                    ? 'bg-[#2B2621] dark:bg-[#433E35] text-white border-[#2B2621] dark:border-[#575043] shadow-2xs'
                    : 'bg-white dark:bg-[#24221D] border-[#DCD5C6] dark:border-[#38342D] text-[#605648] dark:text-[#A69E91] hover:border-[#BEB4A2] dark:hover:border-[#524B3F]'
                }`}
              >
                <div className="font-bold">Virgule ( , )</div>
                <div className="text-[10px] opacity-80">Standard US & Google Sheets</div>
              </button>
            </div>
          </div>

          {/* Feedback Success banner */}
          {exportedSuccess && (
            <div className="p-3 bg-[#EAF1EB] dark:bg-[#1E3325] border border-[#C5DDCB] dark:border-[#2D543B] text-[#2C623E] dark:text-[#52A36F] rounded-lg text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Fichier <strong>{exportedSuccess}</strong> généré et téléchargé avec succès !</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E8E2D5] dark:border-[#312E28]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#665D50] dark:text-[#9A9184] hover:text-[#25201B] dark:hover:text-[#F2EFEA] hover:bg-[#EFEAE0] dark:hover:bg-[#2C2923] rounded-lg transition-colors"
            >
              Fermer
            </button>
            <button
              type="button"
              disabled={!includeBudgets && !includeTransactions && !includeMonthlySummary}
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#3B6B55] hover:bg-[#2F5845] disabled:opacity-50 rounded-lg shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger le CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

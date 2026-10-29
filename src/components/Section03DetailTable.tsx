import React, { useState } from 'react';
import { Transaction, CategoryBudget, SubCategory, Currency, Language } from '../types';
import { Search, Plus, Trash2, Edit2, Download, ArrowUpRight, ArrowDownLeft, FileText, Layers, Tag, Receipt, ChevronDown, ChevronRight, Eye, FolderPlus, X, Filter, Calendar, Hash, Lock } from 'lucide-react';
import { exportFinancialDataToCsv } from '../utils/exportCsv';

interface Section03DetailTableProps {
  categories: CategoryBudget[];
  transactions: Transaction[];
  subCategories: SubCategory[];
  currency: Currency;
  language: Language;
  onOpenAddModal: () => void;
  onOpenExportModal?: () => void;
  onOpenPdfModal?: () => void;
  onOpenCategoryDetail?: (categoryId: string) => void;
  onOpenCategoryManager?: () => void;
  onOpenSubCategoryManager?: (categoryId?: string) => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const Section03DetailTable: React.FC<Section03DetailTableProps> = ({
  categories,
  transactions,
  subCategories,
  currency,
  language,
  onOpenAddModal,
  onOpenExportModal,
  onOpenPdfModal,
  onOpenCategoryDetail,
  onOpenCategoryManager,
  onOpenSubCategoryManager,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'transactions'>('categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterSubCategory, setFilterSubCategory] = useState<string>('all');
  const [expandedTxIds, setExpandedTxIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedTxIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Compute spend per category from transactions
  const categoryStats = categories.map((cat) => {
    const txList = transactions.filter((t) => t.category === cat.id);
    const totalSpent = txList.reduce((acc, t) => acc + t.amount, 0);
    const attainment = cat.allocatedBudget > 0 ? (totalSpent / cat.allocatedBudget) * 100 : 100;
    const catSubCount = subCategories.filter((s) => s.categoryId === cat.id).length;

    // Status assessment
    let status: 'on_track' | 'watch' | 'at_risk' = 'on_track';
    if (cat.type === 'expense') {
      if (attainment > 105) status = 'at_risk';
      else if (attainment > 90) status = 'watch';
      else status = 'on_track';
    } else {
      if (attainment >= 100) status = 'on_track';
      else if (attainment >= 85) status = 'watch';
      else status = 'at_risk';
    }

    // QoQ mock variance
    const qoq = cat.type === 'income' ? '+14%' : cat.id === 'logement' ? '0%' : '+8%';

    return {
      ...cat,
      totalSpent,
      attainment,
      status,
      qoq,
      catSubCount,
    };
  });

  // Month names dictionary for matching dates in French, English, and Moroccan Darija
  const MONTH_NAMES_MAP: Record<number, string[]> = {
    1: ['janvier', 'janv', 'jan', 'january', 'yanayer'],
    2: ['février', 'fevrier', 'fevr', 'feb', 'february', 'febrayer'],
    3: ['mars', 'mar', 'march', 'marsi'],
    4: ['avril', 'avr', 'apr', 'april', 'abril'],
    5: ['mai', 'may'],
    6: ['juin', 'jun', 'june', 'younyou'],
    7: ['juillet', 'juil', 'jul', 'july', 'youlyouz'],
    8: ['août', 'aout', 'aou', 'aug', 'august', 'ghoucht'],
    9: ['septembre', 'sept', 'sep', 'september', 'choutanbir'],
    10: ['octobre', 'oct', 'october', 'oktobar'],
    11: ['novembre', 'nov', 'november', 'nouwanbir'],
    12: ['décembre', 'decembre', 'dec', 'december', 'doujanbir'],
  };

  // Helper checking if a single query token matches a transaction
  const matchTransactionTerm = (t: Transaction, term: string): boolean => {
    if (!term) return true;

    const cat = categories.find((c) => c.id === t.category);
    const sub = subCategories.find((s) => s.id === t.subCategory);

    // 1. Amount Comparison Operators (e.g. > 1000, >= 500, < 200, <= 50, = 4500)
    const opMatch = term.match(/^([><]=?|=)\s*([0-9]+([.,][0-9]+)?)$/);
    if (opMatch) {
      const op = opMatch[1];
      const val = parseFloat(opMatch[2].replace(',', '.'));
      if (!isNaN(val)) {
        if (op === '>') return t.amount > val;
        if (op === '>=') return t.amount >= val;
        if (op === '<') return t.amount < val;
        if (op === '<=') return t.amount <= val;
        if (op === '=') return Math.abs(t.amount - val) < 0.01;
      }
    }

    // 2. Keyword Matching (note, category label & id, subcategory, recipient, paymentMethod, items, type)
    const noteMatch = t.note.toLowerCase().includes(term);
    const categoryIdMatch = t.category.toLowerCase().includes(term);
    const categoryLabelMatch = cat?.label.toLowerCase().includes(term);
    const categoryDarijaMatch = cat?.labelDarija?.toLowerCase().includes(term);
    const subNameMatch = sub?.name.toLowerCase().includes(term);
    const subDarijaMatch = sub?.nameDarija?.toLowerCase().includes(term);
    const recipientMatch = Boolean(t.recipientOrSource && t.recipientOrSource.toLowerCase().includes(term));
    const paymentMethodMatch = Boolean(t.paymentMethod && t.paymentMethod.toLowerCase().includes(term));
    const itemMatch = Boolean(t.items?.some((it) => it.name.toLowerCase().includes(term)));

    // Type matches (French, English, Darija terms)
    const isIncomeToken = ['rentree', 'rentrée', 'rentrees', 'rentrées', 'income', 'revenu', 'salaire', 'incomes', 'dakhl'].some(
      (k) => k.includes(term) || term.includes(k)
    );
    const isExpenseToken = ['depense', 'dépense', 'depenses', 'dépenses', 'expense', 'expenses', 'sortie', 'masrouf'].some(
      (k) => k.includes(term) || term.includes(k)
    );
    const typeMatch = (isIncomeToken && t.type === 'income') || (isExpenseToken && t.type === 'expense');

    if (
      noteMatch ||
      categoryIdMatch ||
      categoryLabelMatch ||
      categoryDarijaMatch ||
      subNameMatch ||
      subDarijaMatch ||
      recipientMatch ||
      paymentMethodMatch ||
      itemMatch ||
      typeMatch
    ) {
      return true;
    }

    // 3. Amount Matching (raw number, rounded, french formatted, or item total)
    const cleanNumeric = term.replace(/[^\d.,]/g, '').replace(',', '.');
    if (cleanNumeric && !isNaN(Number(cleanNumeric))) {
      const amountStr = t.amount.toString();
      const roundStr = Math.round(t.amount).toString();
      const formattedFR = Math.round(t.amount).toLocaleString('fr-FR').replace(/\s+/g, '');
      if (
        amountStr.includes(cleanNumeric) ||
        roundStr.includes(cleanNumeric) ||
        formattedFR.includes(cleanNumeric.replace('.', ''))
      ) {
        return true;
      }

      // Check item prices if items receipt breakdown exists
      const itemPriceMatch = t.items?.some(
        (it) =>
          it.totalPrice.toString().includes(cleanNumeric) ||
          Math.round(it.totalPrice).toString().includes(cleanNumeric)
      );
      if (itemPriceMatch) return true;
    }

    // 4. Date Matching (ISO date, DD/MM/YYYY, DD/MM, Day number, Month names)
    if (t.date.toLowerCase().includes(term)) {
      return true;
    }

    const dateParts = t.date.split('-');
    if (dateParts.length === 3) {
      const [year, monthStr, dayStr] = dateParts;
      const monthNum = parseInt(monthStr, 10);
      const dayNum = parseInt(dayStr, 10);

      const euroFull = `${dayStr}/${monthStr}/${year}`;
      const euroShort = `${dayStr}/${monthStr}`;
      const dashShort = `${dayStr}-${monthStr}`;
      if (euroFull.includes(term) || euroShort.includes(term) || dashShort.includes(term)) {
        return true;
      }

      // Exact day match (e.g. "24" or "le 24")
      if (term === dayStr || term === String(dayNum) || term === `le ${dayNum}`) {
        return true;
      }

      // Month name match (e.g. "octobre", "oct", "septembre", "janvier")
      const monthKeywords = MONTH_NAMES_MAP[monthNum] || [];
      if (monthKeywords.some((kw) => kw.includes(term) || term.includes(kw))) {
        return true;
      }
    }

    return false;
  };

  // Filtered transactions for the journal with real-time keyword, amount, and date filtering
  const filteredTransactions = transactions.filter((t) => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesSub = filterSubCategory === 'all' || t.subCategory === filterSubCategory;

    if (!matchesType || !matchesSub) return false;

    const trimmedQuery = searchQuery.trim().toLowerCase();
    if (!trimmedQuery) return true;

    // Direct normalized match for space-formatted amounts (e.g., "4 500" or "4500 DH")
    const noSpacesQuery = trimmedQuery.replace(/\s+/g, '').replace(/dh|mad|€|\$|eur|usd/g, '');
    const roundAmountNoSpaces = Math.round(t.amount).toString();
    const formattedAmountNoSpaces = Math.round(t.amount).toLocaleString('fr-FR').replace(/\s+/g, '');
    if (noSpacesQuery && (roundAmountNoSpaces === noSpacesQuery || formattedAmountNoSpaces === noSpacesQuery)) {
      return true;
    }

    // Comparison operator query (e.g., "> 1000")
    if (/^[><]=?|=/.test(trimmedQuery)) {
      return matchTransactionTerm(t, trimmedQuery);
    }

    // Split by whitespace: all tokens must match
    const tokens = trimmedQuery.split(/\s+/).filter(Boolean);
    return tokens.every((token) => matchTransactionTerm(t, token));
  });

  // Export to CSV
  const handleExportCSV = () => {
    if (onOpenExportModal) {
      onOpenExportModal();
    } else {
      exportFinancialDataToCsv(transactions, categories, currency, language);
    }
  };

  return (
    <section className="mb-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#221F1C] dark:text-[#F2EFEA] flex items-baseline gap-2">
          <span className="font-serif italic text-sm text-[#A24824] dark:text-[#E8734C] font-semibold">03</span>
          <span>
            {language === 'ar_ma'
              ? 'Tafassil — b l&apos;asnâaf, sous-catégories w opérations'
              : language === 'en'
              ? 'The detail — by product line & subcategories'
              : 'Le détail — par poste, sous-catégorie & transactions'}
          </span>
        </h2>
        <span className="text-xs text-[#7F7668] dark:text-[#9A9184] max-w-md text-right hidden sm:block">
          {language === 'ar_ma'
            ? 'Warra9 3la ay sttar bach tchof les sous-catégories w les articles (Atay, Sokar, Hlib...)'
            : 'Cliquez sur un poste pour inspecter ses sous-catégories et les articles achetés.'}
        </span>
      </div>

      {/* Main Container Card */}
      <div className="bg-white dark:bg-[#1E1D19] rounded-xl border border-[#E5E0D5] dark:border-[#312E28] shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden transition-colors">
        {/* Table Toolbar & Tab Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-b border-[#EBE6DC] dark:border-[#312E28] bg-[#FAF8F5] dark:bg-[#24221E]">
          {/* Sub tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#EBE6DC] dark:bg-[#2C2923] rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'categories'
                  ? 'bg-white dark:bg-[#38342D] text-[#2B2621] dark:text-[#F5F2EB] shadow-2xs'
                  : 'text-[#6A6052] dark:text-[#9A9184] hover:text-[#2B2621] dark:hover:text-[#F2EFEA]'
              }`}
            >
              {language === 'ar_ma' ? 'Synthèse d l&apos;asnâaf' : 'Postes de Budget (Synthèse)'}
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'transactions'
                  ? 'bg-white dark:bg-[#38342D] text-[#2B2621] dark:text-[#F5F2EB] shadow-2xs'
                  : 'text-[#6A6052] dark:text-[#9A9184] hover:text-[#2B2621] dark:hover:text-[#F2EFEA]'
              }`}
            >
              {language === 'ar_ma' ? 'Journal d l&apos;opérations' : 'Journal des Transactions'}
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors ${
                  searchQuery.trim()
                    ? 'bg-[#A24824] text-white'
                    : 'bg-[#DDD6C8] dark:bg-[#433E35] text-[#2B2621] dark:text-[#E8E4DC]'
                }`}
              >
                {searchQuery.trim() ? `${filteredTransactions.length}/${transactions.length}` : transactions.length}
              </span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {activeTab === 'categories' && (
              <button
                onClick={() => setActiveTab('transactions')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#26241F] border border-[#D5CDBC] dark:border-[#3D382F] hover:border-[#A24824] text-[#4A4237] dark:text-[#E8E4DC] hover:text-[#A24824] rounded-lg text-xs font-medium transition-colors"
                title="Rechercher des transactions par mot-clé, montant ou date"
              >
                <Search className="w-3.5 h-3.5 text-[#A24824] dark:text-[#E8734C]" />
                <span className="hidden sm:inline">
                  {language === 'ar_ma' ? 'Qlleb' : 'Rechercher'}
                </span>
              </button>
            )}
            {onOpenCategoryManager && (
              <button
                onClick={onOpenCategoryManager}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#26241F] border border-[#D5CDBC] dark:border-[#3D382F] hover:border-[#BEB4A2] text-[#4A4237] dark:text-[#E8E4DC] rounded-lg text-xs font-medium transition-colors"
                title="Gérer et créer de nouvelles catégories de budget"
              >
                <FolderPlus className="w-3.5 h-3.5 text-[#A24824] dark:text-[#E8734C]" />
                <span className="hidden md:inline">
                  {language === 'ar_ma' ? 'Catégories' : 'Catégories'}
                </span>
              </button>
            )}

            {onOpenSubCategoryManager && (
              <button
                onClick={() => onOpenSubCategoryManager()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#26241F] border border-[#D5CDBC] dark:border-[#3D382F] hover:border-[#BEB4A2] text-[#4A4237] dark:text-[#E8E4DC] rounded-lg text-xs font-medium transition-colors"
                title="Gérer les sous-catégories personnalisées"
              >
                <Layers className="w-3.5 h-3.5 text-[#A24824] dark:text-[#E8734C]" />
                <span className="hidden md:inline">
                  {language === 'ar_ma' ? 'Gérer sous-catégories' : 'Sous-Catégories'}
                </span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#26241F] border border-[#D5CDBC] dark:border-[#3D382F] text-[#4A4237] dark:text-[#E8E4DC] hover:text-[#2B2621] dark:hover:text-[#FFFFFF] hover:border-[#BDB39E] dark:hover:border-[#524B3F] rounded-lg text-xs font-medium transition-colors"
              title="Exporter vers Excel (Transactions et Budgets)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CSV</span>
            </button>

            {onOpenPdfModal && (
              <button
                onClick={onOpenPdfModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#26241F] border border-[#D5CDBC] dark:border-[#3D382F] hover:border-[#A24824]/50 text-[#A24824] dark:text-[#E8734C] hover:bg-[#FAF3EF] dark:hover:bg-[#2B221E] rounded-lg text-xs font-medium transition-colors"
                title="Générer un rapport PDF / Relevé officiel"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PDF</span>
              </button>
            )}

            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#A24824] hover:bg-[#8F3E1E] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'ar_ma' ? '+ Zid' : '+ Ajouter'}</span>
            </button>
          </div>
        </div>

        {/* View 1: Categories Synthesis Tab */}
        {activeTab === 'categories' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#EBE6DC] dark:border-[#312E28] text-[#7A7163] dark:text-[#9A9184] uppercase tracking-wider text-[10px] font-semibold bg-[#FDFCF9] dark:bg-[#22201B]">
                  <th className="py-3 px-5">
                    {language === 'ar_ma' ? 'Catégorie / Pôle' : 'Poste Budgétaire'}
                  </th>
                  <th className="py-3 px-4 text-right">
                    {language === 'ar_ma' ? 'Montant' : 'Montant Engagé'}
                  </th>
                  <th className="py-3 px-4 text-center">
                    {language === 'ar_ma' ? 'Sous-Catégories' : 'Sous-Catégories'}
                  </th>
                  <th className="py-3 px-6 text-left">
                    {language === 'ar_ma' ? 'Atteinte l&apos;hadaf' : 'Consommation Budget'}
                  </th>
                  <th className="py-3 px-4 text-right">
                    {language === 'ar_ma' ? 'Plafond' : 'Plafond'}
                  </th>
                  <th className="py-3 px-5 text-center">
                    {language === 'ar_ma' ? 'Détails' : 'Action'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2EFE8] dark:divide-[#2B2822] text-[#2F2922] dark:text-[#ECE7DE]">
                {categoryStats.map((item) => {
                  const percent = Math.min(100, Math.round(item.attainment));
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#FAF8F3] dark:hover:bg-[#26231E] transition-colors group cursor-pointer"
                      onClick={() => onOpenCategoryDetail && onOpenCategoryDetail(item.id)}
                    >
                      {/* Product line / Category */}
                      <td className="py-3.5 px-5 font-medium flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-xs shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <div>
                          <div className="font-semibold text-[#25201B] dark:text-[#F2EFEA] group-hover:text-[#A24824] dark:group-hover:text-[#E8734C] transition-colors flex items-center gap-1.5">
                            <span>{language === 'ar_ma' ? item.labelDarija : item.label}</span>
                            {item.isCustom && (
                              <span className="text-[9px] uppercase font-semibold px-1 py-0.2 bg-[#FAF0E6] dark:bg-[#342721] text-[#A24824] dark:text-[#E8734C] rounded border border-[#EAD5C5] dark:border-[#4D3328]">
                                {language === 'ar_ma' ? 'Jdid' : 'Custom'}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#867C6E] dark:text-[#9A9184]">
                            {item.type === 'income' ? '↗ Rentrée' : '↘ Dépense'}
                          </div>
                        </div>
                      </td>

                      {/* Revenue / Amount */}
                      <td className="py-3.5 px-4 text-right font-mono font-semibold tabular-nums text-[#25201B] dark:text-[#F2EFEA]">
                        {Math.round(item.totalSpent).toLocaleString('fr-FR')} {currency === 'MAD' ? 'DH' : currency}
                      </td>

                      {/* Subcategories count badge */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onOpenCategoryDetail) onOpenCategoryDetail(item.id);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F4EFE6] dark:bg-[#2B2822] hover:bg-[#EAE4D7] text-[#554B3E] dark:text-[#C5BEB3] text-[11px] font-semibold transition-colors"
                        >
                          <Layers className="w-3 h-3 text-[#A24824] dark:text-[#E8734C]" />
                          <span>{item.catSubCount} sous-cat.</span>
                        </button>
                      </td>

                      {/* Attainment vs target */}
                      <td className="py-3.5 px-6 min-w-[180px]">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-semibold tabular-nums w-10 text-right text-[#25201B] dark:text-[#F2EFEA]">
                            {Math.round(item.attainment)}%
                          </span>
                          <div className="flex-1 h-1.5 bg-[#EAE5D9] dark:bg-[#343029] rounded-full overflow-hidden">
                            <div
                              style={{ width: `${percent}%` }}
                              className={`h-full rounded-full ${
                                item.type === 'expense'
                                  ? percent > 100
                                    ? 'bg-[#A24824]'
                                    : percent > 80
                                    ? 'bg-[#C67551]'
                                    : 'bg-[#557C67]'
                                  : 'bg-[#3B6B55]'
                              }`}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Allocated Budget */}
                      <td className="py-3.5 px-4 text-right font-mono text-xs tabular-nums text-[#6E6457] dark:text-[#9A9184]">
                        {Math.round(item.allocatedBudget).toLocaleString('fr-FR')} {currency === 'MAD' ? 'DH' : currency}
                      </td>

                      {/* Action to drill down */}
                      <td className="py-3.5 px-5 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onOpenCategoryDetail) onOpenCategoryDetail(item.id);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-[#2A2722] border border-[#D5CDBC] dark:border-[#3D382F] hover:border-[#A24824] text-[#A24824] dark:text-[#E8734C] text-[11px] font-semibold rounded-lg transition-colors shadow-2xs"
                        >
                          <Eye className="w-3 h-3" />
                          <span>{language === 'ar_ma' ? 'Tafassil' : 'Détails'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {onOpenCategoryManager && (
                <tfoot>
                  <tr className="bg-[#FAF8F5] dark:bg-[#23211D] border-t border-[#EBE6DC] dark:border-[#312E28]">
                    <td colSpan={6} className="py-3 px-5">
                      <button
                        onClick={onOpenCategoryManager}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-[#A24824] dark:text-[#E8734C] hover:underline cursor-pointer"
                      >
                        <FolderPlus className="w-4 h-4" />
                        <span>
                          {language === 'ar_ma'
                            ? '+ Zid sinf / catégorie jdida aw beddel l-mizaniyat'
                            : '+ Ajouter une nouvelle catégorie ou ajuster les budgets alloués'}
                        </span>
                      </button>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}

        {/* View 2: Transactions Journal Tab */}
        {activeTab === 'transactions' && (
          <div>
            {/* Search and Filters Bar */}
            <div className="p-4 border-b border-[#EBE6DC] dark:border-[#312E28] bg-white dark:bg-[#1E1D19] space-y-3">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Search input with live count & clear button */}
                <div className="relative flex-1 max-w-xl">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8375] dark:text-[#887F72]" />
                  <input
                    type="text"
                    placeholder={
                      language === 'ar_ma'
                        ? 'Qlleb b l-kelma, montant (ex: 4500, >1000), aw tarikh (ex: 2026-10, oct)...'
                        : language === 'en'
                        ? 'Search keywords, amount (e.g. 4500, >1000), date (e.g. 2026-10, Oct)...'
                        : 'Rechercher mot-clé, montant (ex: 4500, >1000), date (ex: 2026-10, oct)...'
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-20 py-2 text-xs bg-[#FAF8F5] dark:bg-[#26241F] border border-[#DCD5C6] dark:border-[#38342D] rounded-lg text-[#25201B] dark:text-[#F2EFEA] placeholder-[#A49B8E] dark:placeholder-[#766E62] focus:outline-none focus:ring-1 focus:ring-[#A24824] transition-colors"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="p-1 text-[#8C8375] hover:text-[#A24824] dark:hover:text-[#E8734C] transition-colors rounded-full"
                        title="Effacer la recherche"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#EBE6DC] dark:bg-[#343029] text-[#6A6052] dark:text-[#A69E91] font-semibold">
                      {filteredTransactions.length}
                    </span>
                  </div>
                </div>

                {/* SubCategory and Type Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* SubCategory Filter Dropdown */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-[#6A6052] dark:text-[#9A9184]">
                      {language === 'ar_ma' ? 'Sous-catégorie :' : 'Sous-catégorie :'}
                    </span>
                    <select
                      value={filterSubCategory}
                      onChange={(e) => setFilterSubCategory(e.target.value)}
                      className="bg-[#FAF8F5] dark:bg-[#26241F] border border-[#DCD5C6] dark:border-[#38342D] rounded-lg px-2.5 py-1.5 text-xs text-[#25201B] dark:text-[#F2EFEA] focus:outline-none focus:ring-1 focus:ring-[#A24824]"
                    >
                      <option value="all">
                        {language === 'ar_ma' ? 'Koulchi (Toutes)' : 'Toutes les sous-catégories'}
                      </option>
                      {subCategories.map((sub) => {
                        const parent = categories.find((c) => c.id === sub.categoryId);
                        return (
                          <option key={sub.id} value={sub.id}>
                            {parent?.label} → {sub.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Type pill filter */}
                  <div className="flex items-center gap-1 p-0.5 bg-[#EBE6DC] dark:bg-[#2C2923] rounded-lg text-xs">
                    <button
                      onClick={() => setFilterType('all')}
                      className={`px-2.5 py-1 rounded-md font-medium text-xs transition-all ${
                        filterType === 'all'
                          ? 'bg-white dark:bg-[#38342D] text-[#2B2621] dark:text-[#F5F2EB] shadow-2xs font-semibold'
                          : 'text-[#6A6052] dark:text-[#9A9184]'
                      }`}
                    >
                      Tous
                    </button>
                    <button
                      onClick={() => setFilterType('income')}
                      className={`px-2.5 py-1 rounded-md font-medium text-xs transition-all ${
                        filterType === 'income'
                          ? 'bg-white dark:bg-[#38342D] text-[#3B6B55] dark:text-[#52A36F] shadow-2xs font-semibold'
                          : 'text-[#6A6052] dark:text-[#9A9184]'
                      }`}
                    >
                      Entrées
                    </button>
                    <button
                      onClick={() => setFilterType('expense')}
                      className={`px-2.5 py-1 rounded-md font-medium text-xs transition-all ${
                        filterType === 'expense'
                          ? 'bg-white dark:bg-[#38342D] text-[#A24824] dark:text-[#E8734C] shadow-2xs font-semibold'
                          : 'text-[#6A6052] dark:text-[#9A9184]'
                      }`}
                    >
                      Dépenses
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Filter suggestions / helper pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-medium text-[#7C7365] dark:text-[#8E8679] flex items-center gap-1">
                  <Filter className="w-3 h-3 text-[#A24824]" />
                  <span>{language === 'ar_ma' ? 'I9tirahat :' : 'Filtres rapides :'}</span>
                </span>
                {[
                  { label: '> 1 000 DH', query: '> 1000' },
                  { label: 'Octobre 2026', query: '2026-10' },
                  { label: 'Alimentation', query: 'Alimentation' },
                  { label: 'Virement', query: 'virement' },
                  { label: 'Espèces', query: 'especes' },
                ].map((chip) => {
                  const isActive = searchQuery === chip.query;
                  return (
                    <button
                      key={chip.label}
                      onClick={() => setSearchQuery(isActive ? '' : chip.query)}
                      className={`px-2 py-0.5 rounded text-[11px] transition-all font-medium border ${
                        isActive
                          ? 'bg-[#A24824] text-white border-[#A24824] shadow-2xs'
                          : 'bg-[#FAF8F5] dark:bg-[#25231F] border-[#E0D9CB] dark:border-[#38342D] text-[#554C40] dark:text-[#C5BEB3] hover:border-[#A24824]/60 hover:text-[#A24824]'
                      }`}
                    >
                      {chip.label}
                    </button>
                  );
                })}

                {(searchQuery || filterType !== 'all' || filterSubCategory !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterType('all');
                      setFilterSubCategory('all');
                    }}
                    className="ml-auto inline-flex items-center gap-1 text-[11px] text-[#A24824] dark:text-[#E8734C] hover:underline font-medium cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    <span>{language === 'ar_ma' ? 'Mseh koulschi' : 'Réinitialiser tous les filtres'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Transactions List Desktop Table (hidden sm:block) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#EBE6DC] dark:border-[#312E28] text-[#7A7163] dark:text-[#9A9184] uppercase tracking-wider text-[10px] font-semibold bg-[#FDFCF9] dark:bg-[#22201B]">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-5">Description & Tiers</th>
                    <th className="py-3 px-4">Catégorie & Sous-Catégorie</th>
                    <th className="py-3 px-4 text-center">Règlement</th>
                    <th className="py-3 px-4 text-right">Montant</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2EFE8] dark:divide-[#2B2822] text-[#2F2922] dark:text-[#ECE7DE]">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <div className="max-w-sm mx-auto flex flex-col items-center justify-center text-center">
                          <div className="w-10 h-10 rounded-full bg-[#FAF0E6] dark:bg-[#34241D] flex items-center justify-center text-[#A24824] dark:text-[#E8734C] mb-3">
                            {transactions.length === 0 ? <Plus className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                          </div>
                          <h4 className="text-sm font-semibold text-[#25201B] dark:text-[#F2EFEA] mb-1">
                            {transactions.length === 0
                              ? language === 'ar_ma'
                                ? 'Hta chi opération msjjla daba'
                                : 'Aucune opération enregistrée pour le moment'
                              : language === 'ar_ma'
                              ? 'Walou ma lqinah b had l-bahth'
                              : 'Aucune transaction trouvée'}
                          </h4>
                          <p className="text-xs text-[#7C7365] dark:text-[#9A9184] mb-3 leading-relaxed">
                            {transactions.length === 0
                              ? language === 'ar_ma'
                                ? 'Bda ddkhel l-madkhoul dyalek w l-masarif yawmiyan bach l-hisabat ybdaw.'
                                : 'Commencez à saisir vos rentrées et dépenses quotidiennes pour alimenter vos calculs en direct.'
                              : searchQuery.trim()
                              ? language === 'ar_ma'
                                ? `Hta chi opération ma katchbeh l « ${searchQuery} ». Jerreb montant khor aw tarikh.`
                                : `Aucune opération ne correspond à « ${searchQuery} ». Essayez un montant, une date ou un mot-clé.`
                              : language === 'ar_ma'
                              ? 'Walou f had l-filtrage. Beddel l-ikhtiyarat.'
                              : 'Aucune opération avec ces filtres sélectionnés.'}
                          </p>
                          {transactions.length === 0 ? (
                            <button
                              onClick={onOpenAddModal}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#A24824] hover:bg-[#8F3E1E] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>{language === 'ar_ma' ? '+ Zid awel opération' : '+ Ajouter ma première opération'}</span>
                            </button>
                          ) : (searchQuery || filterType !== 'all' || filterSubCategory !== 'all') ? (
                            <button
                              onClick={() => {
                                setSearchQuery('');
                                setFilterType('all');
                                setFilterSubCategory('all');
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF8F5] dark:bg-[#25231F] border border-[#D5CDBC] dark:border-[#3D382F] hover:border-[#A24824] text-xs font-semibold text-[#A24824] dark:text-[#E8734C] transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>{language === 'ar_ma' ? 'Mseh l-bahth' : 'Effacer la recherche'}</span>
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => {
                      const cat = categories.find((c) => c.id === tx.category);
                      const sub = subCategories.find((s) => s.id === tx.subCategory);
                      const hasItems = tx.items && tx.items.length > 0;
                      const isExpanded = !!expandedTxIds[tx.id];

                      return (
                        <React.Fragment key={tx.id}>
                          <tr className="hover:bg-[#FAF8F3] dark:hover:bg-[#26231E] transition-colors">
                            <td className="py-3 px-4 font-mono text-[11px] text-[#786E61] dark:text-[#9A9184] tabular-nums whitespace-nowrap">
                              {tx.date}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                                  tx.type === 'income' ? 'text-[#3B6B55] dark:text-[#52A36F]' : 'text-[#A24824] dark:text-[#E8734C]'
                                }`}
                              >
                                {tx.type === 'income' ? (
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                ) : (
                                  <ArrowDownLeft className="w-3.5 h-3.5" />
                                )}
                                <span>{tx.type === 'income' ? 'Rentrée' : 'Dépense'}</span>
                              </span>
                            </td>
                            <td className="py-3 px-5">
                              <div className="font-semibold text-[#25201B] dark:text-[#F2EFEA] flex items-center gap-2">
                                <span>{tx.note}</span>
                                {hasItems && (
                                  <button
                                    onClick={() => toggleExpand(tx.id)}
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#FAF0E6] dark:bg-[#38261F] text-[#A24824] dark:text-[#E8734C] text-[10px] font-semibold hover:underline"
                                    title="Voir le détail des articles"
                                  >
                                    <Receipt className="w-2.5 h-2.5" />
                                    <span>{tx.items?.length} articles</span>
                                    {isExpanded ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
                                  </button>
                                )}
                              </div>
                              {tx.recipientOrSource && (
                                <div className="text-[10px] text-[#867C6E] dark:text-[#9A9184]">{tx.recipientOrSource}</div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col gap-1 items-start">
                                <span className="inline-block px-2 py-0.5 rounded bg-[#EFECE3] dark:bg-[#2B2822] text-[#554C40] dark:text-[#C5BEB3] text-[11px] font-medium">
                                  {language === 'ar_ma' && cat ? cat.labelDarija : cat?.label || tx.category}
                                </span>
                                {sub && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-[#FAF0E6] dark:bg-[#3D251D] text-[#A24824] dark:text-[#E8734C] text-[10px] font-semibold">
                                    <Tag className="w-2.5 h-2.5" />
                                    <span>{language === 'ar_ma' && sub.nameDarija ? sub.nameDarija : sub.name}</span>
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center font-sans text-[11px] capitalize text-[#6A6052] dark:text-[#A69E91]">
                              {tx.paymentMethod}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-xs tabular-nums whitespace-nowrap">
                              <span className={tx.type === 'income' ? 'text-[#3B6B55] dark:text-[#52A36F]' : 'text-[#A24824] dark:text-[#E8734C]'}>
                                {tx.type === 'income' ? '+' : '-'}
                                {Math.round(tx.amount).toLocaleString('fr-FR')} {currency === 'MAD' ? 'DH' : currency}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => onEditTransaction(tx)}
                                  className="p-1 text-[#786E61] dark:text-[#A69E91] hover:text-[#A24824] dark:hover:text-[#E8734C] hover:bg-[#F0ECE1] dark:hover:bg-[#2C2923] rounded transition-colors"
                                  title="Modifier"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onDeleteTransaction(tx.id)}
                                  className="p-1 text-[#786E61] dark:text-[#A69E91] hover:text-[#B91C1C] dark:hover:text-[#F87171] hover:bg-[#FEE2E2] dark:hover:bg-[#3D1E16] rounded transition-colors"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded itemized receipt details row */}
                          {hasItems && isExpanded && (
                            <tr className="bg-[#FAF8F5] dark:bg-[#1D1B17]">
                              <td colSpan={7} className="px-6 py-3 border-y border-[#EBE6DC] dark:border-[#2C2923]">
                                <div className="p-3 bg-white dark:bg-[#24221D] rounded-lg border border-[#E5DFD3] dark:border-[#383329] max-w-2xl">
                                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#7A7163] dark:text-[#9A9184] mb-2 flex items-center gap-1.5">
                                    <Receipt className="w-3.5 h-3.5 text-[#A24824]" />
                                    <span>
                                      {language === 'ar_ma' ? 'Articles d had l-ticket :' : 'Articles détaillés du ticket / reçu :'}
                                    </span>
                                  </div>
                                  <div className="space-y-1.5 text-xs">
                                    {tx.items?.map((it) => (
                                      <div key={it.id} className="flex items-center justify-between py-0.5 border-b border-[#F5F2EA] dark:border-[#2E2B25] last:border-0">
                                        <span className="text-[#332D25] dark:text-[#DDD6C8] font-medium">
                                          {it.name} {it.quantity && it.quantity > 1 ? `(x${it.quantity})` : ''}
                                        </span>
                                        <span className="font-mono font-semibold text-[#A24824] dark:text-[#E8734C]">
                                          {Math.round(it.totalPrice).toLocaleString('fr-FR')} {currency === 'MAD' ? 'DH' : currency}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Transactions Mobile Card List (sm:hidden) */}
            <div className="sm:hidden divide-y divide-[#EBE6DC] dark:divide-[#312E28]">
              {filteredTransactions.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-10 h-10 rounded-full bg-[#FAF0E6] dark:bg-[#34241D] flex items-center justify-center text-[#A24824] dark:text-[#E8734C] mx-auto mb-3">
                    {transactions.length === 0 ? <Plus className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                  </div>
                  <h4 className="text-sm font-semibold text-[#25201B] dark:text-[#F2EFEA] mb-1">
                    {transactions.length === 0
                      ? language === 'ar_ma'
                        ? 'Hta chi opération msjjla daba'
                        : 'Aucune opération enregistrée'
                      : language === 'ar_ma'
                      ? 'Walou ma lqinah'
                      : 'Aucune opération trouvée'}
                  </h4>
                  <p className="text-xs text-[#7C7365] dark:text-[#9A9184] mb-3 leading-relaxed">
                    {transactions.length === 0
                      ? language === 'ar_ma'
                        ? 'Bda ddkhel l-madkhoul dyalek w l-masarif yawmiyan.'
                        : 'Commencez à saisir vos rentrées et dépenses quotidiennes.'
                      : 'Modifiez vos filtres ou réinitialisez la recherche.'}
                  </p>
                  {transactions.length === 0 ? (
                    <button
                      onClick={onOpenAddModal}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#A24824] hover:bg-[#8F3E1E] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{language === 'ar_ma' ? '+ Zid opération' : '+ Ajouter une opération'}</span>
                    </button>
                  ) : null}
                </div>
              ) : (
                filteredTransactions.map((tx) => {
                  const cat = categories.find((c) => c.id === tx.category);
                  const sub = subCategories.find((s) => s.id === tx.subCategory);
                  const hasItems = tx.items && tx.items.length > 0;
                  const isExpanded = !!expandedTxIds[tx.id];

                  return (
                    <div key={tx.id} className="p-4 bg-white dark:bg-[#1E1D19] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-medium text-[#7A7163] dark:text-[#9A9184]">
                            {tx.date}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              tx.type === 'income'
                                ? 'bg-[#EAF1EB] text-[#2C623E] dark:bg-[#163020] dark:text-[#67B588]'
                                : 'bg-[#FBEAE6] text-[#A24824] dark:bg-[#3D1E16] dark:text-[#E8734C]'
                            }`}
                          >
                            {tx.type === 'income' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                            {tx.type === 'income' ? (language === 'ar_ma' ? 'Rentrée' : 'Rentrée') : (language === 'ar_ma' ? 'Dépense' : 'Dépense')}
                          </span>
                        </div>
                        <div
                          className={`font-mono font-bold text-sm ${
                            tx.type === 'income' ? 'text-[#3B6B55] dark:text-[#52A36F]' : 'text-[#A24824] dark:text-[#E8734C]'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'}
                          {Math.round(tx.amount).toLocaleString('fr-FR')} {currency === 'MAD' ? 'DH' : currency}
                        </div>
                      </div>

                      <div>
                        <div className="font-semibold text-xs sm:text-sm text-[#25201B] dark:text-[#F2EFEA]">
                          {tx.note}
                        </div>
                        {tx.recipientOrSource && (
                          <div className="text-[11px] text-[#867C6E] dark:text-[#9A9184] mt-0.5">
                            {language === 'ar_ma' ? 'Tiers / Source :' : 'Tiers :'} <span className="font-medium text-[#25201B] dark:text-[#ECE7DE]">{tx.recipientOrSource}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#FAF8F5] dark:bg-[#272520] border border-[#EBE6DC] dark:border-[#38342D] text-[#4A4237] dark:text-[#DDD6C8]">
                          <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: cat?.color || '#8C8375' }} />
                          <span>{language === 'ar_ma' && cat ? cat.labelDarija : cat?.label || tx.category}</span>
                        </span>
                        {sub && (
                          <span className="px-2 py-0.5 rounded bg-[#FAF8F5] dark:bg-[#272520] border border-[#EBE6DC] dark:border-[#38342D] text-[#6A6052] dark:text-[#B6AEA3]">
                            {language === 'ar_ma' ? sub.nameDarija || sub.name : sub.name}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded bg-[#F4F1EA] dark:bg-[#2B2924] text-[#7A7163] dark:text-[#9A9184] capitalize">
                          {tx.paymentMethod}
                        </span>
                      </div>

                      {hasItems && (
                        <div className="pt-1">
                          <button
                            onClick={() => toggleExpand(tx.id)}
                            className="text-[11px] text-[#A24824] dark:text-[#E8734C] font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>{tx.items?.length} articles détaillés ({isExpanded ? 'Masquer' : 'Voir'})</span>
                          </button>
                          {isExpanded && (
                            <div className="mt-2 p-2.5 bg-[#FAF8F5] dark:bg-[#26241F] rounded-lg border border-[#E5DFD3] dark:border-[#383329] space-y-1 text-xs">
                              {tx.items?.map((it) => (
                                <div key={it.id} className="flex justify-between py-0.5 border-b border-[#F0EBE0] dark:border-[#2D2A24] last:border-0">
                                  <span className="text-[#332D25] dark:text-[#DDD6C8]">{it.name} {it.quantity && it.quantity > 1 ? `(x${it.quantity})` : ''}</span>
                                  <span className="font-mono font-semibold text-[#A24824] dark:text-[#E8734C]">{Math.round(it.totalPrice).toLocaleString('fr-FR')} {currency === 'MAD' ? 'DH' : currency}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Mobile Actions: Touch targets */}
                      <div className="pt-2 border-t border-[#F2EFE8] dark:border-[#2C2923] flex items-center gap-2">
                        <button
                          onClick={() => onEditTransaction(tx)}
                          className="flex-1 py-1.5 px-3 rounded-lg border border-[#DDD7C9] dark:border-[#38352F] bg-[#FAF8F5] dark:bg-[#25231F] text-xs font-semibold text-[#4A4237] dark:text-[#DDD6C8] hover:text-[#A24824] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#A24824]" />
                          <span>{language === 'ar_ma' ? 'Beddel' : 'Modifier'}</span>
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="py-1.5 px-3 rounded-lg border border-[#FFD8CC] dark:border-[#4D2418] bg-[#FFF5F2] dark:bg-[#2C1914] text-xs font-semibold text-[#C2410C] dark:text-[#F87171] hover:bg-[#FFEAE3] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{language === 'ar_ma' ? 'Mseh' : 'Supprimer'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Footnote */}
        <div className="px-5 py-3 border-t border-[#EBE6DC] dark:border-[#312E28] bg-[#FAF8F5] dark:bg-[#24221E] text-[11px] text-[#8C8375] dark:text-[#9A9184] italic flex items-center justify-between">
          <span>
            {language === 'ar_ma'
              ? '* Had l&apos;ar9am w les calculs kaytbadlo m3a kola opération jdidah li katzidha f had l&apos;application.'
              : '* Données synchronisées en temps réel selon vos transactions et sous-catégories configurées.'}
          </span>
          {onOpenSubCategoryManager && (
            <button
              onClick={() => onOpenSubCategoryManager()}
              className="text-[#A24824] dark:text-[#E8734C] hover:underline font-semibold not-italic"
            >
              {language === 'ar_ma' ? 'Gérer les sous-catégories →' : 'Gérer les sous-catégories →'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

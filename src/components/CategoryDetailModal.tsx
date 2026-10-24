import React, { useState } from 'react';
import { CategoryBudget, Currency, Language, SubCategory, Transaction, TransactionItem } from '../types';
import { X, Plus, Search, Tag, ShoppingBag, Receipt, Layers, ArrowDownLeft, ArrowUpRight, ChevronDown, ChevronRight, Settings } from 'lucide-react';

interface CategoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryBudget | null;
  transactions: Transaction[];
  subCategories: SubCategory[];
  currency: Currency;
  language: Language;
  onOpenAddModalWithCategory: (categoryId: string) => void;
  onOpenSubCategoryManager: (categoryId: string) => void;
}

export const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({
  isOpen,
  onClose,
  category,
  transactions,
  subCategories,
  currency,
  language,
  onOpenAddModalWithCategory,
  onOpenSubCategoryManager,
}) => {
  const [activeTab, setActiveTab] = useState<'subcategories' | 'articles' | 'transactions'>('subcategories');
  const [articleSearch, setArticleSearch] = useState('');
  const [expandedTxIds, setExpandedTxIds] = useState<Record<string, boolean>>({});

  if (!isOpen || !category) return null;

  // Transactions belonging to this category
  const categoryTransactions = transactions.filter((t) => t.category === category.id);
  const totalSpent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
  const attainment = category.allocatedBudget > 0 ? (totalSpent / category.allocatedBudget) * 100 : 0;
  const isOverBudget = attainment >= 100;
  const isNearBudget = attainment >= 80 && !isOverBudget;

  // Subcategories for this category
  const categorySubCats = subCategories.filter((s) => s.categoryId === category.id);

  // Subcategory breakdown
  const subCategoryStats = categorySubCats.map((sub) => {
    const txs = categoryTransactions.filter((t) => t.subCategory === sub.id);
    const spent = txs.reduce((sum, t) => sum + t.amount, 0);
    const count = txs.length;
    const share = totalSpent > 0 ? (spent / totalSpent) * 100 : 0;
    return {
      ...sub,
      spent,
      count,
      share,
    };
  }).sort((a, b) => b.spent - a.spent);

  // Unassigned subcategory transactions
  const unassignedTxs = categoryTransactions.filter(
    (t) => !t.subCategory || !categorySubCats.some((s) => s.id === t.subCategory)
  );
  const unassignedSpent = unassignedTxs.reduce((sum, t) => sum + t.amount, 0);
  const unassignedShare = totalSpent > 0 ? (unassignedSpent / totalSpent) * 100 : 0;

  // Itemized aggregated articles (e.g. Atay, Sokar, Hlib)
  interface AggregatedArticle {
    name: string;
    totalAmount: number;
    totalQuantity: number;
    purchaseCount: number;
    sampleTransactions: string[];
  }

  const articleMap: Record<string, AggregatedArticle> = {};

  categoryTransactions.forEach((tx) => {
    if (tx.items && tx.items.length > 0) {
      tx.items.forEach((item) => {
        const cleanName = item.name.trim();
        if (!articleMap[cleanName]) {
          articleMap[cleanName] = {
            name: cleanName,
            totalAmount: 0,
            totalQuantity: 0,
            purchaseCount: 0,
            sampleTransactions: [],
          };
        }
        articleMap[cleanName].totalAmount += item.totalPrice;
        articleMap[cleanName].totalQuantity += (item.quantity || 1);
        articleMap[cleanName].purchaseCount += 1;
        if (!articleMap[cleanName].sampleTransactions.includes(tx.note)) {
          articleMap[cleanName].sampleTransactions.push(tx.note);
        }
      });
    }
  });

  const aggregatedArticles = Object.values(articleMap)
    .filter((a) => a.name.toLowerCase().includes(articleSearch.toLowerCase()))
    .sort((a, b) => b.totalAmount - a.totalAmount);

  const totalItemizedSpent = Object.values(articleMap).reduce((sum, a) => sum + a.totalAmount, 0);

  const toggleExpand = (id: string) => {
    setExpandedTxIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#FAF8F5] dark:bg-[#1C1A17] rounded-xl border border-[#DED7C9] dark:border-[#38342D] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E8E2D5] dark:border-[#312E28] bg-white dark:bg-[#23211D]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-xs"
                style={{ backgroundColor: category.color }}
              >
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-xl text-[#25201B] dark:text-[#F2EFEA]">
                    {language === 'ar_ma' ? category.labelDarija : category.label}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                      category.type === 'expense'
                        ? 'bg-[#F9ECE7] text-[#A24824] dark:bg-[#3B221A] dark:text-[#E8734C]'
                        : 'bg-[#EAF3EE] text-[#3B6B55] dark:bg-[#1D3528] dark:text-[#67B882]'
                    }`}
                  >
                    {category.type === 'expense'
                      ? language === 'ar_ma' ? 'Masrouf' : 'Dépense'
                      : language === 'ar_ma' ? 'Madkhoul' : 'Revenu'}
                  </span>
                </div>
                <p className="text-xs text-[#807669] dark:text-[#9A9184]">
                  {language === 'ar_ma'
                    ? `Détails kamlin d ${category.labelDarija} : Sous-catégories, articles w opérations.`
                    : `Analyse détaillée de ce poste budgétaire, sous-catégories et articles d'achat.`}
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

          {/* Budget progress bar */}
          <div className="mt-4 pt-3 border-t border-[#F0ECE2] dark:border-[#2C2923] grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <div>
              <div className="text-[10px] uppercase font-bold text-[#8C8375] dark:text-[#9A9184]">
                {language === 'ar_ma' ? 'Flous l-khasra (Engagé)' : 'Montant Total Engagé'}
              </div>
              <div className="font-mono font-bold text-base text-[#25201B] dark:text-[#F2EFEA]">
                {Math.round(totalSpent).toLocaleString('fr-FR')} {currency === 'MAD' ? 'DH' : currency}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-[#8C8375] dark:text-[#9A9184]">
                {language === 'ar_ma' ? 'L-mizaniya (Plafond)' : 'Plafond Alloué'}
              </div>
              <div className="font-mono font-bold text-base text-[#25201B] dark:text-[#F2EFEA]">
                {Math.round(category.allocatedBudget).toLocaleString('fr-FR')} {currency === 'MAD' ? 'DH' : currency}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-1 text-[#8C8375] dark:text-[#9A9184]">
                <span>{language === 'ar_ma' ? 'Nisbat l-mizaniya' : 'Consommation'}</span>
                <span className={isOverBudget ? 'text-red-600 font-bold' : isNearBudget ? 'text-amber-600' : 'text-[#3B6B55]'}>
                  {Math.round(attainment)}%
                </span>
              </div>
              <div className="w-full h-2 bg-[#EAE5D9] dark:bg-[#343029] rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, Math.round(attainment))}%` }}
                  className={`h-full rounded-full transition-all ${
                    isOverBudget ? 'bg-red-600' : isNearBudget ? 'bg-amber-500' : 'bg-[#3B6B55]'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Toolbar */}
        <div className="px-6 py-2.5 border-b border-[#E8E2D5] dark:border-[#312E28] bg-[#F4EFE6] dark:bg-[#201E1A] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-[#E8E2D5] dark:bg-[#2C2923] rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveTab('subcategories')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'subcategories'
                  ? 'bg-white dark:bg-[#38342D] text-[#2B2621] dark:text-[#F5F2EB] shadow-2xs font-bold'
                  : 'text-[#6A6052] dark:text-[#9A9184]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{language === 'ar_ma' ? 'Sous-catégories' : 'Sous-Catégories'}</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-[#DDD6C8] dark:bg-[#433E35] rounded-full">
                {categorySubCats.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('articles')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'articles'
                  ? 'bg-white dark:bg-[#38342D] text-[#2B2621] dark:text-[#F5F2EB] shadow-2xs font-bold'
                  : 'text-[#6A6052] dark:text-[#9A9184]'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>{language === 'ar_ma' ? 'Articles (Atay, Sokar...)' : 'Articles & Achats'}</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-[#DDD6C8] dark:bg-[#433E35] rounded-full">
                {Object.keys(articleMap).length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'transactions'
                  ? 'bg-white dark:bg-[#38342D] text-[#2B2621] dark:text-[#F5F2EB] shadow-2xs font-bold'
                  : 'text-[#6A6052] dark:text-[#9A9184]'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{language === 'ar_ma' ? 'Journal d l&apos;opérations' : 'Opérations'}</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-[#DDD6C8] dark:bg-[#433E35] rounded-full">
                {categoryTransactions.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenSubCategoryManager(category.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-[#282621] border border-[#D5CDBC] dark:border-[#3D382F] hover:border-[#BEB4A2] text-[#4A4237] dark:text-[#E8E4DC] text-xs font-medium rounded-lg transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-[#A24824] dark:text-[#E8734C]" />
              <span className="hidden sm:inline">
                {language === 'ar_ma' ? 'Gérer sous-catégories' : 'Gérer sous-catégories'}
              </span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenAddModalWithCategory(category.id);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#A24824] hover:bg-[#8F3E1E] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'ar_ma' ? '+ Zid opération' : '+ Ajouter'}</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: Subcategories breakdown */}
          {activeTab === 'subcategories' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#3B342A] dark:text-[#EAE5DC] uppercase tracking-wider">
                    {language === 'ar_ma' ? 'Taqsim b sous-catégorie' : 'Répartition des dépenses par sous-catégorie'}
                  </h4>
                  <p className="text-[11px] text-[#867C6E] dark:text-[#9A9184]">
                    {language === 'ar_ma'
                      ? 'Chof chhal kheserti f kola far3 (Épicerie, Boucherie, Marché...)'
                      : 'Suivi analytique des montants engagés par sous-pôle'}
                  </p>
                </div>
                <button
                  onClick={() => onOpenSubCategoryManager(category.id)}
                  className="text-xs text-[#A24824] dark:text-[#E8734C] hover:underline font-semibold"
                >
                  {language === 'ar_ma' ? '+ Zid sous-catégorie jdida' : '+ Définir une nouvelle sous-catégorie'}
                </button>
              </div>

              <div className="space-y-2.5">
                {subCategoryStats.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3.5 bg-white dark:bg-[#23211D] rounded-xl border border-[#E5E0D5] dark:border-[#332F28] hover:border-[#BEB4A2] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#A24824]" />
                        <div>
                          <span className="font-bold text-xs text-[#25201B] dark:text-[#F2EFEA]">
                            {language === 'ar_ma' && sub.nameDarija ? sub.nameDarija : sub.name}
                          </span>
                          {sub.nameDarija && language !== 'ar_ma' && (
                            <span className="text-[11px] text-[#8A8071] dark:text-[#9A9184] ml-2 font-normal">
                              ({sub.nameDarija})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-xs text-[#25201B] dark:text-[#F2EFEA]">
                          {Math.round(sub.spent).toLocaleString('fr-FR')} {currency === 'MAD' ? 'DH' : currency}
                        </span>
                        <span className="text-[11px] text-[#8A8071] dark:text-[#9A9184] ml-2">
                          ({sub.count} op. · {Math.round(sub.share)}%)
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-1.5 bg-[#EAE5D9] dark:bg-[#343029] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, Math.round(sub.share))}%` }}
                        className="h-full bg-[#A24824] dark:bg-[#E8734C] rounded-full"
                      />
                    </div>
                  </div>
                ))}

                {unassignedSpent > 0 && (
                  <div className="p-3.5 bg-[#FAF7F2] dark:bg-[#25221C] rounded-xl border border-[#E8E2D5] dark:border-[#383329]">
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#8E8679]" />
                        <span className="font-semibold text-xs text-[#6A6052] dark:text-[#C5BEB3]">
                          {language === 'ar_ma' ? 'Bla sous-catégorie m7adada' : 'Sans sous-catégorie spécifiée'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-semibold text-xs text-[#6A6052] dark:text-[#C5BEB3]">
                          {Math.round(unassignedSpent).toLocaleString('fr-FR')} {currency === 'MAD' ? 'DH' : currency}
                        </span>
                        <span className="text-[11px] text-[#8A8071] ml-2">
                          ({unassignedTxs.length} op. · {Math.round(unassignedShare)}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-[#EAE5D9] dark:bg-[#343029] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, Math.round(unassignedShare))}%` }}
                        className="h-full bg-[#8E8679] rounded-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Itemized Articles (Atay, Sokar, Hlib...) */}
          {activeTab === 'articles' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-[#3B342A] dark:text-[#EAE5DC] uppercase tracking-wider">
                    {language === 'ar_ma'
                      ? 'Détails d l-a3chir (Atay, Sokar, Hlib...)'
                      : 'Articles & Reçus détaillés achetés'}
                  </h4>
                  <p className="text-[11px] text-[#867C6E] dark:text-[#9A9184]">
                    {language === 'ar_ma'
                      ? 'Kol 7aja chritiha b taman dyalha w chhal d lmarrat t-chrat.'
                      : 'Détail nominatif des articles, quantités et prix saisis dans ce poste.'}
                  </p>
                </div>

                {/* Search Bar for articles */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8274]" />
                  <input
                    type="text"
                    placeholder={language === 'ar_ma' ? 'Qlleb 3la atay, sokar, hlib...' : 'Chercher un article...'}
                    value={articleSearch}
                    onChange={(e) => setArticleSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#25231F] border border-[#D5CDBC] dark:border-[#3D382F] rounded-lg text-[#25201B] dark:text-[#F2EFEA] focus:outline-none focus:ring-1 focus:ring-[#A24824]"
                  />
                </div>
              </div>

              {aggregatedArticles.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-[#23211D] rounded-xl border border-[#E5E0D5] dark:border-[#332F28] text-xs text-[#867C6E] dark:text-[#9A9184]">
                  {articleSearch
                    ? language === 'ar_ma' ? 'Walou ma lqinah b had smiya.' : 'Aucun article trouvé pour cette recherche.'
                    : language === 'ar_ma'
                    ? 'Baqi ma kaynin articles mfa9ssin. Kola marra katzid opération, kteb les articles f l-formulaire !'
                    : 'Aucun article détaillé enregistré. Utilisez l\'option "Détails des articles" lors de l\'ajout d\'une transaction pour lister vos achats précis (ex. Atay, Sucre, Lait...)'}
                </div>
              ) : (
                <div className="bg-white dark:bg-[#23211D] rounded-xl border border-[#E5E0D5] dark:border-[#332F28] overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#EBE6DC] dark:border-[#312E28] text-[#7A7163] dark:text-[#9A9184] uppercase tracking-wider text-[10px] font-semibold bg-[#FDFCF9] dark:bg-[#22201B]">
                        <th className="py-2.5 px-4">Article</th>
                        <th className="py-2.5 px-4 text-center">Quantité</th>
                        <th className="py-2.5 px-4 text-center">Achats</th>
                        <th className="py-2.5 px-4 text-right">Total Dépensé</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2EFE8] dark:divide-[#2B2822]">
                      {aggregatedArticles.map((art) => (
                        <tr key={art.name} className="hover:bg-[#FAF8F3] dark:hover:bg-[#26231E] transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-[#25201B] dark:text-[#F2EFEA]">
                              {art.name}
                            </div>
                            <div className="text-[10px] text-[#867C6E] dark:text-[#9A9184] truncate max-w-xs">
                              {art.sampleTransactions.join(', ')}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-medium text-[#5A5144] dark:text-[#C5BEB3]">
                            x{art.totalQuantity}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-[11px] text-[#786E61] dark:text-[#9A9184]">
                            {art.purchaseCount} {art.purchaseCount > 1 ? 'tickets' : 'ticket'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-xs text-[#A24824] dark:text-[#E8734C]">
                            {Math.round(art.totalAmount).toLocaleString('fr-FR')} {currency === 'MAD' ? 'DH' : currency}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Transactions Journal */}
          {activeTab === 'transactions' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#3B342A] dark:text-[#EAE5DC] uppercase tracking-wider">
                  {language === 'ar_ma'
                    ? `Opérations f ${category.labelDarija} (${categoryTransactions.length})`
                    : `Historique des transactions (${categoryTransactions.length})`}
                </h4>
              </div>

              {categoryTransactions.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-[#23211D] rounded-xl border border-[#E5E0D5] dark:border-[#332F28] text-xs text-[#867C6E]">
                  Aucune opération enregistrée dans cette catégorie.
                </div>
              ) : (
                <div className="space-y-2">
                  {categoryTransactions.map((tx) => {
                    const sub = subCategories.find((s) => s.id === tx.subCategory);
                    const isExpanded = !!expandedTxIds[tx.id];
                    const hasItems = tx.items && tx.items.length > 0;

                    return (
                      <div
                        key={tx.id}
                        className="bg-white dark:bg-[#23211D] rounded-xl border border-[#E5E0D5] dark:border-[#332F28] p-3.5 hover:border-[#BEB4A2] transition-colors"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[11px] text-[#7A7061] dark:text-[#9A9184]">
                              {tx.date}
                            </span>
                            <div>
                              <div className="font-semibold text-xs text-[#25201B] dark:text-[#F2EFEA]">
                                {tx.note}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                {sub && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FAF0E6] dark:bg-[#3D251D] text-[#A24824] dark:text-[#E8734C] text-[10px] font-semibold">
                                    <Tag className="w-2.5 h-2.5" />
                                    <span>{language === 'ar_ma' && sub.nameDarija ? sub.nameDarija : sub.name}</span>
                                  </span>
                                )}
                                {tx.recipientOrSource && (
                                  <span className="text-[10px] text-[#867C6E] dark:text-[#9A9184]">
                                    {tx.recipientOrSource}
                                  </span>
                                )}
                                {hasItems && (
                                  <button
                                    onClick={() => toggleExpand(tx.id)}
                                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#3B6B55] dark:text-[#67B882] hover:underline"
                                  >
                                    <Receipt className="w-3 h-3" />
                                    <span>{tx.items?.length} articles</span>
                                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="font-mono font-bold text-xs text-[#A24824] dark:text-[#E8734C]">
                            -{Math.round(tx.amount).toLocaleString('fr-FR')} {currency === 'MAD' ? 'DH' : currency}
                          </div>
                        </div>

                        {/* Expandable Receipt Items */}
                        {hasItems && isExpanded && (
                          <div className="mt-3 pt-3 border-t border-[#F0ECE2] dark:border-[#312E28] bg-[#FAF8F5] dark:bg-[#1D1B17] rounded-lg p-3 space-y-1.5">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-[#7A7163] dark:text-[#9A9184] mb-1">
                              {language === 'ar_ma' ? 'Articles d had l-ticket :' : 'Détail des articles du reçu :'}
                            </div>
                            {tx.items?.map((it) => (
                              <div key={it.id} className="flex items-center justify-between text-xs py-0.5">
                                <span className="text-[#3B342A] dark:text-[#DDD6C8]">
                                  {it.name} {it.quantity && it.quantity > 1 ? `(x${it.quantity})` : ''}
                                </span>
                                <span className="font-mono font-semibold text-[#25201B] dark:text-[#F2EFEA]">
                                  {Math.round(it.totalPrice).toLocaleString('fr-FR')} {currency === 'MAD' ? 'DH' : currency}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#E8E2D5] dark:border-[#312E28] bg-white dark:bg-[#23211D] flex items-center justify-between">
          <span className="text-[11px] text-[#847B6D] dark:text-[#9A9184]">
            {language === 'ar_ma'
              ? 'Taqsim w les détails kay3awnok tfhem fine mchaw lflous.'
              : 'La ventilation par sous-catégorie et articles permet un pilotage fin de votre trésorerie.'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2B2621] dark:bg-[#3D382F] hover:bg-[#1C1915] text-white text-xs font-semibold rounded-lg transition-colors"
          >
            {language === 'ar_ma' ? 'Safé (Fermer)' : 'Fermer'}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Transaction, CategoryBudget, Currency, Language } from '../types';
import { Search, Plus, Trash2, Edit2, Download, ArrowUpRight, ArrowDownLeft, FileSpreadsheet, FileText } from 'lucide-react';
import { exportFinancialDataToCsv } from '../utils/exportCsv';

interface Section03DetailTableProps {
  categories: CategoryBudget[];
  transactions: Transaction[];
  currency: Currency;
  language: Language;
  onOpenAddModal: () => void;
  onOpenExportModal?: () => void;
  onOpenPdfModal?: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const Section03DetailTable: React.FC<Section03DetailTableProps> = ({
  categories,
  transactions,
  currency,
  language,
  onOpenAddModal,
  onOpenExportModal,
  onOpenPdfModal,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'transactions'>('categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  // Compute spend per category from transactions
  const categoryStats = categories.map((cat) => {
    const txList = transactions.filter((t) => t.category === cat.id);
    const totalSpent = txList.reduce((acc, t) => acc + t.amount, 0);
    const attainment = cat.allocatedBudget > 0 ? (totalSpent / cat.allocatedBudget) * 100 : 100;
    
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
    };
  });

  // Filtered transactions for the journal
  const filteredTransactions = transactions.filter((t) => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesSearch =
      t.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.recipientOrSource && t.recipientOrSource.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  // Export to CSV (combines both transactions and budget settings)
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
              ? 'Tafassil — b l&apos;asnâaf w l&apos;opérations'
              : language === 'en'
              ? 'The detail — by product line'
              : 'Le détail — par poste & transactions'}
          </span>
        </h2>
        <span className="text-xs text-[#7F7668] dark:text-[#9A9184] max-w-md text-right hidden sm:block">
          {language === 'ar_ma'
            ? 'Warra9 3la ay sttar bach tchof les détails wla tbeddel.'
            : language === 'en'
            ? 'Click any row to expand underlying metrics for that line.'
            : 'Cliquez sur une ligne pour inspecter ou filtrer par catégorie.'}
        </span>
      </div>

      {/* Main Container Card matching screenshot */}
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
              <span className="ml-1.5 px-1.5 py-0.2 bg-[#DDD6C8] dark:bg-[#433E35] rounded text-[10px] font-mono">
                {transactions.length}
              </span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#26241F] border border-[#D5CDBC] dark:border-[#3D382F] text-[#4A4237] dark:text-[#E8E4DC] hover:text-[#2B2621] dark:hover:text-[#FFFFFF] hover:border-[#BDB39E] dark:hover:border-[#524B3F] rounded-lg text-xs font-medium transition-colors"
              title="Exporter vers Excel (Transactions et Budgets)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exporter CSV</span>
            </button>
            {onOpenPdfModal && (
              <button
                onClick={onOpenPdfModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#26241F] border border-[#D5CDBC] dark:border-[#3D382F] hover:border-[#A24824]/50 text-[#A24824] dark:text-[#E8734C] hover:bg-[#FAF3EF] dark:hover:bg-[#2B221E] rounded-lg text-xs font-medium transition-colors"
                title="Générer un rapport PDF / Relevé officiel"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Rapport PDF</span>
              </button>
            )}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#A24824] hover:bg-[#8F3E1E] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'ar_ma' ? '+ Zid' : '+ Ajouter'}</span>
            </button>
          </div>
        </div>

        {/* View 1: Exact replica of the screenshot's table */}
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
                    {language === 'ar_ma' ? 'Tendance' : 'QoQ'}
                  </th>
                  <th className="py-3 px-6 text-left">
                    {language === 'ar_ma' ? 'Atteinte l&apos;hadaf' : 'Attainment vs. Target'}
                  </th>
                  <th className="py-3 px-4 text-right">
                    {language === 'ar_ma' ? 'Ratio' : 'Poids'}
                  </th>
                  <th className="py-3 px-5 text-center">
                    {language === 'ar_ma' ? 'Hala' : 'Statut'}
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
                      onClick={() => {
                        setSearchQuery(item.id);
                        setActiveTab('transactions');
                      }}
                    >
                      {/* Product line / Category */}
                      <td className="py-3.5 px-5 font-medium flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-xs shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <div>
                          <div className="font-semibold text-[#25201B] dark:text-[#F2EFEA] group-hover:text-[#A24824] dark:group-hover:text-[#E8734C] transition-colors">
                            {language === 'ar_ma' ? item.labelDarija : item.label}
                          </div>
                          <div className="text-[10px] text-[#867C6E] dark:text-[#9A9184]">
                            {item.type === 'income' ? '↗ Rentrée' : '↘ Dépense'} · Budget:{' '}
                            {(item.allocatedBudget / 1000).toFixed(1)}k
                          </div>
                        </div>
                      </td>

                      {/* Revenue / Amount */}
                      <td className="py-3.5 px-4 text-right font-mono font-semibold tabular-nums text-[#25201B] dark:text-[#F2EFEA]">
                        {(item.totalSpent / 1000).toFixed(1)}k {currency === 'MAD' ? 'DH' : currency}
                      </td>

                      {/* QoQ */}
                      <td className="py-3.5 px-4 text-center font-mono text-[11px] text-[#6E6457] dark:text-[#9A9184] tabular-nums">
                        {item.qoq}
                      </td>

                      {/* Attainment vs target with visual horizontal bar matching screenshot */}
                      <td className="py-3.5 px-6 min-w-[200px]">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-semibold tabular-nums w-10 text-right text-[#25201B] dark:text-[#F2EFEA]">
                            {Math.round(item.attainment)}%
                          </span>
                          <div className="flex-1 h-1.5 bg-[#EAE5D9] dark:bg-[#343029] rounded-full overflow-hidden">
                            <div
                              style={{
                                width: `${percent}%`,
                                backgroundColor:
                                  item.status === 'on_track'
                                    ? '#4F6D5B'
                                    : item.status === 'watch'
                                    ? '#C67551'
                                    : '#A24824',
                              }}
                              className="h-full rounded-full transition-all duration-500"
                            />
                          </div>
                        </div>
                      </td>

                      {/* NRR / Weight */}
                      <td className="py-3.5 px-4 text-right font-mono text-xs text-[#6A6052] dark:text-[#A69E91] tabular-nums">
                        {Math.round((item.totalSpent / (item.allocatedBudget || 1)) * 105)}%
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                            item.status === 'on_track'
                              ? 'bg-[#EAF1EB] dark:bg-[#1E3325] text-[#2C623E] dark:text-[#52A36F]'
                              : item.status === 'watch'
                              ? 'bg-[#F9EFE4] dark:bg-[#3A271B] text-[#9A5424] dark:text-[#E68A50]'
                              : 'bg-[#FBEAE6] dark:bg-[#3D1E16] text-[#A24824] dark:text-[#F87171]'
                          }`}
                        >
                          {item.status === 'on_track'
                            ? language === 'ar_ma'
                              ? 'Mazyan'
                              : 'On track'
                            : item.status === 'watch'
                            ? language === 'ar_ma'
                              ? 'Rad lbal'
                              : 'Watch'
                            : language === 'ar_ma'
                            ? 'Khatar'
                            : 'At risk'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* View 2: Detailed Interactive Transactions Ledger */}
        {activeTab === 'transactions' && (
          <div>
            {/* Search and filters bar */}
            <div className="p-4 border-b border-[#EBE6DC] dark:border-[#312E28] flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#1E1D19]">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-[#8A8071] dark:text-[#887F72] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder={language === 'ar_ma' ? 'Qlleb f l&apos;opérations...' : 'Rechercher une opération...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F5] dark:bg-[#26241F] border border-[#DCD5C6] dark:border-[#38342D] rounded-lg text-[#25201B] dark:text-[#F2EFEA] placeholder-[#A49B8E] dark:placeholder-[#766E62] focus:outline-none focus:ring-1 focus:ring-[#A24824]"
                />
              </div>

              {/* Type pill filter */}
              <div className="flex items-center gap-1.5 p-0.5 bg-[#EBE6DC] dark:bg-[#2C2923] rounded-lg text-xs self-stretch sm:self-auto">
                <button
                  onClick={() => setFilterType('all')}
                  className={`flex-1 sm:flex-none px-3 py-1 rounded-md font-medium text-xs transition-all ${
                    filterType === 'all'
                      ? 'bg-white dark:bg-[#38342D] text-[#2B2621] dark:text-[#F5F2EB] shadow-2xs font-semibold'
                      : 'text-[#6A6052] dark:text-[#9A9184]'
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setFilterType('income')}
                  className={`flex-1 sm:flex-none px-3 py-1 rounded-md font-medium text-xs transition-all ${
                    filterType === 'income'
                      ? 'bg-white dark:bg-[#38342D] text-[#3B6B55] dark:text-[#52A36F] shadow-2xs font-semibold'
                      : 'text-[#6A6052] dark:text-[#9A9184]'
                  }`}
                >
                  ↗ Entrées
                </button>
                <button
                  onClick={() => setFilterType('expense')}
                  className={`flex-1 sm:flex-none px-3 py-1 rounded-md font-medium text-xs transition-all ${
                    filterType === 'expense'
                      ? 'bg-white dark:bg-[#38342D] text-[#A24824] dark:text-[#E8734C] shadow-2xs font-semibold'
                      : 'text-[#6A6052] dark:text-[#9A9184]'
                  }`}
                >
                  ↘ Dépenses
                </button>
              </div>
            </div>

            {/* Transactions List */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#EBE6DC] dark:border-[#312E28] text-[#7A7163] dark:text-[#9A9184] uppercase tracking-wider text-[10px] font-semibold bg-[#FDFCF9] dark:bg-[#22201B]">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-5">Description & Tiers</th>
                    <th className="py-3 px-4">Catégorie</th>
                    <th className="py-3 px-4 text-center">Règlement</th>
                    <th className="py-3 px-4 text-right">Montant</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2EFE8] dark:divide-[#2B2822] text-[#2F2922] dark:text-[#ECE7DE]">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#8C8375] dark:text-[#887F72]">
                        Aucune transaction trouvée.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => {
                      const cat = categories.find((c) => c.id === tx.category);
                      return (
                        <tr key={tx.id} className="hover:bg-[#FAF8F3] dark:hover:bg-[#26231E] transition-colors">
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
                            <div className="font-semibold text-[#25201B] dark:text-[#F2EFEA]">{tx.note}</div>
                            {tx.recipientOrSource && (
                              <div className="text-[10px] text-[#867C6E] dark:text-[#9A9184]">{tx.recipientOrSource}</div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-block px-2 py-0.5 rounded bg-[#EFECE3] dark:bg-[#2B2822] text-[#554C40] dark:text-[#C5BEB3] text-[11px] font-medium">
                              {language === 'ar_ma' && cat ? cat.labelDarija : cat?.label || tx.category}
                            </span>
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
                                className="p-1 text-[#786E61] dark:text-[#A69E91] hover:text-[#A24824] dark:hover:text-[#E8734C] hover:bg-[#F0ECE1] dark:hover:bg-[#2C2923] rounded"
                                title="Modifier"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteTransaction(tx.id)}
                                className="p-1 text-[#786E61] dark:text-[#A69E91] hover:text-[#B91C1C] dark:hover:text-[#F87171] hover:bg-[#FEE2E2] dark:hover:bg-[#3D1E16] rounded"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footnote matching screenshot */}
        <div className="px-5 py-3 border-t border-[#EBE6DC] dark:border-[#312E28] bg-[#FAF8F5] dark:bg-[#24221E] text-[11px] text-[#8C8375] dark:text-[#9A9184] italic">
          {language === 'ar_ma'
            ? '* Had l&apos;ar9am w les calculs kaytbadlo m3a kola opération jdidah li katzidha f had l&apos;application.'
            : language === 'en'
            ? 'Figures are illustrative sample data — update with your personal transaction entries.'
            : '* Données synchronisées en temps réel selon vos transactions enregistrées.'}
        </div>
      </div>
    </section>
  );
};

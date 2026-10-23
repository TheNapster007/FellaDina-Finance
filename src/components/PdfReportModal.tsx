import React, { useState, useMemo } from 'react';
import { Transaction, CategoryBudget, Currency, Language } from '../types';
import {
  X,
  Printer,
  Download,
  FileText,
  Calendar,
  Check,
  ShieldCheck,
  Settings2,
  ChevronDown,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Award,
  Maximize2
} from 'lucide-react';
import {
  getAvailableMonths,
  formatMonthLabel,
  computeMonthStatementData,
  generateStatementHtml,
  printStatementReport,
  downloadStatementHtml,
  PdfStatementOptions,
} from '../utils/pdfStatementGenerator';

interface PdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  categories: CategoryBudget[];
  currency: Currency;
  language: Language;
  initialMonth?: string;
  onReportGenerated?: (monthLabel: string) => void;
}

export const PdfReportModal: React.FC<PdfReportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  categories,
  currency,
  language,
  initialMonth = '2026-10',
  onReportGenerated,
}) => {
  const availableMonths = useMemo(() => getAvailableMonths(transactions), [transactions]);
  
  // Selected month state
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return availableMonths.includes(initialMonth) ? initialMonth : availableMonths[0] || '2026-10';
  });

  // Customization options state
  const [clientName, setClientName] = useState('M. Reda Benani');
  const [accountTitle, setAccountTitle] = useState('Compte Trésorerie Privée & Investissements');
  const [includeExecutiveSummary, setIncludeExecutiveSummary] = useState(true);
  const [includeBudgetTable, setIncludeBudgetTable] = useState(true);
  const [includeLedger, setIncludeLedger] = useState(true);
  const [includeAuditNotes, setIncludeAuditNotes] = useState(true);
  const [includeSeal, setIncludeSeal] = useState(true);
  const [customNotes, setCustomNotes] = useState('');
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Compute month summary data
  const statementData = useMemo(() => {
    return computeMonthStatementData(selectedMonth, transactions, categories);
  }, [selectedMonth, transactions, categories]);

  if (!isOpen) return null;

  const statementRef = `MIZAN-STMT-${selectedMonth.replace('-', '')}-8429`;

  const options: PdfStatementOptions = {
    month: selectedMonth,
    clientName,
    statementRef,
    accountTitle,
    includeExecutiveSummary,
    includeBudgetTable,
    includeLedger,
    includeAuditNotes,
    includeSeal,
    customNotes: customNotes.trim() ? customNotes.trim() : undefined,
  };

  const currentMonthLabel = formatMonthLabel(selectedMonth, language);

  const handlePrint = () => {
    setIsPrinting(true);
    const html = generateStatementHtml(statementData, options, currency, language);
    printStatementReport(html);
    if (onReportGenerated) {
      onReportGenerated(currentMonthLabel);
    }
    setTimeout(() => {
      setIsPrinting(false);
    }, 1000);
  };

  const handleDownloadHtml = () => {
    const html = generateStatementHtml(statementData, options, currency, language);
    const filename = `Mizan_Releve_${selectedMonth}_${clientName.replace(/\s+/g, '_')}.html`;
    downloadStatementHtml(html, filename);
    if (onReportGenerated) {
      onReportGenerated(currentMonthLabel);
    }
  };

  const currencySymbol = currency === 'MAD' ? 'DH' : currency === 'EUR' ? '€' : '$';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#FAF8F5] dark:bg-[#1A1916] rounded-xl border border-[#DED7C9] dark:border-[#38342D] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden transition-colors">
        
        {/* Top Control Header */}
        <div className="px-5 py-3.5 border-b border-[#E8E2D5] dark:border-[#312E28] bg-white dark:bg-[#23211D] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#A24824] text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-[#25201B] dark:text-[#F2EFEA]">
                  {language === 'ar_ma' ? 'Relevé Financier Mensuel' : 'Relevé Financier & État Mensuel'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#E8E2D6] dark:bg-[#322F28] text-[#554D41] dark:text-[#B6AEA3]">
                  A4 Print & PDF
                </span>
              </div>
              <p className="text-xs text-[#807669] dark:text-[#9A9184]">
                {language === 'ar_ma'
                  ? 'Générer rapport officiel d ch-har l t-tibaa w l-partage'
                  : 'Rapport officiel certifié pour impression, archivage ou transmission bancaire'}
              </p>
            </div>
          </div>

          {/* Month Selector & Customization Drawer Toggle */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none bg-[#F4F1E9] dark:bg-[#2A2722] border border-[#DCD5C6] dark:border-[#3D3930] rounded-lg pl-8 pr-8 py-1.5 text-xs font-semibold text-[#25201B] dark:text-[#F2EFEA] hover:border-[#A24824] focus:outline-none focus:ring-1 focus:ring-[#A24824] cursor-pointer"
              >
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {formatMonthLabel(m, language)}
                  </option>
                ))}
              </select>
              <Calendar className="w-3.5 h-3.5 text-[#A24824] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-[#8A8071] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={() => setShowConfigDrawer(!showConfigDrawer)}
              className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                showConfigDrawer
                  ? 'bg-[#A24824] text-white border-[#A24824]'
                  : 'bg-white dark:bg-[#22201C] text-[#554C40] dark:text-[#E2DDD5] border-[#DCD5C6] dark:border-[#38342D] hover:bg-[#F3EFE7]'
              }`}
              title="Personnaliser les informations du relevé"
            >
              <Settings2 className="w-4 h-4" />
              <span className="hidden sm:inline">Options</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#8A8071] hover:text-[#25201B] dark:hover:text-[#F2EFEA] rounded-lg hover:bg-[#F2EEE4] dark:hover:bg-[#2F2C26] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Options / Customization Drawer */}
        {showConfigDrawer && (
          <div className="bg-[#EFECE3] dark:bg-[#22201C] border-b border-[#DED7C9] dark:border-[#353129] px-6 py-4 animate-fadeIn shrink-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#5A5144] dark:text-[#A8A092] mb-1">
                  Titulaire du compte / Souscripteur :
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-white dark:bg-[#1A1916] border border-[#D5CDBC] dark:border-[#3C382E] rounded-md px-2.5 py-1.5 text-[#25201B] dark:text-[#F2EFEA] focus:outline-none focus:ring-1 focus:ring-[#A24824]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5A5144] dark:text-[#A8A092] mb-1">
                  Intitulé du portefeuille :
                </label>
                <input
                  type="text"
                  value={accountTitle}
                  onChange={(e) => setAccountTitle(e.target.value)}
                  className="w-full bg-white dark:bg-[#1A1916] border border-[#D5CDBC] dark:border-[#3C382E] rounded-md px-2.5 py-1.5 text-[#25201B] dark:text-[#F2EFEA] focus:outline-none focus:ring-1 focus:ring-[#A24824]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5A5144] dark:text-[#A8A092] mb-1">
                  Sections à inclure dans le document :
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-[#4A4237] dark:text-[#CAC3B6]">
                    <input
                      type="checkbox"
                      checked={includeExecutiveSummary}
                      onChange={(e) => setIncludeExecutiveSummary(e.target.checked)}
                      className="rounded accent-[#A24824]"
                    />
                    <span>KPIs flux</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-[#4A4237] dark:text-[#CAC3B6]">
                    <input
                      type="checkbox"
                      checked={includeBudgetTable}
                      onChange={(e) => setIncludeBudgetTable(e.target.checked)}
                      className="rounded accent-[#A24824]"
                    />
                    <span>Budgets</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-[#4A4237] dark:text-[#CAC3B6]">
                    <input
                      type="checkbox"
                      checked={includeLedger}
                      onChange={(e) => setIncludeLedger(e.target.checked)}
                      className="rounded accent-[#A24824]"
                    />
                    <span>Grand Livre</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-[#4A4237] dark:text-[#CAC3B6]">
                    <input
                      type="checkbox"
                      checked={includeSeal}
                      onChange={(e) => setIncludeSeal(e.target.checked)}
                      className="rounded accent-[#A24824]"
                    />
                    <span>Sceau officiel</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-[11px] font-semibold text-[#5A5144] dark:text-[#A8A092] mb-1">
                Note complémentaire ou mention spécifique (facultative) :
              </label>
              <input
                type="text"
                placeholder="Ex : Relevé fourni pour dossier de financement bancaire ou bilan comptable."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="w-full bg-white dark:bg-[#1A1916] border border-[#D5CDBC] dark:border-[#3C382E] rounded-md px-2.5 py-1 text-xs text-[#25201B] dark:text-[#F2EFEA] focus:outline-none focus:ring-1 focus:ring-[#A24824]"
              />
            </div>
          </div>
        )}

        {/* Live Document Paper Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#EBE7DD] dark:bg-[#12110F]">
          <div className="max-w-[820px] mx-auto bg-white text-[#221F1C] p-6 sm:p-10 rounded-lg shadow-lg border border-[#D8D2C4] font-sans transition-all text-xs leading-relaxed">
            
            {/* Formal Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-5 border-b-2 border-[#231F1C]">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#A24824] text-white flex items-center justify-center font-serif font-black text-xl shrink-0 shadow-xs">
                  M
                </div>
                <div>
                  <h1 className="font-serif font-bold text-2xl text-[#1E1B18] tracking-tight">
                    MIZAN · RELEVÉ FINANCIER MENSUEL
                  </h1>
                  <p className="text-[10px] uppercase font-semibold tracking-wider text-[#736A5D]">
                    Executive Treasury & Wealth Management Statement
                  </p>
                  <div className="mt-2 text-[11px] text-[#4A4339] space-y-0.5">
                    <div><strong>Titulaire :</strong> {clientName}</div>
                    <div><strong>Intitulé :</strong> {accountTitle}</div>
                    <div><strong>Période :</strong> {currentMonthLabel} ({statementData.startDateStr} au {statementData.endDateStr})</div>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0 text-[10.5px] text-[#554D41]">
                <div className="inline-block px-2.5 py-1 rounded bg-[#FAF2EE] text-[#A24824] font-mono font-bold text-xs border border-[#F0DCD1] mb-1.5">
                  {statementRef}
                </div>
                <div>Édité le : <strong>{new Date().toLocaleDateString('fr-FR')}</strong></div>
                <div>Devise : <strong>{currency} ({currencySymbol})</strong></div>
                <div>État : <span className="font-bold text-[#2A5A41]">CERTIFIÉ RÉALISÉ</span></div>
              </div>
            </div>

            {/* Section 1: Executive KPI Scorecard */}
            {includeExecutiveSummary && (
              <div className="mt-6">
                <div className="text-xs font-bold uppercase tracking-wider text-[#221F1C] border-b border-[#D8D1C3] pb-1.5 mb-3 flex items-center justify-between">
                  <span>1. Synthèse Exécutive des Flux Monétaires</span>
                  <span className="text-[10px] font-mono font-normal text-[#807669]">
                    {statementData.totalTransactionsCount} opérations enregistrées
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-[#FAF8F5] border border-[#E7E1D4] border-l-4 border-l-[#2F6848] rounded">
                    <span className="text-[10px] uppercase font-semibold text-[#736A5D] block">Ressources (Inflows)</span>
                    <span className="text-base font-bold font-mono text-[#2F6848] mt-1 block">
                      +{Math.round(statementData.totalIncome).toLocaleString('fr-FR')} {currencySymbol}
                    </span>
                    <span className="text-[10px] text-[#807669]">Revenus & dividendes</span>
                  </div>

                  <div className="p-3 bg-[#FAF8F5] border border-[#E7E1D4] border-l-4 border-l-[#A24824] rounded">
                    <span className="text-[10px] uppercase font-semibold text-[#736A5D] block">Dépenses (Outflows)</span>
                    <span className="text-base font-bold font-mono text-[#A24824] mt-1 block">
                      -{Math.round(statementData.totalExpense).toLocaleString('fr-FR')} {currencySymbol}
                    </span>
                    <span className="text-[10px] text-[#807669]">Charges & consommation</span>
                  </div>

                  <div className="p-3 bg-[#FAF8F5] border border-[#E7E1D4] border-l-4 border-l-[#1E3A8A] rounded">
                    <span className="text-[10px] uppercase font-semibold text-[#736A5D] block">Épargne Nette</span>
                    <span className={`text-base font-bold font-mono mt-1 block ${statementData.netSavings >= 0 ? 'text-[#1E3A8A]' : 'text-[#A24824]'}`}>
                      {statementData.netSavings >= 0 ? '+' : ''}{Math.round(statementData.netSavings).toLocaleString('fr-FR')} {currencySymbol}
                    </span>
                    <span className="text-[10px] text-[#807669]">Capitaux préservés</span>
                  </div>

                  <div className="p-3 bg-[#FAF8F5] border border-[#E7E1D4] border-l-4 border-l-[#D97706] rounded">
                    <span className="text-[10px] uppercase font-semibold text-[#736A5D] block">Taux d'Épargne</span>
                    <span className="text-base font-bold font-mono text-[#D97706] mt-1 block">
                      {statementData.savingsRate.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-[#807669]">{statementData.zeroExpenseDaysCount} jours zéro-dépense</span>
                  </div>
                </div>
              </div>
            )}

            {/* Section 2: Budget Performance Table */}
            {includeBudgetTable && (
              <div className="mt-6">
                <div className="text-xs font-bold uppercase tracking-wider text-[#221F1C] border-b border-[#D8D1C3] pb-1.5 mb-2.5">
                  2. Performance Budgétaire par Poste & Consommation
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-[#231F1C] text-[#F7F5F0]">
                        <th className="py-1.5 px-2.5 font-semibold">Poste Budgétaire</th>
                        <th className="py-1.5 px-2 font-semibold text-center">Type</th>
                        <th className="py-1.5 px-2.5 font-semibold text-right">Budget Alloué</th>
                        <th className="py-1.5 px-2.5 font-semibold text-right">Réalisé</th>
                        <th className="py-1.5 px-2.5 font-semibold text-right">Variance</th>
                        <th className="py-1.5 px-2.5 font-semibold text-right">Exécution</th>
                        <th className="py-1.5 px-2.5 font-semibold text-center">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE5DA]">
                      {statementData.categoryPerformance.map((item) => {
                        const isExpense = item.category.type === 'expense';
                        return (
                          <tr key={item.category.id} className="hover:bg-[#FAF8F4]">
                            <td className="py-1.5 px-2.5 font-semibold text-[#25201B]">
                              <span
                                className="inline-block w-2 h-2 rounded-xs mr-2"
                                style={{ backgroundColor: item.category.color }}
                              />
                              {language === 'ar_ma' ? item.category.labelDarija : item.category.label}
                            </td>
                            <td className="py-1.5 px-2 text-center text-[10px] font-bold uppercase tracking-wider">
                              <span className={isExpense ? 'text-[#A24824]' : 'text-[#2A5A41]'}>
                                {isExpense ? 'Dépense' : 'Rentrée'}
                              </span>
                            </td>
                            <td className="py-1.5 px-2.5 text-right font-mono text-[#554D41]">
                              {Math.round(item.budget).toLocaleString('fr-FR')} {currencySymbol}
                            </td>
                            <td className="py-1.5 px-2.5 text-right font-mono font-bold text-[#1E1B18]">
                              {Math.round(item.spent).toLocaleString('fr-FR')} {currencySymbol}
                            </td>
                            <td className={`py-1.5 px-2.5 text-right font-mono font-medium ${item.variance >= 0 ? 'text-[#2A5A41]' : 'text-[#A24824]'}`}>
                              {item.variance >= 0 ? '+' : ''}{Math.round(item.variance).toLocaleString('fr-FR')} {currencySymbol}
                            </td>
                            <td className="py-1.5 px-2.5 text-right font-mono font-semibold">
                              <span className={item.ratio >= 100 ? 'text-[#991B1B]' : item.ratio >= 80 ? 'text-[#92400E]' : 'text-[#2A5A41]'}>
                                {Math.round(item.ratio)}%
                              </span>
                            </td>
                            <td className="py-1.5 px-2.5 text-center">
                              {item.status === 'danger' ? (
                                <span className="inline-block px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-[#FEE2E2] text-[#991B1B]">
                                  Dépassement
                                </span>
                              ) : item.status === 'warning' ? (
                                <span className="inline-block px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-[#FEF3C7] text-[#92400E]">
                                  Alerte ≥80%
                                </span>
                              ) : (
                                <span className="inline-block px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-[#E6F0EB] text-[#2A5A41]">
                                  Conforme
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Section 3: Itemized Ledger */}
            {includeLedger && (
              <div className="mt-6">
                <div className="text-xs font-bold uppercase tracking-wider text-[#221F1C] border-b border-[#D8D1C3] pb-1.5 mb-2.5 flex items-center justify-between">
                  <span>3. Grand Livre des Opérations du Mois ({statementData.monthTransactions.length})</span>
                  <span className="text-[10px] font-mono text-[#736A5D]">Chronologie arrêtée au 31</span>
                </div>
                <div className="overflow-x-auto max-h-[300px]">
                  <table className="w-full text-left border-collapse text-[10.5px]">
                    <thead>
                      <tr className="bg-[#231F1C] text-[#F7F5F0]">
                        <th className="py-1.5 px-2 font-semibold">Date</th>
                        <th className="py-1.5 px-2 font-semibold">Réf</th>
                        <th className="py-1.5 px-2 font-semibold">Description</th>
                        <th className="py-1.5 px-2 font-semibold">Catégorie</th>
                        <th className="py-1.5 px-2 font-semibold">Mode</th>
                        <th className="py-1.5 px-2 font-semibold text-right">Débit (-)</th>
                        <th className="py-1.5 px-2 font-semibold text-right">Crédit (+)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE5DA]">
                      {statementData.monthTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-4 text-center text-[#807669] italic">
                            Aucune opération pour cette période.
                          </td>
                        </tr>
                      ) : (
                        statementData.monthTransactions.map((tx) => {
                          const cat = categories.find((c) => c.id === tx.category);
                          const isExpense = tx.type === 'expense';
                          return (
                            <tr key={tx.id} className="hover:bg-[#FAF8F4]">
                              <td className="py-1.5 px-2 font-mono text-[#554D41] whitespace-nowrap">{tx.date}</td>
                              <td className="py-1.5 px-2 font-mono text-[9.5px] text-[#807669]">{tx.id.toUpperCase()}</td>
                              <td className="py-1.5 px-2 font-medium text-[#1E1B18]">
                                {tx.note}
                                {tx.recipientOrSource && (
                                  <span className="block text-[9.5px] text-[#787063] font-normal">{tx.recipientOrSource}</span>
                                )}
                              </td>
                              <td className="py-1.5 px-2 text-[#4A4339]">
                                {cat ? (language === 'ar_ma' ? cat.labelDarija : cat.label) : tx.category}
                              </td>
                              <td className="py-1.5 px-2 text-[#6B6356] capitalize text-[10px]">{tx.paymentMethod}</td>
                              <td className="py-1.5 px-2 text-right font-mono font-semibold text-[#A24824]">
                                {isExpense ? `-${Math.round(tx.amount).toLocaleString('fr-FR')} ${currencySymbol}` : '—'}
                              </td>
                              <td className="py-1.5 px-2 text-right font-mono font-semibold text-[#2F6848]">
                                {!isExpense ? `+${Math.round(tx.amount).toLocaleString('fr-FR')} ${currencySymbol}` : '—'}
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

            {/* Section 4: Audit & Strategic Notes */}
            {includeAuditNotes && (
              <div className="mt-6 p-3.5 bg-[#FAF8F5] border border-[#E5DFD4] rounded-lg">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#221F1C] mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#A24824]" />
                  <span>4. Diagnostic Financier & Discipline de Gestion</span>
                </div>
                <div className="text-[11px] text-[#4A4339] space-y-1">
                  <p>
                    • <strong>Solidité d&apos;épargne :</strong> Un taux de rétention nette de <strong>{statementData.savingsRate.toFixed(1)}%</strong> a été dégagé sur les flux d&apos;encaissement.
                  </p>
                  <p>
                    • <strong>Discipline budgétaire :</strong> {statementData.zeroExpenseDaysCount} journées zéro-dépense enregistrées ce mois ({((statementData.zeroExpenseDaysCount / statementData.daysInMonth) * 100).toFixed(0)}% du mois).
                  </p>
                  {customNotes && (
                    <p className="pt-1 border-t border-[#EAE4D7] text-[#25201B]">
                      • <strong>Note personnalisée :</strong> {customNotes}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Section 5: Seal & Certification */}
            {includeSeal && (
              <div className="mt-6 border-1.5 border-dashed border-[#A24824] p-4 rounded-lg bg-[#FDF9F6] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#FAF0EA] border border-[#F1DFD5] flex items-center justify-center text-[#A24824] shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-[#A24824] uppercase tracking-wider">
                      Certificat d'Authenticité & Empreinte Numérique
                    </div>
                    <div className="text-[10px] text-[#6B6356]">
                      Arrêté conforme aux écritures certifiées Mizan. ID: SHA256:{selectedMonth.replace('-', '')}-{statementData.totalTransactionsCount}-CERTIFIED
                    </div>
                  </div>
                </div>

                <div className="text-center shrink-0 w-44 pt-1 border-t border-[#8C8375]">
                  <div className="font-serif italic text-sm text-[#221F1C]">{clientName}</div>
                  <div className="text-[9px] uppercase tracking-wider text-[#8A8071]">Signature & Approbation</div>
                </div>
              </div>
            )}

            {/* Document Baseline Footer */}
            <div className="mt-6 pt-3 border-t border-[#ECE7DE] flex justify-between text-[9.5px] text-[#8C8375]">
              <span>Mizan Financial Intelligence Statement · Document confidentiel</span>
              <span>Rapport généré le {new Date().toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>

        {/* Modal Action Bar */}
        <div className="px-6 py-3.5 border-t border-[#E8E2D5] dark:border-[#312E28] bg-white dark:bg-[#23211D] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#6F6659] dark:text-[#A8A092] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3B6B55]"></span>
            <span>Prêt pour exportation au format A4 vectoriel standard.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadHtml}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DCD5C6] dark:border-[#38342D] bg-white dark:bg-[#22201C] hover:bg-[#F3EFE7] dark:hover:bg-[#2C2924] text-xs font-medium text-[#4A4237] dark:text-[#E8E4DC] transition-colors"
            >
              <Download className="w-4 h-4 text-[#6F6659]" />
              <span>Télécharger Relevé HTML</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#A24824] hover:bg-[#8F3E1E] text-white text-xs font-semibold shadow-sm transition-all hover:shadow cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isPrinting ? 'Préparation...' : 'Imprimer / Enregistrer en PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-[#6F6659] hover:text-[#25201B] dark:text-[#9A9184] dark:hover:text-[#F2EFEA]"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

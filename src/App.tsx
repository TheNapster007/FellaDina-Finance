import React, { useState, useEffect } from 'react';
import { Transaction, CategoryBudget, PeriodFilter, Currency, Language, Theme, ToastNotification } from './types';
import { INITIAL_CATEGORIES, INITIAL_TRANSACTIONS, MONTHLY_TREND_SERIES } from './data/initialData';
import { TopNav } from './components/TopNav';
import { HeroHeader } from './components/HeroHeader';
import { KpiCards } from './components/KpiCards';
import { Section01Drivers } from './components/Section01Drivers';
import { Section02Breakdown } from './components/Section02Breakdown';
import { Section03DetailTable } from './components/Section03DetailTable';
import { Section04FinancialCalendar } from './components/Section04FinancialCalendar';
import { TransactionModal } from './components/TransactionModal';
import { ExportModal } from './components/ExportModal';
import { PdfReportModal } from './components/PdfReportModal';
import { FooterNotes } from './components/FooterNotes';
import { ToastContainer } from './components/ToastContainer';

export default function App() {
  // Theme state: dark | light with persistence
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('mizan_theme') as Theme;
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // ignore
    }
    return 'light';
  });

  // Sync theme class to <html> element
  useEffect(() => {
    try {
      localStorage.setItem('mizan_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Load state from localStorage or initial defaults
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('mizan_transactions');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_TRANSACTIONS;
  });

  const [categories, setCategories] = useState<CategoryBudget[]>(() => {
    try {
      const saved = localStorage.getItem('mizan_categories');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_CATEGORIES;
  });

  const [period, setPeriod] = useState<PeriodFilter>('Q3');
  const [currency, setCurrency] = useState<Currency>('MAD');
  const [language, setLanguage] = useState<Language>('fr');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfInitialMonth, setPdfInitialMonth] = useState('2026-10');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [modalPreselectedDate, setModalPreselectedDate] = useState<string | undefined>(undefined);

  const handleOpenAddModalWithDate = (date: string) => {
    setEditingTransaction(null);
    setModalPreselectedDate(date);
    setIsAddModalOpen(true);
  };

  const handleOpenPdfModal = (monthKey?: string) => {
    if (monthKey) {
      setPdfInitialMonth(monthKey);
    }
    setIsPdfModalOpen(true);
  };

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (toast: Omit<ToastNotification, 'id'>) => {
    const newToast: ToastNotification = {
      ...toast,
      id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setToasts((prev) => [newToast, ...prev].slice(0, 4));
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mizan_transactions', JSON.stringify(transactions));
    } catch {
      // ignore
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem('mizan_categories', JSON.stringify(categories));
    } catch {
      // ignore
    }
  }, [categories]);

  // Reset data handler
  const handleResetData = () => {
    if (window.confirm('Voulez-vous réinitialiser les données de démonstration ?')) {
      setTransactions(INITIAL_TRANSACTIONS);
      setCategories(INITIAL_CATEGORIES);
      setSelectedCategory('all');
      addToast({
        type: 'info',
        title: 'Données réinitialisées',
        titleDarija: 'I3adat ta3yin l-ma3loumat',
        message: 'Les données de démonstration ont été restaurées.',
        messageDarija: 'L-ma3loumat d démonstration rj3o kifma kanou.',
        durationMs: 3500,
      });
    }
  };

  // Filter transactions according to selected category (if any)
  const activeTransactions = selectedCategory === 'all'
    ? transactions
    : transactions.filter((t) => t.category === selectedCategory);

  // Compute live KPIs
  const totalIncome = activeTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = activeTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
  
  // Total allocated budget for expenses
  const totalExpenseBudget = categories
    .filter((c) => c.type === 'expense')
    .reduce((sum, c) => sum + c.allocatedBudget, 0);

  const expenseRatioVsBudget = totalExpenseBudget > 0
    ? (totalExpense / totalExpenseBudget) * 100
    : 100;

  const incomeGrowth = 12.6;

  // Selected category display name
  const selectedCatObj = categories.find((c) => c.id === selectedCategory);
  const selectedCategoryName = selectedCatObj
    ? language === 'ar_ma'
      ? selectedCatObj.labelDarija
      : selectedCatObj.label
    : language === 'ar_ma'
    ? 'Kolchi (Toutes)'
    : 'Toutes les catégories';

  // Save / Update transaction handler with 80% budget alert toast trigger
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id'>,
    editId?: string
  ) => {
    if (editId) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === editId ? { ...txData, id: editId } : t))
      );
    } else {
      const newTx: Transaction = {
        ...txData,
        id: `tx-${Date.now()}`,
      };
      setTransactions((prev) => [newTx, ...prev]);
    }

    // Budget threshold check for expenses
    if (txData.type === 'expense') {
      const cat = categories.find((c) => c.id === txData.category);
      if (cat && cat.allocatedBudget > 0) {
        // Calculate prior spend in this category excluding edited tx
        const otherTxs = transactions.filter(
          (t) => t.category === txData.category && t.type === 'expense' && t.id !== editId
        );
        const priorSpent = otherTxs.reduce((sum, t) => sum + t.amount, 0);
        const newTotalSpent = priorSpent + txData.amount;
        const percentage = (newTotalSpent / cat.allocatedBudget) * 100;

        // Check if >= 80% threshold is reached or exceeded
        if (percentage >= 80) {
          const isOverrun = percentage >= 100;
          const catLabelFr = cat.label;
          const catLabelAr = cat.labelDarija;

          addToast({
            type: isOverrun ? 'danger' : 'warning',
            title: isOverrun
              ? `Dépassement de budget : ${catLabelFr}`
              : `Alerte Seuil de Budget (≥80%) : ${catLabelFr}`,
            titleDarija: isOverrun
              ? `Feti l-mizaniya : ${catLabelAr}`
              : `Rad l-bal (≥80% d l-mizaniya) : ${catLabelAr}`,
            message: isOverrun
              ? `Cette opération porte le total à ${Math.round(percentage)}% (${Math.round(newTotalSpent).toLocaleString('fr-FR')} ${currency} sur un plafond de ${Math.round(cat.allocatedBudget).toLocaleString('fr-FR')} ${currency}).`
              : `Attention : Vous avez consommé ${Math.round(percentage)}% du budget alloué (${Math.round(newTotalSpent).toLocaleString('fr-FR')} ${currency} sur ${Math.round(cat.allocatedBudget).toLocaleString('fr-FR')} ${currency}).`,
            messageDarija: isOverrun
              ? `Had l-masrouf wesslek l ${Math.round(percentage)}% mn l-mizaniya (${Math.round(newTotalSpent).toLocaleString('fr-FR')} ${currency} mn asl ${Math.round(cat.allocatedBudget).toLocaleString('fr-FR')} ${currency}).`
              : `Rad l-bal : Khserti ${Math.round(percentage)}% mn l-mizaniya d ${catLabelAr} (${Math.round(newTotalSpent).toLocaleString('fr-FR')} ${currency} mn asl ${Math.round(cat.allocatedBudget).toLocaleString('fr-FR')} ${currency}).`,
            category: cat.id,
            categoryLabel: cat.label,
            spentAmount: newTotalSpent,
            budgetAmount: cat.allocatedBudget,
            percentage,
            currency,
            durationMs: 8000,
            actionLabel: language === 'ar_ma' ? 'Chof had l-poste' : 'Inspecter ce poste',
            onAction: () => setSelectedCategory(cat.id),
          });
        } else {
          // Standard success confirmation
          addToast({
            type: 'success',
            title: editId ? 'Dépense mise à jour' : 'Dépense enregistrée',
            titleDarija: editId ? 'Tbeddel l-masrouf' : 'Tssjel l-masrouf',
            message: `${txData.note} (${Math.round(txData.amount).toLocaleString('fr-FR')} ${currency}) bien enregistrée. (${Math.round(percentage)}% du budget consommé)`,
            messageDarija: `${txData.note} (${Math.round(txData.amount).toLocaleString('fr-FR')} ${currency}) tzadit b nja7. (${Math.round(percentage)}% d l-mizaniya)`,
            category: cat.id,
            categoryLabel: cat.label,
            spentAmount: newTotalSpent,
            budgetAmount: cat.allocatedBudget,
            percentage,
            currency,
            durationMs: 4500,
          });
        }
      }
    } else if (txData.type === 'income') {
      // Income success confirmation
      addToast({
        type: 'success',
        title: editId ? 'Rentrée mise à jour' : 'Rentrée enregistrée',
        titleDarija: editId ? 'Tbeddel l-madkhoul' : 'Tssjel l-madkhoul',
        message: `+${Math.round(txData.amount).toLocaleString('fr-FR')} ${currency} crédités sur votre trésorerie.`,
        messageDarija: `+${Math.round(txData.amount).toLocaleString('fr-FR')} ${currency} tzado l-trésorerie dyalk.`,
        durationMs: 4500,
      });
    }

    setEditingTransaction(null);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsAddModalOpen(true);
  };

  const handleDeleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (tx) {
      addToast({
        type: 'info',
        title: 'Opération supprimée',
        titleDarija: 'T-mssa7at l-opération',
        message: `L'opération "${tx.note}" (${Math.round(tx.amount).toLocaleString('fr-FR')} ${currency}) a été retirée.`,
        messageDarija: `L-opération "${tx.note}" (${Math.round(tx.amount).toLocaleString('fr-FR')} ${currency}) thiyydat.`,
        durationMs: 4000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#141311] text-[#1E1B18] dark:text-[#F2EFEA] font-sans transition-colors duration-200">
      {/* Top Navigation matching screenshot */}
      <TopNav
        period={period}
        onPeriodChange={setPeriod}
        currency={currency}
        onCurrencyChange={setCurrency}
        language={language}
        onLanguageChange={setLanguage}
        theme={theme}
        onToggleTheme={toggleTheme}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categories={categories}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenPdfModal={() => handleOpenPdfModal()}
        onResetData={handleResetData}
      />

      {/* Main Container - Desktop baseline 1200px matching screenshot format */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        {/* Performance Dashboard Hero Header */}
        <HeroHeader
          period={period}
          currency={currency}
          language={language}
          selectedCategoryName={selectedCategoryName}
        />

        {/* 3 Executive Metric Cards */}
        <KpiCards
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          netSavings={netSavings}
          savingsRate={savingsRate}
          incomeGrowth={incomeGrowth}
          expenseRatioVsBudget={expenseRatioVsBudget}
          currency={currency}
          language={language}
          categories={categories}
          transactions={activeTransactions}
        />

        {/* Section 01: What is driving the numbers? */}
        <Section01Drivers
          transactions={transactions}
          categories={categories}
          currency={currency}
          language={language}
        />

        {/* Section 02: Where is the growth coming from? */}
        <Section02Breakdown
          categories={categories}
          transactions={transactions}
          currency={currency}
          language={language}
          onSelectCategory={setSelectedCategory}
          selectedCategory={selectedCategory}
        />

        {/* Section 03: The detail — by category & transactions */}
        <Section03DetailTable
          categories={categories}
          transactions={activeTransactions}
          currency={currency}
          language={language}
          onOpenAddModal={() => {
            setEditingTransaction(null);
            setIsAddModalOpen(true);
          }}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onOpenPdfModal={() => handleOpenPdfModal()}
          onEditTransaction={handleEditTransaction}
          onDeleteTransaction={handleDeleteTransaction}
        />

        {/* Section 04: Interactive Financial Calendar & Cash Flow Chronology */}
        <Section04FinancialCalendar
          transactions={transactions}
          categories={categories}
          currency={currency}
          language={language}
          onOpenAddModalWithDate={handleOpenAddModalWithDate}
          onEditTransaction={handleEditTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          onOpenPdfModal={(monthKey) => handleOpenPdfModal(monthKey)}
        />

        {/* Footer notes strip */}
        <FooterNotes language={language} />
      </main>

      {/* Transaction Modal for Add & Edit */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
          setModalPreselectedDate(undefined);
        }}
        onSave={handleSaveTransaction}
        categories={categories}
        editingTransaction={editingTransaction}
        initialDate={modalPreselectedDate}
        currency={currency}
        language={language}
      />

      {/* Export to Excel (CSV) Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions}
        categories={categories}
        currency={currency}
        language={language}
        onExportSuccess={(filename) => {
          addToast({
            type: 'success',
            title: 'Fichier exporté avec succès',
            titleDarija: 'T-telechargat l-CSV',
            message: `${filename} a été téléchargé pour analyse dans Excel.`,
            messageDarija: `${filename} t-telechargat bach t-analyséha f Excel.`,
            durationMs: 4500,
          });
        }}
      />

      {/* Formal PDF Financial Statement Modal */}
      <PdfReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        transactions={transactions}
        categories={categories}
        currency={currency}
        language={language}
        initialMonth={pdfInitialMonth}
        onReportGenerated={(monthLabel) => {
          addToast({
            type: 'success',
            title: 'Relevé financier prêt',
            titleDarija: 'Relevé financé wajed',
            message: `Le relevé officiel pour ${monthLabel} a été généré pour impression ou export PDF.`,
            messageDarija: `Relevé l-rasmi d ${monthLabel} t-généra w wajed l t-tibaa aw PDF.`,
            durationMs: 5000,
          });
        }}
      />

      {/* Real-time Toast Notifications */}
      <ToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
        language={language}
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Transaction, CategoryBudget, SubCategory, PeriodFilter, Currency, Language, Theme, ToastNotification } from './types';
import { INITIAL_CATEGORIES, INITIAL_TRANSACTIONS, INITIAL_SUB_CATEGORIES, MONTHLY_TREND_SERIES } from './data/initialData';
import { TopNav } from './components/TopNav';
import { HeroHeader } from './components/HeroHeader';
import { KpiCards } from './components/KpiCards';
import { Section01Drivers } from './components/Section01Drivers';
import { Section02Breakdown } from './components/Section02Breakdown';
import { Section03DetailTable } from './components/Section03DetailTable';
import { Section04FinancialCalendar } from './components/Section04FinancialCalendar';
import { Section05BudgetForecast } from './components/Section05BudgetForecast';
import { TransactionModal } from './components/TransactionModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { SubCategoryManagerModal } from './components/SubCategoryManagerModal';
import { CategoryDetailModal } from './components/CategoryDetailModal';
import { ExportModal } from './components/ExportModal';
import { PdfReportModal } from './components/PdfReportModal';
import { FooterNotes } from './components/FooterNotes';
import { ToastContainer } from './components/ToastContainer';

export default function App() {
  // Theme state: dark | light with persistence
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = (localStorage.getItem('felladina_theme') || localStorage.getItem('mizan_theme')) as Theme;
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
      localStorage.setItem('felladina_theme', theme);
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
      const saved = localStorage.getItem('felladina_transactions') || localStorage.getItem('mizan_transactions');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_TRANSACTIONS;
  });

  const [categories, setCategories] = useState<CategoryBudget[]>(() => {
    try {
      const saved = localStorage.getItem('felladina_categories') || localStorage.getItem('mizan_categories');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_CATEGORIES;
  });

  const [subCategories, setSubCategories] = useState<SubCategory[]>(() => {
    try {
      const saved = localStorage.getItem('felladina_subcategories') || localStorage.getItem('mizan_subcategories');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_SUB_CATEGORIES;
  });

  const [period, setPeriod] = useState<PeriodFilter>('Q3');
  const [currency, setCurrency] = useState<Currency>('MAD');
  const [language, setLanguage] = useState<Language>('fr');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);
  const [subCategoryModalCatId, setSubCategoryModalCatId] = useState<string | undefined>(undefined);
  const [inspectingCategoryId, setInspectingCategoryId] = useState<string | null>(null);

  const [pdfInitialMonth, setPdfInitialMonth] = useState('2026-10');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [modalPreselectedDate, setModalPreselectedDate] = useState<string | undefined>(undefined);
  const [modalPreselectedCategory, setModalPreselectedCategory] = useState<string | undefined>(undefined);

  const handleOpenAddModalWithDate = (date: string) => {
    setEditingTransaction(null);
    setModalPreselectedDate(date);
    setModalPreselectedCategory(undefined);
    setIsAddModalOpen(true);
  };

  const handleOpenAddModalWithCategory = (catId: string) => {
    setEditingTransaction(null);
    setModalPreselectedDate(undefined);
    setModalPreselectedCategory(catId);
    setIsAddModalOpen(true);
  };

  const handleOpenPdfModal = (monthKey?: string) => {
    if (monthKey) {
      setPdfInitialMonth(monthKey);
    }
    setIsPdfModalOpen(true);
  };

  const handleOpenSubCategoryManager = (catId?: string) => {
    setSubCategoryModalCatId(catId);
    setIsSubCategoryModalOpen(true);
  };

  const handleOpenCategoryDetail = (catId: string) => {
    setInspectingCategoryId(catId);
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

  // Category Management Handlers
  const handleAddCategory = (newCat: CategoryBudget) => {
    setCategories((prev) => [...prev, newCat]);
    addToast({
      type: 'success',
      title: 'Catégorie créée avec succès',
      titleDarija: 'Tzadit catégorie jdida',
      message: `La catégorie "${newCat.label}" a été ajoutée avec un plafond de ${Math.round(newCat.allocatedBudget).toLocaleString('fr-FR')} ${currency}.`,
      messageDarija: `Catégorie "${newCat.labelDarija || newCat.label}" tzadit b nja7 (${Math.round(newCat.allocatedBudget).toLocaleString('fr-FR')} ${currency}).`,
      durationMs: 4500,
    });
  };

  const handleUpdateCategory = (updatedCat: CategoryBudget) => {
    setCategories((prev) => prev.map((c) => (c.id === updatedCat.id ? updatedCat : c)));
    addToast({
      type: 'info',
      title: 'Plafond mis à jour',
      titleDarija: 'Tbeddel l-plafond',
      message: `Le plafond de "${updatedCat.label}" est désormais de ${Math.round(updatedCat.allocatedBudget).toLocaleString('fr-FR')} ${currency}.`,
      messageDarija: `Plafond d "${updatedCat.labelDarija || updatedCat.label}" wlla ${Math.round(updatedCat.allocatedBudget).toLocaleString('fr-FR')} ${currency}.`,
      durationMs: 3500,
    });
  };

  const handleDeleteCategory = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    if (selectedCategory === catId) {
      setSelectedCategory('all');
    }
    // Re-assign transactions belonging to this category to 'logement' or standard category
    setTransactions((prev) =>
      prev.map((t) => (t.category === catId ? { ...t, category: 'logement' } : t))
    );
    // Remove attached subcategories
    setSubCategories((prev) => prev.filter((s) => s.categoryId !== catId));

    if (cat) {
      addToast({
        type: 'info',
        title: 'Catégorie supprimée',
        titleDarija: 'T-mssa7at catégorie',
        message: `La catégorie personnalisée "${cat.label}" a été supprimée.`,
        messageDarija: `Catégorie "${cat.labelDarija || cat.label}" t-mssa7at.`,
        durationMs: 3500,
      });
    }
  };

  // SubCategory Handlers
  const handleAddSubCategory = (newSub: SubCategory) => {
    setSubCategories((prev) => [...prev, newSub]);
    addToast({
      type: 'success',
      title: 'Sous-catégorie créée',
      titleDarija: 'Tzadit sous-catégorie',
      message: `La sous-catégorie "${newSub.name}" a été ajoutée.`,
      messageDarija: `Sous-catégorie "${newSub.nameDarija || newSub.name}" tzadit b nja7.`,
      durationMs: 4000,
    });
  };

  const handleDeleteSubCategory = (id: string) => {
    const sub = subCategories.find((s) => s.id === id);
    setSubCategories((prev) => prev.filter((s) => s.id !== id));
    // Clear subCategory field on transactions that used this subcategory
    setTransactions((prev) => prev.map((t) => (t.subCategory === id ? { ...t, subCategory: undefined } : t)));
    if (sub) {
      addToast({
        type: 'info',
        title: 'Sous-catégorie supprimée',
        titleDarija: 'T-mssa7at sous-catégorie',
        message: `La sous-catégorie "${sub.name}" a été supprimée.`,
        messageDarija: `Sous-catégorie "${sub.nameDarija || sub.name}" t-mssa7at.`,
        durationMs: 3500,
      });
    }
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('felladina_transactions', JSON.stringify(transactions));
    } catch {
      // ignore
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem('felladina_categories', JSON.stringify(categories));
    } catch {
      // ignore
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem('felladina_subcategories', JSON.stringify(subCategories));
    } catch {
      // ignore
    }
  }, [subCategories]);

  // Reset data handler
  const handleResetData = () => {
    if (window.confirm('Voulez-vous réinitialiser les données de démonstration ?')) {
      setTransactions(INITIAL_TRANSACTIONS);
      setCategories(INITIAL_CATEGORIES);
      setSubCategories(INITIAL_SUB_CATEGORIES);
      setSelectedCategory('all');
      addToast({
        type: 'info',
        title: 'Données réinitialisées',
        titleDarija: 'I3adat ta3yin l-ma3loumat',
        message: 'Les données de démonstration et sous-catégories ont été restaurées.',
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
      const sub = subCategories.find((s) => s.id === txData.subCategory);
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
            onAction: () => setInspectingCategoryId(cat.id),
          });
        } else {
          // Standard success confirmation
          const subInfo = sub ? ` [${sub.name}]` : '';
          addToast({
            type: 'success',
            title: editId ? 'Dépense mise à jour' : 'Dépense enregistrée',
            titleDarija: editId ? 'Tbeddel l-masrouf' : 'Tssjel l-masrouf',
            message: `${txData.note}${subInfo} (${Math.round(txData.amount).toLocaleString('fr-FR')} ${currency}) bien enregistrée.`,
            messageDarija: `${txData.note} (${Math.round(txData.amount).toLocaleString('fr-FR')} ${currency}) tzadit b nja7.`,
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

  const inspectingCategoryObj = categories.find((c) => c.id === inspectingCategoryId) || null;

  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#141311] text-[#1E1B18] dark:text-[#F2EFEA] font-sans transition-colors duration-200">
      {/* Top Navigation */}
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
          setModalPreselectedDate(undefined);
          setModalPreselectedCategory(undefined);
          setIsAddModalOpen(true);
        }}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenPdfModal={() => handleOpenPdfModal()}
        onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
        onOpenSubCategoryManager={() => handleOpenSubCategoryManager()}
        onResetData={handleResetData}
      />

      {/* Main Container */}
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
          onOpenCategoryDetail={handleOpenCategoryDetail}
        />

        {/* Section 03: The detail — by category, subcategories & transactions */}
        <Section03DetailTable
          categories={categories}
          transactions={activeTransactions}
          subCategories={subCategories}
          currency={currency}
          language={language}
          onOpenAddModal={() => {
            setEditingTransaction(null);
            setModalPreselectedDate(undefined);
            setModalPreselectedCategory(undefined);
            setIsAddModalOpen(true);
          }}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onOpenPdfModal={() => handleOpenPdfModal()}
          onOpenCategoryDetail={handleOpenCategoryDetail}
          onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
          onOpenSubCategoryManager={handleOpenSubCategoryManager}
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

        {/* Section 05: Predictive Budget Forecast & 3-Month Projection */}
        <Section05BudgetForecast
          transactions={transactions}
          categories={categories}
          currency={currency}
          language={language}
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
          setModalPreselectedCategory(undefined);
        }}
        onSave={handleSaveTransaction}
        categories={categories}
        subCategories={subCategories}
        onAddCustomCategory={handleAddCategory}
        onAddCustomSubCategory={handleAddSubCategory}
        editingTransaction={editingTransaction}
        initialDate={modalPreselectedDate}
        initialCategory={modalPreselectedCategory}
        currency={currency}
        language={language}
      />

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={categories}
        transactions={transactions}
        subCategories={subCategories}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
        currency={currency}
        language={language}
      />

      {/* SubCategory Manager Modal */}
      <SubCategoryManagerModal
        isOpen={isSubCategoryModalOpen}
        onClose={() => setIsSubCategoryModalOpen(false)}
        categories={categories}
        subCategories={subCategories}
        transactions={transactions}
        onAddSubCategory={handleAddSubCategory}
        onDeleteSubCategory={handleDeleteSubCategory}
        currency={currency}
        language={language}
        initialCategoryId={subCategoryModalCatId}
      />

      {/* Category Detail Modal (Articles, Subcategories, Receipts) */}
      <CategoryDetailModal
        isOpen={Boolean(inspectingCategoryId)}
        onClose={() => setInspectingCategoryId(null)}
        category={inspectingCategoryObj}
        transactions={transactions}
        subCategories={subCategories}
        currency={currency}
        language={language}
        onOpenAddModalWithCategory={handleOpenAddModalWithCategory}
        onOpenSubCategoryManager={handleOpenSubCategoryManager}
      />

      {/* Export to Excel (CSV) Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions}
        categories={categories}
        subCategories={subCategories}
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

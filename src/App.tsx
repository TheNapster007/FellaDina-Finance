import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, CategoryBudget, SubCategory, PeriodFilter, Currency, Language, Theme, ToastNotification, UserProfile, SavingsGoal } from './types';
import { INITIAL_CATEGORIES, INITIAL_TRANSACTIONS, INITIAL_SUB_CATEGORIES, INITIAL_SAVINGS_GOALS, MONTHLY_TREND_SERIES } from './data/initialData';
import { TopNav } from './components/TopNav';
import { HeroHeader } from './components/HeroHeader';
import { DailyEntryBanner } from './components/DailyEntryBanner';
import { KpiCards } from './components/KpiCards';
import { Section01Drivers } from './components/Section01Drivers';
import { Section02Breakdown } from './components/Section02Breakdown';
import { Section03DetailTable } from './components/Section03DetailTable';
import { Section04FinancialCalendar } from './components/Section04FinancialCalendar';
import { Section05BudgetForecast } from './components/Section05BudgetForecast';
import { Section06SavingsGoals } from './components/Section06SavingsGoals';
import { TransactionModal } from './components/TransactionModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { SubCategoryManagerModal } from './components/SubCategoryManagerModal';
import { CategoryDetailModal } from './components/CategoryDetailModal';
import { ExportModal } from './components/ExportModal';
import { PdfReportModal } from './components/PdfReportModal';
import { AuthModal } from './components/AuthModal';
import { SavingsGoalModal } from './components/SavingsGoalModal';
import { FooterNotes } from './components/FooterNotes';
import { ToastContainer } from './components/ToastContainer';
import { buildUserCategories } from './utils/userBudgetGenerator';
import { Lock, Sparkles } from 'lucide-react';
import {
  auth,
  onAuthStateChanged,
  logOutFirebase,
  mapFirebaseUserToProfile,
  subscribeToTransactions,
  saveTransactionToFirestore,
  deleteTransactionFromFirestore,
  subscribeToCategories,
  saveCategoryToFirestore,
  deleteCategoryFromFirestore,
  subscribeToSavingsGoals,
  saveSavingsGoalToFirestore,
  deleteSavingsGoalFromFirestore,
  saveUserProfileToFirestore,
} from './lib/firebase';

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

  // Load state from localStorage or initial defaults (starts clean and empty)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('felladina_transactions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((t: any) => t.id === 'tx-101' || t.id === 'tx-201' || t.id === 'tx-301' || t.id === 'tx-01')) {
          localStorage.removeItem('felladina_transactions');
          return [];
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    return [];
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

  // User profiles and active user session state
  const [savedProfiles, setSavedProfiles] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('felladina_users');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('felladina_active_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  // Listen to Firebase Authentication state (Google Sign-In & persistent sessions)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const profile = mapFirebaseUserToProfile(fbUser);
        setCurrentUser((prev) => {
          if (!prev || prev.id !== fbUser.uid) {
            try {
              localStorage.setItem('felladina_active_user', JSON.stringify(profile));
            } catch {
              // ignore
            }
            return profile;
          }
          return prev;
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time synchronization with Firestore under /users/{userId}/*
  useEffect(() => {
    if (!currentUser?.id) return;
    const userId = currentUser.id;

    // 1. Transactions sync
    const unsubTx = subscribeToTransactions(userId, (remoteTxs) => {
      setTransactions(remoteTxs);
      try {
        localStorage.setItem(`felladina_tx_${userId}`, JSON.stringify(remoteTxs));
        localStorage.setItem('felladina_transactions', JSON.stringify(remoteTxs));
      } catch {
        // ignore
      }
    });

    // 2. Categories sync
    const unsubCats = subscribeToCategories(userId, (remoteCats) => {
      if (remoteCats && remoteCats.length > 0) {
        setCategories(remoteCats);
        try {
          localStorage.setItem(`felladina_cat_${userId}`, JSON.stringify(remoteCats));
          localStorage.setItem('felladina_categories', JSON.stringify(remoteCats));
        } catch {
          // ignore
        }
      }
    });

    // 3. Savings goals sync
    const unsubGoals = subscribeToSavingsGoals(userId, (remoteGoals) => {
      setSavingsGoals(remoteGoals);
      try {
        localStorage.setItem(`felladina_savings_goals_${userId}`, JSON.stringify(remoteGoals));
        localStorage.setItem('felladina_savings_goals', JSON.stringify(remoteGoals));
      } catch {
        // ignore
      }
    });

    return () => {
      unsubTx();
      unsubCats();
      unsubGoals();
    };
  }, [currentUser?.id]);

  // Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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
  const [modalPreselectedType, setModalPreselectedType] = useState<TransactionType | undefined>(undefined);

  // Savings Goals & Surplus Allocation State
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem('felladina_savings_goals');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((g: any) => g.id === 'goal-emergency' || g.id === 'goal-realestate')) {
          localStorage.removeItem('felladina_savings_goals');
          return [];
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [goalModalMode, setGoalModalMode] = useState<'create' | 'edit' | 'allocate'>('create');

  const requireUserAuth = (_action?: 'add' | 'edit' | 'delete' | 'category' | 'goal' | 'general'): boolean => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      addToast({
        type: 'info',
        title: 'Compte requis',
        titleDarija: 'Khassk 7ssab bach tkemmel',
        message: 'Créez un compte ou connectez-vous pour ajouter, modifier ou supprimer des opérations financières.',
        messageDarija: 'Sjjel 7ssab jdid bach t-zid aw t-beddel l-masarif w l-madakhil.',
        durationMs: 4000,
      });
      return false;
    }
    return true;
  };

  const handleOpenAddModal = (preselectedType?: TransactionType) => {
    if (!requireUserAuth('add')) return;
    setEditingTransaction(null);
    setModalPreselectedDate(undefined);
    setModalPreselectedCategory(undefined);
    setModalPreselectedType(preselectedType);
    setIsAddModalOpen(true);
  };

  const handleOpenAddGoal = () => {
    if (!requireUserAuth('goal')) return;
    setEditingGoal(null);
    setGoalModalMode('create');
    setIsGoalModalOpen(true);
  };

  const handleOpenEditGoal = (goal: SavingsGoal) => {
    if (!requireUserAuth('goal')) return;
    setEditingGoal(goal);
    setGoalModalMode('edit');
    setIsGoalModalOpen(true);
  };

  const handleOpenAllocateSurplus = (goal: SavingsGoal) => {
    if (!requireUserAuth('goal')) return;
    setEditingGoal(goal);
    setGoalModalMode('allocate');
    setIsGoalModalOpen(true);
  };

  const handleOpenAddModalWithDate = (date: string, preselectedType?: TransactionType) => {
    if (!requireUserAuth('add')) return;
    setEditingTransaction(null);
    setModalPreselectedDate(date);
    setModalPreselectedCategory(undefined);
    setModalPreselectedType(preselectedType);
    setIsAddModalOpen(true);
  };

  const handleOpenAddModalWithCategory = (catId: string) => {
    if (!requireUserAuth('add')) return;
    setEditingTransaction(null);
    setModalPreselectedDate(undefined);
    setModalPreselectedCategory(catId);
    setModalPreselectedType(undefined);
    setIsAddModalOpen(true);
  };

  const handleOpenPdfModal = (monthKey?: string) => {
    if (monthKey) {
      setPdfInitialMonth(monthKey);
    }
    setIsPdfModalOpen(true);
  };

  const handleOpenCategoryManager = () => {
    if (!requireUserAuth('category')) return;
    setIsCategoryManagerOpen(true);
  };

  const handleOpenSubCategoryManager = (catId?: string) => {
    if (!requireUserAuth('category')) return;
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
    if (!requireUserAuth('category')) return;
    setCategories((prev) => [...prev, newCat]);
    if (currentUser?.id) {
      saveCategoryToFirestore(currentUser.id, newCat).catch(console.error);
    }
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
    if (!requireUserAuth('category')) return;
    setCategories((prev) => prev.map((c) => (c.id === updatedCat.id ? updatedCat : c)));
    if (currentUser?.id) {
      saveCategoryToFirestore(currentUser.id, updatedCat).catch(console.error);
    }
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
    if (!requireUserAuth('category')) return;
    const cat = categories.find((c) => c.id === catId);
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    if (currentUser?.id) {
      deleteCategoryFromFirestore(currentUser.id, catId).catch(console.error);
    }
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
    if (!requireUserAuth('category')) return;
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
    if (!requireUserAuth('category')) return;
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

  // Sync savings goals to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('felladina_savings_goals', JSON.stringify(savingsGoals));
    } catch {
      // ignore
    }
  }, [savingsGoals]);

  // Savings Goal Handlers
  const handleSaveGoal = (goalToSave: SavingsGoal) => {
    if (!requireUserAuth('goal')) return;
    const isEdit = savingsGoals.some((g) => g.id === goalToSave.id);
    if (isEdit) {
      setSavingsGoals((prev) => prev.map((g) => (g.id === goalToSave.id ? goalToSave : g)));
      if (currentUser?.id) {
        saveSavingsGoalToFirestore(currentUser.id, goalToSave).catch(console.error);
      }
      addToast({
        type: 'info',
        title: 'Objectif d’épargne mis à jour',
        titleDarija: 'Tbeddel l-hadaf d l-ittikhar',
        message: `Le projet "${goalToSave.name}" a été mis à jour avec une cible de ${Math.round(goalToSave.targetAmount).toLocaleString('fr-FR')} ${currency}.`,
        messageDarija: `L-hadaf "${goalToSave.nameDarija || goalToSave.name}" tbeddel b nja7.`,
        durationMs: 4000,
      });
    } else {
      setSavingsGoals((prev) => [goalToSave, ...prev]);
      if (currentUser?.id) {
        saveSavingsGoalToFirestore(currentUser.id, goalToSave).catch(console.error);
      }
      addToast({
        type: 'success',
        title: 'Nouvel objectif créé',
        titleDarija: 'Tzad hadaf jdid',
        message: `Le projet "${goalToSave.name}" a été ajouté avec une cible de ${Math.round(goalToSave.targetAmount).toLocaleString('fr-FR')} ${currency}.`,
        messageDarija: `L-hadaf "${goalToSave.nameDarija || goalToSave.name}" tzad b nja7.`,
        durationMs: 4500,
      });
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    if (!requireUserAuth('goal')) return;
    const goal = savingsGoals.find((g) => g.id === goalId);
    setSavingsGoals((prev) => prev.filter((g) => g.id !== goalId));
    if (currentUser?.id) {
      deleteSavingsGoalFromFirestore(currentUser.id, goalId).catch(console.error);
    }
    if (goal) {
      addToast({
        type: 'info',
        title: 'Objectif supprimé',
        titleDarija: 'T-mssa7 l-hadaf',
        message: `Le projet "${goal.name}" a été retiré de vos objectifs.`,
        messageDarija: `L-hadaf "${goal.nameDarija || goal.name}" thiyyed.`,
        durationMs: 3500,
      });
    }
  };

  const handleAllocateSurplus = (goalId: string, amount: number, note?: string) => {
    if (!requireUserAuth('goal')) return;
    const goal = savingsGoals.find((g) => g.id === goalId);
    if (!goal) return;

    const newAmount = goal.currentAmount + amount;
    const newProgress = Math.min(100, Math.round((newAmount / goal.targetAmount) * 100));
    const updatedGoal = { ...goal, currentAmount: newAmount };

    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === goalId ? updatedGoal : g))
    );
    if (currentUser?.id) {
      saveSavingsGoalToFirestore(currentUser.id, updatedGoal).catch(console.error);
    }

    addToast({
      type: 'success',
      title: 'Surplus mensuel alloué',
      titleDarija: 'T-alloua l-fadl b nja7',
      message: `+${Math.round(amount).toLocaleString('fr-FR')} ${currency} alloués au projet "${goal.name}". Avancement : ${newProgress}%.`,
      messageDarija: `+${Math.round(amount).toLocaleString('fr-FR')} ${currency} tzado l "${goal.nameDarija || goal.name}".`,
      durationMs: 5000,
    });
  };

  const handleQuickAllocate = (goalId: string, amount: number) => {
    if (!requireUserAuth('goal')) return;
    handleAllocateSurplus(goalId, amount);
  };

  // Registration & Onboarding success handler
  const handleRegisterSuccess = (profile: UserProfile) => {
    const updatedProfiles = [...savedProfiles.filter((p) => p.id !== profile.id), profile];
    setSavedProfiles(updatedProfiles);
    setCurrentUser(profile);
    setCurrency(profile.currency);

    const userCategories = buildUserCategories(profile.expenses);
    const userTransactions: Transaction[] = []; // Starts clean and empty as requested!

    setCategories(userCategories);
    setTransactions(userTransactions);
    setSelectedCategory('all');

    if (profile.id) {
      saveUserProfileToFirestore(profile.id, profile).catch(console.error);
      userCategories.forEach((cat: CategoryBudget) => saveCategoryToFirestore(profile.id, cat).catch(console.error));
    }

    try {
      localStorage.setItem('felladina_users', JSON.stringify(updatedProfiles));
      localStorage.setItem('felladina_active_user', JSON.stringify(profile));
      localStorage.setItem(`felladina_tx_${profile.id}`, JSON.stringify([]));
      localStorage.setItem(`felladina_cat_${profile.id}`, JSON.stringify(userCategories));
      localStorage.setItem('felladina_transactions', JSON.stringify([]));
    } catch {
      // ignore
    }

    addToast({
      type: 'success',
      title: `Bienvenue, ${profile.name} !`,
      titleDarija: `Marhba bik, ${profile.name} !`,
      message: `Votre espace financier personnel est prêt et synchronisé avec Firebase. Vous pouvez dès à présent enregistrer vos rentrées et dépenses quotidiennes.`,
      messageDarija: `L-mizaniya dyalek wajda w m-syncronisa. Bda ddkhel l-masarif w l-madkhoul dyalek.`,
      durationMs: 6500,
    });
  };

  // Login existing user handler
  const handleLoginSuccess = (profile: UserProfile) => {
    setCurrentUser(profile);
    setCurrency(profile.currency);

    if (profile.id) {
      saveUserProfileToFirestore(profile.id, profile).catch(console.error);
    }

    try {
      localStorage.setItem('felladina_active_user', JSON.stringify(profile));
      const savedTx = localStorage.getItem(`felladina_tx_${profile.id}`);
      const savedCat = localStorage.getItem(`felladina_cat_${profile.id}`);

      if (savedTx) {
        setTransactions(JSON.parse(savedTx));
      } else {
        setTransactions([]);
      }

      if (savedCat) {
        setCategories(JSON.parse(savedCat));
      } else {
        const userCategories = buildUserCategories(profile.expenses);
        setCategories(userCategories);
      }
    } catch {
      const userCategories = buildUserCategories(profile.expenses);
      setCategories(userCategories);
      setTransactions([]);
    }

    setSelectedCategory('all');

    addToast({
      type: 'info',
      title: `Session chargée : ${profile.name}`,
      titleDarija: `Marhba b rjou3ek, ${profile.name}`,
      message: `Votre tableau de bord a été actualisé et synchronisé avec Firebase.`,
      messageDarija: `L-ma3loumat d l-7ssab dyalek t-charjaw b nja7 mn Firebase.`,
      durationMs: 4000,
    });
  };

  // Logout / Switch User handler
  const handleLogout = async () => {
    try {
      await logOutFirebase();
    } catch (err) {
      console.error('Firebase sign out error:', err);
    }
    setCurrentUser(null);
    try {
      localStorage.removeItem('felladina_active_user');
    } catch {
      // ignore
    }
    addToast({
      type: 'info',
      title: 'Déconnexion effectuée',
      titleDarija: 'Khrjti mn l-7ssab',
      message: 'Vous pouvez vous reconnecter à tout moment pour retrouver vos données.',
      messageDarija: 'Rak daba f mode consultation.',
      durationMs: 3500,
    });
  };

  // Reset data handler
  const handleResetData = () => {
    if (window.confirm('Voulez-vous réinitialiser toutes les opérations pour repartir sur un tableau de bord vierge ?')) {
      setTransactions([]);
      setSavingsGoals([]);
      try {
        localStorage.removeItem('felladina_transactions');
        localStorage.removeItem('felladina_savings_goals');
        if (currentUser?.id) {
          localStorage.removeItem(`felladina_tx_${currentUser.id}`);
          localStorage.removeItem(`felladina_savings_goals_${currentUser.id}`);
        }
      } catch {
        // ignore
      }
      addToast({
        type: 'info',
        title: 'Espace réinitialisé',
        titleDarija: 'I3adat ta3yin',
        message: 'Toutes les opérations ont été effacées. Votre application est propre et vierge.',
        messageDarija: 'L-mizaniya rj3at khawya.',
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
    if (!requireUserAuth(editId ? 'edit' : 'add')) return;
    const finalTx: Transaction = editId
      ? { ...txData, id: editId }
      : {
          ...txData,
          id: `tx-${Date.now()}`,
        };

    if (editId) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === editId ? finalTx : t))
      );
    } else {
      setTransactions((prev) => [finalTx, ...prev]);
    }

    if (currentUser?.id) {
      saveTransactionToFirestore(currentUser.id, finalTx).catch(console.error);
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
    if (!requireUserAuth('edit')) return;
    setEditingTransaction(tx);
    setIsAddModalOpen(true);
  };

  const handleDeleteTransaction = (id: string) => {
    if (!requireUserAuth('delete')) return;
    const tx = transactions.find((t) => t.id === id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (currentUser?.id) {
      deleteTransactionFromFirestore(currentUser.id, id).catch(console.error);
    }
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
        onOpenAddModal={handleOpenAddModal}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenPdfModal={() => handleOpenPdfModal()}
        onOpenCategoryManager={handleOpenCategoryManager}
        onOpenSubCategoryManager={() => handleOpenSubCategoryManager()}
        onResetData={handleResetData}
        currentUser={currentUser}
        onOpenSignUp={() => setIsAuthModalOpen(true)}
        onOpenSignIn={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onEditProfile={() => setIsAuthModalOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        {/* Performance Dashboard Hero Header */}
        <HeroHeader
          period={period}
          currency={currency}
          language={language}
          selectedCategoryName={selectedCategoryName}
          currentUser={currentUser}
          onOpenSignUp={() => setIsAuthModalOpen(true)}
        />

        {/* Welcome Onboarding Banner for Visitors */}
        {!currentUser && (
          <div className="mb-6 rounded-xl border border-[#E5DAC8] dark:border-[#383025] bg-gradient-to-r from-[#FAF6EE] via-[#FDFBF7] to-[#F5ECE5] dark:from-[#211D18] dark:via-[#1D1B17] dark:to-[#261E1A] p-4 sm:p-5 shadow-xs transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-[#A24824]/10 dark:bg-[#A24824]/20 flex items-center justify-center shrink-0 mt-0.5 text-[#A24824] dark:text-[#E8734C]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#2C2722] dark:text-[#F2EFEA]">
                    {language === 'ar_ma'
                      ? 'Marhba bik f Felladina Finance · Bda hisab l-flous dyalek'
                      : language === 'en'
                      ? 'Welcome to Felladina Finance · Track your personal cash flow'
                      : 'Bienvenue sur Felladina Finance · Votre gestion financière sur-mesure'}
                  </h3>
                  <p className="mt-1 text-xs text-[#6A6154] dark:text-[#B6AEA3] leading-relaxed max-w-2xl">
                    {language === 'ar_ma'
                      ? 'Sjjel 7ssab f tawani bach tbda ddkhel l-madakhil w l-masarif yawmiyan, w tchof tawaqo3at l-mizaniya dyalek b tariqa deqiqqa.'
                      : language === 'en'
                      ? 'Create an account to start logging your daily incomes and expenses, and track intelligent budget forecasts based on your entries.'
                      : 'Créez votre compte en quelques instants pour commencer à enregistrer vos dépenses et rentrées quotidiennes et bénéficier de calculs et projections personnalisés.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#A24824] hover:bg-[#8F3E1E] text-white text-xs font-semibold rounded-lg shadow-sm transition-all hover:shadow cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {language === 'ar_ma'
                      ? 'Fte7 7ssab (Sign Up)'
                      : language === 'en'
                      ? 'Create an Account'
                      : 'Créer mon compte'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Daily Entry Banner for Fast Incomes & Expenses Logging */}
        <DailyEntryBanner
          transactions={transactions}
          currency={currency}
          language={language}
          currentUser={currentUser}
          onOpenAddModalWithType={(type) => handleOpenAddModal(type)}
          onOpenSignUp={() => setIsAuthModalOpen(true)}
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
          onOpenAddModal={handleOpenAddModal}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onOpenPdfModal={() => handleOpenPdfModal()}
          onOpenCategoryDetail={handleOpenCategoryDetail}
          onOpenCategoryManager={handleOpenCategoryManager}
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

        {/* Section 06: Objectifs d'Épargne & Allocation du Surplus */}
        <Section06SavingsGoals
          goals={savingsGoals}
          transactions={activeTransactions}
          categories={categories}
          currency={currency}
          language={language}
          onOpenAddGoalModal={handleOpenAddGoal}
          onOpenEditGoalModal={handleOpenEditGoal}
          onOpenAllocateSurplusModal={handleOpenAllocateSurplus}
          onDeleteGoal={handleDeleteGoal}
          onQuickAllocate={handleQuickAllocate}
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
          setModalPreselectedType(undefined);
        }}
        onSave={handleSaveTransaction}
        categories={categories}
        subCategories={subCategories}
        onAddCustomCategory={handleAddCategory}
        onAddCustomSubCategory={handleAddSubCategory}
        editingTransaction={editingTransaction}
        initialDate={modalPreselectedDate}
        initialCategory={modalPreselectedCategory}
        initialType={modalPreselectedType}
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

      {/* Sign Up & Financial Setup Wizard Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onRegisterSuccess={handleRegisterSuccess}
        onLoginSuccess={handleLoginSuccess}
        language={language}
        currentCurrency={currency}
        savedProfiles={savedProfiles}
        activeProfileId={currentUser?.id}
      />

      {/* Savings Goal Definition & Surplus Allocation Modal */}
      <SavingsGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        onAllocateSurplus={handleAllocateSurplus}
        editingGoal={editingGoal}
        mode={goalModalMode}
        monthlySurplus={Math.max(0, netSavings)}
        currency={currency}
        language={language}
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

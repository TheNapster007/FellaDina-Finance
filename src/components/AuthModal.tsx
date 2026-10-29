import React, { useState } from 'react';
import { Currency, Language, UserProfile, UserIncomeSource, UserExpenseBudgetPlan } from '../types';
import {
  X,
  UserCheck,
  Wallet,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  Briefcase,
  Home,
  ShoppingBag,
  Zap,
  Car,
  HeartPulse,
  Coffee,
  PiggyBank,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
  Mail,
  User,
  ShieldCheck,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import {
  signInWithGoogle,
  mapFirebaseUserToProfile,
  saveUserProfileToFirestore,
} from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (profile: UserProfile) => void;
  onLoginSuccess: (profile: UserProfile) => void;
  language: Language;
  currentCurrency: Currency;
  savedProfiles: UserProfile[];
  activeProfileId?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
  onLoginSuccess,
  language,
  currentCurrency,
  savedProfiles,
  activeProfileId,
}) => {
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Google Firebase Auth State
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Form step 1: Identity & Credentials
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currentCurrency || 'MAD');
  const [initialBalance, setInitialBalance] = useState<number>(15000);

  // Google 1-Click Sign-In with Gmail
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setGoogleError(null);
    try {
      const fbUser = await signInWithGoogle();
      const profile = mapFirebaseUserToProfile(fbUser);
      profile.currency = selectedCurrency;
      // Persist to Firestore
      await saveUserProfileToFirestore(fbUser.uid, profile);
      onLoginSuccess(profile);
      onClose();
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setGoogleError(
          language === 'ar_ma'
            ? 'Ma qdrnach ndkhel b Google. 3awed jarreb.'
            : 'Échec de la connexion avec votre compte Google / Gmail. Veuillez réessayer.'
        );
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Form step 2: Incomes
  const [incomes, setIncomes] = useState<UserIncomeSource[]>([
    {
      id: 'inc-1',
      name: 'Salaire principal net',
      nameDarija: 'Khlassa d ch-har',
      amount: 14000,
      frequency: 'monthly',
      dayOfMonth: 28,
    },
    {
      id: 'inc-2',
      name: 'Freelance & Missions',
      nameDarija: 'Khedma 7orra / Bricole',
      amount: 2500,
      frequency: 'monthly',
      dayOfMonth: 15,
    },
  ]);
  const [customIncomeName, setCustomIncomeName] = useState('');
  const [customIncomeAmount, setCustomIncomeAmount] = useState<string>('');

  // Form step 3: Expenses
  const [expenses, setExpenses] = useState<UserExpenseBudgetPlan[]>([
    {
      categoryId: 'logement',
      name: 'Logement & Loyer',
      nameDarija: 'Skn & Kra',
      amount: 4500,
      isFixedCharge: true,
    },
    {
      categoryId: 'alimentation',
      name: 'Alimentation & Courses',
      nameDarija: 'Mawad ghidaiya & Souq',
      amount: 3200,
      isFixedCharge: false,
    },
    {
      categoryId: 'factures',
      name: 'Factures (Eau, Élec, Internet)',
      nameDarija: 'Fawatir lma w do w reseau',
      amount: 850,
      isFixedCharge: true,
    },
    {
      categoryId: 'transport',
      name: 'Transport & Carburant',
      nameDarija: 'Naql & Mazout',
      amount: 1200,
      isFixedCharge: false,
    },
    {
      categoryId: 'sante',
      name: 'Santé & Pharmacie',
      nameDarija: 'Se7a & Saydaliya',
      amount: 450,
      isFixedCharge: false,
    },
    {
      categoryId: 'loisirs',
      name: 'Loisirs & Sorties',
      nameDarija: 'Tarfih & Khourajat',
      amount: 1500,
      isFixedCharge: false,
    },
    {
      categoryId: 'epargne',
      name: 'Épargne mensuelle prévue',
      nameDarija: 'Tawfir ch-hari',
      amount: 2000,
      isFixedCharge: true,
    },
  ]);
  const [customExpenseName, setCustomExpenseName] = useState('');
  const [customExpenseAmount, setCustomExpenseAmount] = useState<string>('');

  // Sign In State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculs en temps réel
  const totalMonthlyIncome = incomes.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalMonthlyExpenses = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const netSavingsCapacity = totalMonthlyIncome - totalMonthlyExpenses;
  const savingsRate = totalMonthlyIncome > 0 ? Math.round((netSavingsCapacity / totalMonthlyIncome) * 100) : 0;

  // Handlers for Incomes
  const handleIncomeAmountChange = (id: string, value: number) => {
    setIncomes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, amount: isNaN(value) ? 0 : Math.max(0, value) } : item))
    );
  };

  const handleAddCustomIncome = () => {
    if (!customIncomeName.trim()) return;
    const amountVal = parseFloat(customIncomeAmount) || 0;
    const newId = `inc-custom-${Date.now()}`;
    setIncomes((prev) => [
      ...prev,
      {
        id: newId,
        name: customIncomeName.trim(),
        amount: amountVal,
        frequency: 'monthly',
        dayOfMonth: 1,
      },
    ]);
    setCustomIncomeName('');
    setCustomIncomeAmount('');
  };

  const handleRemoveIncome = (id: string) => {
    setIncomes((prev) => prev.filter((i) => i.id !== id));
  };

  // Handlers for Expenses
  const handleExpenseAmountChange = (categoryId: string, value: number) => {
    setExpenses((prev) =>
      prev.map((item) => (item.categoryId === categoryId ? { ...item, amount: isNaN(value) ? 0 : Math.max(0, value) } : item))
    );
  };

  const handleAddCustomExpense = () => {
    if (!customExpenseName.trim()) return;
    const amountVal = parseFloat(customExpenseAmount) || 0;
    const catId = `cat-user-${Date.now()}`;
    setExpenses((prev) => [
      ...prev,
      {
        categoryId: catId,
        name: customExpenseName.trim(),
        amount: amountVal,
        isFixedCharge: false,
      },
    ]);
    setCustomExpenseName('');
    setCustomExpenseAmount('');
  };

  const handleRemoveExpense = (categoryId: string) => {
    setExpenses((prev) => prev.filter((e) => e.categoryId !== categoryId));
  };

  // Form submission: Completing Registration
  const handleCompleteSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Veuillez renseigner votre nom complet.');
      setStep(1);
      return;
    }

    const newProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@felladina.local`,
      currency: selectedCurrency,
      initialBalance: Math.max(0, initialBalance),
      createdAt: new Date().toISOString(),
      incomes: incomes.filter((i) => i.amount > 0),
      expenses: expenses.filter((e) => e.amount > 0),
    };

    onRegisterSuccess(newProfile);
    onClose();
  };

  // Login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const found = savedProfiles.find(
      (p) => p.email.toLowerCase() === loginEmail.toLowerCase().trim() || p.name.toLowerCase() === loginEmail.toLowerCase().trim()
    );

    if (found) {
      onLoginSuccess(found);
      onClose();
    } else {
      setLoginError("Aucun profil correspondant trouvé avec cet identifiant. Créez un compte ci-dessus.");
    }
  };

  const handleSelectExistingProfile = (p: UserProfile) => {
    onLoginSuccess(p);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] dark:bg-[#1E1C18] border border-[#E3DDD1] dark:border-[#38332A] rounded-2xl shadow-2xl overflow-hidden my-6 transition-colors">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E2D6] dark:border-[#2E2B25] bg-[#F4EFE6] dark:bg-[#25221C]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#A24824] text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#2B2621] dark:text-[#F5F2EB]">
                {authMode === 'signup'
                  ? language === 'ar_ma'
                    ? 'Tasjil 7ssab jdidi f Felladina Finance'
                    : 'Créer mon compte & Démarrer'
                  : language === 'ar_ma'
                  ? 'Dkhoul l-7ssab dyalek'
                  : 'Connexion à Felladina Finance'}
              </h2>
              <p className="text-xs text-[#7A7164] dark:text-[#9A9182]">
                {authMode === 'signup'
                  ? 'Configurez vos revenus et charges pour calculer instantanément votre budget personnalisé'
                  : 'Accédez à votre espace budgétaire et vos données enregistrées'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8C8275] hover:text-[#2B2621] dark:hover:text-[#F2EFEA] hover:bg-[#EAE4D7] dark:hover:bg-[#343027] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Sign Up vs Sign In */}
        <div className="flex border-b border-[#E7E2D6] dark:border-[#2E2B25] bg-white dark:bg-[#1E1C18]">
          <button
            type="button"
            onClick={() => setAuthMode('signup')}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold text-center border-b-2 transition-all ${
              authMode === 'signup'
                ? 'border-[#A24824] text-[#A24824] bg-[#FAF4F0] dark:bg-[#2A211D]'
                : 'border-transparent text-[#7A7164] dark:text-[#8D8477] hover:text-[#2B2621] dark:hover:text-[#F5F2EB]'
            }`}
          >
            ✨ {language === 'ar_ma' ? 'Tasjil jdidi (Nouveau compte)' : 'Nouveau Compte (Inscription & Onboarding)'}
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('signin')}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold text-center border-b-2 transition-all ${
              authMode === 'signin'
                ? 'border-[#A24824] text-[#A24824] bg-[#FAF4F0] dark:bg-[#2A211D]'
                : 'border-transparent text-[#7A7164] dark:text-[#8D8477] hover:text-[#2B2621] dark:hover:text-[#F5F2EB]'
            }`}
          >
            🔑 {language === 'ar_ma' ? 'Dkhoul (Se connecter)' : 'Se connecter (Profils existants)'}
          </button>
        </div>

        {/* SIGN UP FLOW WITH STEP WIZARD */}
        {authMode === 'signup' && (
          <div>
            {/* Step Wizard Progress Pills */}
            <div className="px-6 pt-4 pb-2">
              <div className="flex items-center justify-between text-xs font-medium">
                {[
                  { s: 1, label: '1. Profil' },
                  { s: 2, label: '2. Mes Revenus' },
                  { s: 3, label: '3. Mes Charges' },
                  { s: 4, label: '4. Validation' },
                ].map((item) => (
                  <button
                    key={item.s}
                    type="button"
                    onClick={() => {
                      if (item.s === 1 || (item.s > 1 && name.trim())) {
                        setStep(item.s as any);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all ${
                      step === item.s
                        ? 'bg-[#A24824] text-white font-bold shadow-xs'
                        : step > item.s
                        ? 'bg-[#EAE4D7] dark:bg-[#2D2923] text-[#3B6B55] dark:text-[#529E7D] font-semibold'
                        : 'text-[#8C8275] dark:text-[#746C60]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {step > item.s && <CheckCircle2 className="w-3.5 h-3.5 inline text-[#3B6B55]" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              {/* STEP 1: Identification & Core Preferences */}
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  {/* Google 1-Click Connection */}
                  <div className="p-4 bg-white dark:bg-[#25221C] rounded-xl border border-[#DFD8C9] dark:border-[#38332A] space-y-2">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isGoogleLoading}
                      className="w-full py-2.5 px-4 bg-white dark:bg-[#1E1C18] hover:bg-[#F9F7F2] dark:hover:bg-[#2C2822] text-[#2B2621] dark:text-[#F2EFEA] border border-[#D5CDBE] dark:border-[#423C32] rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xs hover:shadow transition-all cursor-pointer"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>
                        {isGoogleLoading
                          ? 'Connexion Google en cours...'
                          : language === 'ar_ma'
                          ? 'Dkhol b compte Google / Gmail'
                          : 'Continuer avec Google (Compte Gmail)'}
                      </span>
                    </button>
                    {googleError && (
                      <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                        {googleError}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-[#7A7164] dark:text-[#9A9182]">
                      <span>Authentification Firebase sécurisée</span>
                      <span className="font-mono text-[#3B6B55] dark:text-[#4AA37B]">1-Clic instantané</span>
                    </div>
                  </div>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-[#E7E2D6] dark:border-[#38332A]" />
                    <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-[#8C8275] dark:text-[#887F72]">
                      {language === 'ar_ma' ? 'Aw sjel manuel' : 'Ou inscription manuelle'}
                    </span>
                    <div className="flex-grow border-t border-[#E7E2D6] dark:border-[#38332A]" />
                  </div>

                  <div className="p-3.5 bg-[#F2EDE2] dark:bg-[#25221C] rounded-xl border border-[#DFD8C9] dark:border-[#38332A] text-xs text-[#5C5346] dark:text-[#B5AD9F]">
                    👋 Bienvenue sur <strong>Felladina Finance</strong>. En renseignant vos revenus et vos dépenses prévues, l&apos;application calcule en temps réel votre reste à vivre, vos taux d&apos;épargne et vos prévisions budgétaires sur 3 mois.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#4A4237] dark:text-[#D5CFC5] mb-1">
                        Nom complet ou Prénom *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#8C8275] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="ex: Sarah Bennani ou Amine Tazi"
                          className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#25221C] border border-[#D5CDBE] dark:border-[#3D382F] rounded-lg text-sm text-[#2B2621] dark:text-[#F2EFEA] focus:outline-none focus:ring-2 focus:ring-[#A24824]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#4A4237] dark:text-[#D5CFC5] mb-1">
                        Email ou Identifiant
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#8C8275] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="sarah@example.com"
                          className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#25221C] border border-[#D5CDBE] dark:border-[#3D382F] rounded-lg text-sm text-[#2B2621] dark:text-[#F2EFEA] focus:outline-none focus:ring-2 focus:ring-[#A24824]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#4A4237] dark:text-[#D5CFC5] mb-1">
                        Mot de passe (Protection locale)
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#8C8275] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-9 py-2 bg-white dark:bg-[#25221C] border border-[#D5CDBE] dark:border-[#3D382F] rounded-lg text-sm text-[#2B2621] dark:text-[#F2EFEA] focus:outline-none focus:ring-2 focus:ring-[#A24824]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C8275] hover:text-[#2B2621]"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#4A4237] dark:text-[#D5CFC5] mb-1">
                        Devise de compte préférée
                      </label>
                      <select
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value as Currency)}
                        className="w-full px-3 py-2 bg-white dark:bg-[#25221C] border border-[#D5CDBE] dark:border-[#3D382F] rounded-lg text-sm text-[#2B2621] dark:text-[#F2EFEA] focus:outline-none focus:ring-2 focus:ring-[#A24824]"
                      >
                        <option value="MAD">MAD - Dirham Marocain (DH)</option>
                        <option value="EUR">EUR - Euro (€)</option>
                        <option value="USD">USD - Dollar US ($)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A4237] dark:text-[#D5CFC5] mb-1">
                      Solde initial disponible (Comptes bancaires + Espèces actuels)
                    </label>
                    <div className="relative">
                      <Wallet className="w-4 h-4 text-[#8C8275] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={initialBalance || ''}
                        onChange={(e) => setInitialBalance(parseFloat(e.target.value) || 0)}
                        className="w-full pl-9 pr-14 py-2 bg-white dark:bg-[#25221C] border border-[#D5CDBE] dark:border-[#3D382F] rounded-lg text-sm font-semibold text-[#2B2621] dark:text-[#F2EFEA] focus:outline-none focus:ring-2 focus:ring-[#A24824]"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8C8275]">
                        {selectedCurrency}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#8C8275] mt-1 block">
                      Ce solde sert de base de départ pour votre cascade de trésorerie (Waterfall) et votre coussin de sécurité.
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 2: Incomes Configuration */}
              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#2B2621] dark:text-[#F5F2EB] flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-[#3B6B55]" />
                        Vos sources de revenus mensuelles
                      </h3>
                      <p className="text-xs text-[#7A7164] dark:text-[#9A9182]">
                        Renseignez vos entrées réelles pour calibrer votre budget
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-[#7A7164] uppercase block">Total Revenus</span>
                      <span className="text-base font-bold text-[#3B6B55] dark:text-[#4AA37B]">
                        {totalMonthlyIncome.toLocaleString('fr-FR')} {selectedCurrency}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {incomes.map((inc) => (
                      <div
                        key={inc.id}
                        className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-[#25221C] border border-[#E0D9CB] dark:border-[#38332A] rounded-xl shadow-2xs"
                      >
                        <div className="flex-1">
                          <span className="text-xs font-semibold text-[#2B2621] dark:text-[#F2EFEA] block">
                            {inc.name}
                          </span>
                          <span className="text-[10px] text-[#8C8275]">
                            Fréquence mensuelle · Prélèvement / Versement le {inc.dayOfMonth || 28} du mois
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative w-32">
                            <input
                              type="number"
                              min="0"
                              step="100"
                              value={inc.amount}
                              onChange={(e) => handleIncomeAmountChange(inc.id, parseFloat(e.target.value))}
                              className="w-full text-right px-2 py-1 pr-9 bg-[#F9F7F2] dark:bg-[#1E1C18] border border-[#D5CDBE] dark:border-[#3D382F] rounded-lg text-xs font-bold text-[#2B2621] dark:text-[#F2EFEA] focus:ring-1 focus:ring-[#A24824]"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-[#8C8275]">
                              {selectedCurrency}
                            </span>
                          </div>
                          {incomes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveIncome(inc.id)}
                              className="p-1 text-[#B85338] hover:text-red-700 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Custom Income Source */}
                  <div className="p-3 bg-[#F2EDE2]/60 dark:bg-[#25221C]/60 border border-dashed border-[#D5CDBE] dark:border-[#3D382F] rounded-xl flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      placeholder="Autre source (ex: Dividendes, Loyer reçu...)"
                      value={customIncomeName}
                      onChange={(e) => setCustomIncomeName(e.target.value)}
                      className="flex-1 min-w-[160px] px-2.5 py-1.5 text-xs bg-white dark:bg-[#1E1C18] border border-[#D5CDBE] dark:border-[#3D382F] rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder={`Montant (${selectedCurrency})`}
                      value={customIncomeAmount}
                      onChange={(e) => setCustomIncomeAmount(e.target.value)}
                      className="w-28 px-2.5 py-1.5 text-xs bg-white dark:bg-[#1E1C18] border border-[#D5CDBE] dark:border-[#3D382F] rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomIncome}
                      className="px-3 py-1.5 bg-[#3B6B55] hover:bg-[#2E5543] text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Expenses & Budgets Configuration */}
              {step === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#2B2621] dark:text-[#F5F2EB] flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4 text-[#A24824]" />
                        Vos dépenses mensuelles & enveloppes
                      </h3>
                      <p className="text-xs text-[#7A7164] dark:text-[#9A9182]">
                        Ajustez vos plafonds pour chaque grand poste budgétaire
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-[#7A7164] uppercase block">Total Charges</span>
                      <span className="text-base font-bold text-[#A24824] dark:text-[#E8734C]">
                        {totalMonthlyExpenses.toLocaleString('fr-FR')} {selectedCurrency}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {expenses.map((exp) => (
                      <div
                        key={exp.categoryId}
                        className="flex items-center justify-between gap-2 p-2.5 bg-white dark:bg-[#25221C] border border-[#E0D9CB] dark:border-[#38332A] rounded-xl shadow-2xs"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {exp.categoryId === 'logement' && <Home className="w-4 h-4 text-[#A24824] shrink-0" />}
                          {exp.categoryId === 'alimentation' && <ShoppingBag className="w-4 h-4 text-[#3B6B55] shrink-0" />}
                          {exp.categoryId === 'factures' && <Zap className="w-4 h-4 text-[#C97A1E] shrink-0" />}
                          {exp.categoryId === 'transport' && <Car className="w-4 h-4 text-[#38668D] shrink-0" />}
                          {exp.categoryId === 'sante' && <HeartPulse className="w-4 h-4 text-[#9C384D] shrink-0" />}
                          {exp.categoryId === 'loisirs' && <Coffee className="w-4 h-4 text-[#7C5A3E] shrink-0" />}
                          {exp.categoryId === 'epargne' && <PiggyBank className="w-4 h-4 text-[#2E7A5A] shrink-0" />}
                          {!['logement', 'alimentation', 'factures', 'transport', 'sante', 'loisirs', 'epargne'].includes(
                            exp.categoryId
                          ) && <DollarSign className="w-4 h-4 text-[#7A7164] shrink-0" />}

                          <div className="truncate">
                            <span className="text-xs font-semibold text-[#2B2621] dark:text-[#F2EFEA] block truncate">
                              {exp.name}
                            </span>
                            <span className="text-[10px] text-[#8C8275]">
                              {exp.isFixedCharge ? 'Charge fixe' : 'Enveloppe variable'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="relative w-24">
                            <input
                              type="number"
                              min="0"
                              step="50"
                              value={exp.amount}
                              onChange={(e) => handleExpenseAmountChange(exp.categoryId, parseFloat(e.target.value))}
                              className="w-full text-right px-2 py-1 pr-7 bg-[#F9F7F2] dark:bg-[#1E1C18] border border-[#D5CDBE] dark:border-[#3D382F] rounded-lg text-xs font-bold text-[#2B2621] dark:text-[#F2EFEA] focus:ring-1 focus:ring-[#A24824]"
                            />
                            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-semibold text-[#8C8275]">
                              {selectedCurrency === 'MAD' ? 'DH' : selectedCurrency}
                            </span>
                          </div>
                          {expenses.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveExpense(exp.categoryId)}
                              className="p-1 text-[#8C8275] hover:text-red-600 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Custom Expense Category */}
                  <div className="p-3 bg-[#F2EDE2]/60 dark:bg-[#25221C]/60 border border-dashed border-[#D5CDBE] dark:border-[#3D382F] rounded-xl flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      placeholder="Autre charge (ex: Scolarité, Animaux, Abonnement Salle...)"
                      value={customExpenseName}
                      onChange={(e) => setCustomExpenseName(e.target.value)}
                      className="flex-1 min-w-[160px] px-2.5 py-1.5 text-xs bg-white dark:bg-[#1E1C18] border border-[#D5CDBE] dark:border-[#3D382F] rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder={`Montant (${selectedCurrency})`}
                      value={customExpenseAmount}
                      onChange={(e) => setCustomExpenseAmount(e.target.value)}
                      className="w-28 px-2.5 py-1.5 text-xs bg-white dark:bg-[#1E1C18] border border-[#D5CDBE] dark:border-[#3D382F] rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomExpense}
                      className="px-3 py-1.5 bg-[#A24824] hover:bg-[#8F3E1E] text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Summary & Instant Calculation Preview */}
              {step === 4 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 bg-white dark:bg-[#25221C] border border-[#E3DDD1] dark:border-[#38332A] rounded-xl shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-[#EAE4D7] dark:border-[#332E27] pb-3">
                      <div>
                        <span className="text-[11px] text-[#7A7164] uppercase block">Profil utilisateur</span>
                        <span className="text-base font-bold text-[#2B2621] dark:text-[#F5F2EB]">{name}</span>
                        <span className="text-xs text-[#8C8275] block">{email}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-[#7A7164] uppercase block">Réserve de départ</span>
                        <span className="text-sm font-bold text-[#2B2621] dark:text-[#F5F2EB]">
                          {initialBalance.toLocaleString('fr-FR')} {selectedCurrency}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                      <div className="p-2.5 bg-[#F9F7F2] dark:bg-[#1E1C18] rounded-lg border border-[#E7E2D6] dark:border-[#332E27]">
                        <span className="text-[10px] text-[#7A7164] uppercase block">Entrées / Mois</span>
                        <span className="text-sm font-bold text-[#3B6B55] dark:text-[#4AA37B]">
                          +{totalMonthlyIncome.toLocaleString('fr-FR')} {selectedCurrency}
                        </span>
                      </div>
                      <div className="p-2.5 bg-[#F9F7F2] dark:bg-[#1E1C18] rounded-lg border border-[#E7E2D6] dark:border-[#332E27]">
                        <span className="text-[10px] text-[#7A7164] uppercase block">Sorties Prévues</span>
                        <span className="text-sm font-bold text-[#A24824] dark:text-[#E8734C]">
                          -{totalMonthlyExpenses.toLocaleString('fr-FR')} {selectedCurrency}
                        </span>
                      </div>
                      <div className="p-2.5 bg-[#F9F7F2] dark:bg-[#1E1C18] rounded-lg border border-[#E7E2D6] dark:border-[#332E27]">
                        <span className="text-[10px] text-[#7A7164] uppercase block">Capacité d&apos;Épargne</span>
                        <span
                          className={`text-sm font-bold ${
                            netSavingsCapacity >= 0
                              ? 'text-[#3B6B55] dark:text-[#4AA37B]'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {netSavingsCapacity >= 0 ? '+' : ''}
                          {netSavingsCapacity.toLocaleString('fr-FR')} {selectedCurrency}
                        </span>
                      </div>
                      <div className="p-2.5 bg-[#F9F7F2] dark:bg-[#1E1C18] rounded-lg border border-[#E7E2D6] dark:border-[#332E27]">
                        <span className="text-[10px] text-[#7A7164] uppercase block">Taux d&apos;Épargne</span>
                        <span className="text-sm font-bold text-[#2B2621] dark:text-[#F5F2EB]">
                          {savingsRate}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#E8F1EC] dark:bg-[#1D2B24] border border-[#C5DDD0] dark:border-[#2D4539] rounded-xl text-xs text-[#26533F] dark:text-[#78C29D] space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <TrendingUp className="w-4 h-4" />
                      Prêt à calculer votre budget sur mesure !
                    </div>
                    <p>
                      Dès confirmation, Felladina Finance injecte vos {incomes.length} sources de revenus et vos {expenses.length} postes budgétaires. Tous vos graphiques de trésorerie, alertes de dépassement, calendrier financier et prévisions prédictives sur 3 mois seront immédiatement basés sur vos vrais chiffres.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#E7E2D6] dark:border-[#2E2B25] bg-[#F4EFE6] dark:bg-[#25221C]">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((step - 1) as any)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#554C40] dark:text-[#D5CFC5] hover:bg-[#EAE4D7] dark:hover:bg-[#343027] rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Précédent
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                {step === 1 && name.trim() && (
                  <button
                    type="button"
                    onClick={handleCompleteSignUp}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#2C2923] border border-[#DDD6C8] dark:border-[#3E382E] hover:border-[#A24824] text-[#A24824] dark:text-[#E8734C] text-xs font-semibold rounded-lg transition-all"
                    title="Créer le compte directement et commencer à saisir les transactions"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Démarrage immédiat (vide)</span>
                  </button>
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (step === 1 && !name.trim()) {
                        alert('Veuillez renseigner votre nom complet.');
                        return;
                      }
                      setStep((step + 1) as any);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#A24824] hover:bg-[#8F3E1E] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                  >
                    <span>Suivant : {step === 1 ? 'Mes Revenus' : step === 2 ? 'Mes Dépenses' : 'Vérification'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCompleteSignUp}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#3B6B55] hover:bg-[#2E5543] text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-[1.01]"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Commencer à calculer mon budget</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SIGN IN FLOW */}
        {authMode === 'signin' && (
          <div className="p-6 space-y-6">
            {/* Google 1-Click Connect Button */}
            <div className="p-4 bg-[#FAF7F2] dark:bg-[#1E1C18] border border-[#E7E2D6] dark:border-[#332E27] rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7A7164] dark:text-[#9A9182]">
                  Connexion Rapide Google
                </span>
                <span className="text-[10px] bg-[#3B6B55]/10 text-[#3B6B55] dark:text-[#4AA37B] font-semibold px-2 py-0.5 rounded-full">
                  Firebase Auth
                </span>
              </div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white dark:bg-[#25221C] hover:bg-[#F2EDE2] dark:hover:bg-[#2C2720] border border-[#D5CDBE] dark:border-[#3D382F] rounded-xl text-sm font-semibold text-[#2B2621] dark:text-[#F2EFEA] shadow-xs transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#A24824]" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.28 21.44 7.35 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.28 2.56 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                    />
                  </svg>
                )}
                <span>
                  {isGoogleLoading
                    ? 'Connexion via Google...'
                    : 'Se connecter avec Google (Compte Gmail)'}
                </span>
              </button>
              {googleError && (
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                  {googleError}
                </p>
              )}
            </div>

            <div className="relative flex py-0 items-center">
              <div className="flex-grow border-t border-[#E7E2D6] dark:border-[#38332A]" />
              <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-[#8C8275] dark:text-[#887F72]">
                Ou via vos profils locaux
              </span>
              <div className="flex-grow border-t border-[#E7E2D6] dark:border-[#38332A]" />
            </div>

            {savedProfiles && savedProfiles.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7A7164] block">
                  Profils enregistrés sur cet appareil
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedProfiles.map((p) => {
                    const isActive = p.id === activeProfileId;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectExistingProfile(p)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                          isActive
                            ? 'bg-[#FAF4F0] dark:bg-[#2A211D] border-[#A24824] ring-1 ring-[#A24824]'
                            : 'bg-white dark:bg-[#25221C] border-[#E0D9CB] dark:border-[#38332A] hover:border-[#A24824]/50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#A24824]/10 text-[#A24824] font-bold text-xs flex items-center justify-center">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[#2B2621] dark:text-[#F2EFEA] block">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-[#8C8275]">{p.email}</span>
                          </div>
                        </div>
                        {isActive && (
                          <span className="text-[10px] font-bold text-[#A24824] bg-[#F2DDD4] px-1.5 py-0.5 rounded">
                            Actif
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="border-t border-[#EAE4D7] dark:border-[#332E27] pt-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7A7164] block mb-3">
                  Ou connectez-vous par identifiant
                </span>
                {loginError && (
                  <div className="mb-3 p-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs rounded-lg">
                    {loginError}
                  </div>
                )}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A4237] dark:text-[#D5CFC5] mb-1">
                      Email ou Nom de compte
                    </label>
                    <input
                      type="text"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="sarah@example.com ou Sarah Bennani"
                      className="w-full px-3 py-2 bg-white dark:bg-[#25221C] border border-[#D5CDBE] dark:border-[#3D382F] rounded-lg text-sm text-[#2B2621] dark:text-[#F2EFEA]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A4237] dark:text-[#D5CFC5] mb-1">
                      Mot de passe
                    </label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-white dark:bg-[#25221C] border border-[#D5CDBE] dark:border-[#3D382F] rounded-lg text-sm text-[#2B2621] dark:text-[#F2EFEA]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className="text-xs text-[#A24824] hover:underline font-semibold"
                >
                  Pas encore de compte ? S&apos;inscrire ici
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#A24824] hover:bg-[#8F3E1E] text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Se connecter
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

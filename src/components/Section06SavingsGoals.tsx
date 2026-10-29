import React, { useState, useMemo } from 'react';
import { SavingsGoal, Currency, Language, Transaction, CategoryBudget } from '../types';
import {
  Target,
  Plus,
  PiggyBank,
  CheckCircle2,
  Calendar,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Home,
  Plane,
  Car,
  GraduationCap,
  Heart,
  Briefcase,
  Sliders,
  Edit2,
  Trash2,
  ArrowRight,
  Info,
  Clock,
  Layers,
  Lock,
} from 'lucide-react';

interface Section06SavingsGoalsProps {
  goals: SavingsGoal[];
  transactions: Transaction[];
  categories: CategoryBudget[];
  currency: Currency;
  language: Language;
  onOpenAddGoalModal: () => void;
  onOpenEditGoalModal: (goal: SavingsGoal) => void;
  onOpenAllocateSurplusModal: (goal: SavingsGoal) => void;
  onDeleteGoal: (goalId: string) => void;
  onQuickAllocate: (goalId: string, amount: number) => void;
}

export const Section06SavingsGoals: React.FC<Section06SavingsGoalsProps> = ({
  goals,
  transactions,
  categories,
  currency,
  language,
  onOpenAddGoalModal,
  onOpenEditGoalModal,
  onOpenAllocateSurplusModal,
  onDeleteGoal,
  onQuickAllocate,
}) => {
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'active' | 'completed'>('all');
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatorExtraSurplus, setSimulatorExtraSurplus] = useState<number>(500);

  const currencySymbol = currency === 'MAD' ? 'DH' : currency === 'EUR' ? '€' : '$';

  // Calculate monthly surplus from transactions (average or current month)
  const { monthlySurplus, totalIncome, totalExpense } = useMemo(() => {
    const incomeTotal = transactions.filter((t) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expenseTotal = transactions.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

    // Estimate based on quarterly or monthly window (assuming active dataset spans approx 3 months)
    const monthlyInc = incomeTotal > 0 ? Math.round(incomeTotal / 3) : 28500;
    const monthlyExp = expenseTotal > 0 ? Math.round(expenseTotal / 3) : 21650;
    const surplus = Math.max(0, monthlyInc - monthlyExp);

    return {
      totalIncome: incomeTotal,
      totalExpense: expenseTotal,
      monthlySurplus: surplus,
    };
  }, [transactions]);

  // Aggregate goals stats
  const totalTargetAmount = useMemo(() => goals.reduce((acc, g) => acc + g.targetAmount, 0), [goals]);
  const totalSavedAmount = useMemo(() => goals.reduce((acc, g) => acc + g.currentAmount, 0), [goals]);
  const totalMonthlyAllocation = useMemo(() => goals.reduce((acc, g) => acc + g.monthlyAllocation, 0), [goals]);

  const globalAttainmentPct = totalTargetAmount > 0 ? Math.min(100, Math.round((totalSavedAmount / totalTargetAmount) * 100)) : 0;
  const unallocatedSurplus = Math.max(0, monthlySurplus - totalMonthlyAllocation);
  const isAllocationOverSurplus = totalMonthlyAllocation > monthlySurplus && monthlySurplus > 0;

  // Filtered goals
  const filteredGoals = useMemo(() => {
    return goals.filter((g) => {
      const isCompleted = g.currentAmount >= g.targetAmount;
      if (filterPriority === 'high') return g.priority === 'high';
      if (filterPriority === 'completed') return isCompleted;
      if (filterPriority === 'active') return !isCompleted;
      return true;
    });
  }, [goals, filterPriority]);

  // Helper icon renderer
  const renderCategoryIcon = (category: string) => {
    switch (category) {
      case 'emergency':
        return <ShieldCheck className="w-4 h-4 text-[#3B6B55] dark:text-[#52A36F]" />;
      case 'real_estate':
        return <Home className="w-4 h-4 text-[#A24824] dark:text-[#E8734C]" />;
      case 'travel':
        return <Plane className="w-4 h-4 text-[#5B7B94] dark:text-[#7D9D8B]" />;
      case 'vehicle':
        return <Car className="w-4 h-4 text-[#8A5D3B] dark:text-[#D97706]" />;
      case 'investment':
        return <TrendingUp className="w-4 h-4 text-[#2D6A4F] dark:text-[#4ADE80]" />;
      case 'education':
        return <GraduationCap className="w-4 h-4 text-[#6B46C1] dark:text-[#A78BFA]" />;
      case 'family':
        return <Heart className="w-4 h-4 text-[#D97706] dark:text-[#FBBF24]" />;
      default:
        return <Briefcase className="w-4 h-4 text-[#A24824] dark:text-[#E8734C]" />;
    }
  };

  return (
    <section id="savings-goals-section" className="mb-12 pt-8 border-t border-[#E5E0D5] dark:border-[#2D2A24] transition-colors scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#A24824] dark:text-[#E8734C]">
              {language === 'ar_ma' ? '06 / AHDAF D L-ITTIKHAR W L-MASHARI3' : '06 / OBJECTIFS D’ÉPARGNE & ALLOCATION DU SURPLUS'}
            </span>
            <span className="text-xs text-[#8A8174]">•</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#3B6B55] dark:text-[#52A36F]">
              <PiggyBank className="w-3.5 h-3.5" />
              <span>{language === 'ar_ma' ? 'Projets Futurs' : 'Projets d’avenir & Trésorerie'}</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#201C18] dark:text-[#F2EFEA] tracking-tight">
            {language === 'ar_ma'
              ? 'Tawzi3 l-Fadl l-Chahri 3la l-Ahdaf'
              : 'Objectifs d’Épargne & Projets Futurs'}
          </h2>
          <p className="text-xs sm:text-sm text-[#736B5E] dark:text-[#9F9688] mt-1 max-w-3xl leading-relaxed">
            {language === 'ar_ma'
              ? 'Kheyyer les projets li baghi twessal lihom (apport sakan, sandouq tawari2, safar), w 7eddéd chhal katkhlli lihom men l-fadl d ch-har dyalk m3a suivi visuel b progress bar.'
              : 'Définissez vos projets financiers, allouez une part de votre surplus mensuel disponible et visualisez en temps réel l’avancement et la date estimée d’atteinte.'}
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSimulator(!showSimulator)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              showSimulator
                ? 'bg-[#FAF0E6] dark:bg-[#34241D] text-[#A24824] dark:text-[#E8734C] border-[#A24824]'
                : 'bg-white dark:bg-[#26241F] border-[#D5CDBC] dark:border-[#3D382F] text-[#4A4237] dark:text-[#E8E4DC] hover:border-[#A24824]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{language === 'ar_ma' ? 'Simulateur' : 'Simulateur de Surplus'}</span>
          </button>

          <button
            onClick={onOpenAddGoalModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#A24824] hover:bg-[#8F3E1E] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'ar_ma' ? '+ Zid Hadaf' : '+ Nouvel Objectif'}</span>
          </button>
        </div>
      </div>

      {/* Master Surplus & Savings Health Card */}
      <div className="bg-white dark:bg-[#1E1D19] rounded-xl border border-[#E5E0D5] dark:border-[#312E28] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] mb-6 transition-colors">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-5 border-b border-[#EBE6DC] dark:border-[#312E28]">
          {/* KPI 1: Monthly Surplus */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7C7365] dark:text-[#9A9184] block mb-1">
              Surplus Mensuel Disponible
            </span>
            <div className="text-xl sm:text-2xl font-mono font-bold text-[#2E7D32] dark:text-[#4ADE80]">
              +{Math.round(monthlySurplus).toLocaleString('fr-FR')}{' '}
              <span className="text-xs font-sans font-normal text-[#7C7365] dark:text-[#9A9184]">
                {currencySymbol}/mois
              </span>
            </div>
            <p className="text-[11px] text-[#8C8375] dark:text-[#887F72] mt-0.5">
              Revenus nets moins charges réelles
            </p>
          </div>

          {/* KPI 2: Total Saved So Far */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7C7365] dark:text-[#9A9184] block mb-1">
              Total Épargné Actuel
            </span>
            <div className="text-xl sm:text-2xl font-mono font-bold text-[#25201B] dark:text-[#F2EFEA]">
              {Math.round(totalSavedAmount).toLocaleString('fr-FR')}{' '}
              <span className="text-xs font-sans font-normal text-[#7C7365] dark:text-[#9A9184]">
                {currencySymbol}
              </span>
            </div>
            <p className="text-[11px] text-[#8C8375] dark:text-[#887F72] mt-0.5">
              Cumulé sur l’ensemble des {goals.length} projets
            </p>
          </div>

          {/* KPI 3: Total Target */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7C7365] dark:text-[#9A9184] block mb-1">
              Cible Consolidée
            </span>
            <div className="text-xl sm:text-2xl font-mono font-bold text-[#A24824] dark:text-[#E8734C]">
              {Math.round(totalTargetAmount).toLocaleString('fr-FR')}{' '}
              <span className="text-xs font-sans font-normal text-[#7C7365] dark:text-[#9A9184]">
                {currencySymbol}
              </span>
            </div>
            <p className="text-[11px] text-[#8C8375] dark:text-[#887F72] mt-0.5">
              Reste : {Math.max(0, Math.round(totalTargetAmount - totalSavedAmount)).toLocaleString('fr-FR')} {currencySymbol}
            </p>
          </div>

          {/* KPI 4: Monthly Allocation */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7C7365] dark:text-[#9A9184] block mb-1">
              Surplus Alloué ce Mois
            </span>
            <div className="text-xl sm:text-2xl font-mono font-bold text-[#3B6B55] dark:text-[#52A36F]">
              {Math.round(totalMonthlyAllocation).toLocaleString('fr-FR')}{' '}
              <span className="text-xs font-sans font-normal text-[#7C7365] dark:text-[#9A9184]">
                {currencySymbol}/mois
              </span>
            </div>
            <p className="text-[11px] text-[#8C8375] dark:text-[#887F72] mt-0.5">
              {isAllocationOverSurplus ? (
                <span className="text-[#C62828] dark:text-[#EF4444] font-semibold">
                  ⚠️ Dépasse le surplus mensuel
                </span>
              ) : (
                <span>Reste disponible : +{Math.round(unallocatedSurplus).toLocaleString('fr-FR')} {currencySymbol}</span>
              )}
            </p>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs mb-2">
            <span className="font-semibold text-[#4A4237] dark:text-[#DDD6C8] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#A24824]" />
              <span>Avancement Global des Projets d’Épargne :</span>
              <span className="font-mono font-bold text-[#A24824] dark:text-[#E8734C]">
                {globalAttainmentPct}%
              </span>
            </span>
            <span className="text-[11px] text-[#7C7365] dark:text-[#9A9184]">
              {Math.round(totalSavedAmount).toLocaleString('fr-FR')} {currencySymbol} mobilisés sur{' '}
              {Math.round(totalTargetAmount).toLocaleString('fr-FR')} {currencySymbol}
            </span>
          </div>

          <div className="w-full bg-[#E5DFD3] dark:bg-[#343028] h-3 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-linear-to-r from-[#A24824] via-[#C96843] to-[#3B6B55] h-full rounded-full transition-all duration-500 shadow-2xs"
              style={{ width: `${globalAttainmentPct}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-[#8C8375] dark:text-[#887F72] font-mono mt-1.5 px-0.5">
            <span>0%</span>
            <span>25%</span>
            <span>50% (Mi-parcours)</span>
            <span>75%</span>
            <span>100% (Cible Atteinte)</span>
          </div>
        </div>
      </div>

      {/* Simulator Drawer (Optional Expandable) */}
      {showSimulator && (
        <div className="mb-6 p-5 bg-[#FAF8F5] dark:bg-[#24221E] border border-[#E5E0D5] dark:border-[#383329] rounded-xl transition-all animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#A24824]" />
              <h3 className="text-sm font-semibold text-[#25201B] dark:text-[#F2EFEA]">
                Simulateur d’Accélération : Mobiliser Plus de Surplus
              </h3>
            </div>
            <button
              onClick={() => setShowSimulator(false)}
              className="text-xs text-[#7C7365] hover:text-[#25201B] dark:hover:text-[#F2EFEA]"
            >
              Fermer
            </button>
          </div>

          <p className="text-xs text-[#736B5E] dark:text-[#9F9688] mb-4">
            Ajustez le curseur pour voir l’impact d’une injection mensuelle supplémentaire issue de votre surplus disponible ({Math.round(unallocatedSurplus).toLocaleString('fr-FR')} {currencySymbol} restants non affectés).
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:flex-1">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[#4A4237] dark:text-[#DDD6C8]">Effort mensuel supplémentaire :</span>
                <span className="font-mono text-[#A24824] dark:text-[#E8734C]">
                  +{simulatorExtraSurplus.toLocaleString('fr-FR')} {currencySymbol}/mois
                </span>
              </div>
              <input
                type="range"
                min="100"
                max={Math.max(2000, Math.round(monthlySurplus))}
                step="100"
                value={simulatorExtraSurplus}
                onChange={(e) => setSimulatorExtraSurplus(Number(e.target.value))}
                className="w-full accent-[#A24824] cursor-pointer"
              />
            </div>

            <div className="bg-white dark:bg-[#1E1D19] p-3 rounded-lg border border-[#E0D9CB] dark:border-[#353127] text-xs shrink-0 w-full sm:w-auto">
              <span className="text-[11px] text-[#7C7365] dark:text-[#9A9184] block">Gain estimé sur les projets :</span>
              <span className="font-semibold text-[#2E7D32] dark:text-[#4ADE80]">
                Objectifs atteints ~{Math.max(1, Math.round((simulatorExtraSurplus / (totalMonthlyAllocation || 1000)) * 6))} mois plus vite !
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-1.5 p-1 bg-[#EBE6DC] dark:bg-[#2C2923] rounded-lg text-xs font-medium">
          <button
            onClick={() => setFilterPriority('all')}
            className={`px-3 py-1 rounded-md transition-all ${
              filterPriority === 'all'
                ? 'bg-white dark:bg-[#38342D] text-[#2B2621] dark:text-[#F5F2EB] shadow-2xs font-semibold'
                : 'text-[#6A6052] dark:text-[#9A9184]'
            }`}
          >
            Tous les projets ({goals.length})
          </button>
          <button
            onClick={() => setFilterPriority('high')}
            className={`px-3 py-1 rounded-md transition-all ${
              filterPriority === 'high'
                ? 'bg-white dark:bg-[#38342D] text-[#A24824] dark:text-[#E8734C] shadow-2xs font-semibold'
                : 'text-[#6A6052] dark:text-[#9A9184]'
            }`}
          >
            Prioritaires ({goals.filter((g) => g.priority === 'high').length})
          </button>
          <button
            onClick={() => setFilterPriority('active')}
            className={`px-3 py-1 rounded-md transition-all ${
              filterPriority === 'active'
                ? 'bg-white dark:bg-[#38342D] text-[#3B6B55] dark:text-[#52A36F] shadow-2xs font-semibold'
                : 'text-[#6A6052] dark:text-[#9A9184]'
            }`}
          >
            En cours ({goals.filter((g) => g.currentAmount < g.targetAmount).length})
          </button>
          <button
            onClick={() => setFilterPriority('completed')}
            className={`px-3 py-1 rounded-md transition-all ${
              filterPriority === 'completed'
                ? 'bg-white dark:bg-[#38342D] text-[#2E7D32] dark:text-[#4ADE80] shadow-2xs font-semibold'
                : 'text-[#6A6052] dark:text-[#9A9184]'
            }`}
          >
            Atteints ({goals.filter((g) => g.currentAmount >= g.targetAmount).length})
          </button>
        </div>

        <span className="text-xs text-[#7C7365] dark:text-[#9A9184]">
          {filteredGoals.length} objectif{filteredGoals.length > 1 ? 's' : ''} affiché{filteredGoals.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Goals Cards Grid */}
      {filteredGoals.length === 0 ? (
        <div className="bg-white dark:bg-[#1E1D19] rounded-xl border border-[#E5E0D5] dark:border-[#312E28] p-8 text-center max-w-md mx-auto">
          <div className="w-10 h-10 rounded-full bg-[#FAF0E6] dark:bg-[#34241D] text-[#A24824] dark:text-[#E8734C] flex items-center justify-center mx-auto mb-3">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-base text-[#25201B] dark:text-[#F2EFEA] mb-1">
            Aucun projet dans cette vue
          </h3>
          <p className="text-xs text-[#7C7365] dark:text-[#9A9184] mb-4">
            Définissez votre premier objectif d’épargne pour commencer à allouer votre surplus mensuel.
          </p>
          <button
            onClick={onOpenAddGoalModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#A24824] text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Créer un objectif</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map((goal) => {
            const progressPct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
            const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
            const isCompleted = goal.currentAmount >= goal.targetAmount;

            // Calculate months to reach goal at current monthly allocation
            const monthsToGoal =
              goal.monthlyAllocation > 0 && remainingAmount > 0
                ? Math.ceil(remainingAmount / goal.monthlyAllocation)
                : 0;

            return (
              <div
                key={goal.id}
                className="bg-white dark:bg-[#1E1D19] border border-[#E5E0D5] dark:border-[#312E28] hover:border-[#D5CDBC] dark:hover:border-[#484236] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Category, Priority, and Controls */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-[#FAF8F5] dark:bg-[#27241F] border border-[#E8E3D7] dark:border-[#3A352B] flex items-center justify-center shrink-0">
                        {renderCategoryIcon(goal.category)}
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-sm text-[#25201B] dark:text-[#F2EFEA] leading-snug">
                          {goal.name}
                        </h3>
                        {goal.nameDarija && (
                          <span className="text-[11px] text-[#8C8375] dark:text-[#887F72]">
                            {goal.nameDarija}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Priority Tag */}
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          goal.priority === 'high'
                            ? 'bg-[#FAF0E6] dark:bg-[#3D251D] text-[#A24824] dark:text-[#E8734C]'
                            : goal.priority === 'medium'
                            ? 'bg-[#FFFBEB] dark:bg-[#372A17] text-[#B45309] dark:text-[#FBBF24]'
                            : 'bg-[#F3F4F6] dark:bg-[#282622] text-[#4B5563] dark:text-[#9CA3AF]'
                        }`}
                      >
                        {goal.priority === 'high' ? 'Haute' : goal.priority === 'medium' ? 'Moyenne' : 'Basse'}
                      </span>

                      {/* Edit & Delete Buttons */}
                      <button
                        onClick={() => onOpenEditGoalModal(goal)}
                        className="p-1 text-[#8C8375] hover:text-[#A24824] dark:hover:text-[#E8734C] transition-colors rounded cursor-pointer"
                        title="Modifier ce projet"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteGoal(goal.id)}
                        className="p-1 text-[#8C8375] hover:text-[#DC2626] dark:hover:text-[#EF4444] transition-colors rounded cursor-pointer"
                        title="Supprimer cet objectif"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Amounts Row */}
                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <span className="text-[11px] text-[#7C7365] dark:text-[#9A9184]">Épargné :</span>
                      <span className="ml-1.5 font-mono font-bold text-base text-[#25201B] dark:text-[#F2EFEA]">
                        {Math.round(goal.currentAmount).toLocaleString('fr-FR')} {currencySymbol}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-[#7C7365] dark:text-[#9A9184]">Cible :</span>
                      <span className="ml-1.5 font-mono font-semibold text-xs text-[#524B3F] dark:text-[#DDD6C8]">
                        {Math.round(goal.targetAmount).toLocaleString('fr-FR')} {currencySymbol}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar with Milestone Markers */}
                  <div className="relative mb-2">
                    <div className="w-full bg-[#E5DFD3] dark:bg-[#343028] h-3 rounded-full overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted
                            ? 'bg-[#2E7D32] dark:bg-[#4ADE80]'
                            : progressPct >= 75
                            ? 'bg-[#3B6B55] dark:bg-[#52A36F]'
                            : 'bg-[#A24824] dark:text-[#E8734C]'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    {/* Tick line markers */}
                    <div className="absolute top-0 bottom-0 left-1/4 w-[1px] bg-white/40 pointer-events-none" />
                    <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/40 pointer-events-none" />
                    <div className="absolute top-0 bottom-0 left-3/4 w-[1px] bg-white/40 pointer-events-none" />
                  </div>

                  {/* Progress stats */}
                  <div className="flex items-center justify-between text-xs mb-3 font-mono">
                    <span
                      className={`font-bold ${
                        isCompleted
                          ? 'text-[#2E7D32] dark:text-[#4ADE80] flex items-center gap-1'
                          : 'text-[#A24824] dark:text-[#E8734C]'
                      }`}
                    >
                      {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 inline" />}
                      {progressPct}% {isCompleted ? 'Atteint !' : ''}
                    </span>
                    <span className="text-[#7C7365] dark:text-[#9A9184] text-[11px]">
                      {isCompleted
                        ? 'Félicitations, projet financé !'
                        : `Reste : ${Math.round(remainingAmount).toLocaleString('fr-FR')} ${currencySymbol}`}
                    </span>
                  </div>

                  {/* Details Pill Strip: Monthly allocation & Target Date */}
                  <div className="p-2.5 bg-[#FAF8F5] dark:bg-[#24221E] rounded-lg border border-[#EBE6DC] dark:border-[#312E28] space-y-1.5 text-xs mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[#6A6052] dark:text-[#9A9184] flex items-center gap-1">
                        <PiggyBank className="w-3 h-3 text-[#A24824]" />
                        <span>Allocation surplus :</span>
                      </span>
                      <span className="font-mono font-bold text-[#3B6B55] dark:text-[#52A36F]">
                        {goal.monthlyAllocation > 0
                          ? `+${Math.round(goal.monthlyAllocation).toLocaleString('fr-FR')} ${currencySymbol}/mois`
                          : 'Aucune allocation mensuelle'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#6A6052] dark:text-[#9A9184] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Échéance visée :</span>
                      </span>
                      <span className="font-medium text-[#25201B] dark:text-[#F2EFEA]">
                        {goal.targetDate}
                      </span>
                    </div>

                    {!isCompleted && goal.monthlyAllocation > 0 && (
                      <div className="pt-1 border-t border-[#F0ECE1] dark:border-[#2C2923] flex items-center justify-between text-[11px] text-[#8C8375] dark:text-[#887F72]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#A24824]" />
                          <span>Temps estimé :</span>
                        </span>
                        <span className="font-semibold text-[#A24824] dark:text-[#E8734C]">
                          ~{monthsToGoal} mois restants
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions: Quick surplus injection */}
                <div className="pt-2 border-t border-[#EBE6DC] dark:border-[#312E28] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-[#8C8375] dark:text-[#887F72]">Injecter :</span>
                    <button
                      onClick={() => onQuickAllocate(goal.id, 500)}
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#FAF8F5] dark:bg-[#25231F] border border-[#D5CDBC] dark:border-[#3D382F] hover:border-[#A24824] text-[#4A4237] dark:text-[#DDD6C8] hover:text-[#A24824] transition-colors"
                      title="Allouer 500 DH du surplus"
                    >
                      +500
                    </button>
                    <button
                      onClick={() => onQuickAllocate(goal.id, 1000)}
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#FAF8F5] dark:bg-[#25231F] border border-[#D5CDBC] dark:border-[#3D382F] hover:border-[#A24824] text-[#4A4237] dark:text-[#DDD6C8] hover:text-[#A24824] transition-colors"
                      title="Allouer 1 000 DH du surplus"
                    >
                      +1k
                    </button>
                  </div>

                  <button
                    onClick={() => onOpenAllocateSurplusModal(goal)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#FAF0E6] dark:bg-[#34241D] text-[#A24824] dark:text-[#E8734C] hover:bg-[#F3E2D5] dark:hover:bg-[#432E24] transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Allouer Surplus</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

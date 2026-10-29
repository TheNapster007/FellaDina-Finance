import React, { useState, useMemo } from 'react';
import { Transaction, CategoryBudget, Currency, Language, ForecastScenario } from '../types';
import { computeBudgetForecast } from '../utils/budgetForecastEngine';
import { PredictiveForecastChart } from './charts/PredictiveForecastChart';
import { CategoryForecastBreakdown } from './charts/CategoryForecastBreakdown';
import {
  TrendingUp,
  Sparkles,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  PiggyBank,
  RotateCcw,
  ShieldCheck,
  Compass,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  LineChart,
  BarChart3,
  HelpCircle,
} from 'lucide-react';

interface Section05BudgetForecastProps {
  transactions: Transaction[];
  categories: CategoryBudget[];
  currency: Currency;
  language: Language;
}

export const Section05BudgetForecast: React.FC<Section05BudgetForecastProps> = ({
  transactions,
  categories,
  currency,
  language,
}) => {
  // Forecast Horizon: 'monthly' (3 months) | 'yearly' (12 months)
  const [forecastHorizon, setForecastHorizon] = useState<'monthly' | 'yearly'>('monthly');
  // Scenario state
  const [scenario, setScenario] = useState<ForecastScenario>('baseline');
  // Discretionary spending slider (-25% to +25%)
  const [discretionaryAdjustmentPct, setDiscretionaryAdjustmentPct] = useState<number>(0);
  // View mode: 'chart' | 'categories'
  const [activeView, setActiveView] = useState<'chart' | 'categories'>('chart');
  // Tooltip / helper drawer state
  const [showMethodology, setShowMethodology] = useState(false);

  // Compute forecast data through our prediction engine
  const forecast = useMemo(() => {
    return computeBudgetForecast({
      transactions,
      categories,
      scenario,
      discretionaryAdjustmentPct,
      language,
    });
  }, [transactions, categories, scenario, discretionaryAdjustmentPct, language]);

  const currencySymbol = currency === 'MAD' ? 'DH' : currency === 'EUR' ? '€' : '$';

  // Compare projected average expense with historical
  const expenseDeltaPct = forecast.historicalAverageExpense > 0
    ? Math.round(
        ((forecast.projectedAverageExpense - forecast.historicalAverageExpense) /
          forecast.historicalAverageExpense) *
          100
      )
    : 0;

  // Comparison with allocated budget
  const budgetVariance = forecast.projectedAverageExpense - forecast.allocatedMonthlyBudgetCap;
  const isOverBudgetOverall = budgetVariance > 0;

  return (
    <section id="forecast-section" className="mt-12 pt-8 border-t border-[#E5E0D5] dark:border-[#2D2A24] transition-colors scroll-mt-20">
      {/* Section Kicker & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#A24824] dark:text-[#E8734C]">
              {language === 'ar_ma'
                ? forecastHorizon === 'yearly'
                  ? '05 / TAWAQO3AT L-MIZANIYA L-SANAWIYA'
                  : '05 / TAWAQO3AT L-MIZANIYA L-TELT CHHOR'
                : '05 / PRÉVISIONS & ANALYSE PRÉDICTIVE'}
            </span>
            <span className="text-xs text-[#8A8174]">•</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#5B7B68] dark:text-[#7D9D8B]">
              <Sparkles className="w-3 h-3" />
              {forecastHorizon === 'yearly'
                ? (language === 'ar_ma' ? 'Horizon 12 ch-har (Sanawi)' : 'Horizon 12 Mois (Projection Annuelle)')
                : (language === 'ar_ma' ? 'Projection sur 3 mois' : 'Horizon 3 Mois (Trimestre T+1)')}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#201C18] dark:text-[#F2EFEA] tracking-tight">
            {language === 'ar_ma'
              ? forecastHorizon === 'yearly'
                ? 'Tawaqo3at l-masrouf sanawiyan (12 ch-har)'
                : 'Tawaqo3at l-masrouf w l-mizaniya l-jayya'
              : forecastHorizon === 'yearly'
              ? 'Projection Budgétaire Annuelle (12 Mois)'
              : 'Prévision Budgétaire & Projection des Dépenses'}
          </h2>
          <p className="text-xs sm:text-sm text-[#736B5E] dark:text-[#9F9688] mt-1 max-w-3xl">
            {forecastHorizon === 'yearly'
              ? (language === 'ar_ma'
                  ? 'Modèle prédictif annualisé li kay7ellel l-masarif w l-madakhil dyalk 3la modda dyal 12 ch-har jaya b tariqa deqiqqa.'
                  : 'Modèle prédictif annualisé simulant vos charges et excédents sur un horizon de 12 mois complets avec lissage des cycles financiers.')
              : (language === 'ar_ma'
                  ? 'Modèle prédictif li kay7ellel tariqa li katkhser biha f l-chhor li fato, w kay3tik tawaqo3at b deqqa l-telt chhor jaya m3a scénarios d l\'épargne.'
                  : 'Modèle prédictif pondéré calculant l\'évolution prévisible de vos charges pour les 3 prochains mois selon votre historique réel.')}
          </p>
        </div>

        {/* View Switcher, Horizon Switcher & Methodology Trigger */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Monthly vs Yearly Horizon Toggle */}
          <div className="inline-flex rounded-lg border border-[#DDD7C9] dark:border-[#38352F] bg-[#FAF8F4] dark:bg-[#201F1B] p-0.5 text-xs shadow-2xs">
            <button
              type="button"
              onClick={() => setForecastHorizon('monthly')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                forecastHorizon === 'monthly'
                  ? 'bg-[#A24824] text-white shadow-xs font-semibold'
                  : 'text-[#6F6659] dark:text-[#9A9184] hover:text-[#231F1C]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{language === 'ar_ma' ? '3 mois' : 'Mensuel (3m)'}</span>
            </button>
            <button
              type="button"
              onClick={() => setForecastHorizon('yearly')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                forecastHorizon === 'yearly'
                  ? 'bg-[#A24824] text-white shadow-xs font-semibold'
                  : 'text-[#6F6659] dark:text-[#9A9184] hover:text-[#231F1C]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{language === 'ar_ma' ? '12 mois' : 'Annuel (12m)'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowMethodology(!showMethodology)}
            className="px-2.5 py-1.5 text-xs text-[#6F6659] dark:text-[#9A9184] hover:text-[#231F1C] dark:hover:text-[#F2EFEA] border border-[#DDD7C9] dark:border-[#38352F] rounded-lg bg-[#FAF8F4] dark:bg-[#201F1B] flex items-center gap-1.5 transition-colors"
            title="Détails de la méthodologie"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Méthode</span>
          </button>

          <div className="inline-flex rounded-lg border border-[#DDD7C9] dark:border-[#38352F] bg-[#FAF8F4] dark:bg-[#201F1B] p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setActiveView('chart')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                activeView === 'chart'
                  ? 'bg-white dark:bg-[#1C1B17] text-[#A24824] dark:text-[#E8734C] shadow-xs font-semibold'
                  : 'text-[#6F6659] dark:text-[#9A9184] hover:text-[#231F1C]'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>{language === 'ar_ma' ? 'Courbe' : 'Courbe'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('categories')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                activeView === 'categories'
                  ? 'bg-white dark:bg-[#1C1B17] text-[#A24824] dark:text-[#E8734C] shadow-xs font-semibold'
                  : 'text-[#6F6659] dark:text-[#9A9184] hover:text-[#231F1C]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{language === 'ar_ma' ? 'Postes' : 'Postes'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Methodology Drawer (Expandable) */}
      {showMethodology && (
        <div className="mb-6 p-4 rounded-xl bg-[#F2EFE8] dark:bg-[#201E1A] border border-[#E0D9CB] dark:border-[#332F27] text-xs text-[#5D5548] dark:text-[#B3ABA0] transition-all">
          <div className="font-semibold text-[#25211B] dark:text-[#F2EFEA] mb-1.5 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#A24824]" />
            Méthodologie de Calcul & Scénarisation Prédictive Felladina Finance
          </div>
          <p className="leading-relaxed">
            Le moteur applique une régression pondérée exponentielle sur l'historique de vos écritures bancaires (donnant 60% de poids aux 2 derniers mois).
            Les charges fixes (logement, abonnements) sont projetées de manière linéaire et constante.
            Les dépenses variables (alimentation, sorties, transport) intègrent une dérive saisonnière et un corridor d'incertitude statistique (intervalle de confiance calculé sur l'écart-type historique).
          </p>
        </div>
      )}

      {/* Interactive Scenario Selection & What-If Controls Bar */}
      <div className="bg-[#FAF8F3] dark:bg-[#1A1915] rounded-xl border border-[#E7E2D6] dark:border-[#2E2B25] p-4 sm:p-5 mb-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* 3 Scenario Tabs */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#797063] dark:text-[#9A9184] mb-2">
              {language === 'ar_ma' ? '1. Khtar Scénario dyal tawaqo3 :' : '1. Sélectionnez un scénario prévisionnel :'}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setScenario('baseline')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
                  scenario === 'baseline'
                    ? 'bg-[#2A2621] text-[#F7F5F0] border-[#2A2621] shadow-xs'
                    : 'bg-white dark:bg-[#22201C] text-[#554D41] dark:text-[#C4BCB0] border-[#DED7C8] dark:border-[#38342C] hover:bg-[#F2EFE8]'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-[#D96B43]" />
                <span>{language === 'ar_ma' ? 'Tendance 3adiyya (Standard)' : 'Tendance Réelle Constatée'}</span>
              </button>

              <button
                type="button"
                onClick={() => setScenario('optimistic')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
                  scenario === 'optimistic'
                    ? 'bg-[#3B6B55] text-white border-[#3B6B55] shadow-xs'
                    : 'bg-white dark:bg-[#22201C] text-[#554D41] dark:text-[#C4BCB0] border-[#DED7C8] dark:border-[#38342C] hover:bg-[#F2EFE8]'
                }`}
              >
                <PiggyBank className="w-3.5 h-3.5 text-[#86EFAC]" />
                <span>{language === 'ar_ma' ? 'Économe (-8% Épargne)' : 'Scénario Économe (-8%)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setScenario('conservative')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
                  scenario === 'conservative'
                    ? 'bg-[#A24824] text-white border-[#A24824] shadow-xs'
                    : 'bg-white dark:bg-[#22201C] text-[#554D41] dark:text-[#C4BCB0] border-[#DED7C8] dark:border-[#38342C] hover:bg-[#F2EFE8]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#FDBA74]" />
                <span>{language === 'ar_ma' ? 'Prudent (+10% Imprévus)' : 'Scénario Prudentiel (+10%)'}</span>
              </button>
            </div>
          </div>

          {/* Interactive What-If Slider: Discretionary Spending */}
          <div className="lg:border-l lg:border-[#E5DFD2] lg:dark:border-[#2D2A24] lg:pl-6 pt-2 lg:pt-0">
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#797063] dark:text-[#9A9184] flex items-center gap-1.5">
                <Sliders className="w-3 h-3 text-[#A24824]" />
                {language === 'ar_ma' ? '2. Simulation "What-If" (Dépenses discrétionnaires) :' : '2. Simulation : Ajuster le train de vie discrétionnaire'}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono font-bold text-xs ${
                    discretionaryAdjustmentPct > 0
                      ? 'text-[#C2410C]'
                      : discretionaryAdjustmentPct < 0
                      ? 'text-[#3B6B55]'
                      : 'text-[#6A6255]'
                  }`}
                >
                  {discretionaryAdjustmentPct > 0 ? `+${discretionaryAdjustmentPct}%` : `${discretionaryAdjustmentPct}%`}
                </span>
                {discretionaryAdjustmentPct !== 0 && (
                  <button
                    type="button"
                    onClick={() => setDiscretionaryAdjustmentPct(0)}
                    className="text-[#968E80] hover:text-[#25211B] dark:hover:text-white p-0.5 rounded"
                    title="Réinitialiser"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] text-[#8C8477] font-medium">-25%</span>
              <input
                type="range"
                min="-25"
                max="25"
                step="5"
                value={discretionaryAdjustmentPct}
                onChange={(e) => setDiscretionaryAdjustmentPct(parseInt(e.target.value, 10))}
                className="w-48 sm:w-56 accent-[#A24824] cursor-pointer"
              />
              <span className="text-[10px] text-[#8C8477] font-medium">+25%</span>
            </div>
            <p className="text-[10px] text-[#8C8375] mt-1">
              {discretionaryAdjustmentPct === 0
                ? 'Ajuste en temps réel les postes loisirs, restos et achats shopping.'
                : discretionaryAdjustmentPct < 0
                ? `Économie additionnelle de ${Math.round(Math.abs((forecast.historicalAverageExpense * 0.4) * (discretionaryAdjustmentPct / 100))).toLocaleString('fr-FR')} ${currencySymbol}/mois.`
                : `Surcoût additionnel de ${Math.round((forecast.historicalAverageExpense * 0.4) * (discretionaryAdjustmentPct / 100)).toLocaleString('fr-FR')} ${currencySymbol}/mois.`}
            </p>
          </div>
        </div>
      </div>

      {/* Empty State Banner when no transactions exist */}
      {transactions.length === 0 && (
        <div className="mb-6 p-4 rounded-xl bg-[#FAF8F3] dark:bg-[#201F1B] border border-dashed border-[#DDD7C9] dark:border-[#38352F] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FAF0E6] dark:bg-[#34241D] flex items-center justify-center text-[#A24824] dark:text-[#E8734C] shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-xs text-[#6F6659] dark:text-[#9A9184] leading-relaxed">
            {language === 'ar_ma'
              ? 'Mazal ma dkhlti hta chi masrouf. Dès que t-bda ddkhel l-masarif yawmiyan, had l-modèle ghadi y7ellel l-évolution dyal floussek.'
              : 'Aucune transaction enregistrée pour l’instant. Dès que vous enregistrez vos dépenses quotidiennes, les projections prédictives et les corridors d’incertitude s’ajusteront à votre rythme réel.'}
          </p>
        </div>
      )}

      {/* 4 Executive Forecast KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Metric 1: Total Projected Expense (3m or 12m) */}
        <div className="bg-white dark:bg-[#1C1B17] rounded-xl border border-[#E7E2D6] dark:border-[#2F2C26] p-4.5 shadow-xs">
          <span className="text-[10.5px] uppercase font-bold tracking-wider text-[#8A8174] dark:text-[#9A9184] block mb-1">
            {forecastHorizon === 'yearly'
              ? language === 'ar_ma'
                ? 'Majmou3 l-masrouf (12 ch-har)'
                : 'Dépenses Prévues (12 Mois / An)'
              : language === 'ar_ma'
              ? 'Majmou3 l-masrouf (3 chhor)'
              : 'Dépenses Prévues (3 Mois)'}
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-[1.75rem] font-serif font-bold text-[#231F1C] dark:text-[#F2EFEA] tracking-tight">
              {Math.round(
                forecastHorizon === 'yearly'
                  ? forecast.projectedYearlyExpenseTotal
                  : forecast.projectedThreeMonthExpenseTotal
              ).toLocaleString('fr-FR')}{' '}
              <span className="text-sm font-sans font-normal text-[#8A8174]">{currencySymbol}</span>
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#71685B] dark:text-[#A09789] flex items-center gap-1.5">
            {expenseDeltaPct >= 0 ? (
              <span className="text-[#A24824] font-medium flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{expenseDeltaPct}% vs moyenne passée
              </span>
            ) : (
              <span className="text-[#3B6B55] font-medium flex items-center gap-0.5">
                <ArrowDownRight className="w-3.5 h-3.5" />
                {expenseDeltaPct}% vs moyenne passée
              </span>
            )}
          </div>
        </div>

        {/* Metric 2: Monthly Projected Average vs Allocated Budget */}
        <div className="bg-white dark:bg-[#1C1B17] rounded-xl border border-[#E7E2D6] dark:border-[#2F2C26] p-4.5 shadow-xs">
          <span className="text-[10.5px] uppercase font-bold tracking-wider text-[#8A8174] dark:text-[#9A9184] block mb-1">
            {forecastHorizon === 'yearly'
              ? language === 'ar_ma'
                ? 'Moyenne sanawiya f ch-har'
                : 'Moyenne Mensuelle Lissée'
              : language === 'ar_ma'
              ? 'Moyenne d ch-har l-jay'
              : 'Moyenne Mensuelle Prévue'}
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-[1.75rem] font-serif font-bold text-[#231F1C] dark:text-[#F2EFEA] tracking-tight">
              {Math.round(forecast.projectedAverageExpense).toLocaleString('fr-FR')}{' '}
              <span className="text-sm font-sans font-normal text-[#8A8174]">{currencySymbol}</span>
            </span>
          </div>
          <div className="mt-2 text-[11px] flex items-center gap-1.5">
            {isOverBudgetOverall ? (
              <span className="text-[#C2410C] font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                +{Math.round(budgetVariance).toLocaleString('fr-FR')} {currencySymbol} au-dessus du plafond
              </span>
            ) : (
              <span className="text-[#3B6B55] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                -{Math.round(Math.abs(budgetVariance)).toLocaleString('fr-FR')} {currencySymbol} sous le plafond
              </span>
            )}
          </div>
        </div>

        {/* Metric 3: Total Projected Savings */}
        <div className="bg-white dark:bg-[#1C1B17] rounded-xl border border-[#E7E2D6] dark:border-[#2F2C26] p-4.5 shadow-xs">
          <span className="text-[10.5px] uppercase font-bold tracking-wider text-[#8A8174] dark:text-[#9A9184] block mb-1">
            {forecastHorizon === 'yearly'
              ? language === 'ar_ma'
                ? 'Épargne l-motawaqa3a (12 ch-har)'
                : 'Épargne Projetée (12 Mois / An)'
              : language === 'ar_ma'
              ? 'Épargne l-motawaqa3a (3 chhor)'
              : 'Épargne Projetée (3 Mois)'}
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-[1.75rem] font-serif font-bold text-[#3B6B55] dark:text-[#7D9D8B] tracking-tight">
              +{Math.round(
                forecastHorizon === 'yearly'
                  ? forecast.projectedYearlySavingsTotal
                  : forecast.projectedThreeMonthSavingsTotal
              ).toLocaleString('fr-FR')}{' '}
              <span className="text-sm font-sans font-normal text-[#8A8174]">{currencySymbol}</span>
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#71685B] dark:text-[#A09789]">
            {forecastHorizon === 'yearly'
              ? 'Accumulation annuelle estimée'
              : 'Excédent net accumulé estimé'}
          </div>
        </div>

        {/* Metric 4: Risk Month / Growing Category */}
        <div className="bg-white dark:bg-[#1C1B17] rounded-xl border border-[#E7E2D6] dark:border-[#2F2C26] p-4.5 shadow-xs">
          <span className="text-[10.5px] uppercase font-bold tracking-wider text-[#8A8174] dark:text-[#9A9184] block mb-1">
            {language === 'ar_ma' ? 'Nuqta l-hassasa (Vigilance)' : 'Poste le plus Dynamique'}
          </span>
          {forecast.budgetRiskMonth ? (
            <div>
              <div className="text-base font-bold text-[#C2410C] flex items-center gap-1.5 mt-0.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Risque en {forecast.budgetRiskMonth}</span>
              </div>
              <p className="text-[10.5px] text-[#8C8375] mt-1 leading-snug">
                Dépassement du plafond global prévu si le rythme actuel est maintenu.
              </p>
            </div>
          ) : forecast.fastestGrowingCategory ? (
            <div>
              <div className="text-base font-bold text-[#A24824] dark:text-[#E8734C] truncate mt-0.5">
                {language === 'ar_ma'
                  ? forecast.fastestGrowingCategory.labelDarija || forecast.fastestGrowingCategory.label
                  : forecast.fastestGrowingCategory.label}
              </div>
              <p className="text-[10.5px] text-[#8C8375] mt-1">
                Progression mensuelle moyenne de +{forecast.fastestGrowingCategory.growthPct}%
              </p>
            </div>
          ) : (
            <div className="text-sm font-semibold text-[#3B6B55] flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Trajectoire équilibrée</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive Chart or Category Breakdown Section */}
      {activeView === 'chart' ? (
        <PredictiveForecastChart
          timeline={forecastHorizon === 'yearly' ? forecast.yearlyTimelineMonths : forecast.timelineMonths}
          allocatedBudgetCap={forecast.allocatedMonthlyBudgetCap}
          currency={currency}
          language={language}
        />
      ) : (
        <CategoryForecastBreakdown
          categoryForecasts={forecast.categoryForecasts}
          currency={currency}
          language={language}
          isYearly={forecastHorizon === 'yearly'}
        />
      )}

      {/* Editorial Financial Guidance Strip */}
      <div className="mt-4 p-4 rounded-xl bg-[#FAF7F0] dark:bg-[#1C1B17] border border-[#E7E0D3] dark:border-[#2D2A24] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#A24824]/10 dark:bg-[#A24824]/20 text-[#A24824] dark:text-[#E8734C] flex items-center justify-center shrink-0 mt-0.5">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-[#2A2621] dark:text-[#F2EFEA] block mb-0.5">
              {language === 'ar_ma'
                ? 'Nasi7at Felladina Finance l-had telt chhor :'
                : 'Recommandation Budgétaire Felladina Finance :'}
            </span>
            <p className="text-[#6D6355] dark:text-[#A79F92] leading-relaxed">
              {isOverBudgetOverall
                ? language === 'ar_ma'
                  ? `Khask tnaqes taqriban ${Math.round(budgetVariance).toLocaleString('fr-FR')} ${currencySymbol}/ch-har mn l-masarif l-khiyariya bash tbqa f l-mizaniya dyalk.`
                  : `Pour préserver l'intégrité de votre budget, nous vous conseillons de réduire vos dépenses discrétionnaires de ${Math.round(budgetVariance).toLocaleString('fr-FR')} ${currencySymbol}/mois.`
                : language === 'ar_ma'
                  ? `Khelik f had rythm! Ghadi tqder twafer 7awali ${Math.round(forecast.projectedThreeMonthSavingsTotal).toLocaleString('fr-FR')} ${currencySymbol} f had telt chhor.`
                  : `Trajectoire vertueuse : En maintenant ce rythme de dépenses, vous dégagerez un excédent net estimé à +${Math.round(forecast.projectedThreeMonthSavingsTotal).toLocaleString('fr-FR')} ${currencySymbol} d'ici la fin du trimestre.`}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 self-end sm:self-auto">
          <span className="text-[11px] font-mono font-medium text-[#887F72]">
            Horizon: {forecast.timelineMonths[forecast.timelineMonths.length - 1]?.label}
          </span>
        </div>
      </div>
    </section>
  );
};

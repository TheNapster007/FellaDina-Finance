import React, { useState, useEffect } from 'react';
import { SavingsGoal, SavingsGoalCategory, GoalPriority, Currency, Language } from '../types';
import { X, Target, PiggyBank, Calendar, DollarSign, Tag, Check, AlertCircle, Sparkles, Plus, ArrowRight } from 'lucide-react';

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: SavingsGoal) => void;
  onAllocateSurplus?: (goalId: string, amount: number, note?: string) => void;
  editingGoal?: SavingsGoal | null;
  mode?: 'create' | 'edit' | 'allocate';
  monthlySurplus?: number;
  currency: Currency;
  language: Language;
}

const CATEGORY_OPTIONS: { id: SavingsGoalCategory; labelFr: string; labelAr: string; icon: string; defaultColor: string }[] = [
  { id: 'emergency', labelFr: "Fonds d'Urgence", labelAr: 'Sandouq Tawari2', icon: 'ShieldCheck', defaultColor: '#3B6B55' },
  { id: 'real_estate', labelFr: 'Apport Immobilier', labelAr: 'Avance Sakan', icon: 'Home', defaultColor: '#A24824' },
  { id: 'travel', labelFr: 'Voyage & Vacances', labelAr: 'Safar w 3otla', icon: 'Plane', defaultColor: '#5B7B94' },
  { id: 'vehicle', labelFr: 'Véhicule & Transport', labelAr: 'Tomobil / Sayyara', icon: 'Car', defaultColor: '#8A5D3B' },
  { id: 'investment', labelFr: 'Investissement & Bourse', labelAr: 'Istithmar w Boursa', icon: 'TrendingUp', defaultColor: '#2D6A4F' },
  { id: 'education', labelFr: 'Études & Formation', labelAr: 'Dirassa w Takwin', icon: 'GraduationCap', defaultColor: '#6B46C1' },
  { id: 'family', labelFr: 'Projet Familial / Mariage', labelAr: '3ars / 3a2ila', icon: 'Heart', defaultColor: '#D97706' },
  { id: 'project', labelFr: 'Projet Personnel / Business', labelAr: 'Projet / Mashrou3', icon: 'Briefcase', defaultColor: '#4A5568' },
];

export const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onAllocateSurplus,
  editingGoal,
  mode = 'create',
  monthlySurplus = 0,
  currency,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'allocate'>(mode === 'allocate' ? 'allocate' : 'details');

  // Form states
  const [name, setName] = useState('');
  const [nameDarija, setNameDarija] = useState('');
  const [targetAmount, setTargetAmount] = useState<number | ''>('');
  const [currentAmount, setCurrentAmount] = useState<number | ''>(0);
  const [monthlyAllocation, setMonthlyAllocation] = useState<number | ''>('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState<SavingsGoalCategory>('emergency');
  const [priority, setPriority] = useState<GoalPriority>('high');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Quick allocation state
  const [allocationAmount, setAllocationAmount] = useState<number | ''>('');
  const [allocationNote, setAllocationNote] = useState('');

  const currencySymbol = currency === 'MAD' ? 'DH' : currency === 'EUR' ? '€' : '$';

  useEffect(() => {
    if (editingGoal) {
      setName(editingGoal.name);
      setNameDarija(editingGoal.nameDarija || '');
      setTargetAmount(editingGoal.targetAmount);
      setCurrentAmount(editingGoal.currentAmount);
      setMonthlyAllocation(editingGoal.monthlyAllocation);
      setTargetDate(editingGoal.targetDate);
      setCategory(editingGoal.category);
      setPriority(editingGoal.priority);
      setNotes(editingGoal.notes || '');
      setActiveTab(mode === 'allocate' ? 'allocate' : 'details');
      setAllocationAmount(monthlySurplus > 0 ? Math.min(1000, Math.round(monthlySurplus * 0.5)) : 500);
    } else {
      setName('');
      setNameDarija('');
      setTargetAmount('');
      setCurrentAmount(0);
      setMonthlyAllocation(monthlySurplus > 0 ? Math.round(monthlySurplus * 0.25) : 500);
      // Default date: 1 year from now
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      setTargetDate(d.toISOString().slice(0, 10));
      setCategory('emergency');
      setPriority('high');
      setNotes('');
      setActiveTab('details');
      setAllocationAmount(500);
    }
    setError(null);
  }, [editingGoal, isOpen, mode, monthlySurplus]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(language === 'ar_ma' ? 'Kteb smiya d l-hadaf' : "Veuillez saisir un nom pour l'objectif.");
      return;
    }
    if (!targetAmount || Number(targetAmount) <= 0) {
      setError(language === 'ar_ma' ? 'Kteb montant cible s7i7' : 'Veuillez saisir un montant cible supérieur à 0.');
      return;
    }

    const catOption = CATEGORY_OPTIONS.find((c) => c.id === category);

    const goalToSave: SavingsGoal = {
      id: editingGoal?.id || `goal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      nameDarija: nameDarija.trim() || undefined,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount) || 0,
      monthlyAllocation: Number(monthlyAllocation) || 0,
      targetDate: targetDate || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      category,
      priority,
      color: catOption?.defaultColor || '#A24824',
      icon: catOption?.icon || 'Target',
      notes: notes.trim() || undefined,
      createdAt: editingGoal?.createdAt || new Date().toISOString().slice(0, 10),
    };

    onSave(goalToSave);
    onClose();
  };

  const handleSurplusAllocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal || !onAllocateSurplus) return;
    const amt = Number(allocationAmount);
    if (!amt || amt <= 0) {
      setError(language === 'ar_ma' ? 'Kteb montant s7i7' : 'Veuillez saisir un montant valide.');
      return;
    }

    onAllocateSurplus(editingGoal.id, amt, allocationNote);
    onClose();
  };

  const currentSavedNum = Number(currentAmount) || 0;
  const targetNum = Number(targetAmount) || 1;
  const previewProgress = Math.min(100, Math.round((currentSavedNum / targetNum) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="bg-white dark:bg-[#1E1D19] border border-[#E5DFD3] dark:border-[#38332A] rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EBE6DC] dark:border-[#312E28] bg-[#FAF8F5] dark:bg-[#24221E] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FAF0E6] dark:bg-[#34241D] text-[#A24824] dark:text-[#E8734C] flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#25201B] dark:text-[#F2EFEA]">
                {editingGoal
                  ? activeTab === 'allocate'
                    ? language === 'ar_ma'
                      ? 'Zid surplus l had l-hadaf'
                      : "Allouer une part du surplus mensuel"
                    : language === 'ar_ma'
                    ? 'Beddel l-hadaf d l&apos;épargne'
                    : "Modifier l'objectif d'épargne"
                  : language === 'ar_ma'
                  ? 'Zid hadaf d l&apos;épargne jdid'
                  : "Définir un nouvel objectif d'épargne"}
              </h3>
              <p className="text-[11px] text-[#7C7365] dark:text-[#9A9184]">
                {language === 'ar_ma'
                  ? 'Kheyyer l-mashrou3 dyalk w 7eddéd l-montant li bghiti twessal lih'
                  : 'Projetez vos économies vers des projets d’avenir concrets.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8C8375] hover:text-[#25201B] dark:hover:text-[#F2EFEA] hover:bg-[#EFECE3] dark:hover:bg-[#2D2A24] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Tabs if editing an existing goal */}
        {editingGoal && onAllocateSurplus && (
          <div className="flex border-b border-[#EBE6DC] dark:border-[#312E28] bg-[#F7F5F0] dark:bg-[#201E1A] text-xs font-semibold px-6 pt-2">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-3 border-b-2 transition-all ${
                activeTab === 'details'
                  ? 'border-[#A24824] text-[#A24824] dark:text-[#E8734C]'
                  : 'border-transparent text-[#7C7365] dark:text-[#9A9184] hover:text-[#25201B]'
              }`}
            >
              Paramètres du Projet
            </button>
            <button
              onClick={() => setActiveTab('allocate')}
              className={`py-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'allocate'
                  ? 'border-[#A24824] text-[#A24824] dark:text-[#E8734C]'
                  : 'border-transparent text-[#7C7365] dark:text-[#9A9184] hover:text-[#25201B]'
              }`}
            >
              <PiggyBank className="w-3.5 h-3.5" />
              <span>Allouer du Surplus (+DH)</span>
            </button>
          </div>
        )}

        {/* Error notice */}
        {error && (
          <div className="mx-6 mt-4 p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab 1: Goal Details Form */}
        {activeTab === 'details' ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Goal Name */}
            <div>
              <label className="block text-xs font-semibold text-[#4A4237] dark:text-[#DDD6C8] mb-1">
                {language === 'ar_ma' ? 'Smiya d l-hadaf (Nom du projet)' : "Nom du projet d'épargne *"}
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Fonds d'urgence (6 mois), Apport Sakan, Oumra..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF8F5] dark:bg-[#26241F] border border-[#DCD5C6] dark:border-[#38342D] rounded-lg text-[#25201B] dark:text-[#F2EFEA] focus:outline-none focus:ring-1 focus:ring-[#A24824]"
              />
            </div>

            {/* Darija Label (Optional) */}
            <div>
              <label className="block text-[11px] font-medium text-[#7C7365] dark:text-[#9A9184] mb-1">
                Libellé Darija (Optionnel)
              </label>
              <input
                type="text"
                placeholder="Ex: Sandouq d Tawari2, Avance d l-kra..."
                value={nameDarija}
                onChange={(e) => setNameDarija(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#FAF8F5] dark:bg-[#26241F] border border-[#DCD5C6] dark:border-[#38342D] rounded-lg text-[#25201B] dark:text-[#F2EFEA] focus:outline-none focus:ring-1 focus:ring-[#A24824]"
              />
            </div>

            {/* Category and Priority Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#4A4237] dark:text-[#DDD6C8] mb-1">
                  Catégorie
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SavingsGoalCategory)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] dark:bg-[#26241F] border border-[#DCD5C6] dark:border-[#38342D] rounded-lg text-[#25201B] dark:text-[#F2EFEA] focus:outline-none focus:ring-1 focus:ring-[#A24824]"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {language === 'ar_ma' ? cat.labelAr : cat.labelFr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A4237] dark:text-[#DDD6C8] mb-1">
                  Priorité
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as GoalPriority)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] dark:bg-[#26241F] border border-[#DCD5C6] dark:border-[#38342D] rounded-lg text-[#25201B] dark:text-[#F2EFEA] focus:outline-none focus:ring-1 focus:ring-[#A24824]"
                >
                  <option value="high">Haute (Prioritaire)</option>
                  <option value="medium">Moyenne (Standard)</option>
                  <option value="low">Basse (Secondaire)</option>
                </select>
              </div>
            </div>

            {/* Amounts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#4A4237] dark:text-[#DDD6C8] mb-1">
                  Montant Cible ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="100"
                  placeholder="Ex: 50000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono bg-[#FAF8F5] dark:bg-[#26241F] border border-[#DCD5C6] dark:border-[#38342D] rounded-lg text-[#25201B] dark:text-[#F2EFEA] focus:outline-none focus:ring-1 focus:ring-[#A24824]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A4237] dark:text-[#DDD6C8] mb-1">
                  Déjà Épargné ({currencySymbol})
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  placeholder="Ex: 15000"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono bg-[#FAF8F5] dark:bg-[#26241F] border border-[#DCD5C6] dark:border-[#38342D] rounded-lg text-[#25201B] dark:text-[#F2EFEA] focus:outline-none focus:ring-1 focus:ring-[#A24824]"
                />
              </div>
            </div>

            {/* Live Progress Preview */}
            {targetAmount && Number(targetAmount) > 0 && (
              <div className="p-3 bg-[#FAF8F5] dark:bg-[#24221E] rounded-xl border border-[#EBE6DC] dark:border-[#312E28]">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[11px] font-semibold text-[#6A6052] dark:text-[#9A9184]">
                    Progression Actuelle
                  </span>
                  <span className="font-mono font-bold text-[#A24824] dark:text-[#E8734C]">
                    {previewProgress}%
                  </span>
                </div>
                <div className="w-full bg-[#E5DFD3] dark:bg-[#343028] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#A24824] dark:bg-[#E8734C] h-full rounded-full transition-all duration-300"
                    style={{ width: `${previewProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#8C8375] dark:text-[#887F72] mt-1 font-mono">
                  <span>{Math.round(Number(currentAmount) || 0).toLocaleString('fr-FR')} {currencySymbol}</span>
                  <span>Reste : {Math.max(0, Math.round((Number(targetAmount) || 0) - (Number(currentAmount) || 0))).toLocaleString('fr-FR')} {currencySymbol}</span>
                </div>
              </div>
            )}

            {/* Allocation Mensuelle & Échéance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#4A4237] dark:text-[#DDD6C8] mb-1">
                  Allocation Mensuelle ({currencySymbol}/mois)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  placeholder="Ex: 1000"
                  value={monthlyAllocation}
                  onChange={(e) => setMonthlyAllocation(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono bg-[#FAF8F5] dark:bg-[#26241F] border border-[#DCD5C6] dark:border-[#38342D] rounded-lg text-[#25201B] dark:text-[#F2EFEA] focus:outline-none focus:ring-1 focus:ring-[#A24824]"
                />
                <span className="text-[10px] text-[#8C8375] dark:text-[#887F72] mt-0.5 block">
                  Part prélevée de votre surplus mensuel
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A4237] dark:text-[#DDD6C8] mb-1">
                  Date Limite Visée
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-[#FAF8F5] dark:bg-[#26241F] border border-[#DCD5C6] dark:border-[#38342D] rounded-lg text-[#25201B] dark:text-[#F2EFEA] focus:outline-none focus:ring-1 focus:ring-[#A24824]"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-[#4A4237] dark:text-[#DDD6C8] mb-1">
                Notes ou Commentaires (Optionnel)
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Livret d'épargne rémunéré, virement automatique le 28 de chaque mois..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#FAF8F5] dark:bg-[#26241F] border border-[#DCD5C6] dark:border-[#38342D] rounded-lg text-[#25201B] dark:text-[#F2EFEA] focus:outline-none focus:ring-1 focus:ring-[#A24824]"
              />
            </div>

            {/* Footer Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#EBE6DC] dark:border-[#312E28]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white dark:bg-[#26241F] border border-[#D5CDBC] dark:border-[#3D382F] text-xs font-medium text-[#4A4237] dark:text-[#E8E4DC] rounded-lg hover:bg-[#F5F2EB] dark:hover:bg-[#2F2C25] transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#A24824] hover:bg-[#8F3E1E] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{editingGoal ? 'Mettre à jour' : 'Créer l’objectif'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Tab 2: Surplus Allocation Popover */
          <form onSubmit={handleSurplusAllocationSubmit} className="p-6 space-y-4">
            <div className="p-3.5 bg-[#FAF3EF] dark:bg-[#2B211C] border border-[#F0D5C7] dark:border-[#4A2D23] rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[#A24824] dark:text-[#E8734C]">
                  Surplus Mensuel Disponible
                </span>
                <span className="font-mono font-bold text-xs text-[#2E7D32] dark:text-[#4ADE80]">
                  +{Math.round(monthlySurplus).toLocaleString('fr-FR')} {currencySymbol}
                </span>
              </div>
              <p className="text-[11px] text-[#7A6258] dark:text-[#A89287]">
                Injectez directement un montant de votre trésorerie positive dans le projet{' '}
                <strong>« {editingGoal?.name} »</strong> pour accélérer son atteinte.
              </p>
            </div>

            {/* Quick Chips */}
            <div>
              <label className="block text-xs font-semibold text-[#4A4237] dark:text-[#DDD6C8] mb-1.5">
                Montant Rapide à Allouer
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[500, 1000, 2000, monthlySurplus > 0 ? Math.round(monthlySurplus) : 5000].map((quickAmt) => (
                  <button
                    key={quickAmt}
                    type="button"
                    onClick={() => setAllocationAmount(quickAmt)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-mono font-medium border transition-all ${
                      allocationAmount === quickAmt
                        ? 'bg-[#A24824] text-white border-[#A24824]'
                        : 'bg-[#FAF8F5] dark:bg-[#26241F] border-[#DCD5C6] dark:border-[#38342D] text-[#4A4237] dark:text-[#DDD6C8] hover:border-[#A24824]'
                    }`}
                  >
                    +{quickAmt.toLocaleString('fr-FR')}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <label className="block text-xs font-semibold text-[#4A4237] dark:text-[#DDD6C8] mb-1">
                Montant Précis ({currencySymbol})
              </label>
              <input
                type="number"
                required
                min="1"
                step="50"
                value={allocationAmount}
                onChange={(e) => setAllocationAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#FAF8F5] dark:bg-[#26241F] border border-[#DCD5C6] dark:border-[#38342D] rounded-lg text-[#25201B] dark:text-[#F2EFEA] focus:outline-none focus:ring-1 focus:ring-[#A24824]"
              />
            </div>

            {/* Simulated Result Preview */}
            {editingGoal && Number(allocationAmount) > 0 && (
              <div className="p-3 bg-[#FAF8F5] dark:bg-[#24221E] rounded-xl border border-[#EBE6DC] dark:border-[#312E28] text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[#6A6052] dark:text-[#9A9184]">Nouveau solde du projet :</span>
                  <span className="font-mono font-bold text-[#A24824] dark:text-[#E8734C]">
                    {Math.round(editingGoal.currentAmount + Number(allocationAmount)).toLocaleString('fr-FR')} /{' '}
                    {Math.round(editingGoal.targetAmount).toLocaleString('fr-FR')} {currencySymbol}
                  </span>
                </div>
                <div className="w-full bg-[#E5DFD3] dark:bg-[#343028] h-2 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="bg-[#3B6B55] dark:bg-[#52A36F] h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(((editingGoal.currentAmount + Number(allocationAmount)) / editingGoal.targetAmount) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Note */}
            <div>
              <label className="block text-xs font-semibold text-[#4A4237] dark:text-[#DDD6C8] mb-1">
                Motif ou Note de versement
              </label>
              <input
                type="text"
                placeholder="Ex: Épargne du salaire d'octobre, prime reçue..."
                value={allocationNote}
                onChange={(e) => setAllocationNote(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#FAF8F5] dark:bg-[#26241F] border border-[#DCD5C6] dark:border-[#38342D] rounded-lg text-[#25201B] dark:text-[#F2EFEA] focus:outline-none focus:ring-1 focus:ring-[#A24824]"
              />
            </div>

            {/* Footer Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#EBE6DC] dark:border-[#312E28]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white dark:bg-[#26241F] border border-[#D5CDBC] dark:border-[#3D382F] text-xs font-medium text-[#4A4237] dark:text-[#E8E4DC] rounded-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#3B6B55] hover:bg-[#2F5644] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Confirmer l’allocation</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

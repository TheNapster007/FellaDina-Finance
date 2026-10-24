import React, { useState } from 'react';
import { CategoryBudget, Transaction, SubCategory, Currency, Language, TransactionType } from '../types';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  Tag,
  BookOpen,
  Heart,
  Car,
  Plane,
  Gift,
  Laptop,
  Briefcase,
  Home,
  ShoppingBag,
  Zap,
  Coffee,
  Sparkles,
  Shield,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryBudget[];
  transactions: Transaction[];
  subCategories: SubCategory[];
  onAddCategory: (newCat: CategoryBudget) => void;
  onUpdateCategory: (updatedCat: CategoryBudget) => void;
  onDeleteCategory: (categoryId: string) => void;
  currency: Currency;
  language: Language;
  initialTab?: 'list' | 'create';
}

const PRESET_COLORS = [
  '#A24824', // Terracotta
  '#3B6B55', // Forest Green
  '#2563EB', // Moroccan Blue
  '#D97706', // Saffron Amber
  '#7C3AED', // Royal Violet
  '#DC2626', // Warm Crimson
  '#059669', // Emerald
  '#0891B2', // Mediterranean Cyan
  '#DB2777', // Rose Magenta
  '#4B5563', // Slate Charcoal
  '#B45309', // Cinnamon
  '#6366F1', // Indigo
];

const PRESET_ICONS = [
  { name: 'ShoppingBag', label: 'Achats' },
  { name: 'BookOpen', label: 'Études' },
  { name: 'Heart', label: 'Sadaqa/Santé' },
  { name: 'Car', label: 'Transport' },
  { name: 'Plane', label: 'Voyages' },
  { name: 'Gift', label: 'Cadeaux' },
  { name: 'Laptop', label: 'Tech/Pro' },
  { name: 'Briefcase', label: 'Salaire' },
  { name: 'Home', label: 'Logement' },
  { name: 'Zap', label: 'Factures' },
  { name: 'Coffee', label: 'Café/Resto' },
  { name: 'Sparkles', label: 'Animaux/Loisirs' },
  { name: 'Shield', label: 'Épargne' },
  { name: 'TrendingUp', label: 'Investissement' },
];

const QUICK_TEMPLATES: {
  label: string;
  labelDarija: string;
  type: TransactionType;
  allocatedBudget: number;
  color: string;
  icon: string;
  description: string;
}[] = [
  {
    label: 'Éducation & Scolarité',
    labelDarija: 'Ta3lim w Drari',
    type: 'expense',
    allocatedBudget: 2500,
    color: '#2563EB',
    icon: 'BookOpen',
    description: 'Frais d’écoles, cours particuliers, fournitures',
  },
  {
    label: 'Sadaqa & Dons',
    labelDarija: 'Sadaqa w Kheyrat',
    type: 'expense',
    allocatedBudget: 600,
    color: '#059669',
    icon: 'Heart',
    description: 'Aumône, aides familiales, zakat',
  },
  {
    label: 'Animaux & Vétérinaire',
    labelDarija: 'L-7ayawanat w Veto',
    type: 'expense',
    allocatedBudget: 450,
    color: '#D97706',
    icon: 'Sparkles',
    description: 'Nourriture croquettes, soins, vétérinaire',
  },
  {
    label: 'Voyages & Vacances',
    labelDarija: 'Safar w 3otla',
    type: 'expense',
    allocatedBudget: 3500,
    color: '#0891B2',
    icon: 'Plane',
    description: 'Hôtels, billets d’avion/train, séjours',
  },
  {
    label: 'Auto, Moto & Entretien',
    labelDarija: 'Tomobil w L-makina',
    type: 'expense',
    allocatedBudget: 1200,
    color: '#A24824',
    icon: 'Car',
    description: 'Vidange, pièces mécaniques, visite technique',
  },
  {
    label: 'Cadeaux & Fêtes',
    labelDarija: 'Monasabat w Hdaya',
    type: 'expense',
    allocatedBudget: 800,
    color: '#DB2777',
    icon: 'Gift',
    description: 'Mariages, anniversaires, fêtes religieuses',
  },
  {
    label: 'Ventes & E-Commerce',
    labelDarija: 'Bi3at f Internet',
    type: 'income',
    allocatedBudget: 3500,
    color: '#3B6B55',
    icon: 'ShoppingBag',
    description: 'Revenus boutique en ligne, marketplace',
  },
  {
    label: 'Loyers perçus',
    labelDarija: 'Madkhoul d Kra',
    type: 'income',
    allocatedBudget: 6000,
    color: '#059669',
    icon: 'Home',
    description: 'Revenus locatifs appartements ou locaux',
  },
];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  transactions,
  subCategories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  currency,
  language,
  initialTab = 'list',
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>(initialTab);
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');

  // Form State for New Category
  const [newLabel, setNewLabel] = useState('');
  const [newLabelDarija, setNewLabelDarija] = useState('');
  const [newType, setNewType] = useState<TransactionType>('expense');
  const [newBudget, setNewBudget] = useState('2000');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [newIcon, setNewIcon] = useState('ShoppingBag');
  const [formError, setFormError] = useState('');

  // Inline editing of existing budget
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [editingBudgetValue, setEditingBudgetValue] = useState<string>('');

  if (!isOpen) return null;

  const handleApplyTemplate = (tmpl: typeof QUICK_TEMPLATES[0]) => {
    setNewLabel(tmpl.label);
    setNewLabelDarija(tmpl.labelDarija);
    setNewType(tmpl.type);
    setNewBudget(tmpl.allocatedBudget.toString());
    setNewColor(tmpl.color);
    setNewIcon(tmpl.icon);
    setActiveTab('create');
    setFormError('');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newLabel.trim();
    if (!trimmed) {
      setFormError(language === 'ar_ma' ? 'Kteb smiya dyal l-catégorie 3afak' : 'Veuillez saisir un intitulé pour la catégorie');
      return;
    }

    // Check duplicate name
    const exists = categories.some((c) => c.label.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setFormError(language === 'ar_ma' ? 'Had l-catégorie kayna deja!' : 'Une catégorie avec ce nom existe déjà.');
      return;
    }

    const budgetVal = parseFloat(newBudget);
    if (isNaN(budgetVal) || budgetVal < 0) {
      setFormError(language === 'ar_ma' ? 'Dakhel montant mzyan d l-mizaniya' : 'Veuillez indiquer un montant de budget valide');
      return;
    }

    // Generate safe slug id
    const slug = trimmed
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 24);

    const newCategory: CategoryBudget = {
      id: `cat_${slug}_${Date.now().toString(36)}`,
      label: trimmed,
      labelDarija: newLabelDarija.trim() || trimmed,
      labelEn: trimmed,
      type: newType,
      allocatedBudget: budgetVal,
      color: newColor,
      icon: newIcon,
      isCustom: true,
    };

    onAddCategory(newCategory);

    // Reset form and switch to list tab
    setNewLabel('');
    setNewLabelDarija('');
    setNewBudget('2000');
    setFormError('');
    setActiveTab('list');
  };

  const handleStartEditBudget = (cat: CategoryBudget) => {
    setEditingBudgetId(cat.id);
    setEditingBudgetValue(cat.allocatedBudget.toString());
  };

  const handleSaveBudget = (cat: CategoryBudget) => {
    const val = parseFloat(editingBudgetValue);
    if (!isNaN(val) && val >= 0) {
      onUpdateCategory({
        ...cat,
        allocatedBudget: val,
      });
    }
    setEditingBudgetId(null);
  };

  // Helper to render icon
  const renderIconComponent = (iconName: string, className = 'w-4 h-4') => {
    switch (iconName) {
      case 'BookOpen': return <BookOpen className={className} />;
      case 'Heart': return <Heart className={className} />;
      case 'Car': return <Car className={className} />;
      case 'Plane': return <Plane className={className} />;
      case 'Gift': return <Gift className={className} />;
      case 'Laptop': return <Laptop className={className} />;
      case 'Briefcase': return <Briefcase className={className} />;
      case 'Home': return <Home className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'Coffee': return <Coffee className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Shield': return <Shield className={className} />;
      case 'TrendingUp': return <TrendingUp className={className} />;
      default: return <ShoppingBag className={className} />;
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (typeFilter === 'all') return true;
    return c.type === typeFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#FAF8F5] dark:bg-[#1C1A17] rounded-xl border border-[#DED7C9] dark:border-[#38342D] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E2D5] dark:border-[#312E28] bg-white dark:bg-[#23211D]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#A24824] text-white flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#25201B] dark:text-[#F2EFEA] flex items-center gap-2">
                <span>{language === 'ar_ma' ? 'Tanzim d l-Asnâaf (Catégories)' : 'Gestionnaire des Catégories de Budget'}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#EAE4D5] dark:bg-[#343029] text-[#6A6052] dark:text-[#AFA799] font-normal">
                  {categories.length} {language === 'ar_ma' ? 'sinf' : 'postes'}
                </span>
              </h3>
              <p className="text-xs text-[#807669] dark:text-[#9A9184]">
                {language === 'ar_ma'
                  ? 'Zid asnâaf jdad (Éducation, Sadaqa, Auto...) w 7added l-mizaniya dyal kol we7da'
                  : 'Créez de nouvelles catégories personnalisées, allouez leurs plafonds et suivez vos dépenses'}
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

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-[#E8E2D5] dark:border-[#312E28] bg-[#F4F0E8] dark:bg-[#201E1A]">
          <div className="flex items-center gap-1.5 p-1 bg-[#E8E2D4] dark:bg-[#2A2722] rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'list'
                  ? 'bg-white dark:bg-[#38342D] text-[#2B2621] dark:text-[#F5F2EB] shadow-2xs'
                  : 'text-[#6A6052] dark:text-[#9A9184] hover:text-[#2B2621] dark:hover:text-[#F2EFEA]'
              }`}
            >
              {language === 'ar_ma' ? 'Kolchi l-Asnâaf' : 'Toutes les catégories'} ({categories.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('create');
                setFormError('');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'create'
                  ? 'bg-[#A24824] text-white shadow-2xs font-semibold'
                  : 'text-[#6A6052] dark:text-[#9A9184] hover:text-[#2B2621] dark:hover:text-[#F2EFEA]'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'ar_ma' ? '+ Zid Sinf Jdid' : '+ Nouvelle Catégorie'}</span>
            </button>
          </div>

          {activeTab === 'list' && (
            <div className="flex items-center gap-1 text-xs">
              <span className="text-[11px] text-[#7A7061] dark:text-[#958D80] hidden sm:inline mr-1">
                {language === 'ar_ma' ? 'Filtri:' : 'Filtrer:'}
              </span>
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-2 py-1 rounded text-[11px] font-medium ${
                  typeFilter === 'all'
                    ? 'bg-white dark:bg-[#343029] text-[#25201B] dark:text-[#F2EFEA] shadow-2xs'
                    : 'text-[#7A7061] dark:text-[#958D80]'
                }`}
              >
                {language === 'ar_ma' ? 'Kolchi' : 'Tous'}
              </button>
              <button
                onClick={() => setTypeFilter('expense')}
                className={`px-2 py-1 rounded text-[11px] font-medium ${
                  typeFilter === 'expense'
                    ? 'bg-white dark:bg-[#343029] text-[#A24824] dark:text-[#E8734C] shadow-2xs'
                    : 'text-[#7A7061] dark:text-[#958D80]'
                }`}
              >
                {language === 'ar_ma' ? 'Masrouf' : 'Dépenses'}
              </button>
              <button
                onClick={() => setTypeFilter('income')}
                className={`px-2 py-1 rounded text-[11px] font-medium ${
                  typeFilter === 'income'
                    ? 'bg-white dark:bg-[#343029] text-[#3B6B55] dark:text-[#529375] shadow-2xs'
                    : 'text-[#7A7061] dark:text-[#958D80]'
                }`}
              >
                {language === 'ar_ma' ? 'Madkhoul' : 'Revenus'}
              </button>
            </div>
          )}
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: LIST VIEW */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              {/* Quick suggestion banner */}
              <div className="p-3.5 bg-[#FAF4ED] dark:bg-[#25201B] border border-[#ECDCCF] dark:border-[#3D322A] rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#A24824] shrink-0" />
                  <p className="text-xs text-[#524538] dark:text-[#D5CBC1]">
                    {language === 'ar_ma'
                      ? 'Khastek chi catégorie khora b7al Ta3lim, Sadaqa wla Safariyat ?'
                      : 'Besoin d’un nouveau poste de dépense comme l’Éducation, les Dons ou les Voyages ?'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-3 py-1 bg-[#A24824] hover:bg-[#8F3E1E] text-white text-xs font-semibold rounded-lg shrink-0 shadow-2xs transition-colors"
                >
                  {language === 'ar_ma' ? '+ Zid db' : '+ Ajouter'}
                </button>
              </div>

              {/* Categories Grid/List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredCategories.map((cat) => {
                  const txList = transactions.filter((t) => t.category === cat.id);
                  const totalSpent = txList.reduce((sum, t) => sum + t.amount, 0);
                  const catSubCount = subCategories.filter((s) => s.categoryId === cat.id).length;
                  const attainment = cat.allocatedBudget > 0 ? (totalSpent / cat.allocatedBudget) * 100 : 0;
                  const isEditingThis = editingBudgetId === cat.id;

                  return (
                    <div
                      key={cat.id}
                      className="p-4 bg-white dark:bg-[#22201C] rounded-xl border border-[#E5E0D5] dark:border-[#333029] hover:border-[#D1C9BC] dark:hover:border-[#474136] transition-all flex flex-col justify-between gap-3 shadow-2xs"
                    >
                      {/* Top Bar of Card */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
                            style={{ backgroundColor: cat.color }}
                          >
                            {renderIconComponent(cat.icon, 'w-5 h-5')}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-serif font-bold text-sm text-[#25201B] dark:text-[#F2EFEA]">
                                {cat.label}
                              </h4>
                              {cat.isCustom && (
                                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 bg-[#FAF0E6] dark:bg-[#342721] text-[#A24824] dark:text-[#E8734C] rounded border border-[#EAD5C5] dark:border-[#4D3328]">
                                  {language === 'ar_ma' ? 'Jdid' : 'Personnalisé'}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#807669] dark:text-[#9A9184]">
                              {cat.labelDarija}
                            </p>
                          </div>
                        </div>

                        {/* Type badge */}
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${
                            cat.type === 'income'
                              ? 'bg-[#EAF3EE] dark:bg-[#1D3025] text-[#3B6B55] dark:text-[#64B08A]'
                              : 'bg-[#F9ECE7] dark:bg-[#341F1A] text-[#A24824] dark:text-[#E8734C]'
                          }`}
                        >
                          {cat.type === 'income' ? (
                            <>
                              <ArrowUpRight className="w-3 h-3" />
                              <span>{language === 'ar_ma' ? 'Madkhoul' : 'Revenu'}</span>
                            </>
                          ) : (
                            <>
                              <ArrowDownLeft className="w-3 h-3" />
                              <span>{language === 'ar_ma' ? 'Masrouf' : 'Dépense'}</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Budget row & editing */}
                      <div className="pt-2 border-t border-[#F0EBE0] dark:border-[#2C2924] space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#6F6659] dark:text-[#9A9184] font-medium">
                            {language === 'ar_ma' ? 'Plafond mensuel:' : 'Plafond alloué:'}
                          </span>

                          {isEditingThis ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                step="100"
                                value={editingBudgetValue}
                                onChange={(e) => setEditingBudgetValue(e.target.value)}
                                className="w-24 px-2 py-1 text-xs font-mono font-bold bg-[#FAF8F5] dark:bg-[#1C1A17] border border-[#A24824] rounded focus:outline-none"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveBudget(cat)}
                                className="p-1 bg-[#3B6B55] text-white rounded hover:bg-[#315746]"
                                title="Valider"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingBudgetId(null)}
                                className="p-1 bg-[#DED7C9] dark:bg-[#38342D] text-[#554E43] dark:text-[#D5CFC5] rounded"
                                title="Annuler"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-[#25201B] dark:text-[#F2EFEA]">
                                {Math.round(cat.allocatedBudget).toLocaleString('fr-FR')} {currency}
                              </span>
                              <button
                                onClick={() => handleStartEditBudget(cat)}
                                className="p-1 text-[#8A8071] hover:text-[#A24824] dark:hover:text-[#E8734C] rounded transition-colors"
                                title="Modifier le plafond budgétaire"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Progress Bar for Budget */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="text-[#847A6B] dark:text-[#9A9184]">
                              {language === 'ar_ma' ? 'Mkhsour 7alian:' : 'Consommé:'}{' '}
                              <strong className="text-[#25201B] dark:text-[#F2EFEA] font-mono">
                                {Math.round(totalSpent).toLocaleString('fr-FR')} {currency}
                              </strong>
                            </span>
                            <span className={`font-mono font-semibold ${attainment > 100 ? 'text-[#DC2626]' : 'text-[#847A6B] dark:text-[#9A9184]'}`}>
                              {Math.round(attainment)}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-[#EDE8DE] dark:bg-[#2F2C26] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                attainment > 100
                                  ? 'bg-[#DC2626]'
                                  : attainment > 80
                                  ? 'bg-[#D97706]'
                                  : 'bg-[#3B6B55]'
                              }`}
                              style={{ width: `${Math.min(attainment, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Subcategories count & actions */}
                        <div className="flex items-center justify-between pt-1 text-[11px] text-[#7A7061] dark:text-[#958D80]">
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3 text-[#A24824]" />
                            <span>
                              {catSubCount} {language === 'ar_ma' ? 'sous-catégories' : 'sous-catégories'} · {txList.length} tx
                            </span>
                          </span>

                          {cat.isCustom ? (
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    language === 'ar_ma'
                                      ? `Bghiti t-mssa7 la catégorie "${cat.labelDarija || cat.label}" ?`
                                      : `Voulez-vous supprimer la catégorie personnalisée "${cat.label}" ?`
                                  )
                                ) {
                                  onDeleteCategory(cat.id);
                                }
                              }}
                              className="text-[#DC2626] hover:text-[#991B1B] font-medium flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#FEE2E2] dark:hover:bg-[#3E1B1B] transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>{language === 'ar_ma' ? 'Mseh' : 'Supprimer'}</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-[#AFA79A] dark:text-[#6C6559]">
                              {language === 'ar_ma' ? 'Sinf asasi' : 'Standard'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CREATE CATEGORY FORM */}
          {activeTab === 'create' && (
            <div className="space-y-6">
              {/* Moroccan Ready Templates */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7A7061] dark:text-[#958D80] mb-2">
                  {language === 'ar_ma' ? 'Modèles w I9tirahat sari3a (Templates):' : 'Modèles rapides prêts à l’emploi :'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {QUICK_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyTemplate(tmpl)}
                      className="text-left p-2.5 bg-white dark:bg-[#23211D] border border-[#E5E0D5] dark:border-[#333029] hover:border-[#A24824] dark:hover:border-[#E8734C] rounded-lg transition-all group flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: tmpl.color }}
                        >
                          {renderIconComponent(tmpl.icon, 'w-3.5 h-3.5')}
                        </div>
                        <span className="font-semibold text-xs text-[#25201B] dark:text-[#F2EFEA] truncate">
                          {tmpl.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#7A7061] dark:text-[#958D80]">
                        <span>{tmpl.allocatedBudget} {currency}</span>
                        <span className="text-[#A24824] dark:text-[#E8734C] group-hover:underline">Utiliser</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Creation Form */}
              <form onSubmit={handleCreateSubmit} className="space-y-4 bg-white dark:bg-[#23211D] p-5 rounded-xl border border-[#E5E0D5] dark:border-[#333029] shadow-2xs">
                {formError && (
                  <div className="p-3 bg-[#FEF2F2] dark:bg-[#3B1E1E] border border-[#FCA5A5] text-[#DC2626] rounded-lg text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Type Selection */}
                <div>
                  <label className="block text-xs font-semibold text-[#484036] dark:text-[#D5CFC5] mb-1.5">
                    {language === 'ar_ma' ? 'Naw3 d l-poste (Type)' : 'Type de catégorie'} *
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-[#EAE5D9] dark:bg-[#2B2822] rounded-lg">
                    <button
                      type="button"
                      onClick={() => setNewType('expense')}
                      className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
                        newType === 'expense'
                          ? 'bg-white dark:bg-[#38342D] text-[#A24824] dark:text-[#E8734C] shadow-xs'
                          : 'text-[#6A6052] dark:text-[#9A9184]'
                      }`}
                    >
                      <ArrowDownLeft className="w-4 h-4 text-[#A24824]" />
                      <span>{language === 'ar_ma' ? 'Kankhser (Dépense)' : 'Dépense (Sortie de fonds)'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewType('income')}
                      className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
                        newType === 'income'
                          ? 'bg-white dark:bg-[#38342D] text-[#3B6B55] dark:text-[#529375] shadow-xs'
                          : 'text-[#6A6052] dark:text-[#9A9184]'
                      }`}
                    >
                      <ArrowUpRight className="w-4 h-4 text-[#3B6B55]" />
                      <span>{language === 'ar_ma' ? 'Kandkhel (Revenu)' : 'Revenu (Rentrée d’argent)'}</span>
                    </button>
                  </div>
                </div>

                {/* Names (FR + Darija) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#484036] dark:text-[#D5CFC5] mb-1">
                      {language === 'ar_ma' ? 'Smiya b Français' : 'Intitulé de la catégorie (Français)'} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ex. Éducation & Scolarité"
                      value={newLabel}
                      onChange={(e) => {
                        setNewLabel(e.target.value);
                        setFormError('');
                      }}
                      className="w-full bg-[#FAF8F5] dark:bg-[#1C1A17] border border-[#D5CDBC] dark:border-[#3D382F] rounded-lg px-3 py-2 text-xs text-[#25201B] dark:text-[#F2EFEA] focus:outline-none focus:ring-2 focus:ring-[#A24824]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#484036] dark:text-[#D5CFC5] mb-1">
                      {language === 'ar_ma' ? 'Smiya b Darija' : 'Intitulé en Darija marocaine (Optionnel)'}
                    </label>
                    <input
                      type="text"
                      placeholder="ex. Ta3lim w Drari"
                      value={newLabelDarija}
                      onChange={(e) => setNewLabelDarija(e.target.value)}
                      className="w-full bg-[#FAF8F5] dark:bg-[#1C1A17] border border-[#D5CDBC] dark:border-[#3D382F] rounded-lg px-3 py-2 text-xs text-[#25201B] dark:text-[#F2EFEA] focus:outline-none focus:ring-2 focus:ring-[#A24824]"
                    />
                  </div>
                </div>

                {/* Budget Ceiling */}
                <div>
                  <label className="block text-xs font-semibold text-[#484036] dark:text-[#D5CFC5] mb-1">
                    {language === 'ar_ma' ? 'Plafond d l-mizaniya l-ch-har (DH)' : 'Plafond mensuel alloué (Budget cible en DH)'} *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="100"
                      required
                      placeholder="ex. 2500"
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      className="w-full bg-[#FAF8F5] dark:bg-[#1C1A17] border border-[#D5CDBC] dark:border-[#3D382F] rounded-lg px-3.5 py-2 font-mono font-bold text-sm text-[#25201B] dark:text-[#F2EFEA] focus:outline-none focus:ring-2 focus:ring-[#A24824]"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#847A6B] dark:text-[#9A9184]">
                      {currency === 'MAD' ? 'DH' : currency}
                    </span>
                  </div>
                </div>

                {/* Color and Icon row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Color Palette */}
                  <div>
                    <label className="block text-xs font-semibold text-[#484036] dark:text-[#D5CFC5] mb-1.5">
                      {language === 'ar_ma' ? 'Loun dyal l-catégorie' : 'Couleur thématique'}
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewColor(c)}
                          style={{ backgroundColor: c }}
                          className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center text-white ${
                            newColor === c ? 'ring-2 ring-offset-2 ring-[#A24824] scale-110 shadow-xs' : 'hover:scale-105'
                          }`}
                        >
                          {newColor === c && <Check className="w-4 h-4 drop-shadow" />}
                        </button>
                      ))}
                      <input
                        type="color"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        className="w-7 h-7 rounded-full cursor-pointer border-0 p-0 bg-transparent"
                        title="Couleur personnalisée"
                      />
                    </div>
                  </div>

                  {/* Icon Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-[#484036] dark:text-[#D5CFC5] mb-1.5">
                      {language === 'ar_ma' ? 'Icoon (Icône)' : 'Icône représentative'}
                    </label>
                    <div className="grid grid-cols-7 gap-1.5 bg-[#FAF8F5] dark:bg-[#1C1A17] p-2 rounded-lg border border-[#D5CDBC] dark:border-[#3D382F]">
                      {PRESET_ICONS.map((ic) => (
                        <button
                          key={ic.name}
                          type="button"
                          onClick={() => setNewIcon(ic.name)}
                          title={ic.label}
                          className={`p-1.5 rounded flex items-center justify-center transition-colors ${
                            newIcon === ic.name
                              ? 'bg-[#A24824] text-white shadow-2xs'
                              : 'text-[#6A6052] dark:text-[#AFA799] hover:bg-[#EAE4D5] dark:hover:bg-[#2C2923]'
                          }`}
                        >
                          {renderIconComponent(ic.name, 'w-4 h-4')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live Preview Card */}
                <div className="p-3 bg-[#FAF8F5] dark:bg-[#1C1A17] rounded-lg border border-[#E5E0D5] dark:border-[#333029]">
                  <span className="block text-[11px] font-semibold text-[#807669] dark:text-[#9A9184] mb-2">
                    {language === 'ar_ma' ? 'Aperçu kif ghadi tban:' : 'Aperçu en temps réel :'}
                  </span>
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-[#22201C] rounded-lg border border-[#E5E0D5] dark:border-[#333029]">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: newColor }}
                      >
                        {renderIconComponent(newIcon, 'w-5 h-5')}
                      </div>
                      <div>
                        <div className="font-serif font-bold text-sm text-[#25201B] dark:text-[#F2EFEA]">
                          {newLabel.trim() || (language === 'ar_ma' ? 'Smiya d l-catégorie' : 'Nom de la catégorie')}
                        </div>
                        <div className="text-xs text-[#807669] dark:text-[#9A9184]">
                          {newLabelDarija.trim() || newLabel.trim() || 'Smiya b Darija'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-xs text-[#25201B] dark:text-[#F2EFEA] block">
                        {parseFloat(newBudget) || 0} {currency}
                      </span>
                      <span className="text-[10px] text-[#A24824] font-semibold uppercase">
                        {newType === 'income' ? 'Revenu' : 'Dépense'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2D5] dark:border-[#312E28]">
                  <button
                    type="button"
                    onClick={() => setActiveTab('list')}
                    className="px-4 py-2 border border-[#D5CDBC] dark:border-[#3D382F] hover:bg-[#F2EEE4] dark:hover:bg-[#2F2C26] text-[#484036] dark:text-[#D5CFC5] text-xs font-semibold rounded-lg transition-colors"
                  >
                    {language === 'ar_ma' ? 'Ilgha2' : 'Annuler'}
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#A24824] hover:bg-[#8F3E1E] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === 'ar_ma' ? 'Zid had l-catégorie' : 'Créer cette Catégorie'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E8E2D5] dark:border-[#312E28] bg-white dark:bg-[#23211D] flex items-center justify-between text-xs text-[#807669] dark:text-[#9A9184]">
          <span>
            {language === 'ar_ma'
              ? 'Koulchi kayt-sauvegarda f téléphone/pc dyalk direct.'
              : 'Données synchronisées automatiquement en mémoire locale.'}
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-[#FAF8F5] dark:bg-[#2B2822] border border-[#D5CDBC] dark:border-[#3D382F] hover:bg-[#F2EEE4] dark:hover:bg-[#343029] text-[#25201B] dark:text-[#F2EFEA] font-semibold rounded-lg transition-colors"
          >
            {language === 'ar_ma' ? 'Sedd' : 'Fermer'}
          </button>
        </div>

      </div>
    </div>
  );
};

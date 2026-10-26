import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, PaymentMethod, CategoryBudget, SubCategory, TransactionItem, Currency, Language } from '../types';
import { X, PlusCircle, CheckCircle2, ArrowDownLeft, ArrowUpRight, Tag, Plus, Trash2, Receipt, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id'>, editId?: string) => void;
  categories: CategoryBudget[];
  subCategories: SubCategory[];
  onAddCustomCategory?: (newCat: CategoryBudget) => void;
  onAddCustomSubCategory?: (newSub: SubCategory) => void;
  editingTransaction?: Transaction | null;
  initialDate?: string;
  initialCategory?: string;
  initialType?: TransactionType;
  currency: Currency;
  language: Language;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  subCategories,
  onAddCustomCategory,
  onAddCustomSubCategory,
  editingTransaction,
  initialDate,
  initialCategory,
  initialType,
  currency,
  language,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('alimentation');
  const [subCategory, setSubCategory] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('carte');
  const [recipientOrSource, setRecipientOrSource] = useState<string>('');

  // Itemized line-items state (Atay, Sokar, Hlib, etc.)
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [showItemDetails, setShowItemDetails] = useState<boolean>(false);

  // Inline custom category creation state
  const [isCreatingCategory, setIsCreatingCategory] = useState<boolean>(false);
  const [customCatName, setCustomCatName] = useState<string>('');
  const [customCatNameDarija, setCustomCatNameDarija] = useState<string>('');
  const [customCatBudget, setCustomCatBudget] = useState<string>('2000');
  const [customCatColor, setCustomCatColor] = useState<string>('#A24824');

  // Inline custom subcategory creation form
  const [isCreatingSubCat, setIsCreatingSubCat] = useState<boolean>(false);
  const [customSubName, setCustomSubName] = useState<string>('');
  const [customSubNameDarija, setCustomSubNameDarija] = useState<string>('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setSubCategory(editingTransaction.subCategory || '');
      setDate(editingTransaction.date);
      setNote(editingTransaction.note);
      setPaymentMethod(editingTransaction.paymentMethod);
      setRecipientOrSource(editingTransaction.recipientOrSource || '');
      setItems(editingTransaction.items ? [...editingTransaction.items] : []);
      setShowItemDetails(Boolean(editingTransaction.items && editingTransaction.items.length > 0));
    } else {
      // defaults
      const targetType = initialType || 'expense';
      setType(targetType);
      setAmount('');
      const defaultCat = initialCategory || categories.find((c) => c.type === targetType)?.id || (targetType === 'income' ? 'salaire' : 'alimentation');
      setCategory(defaultCat);
      setSubCategory('');
      setDate(initialDate || new Date().toISOString().split('T')[0]);
      setNote('');
      setPaymentMethod('carte');
      setRecipientOrSource('');
      setItems([]);
      setShowItemDetails(false);
    }
    setIsCreatingCategory(false);
    setCustomCatName('');
    setCustomCatNameDarija('');
    setCustomCatBudget('2000');
    setCustomCatColor((initialType || type) === 'income' ? '#3B6B55' : '#A24824');
    setIsCreatingSubCat(false);
    setCustomSubName('');
    setCustomSubNameDarija('');
  }, [editingTransaction, isOpen, categories, initialDate, initialCategory, initialType]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === type);
  const availableSubCategories = subCategories.filter((s) => s.categoryId === category);

  // Calculate sum of line items
  const itemsSum = items.reduce((sum, it) => sum + (it.totalPrice || 0), 0);

  // Line item handlers
  const handleAddItem = (presetName?: string, presetPrice?: number) => {
    const newItem: TransactionItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: presetName || '',
      quantity: 1,
      unitPrice: presetPrice || 0,
      totalPrice: presetPrice || 0,
    };
    setItems((prev) => [...prev, newItem]);
    if (!showItemDetails) setShowItemDetails(true);
  };

  const handleUpdateItem = (id: string, field: keyof TransactionItem, val: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: val };
        if (field === 'quantity' || field === 'unitPrice') {
          const q = field === 'quantity' ? Number(val) || 1 : item.quantity || 1;
          const p = field === 'unitPrice' ? Number(val) || 0 : item.unitPrice || 0;
          updated.totalPrice = Math.round(q * p * 100) / 100;
        }
        return updated;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleSyncAmountFromItems = () => {
    if (itemsSum > 0) {
      setAmount(itemsSum.toString());
    }
  };

  // Inline custom category submission
  const handleSaveCustomCategory = (e: React.MouseEvent) => {
    e.preventDefault();
    const trimmed = customCatName.trim();
    if (!trimmed) return;

    const budgetVal = parseFloat(customCatBudget) || 2000;
    const slug = trimmed
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 24);

    const newCat: CategoryBudget = {
      id: `cat_${slug}_${Date.now().toString(36)}`,
      label: trimmed,
      labelDarija: customCatNameDarija.trim() || trimmed,
      labelEn: trimmed,
      type,
      allocatedBudget: budgetVal,
      color: customCatColor || (type === 'income' ? '#3B6B55' : '#A24824'),
      icon: type === 'income' ? 'TrendingUp' : 'ShoppingBag',
      isCustom: true,
    };

    if (onAddCustomCategory) {
      onAddCustomCategory(newCat);
    }
    setCategory(newCat.id);
    setSubCategory('');
    setIsCreatingCategory(false);
    setCustomCatName('');
    setCustomCatNameDarija('');
    setCustomCatBudget('2000');
  };

  // Inline custom subcategory submission
  const handleSaveCustomSubCategory = (e: React.MouseEvent) => {
    e.preventDefault();
    const trimmed = customSubName.trim();
    if (!trimmed) return;

    const newSub: SubCategory = {
      id: `custom-sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      categoryId: category,
      name: trimmed,
      nameDarija: customSubNameDarija.trim() || undefined,
      isCustom: true,
    };

    if (onAddCustomSubCategory) {
      onAddCustomSubCategory(newSub);
    }
    setSubCategory(newSub.id);
    setIsCreatingSubCat(false);
    setCustomSubName('');
    setCustomSubNameDarija('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    // Filter valid items
    const validItems = items.filter((it) => it.name.trim() !== '');

    onSave(
      {
        type,
        amount: num,
        category,
        subCategory: subCategory || undefined,
        date,
        note: note.trim() || (type === 'income' ? 'Rentrée d’argent' : 'Dépense courante'),
        paymentMethod,
        recipientOrSource: recipientOrSource.trim() || undefined,
        items: validItems.length > 0 ? validItems : undefined,
      },
      editingTransaction ? editingTransaction.id : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#FAF8F5] dark:bg-[#1C1A17] rounded-xl border border-[#DED7C9] dark:border-[#38342D] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E2D5] dark:border-[#312E28] bg-white dark:bg-[#23211D]">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${type === 'income' ? 'bg-[#3B6B55]' : 'bg-[#A24824]'}`}>
              {type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#25201B] dark:text-[#F2EFEA]">
                {editingTransaction
                  ? language === 'ar_ma'
                    ? 'Beddel l&apos;Opération'
                    : 'Modifier l&apos;opération'
                  : language === 'ar_ma'
                  ? 'Zid Flous / Masrouf Jdid'
                  : 'Nouvelle Transaction'}
              </h3>
              <p className="text-xs text-[#807669] dark:text-[#9A9184]">
                {language === 'ar_ma'
                  ? 'Dakhel chehal kheserti w khtar sous-catégorie w articles'
                  : 'Enregistrez votre opération avec sous-catégorie et détail des articles'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Type Segmented selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#EAE5D9] dark:bg-[#2B2822] rounded-lg">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                const cat = categories.find((c) => c.type === 'expense');
                if (cat) {
                  setCategory(cat.id);
                  setSubCategory('');
                }
              }}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
                type === 'expense'
                  ? 'bg-white dark:bg-[#38342D] text-[#A24824] dark:text-[#E8734C] shadow-xs'
                  : 'text-[#6A6052] dark:text-[#9A9184] hover:text-[#25201B] dark:hover:text-[#F2EFEA]'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4 text-[#A24824] dark:text-[#E8734C]" />
              <span>{language === 'ar_ma' ? 'Kankhser (Dépense)' : 'Dépense (Sortie)'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                const cat = categories.find((c) => c.type === 'income');
                if (cat) {
                  setCategory(cat.id);
                  setSubCategory('');
                }
              }}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
                type === 'income'
                  ? 'bg-white dark:bg-[#38342D] text-[#3B6B55] dark:text-[#52A36F] shadow-xs'
                  : 'text-[#6A6052] dark:text-[#9A9184] hover:text-[#25201B] dark:hover:text-[#F2EFEA]'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-[#3B6B55] dark:text-[#52A36F]" />
              <span>{language === 'ar_ma' ? 'Kandkhel (Revenu)' : 'Revenu (Entrée)'}</span>
            </button>
          </div>

          {/* Amount & Currency */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#484036] dark:text-[#D5CFC5]">
                {language === 'ar_ma' ? 'Chhal d lflous (Montant)' : 'Montant total'} ({currency}) *
              </label>
              {itemsSum > 0 && (
                <button
                  type="button"
                  onClick={handleSyncAmountFromItems}
                  className="text-[11px] font-semibold text-[#A24824] dark:text-[#E8734C] hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>
                    {language === 'ar_ma'
                      ? `DIR l-majmoo3 d les articles (${Math.round(itemsSum)} ${currency === 'MAD' ? 'DH' : currency})`
                      : `Appliquer somme articles (${Math.round(itemsSum)} ${currency === 'MAD' ? 'DH' : currency})`}
                  </span>
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.01"
                required
                placeholder="ex. 1500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white dark:bg-[#24221D] border border-[#D5CDBC] dark:border-[#3D382F] rounded-lg px-3.5 py-2.5 text-lg font-bold font-mono text-[#25201B] dark:text-[#F2EFEA] placeholder-[#AFA799] dark:placeholder-[#6C6458] focus:outline-none focus:ring-2 focus:ring-[#A24824] focus:border-transparent tabular-nums"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#847A6B] dark:text-[#9A9184]">
                {currency === 'MAD' ? 'DH' : currency}
              </span>
            </div>
          </div>

          {/* Category & SubCategory Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category Select */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#484036] dark:text-[#D5CFC5]">
                  {language === 'ar_ma' ? 'As-naf (Catégorie)' : 'Catégorie principale'} *
                </label>
                <button
                  type="button"
                  onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                  className="text-[11px] font-semibold text-[#A24824] dark:text-[#E8734C] hover:underline"
                >
                  {isCreatingCategory
                    ? language === 'ar_ma' ? 'Ilgha2' : 'Annuler'
                    : language === 'ar_ma' ? '+ Zid Catégorie' : '+ Catégorie'}
                </button>
              </div>
              <select
                value={category}
                onChange={(e) => {
                  if (e.target.value === '__CREATE_NEW_CAT__') {
                    setIsCreatingCategory(true);
                  } else {
                    setCategory(e.target.value);
                    setSubCategory('');
                  }
                }}
                className="w-full bg-white dark:bg-[#24221D] border border-[#D5CDBC] dark:border-[#3D382F] rounded-lg px-3 py-2 text-xs text-[#25201B] dark:text-[#F2EFEA] font-medium focus:outline-none focus:ring-1 focus:ring-[#A24824]"
              >
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {language === 'ar_ma' ? cat.labelDarija : cat.label}
                    {cat.isCustom ? ' (Personnalisée)' : ''}
                  </option>
                ))}
                <option value="__CREATE_NEW_CAT__">
                  {language === 'ar_ma' ? '+ Zid sinf / catégorie jdida...' : '+ Créer une nouvelle catégorie...'}
                </option>
              </select>
            </div>

            {/* Sub-Category Select + Create Custom trigger */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#484036] dark:text-[#D5CFC5]">
                  {language === 'ar_ma' ? 'Sous-catégorie' : 'Sous-Catégorie'}
                </label>
                <button
                  type="button"
                  onClick={() => setIsCreatingSubCat(!isCreatingSubCat)}
                  className="text-[11px] font-semibold text-[#A24824] dark:text-[#E8734C] hover:underline"
                >
                  {isCreatingSubCat
                    ? language === 'ar_ma' ? 'Ilgha2' : 'Annuler'
                    : language === 'ar_ma' ? '+ Zid sous-catégorie' : '+ Personnaliser'}
                </button>
              </div>

              <div className="relative">
                <select
                  value={subCategory}
                  onChange={(e) => {
                    if (e.target.value === '__CREATE_NEW__') {
                      setIsCreatingSubCat(true);
                      setSubCategory('');
                    } else {
                      setSubCategory(e.target.value);
                    }
                  }}
                  className="w-full bg-white dark:bg-[#24221D] border border-[#D5CDBC] dark:border-[#3D382F] rounded-lg px-3 py-2 text-xs text-[#25201B] dark:text-[#F2EFEA] font-medium focus:outline-none focus:ring-1 focus:ring-[#A24824]"
                >
                  <option value="">
                    {language === 'ar_ma' ? '-- Khtar sous-catégorie (Optionnelle) --' : '-- Sélectionner une sous-catégorie (Optionnel) --'}
                  </option>
                  {availableSubCategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {language === 'ar_ma' && sub.nameDarija ? sub.nameDarija : sub.name}
                      {sub.isCustom ? ' (Personnalisée)' : ''}
                    </option>
                  ))}
                  <option value="__CREATE_NEW__">
                    {language === 'ar_ma' ? '+ Zid sous-catégorie jdida...' : '+ Créer une nouvelle sous-catégorie...'}
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Inline Custom Category Creation Box */}
          {isCreatingCategory && (
            <div className="p-3 bg-[#FAF4ED] dark:bg-[#2B231D] rounded-xl border border-[#ECDCCF] dark:border-[#423126] space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-bold text-[#3B342A] dark:text-[#F2EFEA]">
                <span className="flex items-center gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5 text-[#A24824]" />
                  <span>
                    {language === 'ar_ma'
                      ? `Zid Catégorie jdida (${type === 'income' ? 'Madkhoul' : 'Masrouf'})`
                      : `Nouvelle catégorie (${type === 'income' ? 'Revenu' : 'Dépense'})`}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreatingCategory(false)}
                  className="text-[#84796B] hover:text-[#25201B]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="ex. Éducation, Sadaqa, Vétérinaire..."
                  value={customCatName}
                  onChange={(e) => setCustomCatName(e.target.value)}
                  className="bg-white dark:bg-[#1E1D19] border border-[#D5CDBC] dark:border-[#3D382F] rounded-lg px-2.5 py-1.5 text-xs text-[#25201B] dark:text-[#F2EFEA] focus:outline-none focus:ring-1 focus:ring-[#A24824]"
                />
                <input
                  type="text"
                  placeholder="ex. Smiya b Darija (Optionnel)"
                  value={customCatNameDarija}
                  onChange={(e) => setCustomCatNameDarija(e.target.value)}
                  className="bg-white dark:bg-[#1E1D19] border border-[#D5CDBC] dark:border-[#3D382F] rounded-lg px-2.5 py-1.5 text-xs text-[#25201B] dark:text-[#F2EFEA] focus:outline-none focus:ring-1 focus:ring-[#A24824]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#7A7061] dark:text-[#958D80]">
                    {language === 'ar_ma' ? 'Plafond:' : 'Plafond mensuel:'}
                  </span>
                  <div className="relative w-28">
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={customCatBudget}
                      onChange={(e) => setCustomCatBudget(e.target.value)}
                      placeholder="2000"
                      className="w-full bg-white dark:bg-[#1E1D19] border border-[#D5CDBC] dark:border-[#3D382F] rounded px-2 py-1 text-xs font-mono font-bold text-[#25201B] dark:text-[#F2EFEA] focus:outline-none"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#847A6B]">
                      {currency === 'MAD' ? 'DH' : currency}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#7A7061] dark:text-[#958D80]">
                    Couleur:
                  </span>
                  <input
                    type="color"
                    value={customCatColor}
                    onChange={(e) => setCustomCatColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCreatingCategory(false)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-[#665D50] hover:text-[#25201B]"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCustomCategory}
                    disabled={!customCatName.trim()}
                    className="px-3 py-1 bg-[#A24824] hover:bg-[#8F3E1E] disabled:opacity-50 text-white text-[11px] font-semibold rounded-lg shadow-2xs"
                  >
                    {language === 'ar_ma' ? '+ Zid l-catégorie' : '+ Créer & utiliser'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Inline Custom Subcategory Creation Box */}
          {isCreatingSubCat && (
            <div className="p-3 bg-[#F4EFE6] dark:bg-[#26241F] rounded-xl border border-[#DED5C5] dark:border-[#3D382F] space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-bold text-[#3B342A] dark:text-[#F2EFEA]">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#A24824]" />
                  <span>
                    {language === 'ar_ma'
                      ? 'Zid sous-catégorie jdida f had l-poste'
                      : `Nouvelle sous-catégorie dans "${categories.find((c) => c.id === category)?.label}"`}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreatingSubCat(false)}
                  className="text-[#84796B] hover:text-[#25201B]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder={
                    category === 'alimentation'
                      ? 'ex. Épicerie fine, Bio...'
                      : 'ex. Nom de la sous-catégorie'
                  }
                  value={customSubName}
                  onChange={(e) => setCustomSubName(e.target.value)}
                  className="bg-white dark:bg-[#1E1D19] border border-[#D5CDBC] dark:border-[#3D382F] rounded-lg px-2.5 py-1.5 text-xs text-[#25201B] dark:text-[#F2EFEA] focus:outline-none focus:ring-1 focus:ring-[#A24824]"
                />
                <input
                  type="text"
                  placeholder="ex. Teqdia d Hanout (Darija)"
                  value={customSubNameDarija}
                  onChange={(e) => setCustomSubNameDarija(e.target.value)}
                  className="bg-white dark:bg-[#1E1D19] border border-[#D5CDBC] dark:border-[#3D382F] rounded-lg px-2.5 py-1.5 text-xs text-[#25201B] dark:text-[#F2EFEA] focus:outline-none focus:ring-1 focus:ring-[#A24824]"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingSubCat(false)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-[#665D50] hover:text-[#25201B]"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomSubCategory}
                  disabled={!customSubName.trim()}
                  className="px-3 py-1 bg-[#A24824] hover:bg-[#8F3E1E] disabled:opacity-50 text-white text-[11px] font-semibold rounded-lg shadow-2xs"
                >
                  {language === 'ar_ma' ? '+ Zid w khtarha' : '+ Créer et sélectionner'}
                </button>
              </div>
            </div>
          )}

          {/* Date & Note Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#484036] dark:text-[#D5CFC5] mb-1">
                {language === 'ar_ma' ? 'Tarikh (Date)' : 'Date'} *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white dark:bg-[#24221D] border border-[#D5CDBC] dark:border-[#3D382F] rounded-lg px-3 py-2 text-xs text-[#25201B] dark:text-[#F2EFEA] font-medium focus:outline-none focus:ring-1 focus:ring-[#A24824]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#484036] dark:text-[#D5CFC5] mb-1">
                {language === 'ar_ma' ? 'Mola7ada (Description)' : 'Description / Note'}
              </label>
              <input
                type="text"
                placeholder={
                  type === 'income'
                    ? language === 'ar_ma' ? 'ex. Salair d ch-har' : 'ex. Salaire mensuel'
                    : language === 'ar_ma' ? 'ex. Courses Marjane' : 'ex. Courses supermarché'
                }
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-white dark:bg-[#24221D] border border-[#D5CDBC] dark:border-[#3D382F] rounded-lg px-3 py-2 text-xs text-[#25201B] dark:text-[#F2EFEA] placeholder-[#AFA799] dark:placeholder-[#6C6458] focus:outline-none focus:ring-1 focus:ring-[#A24824]"
              />
            </div>
          </div>

          {/* Beneficiary & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#484036] dark:text-[#D5CFC5] mb-1">
                {language === 'ar_ma' ? 'Mnin / Lmen (Tiers / Organisme)' : 'Tiers / Bénéficiaire'}
              </label>
              <input
                type="text"
                placeholder="ex. Marjane, Afriquia, Entreprise..."
                value={recipientOrSource}
                onChange={(e) => setRecipientOrSource(e.target.value)}
                className="w-full bg-white dark:bg-[#24221D] border border-[#D5CDBC] dark:border-[#3D382F] rounded-lg px-3 py-2 text-xs text-[#25201B] dark:text-[#F2EFEA] placeholder-[#AFA799] dark:placeholder-[#6C6458] focus:outline-none focus:ring-1 focus:ring-[#A24824]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#484036] dark:text-[#D5CFC5] mb-1">
                {language === 'ar_ma' ? 'Tariqat L-khalass (Paiement)' : 'Moyen de règlement'}
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {[
                  { id: 'carte', label: 'Carte' },
                  { id: 'virement', label: 'Virement' },
                  { id: 'especes', label: 'Espèces' },
                  { id: 'cheque', label: 'Chèque' },
                ].map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`py-2 px-1 text-center font-medium rounded-lg border text-[11px] transition-all ${
                      paymentMethod === m.id
                        ? 'bg-[#2B2621] dark:bg-[#433E35] text-white border-[#2B2621] dark:border-[#575043]'
                        : 'bg-white dark:bg-[#24221D] border-[#DCD5C6] dark:border-[#38342D] text-[#605648] dark:text-[#A69E91]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Itemized Receipt Details Builder (Atay, Sokar, Hlib...) */}
          <div className="pt-2 border-t border-[#E8E2D5] dark:border-[#312E28]">
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => setShowItemDetails(!showItemDetails)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#3B342A] dark:text-[#EAE5DC] hover:text-[#A24824] transition-colors"
              >
                <Receipt className="w-4 h-4 text-[#A24824] dark:text-[#E8734C]" />
                <span>
                  {language === 'ar_ma'
                    ? 'Détails des articles (Atay, Sokar, Hlib...)'
                    : 'Détailler les articles du ticket / reçu'}
                </span>
                {items.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-[#A24824] text-white rounded-full text-[10px] font-mono">
                    {items.length}
                  </span>
                )}
                {showItemDetails ? <ChevronUp className="w-3.5 h-3.5 text-[#867C6E]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#867C6E]" />}
              </button>

              {showItemDetails && (
                <button
                  type="button"
                  onClick={() => handleAddItem()}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#A24824] dark:text-[#E8734C] hover:underline"
                >
                  <Plus className="w-3 h-3" />
                  <span>{language === 'ar_ma' ? '+ Zid article' : '+ Ajouter un article'}</span>
                </button>
              )}
            </div>

            {/* Quick chips if in groceries / alimentation */}
            {category === 'alimentation' && (
              <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                <span className="text-[10px] font-bold text-[#867C6E] dark:text-[#9A9184]">
                  {language === 'ar_ma' ? 'Ajout rapide :' : 'Raccourcis :'}
                </span>
                {[
                  { name: 'Atay (Thé vert 250g)', price: 28 },
                  { name: 'Sokar morceaux (1kg)', price: 16 },
                  { name: 'Hlib Centrale 1L', price: 9 },
                  { name: 'Zayt zitoun 1L', price: 90 },
                  { name: 'Khobz beldi x 4', price: 8 },
                  { name: 'Fromage Kiri', price: 24 },
                ].map((chip) => (
                  <button
                    key={chip.name}
                    type="button"
                    onClick={() => handleAddItem(chip.name, chip.price)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EAE5D9] dark:bg-[#2F2C26] hover:bg-[#DDD6C8] text-[#4A4237] dark:text-[#DDD6C8] text-[10px] font-medium transition-colors"
                  >
                    <span>+ {chip.name}</span>
                    <span className="font-mono text-[9px] text-[#867C6E]">({chip.price}DH)</span>
                  </button>
                ))}
              </div>
            )}

            {/* Expandable items table */}
            {showItemDetails && (
              <div className="space-y-2 bg-white dark:bg-[#23211D] rounded-xl border border-[#E5E0D5] dark:border-[#332F28] p-3">
                {items.length === 0 ? (
                  <div className="text-center py-4 text-xs text-[#867C6E]">
                    {language === 'ar_ma'
                      ? 'Ma kayn hta article. Zid atay wla sokar wla hlib b l-bouton lfoq !'
                      : 'Aucun article ajouté. Cliquez sur un raccourci ou "+ Ajouter un article" pour lister vos achats précis.'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-wider text-[#8A8071] dark:text-[#9A9184] px-1">
                      <div className="col-span-5">Article</div>
                      <div className="col-span-2 text-center">Qté</div>
                      <div className="col-span-2 text-right">Prix Unitaire</div>
                      <div className="col-span-2 text-right">Total</div>
                      <div className="col-span-1 text-center"></div>
                    </div>

                    {items.map((it) => (
                      <div key={it.id} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5">
                          <input
                            type="text"
                            placeholder="ex. Atay, Sokar, Hlib..."
                            value={it.name}
                            onChange={(e) => handleUpdateItem(it.id, 'name', e.target.value)}
                            className="w-full bg-[#FAF8F5] dark:bg-[#1E1D19] border border-[#D5CDBC] dark:border-[#3D382F] rounded-md px-2 py-1 text-xs text-[#25201B] dark:text-[#F2EFEA] focus:outline-none focus:ring-1 focus:ring-[#A24824]"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={it.quantity || 1}
                            onChange={(e) => handleUpdateItem(it.id, 'quantity', e.target.value)}
                            className="w-full bg-[#FAF8F5] dark:bg-[#1E1D19] border border-[#D5CDBC] dark:border-[#3D382F] rounded-md px-2 py-1 text-xs text-center font-mono text-[#25201B] dark:text-[#F2EFEA] focus:outline-none focus:ring-1 focus:ring-[#A24824]"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={it.unitPrice || ''}
                            onChange={(e) => handleUpdateItem(it.id, 'unitPrice', e.target.value)}
                            className="w-full bg-[#FAF8F5] dark:bg-[#1E1D19] border border-[#D5CDBC] dark:border-[#3D382F] rounded-md px-2 py-1 text-xs text-right font-mono text-[#25201B] dark:text-[#F2EFEA] focus:outline-none focus:ring-1 focus:ring-[#A24824]"
                          />
                        </div>
                        <div className="col-span-2 text-right font-mono font-bold text-xs text-[#25201B] dark:text-[#F2EFEA]">
                          {Math.round(it.totalPrice).toLocaleString('fr-FR')} {currency === 'MAD' ? 'DH' : currency}
                        </div>
                        <div className="col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(it.id)}
                            className="p-1 text-[#9A8F80] hover:text-red-600 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="flex items-center justify-between pt-2 border-t border-[#F0ECE2] dark:border-[#2C2923] text-xs">
                      <span className="font-semibold text-[#5A5144] dark:text-[#A69E91]">
                        Somme des articles :
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-[#A24824] dark:text-[#E8734C] text-sm">
                          {Math.round(itemsSum).toLocaleString('fr-FR')} {currency === 'MAD' ? 'DH' : currency}
                        </span>
                        <button
                          type="button"
                          onClick={handleSyncAmountFromItems}
                          className="px-2 py-0.5 bg-[#FAF0E6] dark:bg-[#3D251D] text-[#A24824] dark:text-[#E8734C] hover:bg-[#F4E3D7] rounded text-[10px] font-semibold transition-colors"
                        >
                          {language === 'ar_ma' ? 'Dir f Montant' : 'Remplir Montant'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E8E2D5] dark:border-[#312E28]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#665D50] dark:text-[#9A9184] hover:text-[#25201B] dark:hover:text-[#F2EFEA] hover:bg-[#EFEAE0] dark:hover:bg-[#2C2923] rounded-lg transition-colors"
            >
              {language === 'ar_ma' ? 'Ilgha2 (Annuler)' : 'Annuler'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#A24824] hover:bg-[#8F3E1E] rounded-lg shadow-sm transition-all"
            >
              {editingTransaction
                ? language === 'ar_ma' ? '7fed (Enregistrer)' : 'Mettre à jour'
                : language === 'ar_ma' ? '+ Zid l&apos;opération' : '+ Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

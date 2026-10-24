import React, { useState } from 'react';
import { CategoryBudget, Currency, Language, SubCategory, Transaction } from '../types';
import { X, Plus, Trash2, Tag, Layers, CheckCircle, AlertCircle } from 'lucide-react';

interface SubCategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryBudget[];
  subCategories: SubCategory[];
  transactions: Transaction[];
  onAddSubCategory: (subCategory: SubCategory) => void;
  onDeleteSubCategory: (id: string) => void;
  currency: Currency;
  language: Language;
  initialCategoryId?: string;
}

export const SubCategoryManagerModal: React.FC<SubCategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  subCategories,
  transactions,
  onAddSubCategory,
  onDeleteSubCategory,
  currency,
  language,
  initialCategoryId,
}) => {
  // Only expense categories typically have custom subcategories, but allow all
  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const [selectedCatId, setSelectedCatId] = useState<string>(() => {
    return initialCategoryId || (expenseCategories[0]?.id || 'alimentation');
  });

  const [newName, setNewName] = useState('');
  const [newNameDarija, setNewNameDarija] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const currentCategory = categories.find((c) => c.id === selectedCatId);
  const currentSubCats = subCategories.filter((s) => s.categoryId === selectedCatId);

  // Compute spend per subcategory in this category
  const subCatStats = currentSubCats.map((sub) => {
    const txList = transactions.filter((t) => t.category === selectedCatId && t.subCategory === sub.id);
    const totalSpent = txList.reduce((sum, t) => sum + t.amount, 0);
    const count = txList.length;
    return {
      ...sub,
      totalSpent,
      count,
    };
  });

  // Calculate unassigned spend in this category
  const unassignedTxs = transactions.filter(
    (t) => t.category === selectedCatId && (!t.subCategory || !subCategories.some((s) => s.id === t.subCategory))
  );
  const unassignedSpent = unassignedTxs.reduce((sum, t) => sum + t.amount, 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      setErrorMsg(language === 'ar_ma' ? 'Kteb smiya d sous-catégorie' : 'Veuillez saisir un libellé');
      return;
    }

    // Check duplicate in same category
    const exists = currentSubCats.some((s) => s.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setErrorMsg(language === 'ar_ma' ? 'Had sous-catégorie kayna deja' : 'Cette sous-catégorie existe déjà dans ce poste');
      return;
    }

    const newSub: SubCategory = {
      id: `custom-sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      categoryId: selectedCatId,
      name: trimmed,
      nameDarija: newNameDarija.trim() || undefined,
      isCustom: true,
    };

    onAddSubCategory(newSub);
    setNewName('');
    setNewNameDarija('');
    setErrorMsg('');
    setSuccessMsg(language === 'ar_ma' ? 'Tzadit sous-catégorie b nja7' : 'Sous-catégorie créée avec succès');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDelete = (id: string, name: string) => {
    const count = transactions.filter((t) => t.subCategory === id).length;
    if (count > 0) {
      const confirm = window.confirm(
        language === 'ar_ma'
          ? `Kayna ${count} opération kheddama b had sous-catégorie. Bghiti tmes7ha quand même ?`
          : `${count} transaction(s) utilisent cette sous-catégorie. Voulez-vous vraiment la supprimer ?`
      );
      if (!confirm) return;
    }
    onDeleteSubCategory(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] dark:bg-[#1C1A17] rounded-xl border border-[#DED7C9] dark:border-[#38342D] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E2D5] dark:border-[#312E28] bg-white dark:bg-[#23211D]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#A24824]/10 dark:bg-[#E8734C]/20 text-[#A24824] dark:text-[#E8734C] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#25201B] dark:text-[#F2EFEA]">
                {language === 'ar_ma' ? 'Tanzim d sous-catégories' : 'Gestionnaire des Sous-Catégories'}
              </h3>
              <p className="text-xs text-[#807669] dark:text-[#9A9184]">
                {language === 'ar_ma'
                  ? 'Kteb w zid sous-catégories f kola poste (ex. Atay, Sokar, Hlib, Essence...)'
                  : 'Définissez des sous-catégories personnalisées pour structurer vos dépenses'}
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

        {/* Category Pill Selector Bar */}
        <div className="px-6 py-3 border-b border-[#E8E2D5] dark:border-[#312E28] bg-[#F4EFE6] dark:bg-[#201E1A] overflow-x-auto">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-[11px] font-bold text-[#6D6355] dark:text-[#A69E91] uppercase tracking-wider mr-1">
              {language === 'ar_ma' ? 'L-poste :' : 'Poste :'}
            </span>
            {expenseCategories.map((cat) => {
              const isSelected = cat.id === selectedCatId;
              const subCount = subCategories.filter((s) => s.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCatId(cat.id);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-[#A24824] text-white shadow-xs'
                      : 'bg-white dark:bg-[#2B2822] text-[#554B3E] dark:text-[#C5BEB3] border border-[#DDD6C8] dark:border-[#3D382F] hover:border-[#BEB4A2]'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: isSelected ? '#FFFFFF' : cat.color }}
                  />
                  <span>{language === 'ar_ma' ? cat.labelDarija : cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-white/25 text-white'
                        : 'bg-[#EAE5D9] dark:bg-[#38342D] text-[#786E61] dark:text-[#A69E91]'
                    }`}
                  >
                    {subCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body: List of Subcategories + Add New Form */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Active Category Info Banner */}
          <div className="flex items-center justify-between p-3.5 bg-white dark:bg-[#23211D] rounded-xl border border-[#E5E0D5] dark:border-[#332F28]">
            <div className="flex items-center gap-2.5">
              <span
                className="w-3.5 h-3.5 rounded-sm"
                style={{ backgroundColor: currentCategory?.color || '#A24824' }}
              />
              <div>
                <span className="font-bold text-sm text-[#25201B] dark:text-[#F2EFEA]">
                  {language === 'ar_ma' ? currentCategory?.labelDarija : currentCategory?.label}
                </span>
                <span className="text-xs text-[#82786A] dark:text-[#9A9184] ml-2">
                  (Plafond: {Math.round(currentCategory?.allocatedBudget || 0).toLocaleString('fr-FR')} {currency})
                </span>
              </div>
            </div>
            <span className="text-xs font-mono text-[#6A6052] dark:text-[#A69E91]">
              {currentSubCats.length} {language === 'ar_ma' ? 'sous-catégories' : 'sous-catégories définies'}
            </span>
          </div>

          {/* Form: Add New Custom Subcategory */}
          <div className="bg-white dark:bg-[#23211D] p-4 rounded-xl border border-[#E5E0D5] dark:border-[#332F28] shadow-xs">
            <h4 className="text-xs font-bold text-[#3B342A] dark:text-[#EAE5DC] flex items-center gap-1.5 mb-3">
              <Plus className="w-4 h-4 text-[#A24824] dark:text-[#E8734C]" />
              <span>
                {language === 'ar_ma'
                  ? 'Zid sous-catégorie jdida f had l-poste'
                  : `Ajouter une sous-catégorie personnalisée dans "${currentCategory?.label}"`}
              </span>
            </h4>

            {errorMsg && (
              <div className="mb-3 p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-3 p-2.5 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 rounded-lg text-xs text-green-700 dark:text-green-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#5A5144] dark:text-[#D5CFC5] mb-1">
                    {language === 'ar_ma' ? 'Smiya (Français / Standard)' : 'Nom de la sous-catégorie'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      selectedCatId === 'alimentation'
                        ? 'ex. Épicerie (Atay, Sokar, Huile)'
                        : selectedCatId === 'transport'
                        ? 'ex. Carburant & Entretien'
                        : 'ex. Nom du sous-poste'
                    }
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value);
                      setErrorMsg('');
                    }}
                    className="w-full bg-[#FAF8F5] dark:bg-[#1C1A17] border border-[#D5CDBC] dark:border-[#3D382F] rounded-lg px-3 py-2 text-xs text-[#25201B] dark:text-[#F2EFEA] focus:outline-none focus:ring-1 focus:ring-[#A24824]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#5A5144] dark:text-[#D5CFC5] mb-1">
                    {language === 'ar_ma' ? 'Smiya b Darija (Ikhtiyari)' : 'Nom en Darija (Optionnel)'}
                  </label>
                  <input
                    type="text"
                    placeholder="ex. Teqdia d Hanout & Atay"
                    value={newNameDarija}
                    onChange={(e) => setNewNameDarija(e.target.value)}
                    className="w-full bg-[#FAF8F5] dark:bg-[#1C1A17] border border-[#D5CDBC] dark:border-[#3D382F] rounded-lg px-3 py-2 text-xs text-[#25201B] dark:text-[#F2EFEA] focus:outline-none focus:ring-1 focus:ring-[#A24824]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#A24824] hover:bg-[#8F3E1E] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'ar_ma' ? '+ Zid sous-catégorie' : '+ Ajouter la sous-catégorie'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Existing Subcategories List */}
          <div>
            <h4 className="text-xs font-bold text-[#554C3F] dark:text-[#C5BEB3] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>{language === 'ar_ma' ? 'Sous-catégories li kaynin' : 'Sous-catégories configurées'}</span>
              <span className="text-[10px] text-[#867C6E] dark:text-[#9A9184] lowercase font-normal">
                {subCatStats.length} {language === 'ar_ma' ? '3anasir' : 'éléments'}
              </span>
            </h4>

            {subCatStats.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#23211D] rounded-xl border border-[#E5E0D5] dark:border-[#332F28] text-xs text-[#867C6E] dark:text-[#9A9184]">
                {language === 'ar_ma'
                  ? 'Baqi ma kaynin sous-catégories f had l-poste. Zid whda lfoq !'
                  : 'Aucune sous-catégorie définie pour ce poste budgétaire. Créez-en une ci-dessus !'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {subCatStats.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3 bg-white dark:bg-[#23211D] rounded-xl border border-[#E5E0D5] dark:border-[#332F28] flex items-center justify-between gap-3 group hover:border-[#BEB4A2] dark:hover:border-[#524B3F] transition-all"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] dark:bg-[#2B2822] border border-[#EAE5D9] dark:border-[#38342D] flex items-center justify-center shrink-0 text-[#A24824] dark:text-[#E8734C]">
                        <Tag className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-[#25201B] dark:text-[#F2EFEA] truncate">
                          {language === 'ar_ma' && sub.nameDarija ? sub.nameDarija : sub.name}
                        </div>
                        {sub.nameDarija && language !== 'ar_ma' && (
                          <div className="text-[10px] text-[#8C8274] dark:text-[#9A9184] truncate">
                            {sub.nameDarija}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#7A7061] dark:text-[#9A9184]">
                          <span className="font-mono font-medium text-[#25201B] dark:text-[#F2EFEA]">
                            {Math.round(sub.totalSpent).toLocaleString('fr-FR')} {currency === 'MAD' ? 'DH' : currency}
                          </span>
                          <span>•</span>
                          <span>{sub.count} op.</span>
                          {sub.isCustom && (
                            <span className="px-1.5 py-0.2 bg-[#FAF0E6] dark:bg-[#3D251D] text-[#A24824] dark:text-[#E8734C] rounded text-[9px] font-semibold">
                              {language === 'ar_ma' ? 'Mkhssas' : 'Personnalisée'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {sub.isCustom && (
                      <button
                        onClick={() => handleDelete(sub.id, sub.name)}
                        className="p-1.5 text-[#9A8F80] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                        title={language === 'ar_ma' ? 'Mseh' : 'Supprimer cette sous-catégorie'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {unassignedSpent > 0 && (
              <div className="mt-3 p-3 bg-[#F4EFE6] dark:bg-[#25221C] rounded-xl border border-[#E5DFD3] dark:border-[#383329] text-xs text-[#6A6052] dark:text-[#A69E91] flex items-center justify-between">
                <span>
                  {language === 'ar_ma'
                    ? 'Opérations f had l-poste bla sous-catégorie m7adada :'
                    : 'Opérations sans sous-catégorie attribuée :'}
                </span>
                <span className="font-mono font-bold text-[#25201B] dark:text-[#F2EFEA]">
                  {Math.round(unassignedSpent).toLocaleString('fr-FR')} {currency === 'MAD' ? 'DH' : currency} ({unassignedTxs.length} op.)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#E8E2D5] dark:border-[#312E28] bg-white dark:bg-[#23211D] flex items-center justify-between">
          <span className="text-[11px] text-[#847B6D] dark:text-[#9A9184]">
            {language === 'ar_ma'
              ? 'Sous-catégories kaybanou direct f l-formulaire d transaction.'
              : 'Ces sous-catégories sont sélectionnables immédiatement lors de la saisie d\'une opération.'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2B2621] dark:bg-[#3D382F] hover:bg-[#1C1915] text-white text-xs font-semibold rounded-lg transition-colors"
          >
            {language === 'ar_ma' ? 'Safé (Fermer)' : 'Fermer'}
          </button>
        </div>
      </div>
    </div>
  );
};

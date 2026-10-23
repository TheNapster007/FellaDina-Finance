import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, PaymentMethod, CategoryBudget, Currency, Language } from '../types';
import { X, PlusCircle, CheckCircle2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id'>, editId?: string) => void;
  categories: CategoryBudget[];
  editingTransaction?: Transaction | null;
  initialDate?: string;
  currency: Currency;
  language: Language;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  editingTransaction,
  initialDate,
  currency,
  language,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('alimentation');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('carte');
  const [recipientOrSource, setRecipientOrSource] = useState<string>('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setNote(editingTransaction.note);
      setPaymentMethod(editingTransaction.paymentMethod);
      setRecipientOrSource(editingTransaction.recipientOrSource || '');
    } else {
      // defaults
      setType('expense');
      setAmount('');
      const defaultCat = categories.find((c) => c.type === 'expense');
      setCategory(defaultCat ? defaultCat.id : 'alimentation');
      setDate(initialDate || new Date().toISOString().split('T')[0]);
      setNote('');
      setPaymentMethod('carte');
      setRecipientOrSource('');
    }
  }, [editingTransaction, isOpen, categories, initialDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    onSave(
      {
        type,
        amount: num,
        category,
        date,
        note: note.trim() || (type === 'income' ? 'Rentrée d’argent' : 'Dépense courante'),
        paymentMethod,
        recipientOrSource: recipientOrSource.trim() || undefined,
      },
      editingTransaction ? editingTransaction.id : undefined
    );
    onClose();
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] dark:bg-[#1C1A17] rounded-xl border border-[#DED7C9] dark:border-[#38342D] shadow-2xl overflow-hidden transition-colors">
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
                  ? 'Dakhel chehal kheserti wla chehal dkhel lik'
                  : 'Enregistrez une entrée de trésorerie ou une dépense'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Segmented selector: Dépense (Kankhser) vs Revenu (Kandkhel) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#EAE5D9] dark:bg-[#2B2822] rounded-lg">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                const cat = categories.find((c) => c.type === 'expense');
                if (cat) setCategory(cat.id);
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
                if (cat) setCategory(cat.id);
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
            <label className="block text-xs font-semibold text-[#484036] dark:text-[#D5CFC5] mb-1">
              {language === 'ar_ma' ? 'Chhal d lflous (Montant)' : 'Montant'} ({currency}) *
            </label>
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

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#484036] dark:text-[#D5CFC5] mb-1">
                {language === 'ar_ma' ? 'As-naf (Catégorie)' : 'Catégorie'} *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white dark:bg-[#24221D] border border-[#D5CDBC] dark:border-[#3D382F] rounded-lg px-3 py-2 text-xs text-[#25201B] dark:text-[#F2EFEA] font-medium focus:outline-none focus:ring-1 focus:ring-[#A24824]"
              >
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {language === 'ar_ma' ? cat.labelDarija : cat.label}
                  </option>
                ))}
              </select>
            </div>

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
          </div>

          {/* Description & Source/Recipient */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-[#484036] dark:text-[#D5CFC5] mb-1">
              {language === 'ar_ma' ? 'Tariqat L-khalass (Paiement)' : 'Moyen de règlement'}
            </label>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {[
                { id: 'carte', label: language === 'ar_ma' ? 'Carte' : 'Carte' },
                { id: 'virement', label: language === 'ar_ma' ? 'Virement' : 'Virement' },
                { id: 'especes', label: language === 'ar_ma' ? 'Espèces' : 'Espèces' },
                { id: 'cheque', label: language === 'ar_ma' ? 'Chèque' : 'Chèque' },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                  className={`py-1.5 px-2 rounded-lg border text-center font-medium transition-all ${
                    paymentMethod === m.id
                      ? 'bg-[#2B2621] dark:bg-[#433E35] text-white border-[#2B2621] dark:border-[#575043]'
                      : 'bg-white dark:bg-[#24221D] border-[#DCD5C6] dark:border-[#38342D] text-[#605648] dark:text-[#A69E91] hover:border-[#BEB4A2] dark:hover:border-[#524B3F]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
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

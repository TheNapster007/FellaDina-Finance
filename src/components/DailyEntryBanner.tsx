import React from 'react';
import { Currency, Language, Transaction, UserProfile } from '../types';
import {
  CalendarDays,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Lock,
  Wallet,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface DailyEntryBannerProps {
  transactions: Transaction[];
  currency: Currency;
  language: Language;
  currentUser: UserProfile | null;
  onOpenAddModalWithType: (type: 'income' | 'expense') => void;
  onOpenSignUp: () => void;
}

export const DailyEntryBanner: React.FC<DailyEntryBannerProps> = ({
  transactions,
  currency,
  language,
  currentUser,
  onOpenAddModalWithType,
  onOpenSignUp,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Transactions logged today
  const todayTransactions = transactions.filter((t) => t.date === todayStr);
  const todayIncome = todayTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const todayExpense = todayTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const todayNet = todayIncome - todayExpense;

  const totalAllTransactions = transactions.length;

  const currencySymbol = currency === 'MAD' ? 'DH' : currency === 'EUR' ? '€' : '$';

  // Format today's human-friendly date
  const now = new Date();
  const formattedToday = now.toLocaleDateString(language === 'en' ? 'en-US' : 'fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <section className="mb-8 rounded-2xl bg-white dark:bg-[#1E1D19] border border-[#E5E0D5] dark:border-[#312E28] p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Side: Title, Date, & Description */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FAF4F0] dark:bg-[#2A211D] text-[#A24824] dark:text-[#E8734C] border border-[#EAD6CC] dark:border-[#4B2F23]">
              <Clock className="w-3 h-3" />
              <span className="capitalize">{formattedToday}</span>
            </span>

            {totalAllTransactions === 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF4ED] dark:bg-[#192E22] text-[#2C623E] dark:text-[#67B588]">
                <Sparkles className="w-3 h-3" />
                <span>
                  {language === 'ar_ma'
                    ? 'Espace financier vierge · Prêt pour vos saisies'
                    : 'Espace financier vierge · Prêt pour vos saisies'}
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F5F2EB] dark:bg-[#272520] text-[#786E61] dark:text-[#A69E91]">
                <CheckCircle2 className="w-3 h-3 text-[#3B6B55]" />
                <span>
                  {todayTransactions.length}{' '}
                  {todayTransactions.length > 1 ? 'opérations aujourd’hui' : 'opération aujourd’hui'}
                </span>
              </span>
            )}
          </div>

          <h2 className="text-lg sm:text-xl font-serif font-bold text-[#221F1C] dark:text-[#F2EFEA]">
            {language === 'ar_ma'
              ? 'T-ssjil l-yawmi d l-masrouf w l-madkhoul'
              : 'Enregistrement Quotidien · Revenus & Dépenses du Jour'}
          </h2>

          <p className="text-xs text-[#736B5E] dark:text-[#9F9688] max-w-2xl leading-relaxed">
            {totalAllTransactions === 0
              ? language === 'ar_ma'
                ? 'Had l-application khawya daba. Bda ddkhel l-madkhoul dyalek (salaire, freelance) w l-masarif yawmiyan bach l-mizaniya w l-hisabat ybdaw f l-7in.'
                : 'L’application démarre vide. Saisissez vos rentrées et dépenses quotidiennes pour alimenter vos indicateurs financiers, votre cascade de trésorerie et vos prévisions en direct.'
              : language === 'ar_ma'
              ? 'Zid masrouf aw madkhoul dyal l-youm b ser3a bach tbqa dima mtebbe3 floussek.'
              : 'Enregistrez vos flux quotidiens en un clic. Chaque opération recalcule instantanément votre solde net, vos ratios budgétaires et votre calendrier financier.'}
          </p>
        </div>

        {/* Right Side: Quick Action Buttons & Today's Summary */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          {/* Quick Metrics of Today */}
          {todayTransactions.length > 0 && (
            <div className="hidden sm:flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#25231F] border border-[#EAE5DA] dark:border-[#38342D] text-xs font-mono">
              <div className="text-[#2C623E] dark:text-[#67B588]">
                <span className="font-sans text-[10px] text-[#7A7163] dark:text-[#9A9184] block">Entrées :</span>
                <strong>+{Math.round(todayIncome).toLocaleString('fr-FR')} {currencySymbol}</strong>
              </div>
              <span className="text-[#DDD6C8] dark:text-[#38342D]">|</span>
              <div className="text-[#A24824] dark:text-[#E8734C]">
                <span className="font-sans text-[10px] text-[#7A7163] dark:text-[#9A9184] block">Sorties :</span>
                <strong>-{Math.round(todayExpense).toLocaleString('fr-FR')} {currencySymbol}</strong>
              </div>
            </div>
          )}

          {/* Add Income Button */}
          <button
            onClick={() => onOpenAddModalWithType('income')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2E6B47] hover:bg-[#255739] text-white text-xs font-semibold shadow-xs transition-all hover:shadow group cursor-pointer"
            title="Enregistrer un revenu, salaire, virement ou rentrée d'argent"
          >
            <ArrowUpRight className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            <span>
              {language === 'ar_ma' ? '+ Zid Madkhoul (Income)' : '+ Nouveau Revenu'}
            </span>
          </button>

          {/* Add Expense Button */}
          <button
            onClick={() => onOpenAddModalWithType('expense')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#A24824] hover:bg-[#8B3C1C] text-white text-xs font-semibold shadow-xs transition-all hover:shadow group cursor-pointer"
            title="Enregistrer une dépense, achat, course ou facture"
          >
            <ArrowDownRight className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            <span>
              {language === 'ar_ma' ? '- Zid Masrouf (Expense)' : '- Nouvelle Dépense'}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

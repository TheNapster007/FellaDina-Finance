import React, { useState, useMemo } from 'react';
import { Transaction, CategoryBudget, Currency, Language } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Edit2,
  Trash2,
  Sparkles,
  CheckCircle2,
  CalendarDays,
  Clock,
  FileText,
  Lock,
} from 'lucide-react';

interface Section04FinancialCalendarProps {
  transactions: Transaction[];
  categories: CategoryBudget[];
  currency: Currency;
  language: Language;
  onOpenAddModalWithDate: (date: string) => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenPdfModal?: (monthKey?: string) => void;
}

export const Section04FinancialCalendar: React.FC<Section04FinancialCalendarProps> = ({
  transactions,
  categories,
  currency,
  language,
  onOpenAddModalWithDate,
  onEditTransaction,
  onDeleteTransaction,
  onOpenPdfModal,
}) => {
  // Current calendar view month defaults to today
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(todayStr);
  };

  // Month name localized
  const monthNamesFr = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ];
  const monthNamesDarija = [
    'Yanayer', 'Febrayer', 'Mars', 'Avril', 'Mayou', 'Yonyo',
    'Yolyoz', 'Ghucht', 'Choutanbir', 'Uktubar', 'Nowanbir', 'Dojanbir',
  ];
  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const currentMonthName =
    language === 'ar_ma'
      ? monthNamesDarija[currentMonth]
      : language === 'en'
      ? monthNamesEn[currentMonth]
      : monthNamesFr[currentMonth];

  const weekDayNames =
    language === 'ar_ma'
      ? ['Itn', 'Tla', 'Arb', 'Khm', 'Jom', 'Seb', 'A7d']
      : language === 'en'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  // Days in month calculation
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    // Monday as index 0 (0 for Sun in JS, so (day + 6) % 7)
    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isPlanned: boolean;
      income: number;
      expense: number;
      net: number;
      transactionsCount: number;
    }[] = [];

    // Previous month padding days
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isPlanned: dateStr > todayStr,
        income: 0,
        expense: 0,
        net: 0,
        transactionsCount: 0,
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayTxs = transactions.filter((t) => t.date === dateStr);
      const income = dayTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = dayTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

      days.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isPlanned: dateStr > todayStr,
        income,
        expense,
        net: income - expense,
        transactionsCount: dayTxs.length,
      });
    }

    // Next month padding days to complete grid (multiples of 7, up to 35 or 42)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isPlanned: dateStr > todayStr,
        income: 0,
        expense: 0,
        net: 0,
        transactionsCount: 0,
      });
    }

    return days;
  }, [currentYear, currentMonth, transactions, todayStr]);

  // Aggregate metrics for the viewed month
  const monthStats = useMemo(() => {
    const currentMonthDays = calendarDays.filter((d) => d.isCurrentMonth);
    const totalMonthIncome = currentMonthDays.reduce((acc, d) => acc + d.income, 0);
    const totalMonthExpense = currentMonthDays.reduce((acc, d) => acc + d.expense, 0);
    const netMonthSavings = totalMonthIncome - totalMonthExpense;
    const zeroExpenseDays = currentMonthDays.filter((d) => d.expense === 0 && d.dayNumber <= 31).length;
    const activeExpenseDays = currentMonthDays.filter((d) => d.expense > 0).length;

    return {
      totalMonthIncome,
      totalMonthExpense,
      netMonthSavings,
      zeroExpenseDays,
      activeExpenseDays,
    };
  }, [calendarDays]);

  // Transactions on the selected day
  const selectedDayTransactions = useMemo(() => {
    const dayTxs = transactions.filter((t) => t.date === selectedDate);
    if (filterType === 'all') return dayTxs;
    return dayTxs.filter((t) => t.type === filterType);
  }, [transactions, selectedDate, filterType]);

  const selectedDayObj = calendarDays.find((d) => d.dateStr === selectedDate);
  const selectedDayIncome = selectedDayTransactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const selectedDayExpense = selectedDayTransactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  // Formatted date string for selected day inspector
  const formatSelectedDateFull = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      if (language === 'ar_ma') {
        return `${d.getDate()} ${monthNamesDarija[d.getMonth()]} ${d.getFullYear()}`;
      } else if (language === 'en') {
        return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      } else {
        return d.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      }
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="mb-12">
      {/* Section 04 Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#221F1C] dark:text-[#F2EFEA] flex items-baseline gap-2">
            <span className="font-serif italic text-sm text-[#A24824] dark:text-[#E8734C] font-semibold">04</span>
            <span>
              {language === 'ar_ma'
                ? 'Rouzname d l-flous — t-tabou3 chronologique'
                : language === 'en'
                ? 'Financial Calendar — Chronological Cash Flow'
                : 'Calendrier financier — chronologie des flux'}
            </span>
          </h2>
          <p className="text-xs text-[#7F7668] dark:text-[#9A9184] mt-0.5">
            {language === 'ar_ma'
              ? 'Taba3 l-masarif w l-madkhoul nhar b nhar, w khtare ay nhar bach tchof l-opérations dyalo.'
              : language === 'en'
              ? 'Track daily income and expenses chronologically. Click any date to view or add entries.'
              : 'Visualisez vos flux de trésorerie jour après jour. Cliquez sur une date pour inspecter ses opérations.'}
          </p>
        </div>

        {/* Quick Month Navigation controls & PDF Statement trigger */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={handleJumpToToday}
            className="px-2.5 py-1 text-xs font-medium text-[#484034] dark:text-[#E2DDD3] bg-white dark:bg-[#24221D] hover:bg-[#F3EFE7] dark:hover:bg-[#2E2B25] border border-[#DCD5C6] dark:border-[#38342D] rounded-lg transition-colors shadow-2xs"
          >
            {language === 'ar_ma' ? 'L-youm' : language === 'en' ? 'Today' : 'Aujourd’hui'}
          </button>

          <div className="flex items-center bg-white dark:bg-[#24221D] border border-[#DCD5C6] dark:border-[#38342D] rounded-lg shadow-2xs">
            <button
              onClick={handlePrevMonth}
              title="Mois précédent"
              className="p-1.5 text-[#6E6457] dark:text-[#A69E91] hover:text-[#221F1C] dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-serif font-bold text-xs sm:text-sm text-[#25201B] dark:text-[#F2EFEA] border-x border-[#EBE6DC] dark:border-[#312E28] min-w-[130px] text-center">
              {currentMonthName} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              title="Mois suivant"
              className="p-1.5 text-[#6E6457] dark:text-[#A69E91] hover:text-[#221F1C] dark:hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {onOpenPdfModal && (
            <button
              onClick={() => onOpenPdfModal(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`)}
              title="Générer le relevé officiel PDF de ce mois"
              className="px-2.5 py-1 text-xs font-semibold text-[#A24824] dark:text-[#E8734C] bg-white dark:bg-[#24221D] hover:bg-[#FAF3EF] dark:hover:bg-[#2F241F] border border-[#DCD5C6] dark:border-[#38342D] hover:border-[#A24824]/40 rounded-lg transition-colors shadow-2xs inline-flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Relevé PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Calendar Card */}
      <div className="bg-white dark:bg-[#1E1D19] rounded-xl border border-[#E5E0D5] dark:border-[#312E28] shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden transition-colors">
        {/* Monthly Summary Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#EBE6DC] dark:divide-[#312E28] border-b border-[#EBE6DC] dark:border-[#312E28] bg-[#FAF8F5] dark:bg-[#24221E] text-xs">
          {/* Total Inflows */}
          <div className="p-3.5 sm:px-5">
            <div className="flex items-center gap-1.5 text-[#5A7E6B] dark:text-[#67B588] text-[11px] font-semibold mb-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{language === 'ar_ma' ? 'Rentrée d ch-har' : 'Entrées du mois'}</span>
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-[#25201B] dark:text-[#F2EFEA] tabular-nums">
              +{Math.round(monthStats.totalMonthIncome).toLocaleString('fr-FR')} {currency === 'MAD' ? 'DH' : currency}
            </div>
          </div>

          {/* Total Outflows */}
          <div className="p-3.5 sm:px-5">
            <div className="flex items-center gap-1.5 text-[#A24824] dark:text-[#E8734C] text-[11px] font-semibold mb-0.5">
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>{language === 'ar_ma' ? 'Masrouf d ch-har' : 'Dépenses du mois'}</span>
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-[#25201B] dark:text-[#F2EFEA] tabular-nums">
              -{Math.round(monthStats.totalMonthExpense).toLocaleString('fr-FR')} {currency === 'MAD' ? 'DH' : currency}
            </div>
          </div>

          {/* Net Balance */}
          <div className="p-3.5 sm:px-5">
            <div className="text-[11px] font-semibold text-[#6E6457] dark:text-[#9A9184] mb-0.5">
              {language === 'ar_ma' ? 'Solde Net d ch-har' : 'Solde Net du mois'}
            </div>
            <div
              className={`text-base sm:text-lg font-bold font-mono tabular-nums ${
                monthStats.netMonthSavings >= 0
                  ? 'text-[#3B6B55] dark:text-[#52A36F]'
                  : 'text-[#A24824] dark:text-[#E8734C]'
              }`}
            >
              {monthStats.netMonthSavings >= 0 ? '+' : ''}
              {Math.round(monthStats.netMonthSavings).toLocaleString('fr-FR')} {currency === 'MAD' ? 'DH' : currency}
            </div>
          </div>

          {/* Zero Expense Discipline Badge */}
          <div className="p-3.5 sm:px-5">
            <div className="flex items-center gap-1 text-[#484036] dark:text-[#C5BEB3] text-[11px] font-semibold mb-0.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
              <span>{language === 'ar_ma' ? 'Ayam bla masrouf' : 'Journées blanches'}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold font-mono text-[#25201B] dark:text-[#F2EFEA] tabular-nums">
                {monthStats.zeroExpenseDays}
              </span>
              <span className="text-[11px] text-[#7A7163] dark:text-[#9A9184]">
                {language === 'ar_ma' ? 'nhar bla sarf' : 'jours sans dépense'}
              </span>
            </div>
          </div>
        </div>

        {/* Calendar Grid Container */}
        <div className="p-4 sm:p-6">
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {weekDayNames.map((d, index) => (
              <div
                key={index}
                className="text-center font-semibold text-[11px] uppercase tracking-wider text-[#7A7163] dark:text-[#9A9184] py-1"
              >
                <span className="hidden sm:inline">{d}</span>
                <span className="sm:hidden">{d.charAt(0)}</span>
              </div>
            ))}
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((day) => {
              const isSelected = day.dateStr === selectedDate;
              const hasIncome = day.income > 0;
              const hasExpense = day.expense > 0;
              const hasActivity = hasIncome || hasExpense;

              return (
                <div
                  key={day.dateStr}
                  onClick={() => setSelectedDate(day.dateStr)}
                  className={`min-h-[72px] sm:min-h-[86px] p-1.5 sm:p-2 rounded-lg border transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'border-[#A24824] dark:border-[#E8734C] ring-2 ring-[#A24824]/20 dark:ring-[#E8734C]/30 bg-[#FDFBF7] dark:bg-[#2B2721]'
                      : day.isCurrentMonth
                      ? 'border-[#EAE5D9] dark:border-[#312E28] bg-white dark:bg-[#1E1D19] hover:border-[#BEB4A2] dark:hover:border-[#4B4438] hover:bg-[#FAF8F5] dark:hover:bg-[#24221D]'
                      : 'border-transparent bg-[#F9F8F5]/60 dark:bg-[#181714]/40 opacity-40 hover:opacity-60'
                  }`}
                >
                  {/* Top bar in cell: Day number + Today pill */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm font-bold font-mono tabular-nums leading-none ${
                        day.isToday
                          ? 'w-5 h-5 rounded-full bg-[#A24824] text-white flex items-center justify-center text-[11px]'
                          : isSelected
                          ? 'text-[#A24824] dark:text-[#E8734C]'
                          : day.isCurrentMonth
                          ? 'text-[#25201B] dark:text-[#F2EFEA]'
                          : 'text-[#9A9184] dark:text-[#6A6356]'
                      }`}
                    >
                      {day.dayNumber}
                    </span>

                    {/* Indicator dots if day has activity */}
                    {hasActivity && (
                      <div className="flex items-center gap-0.5">
                        {hasIncome && <span className="w-1.5 h-1.5 rounded-full bg-[#3B6B55]" />}
                        {hasExpense && <span className="w-1.5 h-1.5 rounded-full bg-[#A24824]" />}
                      </div>
                    )}
                  </div>

                  {/* Flow summary pills inside the day card */}
                  <div className="space-y-0.5 mt-1">
                    {hasIncome && (
                      <div className="text-[10px] font-mono font-semibold text-[#2C623E] dark:text-[#67B588] bg-[#EAF1EB] dark:bg-[#193222] px-1 py-0.2 rounded truncate tabular-nums">
                        +{(day.income / 1000).toFixed(day.income >= 1000 ? 1 : 0)}k
                      </div>
                    )}
                    {hasExpense && (
                      <div className="text-[10px] font-mono font-semibold text-[#A24824] dark:text-[#E8734C] bg-[#FBEAE6] dark:bg-[#3D1E16] px-1 py-0.2 rounded truncate tabular-nums">
                        -{(day.expense / 1000).toFixed(day.expense >= 1000 ? 1 : 0)}k
                      </div>
                    )}
                    {!hasActivity && day.isCurrentMonth && (
                      <div className="text-[9px] text-[#A69E91] dark:text-[#655E53] italic truncate hidden sm:block">
                        —
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Inspector Panel */}
        <div className="border-t border-[#EBE6DC] dark:border-[#312E28] bg-[#FAF8F5] dark:bg-[#23211D] p-4 sm:p-6 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#A24824] dark:text-[#E8734C]" />
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#25201B] dark:text-[#F2EFEA] capitalize">
                  {formatSelectedDateFull(selectedDate)}
                </h3>
                {selectedDate === todayStr && (
                  <span className="px-2 py-0.5 bg-[#A24824] text-white text-[10px] font-semibold rounded-full">
                    {language === 'ar_ma' ? 'L-youm' : 'Aujourd’hui'}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#7A7163] dark:text-[#9A9184] mt-0.5">
                {selectedDayTransactions.length}{' '}
                {language === 'ar_ma'
                  ? 'opérations msjjla f had nhar'
                  : selectedDayTransactions.length > 1
                  ? 'opérations enregistrées'
                  : 'opération enregistrée'}
              </p>
            </div>

            {/* Quick Actions for Selected Day */}
            <div className="flex items-center gap-2">
              {/* Type filter pills */}
              <div className="flex items-center gap-1 p-0.5 bg-[#EBE6DC] dark:bg-[#2C2923] rounded-lg text-xs">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    filterType === 'all'
                      ? 'bg-white dark:bg-[#38342D] text-[#2B2621] dark:text-[#F5F2EB] shadow-2xs font-semibold'
                      : 'text-[#6A6052] dark:text-[#9A9184]'
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setFilterType('expense')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    filterType === 'expense'
                      ? 'bg-white dark:bg-[#38342D] text-[#A24824] dark:text-[#E8734C] shadow-2xs font-semibold'
                      : 'text-[#6A6052] dark:text-[#9A9184]'
                  }`}
                >
                  Dépenses
                </button>
                <button
                  onClick={() => setFilterType('income')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    filterType === 'income'
                      ? 'bg-white dark:bg-[#38342D] text-[#3B6B55] dark:text-[#52A36F] shadow-2xs font-semibold'
                      : 'text-[#6A6052] dark:text-[#9A9184]'
                  }`}
                >
                  Entrées
                </button>
              </div>

              {/* Add transaction pre-filled with this date */}
              <button
                onClick={() => onOpenAddModalWithDate(selectedDate)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#A24824] hover:bg-[#8F3E1E] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>
                  {language === 'ar_ma' ? '+ Zid f had nhar' : '+ Ajouter sur ce jour'}
                </span>
              </button>
            </div>
          </div>

          {/* Daily Totals Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono py-2.5 px-3.5 bg-white dark:bg-[#1E1D19] rounded-lg border border-[#E5E0D5] dark:border-[#312E28] mb-3">
            <div className="flex items-center gap-1.5 text-[#3B6B55] dark:text-[#52A36F]">
              <span className="font-sans text-[11px] text-[#7A7163] dark:text-[#9A9184]">Entrées :</span>
              <strong>+{Math.round(selectedDayIncome).toLocaleString('fr-FR')} {currency === 'MAD' ? 'DH' : currency}</strong>
            </div>
            <span className="text-[#DDD6C8] dark:text-[#38342D]">|</span>
            <div className="flex items-center gap-1.5 text-[#A24824] dark:text-[#E8734C]">
              <span className="font-sans text-[11px] text-[#7A7163] dark:text-[#9A9184]">Dépenses :</span>
              <strong>-{Math.round(selectedDayExpense).toLocaleString('fr-FR')} {currency === 'MAD' ? 'DH' : currency}</strong>
            </div>
            <span className="text-[#DDD6C8] dark:text-[#38342D]">|</span>
            <div className="flex items-center gap-1.5">
              <span className="font-sans text-[11px] text-[#7A7163] dark:text-[#9A9184]">Net journalier :</span>
              <strong
                className={
                  selectedDayIncome - selectedDayExpense >= 0
                    ? 'text-[#3B6B55] dark:text-[#52A36F]'
                    : 'text-[#A24824] dark:text-[#E8734C]'
                }
              >
                {selectedDayIncome - selectedDayExpense >= 0 ? '+' : ''}
                {Math.round(selectedDayIncome - selectedDayExpense).toLocaleString('fr-FR')} {currency === 'MAD' ? 'DH' : currency}
              </strong>
            </div>
          </div>

          {/* List of transactions for this day */}
          {selectedDayTransactions.length === 0 ? (
            <div className="py-6 px-4 text-center rounded-lg border border-dashed border-[#DCD5C6] dark:border-[#38342D] bg-[#FBF9F6] dark:bg-[#1D1B18]">
              <CheckCircle2 className="w-6 h-6 text-[#3B6B55] mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-[#25201B] dark:text-[#F2EFEA]">
                {language === 'ar_ma'
                  ? 'Nhar bla masrouf (Journée blanche)'
                  : 'Aucune dépense ni rentrée sur cette journée.'}
              </p>
              <p className="text-[11px] text-[#7A7163] dark:text-[#9A9184] mt-0.5">
                {language === 'ar_ma'
                  ? 'Ila kheserti chi haja f had nhar, warra9 3la l-bouton l-fou9ani bach tzidha.'
                  : 'Bravo pour votre gestion budgétaire ou enregistrez une opération si besoin.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {selectedDayTransactions.map((tx) => {
                const cat = categories.find((c) => c.id === tx.category);
                const isIncome = tx.type === 'income';

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-[#1E1D19] rounded-lg border border-[#E5E0D5] dark:border-[#312E28] hover:border-[#BEB4A2] dark:hover:border-[#4B4438] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                          isIncome
                            ? 'bg-[#EAF1EB] text-[#2C623E] dark:bg-[#163020] dark:text-[#67B588]'
                            : 'bg-[#FBEAE6] text-[#A24824] dark:bg-[#3D1E16] dark:text-[#E8734C]'
                        }`}
                      >
                        {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#25201B] dark:text-[#F2EFEA] truncate">
                          {tx.note}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-[#7A7163] dark:text-[#9A9184]">
                          <span
                            className="inline-block w-2 h-2 rounded-2xs"
                            style={{ backgroundColor: cat?.color || '#8C8375' }}
                          />
                          <span>{language === 'ar_ma' && cat ? cat.labelDarija : cat?.label || tx.category}</span>
                          {tx.recipientOrSource && (
                            <>
                              <span>•</span>
                              <span>{tx.recipientOrSource}</span>
                            </>
                          )}
                          <span>•</span>
                          <span className="capitalize">{tx.paymentMethod}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <div className="text-right">
                        <span
                          className={`font-mono font-bold text-xs tabular-nums ${
                            isIncome
                              ? 'text-[#2C623E] dark:text-[#67B588]'
                              : 'text-[#A24824] dark:text-[#E8734C]'
                          }`}
                        >
                          {isIncome ? '+' : '-'}
                          {Math.round(tx.amount).toLocaleString('fr-FR')} {currency === 'MAD' ? 'DH' : currency}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditTransaction(tx)}
                          className="p-1 text-[#786E61] dark:text-[#A69E91] hover:text-[#A24824] dark:hover:text-[#E8734C] hover:bg-[#F0ECE1] dark:hover:bg-[#2C2923] rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1 text-[#786E61] dark:text-[#A69E91] hover:text-[#B91C1C] dark:hover:text-[#F87171] hover:bg-[#FEE2E2] dark:hover:bg-[#3D1E16] rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

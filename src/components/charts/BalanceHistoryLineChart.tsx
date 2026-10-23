import React, { useState, useMemo } from 'react';
import { Transaction, Currency, Language } from '../../types';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Calendar, Maximize2, Sparkles } from 'lucide-react';

interface BalanceHistoryLineChartProps {
  transactions: Transaction[];
  currency: Currency;
  language: Language;
  initialBalance?: number;
}

interface BalancePoint {
  date: string;
  formattedDate: string;
  balance: number;
  change: number;
  txNote: string;
  txType: 'income' | 'expense';
  isLowest?: boolean;
  isHighest?: boolean;
}

export const BalanceHistoryLineChart: React.FC<BalanceHistoryLineChartProps> = ({
  transactions,
  currency,
  language,
  initialBalance = 15000,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<BalancePoint | null>(null);
  const [filterRange, setFilterRange] = useState<'all' | '30d' | '90d'>('all');

  // Compute chronologically sorted cumulative balance points
  const balancePoints = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    // Sort transactions chronologically
    const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

    // Optional range filter
    let filteredTxs = sorted;
    if (filterRange === '30d') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const limitStr = thirtyDaysAgo.toISOString().split('T')[0];
      filteredTxs = sorted.filter((t) => t.date >= limitStr);
    } else if (filterRange === '90d') {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const limitStr = ninetyDaysAgo.toISOString().split('T')[0];
      filteredTxs = sorted.filter((t) => t.date >= limitStr);
    }

    if (filteredTxs.length === 0) filteredTxs = sorted;

    let runningBalance = initialBalance;
    const points: BalancePoint[] = [];

    // Add starting baseline point
    const firstDate = filteredTxs[0]?.date || '2026-09-01';
    points.push({
      date: firstDate,
      formattedDate: 'Départ',
      balance: initialBalance,
      change: 0,
      txNote: 'Solde initial de réserve',
      txType: 'income',
    });

    filteredTxs.forEach((tx) => {
      const delta = tx.type === 'income' ? tx.amount : -tx.amount;
      runningBalance += delta;

      const dateParts = tx.date.split('-');
      const day = dateParts[2];
      const month = dateParts[1];
      const formattedDate = `${day}/${month}`;

      points.push({
        date: tx.date,
        formattedDate,
        balance: runningBalance,
        change: delta,
        txNote: tx.note,
        txType: tx.type,
      });
    });

    // Determine highest and lowest points
    let minIdx = 0;
    let maxIdx = 0;
    points.forEach((p, idx) => {
      if (p.balance < points[minIdx].balance) minIdx = idx;
      if (p.balance > points[maxIdx].balance) maxIdx = idx;
    });

    points[minIdx].isLowest = true;
    points[maxIdx].isHighest = true;

    return points;
  }, [transactions, initialBalance, filterRange]);

  if (balancePoints.length === 0) return null;

  const currentBalance = balancePoints[balancePoints.length - 1].balance;
  const startBalance = balancePoints[0].balance;
  const totalGrowth = currentBalance - startBalance;
  const growthPercent = startBalance > 0 ? (totalGrowth / startBalance) * 100 : 0;

  // SVG Chart math
  const chartWidth = 900;
  const chartHeight = 180;
  const paddingX = 45;
  const paddingY = 25;
  const plotWidth = chartWidth - 2 * paddingX;
  const plotHeight = chartHeight - 2 * paddingY;

  const minVal = Math.min(...balancePoints.map((p) => p.balance)) * 0.92;
  const maxVal = Math.max(...balancePoints.map((p) => p.balance)) * 1.08;

  const getX = (index: number) => {
    if (balancePoints.length <= 1) return paddingX;
    return paddingX + (index / (balancePoints.length - 1)) * plotWidth;
  };

  const getY = (val: number) => {
    const range = maxVal - minVal || 1;
    const ratio = (val - minVal) / range;
    return chartHeight - paddingY - ratio * plotHeight;
  };

  // Build SVG path
  const lineCoords = balancePoints.map((p, i) => `${getX(i)},${getY(p.balance)}`);
  const linePath = `M ${lineCoords.join(' L ')}`;
  const areaPath = `M ${getX(0)},${chartHeight - paddingY} L ${lineCoords.join(
    ' L '
  )} L ${getX(balancePoints.length - 1)},${chartHeight - paddingY} Z`;

  const formatMoney = (val: number) => {
    const formatted = Math.round(val).toLocaleString('fr-FR');
    if (currency === 'MAD') return `${formatted} DH`;
    if (currency === 'EUR') return `${formatted} €`;
    return `$${formatted}`;
  };

  return (
    <div className="mt-5 bg-white dark:bg-[#1E1D19] rounded-xl border border-[#E5E0D5] dark:border-[#312E28] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#D6CEBF] dark:hover:border-[#423E36] transition-all">
      {/* Header of the balance chart */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0ECE1] dark:border-[#2E2B25]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-[#FAF4ED] dark:bg-[#2C221D] text-[#A24824] flex items-center justify-center font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#2A241F] dark:text-[#F2EFEA] tracking-wide">
                {language === 'ar_ma'
                  ? 'Ittijah d Solde L-kamel (Historique d Trésorerie)'
                  : 'Évolution Historique du Solde Cumulé (Cash Position)'}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EFECE3] dark:bg-[#2E2B25] text-[#6E6457] dark:text-[#9A9184] font-medium font-mono">
                {balancePoints.length} points
              </span>
            </div>
            <p className="text-[11px] text-[#8C8375] dark:text-[#8D8477]">
              {language === 'ar_ma'
                ? 'Kifach kbr solde dyalk b kola madkhoul w masrouf tsajjel'
                : 'Courbe continue de votre solde bancaire calculée chronologiquement selon la date de chaque opération'}
            </p>
          </div>
        </div>

        {/* Current balance display & Range switch */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-[#8A8071] dark:text-[#8D8477] uppercase tracking-wider block">Solde Actuel</span>
            <span className="text-base font-bold font-serif text-[#221F1C] dark:text-[#F2EFEA] tabular-nums">
              {formatMoney(currentBalance)}
            </span>
          </div>

          <div className="inline-flex rounded-lg border border-[#DCD5C6] dark:border-[#38342D] bg-[#EFECE3] dark:bg-[#25231F] p-0.5 text-xs">
            <button
              onClick={() => setFilterRange('all')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                filterRange === 'all' ? 'bg-white dark:bg-[#343029] text-[#2B2621] dark:text-[#F2EFEA] font-semibold shadow-2xs' : 'text-[#6F6659] dark:text-[#9A9184]'
              }`}
            >
              Tout
            </button>
            <button
              onClick={() => setFilterRange('90d')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                filterRange === '90d' ? 'bg-white dark:bg-[#343029] text-[#2B2621] dark:text-[#F2EFEA] font-semibold shadow-2xs' : 'text-[#6F6659] dark:text-[#9A9184]'
              }`}
            >
              90j
            </button>
            <button
              onClick={() => setFilterRange('30d')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                filterRange === '30d' ? 'bg-white dark:bg-[#343029] text-[#2B2621] dark:text-[#F2EFEA] font-semibold shadow-2xs' : 'text-[#6F6659] dark:text-[#9A9184]'
              }`}
            >
              30j
            </button>
          </div>
        </div>
      </div>

      {/* SVG Interactive Line Chart */}
      <div className="relative w-full h-[180px] pt-2">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="balanceAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F6D5B" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#4F6D5B" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[0, 0.33, 0.66, 1].map((step, idx) => {
            const y = chartHeight - paddingY - step * plotHeight;
            const val = Math.round(minVal + step * (maxVal - minVal));
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="currentColor"
                  className="text-[#EFEBE2] dark:text-[#2B2823]"
                  strokeDasharray="2 2"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  fontSize="9"
                  fill="#8C8375"
                  textAnchor="end"
                  className="font-mono tabular-nums select-none"
                >
                  {(val / 1000).toFixed(0)}k
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#balanceAreaGrad)" />

          {/* Solid line */}
          <path
            d={linePath}
            fill="none"
            stroke="#4F6D5B"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {balancePoints.map((point, index) => {
            const cx = getX(index);
            const cy = getY(point.balance);
            const isHovered = hoveredPoint?.date === point.date && hoveredPoint.balance === point.balance;

            return (
              <g
                key={`${point.date}-${index}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Visual pulse for hovered point */}
                {isHovered && (
                  <circle cx={cx} cy={cy} r="8" fill="#4F6D5B" fillOpacity="0.2" className="animate-ping" />
                )}

                {/* Point dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? '5' : point.isHighest || point.isLowest ? '4' : '3'}
                  fill="#FFFFFF"
                  stroke={point.isHighest ? '#3B6B55' : point.isLowest ? '#A24824' : '#4F6D5B'}
                  strokeWidth={isHovered ? '2.5' : '2'}
                  className="transition-all duration-150"
                />

                {/* Date labels on x-axis (spaced) */}
                {(index === 0 ||
                  index === balancePoints.length - 1 ||
                  index === Math.floor(balancePoints.length / 2)) && (
                  <text
                    x={cx}
                    y={chartHeight - 6}
                    fontSize="9"
                    fill="#8C8375"
                    textAnchor="middle"
                    className="font-medium select-none"
                  >
                    {point.formattedDate}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip with Transaction Details */}
        {hoveredPoint && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#26221D] text-[#F7F5F0] text-xs px-3.5 py-2.5 rounded-lg shadow-xl pointer-events-none tabular-nums animate-fadeIn z-20 min-w-[210px] border border-[#3E3831]">
            <div className="flex justify-between items-center text-[11px] text-[#C4B9AA] border-b border-[#3E3831] pb-1 mb-1.5">
              <span>{hoveredPoint.date}</span>
              <span className="font-semibold text-white">{hoveredPoint.formattedDate}</span>
            </div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[#C4B9AA]">Solde cumulé :</span>
              <span className="font-bold font-serif text-sm text-white">
                {formatMoney(hoveredPoint.balance)}
              </span>
            </div>
            {hoveredPoint.change !== 0 && (
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[#A89E90] truncate max-w-[120px]">{hoveredPoint.txNote}</span>
                <span
                  className={`font-mono font-bold ${
                    hoveredPoint.change > 0 ? 'text-[#74BA8F]' : 'text-[#F28B66]'
                  }`}
                >
                  {hoveredPoint.change > 0 ? '+' : ''}
                  {formatMoney(hoveredPoint.change)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary Footnote & Trajectory */}
      <div className="mt-3 pt-2.5 border-t border-[#F0ECE1] dark:border-[#2E2B25] flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#7A7163] dark:text-[#9A9184] gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#25201B] dark:text-[#F2EFEA]">
            {language === 'ar_ma' ? 'Ittijah l&apos;moujmal : ' : 'Trajectoire globale : '}
          </span>
          <span
            className={`inline-flex items-center font-bold ${
              totalGrowth >= 0 ? 'text-[#2C6E43]' : 'text-[#A24824]'
            }`}
          >
            {totalGrowth >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            {totalGrowth >= 0 ? '+' : ''}
            {formatMoney(totalGrowth)} ({growthPercent >= 0 ? '+' : ''}
            {growthPercent.toFixed(1)}%)
          </span>
        </div>

        <span className="text-[#968E82] italic">
          {language === 'ar_ma'
            ? 'Kola marra katzid opération b tarikhha, l-courbe katzad direct.'
            : 'Mis à jour chronologiquement d\'après vos dates de transaction.'}
        </span>
      </div>
    </div>
  );
};

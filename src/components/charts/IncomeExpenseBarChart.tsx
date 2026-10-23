import React, { useState } from 'react';
import { MonthlyChartItem } from '../../utils/chartData';
import { Currency, Language } from '../../types';
import { BarChart3, LineChart } from 'lucide-react';

interface IncomeExpenseBarChartProps {
  data: MonthlyChartItem[];
  currency: Currency;
  language: Language;
}

export const IncomeExpenseBarChart: React.FC<IncomeExpenseBarChartProps> = ({
  data,
  currency,
  language,
}) => {
  const [viewMode, setViewMode] = useState<'bars' | 'lines'>('bars');
  const [hoveredMonth, setHoveredMonth] = useState<MonthlyChartItem | null>(null);

  // Math for chart scaling
  const maxVal = Math.max(
    30000,
    ...data.map((d) => Math.max(d.income, d.expense))
  ) * 1.15;

  const chartWidth = 560;
  const chartHeight = 200;
  const paddingX = 40;
  const paddingY = 25;
  const plotWidth = chartWidth - 2 * paddingX;
  const plotHeight = chartHeight - 2 * paddingY;

  const getY = (val: number) => {
    const ratio = Math.max(0, val) / maxVal;
    return chartHeight - paddingY - ratio * plotHeight;
  };

  const barGroupWidth = plotWidth / data.length;
  const singleBarWidth = Math.min(22, (barGroupWidth - 14) / 2);

  // SVG paths for line mode
  const incomePoints = data.map((d, i) => {
    const x = paddingX + i * barGroupWidth + barGroupWidth / 2;
    const y = getY(d.income);
    return `${x},${y}`;
  });
  const expensePoints = data.map((d, i) => {
    const x = paddingX + i * barGroupWidth + barGroupWidth / 2;
    const y = getY(d.expense);
    return `${x},${y}`;
  });

  const incomeLinePath = `M ${incomePoints.join(' L ')}`;
  const expenseLinePath = `M ${expensePoints.join(' L ')}`;

  const incomeAreaPath = `M ${paddingX + barGroupWidth / 2},${chartHeight - paddingY} L ${incomePoints.join(
    ' L '
  )} L ${paddingX + (data.length - 1) * barGroupWidth + barGroupWidth / 2},${chartHeight - paddingY} Z`;

  return (
    <div className="bg-white dark:bg-[#1E1D19] rounded-xl border border-[#E5E0D5] dark:border-[#312E28] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
      <div>
        {/* Header with View Mode Switcher */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-[#423C34] dark:text-[#F2EFEA] tracking-wide flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-[#4F6D5B]" />
            {language === 'ar_ma'
              ? 'Madkhoul vs Masarif f l-waqt'
              : 'Revenus vs. Dépenses au fil du temps'}
          </span>

          <div className="flex items-center gap-2">
            {/* Legend pills */}
            <div className="flex items-center gap-2 text-[11px] text-[#786F62] dark:text-[#9A9184] mr-2 hidden sm:flex">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#4F6D5B]" />
                {language === 'ar_ma' ? 'Kandkhel' : 'Revenus'}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#A24824]" />
                {language === 'ar_ma' ? 'Kankhser' : 'Dépenses'}
              </span>
            </div>

            {/* Switch view */}
            <div className="inline-flex rounded-lg border border-[#DCD5C6] dark:border-[#38342D] bg-[#EFECE3] dark:bg-[#25231F] p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('bars')}
                className={`p-1 rounded transition-all ${
                  viewMode === 'bars'
                    ? 'bg-white dark:bg-[#343029] text-[#2B2621] dark:text-[#F2EFEA] shadow-2xs'
                    : 'text-[#7A7061] dark:text-[#9A9184]'
                }`}
                title="Affichage en barres"
              >
                <BarChart3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('lines')}
                className={`p-1 rounded transition-all ${
                  viewMode === 'lines'
                    ? 'bg-white dark:bg-[#343029] text-[#2B2621] dark:text-[#F2EFEA] shadow-2xs'
                    : 'text-[#7A7061] dark:text-[#9A9184]'
                }`}
                title="Affichage en courbes"
              >
                <LineChart className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-[#8C8375] dark:text-[#8D8477] mb-3">
          {language === 'ar_ma'
            ? 'Muqaranat lmadkhoul m3a lmasrouf b (DH) kola ch-her'
            : `Comparaison mensuelle en temps réel (${currency === 'MAD' ? 'k DH' : currency})`}
        </p>

        {/* SVG Chart */}
        <div className="relative w-full h-[200px] pt-1">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
            {/* Grid lines */}
            {[0, 0.33, 0.66, 1].map((step, idx) => {
              const y = chartHeight - paddingY - step * plotHeight;
              const val = Math.round(step * maxVal);
              return (
                <g key={idx}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="currentColor"
                    className="text-[#EDE8DC] dark:text-[#2B2823]"
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

            {/* Mode 1: Grouped Bars */}
            {viewMode === 'bars' &&
              data.map((item, i) => {
                const groupX = paddingX + i * barGroupWidth;
                const incomeX = groupX + (barGroupWidth / 2) - singleBarWidth - 1.5;
                const expenseX = groupX + (barGroupWidth / 2) + 1.5;

                const incomeY = getY(item.income);
                const expenseY = getY(item.expense);

                const incomeHeight = chartHeight - paddingY - incomeY;
                const expenseHeight = chartHeight - paddingY - expenseY;

                const isHovered = hoveredMonth?.monthKey === item.monthKey;

                return (
                  <g
                    key={item.monthKey}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredMonth(item)}
                    onMouseLeave={() => setHoveredMonth(null)}
                  >
                    {/* Hover highlight column backdrop */}
                    {isHovered && (
                      <rect
                        x={groupX + 4}
                        y={paddingY}
                        width={barGroupWidth - 8}
                        height={plotHeight}
                        fill="#F2EEE5"
                        rx="4"
                      />
                    )}

                    {/* Income Bar (Sage green) */}
                    <rect
                      x={incomeX}
                      y={incomeY}
                      width={singleBarWidth}
                      height={Math.max(2, incomeHeight)}
                      fill="#4F6D5B"
                      rx="2"
                      className="transition-all duration-200 hover:brightness-105"
                    />

                    {/* Expense Bar (Terracotta) */}
                    <rect
                      x={expenseX}
                      y={expenseY}
                      width={singleBarWidth}
                      height={Math.max(2, expenseHeight)}
                      fill="#A24824"
                      rx="2"
                      className="transition-all duration-200 hover:brightness-105"
                    />

                    {/* Month Label */}
                    <text
                      x={groupX + barGroupWidth / 2}
                      y={chartHeight - 6}
                      fontSize="10"
                      fill={isHovered ? '#25201B' : '#7D7466'}
                      fontWeight={isHovered ? 'bold' : 'normal'}
                      textAnchor="middle"
                      className="select-none font-medium"
                    >
                      {item.shortLabel}
                    </text>
                  </g>
                );
              })}

            {/* Mode 2: Curves / Area */}
            {viewMode === 'lines' && (
              <>
                <defs>
                  <linearGradient id="chartIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F6D5B" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#4F6D5B" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={incomeAreaPath} fill="url(#chartIncomeGrad)" />

                <path
                  d={incomeLinePath}
                  fill="none"
                  stroke="#4F6D5B"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <path
                  d={expenseLinePath}
                  fill="none"
                  stroke="#A24824"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  strokeLinecap="round"
                />

                {data.map((item, i) => {
                  const cx = paddingX + i * barGroupWidth + barGroupWidth / 2;
                  const cyIncome = getY(item.income);
                  const isHovered = hoveredMonth?.monthKey === item.monthKey;
                  return (
                    <g
                      key={item.monthKey}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredMonth(item)}
                      onMouseLeave={() => setHoveredMonth(null)}
                    >
                      <circle
                        cx={cx}
                        cy={cyIncome}
                        r={isHovered ? '5' : '3.5'}
                        fill="#FFFFFF"
                        stroke="#4F6D5B"
                        strokeWidth="2"
                      />
                      <text
                        x={cx}
                        y={chartHeight - 6}
                        fontSize="10"
                        fill="#7D7466"
                        textAnchor="middle"
                        className="font-medium"
                      >
                        {item.shortLabel}
                      </text>
                    </g>
                  );
                })}
              </>
            )}
          </svg>

          {/* Interactive Floating Tooltip */}
          {hoveredMonth && (
            <div className="absolute top-2 right-4 bg-[#26221D] text-[#F7F5F0] text-xs p-3 rounded-lg shadow-lg pointer-events-none tabular-nums animate-fadeIn z-10 min-w-[170px] border border-[#3E3831]">
              <div className="font-serif font-bold text-sm text-white mb-1.5 border-b border-[#3E3831] pb-1">
                {hoveredMonth.label}
              </div>
              <div className="flex justify-between items-center text-[#74BA8F] mb-1">
                <span>↗ {language === 'ar_ma' ? 'Kandkhel' : 'Revenus'} :</span>
                <span className="font-bold">
                  {Math.round(hoveredMonth.income).toLocaleString('fr-FR')} {currency === 'MAD' ? 'DH' : currency}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#F28B66] mb-1.5">
                <span>↘ {language === 'ar_ma' ? 'Kankhser' : 'Dépenses'} :</span>
                <span className="font-bold">
                  {Math.round(hoveredMonth.expense).toLocaleString('fr-FR')} {currency === 'MAD' ? 'DH' : currency}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-[#3E3831] text-xs">
                <span className="text-[#C5BAAA]">{language === 'ar_ma' ? 'Flous li bqaw' : 'Solde Net'} :</span>
                <span className={`font-bold ${hoveredMonth.net >= 0 ? 'text-white' : 'text-[#F87171]'}`}>
                  {hoveredMonth.net >= 0 ? '+' : ''}
                  {Math.round(hoveredMonth.net).toLocaleString('fr-FR')} {currency === 'MAD' ? 'DH' : currency}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Takeaway note pill matching screenshot */}
      <div className="mt-4 p-3 bg-[#F9F7F2] dark:bg-[#25221C] rounded-lg border border-[#E9E4D8] dark:border-[#363229] text-[11px] leading-relaxed text-[#5A5144] dark:text-[#B6AEA3]">
        <strong className="text-[#2B2621] dark:text-[#F2EFEA] font-semibold">
          {language === 'ar_ma' ? 'Moula7ada d l-chohor : ' : 'Bilan de trésorerie : '}
        </strong>
        {language === 'ar_ma'
          ? 'L&apos;application katsajal kola opération f l-waqt w t3awd t7seb les totaux dyal kola ch-her automatic.'
          : 'Les barres et courbes se mettent à jour automatiquement en temps réel dès que vous ajoutez ou modifiez une transaction.'}
      </div>
    </div>
  );
};

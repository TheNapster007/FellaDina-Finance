import React, { useState } from 'react';
import { ForecastTimelineMonth, Currency, Language } from '../../types';
import { Sparkles, TrendingUp, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

interface PredictiveForecastChartProps {
  timeline: ForecastTimelineMonth[];
  allocatedBudgetCap: number;
  currency: Currency;
  language: Language;
}

export const PredictiveForecastChart: React.FC<PredictiveForecastChartProps> = ({
  timeline,
  allocatedBudgetCap,
  currency,
  language,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [showDualSeries, setShowDualSeries] = useState(false);

  if (!timeline || timeline.length === 0) {
    return null;
  }

  // Dimensions & Padding
  const width = 760;
  const height = 280;
  const padLeft = 65;
  const padRight = 45;
  const padTop = 35;
  const padBottom = 45;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  // Maximum scale value across all values, corridor, budget cap and incomes
  const allValues = timeline.flatMap((d) => [
    d.actualOrExpectedExpense,
    d.maxExpense,
    d.minExpense,
    d.projectedIncome,
    allocatedBudgetCap,
  ]);
  const minVal = 0;
  const maxVal = Math.max(25000, ...allValues) * 1.12;

  const getX = (idx: number) => {
    if (timeline.length <= 1) return padLeft + plotW / 2;
    return padLeft + (idx / (timeline.length - 1)) * plotW;
  };

  const getY = (val: number) => {
    const ratio = Math.max(0, val) / maxVal;
    return padTop + plotH - ratio * plotH;
  };

  // Find index where projection starts
  const firstProjectionIdx = timeline.findIndex((d) => d.isProjection);
  const dividerX = firstProjectionIdx > 0
    ? (getX(firstProjectionIdx - 1) + getX(firstProjectionIdx)) / 2
    : getX(0);

  // SVG Points for Historical Line
  const historicalIndices = timeline
    .map((d, i) => (d.isProjection ? -1 : i))
    .filter((i) => i !== -1);
  // Include the transition point (first projection) to connect the line seamlessly
  const historicalPathPoints = timeline
    .slice(0, firstProjectionIdx >= 0 ? firstProjectionIdx + 1 : timeline.length)
    .map((d, i) => `${getX(i)},${getY(d.actualOrExpectedExpense)}`);

  // SVG Points for Projection Line
  const projectionSlice = firstProjectionIdx > 0
    ? timeline.slice(firstProjectionIdx - 1) // start from last historical point for continuity
    : timeline;
  const projectionOffset = firstProjectionIdx > 0 ? firstProjectionIdx - 1 : 0;
  const projectionPathPoints = projectionSlice.map((d, i) =>
    `${getX(projectionOffset + i)},${getY(d.actualOrExpectedExpense)}`
  );

  // Corridor polygon for future projection uncertainty fan
  const futurePoints = timeline.map((d, i) => ({ d, i })).filter((x) => x.d.isProjection);
  let corridorPath = '';
  if (futurePoints.length > 0) {
    // Add anchor from last historical month
    const anchorIdx = Math.max(0, futurePoints[0].i - 1);
    const anchor = timeline[anchorIdx];

    const upperPoints = [
      `${getX(anchorIdx)},${getY(anchor.actualOrExpectedExpense)}`,
      ...futurePoints.map((p) => `${getX(p.i)},${getY(p.d.maxExpense)}`),
    ];
    const lowerPoints = [
      ...futurePoints.map((p) => `${getX(p.i)},${getY(p.d.minExpense)}`).reverse(),
      `${getX(anchorIdx)},${getY(anchor.actualOrExpectedExpense)}`,
    ];

    corridorPath = `M ${upperPoints.join(' L ')} L ${lowerPoints.join(' L ')} Z`;
  }

  // Budget Cap line Y
  const budgetCapY = getY(allocatedBudgetCap);

  // Dual Series: Income line
  const incomePoints = timeline.map((d, i) => `${getX(i)},${getY(d.projectedIncome)}`);
  const incomePath = `M ${incomePoints.join(' L ')}`;

  const activePoint = hoveredIdx !== null ? timeline[hoveredIdx] : null;

  return (
    <div className="bg-white dark:bg-[#1C1B17] rounded-xl border border-[#E7E2D6] dark:border-[#2F2C26] p-5 sm:p-6 shadow-xs transition-colors">
      {/* Chart Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#2B2621] dark:text-[#F2EFEA] tracking-wide uppercase flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#A24824] inline-block" />
              {language === 'ar_ma'
                ? 'Khatt l-masrouf w tawaqo3at l-chhor jaya'
                : 'Courbe d\'Évolution & Corridor Prévisionnel sur 3 Mois'}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-[#A24824]/10 dark:bg-[#A24824]/20 text-[#A24824] dark:text-[#E8734C] px-2 py-0.5 rounded-full border border-[#A24824]/25">
              <Sparkles className="w-3 h-3" />
              {language === 'ar_ma' ? 'Modèle Prédictif' : 'IA & Tendances Statistiques'}
            </span>
          </div>
          <p className="text-[11px] text-[#786F62] dark:text-[#9A9184] mt-0.5">
            {language === 'ar_ma'
              ? 'Taqdir d l-masrouf b 9issmat l-ahdaf w l-waqt li kayji'
              : 'Projection continue : Historique réel constaté couplé à la fourchette d\'incertitude (fan chart).'}
          </p>
        </div>

        {/* Legend & Toggle */}
        <div className="flex items-center flex-wrap gap-2 text-[11px] text-[#6E6457] dark:text-[#9F9688]">
          <button
            type="button"
            onClick={() => setShowDualSeries(!showDualSeries)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
              showDualSeries
                ? 'bg-[#4F6D5B] text-white border-[#4F6D5B]'
                : 'bg-[#F4F1EA] dark:bg-[#252420] text-[#625A4E] dark:text-[#C5BEB3] border-[#DDD7C9] dark:border-[#38352F] hover:bg-[#EAE5DA]'
            }`}
          >
            {showDualSeries
              ? (language === 'ar_ma' ? 'Khabbi l-madkhoul' : 'Masquer Revenus')
              : (language === 'ar_ma' ? '+ Bayyen l-madkhoul' : '+ Afficher Revenus')}
          </button>
        </div>
      </div>

      {/* Visual Legend Row */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-3 pb-2 border-b border-[#EFECE4] dark:border-[#2A2722] text-[11px] text-[#71685B] dark:text-[#9B9285]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-[#A24824] rounded-full inline-block" />
          <span>{language === 'ar_ma' ? 'Masrouf 7aqiqi (Réel)' : 'Dépenses réelles constatées'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 border-t-2 border-dashed border-[#D96B43] inline-block" />
          <span>{language === 'ar_ma' ? 'Tawaqo3at (Projection 3 mois)' : 'Projection modèle (3 prochains mois)'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-2 bg-[#D96B43]/20 border border-[#D96B43]/40 rounded-xs inline-block" />
          <span>{language === 'ar_ma' ? 'Corridor d l-i7timalat (Fourchette)' : 'Corridor de confiance (Min - Max)'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 border-t-2 border-dotted border-[#78716C] inline-block" />
          <span>{language === 'ar_ma' ? 'Plafond l-mizaniya' : 'Plafond budgétaire mensuel'}</span>
        </div>
      </div>

      {/* Main SVG Container */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[560px] select-none"
        >
          <defs>
            {/* Linear gradient for confidence corridor */}
            <linearGradient id="corridorGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D96B43" stopOpacity="0.22" />
              <stop offset="50%" stopColor="#D96B43" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#D96B43" stopOpacity="0.03" />
            </linearGradient>

            {/* Gradient for historical area */}
            <linearGradient id="historicalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A24824" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#A24824" stopOpacity="0.01" />
            </linearGradient>

            {/* Glow filter for forecast node markers */}
            <filter id="glowForecast" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#D96B43" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Grid lines (horizontal) */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((ratio) => {
            const val = minVal + (maxVal - minVal) * ratio;
            const y = getY(val);
            return (
              <g key={ratio}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#E8E4DA"
                  className="dark:stroke-[#2B2822]"
                  strokeWidth="1"
                  strokeDasharray={ratio === 0 ? undefined : '3 3'}
                />
                <text
                  x={padLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-[#9A9184] text-[9.5px] font-mono"
                >
                  {Math.round(val).toLocaleString('fr-FR')} {currency === 'MAD' ? 'DH' : currency}
                </text>
              </g>
            );
          })}

          {/* Background tint for the 3-month forecast region */}
          {firstProjectionIdx >= 0 && (
            <g>
              <rect
                x={dividerX}
                y={padTop}
                width={width - padRight - dividerX}
                height={plotH}
                fill="#A24824"
                fillOpacity="0.02"
              />
              <line
                x1={dividerX}
                y1={padTop - 8}
                x2={dividerX}
                y2={padTop + plotH}
                stroke="#A24824"
                strokeWidth="1.2"
                strokeDasharray="4 4"
                opacity="0.6"
              />
              <rect
                x={dividerX + 6}
                y={padTop - 4}
                width={90}
                height={16}
                rx={3}
                fill="#A24824"
                className="opacity-90"
              />
              <text
                x={dividerX + 51}
                y={padTop + 7}
                textAnchor="middle"
                fill="#FFFFFF"
                className="text-[9px] font-bold tracking-wider uppercase font-sans"
              >
                {language === 'ar_ma' ? '→ Telt chhor' : '→ Horizon 3 mois'}
              </text>
            </g>
          )}

          {/* Budget Cap Reference Line */}
          <g>
            <line
              x1={padLeft}
              y1={budgetCapY}
              x2={width - padRight}
              y2={budgetCapY}
              stroke="#8C8275"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <rect
              x={width - padRight - 110}
              y={budgetCapY - 18}
              width={110}
              height={15}
              rx={3}
              fill="#F4F1EA"
              className="dark:fill-[#2B2822] stroke-[#D5CEBF] dark:stroke-[#3D3930]"
              strokeWidth="1"
            />
            <text
              x={width - padRight - 55}
              y={budgetCapY - 7}
              textAnchor="middle"
              className="fill-[#645C4F] dark:fill-[#C4BCB0] text-[8.5px] font-semibold tracking-wide"
            >
              Plafond: {Math.round(allocatedBudgetCap).toLocaleString('fr-FR')} {currency}
            </text>
          </g>

          {/* Confidence Corridor Polygon (Fan Chart) */}
          {corridorPath && (
            <path
              d={corridorPath}
              fill="url(#corridorGradient)"
              className="transition-all duration-300"
            />
          )}

          {/* Dual series: Income Line if enabled */}
          {showDualSeries && (
            <path
              d={incomePath}
              fill="none"
              stroke="#4F6D5B"
              strokeWidth="2.2"
              strokeDasharray="2 2"
              className="transition-all"
            />
          )}

          {/* Historical Solid Line */}
          {historicalPathPoints.length > 1 && (
            <path
              d={`M ${historicalPathPoints.join(' L ')}`}
              fill="none"
              stroke="#A24824"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Projection Dashed Line */}
          {projectionPathPoints.length > 1 && (
            <path
              d={`M ${projectionPathPoints.join(' L ')}`}
              fill="none"
              stroke="#D96B43"
              strokeWidth="2.8"
              strokeDasharray="5 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points & Interactive Hit Targets */}
          {timeline.map((point, idx) => {
            const cx = getX(idx);
            const cy = getY(point.actualOrExpectedExpense);
            const isHovered = hoveredIdx === idx;
            const isOverBudget = point.actualOrExpectedExpense > allocatedBudgetCap;

            return (
              <g
                key={point.monthKey}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Vertical hover guide */}
                {isHovered && (
                  <line
                    x1={cx}
                    y1={padTop}
                    x2={cx}
                    y2={padTop + plotH}
                    stroke="#D96B43"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity="0.8"
                  />
                )}

                {/* Min / Max bounds markers on hover for projections */}
                {point.isProjection && isHovered && (
                  <g>
                    {/* Upper bound marker */}
                    <circle cx={cx} cy={getY(point.maxExpense)} r="3" fill="#D96B43" opacity="0.7" />
                    <line
                      x1={cx - 5}
                      y1={getY(point.maxExpense)}
                      x2={cx + 5}
                      y2={getY(point.maxExpense)}
                      stroke="#D96B43"
                      strokeWidth="1.5"
                    />

                    {/* Lower bound marker */}
                    <circle cx={cx} cy={getY(point.minExpense)} r="3" fill="#D96B43" opacity="0.7" />
                    <line
                      x1={cx - 5}
                      y1={getY(point.minExpense)}
                      x2={cx + 5}
                      y2={getY(point.minExpense)}
                      stroke="#D96B43"
                      strokeWidth="1.5"
                    />
                  </g>
                )}

                {/* Point circle */}
                {point.isProjection ? (
                  <g filter="url(#glowForecast)">
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 7.5 : 5.5}
                      fill="#FFFFFF"
                      stroke={isOverBudget ? '#C2410C' : '#D96B43'}
                      strokeWidth={isHovered ? 3 : 2.5}
                      className="transition-all duration-150"
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r={2}
                      fill={isOverBudget ? '#C2410C' : '#D96B43'}
                    />
                  </g>
                ) : (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 6.5 : 4.5}
                    fill="#A24824"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="transition-all duration-150"
                  />
                )}

                {/* X-axis Month Label */}
                <text
                  x={cx}
                  y={padTop + plotH + 18}
                  textAnchor="middle"
                  className={`text-[10.5px] font-medium font-sans ${
                    point.isProjection
                      ? 'fill-[#A24824] dark:fill-[#E8734C] font-semibold'
                      : 'fill-[#5D5548] dark:fill-[#C4BCB0]'
                  }`}
                >
                  {point.shortLabel}
                </text>

                {/* Projection / Actual Sub-label */}
                <text
                  x={cx}
                  y={padTop + plotH + 30}
                  textAnchor="middle"
                  className="text-[8.5px] font-sans fill-[#8F8677] uppercase tracking-wider"
                >
                  {point.isProjection
                    ? (language === 'ar_ma' ? 'Tawaqo3' : 'Prévu')
                    : (language === 'ar_ma' ? '7aqiqi' : 'Réel')}
                </text>

                {/* Transparent hit area for easy hover on mobile and desktop */}
                <rect
                  x={cx - 25}
                  y={padTop}
                  width={50}
                  height={plotH + 35}
                  fill="transparent"
                />
              </g>
            );
          })}
        </svg>

        {/* Rich Interactive Tooltip Floating Box */}
        {activePoint && hoveredIdx !== null && (
          <div
            className="absolute top-4 pointer-events-none z-20 bg-[#25221E] text-[#F7F5F0] rounded-lg p-3 text-xs shadow-xl border border-[#443E35] min-w-[210px] transition-all"
            style={{
              left: `${Math.min(Math.max(10, (getX(hoveredIdx) / width) * 100 - 15), 72)}%`,
            }}
          >
            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-[#3D372F] mb-2">
              <span className="font-bold text-sm text-[#F7F5F0]">{activePoint.label}</span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                  activePoint.isProjection
                    ? 'bg-[#D96B43] text-white'
                    : 'bg-[#557C67] text-white'
                }`}
              >
                {activePoint.isProjection
                  ? (language === 'ar_ma' ? 'PROJECTION 3 MOIS' : 'PROJECTION')
                  : (language === 'ar_ma' ? 'RÉEL CONSTATÉ' : 'RÉEL')}
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between items-baseline">
                <span className="text-[#B3ABA0]">
                  {activePoint.isProjection ? 'Dépense prévisionnelle :' : 'Dépense totale réelle :'}
                </span>
                <span className="font-mono font-bold text-sm text-[#FFB088]">
                  {Math.round(activePoint.actualOrExpectedExpense).toLocaleString('fr-FR')} {currency}
                </span>
              </div>

              {activePoint.isProjection && (
                <div className="flex justify-between items-baseline text-[10.5px] text-[#A69E93]">
                  <span>Corridor de confiance :</span>
                  <span className="font-mono">
                    [{Math.round(activePoint.minExpense).toLocaleString('fr-FR')} – {Math.round(activePoint.maxExpense).toLocaleString('fr-FR')}]
                  </span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-1 border-t border-[#3D372F]/80">
                <span className="text-[#B3ABA0]">Écart vs Plafond Budgétaire :</span>
                {activePoint.actualOrExpectedExpense > allocatedBudgetCap ? (
                  <span className="text-[#FF7A59] font-semibold font-mono">
                    +{Math.round(activePoint.actualOrExpectedExpense - allocatedBudgetCap).toLocaleString('fr-FR')} {currency} (Dépassement)
                  </span>
                ) : (
                  <span className="text-[#64C28D] font-semibold font-mono">
                    -{Math.round(allocatedBudgetCap - activePoint.actualOrExpectedExpense).toLocaleString('fr-FR')} {currency} (Conforme)
                  </span>
                )}
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-[#B3ABA0]">Épargne estimée :</span>
                <span className="text-[#64C28D] font-semibold font-mono">
                  +{Math.round(activePoint.projectedSavings).toLocaleString('fr-FR')} {currency}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

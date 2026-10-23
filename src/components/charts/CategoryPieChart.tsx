import React, { useState } from 'react';
import { CategoryChartItem } from '../../utils/chartData';
import { Currency, Language } from '../../types';

interface CategoryPieChartProps {
  data: CategoryChartItem[];
  title: string;
  subtitle: string;
  currency: Currency;
  language: Language;
  onSelectCategory?: (id: string) => void;
  selectedCategory?: string;
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({
  data,
  title,
  subtitle,
  currency,
  language,
  onSelectCategory,
  selectedCategory,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalAmount = data.reduce((acc, item) => acc + item.amount, 0);

  // SVG dimensions
  const size = 260;
  const center = size / 2;
  const radius = 95;
  const innerRadius = 58; // Donut hole

  // Helper to convert polar coords to Cartesian
  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  // Build SVG path for donut slice
  const createSlicePath = (startAngle: number, endAngle: number, rOut: number, rIn: number) => {
    // If arc is full circle 360, adjust slightly to prevent rendering collapse
    const adjustedEnd = endAngle - startAngle >= 359.9 ? startAngle + 359.9 : endAngle;
    const startOuter = polarToCartesian(center, center, rOut, adjustedEnd);
    const endOuter = polarToCartesian(center, center, rOut, startAngle);
    const startInner = polarToCartesian(center, center, rIn, startAngle);
    const endInner = polarToCartesian(center, center, rIn, adjustedEnd);

    const largeArcFlag = adjustedEnd - startAngle <= 180 ? '0' : '1';

    return [
      `M ${startOuter.x} ${startOuter.y}`,
      `A ${rOut} ${rOut} 0 ${largeArcFlag} 0 ${endOuter.x} ${endOuter.y}`,
      `L ${startInner.x} ${startInner.y}`,
      `A ${rIn} ${rIn} 0 ${largeArcFlag} 1 ${endInner.x} ${endInner.y}`,
      'Z',
    ].join(' ');
  };

  // Compute angles for each segment
  let cumulativeAngle = 0;
  const slices = data.map((item, index) => {
    const sliceAngle = totalAmount > 0 ? (item.amount / totalAmount) * 360 : 0;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + sliceAngle;
    cumulativeAngle += sliceAngle;

    const isHovered = hoveredIndex === index;
    const isSelected = selectedCategory === item.id;
    const currentRadius = isHovered || isSelected ? radius + 5 : radius;
    const currentInner = isHovered || isSelected ? innerRadius - 2 : innerRadius;

    const pathData = createSlicePath(startAngle, endAngle, currentRadius, currentInner);

    return {
      ...item,
      startAngle,
      endAngle,
      midAngle: startAngle + sliceAngle / 2,
      pathData,
      isHovered,
      isSelected,
    };
  });

  const activeItem = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="bg-white dark:bg-[#1E1D19] rounded-xl border border-[#E5E0D5] dark:border-[#312E28] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-colors">
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-[#423C34] dark:text-[#E2DDD3] tracking-wide flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-[#A24824]" />
            {title}
          </span>
          <span className="text-[11px] text-[#797063] dark:text-[#9A9184] font-mono tabular-nums">
            {data.length} {language === 'ar_ma' ? 'asnâaf' : 'postes'}
          </span>
        </div>
        <p className="text-[11px] text-[#8C8375] dark:text-[#887F72] mb-4">{subtitle}</p>

        {/* Donut and Legend Flex Layout */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
          {/* Pie / Donut SVG Graphic */}
          <div className="relative w-52 h-52 shrink-0">
            {totalAmount === 0 ? (
              <div className="w-full h-full rounded-full border-4 border-dashed border-[#E5E0D5] dark:border-[#312E28] flex items-center justify-center text-xs text-[#8C8375] dark:text-[#887F72]">
                Aucune donnée
              </div>
            ) : (
              <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible">
                <defs>
                  <filter id="sliceShadow" x="-10%" y="-10%" width="130%" height="130%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
                  </filter>
                </defs>

                {slices.map((slice, index) => (
                  <path
                    key={slice.id}
                    d={slice.pathData}
                    fill={slice.color}
                    stroke="currentColor"
                    className="text-white dark:text-[#1E1D19] stroke-[2] transition-all duration-200 cursor-pointer"
                    filter={slice.isHovered ? 'url(#sliceShadow)' : undefined}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => onSelectCategory && onSelectCategory(slice.id)}
                  />
                ))}
              </svg>
            )}

            {/* Center Donut Hole content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              {activeItem ? (
                <>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A24824] dark:text-[#E8734C] truncate max-w-[100px]">
                    {language === 'ar_ma' ? activeItem.labelDarija : activeItem.label}
                  </span>
                  <span className="text-lg font-bold font-serif text-[#2B2621] dark:text-[#F2EFEA] tabular-nums">
                    {activeItem.percentage}%
                  </span>
                  <span className="text-[10px] text-[#786F62] dark:text-[#A49B8E] font-mono tabular-nums">
                    {Math.round(activeItem.amount).toLocaleString('fr-FR')} {currency === 'MAD' ? 'DH' : currency}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-semibold text-[#8C8375] dark:text-[#887F72] uppercase tracking-wider">
                    {language === 'ar_ma' ? 'L-MAJMOUE' : 'TOTAL'}
                  </span>
                  <span className="text-lg font-bold font-serif text-[#2B2621] dark:text-[#F2EFEA] tabular-nums">
                    {Math.round(totalAmount).toLocaleString('fr-FR')}
                  </span>
                  <span className="text-[10px] text-[#786F62] dark:text-[#A49B8E] font-mono">
                    {currency === 'MAD' ? 'DH' : currency}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Interactive Legend List */}
          <div className="flex flex-col gap-1.5 w-full max-w-[230px] max-h-56 overflow-y-auto pr-1">
            {data.slice(0, 6).map((item, index) => {
              const isHovered = hoveredIndex === index;
              const isSelected = selectedCategory === item.id;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => onSelectCategory && onSelectCategory(item.id)}
                  className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer border ${
                    isSelected
                      ? 'bg-[#EAE4D7] dark:bg-[#332F28] border-[#D6CDBC] dark:border-[#4B4438]'
                      : isHovered
                      ? 'bg-[#F4F0E6] dark:bg-[#282621] border-[#E8E1D2] dark:border-[#3D382F]'
                      : 'border-transparent hover:bg-[#F9F7F3] dark:hover:bg-[#24221D]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-xs shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[#3D372F] dark:text-[#E2DDD3] font-medium truncate text-[11px]">
                      {language === 'ar_ma' ? item.labelDarija : item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="font-mono text-[11px] font-semibold text-[#2B2621] dark:text-[#F2EFEA] tabular-nums">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Takeaway note matching screenshot */}
      <div className="mt-4 p-3 bg-[#F9F7F2] dark:bg-[#24221E] rounded-lg border border-[#E9E4D8] dark:border-[#36322A] text-[11px] leading-relaxed text-[#5A5144] dark:text-[#B6AEA3]">
        <strong className="text-[#2B2621] dark:text-[#F2EFEA] font-semibold">
          {language === 'ar_ma' ? 'Moula7ada : ' : 'Synthèse des dépenses : '}
        </strong>
        {data.length > 0
          ? `${data[0]?.label} représente la part la plus importante (${data[0]?.percentage}%), suivie de ${
              data[1]?.label || 'autres postes'
            }.`
          : 'Enregistrez vos premières opérations pour voir la répartition instantanée.'}
      </div>
    </div>
  );
};

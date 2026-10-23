import React, { useEffect, useState } from 'react';
import { ToastNotification, Language } from '../types';
import { AlertTriangle, AlertOctagon, CheckCircle2, Info, X, ChevronRight, ArrowRight } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
  language: Language;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  language,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm sm:max-w-md w-full px-4 sm:px-0 pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
          language={language}
        />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: ToastNotification;
  onDismiss: (id: string) => void;
  language: Language;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss, language }) => {
  const duration = toast.durationMs || 7000;
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss(toast.id);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [toast.id, duration, onDismiss]);

  const isWarning = toast.type === 'warning';
  const isDanger = toast.type === 'danger';
  const isSuccess = toast.type === 'success';

  // Card theme styling according to severity
  const borderClass = isDanger
    ? 'border-[#B91C1C] dark:border-[#DC2626]/80'
    : isWarning
    ? 'border-[#D97706] dark:border-[#F59E0B]/80'
    : isSuccess
    ? 'border-[#15803D] dark:border-[#22C55E]/80'
    : 'border-[#DCD5C6] dark:border-[#38342D]';

  const iconBg = isDanger
    ? 'bg-[#FEE2E2] text-[#B91C1C] dark:bg-[#451212] dark:text-[#FCA5A5]'
    : isWarning
    ? 'bg-[#FEF3C7] text-[#D97706] dark:bg-[#452D0A] dark:text-[#FCD34D]'
    : isSuccess
    ? 'bg-[#DCFCE7] text-[#15803D] dark:bg-[#123821] dark:text-[#86EFAC]'
    : 'bg-[#F3EFE7] text-[#6A6052] dark:bg-[#2C2923] dark:text-[#D5CFC5]';

  const barColor = isDanger
    ? 'bg-[#DC2626]'
    : isWarning
    ? 'bg-[#F59E0B]'
    : isSuccess
    ? 'bg-[#16A34A]'
    : 'bg-[#8C8375]';

  const titleText = language === 'ar_ma' && toast.titleDarija ? toast.titleDarija : toast.title;
  const messageText = language === 'ar_ma' && toast.messageDarija ? toast.messageDarija : toast.message;

  return (
    <div
      role="alert"
      className={`pointer-events-auto relative w-full bg-white dark:bg-[#1C1A17] rounded-xl border ${borderClass} shadow-xl overflow-hidden transition-all duration-300 transform translate-y-0 opacity-100 ring-1 ring-black/5`}
    >
      <div className="p-4 sm:p-4.5">
        <div className="flex items-start gap-3">
          {/* Severity Icon */}
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg} shadow-2xs`}>
            {isDanger ? (
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            ) : isWarning ? (
              <AlertTriangle className="w-5 h-5" />
            ) : isSuccess ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Info className="w-5 h-5" />
            )}
          </div>

          {/* Content Body */}
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h4 className="text-xs sm:text-sm font-bold text-[#221F1C] dark:text-[#F2EFEA] tracking-tight truncate">
                {titleText}
              </h4>
              {toast.percentage !== undefined && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full shrink-0 tabular-nums ${
                    isDanger
                      ? 'bg-[#FEE2E2] dark:bg-[#451212] text-[#B91C1C] dark:text-[#FCA5A5]'
                      : 'bg-[#FEF3C7] dark:bg-[#452D0A] text-[#B45309] dark:text-[#FCD34D]'
                  }`}
                >
                  {Math.round(toast.percentage)}%
                </span>
              )}
            </div>

            <p className="text-xs text-[#5E5548] dark:text-[#C4BCB0] leading-relaxed">
              {messageText}
            </p>

            {/* Visual Budget Progress Gauge if applicable */}
            {toast.percentage !== undefined && (
              <div className="mt-2.5 pt-2 border-t border-[#F0ECE1] dark:border-[#2C2923]">
                <div className="flex items-center justify-between text-[10px] font-mono mb-1 text-[#7A7163] dark:text-[#9A9184]">
                  <span>
                    {language === 'ar_ma' ? 'L-masrouf / Mizaniya :' : 'Consommé / Alloué :'}
                  </span>
                  <span className="font-semibold text-[#2B2621] dark:text-[#E8E4DC] tabular-nums">
                    {Math.round(toast.spentAmount || 0).toLocaleString('fr-FR')} / {Math.round(toast.budgetAmount || 0).toLocaleString('fr-FR')}{' '}
                    {toast.currency === 'MAD' ? 'DH' : toast.currency || 'DH'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#EAE5D9] dark:bg-[#343029] rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, toast.percentage)}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${
                      toast.percentage >= 100
                        ? 'bg-[#DC2626]'
                        : toast.percentage >= 80
                        ? 'bg-[#F59E0B]'
                        : 'bg-[#16A34A]'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Optional Interactive Action */}
            {toast.onAction && (
              <div className="mt-3 flex items-center justify-start">
                <button
                  type="button"
                  onClick={() => {
                    toast.onAction?.();
                    onDismiss(toast.id);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A24824] dark:text-[#E8734C] hover:underline"
                >
                  <span>
                    {toast.actionLabel ||
                      (language === 'ar_ma' ? 'Chof l-poste' : 'Inspecter ce poste')}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Fermer la notification"
            className="p-1 text-[#8C8375] hover:text-[#25201B] dark:hover:text-[#F2EFEA] rounded-md hover:bg-[#F2EEE4] dark:hover:bg-[#2F2C26] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timer Progress Bar */}
      <div className="w-full h-1 bg-[#F0ECE1] dark:bg-[#2C2923]">
        <div
          style={{ width: `${progress}%` }}
          className={`h-full transition-all duration-75 ease-linear ${barColor}`}
        />
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Language, Currency } from '../types';
import { User, ChevronDown, LogOut, Settings, Sparkles, UserPlus, Shield, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface UserProfileMenuProps {
  currentUser: UserProfile | null;
  onOpenSignUp: () => void;
  onOpenSignIn: () => void;
  onLogout: () => void;
  onEditProfile: () => void;
  language: Language;
  currency: Currency;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  currentUser,
  onOpenSignUp,
  onOpenSignIn,
  onLogout,
  onEditProfile,
  language,
  currency,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={onOpenSignUp}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#A24824] hover:bg-[#8F3E1E] text-white text-xs font-semibold rounded-lg shadow-sm transition-all hover:shadow"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{language === 'ar_ma' ? 'Sjel 7ssab (Sign Up)' : "S'inscrire"}</span>
        </button>
        <button
          onClick={onOpenSignIn}
          title="Se connecter"
          className="hidden sm:inline-flex items-center px-2 py-1.5 text-xs text-[#5C5346] dark:text-[#C5BEB2] hover:text-[#2B2621] dark:hover:text-[#F5F2EB] font-medium"
        >
          {language === 'ar_ma' ? 'Dkhol' : 'Connexion'}
        </button>
      </div>
    );
  }

  const totalIncomes = currentUser.incomes ? currentUser.incomes.reduce((sum, i) => sum + i.amount, 0) : 0;
  const totalExpenses = currentUser.expenses ? currentUser.expenses.reduce((sum, e) => sum + e.amount, 0) : 0;
  const initialBalance = currentUser.initialBalance || 0;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 bg-white dark:bg-[#22201C] hover:bg-[#FAF6F0] dark:hover:bg-[#2A2621] border border-[#DCD5C6] dark:border-[#38342D] rounded-lg transition-colors text-xs font-medium text-[#2B2621] dark:text-[#F5F2EB] shadow-2xs cursor-pointer"
      >
        {currentUser.avatarUrl ? (
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-5 h-5 rounded-full object-cover"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-[#A24824] text-white flex items-center justify-center text-[10px] font-bold">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="font-semibold max-w-[100px] sm:max-w-[130px] truncate">
          {currentUser.name}
        </span>
        <ChevronDown className="w-3 h-3 text-[#8C8275]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-[#FAF8F5] dark:bg-[#1E1C18] border border-[#E3DDD1] dark:border-[#38332A] rounded-xl shadow-xl z-50 p-3 animate-fade-in text-xs">
          {/* Header */}
          <div className="flex items-center gap-3 pb-3 border-b border-[#E7E2D6] dark:border-[#2E2B25]">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-10 h-10 rounded-xl object-cover shadow-xs border border-[#E5DFD4] dark:border-[#332E27]"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[#A24824] text-white flex items-center justify-center text-sm font-bold shadow-xs">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="overflow-hidden">
              <span className="font-bold text-sm text-[#2B2621] dark:text-[#F5F2EB] block truncate">
                {currentUser.name}
              </span>
              <span className="text-[11px] text-[#8C8275] block truncate">
                {currentUser.email}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#3B6B55] dark:text-[#529E7D] mt-0.5">
                <Shield className="w-3 h-3" /> Synchronisé Firebase & Google
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="my-2.5 p-2 bg-white dark:bg-[#25221C] border border-[#E5DFD4] dark:border-[#332E27] rounded-lg space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#7A7164] flex items-center gap-1">
                <Wallet className="w-3 h-3 text-[#A24824]" /> Réserve de départ:
              </span>
              <span className="font-bold text-[#2B2621] dark:text-[#F5F2EB]">
                {initialBalance.toLocaleString('fr-FR')} {currency}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#7A7164] flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-[#3B6B55]" /> Revenus déclarés:
              </span>
              <span className="font-bold text-[#3B6B55] dark:text-[#529E7D]">
                +{totalIncomes.toLocaleString('fr-FR')} {currency}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#7A7164] flex items-center gap-1">
                <ArrowDownRight className="w-3 h-3 text-[#A24824]" /> Charges prévues:
              </span>
              <span className="font-bold text-[#A24824] dark:text-[#E8734C]">
                -{totalExpenses.toLocaleString('fr-FR')} {currency}
              </span>
            </div>
          </div>

          {/* Action links */}
          <div className="space-y-1 pt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onEditProfile();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left text-[#4A4237] dark:text-[#D5CFC5] hover:bg-[#EFEAE0] dark:hover:bg-[#2C2822] rounded-lg transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-[#8C8275]" />
              <span>Modifier mes revenus & charges</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSignUp();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left text-[#4A4237] dark:text-[#D5CFC5] hover:bg-[#EFEAE0] dark:hover:bg-[#2C2822] rounded-lg transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#3B6B55]" />
              <span>Créer un autre profil</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left text-[#B85338] hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Changer d&apos;utilisateur / Déconnexion</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

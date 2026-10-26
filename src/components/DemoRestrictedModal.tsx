import React from 'react';
import { Language } from '../types';
import { X, Lock, Sparkles, UserPlus, LogIn, ArrowRight, CheckCircle2 } from 'lucide-react';

interface DemoRestrictedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSignUp: () => void;
  onOpenSignIn: () => void;
  actionAttempted?: 'add' | 'edit' | 'delete' | 'category' | 'goal' | 'general';
  language: Language;
}

export const DemoRestrictedModal: React.FC<DemoRestrictedModalProps> = ({
  isOpen,
  onClose,
  onOpenSignUp,
  onOpenSignIn,
  actionAttempted = 'general',
  language,
}) => {
  if (!isOpen) return null;

  const getActionContextMessage = () => {
    switch (actionAttempted) {
      case 'add':
        return language === 'ar_ma'
          ? 'Bach tzid chi opération jdida, khass tkoun msjel f l-application.'
          : 'Pour enregistrer de nouvelles opérations financières, veuillez créer un compte personnel.';
      case 'edit':
        return language === 'ar_ma'
          ? 'La modification des opérations est réservée aux utilisateurs connectés.'
          : 'La modification des transactions est réservée aux utilisateurs ayant un compte actif.';
      case 'delete':
        return language === 'ar_ma'
          ? 'Suppression réservée : La démo ne peut pas être altérée par les visiteurs.'
          : 'La suppression de transactions est désactivée en mode Démo pour préserver les données de test.';
      case 'category':
        return language === 'ar_ma'
          ? 'Personnalisation des postes budgétaires réservée aux utilisateurs inscrits.'
          : 'La gestion des catégories et des plafonds personnalisés nécessite un compte utilisateur.';
      case 'goal':
        return language === 'ar_ma'
          ? 'L-ahdaf d l-ittikhar mta7a ghir l l-mostakhdimin l-mousajjilin.'
          : 'La création et l’allocation de surplus vers vos projets d’épargne nécessitent un compte.';
      default:
        return language === 'ar_ma'
          ? 'Had l-khiyarat mta7a ghir l l-nas li 3ndhom 7ssab.'
          : 'Cette action nécessite un compte utilisateur. Vous êtes actuellement en mode Démo en lecture seule.';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="bg-white dark:bg-[#1E1D19] border border-[#E5DFD3] dark:border-[#38332A] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden transition-all">
        {/* Header Strip with Accent */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#FAF0E6] dark:bg-[#34241D] text-[#A24824] dark:text-[#E8734C] flex items-center justify-center shrink-0 shadow-2xs border border-[#F0D5C7] dark:border-[#4D2D21]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#A24824] dark:text-[#E8734C]">
                {language === 'ar_ma' ? 'Mode Démo · Ghir l-Qiraya' : 'Mode Démo · Lecture Seule'}
              </span>
              <h3 className="font-serif font-bold text-lg text-[#25201B] dark:text-[#F2EFEA] leading-tight">
                {language === 'ar_ma'
                  ? 'Khassk 7ssab bach tbeddel aw tzid'
                  : 'Compte requis pour modifier'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8C8375] hover:text-[#25201B] dark:hover:text-[#F2EFEA] hover:bg-[#EFECE3] dark:hover:bg-[#2D2A24] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="px-6 pb-6 space-y-4 text-xs">
          {/* Action Context Alert */}
          <div className="p-3 bg-[#FAF8F5] dark:bg-[#24221E] border border-[#EBE6DC] dark:border-[#312E28] rounded-xl text-[#5A5144] dark:text-[#DDD6C8] leading-relaxed">
            {getActionContextMessage()}
          </div>

          <p className="text-[#7C7365] dark:text-[#9A9184] leading-relaxed">
            {language === 'ar_ma'
              ? 'Rak f mode consultation bach tstachif l-momayyizat. Sjel 7ssabk f deqiqa bach t-diri l-madkhoul dyalk l-haqiqi w tbda l-7sab 3la l-flous dyalk.'
              : 'En mode Démo, vous explorez une simulation financière. Créez votre compte gratuit en 1 minute pour renseigner vos propres revenus, charges et enregistrer vos transactions.'}
          </p>

          {/* Benefits List */}
          <div className="space-y-2 py-1">
            <div className="flex items-center gap-2 text-[#3D372F] dark:text-[#E5DFD4]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#3B6B55] dark:text-[#52A36F] shrink-0" />
              <span>
                {language === 'ar_ma'
                  ? 'Zid w 7yed les opérations dyalk b kol 7orriya'
                  : 'Ajoutez, modifiez et supprimez vos propres transactions'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#3D372F] dark:text-[#E5DFD4]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#3B6B55] dark:text-[#52A36F] shrink-0" />
              <span>
                {language === 'ar_ma'
                  ? 'Mizaniya w tawaqo3at 3M m7soubin 3la l-ar9am dyalk'
                  : 'Budgets et prévisions sur 3 mois calculés sur vos vrais chiffres'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#3D372F] dark:text-[#E5DFD4]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#3B6B55] dark:text-[#52A36F] shrink-0" />
              <span>
                {language === 'ar_ma'
                  ? 'Tasjil sari3 w majani 100% bla carte bancaire'
                  : 'Inscription instantanée et 100% gratuite, sans carte bancaire'}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-3 space-y-2">
            <button
              onClick={() => {
                onClose();
                onOpenSignUp();
              }}
              className="w-full py-2.5 px-4 bg-[#A24824] hover:bg-[#8F3E1E] text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>{language === 'ar_ma' ? 'Sjel 7ssab jdid (Sign Up)' : "Créer mon compte gratuitement"}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-auto" />
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenSignIn();
              }}
              className="w-full py-2 px-4 bg-white dark:bg-[#26241F] border border-[#D5CDBC] dark:border-[#3D382F] hover:border-[#A24824] text-[#4A4237] dark:text-[#E8E4DC] font-medium rounded-xl transition-colors flex items-center justify-center gap-2 text-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{language === 'ar_ma' ? '3ndi 7ssab (Se connecter)' : "J'ai déjà un compte (Se connecter)"}</span>
            </button>

            <div className="text-center pt-1">
              <button
                onClick={onClose}
                className="text-[11px] text-[#8C8375] dark:text-[#887F72] hover:text-[#25201B] dark:hover:text-[#F2EFEA] hover:underline"
              >
                {language === 'ar_ma' ? 'B9a f l-mode démo' : 'Continuer à explorer la démo'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

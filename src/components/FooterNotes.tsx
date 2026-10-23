import React from 'react';
import { Database, BookOpen, Clock } from 'lucide-react';
import { Language } from '../types';

interface FooterNotesProps {
  language: Language;
}

export const FooterNotes: React.FC<FooterNotesProps> = ({ language }) => {
  return (
    <footer className="mt-12 pt-6 border-t border-[#E5E0D5] dark:border-[#312E28] text-[11px] text-[#7A7163] dark:text-[#9A9184] pb-12 transition-colors">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Source Note */}
        <div className="flex items-start gap-2.5">
          <Database className="w-3.5 h-3.5 text-[#A24824] dark:text-[#E8734C] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#2C2722] dark:text-[#F2EFEA] block mb-0.5">
              {language === 'ar_ma' ? 'Masdar l&apos;ma3loumat (Source)' : 'Source'}
            </span>
            <p className="leading-relaxed text-[#6E6457] dark:text-[#A69E91]">
              {language === 'ar_ma'
                ? 'Données dyalk m7fouda f l-navigateur localement (LocalStorage). Kolchi kaybqa 3ndek f l&apos;appareil.'
                : 'Données de trésorerie sauvegardées localement dans votre navigateur (LocalStorage). Exportable en CSV à tout moment.'}
            </p>
          </div>
        </div>

        {/* Definitions Note */}
        <div className="flex items-start gap-2.5">
          <BookOpen className="w-3.5 h-3.5 text-[#A24824] dark:text-[#E8734C] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#2C2722] dark:text-[#F2EFEA] block mb-0.5">
              {language === 'ar_ma' ? 'Ta3rifat (Définitions)' : 'Définitions'}
            </span>
            <p className="leading-relaxed text-[#6E6457] dark:text-[#A69E91]">
              {language === 'ar_ma'
                ? 'Solde Net = Lmadkhoul lkamel - Lmasarif. Nisbat l&apos;épargne = Flous li bqaw m9ssomin 3la lmadkhoul.'
                : 'Solde Net = Revenus réels encaissés déduits des charges décaissées. Taux d’épargne = (Entrées - Dépenses) / Entrées.'}
            </p>
          </div>
        </div>

        {/* Freshness Note */}
        <div className="flex items-start gap-2.5">
          <Clock className="w-3.5 h-3.5 text-[#A24824] dark:text-[#E8734C] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#2C2722] dark:text-[#F2EFEA] block mb-0.5">
              {language === 'ar_ma' ? 'Tawqit (Freshness)' : 'Fraîcheur'}
            </span>
            <p className="leading-relaxed text-[#6E6457] dark:text-[#A69E91]">
              {language === 'ar_ma'
                ? 'Mise à jour directe f l-waqt li katzid fih ay transaction jdida.'
                : 'Calculs recalculés instantanément en temps réel lors de l&apos;ajout ou la modification d&apos;opérations.'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

import { CategoryBudget, MonthlyDataPoint, SubCategory, Transaction } from '../types';

export const INITIAL_CATEGORIES: CategoryBudget[] = [
  // Revenus (Kandkhel)
  {
    id: 'salaire',
    label: 'Salaire Principal',
    labelDarija: 'Salair / Ch-har',
    labelEn: 'Main Salary',
    type: 'income',
    allocatedBudget: 18000,
    color: '#3B6B55', // Sage forest green
    icon: 'Briefcase',
  },
  {
    id: 'freelance',
    label: 'Freelance & Prestations',
    labelDarija: 'Khidma Freelance',
    labelEn: 'Freelance & Consulting',
    type: 'income',
    allocatedBudget: 6500,
    color: '#557C67',
    icon: 'Laptop',
  },
  {
    id: 'investissements_in',
    label: 'Rendements & Dividendes',
    labelDarija: 'Arbah w Invest',
    labelEn: 'Investments & Returns',
    type: 'income',
    allocatedBudget: 2500,
    color: '#7D9D8B',
    icon: 'TrendingUp',
  },
  {
    id: 'bonus_ventes',
    label: 'Primes & Ventes',
    labelDarija: 'Primat w Bi3at',
    labelEn: 'Bonuses & Sales',
    type: 'income',
    allocatedBudget: 1500,
    color: '#A1B7AA',
    icon: 'Gift',
  },

  // Dépenses (Kankhser)
  {
    id: 'logement',
    label: 'Logement & Syndic',
    labelDarija: 'Kra w Dar w Syndic',
    labelEn: 'Rent & Housing',
    type: 'expense',
    allocatedBudget: 4500,
    color: '#A24824', // Terracotta
    icon: 'Home',
  },
  {
    id: 'alimentation',
    label: 'Alimentation & Courses',
    labelDarija: 'Teqdia w Marjane w Makla',
    labelEn: 'Groceries & Food',
    type: 'expense',
    allocatedBudget: 3200,
    color: '#B85D36',
    icon: 'ShoppingBag',
  },
  {
    id: 'transport',
    label: 'Transport & Carburant',
    labelDarija: 'Afriquia w Tomobil w Transport',
    labelEn: 'Transport & Fuel',
    type: 'expense',
    allocatedBudget: 1800,
    color: '#C67551',
    icon: 'Car',
  },
  {
    id: 'factures',
    label: 'Factures (Eau, Élec, Fibre)',
    labelDarija: 'Lma, Dow w Wifi (Inwi/IAM)',
    labelEn: 'Utilities & Internet',
    type: 'expense',
    allocatedBudget: 950,
    color: '#D18D6E',
    icon: 'Zap',
  },
  {
    id: 'loisirs',
    label: 'Loisirs, Cafés & Restos',
    labelDarija: 'Qhawi, Khroyat w Resto',
    labelEn: 'Leisure & Dining Out',
    type: 'expense',
    allocatedBudget: 1400,
    color: '#847363',
    icon: 'Coffee',
  },
  {
    id: 'sante',
    label: 'Santé & Salle de Sport',
    labelDarija: 'Saha, Dwa w Salle',
    labelEn: 'Health & Fitness',
    type: 'expense',
    allocatedBudget: 800,
    color: '#65574B',
    icon: 'Heart',
  },
  {
    id: 'epargne_invest',
    label: 'Épargne & Achat d\'actifs',
    labelDarija: 'Tkhba3 d Flous w Dhab/Bourse',
    labelEn: 'Savings & Assets',
    type: 'expense',
    allocatedBudget: 7500,
    color: '#3B6B55',
    icon: 'ShieldCheck',
  },
];

export const INITIAL_SUB_CATEGORIES: SubCategory[] = [
  // Alimentation & Courses
  { id: 'sub-alim-epicerie', categoryId: 'alimentation', name: 'Épicerie (Atay, Sucre, Huile)', nameDarija: 'Teqdia d Hanout & Atay/Sokar' },
  { id: 'sub-alim-laiterie', categoryId: 'alimentation', name: 'Produits Laitiers (Hlib, Fromage)', nameDarija: 'Hlib & Fromage' },
  { id: 'sub-alim-marche', categoryId: 'alimentation', name: 'Marché Frais (Légumes & Fruits)', nameDarija: 'Souq & Khodra/Desser' },
  { id: 'sub-alim-boucherie', categoryId: 'alimentation', name: 'Boucherie, Volailles & Poissons', nameDarija: 'Gzzar, Djaj & Hout' },
  { id: 'sub-alim-supermarche', categoryId: 'alimentation', name: 'Supermarché & Hygiène (Marjane/BIM)', nameDarija: 'Grandes Surfaces & Marjane' },
  { id: 'sub-alim-boulangerie', categoryId: 'alimentation', name: 'Boulangerie & Pâtisserie (Khobz)', nameDarija: 'Mkhbaza & Khobz' },

  // Logement & Syndic
  { id: 'sub-log-loyer', categoryId: 'logement', name: 'Loyer mensuel', nameDarija: 'Kraya d Dar' },
  { id: 'sub-log-syndic', categoryId: 'logement', name: 'Charges Syndic & Immeuble', nameDarija: 'Syndic d L&apos;immeuble' },
  { id: 'sub-log-travaux', categoryId: 'logement', name: 'Entretien, Meubles & Bricolage', nameDarija: 'Islahat & Dwezan' },

  // Transport & Carburant
  { id: 'sub-trans-carburant', categoryId: 'transport', name: 'Carburant (Essence / Diesel)', nameDarija: 'Essence & Mazout (Afriquia)' },
  { id: 'sub-trans-peage', categoryId: 'transport', name: 'Péage Jawaz & Parking', nameDarija: 'Jawaz Autoroute & Parking' },
  { id: 'sub-trans-lavage', categoryId: 'transport', name: 'Entretien, Vidange & Lavage', nameDarija: 'Lavage & Vidange' },
  { id: 'sub-trans-taxi', categoryId: 'transport', name: 'Taxi, Tramway & VTC', nameDarija: 'Taxi & Tramway' },

  // Factures
  { id: 'sub-fact-internet', categoryId: 'factures', name: 'Fibre Optique & Télécom (IAM/Inwi)', nameDarija: 'Wifi & Forfait Mobile' },
  { id: 'sub-fact-elec', categoryId: 'factures', name: 'Électricité & Eau (Redal/Lydec/ONEE)', nameDarija: 'Dow & Lma' },
  { id: 'sub-fact-abonnements', categoryId: 'factures', name: 'Abonnements & Services en ligne', nameDarija: 'Abonnements en ligne' },

  // Loisirs, Cafés & Restos
  { id: 'sub-lois-restos', categoryId: 'loisirs', name: 'Restaurants & Sorties', nameDarija: 'Resto & Makla bra' },
  { id: 'sub-lois-cafes', categoryId: 'loisirs', name: 'Cafés & Salons de thé', nameDarija: 'Qhawi & Thé' },
  { id: 'sub-lois-vacances', categoryId: 'loisirs', name: 'Voyages & Weekends', nameDarija: 'Safar & Weekend' },

  // Santé & Sport
  { id: 'sub-sant-sport', categoryId: 'sante', name: 'Salle de sport & Fitness', nameDarija: 'Salle d Gym' },
  { id: 'sub-sant-pharmacie', categoryId: 'sante', name: 'Pharmacie & Médicaments', nameDarija: 'Pharmacie & Dwa' },
  { id: 'sub-sant-medecin', categoryId: 'sante', name: 'Consultations & Dentiste', nameDarija: 'Tbib & Dentiste' },

  // Épargne & Actifs
  { id: 'sub-ep-urgence', categoryId: 'epargne_invest', name: 'Épargne d\'urgence (Livret)', nameDarija: 'Tkhba3 d flous' },
  { id: 'sub-ep-bourse', categoryId: 'epargne_invest', name: 'Bourse, OPCVM & Actions', nameDarija: 'Bourse & Invest' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const MONTHLY_TREND_SERIES: MonthlyDataPoint[] = [
  {
    month: 'Mai 2026',
    monthShort: 'Mai',
    actualIncome: 25400,
    planIncome: 24000,
    actualExpense: 15200,
    planExpense: 16000,
    netSavings: 10200,
  },
  {
    month: 'Juin 2026',
    monthShort: 'Juin',
    actualIncome: 27100,
    planIncome: 24500,
    actualExpense: 16100,
    planExpense: 16000,
    netSavings: 11000,
  },
  {
    month: 'Juillet 2026',
    monthShort: 'Juil',
    actualIncome: 28900,
    planIncome: 25000,
    actualExpense: 17400,
    planExpense: 17000,
    netSavings: 11500,
  },
  {
    month: 'Août 2026',
    monthShort: 'Août',
    actualIncome: 29800,
    planIncome: 25500,
    actualExpense: 18200,
    planExpense: 18000,
    netSavings: 11600,
  },
  {
    month: 'Septembre 2026',
    monthShort: 'Sept',
    actualIncome: 30500,
    planIncome: 26000,
    actualExpense: 17200,
    planExpense: 17500,
    netSavings: 13300,
  },
  {
    month: 'Octobre 2026',
    monthShort: 'Oct',
    actualIncome: 31000,
    planIncome: 26500,
    actualExpense: 16800,
    planExpense: 17500,
    netSavings: 14200,
  },
];

export function formatCurrency(amount: number, currency: string = 'MAD'): string {
  const rounded = Math.round(amount);
  const formatted = rounded.toLocaleString('fr-FR');
  
  if (currency === 'MAD') {
    return `${formatted} DH`;
  }
  if (currency === 'EUR') {
    return `${formatted} €`;
  }
  if (currency === 'USD') {
    return `$${formatted}`;
  }
  return `${formatted} ${currency}`;
}

export function formatCompactCurrency(amount: number, currency: string = 'MAD'): string {
  if (amount >= 1_000_000) {
    const val = (amount / 1_000_000).toFixed(1);
    if (currency === 'USD') return `$${val}M`;
    if (currency === 'EUR') return `${val}M €`;
    return `${val}M DH`;
  }
  if (amount >= 1_000) {
    const val = (amount / 1_000).toFixed(1);
    if (currency === 'USD') return `$${val}k`;
    if (currency === 'EUR') return `${val}k €`;
    return `${val}k DH`;
  }
  return formatCurrency(amount, currency);
}

export const INITIAL_SAVINGS_GOALS: import('../types').SavingsGoal[] = [];

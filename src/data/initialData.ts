import { CategoryBudget, MonthlyDataPoint, Transaction } from '../types';

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

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Rentrées récentes (Octobre 2026)
  {
    id: 'tx-101',
    type: 'income',
    category: 'salaire',
    amount: 19500,
    date: '2026-10-01',
    note: 'Virement Salaire Entreprise (Majoration performance)',
    paymentMethod: 'virement',
    recipientOrSource: 'Employeur / Société',
  },
  {
    id: 'tx-102',
    type: 'income',
    category: 'freelance',
    amount: 7200,
    date: '2026-10-08',
    note: 'Projet Dashboard & API client Casablanca',
    paymentMethod: 'virement',
    recipientOrSource: 'Client Tech S.A.R.L',
  },
  {
    id: 'tx-103',
    type: 'income',
    category: 'investissements_in',
    amount: 2800,
    date: '2026-10-15',
    note: 'Dividendes trimestriels portefeuille OPCVM / BVC',
    paymentMethod: 'virement',
    recipientOrSource: 'Compte Titres',
  },
  {
    id: 'tx-104',
    type: 'income',
    category: 'bonus_ventes',
    amount: 1500,
    date: '2026-10-20',
    note: 'Vente ancien matériel informatique',
    paymentMethod: 'especes',
    recipientOrSource: 'Acheteur Particulier',
  },

  // Dépenses récentes (Octobre 2026)
  {
    id: 'tx-201',
    type: 'expense',
    category: 'logement',
    amount: 4500,
    date: '2026-10-02',
    note: 'Loyer appartement mensualité Octobre',
    paymentMethod: 'virement',
    recipientOrSource: 'Propriétaire',
  },
  {
    id: 'tx-202',
    type: 'expense',
    category: 'factures',
    amount: 420,
    date: '2026-10-03',
    note: 'Abonnement Fibre Optique 100M + Forfait Mobile',
    paymentMethod: 'carte',
    recipientOrSource: 'Opérateur Télécom',
    items: [
      { id: 'it-202-1', name: 'Fibre Optique 100 Mbps', quantity: 1, unitPrice: 349, totalPrice: 349 },
      { id: 'it-202-2', name: 'Forfait Mobile 4G & Appels', quantity: 1, unitPrice: 71, totalPrice: 71 },
    ],
  },
  {
    id: 'tx-203',
    type: 'expense',
    category: 'factures',
    amount: 510,
    date: '2026-10-04',
    note: 'Facture Électricité & Eau Redal/Lydec',
    paymentMethod: 'carte',
    recipientOrSource: 'Régie Distribution',
  },
  {
    id: 'tx-204',
    type: 'expense',
    category: 'alimentation',
    amount: 1450,
    date: '2026-10-05',
    note: 'Grandes courses du mois (Supermarché Marjane)',
    paymentMethod: 'carte',
    recipientOrSource: 'Marjane Hyper',
    items: [
      { id: 'it-204-1', name: 'Atay (Thé vert Sultan x 4)', quantity: 4, unitPrice: 28, totalPrice: 112 },
      { id: 'it-204-2', name: 'Sokar (Sucre en morceaux 1kg x 5)', quantity: 5, unitPrice: 16, totalPrice: 80 },
      { id: 'it-204-3', name: 'Hlib (Lait UHT Centrale 1L x 12)', quantity: 12, unitPrice: 9, totalPrice: 108 },
      { id: 'it-204-4', name: 'Zayt zitoun (Huile d\'olive 2L)', quantity: 2, unitPrice: 90, totalPrice: 180 },
      { id: 'it-204-5', name: 'Fromage rouge & Yaourts', quantity: 1, unitPrice: 125, totalPrice: 125 },
      { id: 'it-204-6', name: 'Viande hachée & Poulet fermier', quantity: 1, unitPrice: 380, totalPrice: 380 },
      { id: 'it-204-7', name: 'Farine 10kg, Pâtes & Riz', quantity: 1, unitPrice: 165, totalPrice: 165 },
      { id: 'it-204-8', name: 'Détergent & Nettoyants maison', quantity: 1, unitPrice: 180, totalPrice: 180 },
      { id: 'it-204-9', name: 'Légumes & Fruits Marjane', quantity: 1, unitPrice: 120, totalPrice: 120 },
    ],
  },
  {
    id: 'tx-205',
    type: 'expense',
    category: 'transport',
    amount: 650,
    date: '2026-10-06',
    note: 'Plein d\'essence sans plomb + lavage',
    paymentMethod: 'carte',
    recipientOrSource: 'Station Afriquia',
    items: [
      { id: 'it-205-1', name: 'Essence Sans Plomb (45 Litres)', quantity: 45, unitPrice: 13, totalPrice: 585 },
      { id: 'it-205-2', name: 'Lavage Haute Pression & Aspirateur', quantity: 1, unitPrice: 65, totalPrice: 65 },
    ],
  },
  {
    id: 'tx-206',
    type: 'expense',
    category: 'sante',
    amount: 450,
    date: '2026-10-10',
    note: 'Abonnement salle de fitness + compléments',
    paymentMethod: 'carte',
    recipientOrSource: 'Gym Club',
  },
  {
    id: 'tx-207',
    type: 'expense',
    category: 'alimentation',
    amount: 880,
    date: '2026-10-12',
    note: 'Marché frais légumes, fruits & boucherie',
    paymentMethod: 'especes',
    recipientOrSource: 'Marché Central',
    items: [
      { id: 'it-207-1', name: 'Atay beldi & Na3na3 (Menthe fraîche)', quantity: 2, unitPrice: 25, totalPrice: 50 },
      { id: 'it-207-2', name: 'Sokar en pain (Qaleb d\'sokar x 2)', quantity: 2, unitPrice: 15, totalPrice: 30 },
      { id: 'it-207-3', name: 'Hlib beldi (Lait de ferme 3L)', quantity: 3, unitPrice: 8, totalPrice: 24 },
      { id: 'it-207-4', name: 'Viande d\'agneau (Boucherie 2.5 kg)', quantity: 1, unitPrice: 320, totalPrice: 320 },
      { id: 'it-207-5', name: 'Poisson frais (Dorade & Merlan)', quantity: 1, unitPrice: 176, totalPrice: 176 },
      { id: 'it-207-6', name: 'Légumes frais (Maticha, Bsal, Batata)', quantity: 1, unitPrice: 160, totalPrice: 160 },
      { id: 'it-207-7', name: 'Fruits de saison (Pommes & Bananes)', quantity: 1, unitPrice: 120, totalPrice: 120 },
    ],
  },
  {
    id: 'tx-208',
    type: 'expense',
    category: 'loisirs',
    amount: 720,
    date: '2026-10-16',
    note: 'Dîner entre amis restaurant bord de mer',
    paymentMethod: 'carte',
    recipientOrSource: 'Restaurant La Scala',
  },
  {
    id: 'tx-209',
    type: 'expense',
    category: 'transport',
    amount: 450,
    date: '2026-10-19',
    note: 'Recharge carte autoroute péage + parking',
    paymentMethod: 'carte',
    recipientOrSource: 'Jawaz Autoroutes',
  },
  {
    id: 'tx-210',
    type: 'expense',
    category: 'epargne_invest',
    amount: 8000,
    date: '2026-10-21',
    note: 'Virement automatique vers Livret / Épargne d\'urgence',
    paymentMethod: 'virement',
    recipientOrSource: 'Compte Épargne Sécurisé',
  },

  // Septembre 2026 (pour historique Q3)
  {
    id: 'tx-301',
    type: 'income',
    category: 'salaire',
    amount: 19000,
    date: '2026-09-01',
    note: 'Salaire Septembre',
    paymentMethod: 'virement',
  },
  {
    id: 'tx-302',
    type: 'income',
    category: 'freelance',
    amount: 6800,
    date: '2026-09-12',
    note: 'Mission audit UI/UX application web',
    paymentMethod: 'virement',
  },
  {
    id: 'tx-303',
    type: 'expense',
    category: 'logement',
    amount: 4500,
    date: '2026-09-02',
    note: 'Loyer Septembre',
    paymentMethod: 'virement',
  },
  {
    id: 'tx-304',
    type: 'expense',
    category: 'alimentation',
    amount: 2950,
    date: '2026-09-18',
    note: 'Courses mensuelles et repas',
    paymentMethod: 'carte',
  },
  {
    id: 'tx-305',
    type: 'expense',
    category: 'transport',
    amount: 1600,
    date: '2026-09-22',
    note: 'Carburant et entretien vidange',
    paymentMethod: 'carte',
  },
  {
    id: 'tx-306',
    type: 'expense',
    category: 'loisirs',
    amount: 1100,
    date: '2026-09-25',
    note: 'Weekend détente et sorties',
    paymentMethod: 'carte',
  },
  {
    id: 'tx-307',
    type: 'expense',
    category: 'epargne_invest',
    amount: 7500,
    date: '2026-09-28',
    note: 'Investissement mensuel programmé',
    paymentMethod: 'virement',
  },
];

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

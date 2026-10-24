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
    subCategory: 'sub-log-loyer',
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
    subCategory: 'sub-fact-internet',
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
    subCategory: 'sub-fact-elec',
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
    subCategory: 'sub-alim-supermarche',
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
    subCategory: 'sub-trans-carburant',
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
    subCategory: 'sub-sant-sport',
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
    subCategory: 'sub-alim-marche',
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
    subCategory: 'sub-lois-restos',
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
    subCategory: 'sub-trans-peage',
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
    subCategory: 'sub-ep-urgence',
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
    subCategory: 'sub-log-loyer',
    amount: 4500,
    date: '2026-09-02',
    note: 'Loyer Septembre',
    paymentMethod: 'virement',
  },
  {
    id: 'tx-304',
    type: 'expense',
    category: 'alimentation',
    subCategory: 'sub-alim-supermarche',
    amount: 2950,
    date: '2026-09-18',
    note: 'Courses mensuelles et repas',
    paymentMethod: 'carte',
  },
  {
    id: 'tx-305',
    type: 'expense',
    category: 'transport',
    subCategory: 'sub-trans-carburant',
    amount: 1600,
    date: '2026-09-22',
    note: 'Carburant et entretien vidange',
    paymentMethod: 'carte',
  },
  {
    id: 'tx-306',
    type: 'expense',
    category: 'loisirs',
    subCategory: 'sub-lois-restos',
    amount: 1100,
    date: '2026-09-25',
    note: 'Weekend détente et sorties',
    paymentMethod: 'carte',
  },
  {
    id: 'tx-307',
    type: 'expense',
    category: 'epargne_invest',
    subCategory: 'sub-ep-bourse',
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

export const INITIAL_SAVINGS_GOALS: import('../types').SavingsGoal[] = [
  {
    id: 'goal-emergency',
    name: "Fonds d'Urgence (6 mois)",
    nameDarija: 'Sandouq d Tawari2 (6 Chhor)',
    targetAmount: 60000,
    currentAmount: 38000,
    monthlyAllocation: 1500,
    targetDate: '2027-03-31',
    category: 'emergency',
    priority: 'high',
    color: '#3B6B55',
    icon: 'ShieldCheck',
    notes: 'Couverture de 6 mois de dépenses incompressibles en cas d imprévu ou de transition.',
    createdAt: '2026-01-10',
  },
  {
    id: 'goal-realestate',
    name: 'Apport Immobilier (Sakan)',
    nameDarija: 'Avance d l-Barssila / Sakan',
    targetAmount: 160000,
    currentAmount: 52000,
    monthlyAllocation: 2500,
    targetDate: '2028-06-30',
    category: 'real_estate',
    priority: 'high',
    color: '#A24824',
    icon: 'Home',
    notes: 'Apport initial de 20% pour l acquisition d un appartement à Casablanca / Rabat.',
    createdAt: '2026-02-15',
  },
  {
    id: 'goal-travel',
    name: 'Voyage Oumra & Vacances Familiales',
    nameDarija: '3omra w Safar d l-3a2ila',
    targetAmount: 30000,
    currentAmount: 21500,
    monthlyAllocation: 1200,
    targetDate: '2027-05-15',
    category: 'travel',
    priority: 'medium',
    color: '#5B7B94',
    icon: 'Plane',
    notes: 'Billets d avion, séjour et enveloppe détente pour le prochain voyage familial.',
    createdAt: '2026-03-01',
  },
  {
    id: 'goal-investment',
    name: 'Portefeuille Bourse & Métaux',
    nameDarija: 'Istithmar f l-Boursa w D-hab',
    targetAmount: 50000,
    currentAmount: 18000,
    monthlyAllocation: 1000,
    targetDate: '2027-12-31',
    category: 'investment',
    priority: 'medium',
    color: '#8A5D3B',
    icon: 'TrendingUp',
    notes: 'Investissement périodique en OPCVM actions marocaines, dividendes et or physique.',
    createdAt: '2026-04-20',
  },
];

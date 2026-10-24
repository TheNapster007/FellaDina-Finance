import { CategoryBudget, Transaction, UserProfile, Currency } from '../types';
import { INITIAL_CATEGORIES } from '../data/initialData';

/**
 * Creates custom CategoryBudget objects updated with the user's specified budget limits
 */
export function buildUserCategories(
  userExpenses: UserProfile['expenses'],
  baseCategories: CategoryBudget[] = INITIAL_CATEGORIES
): CategoryBudget[] {
  const result: CategoryBudget[] = [];

  // Update existing categories with user's allocated budget
  for (const cat of baseCategories) {
    const userAllocation = userExpenses.find((e) => e.categoryId === cat.id);
    if (userAllocation && userAllocation.amount > 0) {
      result.push({
        ...cat,
        allocatedBudget: userAllocation.amount,
      });
    } else {
      result.push(cat);
    }
  }

  // Add any custom expense categories entered by user
  for (const exp of userExpenses) {
    const exists = result.some((c) => c.id === exp.categoryId);
    if (!exists && exp.amount > 0) {
      result.push({
        id: exp.categoryId,
        label: exp.name,
        labelDarija: exp.nameDarija || exp.name,
        labelEn: exp.name,
        type: 'expense',
        allocatedBudget: exp.amount,
        color: '#8A5A44',
        icon: 'Tag',
        isCustom: true,
      });
    }
  }

  return result;
}

/**
 * Generates transactions based on user's real onboarding data:
 * - Creates transactions for the past 2 months (August, September) and current month (October 2026)
 * - Uses user's real income sources and expense budget amounts
 * - Ensures cashflow, KPIs, and predictive 3-month forecast reflect user's real numbers directly
 */
export function generateUserTransactions(profile: UserProfile): Transaction[] {
  const transactions: Transaction[] = [];
  const now = new Date(2026, 9, 24); // Reference October 24, 2026 matching app baseline
  const currentYear = now.getFullYear();

  const totalMonthlyIncome = profile.incomes.reduce((sum, inc) => sum + inc.amount, 0);

  // Month offsets: -2 (August), -1 (September), 0 (October current)
  const monthOffsets = [-2, -1, 0];

  monthOffsets.forEach((offset, idx) => {
    const monthNum = 10 + offset; // 8 = Aug, 9 = Sep, 10 = Oct
    const monthStr = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;
    const yearMonth = `${currentYear}-${monthStr}`;

    // 1. Incomes for this month
    profile.incomes.forEach((inc, incIdx) => {
      if (inc.amount <= 0) return;
      const day = inc.dayOfMonth ? String(inc.dayOfMonth).padStart(2, '0') : '28';
      // In current month (Oct 24), if day > 24, make it Oct 24 or scheduled
      let actualDay = day;
      if (offset === 0 && parseInt(day, 10) > 24) {
        actualDay = '15'; // Received mid-month or early
      }

      transactions.push({
        id: `tx-u-${profile.id}-inc-${monthStr}-${incIdx}`,
        type: 'income',
        category: 'salaire',
        amount: Math.round(inc.amount * (1 + (idx === 0 ? -0.02 : idx === 1 ? 0 : 0.01))),
        date: `${yearMonth}-${actualDay}`,
        note: `${inc.name} · Virement reçu`,
        paymentMethod: 'virement',
        recipientOrSource: inc.name,
      });
    });

    // 2. Expenses for this month based on user's entered budget items
    profile.expenses.forEach((exp, expIdx) => {
      if (exp.amount <= 0) return;

      // In current month, only generate transactions up to today (October 24)
      const executionRatio = offset === 0 ? 0.78 : (0.92 + (idx * 0.03));
      const spentAmount = Math.round(exp.amount * executionRatio);

      // Distribute into 1 to 3 realistic payments during the month
      if (exp.categoryId === 'logement') {
        transactions.push({
          id: `tx-u-${profile.id}-exp-${monthStr}-${expIdx}-1`,
          type: 'expense',
          category: 'logement',
          amount: Math.round(exp.amount),
          date: `${yearMonth}-03`,
          note: `${exp.name} · Paiement loyer mensuel`,
          paymentMethod: 'virement',
          recipientOrSource: 'Bailleur / Agence',
        });
      } else if (exp.categoryId === 'factures') {
        transactions.push({
          id: `tx-u-${profile.id}-exp-${monthStr}-${expIdx}-1`,
          type: 'expense',
          category: 'factures',
          amount: Math.round(spentAmount * 0.6),
          date: `${yearMonth}-08`,
          note: 'Facture Électricité & Eau',
          paymentMethod: 'carte',
          recipientOrSource: 'Régie de distribution',
        });
        transactions.push({
          id: `tx-u-${profile.id}-exp-${monthStr}-${expIdx}-2`,
          type: 'expense',
          category: 'factures',
          amount: Math.round(spentAmount * 0.4),
          date: `${yearMonth}-12`,
          note: 'Abonnement Fibre Internet & Mobile',
          paymentMethod: 'carte',
          recipientOrSource: 'Opérateur Télécom',
        });
      } else if (exp.categoryId === 'alimentation') {
        const split1 = Math.round(spentAmount * 0.35);
        const split2 = Math.round(spentAmount * 0.35);
        const split3 = spentAmount - split1 - split2;

        transactions.push({
          id: `tx-u-${profile.id}-exp-${monthStr}-${expIdx}-1`,
          type: 'expense',
          category: 'alimentation',
          amount: split1,
          date: `${yearMonth}-05`,
          note: 'Grandes courses hebdomadaires',
          paymentMethod: 'carte',
          recipientOrSource: 'Supermarché',
        });
        transactions.push({
          id: `tx-u-${profile.id}-exp-${monthStr}-${expIdx}-2`,
          type: 'expense',
          category: 'alimentation',
          amount: split2,
          date: `${yearMonth}-14`,
          note: 'Marché central légumes & fruits',
          paymentMethod: 'especes',
          recipientOrSource: 'Marché',
        });
        if (split3 > 0 && offset !== 0) {
          transactions.push({
            id: `tx-u-${profile.id}-exp-${monthStr}-${expIdx}-3`,
            type: 'expense',
            category: 'alimentation',
            amount: split3,
            date: `${yearMonth}-22`,
            note: 'Boucherie et épicerie fine',
            paymentMethod: 'carte',
            recipientOrSource: 'Épicerie',
          });
        }
      } else if (exp.categoryId === 'epargne') {
        transactions.push({
          id: `tx-u-${profile.id}-exp-${monthStr}-${expIdx}-1`,
          type: 'expense',
          category: 'epargne',
          amount: Math.round(exp.amount),
          date: `${yearMonth}-02`,
          note: 'Virement automatique Livret / Compte Épargne',
          paymentMethod: 'virement',
          recipientOrSource: 'Compte Épargne Sécurisé',
        });
      } else {
        // Generic expense item
        const day = (5 + (expIdx * 4)) % 22 + 1;
        const dayStr = String(day).padStart(2, '0');
        transactions.push({
          id: `tx-u-${profile.id}-exp-${monthStr}-${expIdx}-1`,
          type: 'expense',
          category: exp.categoryId,
          amount: spentAmount,
          date: `${yearMonth}-${dayStr}`,
          note: `${exp.name} · Règlement dépenses`,
          paymentMethod: exp.categoryId === 'transport' ? 'carte' : 'virement',
          recipientOrSource: exp.name,
        });
      }
    });
  });

  // Sort by date descending
  return transactions.sort((a, b) => b.date.localeCompare(a.date));
}

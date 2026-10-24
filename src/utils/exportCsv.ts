import { Transaction, CategoryBudget, SubCategory, Currency, Language } from '../types';

export interface ExportOptions {
  includeBudgets?: boolean;
  includeTransactions?: boolean;
  includeMonthlySummary?: boolean;
  delimiter?: ';' | ',';
  subCategories?: SubCategory[];
}

function escapeCsvCell(val: string | number | undefined | null, delimiter: string): string {
  if (val === undefined || val === null) return '';
  const str = String(val);
  // If the cell contains quotes, delimiter, or newlines, escape quotes by doubling them and wrap in quotes
  if (str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportFinancialDataToCsv(
  transactions: Transaction[],
  categories: CategoryBudget[],
  currency: Currency,
  language: Language,
  options: ExportOptions = {}
): { filename: string; rowCount: number } {
  const {
    includeBudgets = true,
    includeTransactions = true,
    includeMonthlySummary = true,
    delimiter = ';', // Excel in French/Europe defaults to semicolon delimiter
  } = options;

  const lines: string[] = [];

  const esc = (cell: string | number | undefined | null) => escapeCsvCell(cell, delimiter);

  // 1. Header Information Block
  const dateStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toLocaleTimeString('fr-FR');

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  lines.push(esc('RAPPORT FINANCIER & SAUVEGARDE FELLADINA FINANCE'));
  lines.push([esc('Date d\'exportation'), esc(`${dateStr} à ${timeStr}`)].join(delimiter));
  lines.push([esc('Devise'), esc(currency === 'MAD' ? 'MAD (Dirhams marocains)' : currency)].join(delimiter));
  lines.push([esc('Total Revenus (Entrées)'), esc(totalIncome.toFixed(2))].join(delimiter));
  lines.push([esc('Total Dépenses (Sorties)'), esc(totalExpense.toFixed(2))].join(delimiter));
  lines.push([esc('Solde Net (Épargne)'), esc(netSavings.toFixed(2))].join(delimiter));
  lines.push([esc('Taux d\'Épargne'), esc(`${savingsRate.toFixed(1)}%`)].join(delimiter));
  lines.push(''); // Empty line separator

  // 2. Budget Settings Section
  if (includeBudgets) {
    lines.push(esc('--- PARAMÈTRES ET OBJECTIFS BUDGÉTAIRES (BUDGET SETTINGS) ---'));
    const budgetHeaders = [
      'ID Catégorie',
      'Nom du Poste (FR)',
      'Nom du Poste (Darija)',
      'Type',
      `Budget Alloué (${currency})`,
      `Total Réel Engagé (${currency})`,
      `Écart Restant (${currency})`,
      'Taux d\'Atteinte (%)',
      'Statut Budgétaire',
    ];
    lines.push(budgetHeaders.map(esc).join(delimiter));

    categories.forEach((cat) => {
      const txs = transactions.filter((t) => t.category === cat.id);
      const spent = txs.reduce((s, t) => s + t.amount, 0);
      const diff = cat.type === 'expense' ? cat.allocatedBudget - spent : spent - cat.allocatedBudget;
      const attainment = cat.allocatedBudget > 0 ? (spent / cat.allocatedBudget) * 100 : 100;

      let status = 'Dans les clous (On track)';
      if (cat.type === 'expense') {
        if (attainment > 105) status = 'Critique (At risk)';
        else if (attainment > 90) status = 'À surveiller (Watch)';
      } else {
        if (attainment >= 100) status = 'Objectif atteint (On track)';
        else if (attainment >= 85) status = 'Moyen (Watch)';
        else status = 'Sous l\'objectif (At risk)';
      }

      const row = [
        cat.id,
        cat.label,
        cat.labelDarija,
        cat.type === 'income' ? 'Revenu (Entrée)' : 'Dépense (Sortie)',
        cat.allocatedBudget.toFixed(2),
        spent.toFixed(2),
        diff.toFixed(2),
        `${Math.round(attainment)}%`,
        status,
      ];
      lines.push(row.map(esc).join(delimiter));
    });

    lines.push(''); // Empty line separator
  }

  // 3. Transactions Ledger Section
  if (includeTransactions) {
    lines.push(esc('--- JOURNAL DÉTAILLÉ DES TRANSACTIONS (TRANSACTIONS LEDGER) ---'));
    const txHeaders = [
      'ID Transaction',
      'Date',
      'Type Opération',
      'Catégorie ID',
      'Catégorie Nom',
      'Sous-Catégorie',
      `Montant (${currency})`,
      'Mode de Règlement',
      'Tiers / Bénéficiaire / Source',
      'Description / Remarques',
      'Articles Détaillés (Reçu)',
    ];
    lines.push(txHeaders.map(esc).join(delimiter));

    // Sort transactions by date descending
    const sortedTxs = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

    sortedTxs.forEach((tx) => {
      const cat = categories.find((c) => c.id === tx.category);
      const catName = cat ? cat.label : tx.category;
      const sub = (options.subCategories || []).find((s) => s.id === tx.subCategory);
      const subName = sub ? sub.name : tx.subCategory || '';
      const itemsList = tx.items?.map((it) => `${it.name} (x${it.quantity || 1}: ${it.totalPrice}DH)`).join(' | ') || '';

      const row = [
        tx.id,
        tx.date,
        tx.type === 'income' ? 'Revenu (+)' : 'Dépense (-)',
        tx.category,
        catName,
        subName,
        (tx.type === 'income' ? tx.amount : -tx.amount).toFixed(2),
        tx.paymentMethod,
        tx.recipientOrSource || '',
        tx.note,
        itemsList,
      ];
      lines.push(row.map(esc).join(delimiter));
    });

    lines.push(''); // Empty line separator
  }

  // 4. Monthly Aggregation Summary for Excel charts
  if (includeMonthlySummary) {
    lines.push(esc('--- SYNTHÈSE MENSUELLE DE TRÉSORERIE (MONTHLY SUMMARY) ---'));
    lines.push([
      'Mois (AAAA-MM)',
      `Revenus (${currency})`,
      `Dépenses (${currency})`,
      `Solde Net (${currency})`,
      'Taux d\'Épargne (%)',
    ].map(esc).join(delimiter));

    const monthMap = new Map<string, { income: number; expense: number }>();
    transactions.forEach((tx) => {
      const key = tx.date ? tx.date.substring(0, 7) : 'Autre';
      const curr = monthMap.get(key) || { income: 0, expense: 0 };
      if (tx.type === 'income') curr.income += tx.amount;
      else curr.expense += tx.amount;
      monthMap.set(key, curr);
    });

    Array.from(monthMap.keys())
      .sort()
      .forEach((mKey) => {
        const val = monthMap.get(mKey)!;
        const net = val.income - val.expense;
        const rate = val.income > 0 ? (net / val.income) * 100 : 0;
        lines.push([
          mKey,
          val.income.toFixed(2),
          val.expense.toFixed(2),
          net.toFixed(2),
          `${rate.toFixed(1)}%`,
        ].map(esc).join(delimiter));
      });
  }

  // Combine with UTF-8 BOM so Excel opens accents without weird characters
  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const filename = `felladina_finance_export_budgets_transactions_${dateStr}.csv`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { filename, rowCount: transactions.length + categories.length };
}

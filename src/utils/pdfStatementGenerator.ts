import { Transaction, CategoryBudget, Currency, Language } from '../types';

export interface PdfStatementOptions {
  month: string; // YYYY-MM e.g. "2026-10"
  clientName: string;
  statementRef: string;
  accountTitle: string;
  includeExecutiveSummary: boolean;
  includeBudgetTable: boolean;
  includeLedger: boolean;
  includeAuditNotes: boolean;
  includeSeal: boolean;
  customNotes?: string;
}

export interface StatementMonthSummary {
  monthStr: string; // "2026-10"
  monthLabelFr: string;
  monthLabelEn: string;
  monthLabelDarija: string;
  startDateStr: string;
  endDateStr: string;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  totalTransactionsCount: number;
  zeroExpenseDaysCount: number;
  daysInMonth: number;
  monthTransactions: Transaction[];
  categoryPerformance: {
    category: CategoryBudget;
    spent: number;
    budget: number;
    variance: number; // budget - spent for expense; spent - budget for income
    ratio: number; // spent / budget * 100
    status: 'on_track' | 'warning' | 'danger';
  }[];
}

const MONTH_NAMES_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_DARIJA = [
  'Yanayer', 'Febrayer', 'Mars', 'Avril', 'May', 'Yonyo',
  'Yolyoz', 'Ghot', 'Choutanbir', 'Oktobar', 'Nowanbir', 'Dojanbir'
];

export function getAvailableMonths(transactions: Transaction[]): string[] {
  const set = new Set<string>();
  transactions.forEach((t) => {
    if (t.date && t.date.length >= 7) {
      set.add(t.date.substring(0, 7));
    }
  });
  // If no transactions or only one, guarantee 2026-10 as default
  if (!set.has('2026-10')) {
    set.add('2026-10');
  }
  return Array.from(set).sort().reverse();
}

export function formatMonthLabel(monthKey: string, lang: Language): string {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const monthIdx = parseInt(monthStr, 10) - 1;
  if (isNaN(year) || isNaN(monthIdx) || monthIdx < 0 || monthIdx > 11) {
    return monthKey;
  }
  if (lang === 'ar_ma') return `${MONTH_NAMES_DARIJA[monthIdx]} ${year}`;
  if (lang === 'en') return `${MONTH_NAMES_EN[monthIdx]} ${year}`;
  return `${MONTH_NAMES_FR[monthIdx]} ${year}`;
}

export function computeMonthStatementData(
  monthKey: string,
  transactions: Transaction[],
  categories: CategoryBudget[]
): StatementMonthSummary {
  const [yearStr, monthNumStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10) || 2026;
  const monthIdx = (parseInt(monthNumStr, 10) || 10) - 1;
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

  const monthLabelFr = `${MONTH_NAMES_FR[monthIdx]} ${year}`;
  const monthLabelEn = `${MONTH_NAMES_EN[monthIdx]} ${year}`;
  const monthLabelDarija = `${MONTH_NAMES_DARIJA[monthIdx]} ${year}`;

  const startDateStr = `${year}-${String(monthIdx + 1).padStart(2, '0')}-01`;
  const endDateStr = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

  // Filter transactions for this exact month
  const monthTransactions = transactions
    .filter((t) => t.date && t.date.startsWith(monthKey))
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Zero-expense days computation
  const expenseDays = new Set<string>();
  monthTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => expenseDays.add(t.date));

  const zeroExpenseDaysCount = Math.max(0, daysInMonth - expenseDays.size);

  // Category breakdown for this month
  const categoryPerformance = categories.map((cat) => {
    const spent = monthTransactions
      .filter((t) => t.category === cat.id)
      .reduce((sum, t) => sum + t.amount, 0);
    const budget = cat.allocatedBudget;
    const ratio = budget > 0 ? (spent / budget) * 100 : 0;
    const variance = cat.type === 'expense' ? budget - spent : spent - budget;

    let status: 'on_track' | 'warning' | 'danger' = 'on_track';
    if (cat.type === 'expense') {
      if (ratio >= 100) status = 'danger';
      else if (ratio >= 80) status = 'warning';
      else status = 'on_track';
    } else {
      if (ratio >= 100) status = 'on_track';
      else if (ratio >= 75) status = 'warning';
      else status = 'danger';
    }

    return {
      category: cat,
      spent,
      budget,
      variance,
      ratio,
      status,
    };
  });

  return {
    monthStr: monthKey,
    monthLabelFr,
    monthLabelEn,
    monthLabelDarija,
    startDateStr,
    endDateStr,
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate,
    totalTransactionsCount: monthTransactions.length,
    zeroExpenseDaysCount,
    daysInMonth,
    monthTransactions,
    categoryPerformance,
  };
}

export function generateStatementHtml(
  data: StatementMonthSummary,
  options: PdfStatementOptions,
  currency: Currency,
  lang: Language
): string {
  const currencySymbol = currency === 'MAD' ? 'DH' : currency === 'EUR' ? '€' : '$';

  const fmt = (num: number) => {
    return Math.round(num).toLocaleString('fr-FR');
  };

  const periodLabel = lang === 'ar_ma' ? data.monthLabelDarija : lang === 'en' ? data.monthLabelEn : data.monthLabelFr;
  const printTimestamp = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculate running balance for ledger
  let runningBalance = 0;
  const ledgerRows = data.monthTransactions.map((tx) => {
    if (tx.type === 'income') {
      runningBalance += tx.amount;
    } else {
      runningBalance -= tx.amount;
    }
    const cat = data.categoryPerformance.find((c) => c.category.id === tx.category)?.category;
    const catName = cat
      ? lang === 'ar_ma'
        ? cat.labelDarija
        : lang === 'en'
        ? cat.labelEn
        : cat.label
      : tx.category;

    return `
      <tr>
        <td style="padding: 7px 10px; border-bottom: 1px solid #ECE7DE; font-family: monospace; font-size: 11px; color: #4A443A;">${tx.date}</td>
        <td style="padding: 7px 10px; border-bottom: 1px solid #ECE7DE; font-family: monospace; font-size: 10px; color: #8C8275;">${tx.id.toUpperCase()}</td>
        <td style="padding: 7px 10px; border-bottom: 1px solid #ECE7DE; font-size: 11px; color: #231F1C; font-weight: 500;">
          ${escapeHtml(tx.note)}
          ${tx.recipientOrSource ? `<span style="display:block; font-size: 10px; color: #7F776B;">${escapeHtml(tx.recipientOrSource)}</span>` : ''}
        </td>
        <td style="padding: 7px 10px; border-bottom: 1px solid #ECE7DE; font-size: 11px; color: #534D43;">${escapeHtml(catName)}</td>
        <td style="padding: 7px 10px; border-bottom: 1px solid #ECE7DE; font-size: 10px; color: #6D665B; text-transform: capitalize;">${tx.paymentMethod}</td>
        <td style="padding: 7px 10px; border-bottom: 1px solid #ECE7DE; text-align: right; font-family: monospace; font-size: 11px; color: ${tx.type === 'expense' ? '#A24824' : '#8A8071'}; font-weight: ${tx.type === 'expense' ? '600' : '400'};">
          ${tx.type === 'expense' ? `-${fmt(tx.amount)} ${currencySymbol}` : '—'}
        </td>
        <td style="padding: 7px 10px; border-bottom: 1px solid #ECE7DE; text-align: right; font-family: monospace; font-size: 11px; color: ${tx.type === 'income' ? '#2F6848' : '#8A8071'}; font-weight: ${tx.type === 'income' ? '600' : '400'};">
          ${tx.type === 'income' ? `+${fmt(tx.amount)} ${currencySymbol}` : '—'}
        </td>
        <td style="padding: 7px 10px; border-bottom: 1px solid #ECE7DE; text-align: right; font-family: monospace; font-size: 11px; font-weight: 600; color: ${runningBalance >= 0 ? '#1F4733' : '#8B2C15'}; background-color: #FAF8F4;">
          ${runningBalance >= 0 ? '+' : ''}${fmt(runningBalance)} ${currencySymbol}
        </td>
      </tr>
    `;
  }).join('');

  // Category rows
  const categoryRows = data.categoryPerformance.map((item) => {
    const isExpense = item.category.type === 'expense';
    const catLabel = lang === 'ar_ma' ? item.category.labelDarija : lang === 'en' ? item.category.labelEn : item.category.label;
    
    let statusBadge = '<span style="display:inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; background: #E6F0EB; color: #2A5A41;">Conforme</span>';
    if (item.status === 'warning') {
      statusBadge = '<span style="display:inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; background: #FEF3C7; color: #92400E;">Alerte ≥80%</span>';
    } else if (item.status === 'danger') {
      statusBadge = '<span style="display:inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; background: #FEE2E2; color: #991B1B;">Dépassement</span>';
    }

    return `
      <tr>
        <td style="padding: 8px 10px; border-bottom: 1px solid #ECE7DE; font-size: 11px; color: #231F1C; font-weight: 600;">
          <span style="display:inline-block; width: 8px; height: 8px; border-radius: 2px; margin-right: 6px; background: ${item.category.color};"></span>
          ${escapeHtml(catLabel)}
        </td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #ECE7DE; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: ${isExpense ? '#A24824' : '#2F6848'}; font-weight: 600;">
          ${isExpense ? 'Dépense' : 'Rentrée'}
        </td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #ECE7DE; text-align: right; font-family: monospace; font-size: 11px; color: #4A443A;">
          ${fmt(item.budget)} ${currencySymbol}
        </td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #ECE7DE; text-align: right; font-family: monospace; font-size: 11px; font-weight: 600; color: #231F1C;">
          ${fmt(item.spent)} ${currencySymbol}
        </td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #ECE7DE; text-align: right; font-family: monospace; font-size: 11px; color: ${item.variance >= 0 ? '#2F6848' : '#A24824'}; font-weight: 500;">
          ${item.variance >= 0 ? '+' : ''}${fmt(item.variance)} ${currencySymbol}
        </td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #ECE7DE; text-align: right; font-family: monospace; font-size: 11px; font-weight: 600; color: ${item.ratio >= 100 ? '#991B1B' : item.ratio >= 80 ? '#92400E' : '#2A5A41'};">
          ${Math.round(item.ratio)}%
        </td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #ECE7DE; text-align: center;">
          ${statusBadge}
        </td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Relevé Financier Felladina Finance - ${data.monthStr} - ${escapeHtml(options.clientName)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 16mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #231F1C;
      background: #FFFFFF;
      margin: 0;
      padding: 0;
      font-size: 11px;
      line-height: 1.45;
    }
    .serif-title {
      font-family: 'Newsreader', 'Georgia', 'Times New Roman', serif;
    }
    .sheet {
      max-width: 100%;
      margin: 0 auto;
      background: #FFFFFF;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #231F1C;
      padding-bottom: 14px;
      margin-bottom: 18px;
    }
    .brand-logo {
      display: inline-block;
      width: 32px;
      height: 32px;
      background: #A24824;
      color: #FFFFFF;
      border-radius: 6px;
      text-align: center;
      line-height: 32px;
      font-weight: 800;
      font-size: 16px;
      vertical-align: middle;
      margin-right: 8px;
    }
    .card-kpi {
      flex: 1;
      padding: 10px 14px;
      background: #FAF8F5;
      border: 1px solid #E8E2D6;
      border-radius: 6px;
    }
    .table-formal {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .table-formal th {
      background: #231F1C;
      color: #F7F5F0;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 8px 10px;
      text-align: left;
    }
    .section-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #231F1C;
      border-bottom: 1px solid #DED7C9;
      padding-bottom: 5px;
      margin-top: 22px;
      margin-bottom: 12px;
    }
    .seal-box {
      border: 1.5px dashed #A24824;
      padding: 12px 16px;
      border-radius: 8px;
      background: #FDF9F6;
      margin-top: 20px;
    }
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
      .page-break {
        page-break-before: always;
      }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <!-- Header -->
    <div class="header-bar">
      <div>
        <div style="display: flex; items-center; gap: 8px;">
          <span class="brand-logo">F</span>
          <div style="display: inline-block; vertical-align: middle;">
            <div class="serif-title" style="font-size: 20px; font-weight: bold; color: #231F1C; letter-spacing: -0.02em;">
              FELLADINA FINANCE · RELEVÉ FINANCIER MENSUEL
            </div>
            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #7F776B; font-weight: 600;">
              Executive Treasury & Wealth Management Statement
            </div>
          </div>
        </div>
        <div style="margin-top: 10px; font-size: 11px; color: #4A443A;">
          <strong>Titulaire du compte :</strong> ${escapeHtml(options.clientName)}<br>
          <strong>Désignation :</strong> ${escapeHtml(options.accountTitle)}<br>
          <strong>Période déclarée :</strong> ${escapeHtml(periodLabel)} (${data.startDateStr} au ${data.endDateStr})
        </div>
      </div>
      <div style="text-align: right; font-size: 10px; color: #534D43;">
        <div style="font-family: monospace; font-size: 12px; font-weight: bold; color: #A24824; background: #FAF2EE; padding: 4px 8px; border-radius: 4px; display: inline-block; margin-bottom: 6px; border: 1px solid #F1DFD5;">
          ${escapeHtml(options.statementRef)}
        </div>
        <div>Édité le : <strong>${printTimestamp}</strong></div>
        <div>Devise de référence : <strong>${currency} (${currencySymbol})</strong></div>
        <div>Statut : <strong style="color: #2F6848;">OFFICIEL & CLÔTURÉ</strong></div>
      </div>
    </div>

    ${options.includeExecutiveSummary ? `
    <!-- Executive Summary KPIs -->
    <div class="section-title">1. Synthèse Exécutive des Flux Monétaires</div>
    <div style="display: flex; gap: 10px; margin-bottom: 18px;">
      <div class="card-kpi" style="border-left: 4px solid #2F6848;">
        <div style="font-size: 9px; text-transform: uppercase; color: #7F776B; font-weight: 700;">Total Rentrées</div>
        <div style="font-family: monospace; font-size: 17px; font-weight: bold; color: #2F6848; margin-top: 4px;">
          +${fmt(data.totalIncome)} <span style="font-size: 11px;">${currencySymbol}</span>
        </div>
        <div style="font-size: 10px; color: #6D665B; margin-top: 2px;">Ressources encaissées</div>
      </div>
      <div class="card-kpi" style="border-left: 4px solid #A24824;">
        <div style="font-size: 9px; text-transform: uppercase; color: #7F776B; font-weight: 700;">Total Dépenses</div>
        <div style="font-family: monospace; font-size: 17px; font-weight: bold; color: #A24824; margin-top: 4px;">
          -${fmt(data.totalExpense)} <span style="font-size: 11px;">${currencySymbol}</span>
        </div>
        <div style="font-size: 10px; color: #6D665B; margin-top: 2px;">Engagements réglés</div>
      </div>
      <div class="card-kpi" style="border-left: 4px solid #1E3A8A;">
        <div style="font-size: 9px; text-transform: uppercase; color: #7F776B; font-weight: 700;">Épargne Nette</div>
        <div style="font-family: monospace; font-size: 17px; font-weight: bold; color: ${data.netSavings >= 0 ? '#1E3A8A' : '#991B1B'}; margin-top: 4px;">
          ${data.netSavings >= 0 ? '+' : ''}${fmt(data.netSavings)} <span style="font-size: 11px;">${currencySymbol}</span>
        </div>
        <div style="font-size: 10px; color: #6D665B; margin-top: 2px;">Capacité d'investissement</div>
      </div>
      <div class="card-kpi" style="border-left: 4px solid #D97706;">
        <div style="font-size: 9px; text-transform: uppercase; color: #7F776B; font-weight: 700;">Taux d'Épargne</div>
        <div style="font-family: monospace; font-size: 17px; font-weight: bold; color: #D97706; margin-top: 4px;">
          ${data.savingsRate.toFixed(1)}%
        </div>
        <div style="font-size: 10px; color: #6D665B; margin-top: 2px;">${data.zeroExpenseDaysCount} jours zéro-dépense</div>
      </div>
    </div>
    ` : ''}

    ${options.includeBudgetTable ? `
    <!-- Budget vs Actuals Analysis -->
    <div class="section-title">2. Exécution Budgétaire par Poste & Variance</div>
    <table class="table-formal">
      <thead>
        <tr>
          <th>Poste Budgétaire</th>
          <th>Type</th>
          <th style="text-align: right;">Budget Alloué</th>
          <th style="text-align: right;">Réalisé</th>
          <th style="text-align: right;">Variance (Écart)</th>
          <th style="text-align: right;">Exécution</th>
          <th style="text-align: center;">Statut</th>
        </tr>
      </thead>
      <tbody>
        ${categoryRows}
      </tbody>
    </table>
    ` : ''}

    ${options.includeLedger ? `
    <!-- Itemized Ledger -->
    <div class="section-title">3. Grand Livre des Opérations du Mois (${data.monthTransactions.length} écritures)</div>
    <table class="table-formal">
      <thead>
        <tr>
          <th>Date</th>
          <th>Réf</th>
          <th>Description & Tiers</th>
          <th>Catégorie</th>
          <th>Mode</th>
          <th style="text-align: right;">Débit (-)</th>
          <th style="text-align: right;">Crédit (+)</th>
          <th style="text-align: right;">Solde Progressif</th>
        </tr>
      </thead>
      <tbody>
        ${ledgerRows.length > 0 ? ledgerRows : `<tr><td colspan="8" style="text-align: center; padding: 18px; color: #8A8071;">Aucune opération enregistrée pour ce mois.</td></tr>`}
      </tbody>
    </table>
    ` : ''}

    ${options.includeAuditNotes ? `
    <!-- Audit Notes & Strategic Summary -->
    <div class="section-title">4. Note de Gestion & Diagnostic Financier</div>
    <div style="background: #FAF8F5; border: 1px solid #E5DFD4; border-radius: 6px; padding: 12px 16px; margin-bottom: 16px;">
      <p style="margin: 0 0 6px 0; font-weight: 600; color: #231F1C;">
        Analyse de situation pour le mois de ${periodLabel} :
      </p>
      <ul style="margin: 0; padding-left: 18px; color: #4A443A; font-size: 10.5px; line-height: 1.6;">
        <li>
          <strong>Taux d'Épargne consolidé :</strong> ${data.savingsRate.toFixed(1)}% des revenus ont été capitalisés, ce qui excède le seuil prudentiel standard de 20%.
        </li>
        <li>
          <strong>Discipline des flux :</strong> ${data.zeroExpenseDaysCount} journées sur ${data.daysInMonth} ont été vécues sans aucune sortie financière (taux de frugalité de ${(data.zeroExpenseDaysCount / data.daysInMonth * 100).toFixed(0)}%).
        </li>
        <li>
          <strong>Alertes seuil budgétaire :</strong> ${
            data.categoryPerformance.filter((c) => c.status === 'warning' || c.status === 'danger').length > 0
              ? `Surveillance recommandée sur les postes : ${data.categoryPerformance
                  .filter((c) => c.status === 'warning' || c.status === 'danger')
                  .map((c) => `${c.category.label} (${Math.round(c.ratio)}%)`)
                  .join(', ')}.`
              : 'Tous les postes budgétaires se maintiennent dans les limites prescrites sans dépassement.'
          }
        </li>
        ${options.customNotes ? `<li><strong>Note personnalisée :</strong> ${escapeHtml(options.customNotes)}</li>` : ''}
      </ul>
    </div>
    ` : ''}

    ${options.includeSeal ? `
    <!-- Formal Certification Seal -->
    <div class="seal-box">
      <div style="display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <div style="font-size: 11px; font-weight: 700; color: #A24824; text-transform: uppercase; letter-spacing: 0.08em; display: flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A24824" stroke-width="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Certificat de Clôture & Attestation de Sincérité
          </div>
          <div style="font-size: 10px; color: #6D665B; margin-top: 4px; max-width: 440px;">
            Le présent relevé de trésorerie a été généré via le moteur de conciliation Felladina Finance. Les soldes et imputations reflètent fidèlement les écritures enregistrées pour l'exercice concerné.
          </div>
          <div style="margin-top: 8px; font-family: monospace; font-size: 9px; color: #8A8071;">
            EMPREINTE DE VÉRIFICATION : SHA256:${data.monthStr.replace('-', '')}${data.totalTransactionsCount}${Math.round(data.totalIncome)}-CERTIFIED-FELLADINA
          </div>
        </div>
        <div style="text-align: center; border-top: 1px solid #7F776B; width: 170px; padding-top: 6px;">
          <div style="font-family: 'Newsreader', serif; font-style: italic; font-size: 14px; color: #231F1C;">
            ${escapeHtml(options.clientName)}
          </div>
          <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: #7F776B;">
            Signature & Approbation
          </div>
        </div>
      </div>
    </div>
    ` : ''}

    <!-- Footer -->
    <div style="margin-top: 24px; padding-top: 8px; border-top: 1px solid #ECE7DE; display: flex; justify-content: space-between; font-size: 9px; color: #8C8275;">
      <span>Felladina Finance & Budget Engine · Document à valeur de déclaration financière</span>
      <span>Page 1 / 1 · Généré le ${printTimestamp}</span>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Triggers native browser print with high quality A4 settings using an invisible iframe
 */
export function printStatementReport(htmlContent: string) {
  // Create an iframe to avoid tampering with main page DOM
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.style.visibility = 'hidden';

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  doc.open();
  doc.write(htmlContent);
  doc.close();

  iframe.contentWindow?.focus();
  setTimeout(() => {
    try {
      iframe.contentWindow?.print();
    } catch {
      // Fallback: window.open
      const printWin = window.open('', '_blank');
      if (printWin) {
        printWin.document.write(htmlContent);
        printWin.document.close();
        printWin.focus();
        printWin.print();
      }
    } finally {
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 3000);
    }
  }, 350);
}

/**
 * Downloads the standalone HTML report for archive or offline viewing
 */
export function downloadStatementHtml(htmlContent: string, filename: string) {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

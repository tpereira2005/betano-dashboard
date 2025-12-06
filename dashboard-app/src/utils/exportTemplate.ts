/**
 * HTML Template Generator for Server-Side Export
 * Generates static HTML/CSS that Puppeteer can render to PDF/PNG
 */

import type { ExportStats, ExportTransaction } from './exportTypes';

/**
 * Format currency value
 */
const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
};

/**
 * Format date for display
 */
const formatDate = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
};

/**
 * Get CSS variables based on theme
 */
const getThemeStyles = (theme: 'light' | 'dark'): string => {
    if (theme === 'dark') {
        return `
            --bg-color: #0D0E1A;
            --bg-gradient: linear-gradient(135deg, #0D0E1A 0%, #111222 50%, #151933 100%);
            --text-color: #FFFFFF;
            --text-secondary: #B0B8C4;
            --card-bg: rgba(28, 30, 46, 0.95);
            --card-border: rgba(255, 255, 255, 0.1);
            --header-bg: linear-gradient(135deg, #0D0E1A 0%, #1a1b2e 100%);
        `;
    }
    return `
        --bg-color: #F5F7FA;
        --bg-gradient: linear-gradient(135deg, #F5F7FA 0%, #E8EDF5 100%);
        --text-color: #1A1C35;
        --text-secondary: #6B7280;
        --card-bg: #FFFFFF;
        --card-border: #E5E7EB;
        --header-bg: linear-gradient(135deg, #0E0F22 0%, #1a1b2e 100%);
    `;
};

/**
 * Generate the base CSS styles
 */
const generateStyles = (theme: 'light' | 'dark'): string => `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    :root {
        ${getThemeStyles(theme)}
        --color-orange: #FF3D00;
        --color-green: #10B981;
        --color-red: #EF4444;
    }

    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        background: var(--bg-gradient);
        color: var(--text-color);
        min-height: 100vh;
        padding: 24px;
    }

    .container {
        max-width: 1200px;
        margin: 0 auto;
    }

    /* Header */
    .header {
        background: var(--header-bg);
        border-radius: 16px;
        padding: 20px 24px;
        margin-bottom: 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .header-title {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .header-logo {
        width: 40px;
        height: 40px;
        background: var(--color-orange);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 20px;
        color: white;
    }

    .header-text h1 {
        font-size: 1.25rem;
        font-weight: 700;
        color: white;
        margin: 0;
    }

    .header-text p {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.7);
        margin: 0;
    }

    .header-dates {
        display: flex;
        align-items: center;
        gap: 12px;
        color: white;
        font-size: 0.875rem;
    }

    .date-badge {
        background: rgba(255, 255, 255, 0.1);
        padding: 8px 12px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.15);
    }

    /* KPI Cards */
    .kpi-section {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-bottom: 24px;
    }

    .kpi-card {
        background: var(--card-bg);
        border: 1px solid var(--card-border);
        border-radius: 16px;
        padding: 20px;
    }

    .kpi-card.success { border-left: 4px solid var(--color-green); }
    .kpi-card.danger { border-left: 4px solid var(--color-red); }
    .kpi-card.primary { border-left: 4px solid var(--color-orange); }

    .kpi-label {
        font-size: 0.75rem;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
    }

    .kpi-value {
        font-size: 1.75rem;
        font-weight: 700;
    }

    .kpi-value.success { color: var(--color-green); }
    .kpi-value.danger { color: var(--color-red); }
    .kpi-value.primary { color: var(--color-orange); }

    /* Stats Grid */
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        margin-bottom: 24px;
    }

    .stat-card {
        background: var(--card-bg);
        border: 1px solid var(--card-border);
        border-radius: 12px;
        padding: 16px;
    }

    .stat-label {
        font-size: 0.7rem;
        color: var(--text-secondary);
        text-transform: uppercase;
        margin-bottom: 4px;
    }

    .stat-value {
        font-size: 1.1rem;
        font-weight: 600;
    }

    /* Charts Section */
    .charts-section {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
        margin-bottom: 24px;
    }

    .chart-card {
        background: var(--card-bg);
        border: 1px solid var(--card-border);
        border-radius: 16px;
        padding: 20px;
    }

    .chart-title {
        font-size: 0.875rem;
        font-weight: 600;
        margin-bottom: 16px;
        color: var(--text-color);
    }

    /* Monthly Chart (simplified bars) */
    .monthly-chart {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        height: 150px;
        padding-top: 20px;
    }

    .bar-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
    }

    .bar {
        width: 100%;
        max-width: 40px;
        border-radius: 4px 4px 0 0;
        transition: all 0.3s;
    }

    .bar.positive { background: var(--color-green); }
    .bar.negative { background: var(--color-red); }

    .bar-label {
        font-size: 0.6rem;
        color: var(--text-secondary);
        margin-top: 8px;
        text-align: center;
    }

    /* Insights */
    .insights-section {
        margin-bottom: 24px;
    }

    .insights-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
    }

    .insight-card {
        background: var(--card-bg);
        border: 1px solid var(--card-border);
        border-radius: 12px;
        padding: 16px;
    }

    .insight-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
    }

    .insight-icon {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
    }

    .insight-icon.success { background: rgba(16, 185, 129, 0.15); color: var(--color-green); }
    .insight-icon.warning { background: rgba(234, 179, 8, 0.15); color: #EAB308; }
    .insight-icon.danger { background: rgba(239, 68, 68, 0.15); color: var(--color-red); }
    .insight-icon.info { background: rgba(59, 130, 246, 0.15); color: #3B82F6; }

    .insight-title {
        font-size: 0.75rem;
        color: var(--text-secondary);
    }

    .insight-value {
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 4px;
    }

    .insight-desc {
        font-size: 0.7rem;
        color: var(--text-secondary);
    }

    /* Table */
    .table-section {
        background: var(--card-bg);
        border: 1px solid var(--card-border);
        border-radius: 16px;
        overflow: hidden;
        margin-bottom: 24px;
    }

    .table-header {
        padding: 16px 20px;
        border-bottom: 1px solid var(--card-border);
    }

    .table-header h3 {
        font-size: 1rem;
        font-weight: 600;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th {
        background: ${theme === 'dark' ? 'rgba(255, 61, 0, 0.15)' : '#F9FAFB'};
        padding: 12px 16px;
        text-align: left;
        font-size: 0.75rem;
        text-transform: uppercase;
        color: var(--text-secondary);
        font-weight: 600;
    }

    td {
        padding: 12px 16px;
        border-bottom: 1px solid var(--card-border);
        font-size: 0.875rem;
    }

    .badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 0.7rem;
        font-weight: 600;
    }

    .badge.deposit {
        background: rgba(16, 185, 129, 0.15);
        color: var(--color-green);
    }

    .badge.withdrawal {
        background: rgba(239, 68, 68, 0.15);
        color: var(--color-red);
    }

    /* Footer */
    .footer {
        text-align: center;
        padding: 20px;
        color: var(--text-secondary);
        font-size: 0.75rem;
    }

    .footer strong {
        color: var(--color-orange);
    }
`;

/**
 * Generate the icon SVG based on icon name
 */
const getIconSvg = (iconName: string): string => {
    const icons: Record<string, string> = {
        'TrendingUp': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
        'TrendingDown': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>',
        'Target': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
        'Calendar': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
        'Activity': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
        'Flame': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
        'DollarSign': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
        'ThumbsUp': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>',
        'AlertTriangle': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        'ArrowUpRight': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>',
        'ArrowDownRight': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="7" y1="7" x2="17" y2="17"/><polyline points="17 7 17 17 7 17"/></svg>'
    };
    return icons[iconName] || icons['Activity'];
};

/**
 * Generate monthly chart HTML
 */
const generateMonthlyChart = (monthlyData: Array<{ month: string; net: number }>): string => {
    if (monthlyData.length === 0) return '<p style="color: var(--text-secondary); font-size: 0.875rem;">Sem dados mensais</p>';

    const maxAbs = Math.max(...monthlyData.map(m => Math.abs(m.net)));
    const lastMonths = monthlyData.slice(-8); // Show last 8 months

    const bars = lastMonths.map(m => {
        const heightPercent = maxAbs > 0 ? (Math.abs(m.net) / maxAbs) * 100 : 0;
        const isPositive = m.net >= 0;
        const monthLabel = m.month.substring(5); // Get MM from YYYY-MM

        return `
            <div class="bar-container">
                <div class="bar ${isPositive ? 'positive' : 'negative'}" style="height: ${Math.max(heightPercent, 5)}%;"></div>
                <span class="bar-label">${monthLabel}</span>
            </div>
        `;
    }).join('');

    return `<div class="monthly-chart">${bars}</div>`;
};

/**
 * Generate insights grid HTML
 */
const generateInsightsHtml = (insights: ExportStats['insights']): string => {
    const visibleInsights = insights.slice(0, 8);

    return visibleInsights.map(insight => `
        <div class="insight-card">
            <div class="insight-header">
                <div class="insight-icon ${insight.type}">
                    ${getIconSvg(insight.icon)}
                </div>
                <span class="insight-title">${insight.title}</span>
            </div>
            ${insight.value ? `<div class="insight-value">${insight.value}</div>` : ''}
            <p class="insight-desc">${insight.description}</p>
        </div>
    `).join('');
};

/**
 * Generate transactions table HTML
 */
const generateTableHtml = (transactions: ExportTransaction[]): string => {
    // Show only last 20 transactions for PDF
    const visibleTransactions = transactions.slice(-20);

    const rows = visibleTransactions.map(t => `
        <tr>
            <td>${formatDate(t.date)}</td>
            <td><span class="badge ${t.type === 'Deposit' ? 'deposit' : 'withdrawal'}">${t.type === 'Deposit' ? 'Depósito' : 'Levantamento'}</span></td>
            <td style="font-weight: 600; color: ${t.type === 'Withdrawal' ? 'var(--color-green)' : 'var(--color-red)'}">
                ${t.type === 'Withdrawal' ? '+' : '-'}${formatCurrency(t.value)}
            </td>
            <td style="color: ${t.cumulative >= 0 ? 'var(--color-green)' : 'var(--color-red)'}; font-weight: 500;">
                ${formatCurrency(t.cumulative)}
            </td>
        </tr>
    `).join('');

    return `
        <thead>
            <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Saldo Acumulado</th>
            </tr>
        </thead>
        <tbody>${rows}</tbody>
    `;
};

/**
 * Main function: Generate complete HTML document for export
 */
export const generateExportHtml = (
    stats: ExportStats,
    transactions: ExportTransaction[],
    theme: 'light' | 'dark',
    dateRange: { start: string; end: string }
): string => {
    const netResultClass = stats.netResult >= 0 ? 'success' : 'danger';

    return `
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Betano Dashboard Export</title>
    <style>${generateStyles(theme)}</style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <header class="header">
            <div class="header-title">
                <div class="header-logo">B</div>
                <div class="header-text">
                    <h1>Betano Dashboard</h1>
                    <p>Dashboard Financeiro</p>
                </div>
            </div>
            <div class="header-dates">
                <span class="date-badge">${formatDate(dateRange.start)}</span>
                <span>até</span>
                <span class="date-badge">${formatDate(dateRange.end)}</span>
            </div>
        </header>

        <!-- Main KPIs -->
        <section class="kpi-section">
            <div class="kpi-card danger">
                <p class="kpi-label">Total Depositado</p>
                <p class="kpi-value danger">${formatCurrency(stats.totalDeposited)}</p>
            </div>
            <div class="kpi-card success">
                <p class="kpi-label">Total Levantado</p>
                <p class="kpi-value success">${formatCurrency(stats.totalWithdrawn)}</p>
            </div>
            <div class="kpi-card ${netResultClass}">
                <p class="kpi-label">Resultado Líquido</p>
                <p class="kpi-value ${netResultClass}">${stats.netResult >= 0 ? '+' : ''}${formatCurrency(stats.netResult)}</p>
            </div>
        </section>

        <!-- Secondary Stats -->
        <section class="stats-grid">
            <div class="stat-card">
                <p class="stat-label">ROI</p>
                <p class="stat-value" style="color: ${stats.roi >= 0 ? 'var(--color-green)' : 'var(--color-red)'}">
                    ${stats.roi >= 0 ? '+' : ''}${stats.roi.toFixed(1)}%
                </p>
            </div>
            <div class="stat-card">
                <p class="stat-label">Taxa de Sucesso</p>
                <p class="stat-value">${stats.winRate.toFixed(0)}%</p>
            </div>
            <div class="stat-card">
                <p class="stat-label">Meses Lucrativos</p>
                <p class="stat-value">${stats.profitableMonths}/${stats.monthlyData.length}</p>
            </div>
            <div class="stat-card">
                <p class="stat-label">Nº Transações</p>
                <p class="stat-value">${stats.depositCount + stats.withdrawalCount}</p>
            </div>
        </section>

        <!-- Charts -->
        <section class="charts-section">
            <div class="chart-card">
                <h3 class="chart-title">📊 Evolução Mensal</h3>
                ${generateMonthlyChart(stats.monthlyData)}
            </div>
            <div class="chart-card">
                <h3 class="chart-title">📈 Resumo</h3>
                <div style="display: grid; gap: 12px;">
                    <div style="display: flex; justify-content: space-between; padding: 12px; background: rgba(16, 185, 129, 0.1); border-radius: 8px;">
                        <span>Melhor Mês</span>
                        <strong style="color: var(--color-green)">${stats.bestMonth ? formatCurrency(stats.bestMonth.net) : 'N/A'}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 12px; background: rgba(239, 68, 68, 0.1); border-radius: 8px;">
                        <span>Pior Mês</span>
                        <strong style="color: var(--color-red)">${stats.worstMonth ? formatCurrency(stats.worstMonth.net) : 'N/A'}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 12px; background: rgba(59, 130, 246, 0.1); border-radius: 8px;">
                        <span>Média Depósito</span>
                        <strong>${formatCurrency(stats.avgDeposit)}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 12px; background: rgba(59, 130, 246, 0.1); border-radius: 8px;">
                        <span>Média Levantamento</span>
                        <strong>${formatCurrency(stats.avgWithdrawal)}</strong>
                    </div>
                </div>
            </div>
        </section>

        <!-- Insights -->
        ${stats.insights.length > 0 ? `
        <section class="insights-section">
            <div class="insights-grid">
                ${generateInsightsHtml(stats.insights)}
            </div>
        </section>
        ` : ''}

        <!-- Transaction Table -->
        <section class="table-section">
            <div class="table-header">
                <h3>Últimas ${Math.min(transactions.length, 20)} Transações</h3>
            </div>
            <table>
                ${generateTableHtml(transactions)}
            </table>
        </section>

        <!-- Footer -->
        <footer class="footer">
            <p>© ${new Date().getFullYear()} Desenvolvido por <strong>Tomás Pereira</strong> | Exportado em ${new Date().toLocaleDateString('pt-PT')}</p>
        </footer>
    </div>
</body>
</html>
    `;
};

/**
 * Vercel Serverless Function - Export Dashboard to PDF/PNG
 * Uses Puppeteer with @sparticuz/chromium for serverless environments
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Dynamic imports for better cold start performance
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let puppeteer: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let chromium: any;

/**
 * Get browser instance configured for serverless environment
 */
const getBrowser = async () => {
    // Lazy load modules
    if (!puppeteer) {
        puppeteer = await import('puppeteer-core');
    }
    if (!chromium) {
        const chromiumModule = await import('@sparticuz/chromium');
        chromium = chromiumModule.default || chromiumModule;
    }

    const executablePath = await chromium.executablePath();

    return puppeteer.launch({
        args: [
            ...chromium.args,
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--single-process'
        ],
        defaultViewport: {
            width: 1200,
            height: 1600,
            deviceScaleFactor: 1
        },
        executablePath,
        headless: true
    });
};

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
 * Get theme CSS variables
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

// Type definitions for the export API
interface MonthlyData {
    month: string;
    net: number;
}

interface Insight {
    id: string;
    category: string;
    type: 'success' | 'warning' | 'danger' | 'info';
    icon: string;
    title: string;
    value?: string;
    description: string;
    trend?: 'up' | 'down' | 'stable';
    priority: number;
}

interface Transaction {
    date: string;
    type: 'Deposit' | 'Withdrawal';
    value: number;
    cumulative: number;
}

interface ExportStats {
    totalDeposited: number;
    totalWithdrawn: number;
    netResult: number;
    depositCount: number;
    withdrawalCount: number;
    avgDeposit: number;
    avgWithdrawal: number;
    roi: number;
    winRate: number;
    profitableMonths: number;
    monthlyData: MonthlyData[];
    insights: Insight[];
    bestMonth: MonthlyData | null;
    worstMonth: MonthlyData | null;
}

interface ExportData {
    stats: ExportStats;
    transactions: Transaction[];
    theme: 'light' | 'dark';
    format: 'pdf' | 'png';
    dateRange: {
        start: string;
        end: string;
    };
}

/**
 * Generate complete HTML for export
 */
const generateHtml = (data: ExportData): string => {
    const { stats, transactions, theme, dateRange } = data;
    const netResultClass = stats.netResult >= 0 ? 'success' : 'danger';

    // Calculate monthly chart bars
    const monthlyData = stats.monthlyData || [];
    const maxAbs = Math.max(...monthlyData.map((m: MonthlyData) => Math.abs(m.net)), 1);
    const lastMonths = monthlyData.slice(-8);

    const barsHtml = lastMonths.map((m: MonthlyData) => {
        const heightPercent = maxAbs > 0 ? (Math.abs(m.net) / maxAbs) * 100 : 5;
        const isPositive = m.net >= 0;
        return `
            <div class="bar-container">
                <div class="bar ${isPositive ? 'positive' : 'negative'}" style="height: ${Math.max(heightPercent, 5)}%;"></div>
                <span class="bar-label">${m.month.substring(5)}</span>
            </div>
        `;
    }).join('');

    // Generate insights HTML
    const insightsHtml = (stats.insights || []).slice(0, 8).map((insight: Insight) => `
        <div class="insight-card">
            <div class="insight-header">
                <div class="insight-icon ${insight.type}">●</div>
                <span class="insight-title">${insight.title}</span>
            </div>
            ${insight.value ? `<div class="insight-value">${insight.value}</div>` : ''}
            <p class="insight-desc">${insight.description}</p>
        </div>
    `).join('');

    // Generate table rows
    const tableRows = transactions.slice(-20).map((t: Transaction) => `
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
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Betano Dashboard Export</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            ${getThemeStyles(theme)}
            --color-orange: #FF3D00;
            --color-green: #10B981;
            --color-red: #EF4444;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background: var(--bg-gradient);
            color: var(--text-color);
            padding: 24px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
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
        .header-title { display: flex; align-items: center; gap: 12px; }
        .header-logo {
            width: 40px; height: 40px;
            background: var(--color-orange);
            border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            font-weight: 700; font-size: 20px; color: white;
        }
        .header-text h1 { font-size: 1.25rem; font-weight: 700; color: white; }
        .header-text p { font-size: 0.75rem; color: rgba(255, 255, 255, 0.7); }
        .header-dates { display: flex; align-items: center; gap: 12px; color: white; font-size: 0.875rem; }
        .date-badge { background: rgba(255, 255, 255, 0.1); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.15); }
        .kpi-section { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
        .kpi-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 20px; }
        .kpi-card.success { border-left: 4px solid var(--color-green); }
        .kpi-card.danger { border-left: 4px solid var(--color-red); }
        .kpi-label { font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 8px; }
        .kpi-value { font-size: 1.75rem; font-weight: 700; }
        .kpi-value.success { color: var(--color-green); }
        .kpi-value.danger { color: var(--color-red); }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
        .stat-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; padding: 16px; }
        .stat-label { font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 4px; }
        .stat-value { font-size: 1.1rem; font-weight: 600; }
        .charts-section { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
        .chart-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 20px; }
        .chart-title { font-size: 0.875rem; font-weight: 600; margin-bottom: 16px; }
        .monthly-chart { display: flex; align-items: flex-end; gap: 8px; height: 150px; padding-top: 20px; }
        .bar-container { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; }
        .bar { width: 100%; max-width: 40px; border-radius: 4px 4px 0 0; }
        .bar.positive { background: var(--color-green); }
        .bar.negative { background: var(--color-red); }
        .bar-label { font-size: 0.6rem; color: var(--text-secondary); margin-top: 8px; }
        .insights-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
        .insight-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; padding: 16px; }
        .insight-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .insight-icon { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; }
        .insight-icon.success { background: rgba(16, 185, 129, 0.15); color: var(--color-green); }
        .insight-icon.warning { background: rgba(234, 179, 8, 0.15); color: #EAB308; }
        .insight-icon.danger { background: rgba(239, 68, 68, 0.15); color: var(--color-red); }
        .insight-icon.info { background: rgba(59, 130, 246, 0.15); color: #3B82F6; }
        .insight-title { font-size: 0.75rem; color: var(--text-secondary); }
        .insight-value { font-size: 1.25rem; font-weight: 700; margin-bottom: 4px; }
        .insight-desc { font-size: 0.7rem; color: var(--text-secondary); }
        .table-section { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; overflow: hidden; margin-bottom: 24px; }
        .table-header { padding: 16px 20px; border-bottom: 1px solid var(--card-border); }
        .table-header h3 { font-size: 1rem; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; }
        th { background: ${theme === 'dark' ? 'rgba(255, 61, 0, 0.15)' : '#F9FAFB'}; padding: 12px 16px; text-align: left; font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 600; }
        td { padding: 12px 16px; border-bottom: 1px solid var(--card-border); font-size: 0.875rem; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 600; }
        .badge.deposit { background: rgba(16, 185, 129, 0.15); color: var(--color-green); }
        .badge.withdrawal { background: rgba(239, 68, 68, 0.15); color: var(--color-red); }
        .footer { text-align: center; padding: 20px; color: var(--text-secondary); font-size: 0.75rem; }
        .footer strong { color: var(--color-orange); }
        .summary-row { display: flex; justify-content: space-between; padding: 12px; border-radius: 8px; margin-bottom: 8px; }
        .summary-row.green { background: rgba(16, 185, 129, 0.1); }
        .summary-row.red { background: rgba(239, 68, 68, 0.1); }
        .summary-row.blue { background: rgba(59, 130, 246, 0.1); }
    </style>
</head>
<body>
    <div class="container">
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

        <section class="stats-grid">
            <div class="stat-card">
                <p class="stat-label">ROI</p>
                <p class="stat-value" style="color: ${stats.roi >= 0 ? 'var(--color-green)' : 'var(--color-red)'}">${stats.roi >= 0 ? '+' : ''}${stats.roi.toFixed(1)}%</p>
            </div>
            <div class="stat-card">
                <p class="stat-label">Taxa de Sucesso</p>
                <p class="stat-value">${stats.winRate.toFixed(0)}%</p>
            </div>
            <div class="stat-card">
                <p class="stat-label">Meses Lucrativos</p>
                <p class="stat-value">${stats.profitableMonths}/${stats.monthlyData?.length || 0}</p>
            </div>
            <div class="stat-card">
                <p class="stat-label">Nº Transações</p>
                <p class="stat-value">${stats.depositCount + stats.withdrawalCount}</p>
            </div>
        </section>

        <section class="charts-section">
            <div class="chart-card">
                <h3 class="chart-title">📊 Evolução Mensal</h3>
                <div class="monthly-chart">${barsHtml}</div>
            </div>
            <div class="chart-card">
                <h3 class="chart-title">📈 Resumo</h3>
                <div class="summary-row green">
                    <span>Melhor Mês</span>
                    <strong style="color: var(--color-green)">${stats.bestMonth ? formatCurrency(stats.bestMonth.net) : 'N/A'}</strong>
                </div>
                <div class="summary-row red">
                    <span>Pior Mês</span>
                    <strong style="color: var(--color-red)">${stats.worstMonth ? formatCurrency(stats.worstMonth.net) : 'N/A'}</strong>
                </div>
                <div class="summary-row blue">
                    <span>Média Depósito</span>
                    <strong>${formatCurrency(stats.avgDeposit)}</strong>
                </div>
                <div class="summary-row blue">
                    <span>Média Levantamento</span>
                    <strong>${formatCurrency(stats.avgWithdrawal)}</strong>
                </div>
            </div>
        </section>

        ${(stats.insights?.length || 0) > 0 ? `<section class="insights-grid">${insightsHtml}</section>` : ''}

        <section class="table-section">
            <div class="table-header">
                <h3>Últimas ${Math.min(transactions.length, 20)} Transações</h3>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Tipo</th>
                        <th>Valor</th>
                        <th>Saldo Acumulado</th>
                    </tr>
                </thead>
                <tbody>${tableRows}</tbody>
            </table>
        </section>

        <footer class="footer">
            <p>© ${new Date().getFullYear()} Desenvolvido por <strong>Tomás Pereira</strong> | Exportado em ${new Date().toLocaleDateString('pt-PT')}</p>
        </footer>
    </div>
</body>
</html>`;
};



/**
 * API Handler
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let browser = null;

    try {
        const data: ExportData = req.body;

        // Validate required fields
        if (!data.stats || !data.transactions || !data.theme || !data.format || !data.dateRange) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Generate HTML
        const html = generateHtml(data);

        // Launch browser
        browser = await getBrowser();
        const page = await browser.newPage();

        // Set content with wait for fonts
        await page.setContent(html, {
            waitUntil: 'networkidle0'
        });

        // Wait a bit for fonts to load
        await new Promise(resolve => setTimeout(resolve, 500));

        if (data.format === 'pdf') {
            // Generate PDF
            const pdf = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '10mm',
                    right: '10mm',
                    bottom: '10mm',
                    left: '10mm'
                }
            });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="betano-dashboard.pdf"');
            return res.send(pdf);
        } else {
            // Generate PNG
            const screenshot = await page.screenshot({
                type: 'png',
                fullPage: true
            });

            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Content-Disposition', 'attachment; filename="betano-dashboard.png"');
            return res.send(screenshot);
        }
    } catch (error) {
        console.error('Export error:', error);
        return res.status(500).json({
            error: 'Export failed',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

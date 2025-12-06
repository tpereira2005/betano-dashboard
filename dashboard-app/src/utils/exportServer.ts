/**
 * Server-Side Export Client
 * Calls the Vercel API to generate PDF/PNG exports without blocking the UI
 */

import type { Statistics, Transaction } from '@/types';

/**
 * Data payload for the export API
 */
interface ExportPayload {
    stats: {
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
        monthlyData: Array<{ month: string; net: number }>;
        insights: Statistics['insights'];
        bestMonth: Statistics['bestMonth'];
        worstMonth: Statistics['worstMonth'];
    };
    transactions: Array<{
        date: string;
        type: 'Deposit' | 'Withdrawal';
        value: number;
        cumulative: number;
    }>;
    theme: 'light' | 'dark';
    format: 'pdf' | 'png';
    dateRange: {
        start: string;
        end: string;
    };
}

/**
 * Get current theme
 */
const getCurrentTheme = (): 'light' | 'dark' => {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
};

/**
 * Convert Statistics to export-friendly format
 */
const prepareStatsForExport = (stats: Statistics): ExportPayload['stats'] => {
    return {
        totalDeposited: stats.totalDeposited,
        totalWithdrawn: stats.totalWithdrawn,
        netResult: stats.netResult,
        depositCount: stats.depositCount,
        withdrawalCount: stats.withdrawalCount,
        avgDeposit: stats.avgDeposit,
        avgWithdrawal: stats.avgWithdrawal,
        roi: stats.roi,
        winRate: stats.winRate,
        profitableMonths: stats.profitableMonths,
        monthlyData: stats.monthlyData,
        insights: stats.insights,
        bestMonth: stats.bestMonth,
        worstMonth: stats.worstMonth
    };
};

/**
 * Convert transactions to export-friendly format
 */
const prepareTransactionsForExport = (transactions: Transaction[]): ExportPayload['transactions'] => {
    return transactions.map(t => ({
        date: t.date,
        type: t.type,
        value: t.value,
        cumulative: t.cumulative
    }));
};

/**
 * Download blob as file
 */
const downloadBlob = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Export dashboard as PDF via server-side rendering
 * This does NOT block the UI - rendering happens on the server
 */
export const exportDashboardAsPDF = async (
    stats: Statistics,
    transactions: Transaction[],
    dateRange: { start: string; end: string }
): Promise<void> => {
    const payload: ExportPayload = {
        stats: prepareStatsForExport(stats),
        transactions: prepareTransactionsForExport(transactions),
        theme: getCurrentTheme(),
        format: 'pdf',
        dateRange
    };

    const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Export failed' }));
        throw new Error(error.message || error.error || 'Export failed');
    }

    const blob = await response.blob();
    downloadBlob(blob, `betano-dashboard-${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Export dashboard as PNG via server-side rendering
 * This does NOT block the UI - rendering happens on the server
 */
export const exportDashboardAsPNG = async (
    stats: Statistics,
    transactions: Transaction[],
    dateRange: { start: string; end: string }
): Promise<void> => {
    const payload: ExportPayload = {
        stats: prepareStatsForExport(stats),
        transactions: prepareTransactionsForExport(transactions),
        theme: getCurrentTheme(),
        format: 'png',
        dateRange
    };

    const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Export failed' }));
        throw new Error(error.message || error.error || 'Export failed');
    }

    const blob = await response.blob();
    downloadBlob(blob, `betano-dashboard-${new Date().toISOString().split('T')[0]}.png`);
};

/**
 * Export transactions as CSV file (client-side, fast)
 */
export const exportTransactionsAsCSV = (
    transactions: Array<{ date: string; type: string; value: number; cumulative: number }>,
    filename: string
): void => {
    try {
        // CSV Headers
        const headers = ['Date', 'Type', 'Value', 'Cumulative Balance'];

        // Convert transactions to CSV rows
        const rows = transactions.map(t => [
            t.date,
            t.type === 'Deposit' ? 'Deposit' : 'Withdrawal',
            t.value.toFixed(2),
            t.cumulative.toFixed(2)
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(';'),
            ...rows.map(row => row.join(';'))
        ].join('\n');

        // Add UTF-8 BOM for Excel compatibility
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

        downloadBlob(blob, `${filename}.csv`);
    } catch (error) {
        console.error('Failed to export CSV:', error);
        throw error;
    }
};

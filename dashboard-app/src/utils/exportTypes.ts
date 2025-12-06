/**
 * Export Data Types - Shared between frontend and API
 * These types define the data structure sent to the server-side export API
 */

import type { Statistics, Transaction, MonthlyData, MoMChange, RichInsight } from '@/types';

/**
 * Data payload sent to the export API
 */
export interface ExportPayload {
    stats: Statistics;
    transactions: Transaction[];
    theme: 'light' | 'dark';
    format: 'pdf' | 'png';
    dateRange: {
        start: string;
        end: string;
    };
}

/**
 * Simplified stats for export template (no complex objects)
 */
export interface ExportStats {
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
    momChanges: MoMChange[];
    insights: RichInsight[];
    bestMonth: MonthlyData | null;
    worstMonth: MonthlyData | null;
}

/**
 * Simplified transaction for export template
 */
export interface ExportTransaction {
    date: string;
    type: 'Deposit' | 'Withdrawal';
    value: number;
    cumulative: number;
}

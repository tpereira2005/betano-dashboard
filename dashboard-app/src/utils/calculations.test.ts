import { describe, it, expect } from 'vitest';
import { processTransactions, calculateStatistics, filterTransactions } from './calculations';
import { RawTransaction } from '@/types';

describe('processTransactions', () => {
    it('should return empty array for empty input', () => {
        expect(processTransactions([])).toEqual([]);
    });

    it('should return empty array for null/undefined input', () => {
        expect(processTransactions(null as any)).toEqual([]);
        expect(processTransactions(undefined as any)).toEqual([]);
    });

    it('should correctly parse and sort transactions by date', () => {
        const rawData: RawTransaction[] = [
            { Date: '2024-02-15', Tipe: 'Deposit', Vaule: '50€' },
            { Date: '2024-01-10', Tipe: 'Withdrawal', Vaule: '100€' },
        ];

        const result = processTransactions(rawData);

        expect(result).toHaveLength(2);
        expect(result[0].date).toBe('2024-01-10');
        expect(result[1].date).toBe('2024-02-15');
    });

    it('should correctly sanitize currency values', () => {
        const rawData: RawTransaction[] = [
            { Date: '2024-01-01', Tipe: 'Deposit', Vaule: '€ 100,50' },
            { Date: '2024-01-02', Tipe: 'Deposit', Vaule: '50.25' },
            { Date: '2024-01-03', Tipe: 'Deposit', Vaule: '-25€' },
        ];

        const result = processTransactions(rawData);

        expect(result[0].value).toBe(100.50);
        expect(result[1].value).toBe(50.25);
        expect(result[2].value).toBe(25); // Should be absolute value
    });

    it('should calculate cumulative values correctly', () => {
        const rawData: RawTransaction[] = [
            { Date: '2024-01-01', Tipe: 'Deposit', Vaule: '100' },
            { Date: '2024-01-02', Tipe: 'Withdrawal', Vaule: '150' },
            { Date: '2024-01-03', Tipe: 'Deposit', Vaule: '50' },
        ];

        const result = processTransactions(rawData);

        // Deposit = -100 (negative net for deposits)
        // Withdrawal = +150 (positive net for withdrawals)
        // netValue after first: -100, cumulative: -100
        // netValue after second: +150, cumulative: 50
        // netValue after third: -50, cumulative: 0
        expect(result[0].cumulative).toBe(-100);
        expect(result[1].cumulative).toBe(50);
        expect(result[2].cumulative).toBe(0);
    });

    it('should skip invalid transactions', () => {
        const rawData: RawTransaction[] = [
            { Date: '2024-01-01', Tipe: 'Deposit', Vaule: '100' },
            { Date: 'invalid-date', Tipe: 'Deposit', Vaule: '50' },
            { Date: '2024-01-02', Tipe: 'Invalid' as any, Vaule: '50' },
            { Date: '2024-01-03', Tipe: 'Deposit', Vaule: '' },
        ];

        const result = processTransactions(rawData);

        expect(result).toHaveLength(1);
        expect(result[0].date).toBe('2024-01-01');
    });
});

describe('calculateStatistics', () => {
    const createProcessedTransaction = (
        date: string,
        type: 'Deposit' | 'Withdrawal',
        value: number,
        cumulative: number
    ) => ({
        date,
        type,
        value,
        rawDate: new Date(date),
        netValue: type === 'Withdrawal' ? value : -value,
        cumulative
    });

    it('should calculate totals correctly', () => {
        const transactions = [
            createProcessedTransaction('2024-01-01', 'Deposit', 100, -100),
            createProcessedTransaction('2024-01-02', 'Deposit', 50, -150),
            createProcessedTransaction('2024-01-03', 'Withdrawal', 200, 50),
        ];

        const stats = calculateStatistics(transactions);

        expect(stats.totalDeposited).toBe(150);
        expect(stats.totalWithdrawn).toBe(200);
        expect(stats.netResult).toBe(50);
        expect(stats.depositCount).toBe(2);
        expect(stats.withdrawalCount).toBe(1);
    });

    it('should calculate ROI correctly', () => {
        const transactions = [
            createProcessedTransaction('2024-01-01', 'Deposit', 100, -100),
            createProcessedTransaction('2024-01-02', 'Withdrawal', 120, 20),
        ];

        const stats = calculateStatistics(transactions);

        // ROI = (120 - 100) / 100 * 100 = 20%
        expect(stats.roi).toBe(20);
    });

    it('should calculate win rate correctly', () => {
        const transactions = [
            createProcessedTransaction('2024-01-15', 'Deposit', 100, -100),
            createProcessedTransaction('2024-01-20', 'Withdrawal', 150, 50),
            createProcessedTransaction('2024-02-15', 'Deposit', 100, -50),
            createProcessedTransaction('2024-02-20', 'Withdrawal', 80, -70),
            createProcessedTransaction('2024-03-15', 'Withdrawal', 100, 30),
        ];

        const stats = calculateStatistics(transactions);

        // January: +50, February: -20, March: +100
        // 2 profitable out of 3 = 66.67%
        expect(stats.profitableMonths).toBe(2);
        expect(stats.winRate).toBeCloseTo(66.67, 0);
    });

    it('should return empty stats for empty transactions', () => {
        const stats = calculateStatistics([]);

        expect(stats.totalDeposited).toBe(0);
        expect(stats.totalWithdrawn).toBe(0);
        expect(stats.netResult).toBe(0);
        expect(stats.roi).toBe(0);
    });
});

describe('filterTransactions', () => {
    const createTransaction = (date: string, type: 'Deposit' | 'Withdrawal') => ({
        date,
        type,
        value: 100,
        rawDate: new Date(date),
        netValue: type === 'Withdrawal' ? 100 : -100,
        cumulative: 0
    });

    const transactions = [
        createTransaction('2024-01-15', 'Deposit'),
        createTransaction('2024-02-15', 'Withdrawal'),
        createTransaction('2024-03-15', 'Deposit'),
        createTransaction('2024-04-15', 'Withdrawal'),
    ];

    it('should return all transactions when filter is All', () => {
        const result = filterTransactions(transactions, 'All', '', '');
        expect(result).toHaveLength(4);
    });

    it('should filter by transaction type', () => {
        const deposits = filterTransactions(transactions, 'Deposit', '', '');
        const withdrawals = filterTransactions(transactions, 'Withdrawal', '', '');

        expect(deposits).toHaveLength(2);
        expect(withdrawals).toHaveLength(2);
    });

    it('should filter by date range', () => {
        const result = filterTransactions(
            transactions,
            'All',
            '2024-02-01',
            '2024-03-31'
        );

        expect(result).toHaveLength(2);
        expect(result[0].date).toBe('2024-02-15');
        expect(result[1].date).toBe('2024-03-15');
    });

    it('should combine type and date filters', () => {
        const result = filterTransactions(
            transactions,
            'Deposit',
            '2024-02-01',
            '2024-12-31'
        );

        expect(result).toHaveLength(1);
        expect(result[0].date).toBe('2024-03-15');
    });

    it('should return empty array for invalid date range', () => {
        const result = filterTransactions(
            transactions,
            'All',
            'invalid',
            'also-invalid'
        );

        expect(result).toEqual([]);
    });
});

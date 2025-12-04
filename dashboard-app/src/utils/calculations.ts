import {
    Transaction,
    RawTransaction,
    Statistics,
    MonthlyData,
    MoMChange,
    HistogramBucket,
    LargestTransaction
} from '@/types';
import { formatCurrency } from './formatters';

const sanitizeValue = (rawValue: string): number | null => {
    if (!rawValue) return null;

    const normalized = rawValue
        .replace(/€/g, '')
        .replace(/\s/g, '')
        .replace(',', '.')
        .replace(/[^0-9.-]/g, '');

    const parsed = parseFloat(normalized);
    return Number.isFinite(parsed) ? Math.abs(parsed) : null;
};

const safeParseDate = (value: string): Date | null => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const normalizeType = (value: string): Transaction['type'] | null => {
    if (value === 'Deposit' || value === 'Withdrawal') {
        return value;
    }
    return null;
};

/**
 * Process raw CSV data into typed transactions with cumulative values
 */
export const processTransactions = (rawData: RawTransaction[]): Transaction[] => {
    if (!rawData || rawData.length === 0) return [];

    // Parse values and dates with validation
    let transactions = rawData
        .map(t => {
            const parsedDate = safeParseDate(t.Date);
            const parsedValue = sanitizeValue(t.Vaule);
            const parsedType = normalizeType(t.Tipe);

            if (!parsedDate || parsedValue === null || !parsedType) {
                return null;
            }

            const value = parsedValue;
            return {
                date: t.Date,
                type: parsedType,
                value,
                rawDate: parsedDate,
                netValue: parsedType === 'Withdrawal' ? value : -value,
                cumulative: 0
            } as Transaction;
        })
        .filter((t): t is Transaction => Boolean(t))
        .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());

    // Calculate cumulative
    let cumulative = 0;
    transactions = transactions.map(t => {
        cumulative += t.netValue;
        return { ...t, cumulative };
    });

    return transactions;
};

/**
 * Calculate histogram buckets for value distribution
 */
const calculateHistogram = (transactions: Transaction[]): HistogramBucket[] => {
    const buckets: HistogramBucket[] = [
        { range: '<€10', minValue: 0, maxValue: 10, count: 0, deposits: 0, withdrawals: 0 },
        { range: '€10-€50', minValue: 10, maxValue: 50, count: 0, deposits: 0, withdrawals: 0 },
        { range: '€50-€100', minValue: 50, maxValue: 100, count: 0, deposits: 0, withdrawals: 0 },
        { range: '€100-€200', minValue: 100, maxValue: 200, count: 0, deposits: 0, withdrawals: 0 },
        { range: '€200+', minValue: 200, maxValue: Infinity, count: 0, deposits: 0, withdrawals: 0 }
    ];

    transactions.forEach(t => {
        const bucket = buckets.find(b => t.value >= b.minValue && t.value < b.maxValue);
        if (bucket) {
            bucket.count++;
            if (t.type === 'Deposit') {
                bucket.deposits++;
            } else {
                bucket.withdrawals++;
            }
        }
    });

    return buckets.filter(b => b.count > 0);
};

/**
 * Calculate Month-over-Month changes
 */
const calculateMoMChanges = (monthlyData: MonthlyData[]): MoMChange[] => {
    const changes: MoMChange[] = [];

    for (let i = 1; i < monthlyData.length; i++) {
        const previous = monthlyData[i - 1];
        const current = monthlyData[i];
        const change = previous.net !== 0
            ? ((current.net - previous.net) / Math.abs(previous.net)) * 100
            : 0;

        changes.push({
            month: current.month,
            change,
            previousValue: previous.net,
            currentValue: current.net
        });
    }

    return changes;
};

/**
 * Generate automated insights with improved messages
 */
const generateInsights = (
    transactions: Transaction[],
    monthlyData: MonthlyData[],
    roi: number,
    winRate: number,
    largestTransaction: LargestTransaction | null
): string[] => {
    const insights: string[] = [];

    // 1. Transaction frequency
    if (transactions.length > 1) {
        const firstDate = transactions[0].rawDate.getTime();
        const lastDate = transactions[transactions.length - 1].rawDate.getTime();
        const daysDiff = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
        const avgDays = Math.round(daysDiff / transactions.length);
        insights.push(`Em média, fazes uma transação a cada ${avgDays} dias`);
    }

    // 2. Largest transaction
    if (largestTransaction) {
        const typeText = largestTransaction.type === 'Deposit' ? 'depósito' : 'levantamento';
        insights.push(`A tua maior transação foi um ${typeText} de ${formatCurrency(largestTransaction.value)}`);
    }

    // 3. Most active period
    const transactionsByMonth: Record<string, number> = {};
    transactions.forEach(t => {
        const month = t.date.substring(0, 7);
        transactionsByMonth[month] = (transactionsByMonth[month] || 0) + 1;
    });
    const mostActive = Object.entries(transactionsByMonth)
        .reduce((max, [month, count]) => count > max.count ? { month, count } : max, { month: '', count: 0 });
    if (mostActive.month) {
        const monthName = new Date(mostActive.month + '-01').toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
        insights.push(`O teu período mais ativo foi ${monthName} com ${mostActive.count} transações`);
    }

    // 4. ROI with context
    if (roi > 0) {
        insights.push(`Tens um ROI positivo de ${roi.toFixed(1)}% - continua assim! 📈`);
    } else if (roi < 0) {
        insights.push(`ROI negativo de ${Math.abs(roi).toFixed(1)}% - considera rever a tua estratégia`);
    } else {
        insights.push(`Estás no break-even (ROI 0%) - nem ganhas nem perdes`);
    }

    // 5. Win rate
    if (winRate >= 50) {
        insights.push(`Excelente! ${winRate.toFixed(0)}% dos teus meses foram lucrativos`);
    } else if (winRate > 0) {
        insights.push(`Apenas ${winRate.toFixed(0)}% dos meses foram lucrativos - há margem para melhorar`);
    }

    // 6. Activity pattern
    const deposits = transactions.filter(t => t.type === 'Deposit');
    const withdrawals = transactions.filter(t => t.type === 'Withdrawal');
    const ratio = deposits.length > 0 ? withdrawals.length / deposits.length : 0;
    if (ratio > 1.5) {
        insights.push(`Fazes ${ratio.toFixed(1)}× mais levantamentos que depósitos - boa gestão! 💰`);
    } else if (ratio < 0.5) {
        insights.push(`Fazes mais depósitos que levantamentos - atenção à gestão de bankroll`);
    }

    // 7. Consistency
    if (monthlyData.length >= 3) {
        const avg = monthlyData.reduce((sum, m) => sum + m.net, 0) / monthlyData.length;
        const stdDev = Math.sqrt(
            monthlyData.reduce((sum, m) => sum + Math.pow(m.net - avg, 2), 0) / monthlyData.length
        );
        const volatility = Math.abs(avg) > 0 ? (stdDev / Math.abs(avg)) * 100 : 0;

        if (volatility < 50) {
            insights.push(`Os teus resultados mensais são bastante consistentes (volatilidade baixa)`);
        } else if (volatility > 150) {
            insights.push(`Alta volatilidade nos resultados - os teus meses variam muito`);
        }
    }

    // 12. Average Transaction Value (New 8th Insight)
    if (transactions.length > 0) {
        const totalValue = transactions.reduce((sum, t) => sum + t.value, 0);
        const avgValue = totalValue / transactions.length;
        insights.push(`O valor médio das tuas transações é de ${formatCurrency(avgValue)}`);
    }

    return insights;
};

/**
 * Calculate statistics from filtered transactions
 */
export const calculateStatistics = (transactions: Transaction[]): Statistics => {
    const deposits = transactions.filter(t => t.type === 'Deposit');
    const withdrawals = transactions.filter(t => t.type === 'Withdrawal');

    const totalDeposited = deposits.reduce((acc, t) => acc + t.value, 0);
    const totalWithdrawn = withdrawals.reduce((acc, t) => acc + t.value, 0);
    const netResult = totalWithdrawn - totalDeposited;

    const maxDeposit = deposits.length > 0 ? Math.max(...deposits.map(t => t.value)) : 0;
    const maxWithdrawal = withdrawals.length > 0 ? Math.max(...withdrawals.map(t => t.value)) : 0;

    const avgDeposit = deposits.length > 0 ? totalDeposited / deposits.length : 0;
    const avgWithdrawal = withdrawals.length > 0 ? totalWithdrawn / withdrawals.length : 0;

    // Monthly Stats
    const monthly: Record<string, number> = {};
    transactions.forEach(t => {
        const monthKey = t.date.substring(0, 7);
        if (!monthly[monthKey]) monthly[monthKey] = 0;
        monthly[monthKey] += t.netValue;
    });

    const monthlyArr: MonthlyData[] = Object.entries(monthly).map(([key, val]) => ({
        month: key,
        net: val
    }));
    monthlyArr.sort((a, b) => a.month.localeCompare(b.month));

    const bestMonth = monthlyArr.length > 0
        ? monthlyArr.reduce((prev, current) => (prev.net > current.net) ? prev : current)
        : null;
    const worstMonth = monthlyArr.length > 0
        ? monthlyArr.reduce((prev, current) => (prev.net < current.net) ? prev : current)
        : null;

    // Advanced Analytics

    // 1. ROI
    const roi = totalDeposited > 0
        ? ((totalWithdrawn - totalDeposited) / totalDeposited) * 100
        : 0;

    // 2. Win Rate
    const profitableMonths = monthlyArr.filter(m => m.net > 0).length;
    const winRate = monthlyArr.length > 0
        ? (profitableMonths / monthlyArr.length) * 100
        : 0;

    // 3. Trend Analysis (Last 3 Months vs Previous 3 Months)
    const last3Months = monthlyArr.slice(-3);
    const previous3Months = monthlyArr.slice(-6, -3);

    const last3MonthsAvg = last3Months.length > 0
        ? last3Months.reduce((sum, m) => sum + m.net, 0) / last3Months.length
        : 0;

    const overallAvg = monthlyArr.length > 0
        ? monthlyArr.reduce((sum, m) => sum + m.net, 0) / monthlyArr.length
        : 0;

    const previous3MonthsAvg = previous3Months.length > 0
        ? previous3Months.reduce((sum, m) => sum + m.net, 0) / previous3Months.length
        : (monthlyArr.length > 3 ? overallAvg : 0); // Fallback if not enough history

    const trendValue = previous3MonthsAvg !== 0
        ? ((last3MonthsAvg - previous3MonthsAvg) / Math.abs(previous3MonthsAvg)) * 100
        : 0;

    const trend: 'improving' | 'declining' | 'stable' =
        trendValue > 5 ? 'improving'
            : trendValue < -5 ? 'declining'
                : 'stable';

    // 4. MoM Changes
    const momChanges = calculateMoMChanges(monthlyArr);

    // 5. Histogram
    const histogram = calculateHistogram(transactions);

    // 6. Distribution Data
    const distributionData = [
        { name: 'Depósitos', value: totalDeposited, count: deposits.length },
        { name: 'Levantamentos', value: totalWithdrawn, count: withdrawals.length }
    ];

    // 7. Average days between transactions
    let avgDaysBetweenTransactions = 0;
    if (transactions.length > 1) {
        const firstDate = transactions[0].rawDate.getTime();
        const lastDate = transactions[transactions.length - 1].rawDate.getTime();
        const daysDiff = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
        avgDaysBetweenTransactions = daysDiff / (transactions.length - 1);
    }

    // 8. Largest transaction
    let largestTransaction: LargestTransaction | null = null;
    const allTransactions = [...deposits, ...withdrawals];
    if (allTransactions.length > 0) {
        const largest = allTransactions.reduce((prev, current) =>
            current.value > prev.value ? current : prev
        );
        largestTransaction = {
            type: largest.type,
            value: largest.value,
            date: largest.date
        };
    }

    // 9. Most active month
    const transactionsByMonth: Record<string, number> = {};
    transactions.forEach(t => {
        const month = t.date.substring(0, 7);
        transactionsByMonth[month] = (transactionsByMonth[month] || 0) + 1;
    });
    const mostActiveEntry = Object.entries(transactionsByMonth)
        .reduce((max, [month, count]) =>
            count > max.count ? { month, count } : max,
            { month: '', count: 0 }
        );
    const mostActiveMonth = mostActiveEntry.month;

    // 10. Generate insights
    const insights = generateInsights(
        transactions,
        monthlyArr,
        roi,
        winRate,
        largestTransaction
    );

    // 11. Peak & Valley Moments
    let peakMoment: { date: string; balance: number } | null = null;
    let valleyMoment: { date: string; balance: number } | null = null;

    if (transactions.length > 0) {
        const peak = transactions.reduce((prev, current) =>
            current.cumulative > prev.cumulative ? current : prev
        );
        peakMoment = {
            date: peak.date,
            balance: peak.cumulative
        };

        const valley = transactions.reduce((prev, current) =>
            current.cumulative < prev.cumulative ? current : prev
        );
        valleyMoment = {
            date: valley.date,
            balance: valley.cumulative
        };
    }

    return {
        totalDeposited,
        totalWithdrawn,
        netResult,
        depositCount: deposits.length,
        withdrawalCount: withdrawals.length,
        maxDeposit,
        maxWithdrawal,
        avgDeposit,
        avgWithdrawal,
        monthlyData: monthlyArr,
        bestMonth,
        worstMonth,

        // Advanced Analytics
        roi,
        winRate,
        profitableMonths,
        trend,
        trendValue,
        last3MonthsAvg,
        overallAvg,
        momChanges,
        histogram,
        insights,
        avgDaysBetweenTransactions,
        largestTransaction,
        mostActiveMonth,
        distributionData,

        // Peak & Valley
        peakMoment,
        valleyMoment
    };
};

/**
 * Filter transactions by type and date range
 */
export const filterTransactions = (
    transactions: Transaction[],
    filterType: string,
    startDate: string,
    endDate: string
): Transaction[] => {
    const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const end = endDate ? new Date(`${endDate}T23:59:59.999`) : null;

    if ((start && Number.isNaN(start.getTime())) || (end && Number.isNaN(end.getTime()))) {
        return [];
    }

    return transactions.filter(t => {
        const matchesType = filterType === 'All' || t.type === filterType;
        const matchesStart = start ? t.rawDate >= start : true;
        const matchesEnd = end ? t.rawDate <= end : true;
        return matchesType && matchesStart && matchesEnd;
    });
};

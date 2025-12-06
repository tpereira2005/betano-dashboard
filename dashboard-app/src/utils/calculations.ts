import {
    Transaction,
    RawTransaction,
    Statistics,
    MonthlyData,
    MoMChange,
    HistogramBucket,
    LargestTransaction,
    RichInsight
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
 * Generate rich automated insights with structured data
 */
const generateInsights = (
    transactions: Transaction[],
    monthlyData: MonthlyData[],
    roi: number,
    winRate: number,
    largestTransaction: LargestTransaction | null,
    trendValue: number
): RichInsight[] => {
    const insights: RichInsight[] = [];
    let priority = 0;

    // ===== PERFORMANCE INSIGHTS =====

    // 1. ROI
    if (roi !== 0) {
        const isPositive = roi > 0;
        insights.push({
            id: 'roi',
            category: 'performance',
            type: isPositive ? 'success' : 'danger',
            icon: isPositive ? 'TrendingUp' : 'TrendingDown',
            title: 'Retorno (ROI)',
            value: `${isPositive ? '+' : ''}${roi.toFixed(1)}%`,
            description: isPositive
                ? 'O teu investimento está a gerar lucro'
                : 'Estás a perder dinheiro em relação ao investido',
            trend: isPositive ? 'up' : 'down',
            priority: priority++
        });
    }

    // 2. Win Rate
    if (monthlyData.length > 0) {
        const profitableMonths = monthlyData.filter(m => m.net > 0).length;
        const isGood = winRate >= 50;
        insights.push({
            id: 'winrate',
            category: 'performance',
            type: isGood ? 'success' : 'warning',
            icon: 'Target',
            title: 'Taxa de Sucesso',
            value: `${winRate.toFixed(0)}%`,
            description: `${profitableMonths} de ${monthlyData.length} meses foram lucrativos`,
            trend: isGood ? 'up' : 'down',
            priority: priority++
        });
    }

    // 3. Net Result Trend
    if (trendValue !== 0) {
        const isImproving = trendValue > 5;
        const isDeclining = trendValue < -5;
        if (isImproving || isDeclining) {
            insights.push({
                id: 'trend',
                category: 'performance',
                type: isImproving ? 'success' : 'danger',
                icon: isImproving ? 'ArrowUpRight' : 'ArrowDownRight',
                title: 'Tendência Atual',
                value: `${trendValue > 0 ? '+' : ''}${trendValue.toFixed(0)}%`,
                description: isImproving
                    ? 'Últimos 3 meses acima da média anterior'
                    : 'Últimos 3 meses abaixo da média anterior',
                trend: isImproving ? 'up' : 'down',
                priority: priority++
            });
        }
    }

    // ===== PATTERN INSIGHTS =====

    // 4. Transaction Frequency
    if (transactions.length > 1) {
        const firstDate = transactions[0].rawDate.getTime();
        const lastDate = transactions[transactions.length - 1].rawDate.getTime();
        const daysDiff = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
        const avgDays = Math.round(daysDiff / transactions.length);
        insights.push({
            id: 'frequency',
            category: 'pattern',
            type: 'info',
            icon: 'Calendar',
            title: 'Frequência',
            value: `${avgDays} dias`,
            description: 'Intervalo médio entre transações',
            priority: priority++
        });
    }

    // 5. Most Active Period
    const transactionsByMonth: Record<string, number> = {};
    transactions.forEach(t => {
        const month = t.date.substring(0, 7);
        transactionsByMonth[month] = (transactionsByMonth[month] || 0) + 1;
    });
    const mostActive = Object.entries(transactionsByMonth)
        .reduce((max, [month, count]) => count > max.count ? { month, count } : max, { month: '', count: 0 });
    if (mostActive.month) {
        const monthName = new Date(mostActive.month + '-01').toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' });
        insights.push({
            id: 'active-period',
            category: 'pattern',
            type: 'info',
            icon: 'Activity',
            title: 'Período Mais Ativo',
            value: monthName,
            description: `${mostActive.count} transações neste mês`,
            priority: priority++
        });
    }

    // 6. Best Streak (consecutive positive months)
    if (monthlyData.length >= 2) {
        let currentStreak = 0;
        let bestStreak = 0;
        monthlyData.forEach(m => {
            if (m.net > 0) {
                currentStreak++;
                bestStreak = Math.max(bestStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        });
        if (bestStreak >= 2) {
            insights.push({
                id: 'streak',
                category: 'pattern',
                type: 'success',
                icon: 'Flame',
                title: 'Melhor Sequência',
                value: `${bestStreak} meses`,
                description: 'Meses positivos consecutivos',
                trend: 'up',
                priority: priority++
            });
        }
    }

    // 7. Largest Transaction
    if (largestTransaction) {
        const typeText = largestTransaction.type === 'Deposit' ? 'depósito' : 'levantamento';
        insights.push({
            id: 'largest',
            category: 'pattern',
            type: largestTransaction.type === 'Withdrawal' ? 'success' : 'info',
            icon: 'DollarSign',
            title: 'Maior Transação',
            value: formatCurrency(largestTransaction.value),
            description: `O teu maior ${typeText}`,
            priority: priority++
        });
    }

    // ===== RECOMMENDATION INSIGHTS =====

    // 8. Deposit/Withdrawal Ratio
    const deposits = transactions.filter(t => t.type === 'Deposit');
    const withdrawals = transactions.filter(t => t.type === 'Withdrawal');
    const ratio = deposits.length > 0 ? withdrawals.length / deposits.length : 0;

    if (ratio > 1.5) {
        insights.push({
            id: 'ratio-good',
            category: 'recommendation',
            type: 'success',
            icon: 'ThumbsUp',
            title: 'Boa Gestão',
            value: `${ratio.toFixed(1)}×`,
            description: 'Mais levantamentos que depósitos',
            trend: 'up',
            priority: priority++
        });
    } else if (ratio < 0.5 && deposits.length > 2) {
        insights.push({
            id: 'ratio-warning',
            category: 'recommendation',
            type: 'warning',
            icon: 'AlertTriangle',
            title: 'Atenção',
            description: 'Fazes mais depósitos que levantamentos - revê a gestão de bankroll',
            trend: 'down',
            priority: priority++
        });
    }

    // 9. Volatility Warning
    if (monthlyData.length >= 3) {
        const avg = monthlyData.reduce((sum, m) => sum + m.net, 0) / monthlyData.length;
        const stdDev = Math.sqrt(
            monthlyData.reduce((sum, m) => sum + Math.pow(m.net - avg, 2), 0) / monthlyData.length
        );
        const volatility = Math.abs(avg) > 0 ? (stdDev / Math.abs(avg)) * 100 : 0;

        if (volatility > 150) {
            insights.push({
                id: 'volatility',
                category: 'recommendation',
                type: 'warning',
                icon: 'TrendingUp',
                title: 'Alta Volatilidade',
                description: 'Os teus resultados mensais variam muito - considera uma estratégia mais consistente',
                priority: priority++
            });
        }
    }

    // Sort by priority and return
    return insights.sort((a, b) => a.priority - b.priority);
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
        largestTransaction,
        trendValue
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

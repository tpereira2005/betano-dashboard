import React from 'react';
import {
    ArrowUpCircle,
    ArrowDownCircle,
    Euro,
    Activity,
    TrendingDown,
    TrendingUp,
    Calendar,
    Percent,
    Target,
    ArrowDownToLine,
    ArrowUpFromLine,
    Trophy,
    Anchor
} from 'lucide-react';
import { KPISectionProps } from '@/types';
import { StatCard } from '@/components/common/StatCard';
import { formatCurrency } from '@/utils/formatters';

export const KPISection: React.FC<KPISectionProps> = ({ stats }) => {
    // Trend arrow based on trend direction
    const getTrendIcon = () => {
        if (stats.trend === 'improving') return TrendingUp;
        if (stats.trend === 'declining') return TrendingDown;
        return Activity;
    };

    const getTrendType = () => {
        if (stats.trend === 'improving') return 'success';
        if (stats.trend === 'declining') return 'danger';
        return 'neutral';
    };

    // Enhanced trend text with percentage and arrow
    const getTrendSubValue = () => {
        const arrow = stats.trend === 'improving' ? '↑' : stats.trend === 'declining' ? '↓' : '→';
        const sign = stats.trendValue >= 0 ? '+' : '';
        const percentage = `${sign}${stats.trendValue.toFixed(1)}%`;

        if (stats.trend === 'improving') {
            return `${arrow} ${percentage} vs anterior`;
        } else if (stats.trend === 'declining') {
            return `${arrow} ${percentage} vs anterior`;
        }
        return `${arrow} Estável vs anterior`;
    };

    return (
        <>
            {/* KPI Cards Row 1: Main Totals (Hero Cards) */}
            <div className="grid-3" style={{ marginBottom: '32px' }}>
                <StatCard
                    title="Resultado Líquido"
                    value={formatCurrency(stats.netResult)}
                    subValue={stats.netResult >= 0 ? "Lucro Global" : "Prejuízo Global"}
                    icon={Euro}
                    type={stats.netResult >= 0 ? 'success' : 'danger'}
                />
                <StatCard
                    title="Total Depositado"
                    value={formatCurrency(stats.totalDeposited)}
                    subValue={`${stats.depositCount} depósitos`}
                    icon={ArrowDownCircle}
                    type="danger"
                />
                <StatCard
                    title="Total Levantado"
                    value={formatCurrency(stats.totalWithdrawn)}
                    subValue={`${stats.withdrawalCount} levantamentos`}
                    icon={ArrowUpCircle}
                    type="success"
                />
            </div>

            {/* Secondary Metrics (Compact Grid) */}
            <div className="grid-compact">
                {/* Volume */}
                <StatCard
                    title="Volume Total"
                    value={formatCurrency(stats.totalDeposited + stats.totalWithdrawn)}
                    subValue={`${stats.depositCount + stats.withdrawalCount} transações`}
                    icon={Activity}
                    variant="compact"
                />

                {/* Averages */}
                <StatCard
                    title="Média Depósito"
                    value={formatCurrency(stats.avgDeposit)}
                    subValue={`Máx: ${formatCurrency(stats.maxDeposit)}`}
                    icon={ArrowDownToLine}
                    variant="compact"
                />
                <StatCard
                    title="Média Levantamento"
                    value={formatCurrency(stats.avgWithdrawal)}
                    subValue={`Máx: ${formatCurrency(stats.maxWithdrawal)}`}
                    icon={ArrowUpFromLine}
                    variant="compact"
                />

                {/* Best/Worst Month */}
                <StatCard
                    title="Melhor Mês"
                    value={stats.bestMonth ? formatCurrency(stats.bestMonth.net) : 'N/A'}
                    subValue={stats.bestMonth ? stats.bestMonth.month : '-'}
                    icon={Calendar}
                    type="success"
                    variant="compact"
                />
                <StatCard
                    title="Pior Mês"
                    value={stats.worstMonth ? formatCurrency(stats.worstMonth.net) : 'N/A'}
                    subValue={stats.worstMonth ? stats.worstMonth.month : '-'}
                    icon={Calendar}
                    type="danger"
                    variant="compact"
                />

                {/* Advanced Analytics */}
                <StatCard
                    title="ROI"
                    value={`${stats.roi.toFixed(1)}%`}
                    subValue={stats.roi >= 0 ? "Retorno Positivo" : "Retorno Negativo"}
                    icon={Percent}
                    type={stats.roi >= 0 ? 'success' : 'danger'}
                    variant="compact"
                />
                <StatCard
                    title="Win Rate"
                    value={`${stats.winRate.toFixed(0)}%`}
                    subValue={`${stats.profitableMonths} de ${stats.monthlyData.length} meses`}
                    icon={Target}
                    type={stats.winRate >= 50 ? 'success' : 'danger'}
                    variant="compact"
                />
                <StatCard
                    title="Tendência (3 Meses)"
                    value={formatCurrency(stats.last3MonthsAvg)}
                    subValue={getTrendSubValue()}
                    icon={getTrendIcon()}
                    type={getTrendType()}
                    variant="compact"
                />

                {/* Peak & Valley */}
                <StatCard
                    title="Melhor Momento"
                    value={stats.peakMoment ? formatCurrency(stats.peakMoment.balance) : 'N/A'}
                    subValue={stats.peakMoment ? stats.peakMoment.date : '-'}
                    icon={Trophy}
                    type="success"
                    variant="compact"
                />
                <StatCard
                    title="Pior Momento"
                    value={stats.valleyMoment ? formatCurrency(stats.valleyMoment.balance) : 'N/A'}
                    subValue={stats.valleyMoment ? stats.valleyMoment.date : '-'}
                    icon={Anchor}
                    type="danger"
                    variant="compact"
                />
            </div>
        </>
    );
};

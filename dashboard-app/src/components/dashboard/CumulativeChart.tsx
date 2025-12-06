import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { Transaction } from '@/types';
import { CustomTooltip } from '@/components/common/CustomTooltip';
import { ChartWrapper } from '@/components/common/ChartWrapper';

interface CumulativeChartProps {
    data: Transaction[];
}

export const CumulativeChart: React.FC<CumulativeChartProps> = React.memo(({ data }) => {
    // Calculate gradient offset for dynamic coloring
    const calculateGradientOffset = (): number => {
        if (!data || data.length === 0) return 0;

        const max = Math.max(...data.map(d => d.cumulative));
        const min = Math.min(...data.map(d => d.cumulative));

        if (max <= 0) return 0;
        if (min >= 0) return 1;
        return max / (max - min);
    };

    const renderGradient = () => {
        if (!data || data.length === 0) return null;

        const max = Math.max(...data.map(d => d.cumulative));
        const min = Math.min(...data.map(d => d.cumulative));

        // All negative
        if (max <= 0) {
            return (
                <>
                    <defs>
                        <linearGradient id="splitColorRed" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FF3D00" stopOpacity={1} />
                            <stop offset="100%" stopColor="#FF3D00" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="splitFillRed" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FF3D00" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="#FF3D00" stopOpacity={0.2} />
                        </linearGradient>
                    </defs>
                    <Area
                        type="monotone"
                        dataKey="cumulative"
                        stroke="url(#splitColorRed)"
                        fill="url(#splitFillRed)"
                        strokeWidth={2}
                        name="Saldo Acumulado"
                    />
                </>
            );
        }

        // All positive
        if (min >= 0) {
            return (
                <>
                    <defs>
                        <linearGradient id="splitColorGreen" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                            <stop offset="100%" stopColor="#10B981" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="splitFillGreen" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="#10B981" stopOpacity={0.2} />
                        </linearGradient>
                    </defs>
                    <Area
                        type="monotone"
                        dataKey="cumulative"
                        stroke="url(#splitColorGreen)"
                        fill="url(#splitFillGreen)"
                        strokeWidth={2}
                        name="Saldo Acumulado"
                    />
                </>
            );
        }

        // Mixed positive and negative
        const off = calculateGradientOffset();
        return (
            <>
                <defs>
                    <linearGradient id="splitColorDynamic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset={off} stopColor="#10B981" stopOpacity={1} />
                        <stop offset={off} stopColor="#EF4444" stopOpacity={1} />
                    </linearGradient>
                    <linearGradient id="splitFillDynamic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset={off} stopColor="#10B981" stopOpacity={0.2} />
                        <stop offset={off} stopColor="#EF4444" stopOpacity={0.2} />
                    </linearGradient>
                </defs>
                <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke="url(#splitColorDynamic)"
                    fill="url(#splitFillDynamic)"
                    strokeWidth={2}
                    name="Saldo Acumulado"
                />
            </>
        );
    };

    return (
        <ChartWrapper
            title="Evolução do Saldo (Cumulativo)"
            chartId="chart-cumulative"
            className="full-width-chart"
            ariaLabel="Gráfico da evolução do saldo acumulado ao longo do tempo"
        >
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis
                        dataKey="date"
                        minTickGap={50}
                        tickFormatter={(str) => str.substring(0, 7)}
                        stroke="#999"
                        fontSize={12}
                    />
                    <YAxis stroke="#999" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} trigger="hover" />
                    <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                    {renderGradient()}
                </AreaChart>
            </ResponsiveContainer>
        </ChartWrapper>
    );
});

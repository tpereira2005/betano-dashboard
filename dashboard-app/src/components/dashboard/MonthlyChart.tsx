import React from 'react';
import {
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { MonthlyData } from '@/types';
import { CustomTooltip } from '@/components/common/CustomTooltip';
import { ChartWrapper } from '@/components/common/ChartWrapper';

interface MonthlyChartProps {
    data: MonthlyData[];
}

export const MonthlyChart: React.FC<MonthlyChartProps> = React.memo(({ data }) => {
    return (
        <ChartWrapper
            title="Resultado Mensal"
            chartId="chart-monthly"
            className="full-width-chart"
            height={350}
            ariaLabel="Gráfico de barras mostrando o resultado líquido mensal"
        >
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="month" stroke="#999" fontSize={12} />
                    <YAxis stroke="#999" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={0} stroke="#666" />
                    <Bar dataKey="net" name="Resultado Líquido" radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.net >= 0 ? '#10B981' : '#EF4444'}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartWrapper>
    );
});

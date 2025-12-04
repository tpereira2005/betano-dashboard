import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface DistributionChartProps {
    data: Array<{ name: string; value: number; count: number }>;
}

const COLORS = {
    'Depósitos': '#EF4444', // Red for deposits (money going out)
    'Levantamentos': '#10B981' // Green for withdrawals (money coming in)
};

export const DistributionChart: React.FC<DistributionChartProps> = React.memo(({ data }) => {
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="card" style={{ padding: '12px', minWidth: '200px' }}>
                    <p style={{ fontWeight: 600, marginBottom: 8, color: payload[0].fill }}>
                        {data.name}
                    </p>
                    <p style={{ fontSize: '0.9rem', margin: '4px 0' }}>
                        <strong>Total:</strong> {formatCurrency(data.value)}
                    </p>
                    <p style={{ fontSize: '0.9rem', margin: '4px 0' }}>
                        <strong>Transações:</strong> {data.count}
                    </p>
                    <p style={{ fontSize: '0.9rem', margin: '4px 0' }}>
                        <strong>Média:</strong> {formatCurrency(data.value / data.count)}
                    </p>
                </div>
            );
        }
        return null;
    };

    const renderLabel = (entry: any) => {
        const percent = ((entry.value / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1);
        return `${percent}%`;
    };

    return (
        <div className="card" aria-label="Gráfico circular mostrando a distribuição entre depósitos e levantamentos">
            <div className="section-title">
                {data[0]?.name === 'Depósitos' && <TrendingDown size={20} />}
                {data[1]?.name === 'Levantamentos' && <TrendingUp size={20} />}
                Distribuição de Transações
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px' }}>
                {data.map((item) => (
                    <div key={item.name} style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--color-text-secondary)',
                            textTransform: 'uppercase',
                            marginBottom: '4px',
                            fontWeight: 600
                        }}>
                            {item.name}
                        </div>
                        <div style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: COLORS[item.name as keyof typeof COLORS]
                        }}>
                            {formatCurrency(item.value)}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                            {item.count} transações
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

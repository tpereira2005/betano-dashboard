import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart2 } from 'lucide-react';
import { HistogramBucket } from '@/types';

interface HistogramChartProps {
    data: HistogramBucket[];
}

const COLORS = {
    deposits: '#EF4444',
    withdrawals: '#10B981'
};

export const HistogramChart: React.FC<HistogramChartProps> = React.memo(({ data }) => {
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="card" style={{ padding: '12px', minWidth: '180px' }}>
                    <p style={{ fontWeight: 600, marginBottom: 8 }}>
                        {data.range}
                    </p>
                    <p style={{ fontSize: '0.9rem', margin: '4px 0' }}>
                        <strong>Total:</strong> {data.count} transações
                    </p>
                    <p style={{ fontSize: '0.9rem', margin: '4px 0', color: COLORS.deposits }}>
                        <strong>Depósitos:</strong> {data.deposits}
                    </p>
                    <p style={{ fontSize: '0.9rem', margin: '4px 0', color: COLORS.withdrawals }}>
                        <strong>Levantamentos:</strong> {data.withdrawals}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="card" aria-label="Histograma mostrando a distribuição de valores por faixa">
            <div className="section-title">
                <BarChart2 size={20} />
                Distribuição de Valores
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="range"
                        tick={{ fontSize: 12 }}
                        stroke="#9CA3AF"
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="#9CA3AF"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>

            <div style={{ marginTop: '16px', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                <p style={{ margin: 0 }}>
                    📊 Mostra a frequência de transações por faixa de valor
                </p>
            </div>
        </div>
    );
});

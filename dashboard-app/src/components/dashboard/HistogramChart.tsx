import React, { useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart2, Camera } from 'lucide-react';
import { HistogramBucket } from '@/types';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

interface HistogramChartProps {
    data: HistogramBucket[];
}

const COLORS = {
    deposits: '#EF4444',
    withdrawals: '#10B981'
};

export const HistogramChart: React.FC<HistogramChartProps> = React.memo(({ data }) => {
    const chartRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        if (!chartRef.current) return;
        try {
            toast.loading('A exportar...', { id: 'chart-export' });
            const canvas = await html2canvas(chartRef.current, {
                backgroundColor: '#FFFFFF',
                scale: 2,
                logging: false
            });
            const link = document.createElement('a');
            link.download = `chart-histogram-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            toast.success('Gráfico exportado!', { id: 'chart-export' });
        } catch {
            toast.error('Erro ao exportar', { id: 'chart-export' });
        }
    };

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
        <div ref={chartRef} id="chart-histogram" className="card" aria-label="Histograma mostrando a distribuição de valores por faixa">
            <div className="chart-header">
                <div className="section-title" style={{ marginBottom: 0 }}>
                    <BarChart2 size={20} color="#FF3D00" />
                    Distribuição de Valores
                </div>
                <button
                    onClick={handleDownload}
                    className="btn btn-outline btn-icon chart-download-btn"
                    title="Baixar este gráfico"
                >
                    <Camera size={16} />
                </button>
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

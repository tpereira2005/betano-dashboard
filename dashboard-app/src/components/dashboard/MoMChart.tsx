import React, { useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity, Camera } from 'lucide-react';
import { MoMChange } from '@/types';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

interface MoMChartProps {
    data: MoMChange[];
}

export const MoMChart: React.FC<MoMChartProps> = React.memo(({ data }) => {
    const chartRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        if (!chartRef.current) return;
        try {
            toast.loading('A exportar...', { id: 'chart-export' });

            chartRef.current.classList.add('exporting');

            const canvas = await html2canvas(chartRef.current, {
                backgroundColor: '#FFFFFF',
                scale: 2,
                logging: false,
                windowWidth: 1600,
                ignoreElements: (element) => {
                    return element.classList.contains('chart-header-buttons');
                }
            });

            chartRef.current.classList.remove('exporting');

            const link = document.createElement('a');
            link.download = `chart-mom-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            toast.success('Gráfico exportado!', { id: 'chart-export' });
        } catch {
            if (chartRef.current) {
                chartRef.current.classList.remove('exporting');
            }
            toast.error('Erro ao exportar', { id: 'chart-export' });
        }
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const isPositive = data.change > 0;
            return (
                <div className="card" style={{ padding: '12px', minWidth: '200px' }}>
                    <p style={{ fontWeight: 600, marginBottom: 8 }}>
                        {data.month}
                    </p>
                    <p style={{
                        fontSize: '1.2rem',
                        margin: '8px 0',
                        color: isPositive ? '#10B981' : '#EF4444',
                        fontWeight: 700
                    }}>
                        {isPositive ? '↗️' : '↘️'} {data.change.toFixed(1)}%
                    </p>
                    <p style={{ fontSize: '0.85rem', margin: '4px 0', color: '#6B7280' }}>
                        Mês anterior: €{data.previousValue.toFixed(2)}
                    </p>
                    <p style={{ fontSize: '0.85rem', margin: '4px 0', color: '#6B7280' }}>
                        Mês atual: €{data.currentValue.toFixed(2)}
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomDot = (props: any) => {
        const { cx, cy, payload } = props;
        const isPositive = payload.change > 0;
        return (
            <circle
                cx={cx}
                cy={cy}
                r={4}
                fill={isPositive ? '#10B981' : '#EF4444'}
                stroke="#fff"
                strokeWidth={2}
            />
        );
    };

    return (
        <div ref={chartRef} id="chart-mom" className="card" aria-label="Gráfico de variação percentual mês a mês">
            <div
                className="chart-header"
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                }}
            >
                <div className="section-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={20} color="#FF3D00" />
                    Variação Mês a Mês
                </div>
                <button
                    onClick={handleDownload}
                    className="btn btn-outline btn-icon"
                    title="Baixar este gráfico"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        padding: 0,
                        borderRadius: '8px'
                    }}
                >
                    <Camera size={16} />
                </button>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                        stroke="#9CA3AF"
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="#9CA3AF"
                        tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip content={<CustomTooltip />} trigger="hover" />
                    <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="3 3" />
                    <Line
                        type="monotone"
                        dataKey="change"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={<CustomDot />}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
});

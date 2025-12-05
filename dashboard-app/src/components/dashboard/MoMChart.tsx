import React, { useRef, useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity, Camera, Maximize2, X } from 'lucide-react';
import { MoMChange } from '@/types';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

interface MoMChartProps {
    data: MoMChange[];
}

export const MoMChart: React.FC<MoMChartProps> = React.memo(({ data }) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Check if mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Handle body scroll when fullscreen
    useEffect(() => {
        if (isFullscreen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isFullscreen]);

    const handleDownload = async () => {
        if (!chartRef.current) return;
        try {
            toast.loading('A exportar...', { id: 'chart-export' });

            // Add exporting class
            chartRef.current.classList.add('exporting');

            const canvas = await html2canvas(chartRef.current, {
                backgroundColor: '#FFFFFF',
                scale: 2,
                logging: false,
                windowWidth: 1600, // Force desktop width
                ignoreElements: (element) => {
                    return element.classList.contains('chart-header-buttons') ||
                        element.classList.contains('chart-fullscreen-overlay');
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

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
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
                        color: isPositive ? '#00D67D' : '#FF4757',
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
                fill={isPositive ? '#00D67D' : '#FF4757'}
                stroke="#fff"
                strokeWidth={2}
            />
        );
    };

    const ChartContent = () => (
        <ResponsiveContainer width="100%" height={isFullscreen ? "100%" : 300}>
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
                <Tooltip content={<CustomTooltip />} />
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
    );

    if (isFullscreen) {
        return (
            <div className="chart-fullscreen-overlay">
                <div className="chart-fullscreen-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={20} />
                        <h3>Variação Mês a Mês</h3>
                    </div>
                    <button
                        className="btn btn-glass chart-fullscreen-close"
                        onClick={toggleFullscreen}
                        aria-label="Fechar tela cheia"
                    >
                        <X size={24} />
                    </button>
                </div>
                <div className="chart-fullscreen-content">
                    <ChartContent />
                </div>
            </div>
        );
    }

    return (
        <div ref={chartRef} id="chart-mom" className="card" aria-label="Gráfico de variação percentual mês a mês">
            <div className="chart-header">
                <div className="section-title" style={{ marginBottom: 0 }}>
                    <Activity size={20} style={{ color: '#FF3D00' }} />
                    Variação Mês a Mês
                </div>
                <div className="chart-header-buttons">
                    {isMobile && (
                        <button
                            className="btn btn-outline btn-icon chart-fullscreen-btn"
                            onClick={toggleFullscreen}
                            title="Ver em tela cheia"
                        >
                            <Maximize2 size={16} />
                        </button>
                    )}
                    <button
                        onClick={handleDownload}
                        className="btn btn-outline btn-icon chart-download-btn"
                        title="Baixar este gráfico"
                    >
                        <Camera size={16} />
                    </button>
                </div>
            </div>

            <ChartContent />

            <div style={{ marginTop: '16px', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                <p style={{ margin: 0 }}>
                    📈 Variação percentual do resultado entre meses consecutivos
                </p>
            </div>
        </div>
    );
});

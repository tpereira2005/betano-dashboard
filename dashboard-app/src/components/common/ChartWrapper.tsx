import React, { useRef } from 'react';
import { Camera } from 'lucide-react';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

interface ChartWrapperProps {
    title: string;
    chartId: string;
    children: React.ReactNode;
    className?: string;
    ariaLabel?: string;
}

export const ChartWrapper: React.FC<ChartWrapperProps> = ({
    title,
    chartId,
    children,
    className = '',
    ariaLabel
}) => {
    const chartRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        if (!chartRef.current) return;

        try {
            toast.loading('A exportar gráfico...', { id: 'chart-export' });

            const canvas = await html2canvas(chartRef.current, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false
            });

            const link = document.createElement('a');
            link.download = `${chartId}-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            toast.success('Gráfico exportado!', { id: 'chart-export' });
        } catch (error) {
            toast.error('Erro ao exportar gráfico', { id: 'chart-export' });
            console.error('Chart export error:', error);
        }
    };

    return (
        <div
            className={`card chart-card ${className}`}
            ref={chartRef}
            role="img"
            aria-label={ariaLabel || title}
        >
            <div className="chart-header">
                <h3 className="section-title" style={{ marginBottom: 0 }}>{title}</h3>
                <button
                    className="btn btn-outline btn-icon chart-download-btn"
                    onClick={handleDownload}
                    title="Baixar este gráfico"
                    aria-label={`Exportar ${title} como imagem`}
                >
                    <Camera size={16} />
                </button>
            </div>
            <div className="chart-container" style={{ height: '300px' }}>
                {children}
            </div>
        </div>
    );
};

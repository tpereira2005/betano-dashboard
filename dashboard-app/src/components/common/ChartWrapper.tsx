import React, { useRef, useState, useEffect } from 'react';
import { Camera, Maximize2, X } from 'lucide-react';
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
            toast.loading('A exportar gráfico...', { id: 'chart-export' });

            const element = chartRef.current;
            element.classList.add('exporting');

            // Capture the chart as-is with high quality
            const canvas = await html2canvas(element, {
                backgroundColor: '#ffffff',
                scale: 3, // High resolution for quality
                logging: false,
                useCORS: true,
                allowTaint: true,
                ignoreElements: (el) => {
                    return el.classList.contains('chart-header-buttons') ||
                        el.classList.contains('chart-fullscreen-overlay');
                }
            });

            element.classList.remove('exporting');

            const link = document.createElement('a');
            link.download = `${chartId}-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            toast.success('Gráfico exportado!', { id: 'chart-export' });
        } catch (error) {
            if (chartRef.current) {
                chartRef.current.classList.remove('exporting');
            }
            toast.error('Erro ao exportar gráfico', { id: 'chart-export' });
            console.error('Chart export error:', error);
        }
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    // Fullscreen overlay for mobile
    if (isFullscreen) {
        return (
            <div className="chart-fullscreen-overlay">
                <div className="chart-fullscreen-header">
                    <h3>{title}</h3>
                    <button
                        className="btn btn-glass chart-fullscreen-close"
                        onClick={toggleFullscreen}
                        aria-label="Fechar tela cheia"
                    >
                        <X size={24} />
                    </button>
                </div>
                <div className="chart-fullscreen-content">
                    {children}
                </div>
            </div>
        );
    }

    return (
        <div
            className={`card chart-card ${className}`}
            ref={chartRef}
            role="img"
            aria-label={ariaLabel || title}
        >
            <div className="chart-header">
                <h3 className="section-title" style={{ marginBottom: 0 }}>{title}</h3>
                <div className="chart-header-buttons">
                    {isMobile && (
                        <button
                            className="btn btn-outline btn-icon chart-fullscreen-btn"
                            onClick={toggleFullscreen}
                            title="Ver em tela cheia"
                            aria-label={`Ver ${title} em tela cheia`}
                        >
                            <Maximize2 size={16} />
                        </button>
                    )}
                    <button
                        className="btn btn-outline btn-icon chart-download-btn"
                        onClick={handleDownload}
                        title="Baixar este gráfico"
                        aria-label={`Exportar ${title} como imagem`}
                    >
                        <Camera size={16} />
                    </button>
                </div>
            </div>
            <div className="chart-container" style={{ height: '300px' }}>
                {children}
            </div>
        </div>
    );
};

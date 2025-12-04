import React, { useRef, useState, useEffect, cloneElement, isValidElement } from 'react';
import { createRoot } from 'react-dom/client';
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
        try {
            toast.loading('A gerar gráfico HD...', { id: 'chart-export' });

            // Create temporary container with desktop dimensions
            const tempContainer = document.createElement('div');
            tempContainer.style.cssText = `
                position: fixed;
                left: -9999px;
                top: 0;
                width: 1200px;
                background: white;
                padding: 24px;
                border-radius: 16px;
            `;
            document.body.appendChild(tempContainer);

            // Create header
            const header = document.createElement('div');
            header.style.cssText = `
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 16px;
            `;
            header.innerHTML = `
                <div style="width: 4px; height: 24px; background: #FF3D00; border-radius: 2px;"></div>
                <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #1a1a2e;">${title}</h3>
            `;
            tempContainer.appendChild(header);

            // Create chart container with fixed height
            const chartContainer = document.createElement('div');
            chartContainer.style.cssText = 'width: 100%; height: 350px;';
            tempContainer.appendChild(chartContainer);

            // Clone the chart children with new dimensions
            const chartRoot = createRoot(chartContainer);

            // If children is a ResponsiveContainer, we need to render it
            if (isValidElement(children)) {
                chartRoot.render(cloneElement(children as React.ReactElement));
            } else {
                chartRoot.render(<>{children}</>);
            }

            // Wait for chart to fully render (Recharts needs time)
            await new Promise(resolve => setTimeout(resolve, 500));

            // Capture the temporary container
            const canvas = await html2canvas(tempContainer, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true,
            });

            // Cleanup
            chartRoot.unmount();
            document.body.removeChild(tempContainer);

            // Download
            const link = document.createElement('a');
            link.download = `${chartId}-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            toast.success('Gráfico exportado em HD!', { id: 'chart-export' });
        } catch (error) {
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

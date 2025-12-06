import React, { useRef, useState, useEffect, cloneElement, isValidElement } from 'react';
import { createRoot } from 'react-dom/client';
import { Camera, Maximize2, Minimize2 } from 'lucide-react';
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

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const handleDownload = async () => {
        try {
            toast.loading('A gerar gráfico HD...', { id: 'chart-export' });

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

            const chartContainer = document.createElement('div');
            chartContainer.style.cssText = 'width: 100%; height: 400px; overflow: visible;';
            tempContainer.appendChild(chartContainer);

            const chartRoot = createRoot(chartContainer);
            if (isValidElement(children)) {
                chartRoot.render(cloneElement(children as React.ReactElement));
            } else {
                chartRoot.render(<>{children}</>);
            }

            await new Promise(resolve => setTimeout(resolve, 1500));

            const canvas = await html2canvas(tempContainer, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true,
            });

            chartRoot.unmount();
            document.body.removeChild(tempContainer);

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

    const toggleFullscreen = async () => {
        if (!chartRef.current) return;

        try {
            if (!isFullscreen) {
                // Enter fullscreen
                if (chartRef.current.requestFullscreen) {
                    await chartRef.current.requestFullscreen();
                }
            } else {
                // Exit fullscreen
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                }
            }
        } catch (error) {
            console.error('Fullscreen error:', error);
            toast.error('Erro ao entrar em tela cheia');
        }
    };

    return (
        <div
            className={`card chart-card ${className} ${isFullscreen ? 'chart-is-fullscreen' : ''}`}
            ref={chartRef}
            role="img"
            aria-label={ariaLabel || title}
            style={isFullscreen ? {
                background: 'var(--color-bg)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column'
            } : undefined}
        >
            <div
                className="chart-header"
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    flexShrink: 0
                }}
            >
                <h3 className="section-title" style={{ marginBottom: 0 }}>{title}</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {isMobile && (
                        <button
                            className="btn btn-outline btn-icon"
                            onClick={toggleFullscreen}
                            title={isFullscreen ? "Sair de tela cheia" : "Ver em tela cheia"}
                            aria-label={isFullscreen ? "Sair de tela cheia" : `Ver ${title} em tela cheia`}
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
                            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                    )}
                    <button
                        className="btn btn-outline btn-icon"
                        onClick={handleDownload}
                        title="Baixar este gráfico"
                        aria-label={`Exportar ${title} como imagem`}
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
            </div>
            <div
                className="chart-container"
                style={{
                    height: isFullscreen ? 'calc(100% - 60px)' : '300px',
                    flex: isFullscreen ? 1 : undefined
                }}
            >
                {children}
            </div>
        </div>
    );
};

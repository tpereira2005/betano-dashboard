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

// Fullscreen Modal Component (simple overlay)
const FullscreenModal: React.FC<{
    title: string;
    children: React.ReactNode;
    onClose: () => void;
}> = ({ title, children, onClose }) => {
    // Prevent body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'var(--color-bg, #0D0E1A)',
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                backgroundColor: '#0E0F22',
                color: 'white',
                flexShrink: 0
            }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{title}</h3>
                <button
                    onClick={onClose}
                    style={{
                        background: 'rgba(255,255,255,0.15)',
                        border: 'none',
                        padding: '8px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}
                >
                    <X size={24} />
                </button>
            </div>
            {/* Chart content */}
            <div style={{
                flex: 1,
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 0
            }}>
                <div style={{ width: '100%', height: '100%', minHeight: '200px' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export const ChartWrapper: React.FC<ChartWrapperProps> = ({
    title,
    chartId,
    children,
    className = '',
    ariaLabel
}) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const [showFullscreen, setShowFullscreen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
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

    return (
        <>
            <div
                className={`card chart-card ${className}`}
                ref={chartRef}
                role="img"
                aria-label={ariaLabel || title}
            >
                <div
                    className="chart-header"
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px'
                    }}
                >
                    <h3 className="section-title" style={{ marginBottom: 0 }}>{title}</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {isMobile && (
                            <button
                                className="btn btn-outline btn-icon"
                                onClick={() => setShowFullscreen(true)}
                                title="Ver em tela cheia"
                                aria-label={`Ver ${title} em tela cheia`}
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
                                <Maximize2 size={16} />
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
                <div className="chart-container" style={{ height: '300px' }}>
                    {children}
                </div>
            </div>

            {/* Fullscreen Modal */}
            {showFullscreen && (
                <FullscreenModal
                    title={title}
                    onClose={() => setShowFullscreen(false)}
                >
                    {children}
                </FullscreenModal>
            )}
        </>
    );
};

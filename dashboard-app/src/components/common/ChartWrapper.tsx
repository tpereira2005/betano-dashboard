import React, { useRef, cloneElement, isValidElement } from 'react';
import { createRoot } from 'react-dom/client';
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
            <div className="chart-container" style={{ height: '300px' }}>
                {children}
            </div>
        </div>
    );
};

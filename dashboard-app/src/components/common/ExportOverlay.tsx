import React from 'react';
import { FileText, Image } from 'lucide-react';
import './ExportOverlay.css';

interface ExportOverlayProps {
    isVisible: boolean;
    exportType: 'pdf' | 'png' | 'csv';
    progress?: number;
}

/**
 * Premium fullscreen loading overlay shown during export operations.
 * Uses glassmorphism and smooth animations for a premium feel.
 */
export const ExportOverlay: React.FC<ExportOverlayProps> = ({
    isVisible,
    exportType,
    progress
}) => {
    if (!isVisible) return null;

    const getIcon = () => {
        switch (exportType) {
            case 'pdf':
                return <FileText size={48} />;
            case 'png':
                return <Image size={48} />;
            default:
                return <FileText size={48} />;
        }
    };

    const getLabel = () => {
        switch (exportType) {
            case 'pdf':
                return 'A gerar PDF...';
            case 'png':
                return 'A capturar imagem...';
            case 'csv':
                return 'A exportar dados...';
            default:
                return 'A exportar...';
        }
    };

    return (
        <div className="export-overlay" role="dialog" aria-modal="true" aria-label="A exportar">
            <div className="export-overlay-backdrop" />
            <div className="export-overlay-content">
                <div className="export-overlay-card">
                    {/* Animated icon */}
                    <div className="export-overlay-icon">
                        {getIcon()}
                    </div>

                    {/* Label */}
                    <h3 className="export-overlay-title">{getLabel()}</h3>

                    {/* Progress bar (optional) */}
                    {progress !== undefined && (
                        <div className="export-overlay-progress">
                            <div
                                className="export-overlay-progress-bar"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    )}

                    <p className="export-overlay-subtitle">
                        Por favor aguarde um momento...
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ExportOverlay;

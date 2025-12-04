import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, FileText, Image, FileSpreadsheet, ChevronDown } from 'lucide-react';

interface ExportMenuProps {
    onExportPDF: () => void;
    onExportPNG: () => void;
    onExportCSV: () => void;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
    onExportPDF,
    onExportPNG,
    onExportCSV
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (isOpen) setIsOpen(false);
        };
        
        window.addEventListener('scroll', handleScroll, { capture: true });
        window.addEventListener('resize', handleScroll);
        
        return () => {
            window.removeEventListener('scroll', handleScroll, { capture: true });
            window.removeEventListener('resize', handleScroll);
        };
    }, [isOpen]);

    const handleToggle = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setMenuPosition({
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right
            });
        }
        setIsOpen(!isOpen);
    };

    const handleExport = (exportFn: () => void) => {
        exportFn();
        setIsOpen(false);
    };

    const menu = (
        <>
            <div 
                className="dropdown-backdrop" 
                onClick={() => setIsOpen(false)}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: 9998,
                    cursor: 'default'
                }}
            />
            <div
                className="dropdown-menu"
                style={{
                    position: 'fixed',
                    top: `${menuPosition.top}px`,
                    right: `${menuPosition.right}px`,
                    zIndex: 9999,
                    minWidth: '180px'
                }}
            >
                <button
                    className="dropdown-item"
                    onClick={() => handleExport(onExportPDF)}
                >
                    <FileText size={16} />
                    Exportar PDF
                </button>
                <button
                    className="dropdown-item"
                    onClick={() => handleExport(onExportPNG)}
                >
                    <Image size={16} />
                    Exportar PNG
                </button>
                <div className="dropdown-divider" />
                <button
                    className="dropdown-item"
                    onClick={() => handleExport(onExportCSV)}
                >
                    <FileSpreadsheet size={16} />
                    Exportar CSV
                </button>
            </div>
        </>
    );

    return (
        <div className="dropdown-wrapper">
            <button
                ref={buttonRef}
                className="btn btn-glass btn-export"
                onClick={handleToggle}
            >
                <Download size={16} />
                Exportar
                <ChevronDown size={14} className={isOpen ? 'chevron open' : 'chevron'} />
            </button>

            {isOpen && createPortal(menu, document.body)}
        </div>
    );
};

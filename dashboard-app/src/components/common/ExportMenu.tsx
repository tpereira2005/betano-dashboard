import React, { useState, useRef, useEffect } from 'react';
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
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
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

            {isOpen && (
                <>
                    <div className="dropdown-backdrop" onClick={() => setIsOpen(false)} />
                    <div
                        ref={menuRef}
                        className="dropdown-menu"
                        style={{
                            position: 'fixed',
                            top: `${menuPosition.top}px`,
                            right: `${menuPosition.right}px`,
                            zIndex: 1001
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
            )}
        </div>
    );
};

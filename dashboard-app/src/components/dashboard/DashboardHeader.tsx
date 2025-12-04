import React from 'react';
import { Download, FileDown, LogOut, FileSpreadsheet } from 'lucide-react';
import { DashboardHeaderProps } from '@/types';
import { ProfileSelector } from '../ProfileSelector';

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    startDate,
    endDate,
    minDate,
    maxDate,
    onStartDateChange,
    onEndDateChange,
    onReload,
    onExportPDF,
    onExportPNG,
    onExportCSV,
    onCompareProfiles,
    onSignOut,
    activeProfileId,
    onProfileChange,
    onManageProfiles
}) => {
    return (
        <header className="header">
            <div className="logo-container">
                <img
                    src="/betano-logo.png"
                    alt="Betano Logo"
                    className="logo"
                />
                {/* Profile Selector added here - will be passed from Dashboard */}
                {onProfileChange && onManageProfiles && (
                    <div style={{ marginLeft: '16px' }}>
                        <ProfileSelector
                            activeProfileId={activeProfileId || null}
                            onProfileChange={onProfileChange}
                            onManageProfiles={onManageProfiles}
                            onCompareProfiles={onCompareProfiles}
                        />
                    </div>
                )}

            </div>

            <div className="header-controls">
                <div className="date-filters">
                    <div className="input-group">
                        <span className="input-label">De:</span>
                        <input
                            type="date"
                            className="input"
                            value={startDate}
                            min={minDate}
                            max={maxDate}
                            onChange={(e) => onStartDateChange(e.target.value)}
                            aria-label="Data inicial"
                        />
                    </div>
                    <div className="input-group">
                        <span className="input-label">Até:</span>
                        <input
                            type="date"
                            className="input"
                            value={endDate}
                            min={minDate}
                            max={maxDate}
                            onChange={(e) => onEndDateChange(e.target.value)}
                            aria-label="Data final"
                        />
                    </div>
                </div>

                <div className="action-buttons">

                    {onExportCSV && (
                        <button
                            className="btn btn-outline btn-icon"
                            onClick={onExportCSV}
                            title="Exportar dados como CSV"
                            aria-label="Exportar transações como CSV"
                        >
                            <FileSpreadsheet size={16} />
                        </button>
                    )}
                    <button
                        className="btn btn-outline btn-icon"
                        onClick={onExportPDF}
                        title="Exportar como PDF"
                        aria-label="Exportar dashboard como PDF"
                    >
                        <FileDown size={16} />
                    </button>
                    <button
                        className="btn btn-outline btn-icon"
                        onClick={onExportPNG}
                        title="Exportar como PNG"
                        aria-label="Exportar dashboard como PNG"
                    >
                        <Download size={16} />
                    </button>
                    <button
                        className="btn btn-outline"
                        onClick={onReload}
                    >
                        Carregar Novo Ficheiro
                    </button>
                    {onSignOut && (
                        <button
                            className="btn btn-outline"
                            onClick={onSignOut}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <LogOut size={16} />
                            Sair
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

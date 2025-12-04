import React from 'react';
import { LogOut, Calendar, RefreshCw, Sun, Moon } from 'lucide-react';
import { DashboardHeaderProps } from '@/types';
import { ProfileSelector } from '../ProfileSelector';
import { ExportMenu } from '../common/ExportMenu';
import { useTheme } from '@/context/ThemeContext';

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
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="header header-redesigned">
            {/* Left Section: Logo + Profile */}
            <div className="header-section header-left">
                <img
                    src="/betano-logo.png"
                    alt="Betano Logo"
                    className="logo"
                />
                {onProfileChange && onManageProfiles && (
                    <>
                        <div className="header-separator" />
                        <ProfileSelector
                            activeProfileId={activeProfileId || null}
                            onProfileChange={onProfileChange}
                            onManageProfiles={onManageProfiles}
                            onCompareProfiles={onCompareProfiles}
                        />
                    </>
                )}
            </div>

            {/* Center Section: Date Filters */}
            <div className="header-section header-center">
                <div className="date-filters-redesigned">
                    <div className="date-input-group">
                        <Calendar size={16} className="date-icon" />
                        <span className="date-label">De</span>
                        <input
                            type="date"
                            className="date-input"
                            value={startDate}
                            min={minDate}
                            max={maxDate}
                            onChange={(e) => onStartDateChange(e.target.value)}
                            aria-label="Data inicial"
                        />
                    </div>
                    <span className="date-separator">→</span>
                    <div className="date-input-group">
                        <Calendar size={16} className="date-icon" />
                        <span className="date-label">Até</span>
                        <input
                            type="date"
                            className="date-input"
                            value={endDate}
                            min={minDate}
                            max={maxDate}
                            onChange={(e) => onEndDateChange(e.target.value)}
                            aria-label="Data final"
                        />
                    </div>
                </div>
            </div>

            {/* Right Section: Actions */}
            <div className="header-section header-right">
                <button
                    className="btn btn-glass btn-theme-toggle"
                    onClick={toggleTheme}
                    aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
                    title={theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
                >
                    {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                </button>
                {onExportCSV && (
                    <ExportMenu
                        onExportPDF={onExportPDF}
                        onExportPNG={onExportPNG}
                        onExportCSV={onExportCSV}
                    />
                )}
                <button
                    className="btn btn-glass"
                    onClick={onReload}
                >
                    <RefreshCw size={16} />
                    <span>Novo Ficheiro</span>
                </button>
                {onSignOut && (
                    <>
                        <div className="header-separator" />
                        <button
                            className="btn btn-glass btn-signout"
                            onClick={onSignOut}
                        >
                            <LogOut size={16} />
                        </button>
                    </>
                )}
            </div>
        </header>
    );
};

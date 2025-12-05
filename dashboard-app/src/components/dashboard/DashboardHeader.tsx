import React, { useState, useCallback, useRef, useEffect } from 'react';
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

    // Local state for immediate UI updates
    const [localStartDate, setLocalStartDate] = useState(startDate);
    const [localEndDate, setLocalEndDate] = useState(endDate);

    // Sync with props
    useEffect(() => { setLocalStartDate(startDate); }, [startDate]);
    useEffect(() => { setLocalEndDate(endDate); }, [endDate]);

    const startDateTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const endDateTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    // Debounced handlers
    const handleStartDateChange = useCallback((value: string) => {
        setLocalStartDate(value);
        clearTimeout(startDateTimer.current);
        startDateTimer.current = setTimeout(() => {
            onStartDateChange(value);
        }, 300);
    }, [onStartDateChange]);

    const handleEndDateChange = useCallback((value: string) => {
        setLocalEndDate(value);
        clearTimeout(endDateTimer.current);
        endDateTimer.current = setTimeout(() => {
            onEndDateChange(value);
        }, 300);
    }, [onEndDateChange]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearTimeout(startDateTimer.current);
            clearTimeout(endDateTimer.current);
        };
    }, []);

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
                            value={localStartDate}
                            min={minDate}
                            max={maxDate}
                            onChange={(e) => handleStartDateChange(e.target.value)}
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
                            value={localEndDate}
                            min={minDate}
                            max={maxDate}
                            onChange={(e) => handleEndDateChange(e.target.value)}
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

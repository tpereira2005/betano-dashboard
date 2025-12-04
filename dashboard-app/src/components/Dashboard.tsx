import React, { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { DashboardProps } from '@/types';
import { processTransactions, calculateStatistics, filterTransactions } from '@/utils/calculations';
import { exportDashboardAsPDF, exportAsPNG, exportTransactionsAsCSV } from '@/utils/export';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { KPISection } from './dashboard/KPISection';
import { CumulativeChart } from './dashboard/CumulativeChart';
import { MonthlyChart } from './dashboard/MonthlyChart';
import { DistributionChart } from './dashboard/DistributionChart';
import { HistogramChart } from './dashboard/HistogramChart';
import { MoMChart } from './dashboard/MoMChart';
import { InsightsCard } from './dashboard/InsightsCard';
import { TransactionTable } from './dashboard/TransactionTable';
import { ReloadModal } from './ReloadModal';

const Dashboard: React.FC<DashboardProps> = ({
    rawData,
    onSignOut,
    activeProfileId,
    onProfileChange,
    onManageProfiles,
    onCompareProfiles
}) => {
    const [filterType, setFilterType] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showReloadModal, setShowReloadModal] = useState(false);

    // Process raw data
    const processedData = useMemo(() => {
        return processTransactions(rawData);
    }, [rawData]);

    const datasetStart = processedData.length > 0 ? processedData[0].date : '';
    const datasetEnd = processedData.length > 0 ? processedData[processedData.length - 1].date : '';

    const parseInputDate = (value: string) => {
        if (!value) return null;
        const parsed = new Date(`${value}T00:00:00`);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const clampDate = (value: string, min?: string, max?: string) => {
        const parsed = parseInputDate(value);
        if (!parsed) return null;

        const minDate = min ? parseInputDate(min) : null;
        const maxDate = max ? parseInputDate(max) : null;

        if (minDate && parsed < minDate) return min || value;
        if (maxDate && parsed > maxDate) return max || value;
        return value;
    };

    // Set default dates on mount
    useEffect(() => {
        if (datasetStart && datasetEnd) {
            setStartDate(datasetStart);
            setEndDate(datasetEnd);
        }
    }, [datasetStart, datasetEnd]);



    // Filter transactions
    const filteredTransactions = useMemo(() => {
        return filterTransactions(processedData, filterType, startDate, endDate);
    }, [processedData, filterType, startDate, endDate]);

    // Handlers
    const handleStartDateChange = (date: string) => {
        const clamped = clampDate(date, datasetStart, endDate || datasetEnd);

        if (!clamped) {
            toast.error('Data inicial inválida');
            return;
        }

        if (endDate) {
            const parsedEnd = parseInputDate(endDate);
            const parsedStart = parseInputDate(clamped);
            if (parsedEnd && parsedStart && parsedStart > parsedEnd) {
                toast.error('A data inicial não pode ser posterior à data final');
                setStartDate(endDate);
                return;
            }
        }

        if (clamped !== date) {
            toast('Ajustámos a data ao intervalo disponível do ficheiro.', { icon: 'ℹ️' });
        }

        setStartDate(clamped);
    };

    const handleEndDateChange = (date: string) => {
        const clamped = clampDate(date, startDate || datasetStart, datasetEnd);

        if (!clamped) {
            toast.error('Data final inválida');
            return;
        }

        if (startDate) {
            const parsedStart = parseInputDate(startDate);
            const parsedEnd = parseInputDate(clamped);
            if (parsedStart && parsedEnd && parsedEnd < parsedStart) {
                toast.error('A data final não pode ser anterior à data inicial');
                setEndDate(startDate);
                return;
            }
        }

        if (clamped !== date) {
            toast('Ajustámos a data ao intervalo disponível do ficheiro.', { icon: 'ℹ️' });
        }

        setEndDate(clamped);
    };


    const handleExportPDF = React.useCallback(async () => {
        try {
            toast.loading('A exportar PDF...', { id: 'export-pdf' });
            await exportDashboardAsPDF('dashboard-container', 'betano-dashboard');
            toast.success('Dashboard exportado como PDF!', { id: 'export-pdf' });
        } catch (error) {
            toast.error('Erro ao exportar PDF', { id: 'export-pdf' });
            console.error('Export PDF error:', error);
        }
    }, []);

    const handleExportPNG = React.useCallback(async () => {
        try {
            toast.loading('A exportar PNG...', { id: 'export-png' });
            await exportAsPNG('dashboard-container', 'betano-dashboard');
            toast.success('Dashboard exportado como PNG!', { id: 'export-png' });
        } catch (error) {
            toast.error('Erro ao exportar PNG', { id: 'export-png' });
            console.error('Export PNG error:', error);
        }
    }, []);

    const handleExportCSV = React.useCallback(() => {
        try {
            const csvData = filteredTransactions.map(t => ({
                date: t.date,
                type: t.type,
                value: t.value,
                cumulative: t.cumulative
            }));
            exportTransactionsAsCSV(csvData, `betano-transactions-${new Date().toISOString().split('T')[0]}`);
            toast.success('Transações exportadas como CSV!');
        } catch (error) {
            toast.error('Erro ao exportar CSV');
            console.error('Export CSV error:', error);
        }
    }, [filteredTransactions]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl/Cmd + E for Export CSV
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
                e.preventDefault();
                handleExportCSV();
            }

            // Ctrl/Cmd + K for Compare Profiles
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                if (onCompareProfiles) {
                    onCompareProfiles();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleExportCSV, onCompareProfiles]);

    // Calculate statistics
    const stats = useMemo(() => {
        return calculateStatistics(filteredTransactions);
    }, [filteredTransactions]);

    const handleResetFilters = () => {
        setFilterType('All');
        if (datasetStart && datasetEnd) {
            setStartDate(datasetStart);
            setEndDate(datasetEnd);
        }
        toast.success('Filtros reiniciados');
    };

    return (
        <>
            <div className="container" id="dashboard-container">
                <DashboardHeader
                    startDate={startDate}
                    endDate={endDate}
                    minDate={datasetStart}
                    maxDate={datasetEnd}
                    onStartDateChange={handleStartDateChange}
                    onEndDateChange={handleEndDateChange}
                    onReload={() => setShowReloadModal(true)}
                    onExportPDF={handleExportPDF}
                    onExportPNG={handleExportPNG}
                    onExportCSV={handleExportCSV}
                    onCompareProfiles={onCompareProfiles}
                    onSignOut={onSignOut}
                    activeProfileId={activeProfileId}
                    onProfileChange={onProfileChange}
                    onManageProfiles={onManageProfiles}
                />

                <KPISection stats={stats} />

                {/* Charts Section - Expanded */}
                <div className="charts-section">
                    <CumulativeChart data={filteredTransactions} />
                    <MonthlyChart data={stats.monthlyData} />
                    <DistributionChart data={stats.distributionData} />
                    <HistogramChart data={stats.histogram} />
                </div>

                {/* Month over Month Chart - Full Width */}
                {stats.momChanges.length > 0 && (
                    <div style={{ marginBottom: '32px' }}>
                        <MoMChart data={stats.momChanges} />
                    </div>
                )}

                {/* Insights Section - Moved before Transaction Table */}
                <InsightsCard insights={stats.insights} />

                {/* Transactions Table */}
                <TransactionTable
                    transactions={filteredTransactions}
                    filterType={filterType}
                    onFilterChange={setFilterType}
                />

                {/* Reset Filters Button */}
                {(filterType !== 'All' || startDate !== datasetStart || endDate !== datasetEnd) && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                        <button className="btn btn-outline" onClick={handleResetFilters}>
                            Reiniciar Filtros
                        </button>
                    </div>
                )}

                <footer className="footer">
                    <p>© {new Date().getFullYear()} Dashboard Financeiro. Desenvolvido por <strong>Tomás Pereira</strong>.</p>
                </footer>
            </div>

            {/* Reload Modal */}
            <ReloadModal
                isOpen={showReloadModal}
                onClose={() => setShowReloadModal(false)}
                onSuccess={() => {
                    // Trigger data reload by calling parent's onReloadData if provided
                    // For now, we'll just close and rely on Dashboard parent to reload
                    window.location.reload();
                }}
            />
        </>
    );
};

export default Dashboard;


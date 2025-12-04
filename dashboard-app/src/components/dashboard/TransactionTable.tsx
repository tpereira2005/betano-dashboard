import React, { useState, useMemo } from 'react';
import { Filter, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import { TransactionTableProps } from '@/types';
import { formatDate, formatCurrency } from '@/utils/formatters';

export const TransactionTable: React.FC<TransactionTableProps> = ({
    transactions,
    filterType,
    onFilterChange,
    itemsPerPage = 10
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortColumn, setSortColumn] = useState<'date' | 'type' | 'value' | 'cumulative'>('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc'); // newest first by default

    // Sort and paginate
    const paginatedTransactions = useMemo(() => {
        // Sort transactions
        const sorted = [...transactions].sort((a, b) => {
            let comparison = 0;

            switch (sortColumn) {
                case 'date':
                    comparison = a.rawDate.getTime() - b.rawDate.getTime();
                    break;
                case 'type':
                    comparison = a.type.localeCompare(b.type);
                    break;
                case 'value':
                    comparison = a.value - b.value;
                    break;
                case 'cumulative':
                    comparison = a.cumulative - b.cumulative;
                    break;
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });

        const start = (currentPage - 1) * itemsPerPage;
        return sorted.slice(start, start + itemsPerPage);
    }, [transactions, currentPage, itemsPerPage, sortColumn, sortDirection]);

    const totalPages = Math.ceil(transactions.length / itemsPerPage);

    // Handle sort column change
    const handleSort = (column: typeof sortColumn) => {
        if (sortColumn === column) {
            // Toggle direction if same column
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            // New column - default to descending for date/value, ascending for type
            setSortColumn(column);
            setSortDirection(column === 'type' ? 'asc' : 'desc');
        }
        setCurrentPage(1); // Reset to first page
    };

    // Reset to page 1 when filter changes
    const handleFilterChange = (type: string) => {
        setCurrentPage(1);
        onFilterChange(type);
    };

    return (
        <div className="card">
            <div className="table-header">
                <h3 className="section-title" style={{ marginBottom: 0 }}>
                    Histórico de Transações
                </h3>

                <div className="filter-controls">
                    <div className="input-group">
                        <Filter size={16} color="var(--color-text-secondary)" />
                        <select
                            className="input"
                            value={filterType}
                            onChange={(e) => handleFilterChange(e.target.value)}
                        >
                            <option value="All">Todos</option>
                            <option value="Deposit">Depósitos</option>
                            <option value="Withdrawal">Levantamentos</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th
                                onClick={() => handleSort('date')}
                                style={{ cursor: 'pointer', userSelect: 'none' }}
                                title="Clique para ordenar por data"
                            >
                                Data {sortColumn === 'date' && (sortDirection === 'asc' ? <ArrowUp size={14} style={{ display: 'inline', marginLeft: '4px' }} /> : <ArrowDown size={14} style={{ display: 'inline', marginLeft: '4px' }} />)}
                            </th>
                            <th
                                onClick={() => handleSort('type')}
                                style={{ cursor: 'pointer', userSelect: 'none' }}
                                title="Clique para ordenar por tipo"
                            >
                                Tipo {sortColumn === 'type' && (sortDirection === 'asc' ? <ArrowUp size={14} style={{ display: 'inline', marginLeft: '4px' }} /> : <ArrowDown size={14} style={{ display: 'inline', marginLeft: '4px' }} />)}
                            </th>
                            <th
                                onClick={() => handleSort('value')}
                                style={{ cursor: 'pointer', userSelect: 'none' }}
                                title="Clique para ordenar por valor"
                            >
                                Valor {sortColumn === 'value' && (sortDirection === 'asc' ? <ArrowUp size={14} style={{ display: 'inline', marginLeft: '4px' }} /> : <ArrowDown size={14} style={{ display: 'inline', marginLeft: '4px' }} />)}
                            </th>
                            <th
                                onClick={() => handleSort('cumulative')}
                                style={{ cursor: 'pointer', userSelect: 'none' }}
                                title="Clique para ordenar por saldo acumulado"
                            >
                                Saldo Acumulado {sortColumn === 'cumulative' && (sortDirection === 'asc' ? <ArrowUp size={14} style={{ display: 'inline', marginLeft: '4px' }} /> : <ArrowDown size={14} style={{ display: 'inline', marginLeft: '4px' }} />)}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedTransactions.map((t, index) => (
                            <tr key={index}>
                                <td>{formatDate(t.date)}</td>
                                <td>
                                    <span className={`badge ${t.type === 'Deposit' ? 'badge-withdrawal' : 'badge-deposit'}`}>
                                        {t.type === 'Deposit' ? 'Depósito' : 'Levantamento'}
                                    </span>
                                </td>
                                <td className="transaction-value">
                                    <span style={{
                                        fontWeight: 600,
                                        color: t.type === 'Withdrawal' ? 'var(--color-success)' : '#DC2626'
                                    }}>
                                        {t.type === 'Withdrawal' ? '+' : '-'}{formatCurrency(t.value)}
                                    </span>
                                </td>
                                <td className="text-neutral">
                                    {formatCurrency(t.cumulative)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {transactions.length === 0 && (
                    <div className="empty-state">
                        Nenhuma transação encontrada.
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {transactions.length > itemsPerPage && (
                <div className="pagination-controls">
                    <div className="pagination-info">
                        A mostrar {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, transactions.length)} de {transactions.length}
                    </div>
                    <div className="pagination-buttons">
                        <button
                            className="btn btn-outline"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            aria-label="Página anterior"
                        >
                            <ChevronLeft size={16} /> Anterior
                        </button>
                        <button
                            className="btn btn-outline"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            aria-label="Próxima página"
                        >
                            Próximo <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

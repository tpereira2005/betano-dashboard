import React, { useState, useEffect, useMemo } from 'react';
import { X, Users } from 'lucide-react';
import { getProfiles, Profile } from '@/services/profileService';
import { fetchTransactions } from '@/services/transactionService';
import { processTransactions, calculateStatistics } from '@/utils/calculations';
import { formatCurrency } from '@/utils/formatters';
import { RawTransaction } from '@/types';

interface ProfileComparisonProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProfileComparison: React.FC<ProfileComparisonProps> = ({ isOpen, onClose }) => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [profileA, setProfileA] = useState<string>('');
    const [profileB, setProfileB] = useState<string>('');
    const [dataA, setDataA] = useState<RawTransaction[]>([]);
    const [dataB, setDataB] = useState<RawTransaction[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadProfiles();
        }
    }, [isOpen]);

    const loadProfiles = async () => {
        const allProfiles = await getProfiles();
        setProfiles(allProfiles);
        if (allProfiles.length >= 2) {
            setProfileA(allProfiles[0].id);
            setProfileB(allProfiles[1].id);
        }
    };

    useEffect(() => {
        if (profileA) {
            setLoading(true);
            fetchTransactions(profileA).then(data => {
                setDataA(data);
                setLoading(false);
            });
        }
    }, [profileA]);

    useEffect(() => {
        if (profileB) {
            setLoading(true);
            fetchTransactions(profileB).then(data => {
                setDataB(data);
                setLoading(false);
            });
        }
    }, [profileB]);

    const statsA = useMemo(() => {
        if (dataA.length === 0) return null;
        return calculateStatistics(processTransactions(dataA));
    }, [dataA]);

    const statsB = useMemo(() => {
        if (dataB.length === 0) return null;
        return calculateStatistics(processTransactions(dataB));
    }, [dataB]);

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const getDifference = (a: number, b: number) => {
        const diff = a - b;
        const percentage = b !== 0 ? ((diff / Math.abs(b)) * 100) : 0;
        return { absolute: diff, percentage };
    };

    const profileAName = profiles.find(p => p.id === profileA)?.name || 'Perfil A';
    const profileBName = profiles.find(p => p.id === profileB)?.name || 'Perfil B';

    return (
        <div className="modal-overlay" onClick={handleOverlayClick} style={{ zIndex: 1001 }}>
            <div className="modal-content" style={{ maxWidth: '900px', width: '95%' }}>
                <div className="modal-header">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Users size={24} />
                        Comparação de Perfis
                    </h3>
                    <button className="modal-close" onClick={onClose} aria-label="Fechar">
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Profile Selectors */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-secondary)' }}>
                                Perfil A
                            </label>
                            <select
                                className="input"
                                value={profileA}
                                onChange={(e) => setProfileA(e.target.value)}
                                style={{ width: '100%' }}
                            >
                                {profiles.map(p => (
                                    <option key={p.id} value={p.id} disabled={p.id === profileB}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-secondary)' }}>
                                Perfil B
                            </label>
                            <select
                                className="input"
                                value={profileB}
                                onChange={(e) => setProfileB(e.target.value)}
                                style={{ width: '100%' }}
                            >
                                {profiles.map(p => (
                                    <option key={p.id} value={p.id} disabled={p.id === profileA}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {loading && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
                            A carregar dados...
                        </div>
                    )}

                    {!loading && statsA && statsB && (
                        <>
                            {/* Comparison Table */}
                            <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
                                <table style={{ width: '100%', fontSize: '0.875rem' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: 'left', padding: '12px', background: 'var(--color-bg)', color: 'var(--color-text)' }}>Métrica</th>
                                            <th style={{ padding: '12px', background: 'var(--color-bg)', color: 'var(--color-text)' }}>{profileAName}</th>
                                            <th style={{ padding: '12px', background: 'var(--color-bg)', color: 'var(--color-text)' }}>{profileBName}</th>
                                            <th style={{ padding: '12px', background: 'var(--color-bg)', color: 'var(--color-text)' }}>Diferença</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{ padding: '12px', fontWeight: 600 }}>Resultado Líquido</td>
                                            <td style={{ padding: '12px', textAlign: 'center', color: statsA.netResult >= 0 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 700 }}>
                                                {formatCurrency(statsA.netResult)}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center', color: statsB.netResult >= 0 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 700 }}>
                                                {formatCurrency(statsB.netResult)}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center', fontSize: '0.813rem' }}>
                                                {formatCurrency(getDifference(statsA.netResult, statsB.netResult).absolute)}
                                                <br />
                                                <span style={{ color: 'var(--color-text-secondary)' }}>
                                                    ({getDifference(statsA.netResult, statsB.netResult).percentage.toFixed(1)}%)
                                                </span>
                                            </td>
                                        </tr>
                                        <tr style={{ background: '#F9FAFB' }}>
                                            <td style={{ padding: '12px', fontWeight: 600 }}>Total Depositado</td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>{formatCurrency(statsA.totalDeposited)}</td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>{formatCurrency(statsB.totalDeposited)}</td>
                                            <td style={{ padding: '12px', textAlign: 'center', fontSize: '0.813rem' }}>
                                                {formatCurrency(getDifference(statsA.totalDeposited, statsB.totalDeposited).absolute)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '12px', fontWeight: 600 }}>Total Levantado</td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>{formatCurrency(statsA.totalWithdrawn)}</td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>{formatCurrency(statsB.totalWithdrawn)}</td>
                                            <td style={{ padding: '12px', textAlign: 'center', fontSize: '0.813rem' }}>
                                                {formatCurrency(getDifference(statsA.totalWithdrawn, statsB.totalWithdrawn).absolute)}
                                            </td>
                                        </tr>
                                        <tr style={{ background: '#F9FAFB' }}>
                                            <td style={{ padding: '12px', fontWeight: 600 }}>ROI</td>
                                            <td style={{ padding: '12px', textAlign: 'center', color: statsA.roi >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                                {statsA.roi.toFixed(1)}%
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center', color: statsB.roi >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                                {statsB.roi.toFixed(1)}%
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center', fontSize: '0.813rem' }}>
                                                {(statsA.roi - statsB.roi).toFixed(1)} pp
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '12px', fontWeight: 600 }}>Win Rate</td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>{statsA.winRate.toFixed(0)}%</td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>{statsB.winRate.toFixed(0)}%</td>
                                            <td style={{ padding: '12px', textAlign: 'center', fontSize: '0.813rem' }}>
                                                {(statsA.winRate - statsB.winRate).toFixed(0)} pp
                                            </td>
                                        </tr>
                                        <tr style={{ background: '#F9FAFB' }}>
                                            <td style={{ padding: '12px', fontWeight: 600 }}>Melhor Mês</td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                {statsA.bestMonth ? formatCurrency(statsA.bestMonth.net) : 'N/A'}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                {statsB.bestMonth ? formatCurrency(statsB.bestMonth.net) : 'N/A'}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center', fontSize: '0.813rem' }}>
                                                {statsA.bestMonth && statsB.bestMonth
                                                    ? formatCurrency(statsA.bestMonth.net - statsB.bestMonth.net)
                                                    : '-'}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary */}
                            <div style={{
                                padding: '16px',
                                background: 'linear-gradient(135deg, rgba(255, 61, 0, 0.05) 0%, rgba(255, 61, 0, 0.02) 100%)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid rgba(255, 61, 0, 0.1)'
                            }}>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text)' }}>
                                    <strong>Resumo:</strong> {' '}
                                    {statsA.netResult > statsB.netResult
                                        ? `${profileAName} tem melhor resultado com ${formatCurrency(statsA.netResult - statsB.netResult)} de vantagem.`
                                        : statsB.netResult > statsA.netResult
                                            ? `${profileBName} tem melhor resultado com ${formatCurrency(statsB.netResult - statsA.netResult)} de vantagem.`
                                            : 'Ambos os perfis têm resultados semelhantes.'}
                                </p>
                            </div>
                        </>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn btn-outline" onClick={onClose}>
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

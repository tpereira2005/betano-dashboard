import React, { useState, useEffect, useMemo } from 'react';
import { X, TrendingUp, Trophy, Target, Wallet, PiggyBank, Calendar, ArrowRightLeft, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getProfiles, Profile } from '@/services/profileService';
import { fetchTransactions } from '@/services/transactionService';
import { processTransactions, calculateStatistics } from '@/utils/calculations';
import { formatCurrency } from '@/utils/formatters';
import { RawTransaction, Statistics } from '@/types';

interface ProfileComparisonProps {
    isOpen: boolean;
    onClose: () => void;
}

const COLORS = {
    profileA: '#FF3D00',  // Betano orange
    profileB: '#3B82F6',  // Blue
    positive: '#00D67D',
    negative: '#FF4757'
};

interface ComparisonCardProps {
    label: string;
    icon: React.ReactNode;
    valueA: string;
    valueB: string;
    rawA: number;
    rawB: number;
    isPercentage?: boolean;
    invertColors?: boolean;
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({
    label, icon, valueA, valueB, rawA, rawB, isPercentage, invertColors
}) => {
    const winner = rawA > rawB ? 'A' : rawB > rawA ? 'B' : 'tie';
    const diff = Math.abs(rawA - rawB);
    const percentDiff = rawB !== 0 ? ((rawA - rawB) / Math.abs(rawB)) * 100 : 0;

    // For deposits, lower is better
    const actualWinner = invertColors ? (winner === 'A' ? 'B' : winner === 'B' ? 'A' : 'tie') : winner;

    return (
        <div className="comparison-card">
            <div className="comparison-card-header">
                <span className="comparison-card-icon">{icon}</span>
                <span className="comparison-card-label">{label}</span>
            </div>
            <div className="comparison-card-values">
                <div className={`comparison-value ${actualWinner === 'A' ? 'winner' : ''}`}>
                    <span className="profile-indicator" style={{ background: COLORS.profileA }}></span>
                    <span className="value">{valueA}</span>
                    {actualWinner === 'A' && <Trophy size={14} className="trophy" />}
                </div>
                <div className="comparison-vs">VS</div>
                <div className={`comparison-value ${actualWinner === 'B' ? 'winner' : ''}`}>
                    <span className="profile-indicator" style={{ background: COLORS.profileB }}></span>
                    <span className="value">{valueB}</span>
                    {actualWinner === 'B' && <Trophy size={14} className="trophy" />}
                </div>
            </div>
            {winner !== 'tie' && (
                <div className="comparison-diff">
                    {isPercentage
                        ? `${diff.toFixed(1)} pp de diferença`
                        : `${formatCurrency(diff)} (${percentDiff > 0 ? '+' : ''}${percentDiff.toFixed(1)}%)`
                    }
                </div>
            )}
        </div>
    );
};

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

    const statsA = useMemo((): Statistics | null => {
        if (dataA.length === 0) return null;
        return calculateStatistics(processTransactions(dataA));
    }, [dataA]);

    const statsB = useMemo((): Statistics | null => {
        if (dataB.length === 0) return null;
        return calculateStatistics(processTransactions(dataB));
    }, [dataB]);

    const chartData = useMemo(() => {
        if (!statsA || !statsB) return [];
        return [
            { name: 'Depósitos', A: statsA.totalDeposited, B: statsB.totalDeposited },
            { name: 'Levantamentos', A: statsA.totalWithdrawn, B: statsB.totalWithdrawn },
            { name: 'Resultado', A: Math.max(0, statsA.netResult), B: Math.max(0, statsB.netResult) },
        ];
    }, [statsA, statsB]);

    const monthlyComparison = useMemo(() => {
        if (!statsA || !statsB) return [];
        const monthsA = new Set(statsA.monthlyData.map(m => m.month));
        const monthsB = new Set(statsB.monthlyData.map(m => m.month));
        const allMonths = [...new Set([...monthsA, ...monthsB])].sort();

        return allMonths.slice(-6).map(month => {
            const dataA = statsA.monthlyData.find(m => m.month === month);
            const dataB = statsB.monthlyData.find(m => m.month === month);
            return {
                month: month.substring(2), // YY-MM format
                A: dataA?.net || 0,
                B: dataB?.net || 0
            };
        });
    }, [statsA, statsB]);

    if (!isOpen) return null;

    const profileAName = profiles.find(p => p.id === profileA)?.name || 'Perfil A';
    const profileBName = profiles.find(p => p.id === profileB)?.name || 'Perfil B';

    const getWinner = () => {
        if (!statsA || !statsB) return null;
        const scoreA = (statsA.netResult > statsB.netResult ? 1 : 0) +
            (statsA.roi > statsB.roi ? 1 : 0) +
            (statsA.winRate > statsB.winRate ? 1 : 0);
        const scoreB = 3 - scoreA;
        if (scoreA > scoreB) return { name: profileAName, color: COLORS.profileA };
        if (scoreB > scoreA) return { name: profileBName, color: COLORS.profileB };
        return null;
    };

    const winner = statsA && statsB ? getWinner() : null;

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()} style={{ zIndex: 1001 }}>
            <div className="modal-content comparison-modal">
                <div className="modal-header">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <ArrowRightLeft size={24} />
                        Comparação de Perfis
                    </h3>
                    <button className="modal-close" onClick={onClose} aria-label="Fechar">
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Profile Selectors */}
                    <div className="comparison-selectors">
                        <div className="profile-select-wrapper">
                            <div className="profile-color-bar" style={{ background: COLORS.profileA }}></div>
                            <select
                                className="input profile-select"
                                value={profileA}
                                onChange={(e) => setProfileA(e.target.value)}
                            >
                                {profiles.map(p => (
                                    <option key={p.id} value={p.id} disabled={p.id === profileB}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                            <div className="profile-color-bar-right" style={{ background: COLORS.profileA }}></div>
                        </div>
                        <div className="comparison-vs-badge">VS</div>
                        <div className="profile-select-wrapper">
                            <div className="profile-color-bar" style={{ background: COLORS.profileB }}></div>
                            <select
                                className="input profile-select"
                                value={profileB}
                                onChange={(e) => setProfileB(e.target.value)}
                            >
                                {profiles.map(p => (
                                    <option key={p.id} value={p.id} disabled={p.id === profileA}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                            <div className="profile-color-bar-right" style={{ background: COLORS.profileB }}></div>
                        </div>
                    </div>

                    {loading && (
                        <div className="comparison-loading">
                            <div className="spinner"></div>
                            A carregar dados...
                        </div>
                    )}

                    {!loading && statsA && statsB && (
                        <>
                            {/* Winner Banner */}
                            {winner && (
                                <div className="winner-banner" style={{ borderColor: winner.color }}>
                                    <Trophy size={20} style={{ color: winner.color }} />
                                    <span><strong>{winner.name}</strong> tem o melhor desempenho geral!</span>
                                </div>
                            )}

                            {/* Key Metrics Comparison */}
                            <div className="comparison-grid">
                                <ComparisonCard
                                    label="Resultado Líquido"
                                    icon={<Wallet size={18} />}
                                    valueA={formatCurrency(statsA.netResult)}
                                    valueB={formatCurrency(statsB.netResult)}
                                    rawA={statsA.netResult}
                                    rawB={statsB.netResult}
                                />
                                <ComparisonCard
                                    label="ROI"
                                    icon={<TrendingUp size={18} />}
                                    valueA={`${statsA.roi.toFixed(1)}%`}
                                    valueB={`${statsB.roi.toFixed(1)}%`}
                                    rawA={statsA.roi}
                                    rawB={statsB.roi}
                                    isPercentage
                                />
                                <ComparisonCard
                                    label="Win Rate"
                                    icon={<Target size={18} />}
                                    valueA={`${statsA.winRate.toFixed(0)}%`}
                                    valueB={`${statsB.winRate.toFixed(0)}%`}
                                    rawA={statsA.winRate}
                                    rawB={statsB.winRate}
                                    isPercentage
                                />
                                <ComparisonCard
                                    label="Total Depositado"
                                    icon={<PiggyBank size={18} />}
                                    valueA={formatCurrency(statsA.totalDeposited)}
                                    valueB={formatCurrency(statsB.totalDeposited)}
                                    rawA={statsA.totalDeposited}
                                    rawB={statsB.totalDeposited}
                                    invertColors
                                />
                            </div>

                            {/* Charts Section */}
                            <div className="comparison-charts">
                                {/* Monthly Comparison */}
                                <div className="comparison-chart-card">
                                    <h4><Calendar size={16} /> Evolução Mensal (últimos 6 meses)</h4>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={monthlyComparison} barGap={2}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                            <YAxis tick={{ fontSize: 11 }} />
                                            <Tooltip
                                                formatter={(value: number) => formatCurrency(value)}
                                                labelFormatter={(label) => `Mês: 20${label}`}
                                            />
                                            <Legend />
                                            <Bar dataKey="A" name={profileAName} fill={COLORS.profileA} radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="B" name={profileBName} fill={COLORS.profileB} radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Totals Comparison */}
                                <div className="comparison-chart-card">
                                    <h4><Users size={16} /> Comparação de Volumes</h4>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={chartData} layout="vertical" barGap={2}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis type="number" tick={{ fontSize: 11 }} />
                                            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                            <Legend />
                                            <Bar dataKey="A" name={profileAName} fill={COLORS.profileA} radius={[0, 4, 4, 0]} />
                                            <Bar dataKey="B" name={profileBName} fill={COLORS.profileB} radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="comparison-quick-stats">
                                <div className="quick-stat">
                                    <span className="quick-stat-label">Meses Ativos</span>
                                    <div className="quick-stat-values">
                                        <span style={{ color: COLORS.profileA }}>{statsA.monthlyData.length}</span>
                                        <span className="separator">|</span>
                                        <span style={{ color: COLORS.profileB }}>{statsB.monthlyData.length}</span>
                                    </div>
                                </div>
                                <div className="quick-stat">
                                    <span className="quick-stat-label">Meses Lucrativos</span>
                                    <div className="quick-stat-values">
                                        <span style={{ color: COLORS.profileA }}>{statsA.profitableMonths}</span>
                                        <span className="separator">|</span>
                                        <span style={{ color: COLORS.profileB }}>{statsB.profitableMonths}</span>
                                    </div>
                                </div>
                                <div className="quick-stat">
                                    <span className="quick-stat-label">Transações</span>
                                    <div className="quick-stat-values">
                                        <span style={{ color: COLORS.profileA }}>{statsA.depositCount + statsA.withdrawalCount}</span>
                                        <span className="separator">|</span>
                                        <span style={{ color: COLORS.profileB }}>{statsB.depositCount + statsB.withdrawalCount}</span>
                                    </div>
                                </div>
                                <div className="quick-stat">
                                    <span className="quick-stat-label">Melhor Mês</span>
                                    <div className="quick-stat-values">
                                        <span style={{ color: COLORS.profileA }}>{statsA.bestMonth ? formatCurrency(statsA.bestMonth.net) : '-'}</span>
                                        <span className="separator">|</span>
                                        <span style={{ color: COLORS.profileB }}>{statsB.bestMonth ? formatCurrency(statsB.bestMonth.net) : '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {profiles.length < 2 && !loading && (
                        <div className="comparison-empty">
                            <Users size={48} />
                            <p>Precisas de pelo menos 2 perfis para comparar.</p>
                        </div>
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

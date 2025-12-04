import React from 'react';
import { Lightbulb, TrendingUp, Calendar, DollarSign, Target, Activity, AlertCircle, CheckCircle } from 'lucide-react';

interface InsightsCardProps {
    insights: string[];
}

export const InsightsCard: React.FC<InsightsCardProps> = ({ insights }) => {
    const getIcon = (insight: string) => {
        if (insight.includes('dias entre')) return Calendar;
        if (insight.includes('Maior')) return DollarSign;
        if (insight.includes('Mês mais ativo')) return Activity;
        if (insight.includes('ROI positivo')) return CheckCircle;
        if (insight.includes('ROI negativo')) return AlertCircle;
        if (insight.includes('lucrativos')) return Target;
        return TrendingUp;
    };

    const getInsightType = (insight: string): 'success' | 'warning' | 'info' | 'danger' => {
        if (insight.includes('ROI positivo') || (insight.includes('lucrativos') && !insight.includes('Apenas'))) {
            return 'success';
        }
        if (insight.includes('ROI negativo') || insight.includes('Apenas')) {
            return 'danger';
        }
        if (insight.includes('atenção') || insight.includes('Cuidado')) {
            return 'warning';
        }
        return 'info';
    };

    const getTypeColor = (type: 'success' | 'warning' | 'info' | 'danger') => {
        switch (type) {
            case 'success': return '#10B981';
            case 'danger': return '#EF4444';
            case 'warning': return '#F59E0B';
            default: return '#3B82F6';
        }
    };

    return (
        <div className="card" style={{ marginBottom: '32px', marginTop: '32px' }}>
            <div className="section-title" style={{ marginBottom: '24px' }}>
                <Lightbulb size={24} style={{ color: 'var(--color-betano-orange)' }} />
                <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>Insights Automáticos</span>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px'
            }}>
                {insights.map((insight, index) => {
                    const Icon = getIcon(insight);
                    const type = getInsightType(insight);
                    const color = getTypeColor(type);

                    return (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '14px',
                                padding: '18px',
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(249, 250, 251, 0.9) 100%)',
                                borderRadius: 'var(--radius-md)',
                                border: `1px solid ${color}20`,
                                borderLeft: `4px solid ${color}`,
                                transition: 'var(--transition-smooth)',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                            }}
                            className="insight-item"
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                            }}
                        >
                            <div style={{
                                color: color,
                                flexShrink: 0,
                                marginTop: '2px',
                                background: `${color}15`,
                                padding: '8px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Icon size={20} />
                            </div>
                            <p style={{
                                margin: 0,
                                fontSize: '0.95rem',
                                color: 'var(--color-text)',
                                lineHeight: 1.6,
                                fontWeight: 500
                            }}>
                                {insight}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div style={{
                marginTop: '24px',
                padding: '16px',
                background: 'linear-gradient(135deg, rgba(255, 61, 0, 0.05) 0%, rgba(255, 61, 0, 0.02) 100%)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 61, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <p style={{
                    margin: 0,
                    fontSize: '0.875rem',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.5
                }}>
                    💡 <strong>Dica:</strong> Use estes insights para identificar padrões no teu comportamento de jogo e tomar decisões mais informadas.
                </p>
            </div>
        </div>
    );
};

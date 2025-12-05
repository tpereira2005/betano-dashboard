import React from 'react';
import { Lightbulb, Calendar, DollarSign, Target, Activity, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

interface InsightsCardProps {
    insights: string[];
}

type InsightType = 'success' | 'warning' | 'info' | 'danger';

const getIcon = (insight: string) => {
    if (insight.includes('dias entre')) return Calendar;
    if (insight.includes('Maior')) return DollarSign;
    if (insight.includes('Mês mais ativo')) return Activity;
    if (insight.includes('ROI positivo')) return CheckCircle;
    if (insight.includes('ROI negativo')) return AlertCircle;
    if (insight.includes('lucrativos')) return Target;
    return Sparkles;
};

const getInsightType = (insight: string): InsightType => {
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

// Get icon color based on insight type
const getIconColor = (type: InsightType): string => {
    switch (type) {
        case 'success': return '#10B981'; // Green
        case 'danger': return '#EF4444';  // Red
        case 'warning': return '#FFC800'; // Yellow
        default: return '#FF3D00';        // Orange for info/neutral
    }
};

export const InsightsCard: React.FC<InsightsCardProps> = ({ insights }) => {
    return (
        <div className="card insights-card" style={{ marginBottom: '32px', marginTop: '32px' }}>
            <div className="section-title" style={{ marginBottom: '24px' }}>
                <Lightbulb size={24} color="#FF3D00" />
                <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>Insights Automáticos</span>
            </div>

            <div className="insights-grid">
                {insights.map((insight, index) => {
                    const Icon = getIcon(insight);
                    const type = getInsightType(insight);
                    const iconColor = getIconColor(type);

                    return (
                        <div key={index} className={`insight-item type-${type}`}>
                            <div className={`insight-icon type-${type}`}>
                                <Icon size={20} color={iconColor} />
                            </div>
                            <p className="insight-text">{insight}</p>
                        </div>
                    );
                })}
            </div>

            <div className="insight-tip">
                <p>
                    💡 <strong>Dica:</strong> Use estes insights para identificar padrões no teu comportamento de jogo e tomar decisões mais informadas.
                </p>
            </div>
        </div>
    );
};

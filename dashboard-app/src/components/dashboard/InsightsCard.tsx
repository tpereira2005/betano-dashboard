import React from 'react';
import {
    TrendingUp,
    TrendingDown,
    Target,
    Calendar,
    Activity,
    Flame,
    DollarSign,
    ThumbsUp,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    ArrowUp,
    ArrowDown,
    Lightbulb,
    BarChart3,
    Zap,
    BookOpen
} from 'lucide-react';
import { RichInsight } from '@/types';

interface InsightsCardProps {
    insights: RichInsight[];
}

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
    TrendingUp,
    TrendingDown,
    Target,
    Calendar,
    Activity,
    Flame,
    DollarSign,
    ThumbsUp,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight
};

// Category labels and icons
const categoryConfig = {
    performance: {
        label: 'Performance',
        icon: BarChart3,
        gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.02) 100%)'
    },
    pattern: {
        label: 'Padrões',
        icon: Zap,
        gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.02) 100%)'
    },
    recommendation: {
        label: 'Recomendações',
        icon: BookOpen,
        gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.02) 100%)'
    }
};

export const InsightsCard: React.FC<InsightsCardProps> = ({ insights }) => {
    // Group insights by category
    const performanceInsights = insights.filter(i => i.category === 'performance');
    const patternInsights = insights.filter(i => i.category === 'pattern');
    const recommendationInsights = insights.filter(i => i.category === 'recommendation');

    const renderInsightCard = (insight: RichInsight, index: number) => {
        const IconComponent = iconMap[insight.icon] || Target;

        return (
            <div
                key={insight.id}
                className={`insight-card-new type-${insight.type}`}
                style={{ animationDelay: `${index * 0.1}s` }}
            >
                <div className="insight-card-header">
                    <div className={`insight-icon-new type-${insight.type}`}>
                        <IconComponent size={20} />
                    </div>
                    <span className="insight-title-new">{insight.title}</span>
                    {insight.trend && (
                        <span className={`insight-trend trend-${insight.trend}`}>
                            {insight.trend === 'up' ? <ArrowUp size={14} strokeWidth={2.5} /> :
                                insight.trend === 'down' ? <ArrowDown size={14} strokeWidth={2.5} /> : null}
                        </span>
                    )}
                </div>
                {insight.value && (
                    <div className={`insight-value-new type-${insight.type}`}>
                        {insight.value}
                    </div>
                )}
                <p className="insight-description">{insight.description}</p>
            </div>
        );
    };

    const renderCategory = (
        categoryInsights: RichInsight[],
        category: 'performance' | 'pattern' | 'recommendation',
        startIndex: number
    ) => {
        if (categoryInsights.length === 0) return null;

        const config = categoryConfig[category];
        const CategoryIcon = config.icon;

        return (
            <div className="insights-category" key={category}>
                <div className="insights-category-header">
                    <CategoryIcon size={16} className="category-icon" />
                    <span className="category-label">{config.label}</span>
                </div>
                <div className="insights-category-grid">
                    {categoryInsights.map((insight, idx) =>
                        renderInsightCard(insight, startIndex + idx)
                    )}
                </div>
            </div>
        );
    };

    if (insights.length === 0) {
        return null;
    }

    return (
        <div className="card insights-card-redesigned">
            <div className="section-title" style={{ marginBottom: '24px' }}>
                <Lightbulb size={24} color="#FF3D00" />
                <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>Insights Automáticos</span>
            </div>

            <div className="insights-sections">
                {renderCategory(performanceInsights, 'performance', 0)}
                {renderCategory(patternInsights, 'pattern', performanceInsights.length)}
                {renderCategory(recommendationInsights, 'recommendation', performanceInsights.length + patternInsights.length)}
            </div>
        </div>
    );
};

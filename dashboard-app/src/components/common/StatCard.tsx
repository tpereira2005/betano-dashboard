import React from 'react';
import { StatCardProps } from '@/types';

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    subValue,
    icon: Icon,
    type = 'neutral',
    variant = 'default'
}) => {
    const typeColors = {
        success: 'text-success',
        danger: 'text-danger',
        neutral: 'text-neutral',
        primary: 'text-primary'
    };

    const typeClasses = {
        success: 'stat-card-success',
        danger: 'stat-card-danger',
        primary: 'stat-card-primary',
        neutral: ''
    };

    if (variant === 'compact') {
        return (
            <div className={`card compact ${typeClasses[type]}`}>
                <div className="compact-content">
                    {Icon && (
                        <div className={`compact-icon-box ${type}`}>
                            <Icon size={18} />
                        </div>
                    )}
                    <div className="compact-info">
                        <div className="compact-title">{title}</div>
                        <div className={`compact-value ${typeColors[type] || ''}`}>
                            {value}
                        </div>
                        {subValue && <div className="compact-subtext">{subValue}</div>}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`card ${typeClasses[type]}`}>
            <div className="stat-label">
                {Icon && <Icon size={16} />}
                {title}
            </div>
            <div className={`stat-value ${typeColors[type] || ''}`}>
                {value}
            </div>
            {subValue && <div className="stat-subtext">{subValue}</div>}
        </div>
    );
};

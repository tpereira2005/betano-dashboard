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
    const getTypeClass = () => {
        switch (type) {
            case 'success': return 'success';
            case 'danger': return 'danger';
            case 'primary': return 'primary';
            default: return '';
        }
    };

    const typeClass = getTypeClass();

    // Compact variant uses different layout
    if (variant === 'compact') {
        return (
            <div className="card compact">
                <div className="compact-content">
                    {Icon && (
                        <div className={`compact-icon-box ${typeClass}`}>
                            <Icon size={18} />
                        </div>
                    )}
                    <div className="compact-info">
                        <span className="compact-title">{title}</span>
                        <span className="compact-value">{value}</span>
                        {subValue && <span className="compact-subtext">{subValue}</span>}
                    </div>
                </div>
            </div>
        );
    }

    // Default variant (hero cards)
    return (
        <div className={`card stat-card-${typeClass || 'neutral'}`}>
            <div className="stat-header">
                {Icon && (
                    <div className={`stat-icon ${typeClass}`}>
                        <Icon size={24} color="#FF3D00" />
                    </div>
                )}
                <span className="stat-title">{title}</span>
            </div>
            <div className={`stat-value text-${typeClass || 'neutral'}`}>{value}</div>
            {subValue && <div className="stat-subvalue">{subValue}</div>}
        </div>
    );
};

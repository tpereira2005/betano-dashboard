import React from 'react';
import { CustomTooltipProps } from '@/types';
import { formatCurrency } from '@/utils/formatters';

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
    active,
    payload,
    label
}) => {
    if (active && payload && payload.length) {
        return (
            <div
                className="card tooltip-card"
                style={{
                    padding: '12px',
                    border: '1px solid #eee',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
            >
                <p className="label" style={{ fontWeight: 600, marginBottom: 5 }}>
                    {label}
                </p>
                {payload.map((entry, index) => (
                    <p
                        key={index}
                        style={{ color: entry.color, fontSize: '0.9rem', margin: 0 }}
                    >
                        {entry.name}: {formatCurrency(entry.value)}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

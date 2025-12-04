import React from 'react';
import { CustomTooltipProps } from '@/types';
import { formatCurrency } from '@/utils/formatters';

export const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    return (
        <div style={{
            backgroundColor: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e5e7eb',
            minWidth: '150px'
        }}>
            <p style={{
                margin: '0 0 8px 0',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: '#374151'
            }}>
                {label}
            </p>
            {payload.map((entry, index) => (
                <p
                    key={index}
                    style={{
                        margin: '4px 0',
                        fontSize: '0.875rem',
                        color: entry.color,
                        fontWeight: 500
                    }}
                >
                    {entry.name}: {formatCurrency(entry.value)}
                </p>
            ))}
        </div>
    );
};

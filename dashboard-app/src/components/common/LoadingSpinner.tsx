import React from 'react';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'medium',
    message
}) => {
    const sizeMap = {
        small: '24px',
        medium: '48px',
        large: '64px'
    };

    return (
        <div className="loading-container">
            <div
                className="spinner"
                style={{ width: sizeMap[size], height: sizeMap[size] }}
            />
            {message && (
                <p className="loading-message">{message}</p>
            )}
        </div>
    );
};

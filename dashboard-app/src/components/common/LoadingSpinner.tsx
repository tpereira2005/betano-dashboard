import React from 'react';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    message?: string;
    fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'medium',
    message = 'A carregar...',
    fullScreen = true
}) => {
    const sizeMap = {
        small: { spinner: '32px', logo: '40px' },
        medium: { spinner: '48px', logo: '60px' },
        large: { spinner: '64px', logo: '80px' }
    };

    return (
        <div className={`loading-screen ${fullScreen ? 'fullscreen' : ''}`}>
            <div className="loading-content">
                {/* Logo */}
                <div className="loading-logo">
                    <img
                        src="/betano-logo.png"
                        alt="Betano"
                        style={{ height: sizeMap[size].logo }}
                    />
                </div>

                {/* Spinner ring */}
                <div className="loading-spinner-wrapper">
                    <div
                        className="loading-spinner-ring"
                        style={{ width: sizeMap[size].spinner, height: sizeMap[size].spinner }}
                    />
                    <div
                        className="loading-spinner-glow"
                        style={{ width: sizeMap[size].spinner, height: sizeMap[size].spinner }}
                    />
                </div>

                {/* Message */}
                <p className="loading-text">{message}</p>

                {/* Animated dots */}
                <div className="loading-dots">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                </div>
            </div>
        </div>
    );
};

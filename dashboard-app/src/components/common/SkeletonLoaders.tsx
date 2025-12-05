import React from 'react';

// Shimmer animation keyframes are defined in index.css

export const KPISkeleton: React.FC = () => (
    <div className="kpi-section">
        <div className="kpi-main-cards">
            {[1, 2, 3].map((i) => (
                <div key={i} className="card skeleton-card">
                    <div className="skeleton-header">
                        <div className="skeleton skeleton-icon" />
                        <div className="skeleton skeleton-title" />
                    </div>
                    <div className="skeleton skeleton-value" />
                    <div className="skeleton skeleton-subtext" />
                </div>
            ))}
        </div>
        <div className="kpi-compact-cards">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card compact skeleton-card">
                    <div className="compact-content">
                        <div className="skeleton skeleton-icon-small" />
                        <div className="compact-info">
                            <div className="skeleton skeleton-title-small" />
                            <div className="skeleton skeleton-value-small" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 300 }) => (
    <div className="card skeleton-card">
        <div className="skeleton-header">
            <div className="skeleton skeleton-icon" />
            <div className="skeleton skeleton-title" />
        </div>
        <div className="skeleton skeleton-chart" style={{ height }} />
    </div>
);

export const ChartGridSkeleton: React.FC = () => (
    <div className="charts-section">
        <ChartSkeleton height={350} />
        <ChartSkeleton height={350} />
        <ChartSkeleton />
        <ChartSkeleton />
    </div>
);

export const TableSkeleton: React.FC = () => (
    <div className="card skeleton-card">
        <div className="skeleton-header" style={{ marginBottom: '16px' }}>
            <div className="skeleton skeleton-title" style={{ width: '200px' }} />
        </div>
        <div className="skeleton-table">
            <div className="skeleton skeleton-table-header" />
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton skeleton-table-row" />
            ))}
        </div>
    </div>
);

export const DashboardSkeleton: React.FC = () => (
    <div className="dashboard-skeleton">
        <KPISkeleton />
        <ChartGridSkeleton />
        <TableSkeleton />
    </div>
);

import { LucideIcon } from 'lucide-react';

// Core Transaction Types
export interface RawTransaction {
    Date: string;
    Tipe: 'Deposit' | 'Withdrawal';
    Vaule: string;
}

export interface Transaction {
    date: string;
    type: 'Deposit' | 'Withdrawal';
    value: number;
    rawDate: Date;
    netValue: number;
    cumulative: number;
}

// Statistics Types
export interface MonthlyData {
    month: string;
    net: number;
}

export interface MoMChange {
    month: string;
    change: number;
    previousValue: number;
    currentValue: number;
}

export interface HistogramBucket {
    range: string;
    count: number;
    deposits: number;
    withdrawals: number;
    minValue: number;
    maxValue: number;
}

export interface LargestTransaction {
    type: 'Deposit' | 'Withdrawal';
    value: number;
    date: string;
}

export interface Statistics {
    totalDeposited: number;
    totalWithdrawn: number;
    netResult: number;
    depositCount: number;
    withdrawalCount: number;
    maxDeposit: number;
    maxWithdrawal: number;
    avgDeposit: number;
    avgWithdrawal: number;
    monthlyData: MonthlyData[];
    bestMonth: MonthlyData | null;
    worstMonth: MonthlyData | null;

    // Advanced Analytics
    roi: number;
    winRate: number;
    profitableMonths: number;
    trend: 'improving' | 'declining' | 'stable';
    trendValue: number;
    last3MonthsAvg: number;
    overallAvg: number;
    momChanges: MoMChange[];
    histogram: HistogramBucket[];
    insights: RichInsight[];
    avgDaysBetweenTransactions: number;
    largestTransaction: LargestTransaction | null;
    mostActiveMonth: string;
    distributionData: Array<{ name: string; value: number; count: number }>;

    // Peak & Valley (Best/Worst Moments)
    peakMoment: { date: string; balance: number } | null;
    valleyMoment: { date: string; balance: number } | null;
}

// Rich Insight for the new Insights section
export interface RichInsight {
    id: string;
    category: 'performance' | 'pattern' | 'recommendation';
    type: 'success' | 'warning' | 'danger' | 'info';
    icon: string;
    title: string;
    value?: string;
    description: string;
    trend?: 'up' | 'down' | 'stable';
    priority: number;
}

// Component Props Types
export interface StatCardProps {
    title: string;
    value: string;
    subValue?: string;
    icon?: LucideIcon;
    type?: 'success' | 'danger' | 'neutral' | 'primary';
    trend?: 'up' | 'down';
    variant?: 'default' | 'compact';
}

export interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        color: string;
    }>;
    label?: string;
}

export interface DashboardHeaderProps {
    startDate: string;
    endDate: string;
    minDate?: string;
    maxDate?: string;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
    onReload: () => void;
    onExportPDF: () => void;
    onExportPNG: () => void;
    onExportCSV?: () => void;
    onCompareProfiles?: () => void;
    onSignOut?: () => void;
    activeProfileId?: string | null;
    onProfileChange?: (profileId: string | null) => void;
    onManageProfiles?: () => void;
}

export interface TransactionTableProps {
    transactions: Transaction[];
    filterType: string;
    onFilterChange: (type: string) => void;
    itemsPerPage?: number;
}

export interface ChartProps {
    data: Transaction[] | MonthlyData[];
}

export interface KPISectionProps {
    stats: Statistics;
}

export interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    dangerous?: boolean;
}

export interface UploadScreenProps {
    onDataLoaded: (data: RawTransaction[]) => void;
}

export interface DashboardProps {
    rawData: RawTransaction[];
    onSignOut?: () => void;
    activeProfileId?: string | null;
    onProfileChange?: (profileId: string | null) => void;
    onManageProfiles?: () => void;
    onCompareProfiles?: () => void;
}

// Storage Types
export interface StoredData {
    transactions: RawTransaction[];
    uploadDate: string;
    version: string;
}

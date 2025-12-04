/**
 * Format a number as EUR currency in Portuguese locale
 */
export const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR'
    }).format(val);
};

/**
 * Format a date string to Portuguese locale
 */
export const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('pt-PT');
};

/**
 * Format a date for input[type="date"] (YYYY-MM-DD)
 */
export const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

/**
 * Parse a date string to Date object
 */
export const parseDate = (dateStr: string): Date => {
    return new Date(dateStr);
};

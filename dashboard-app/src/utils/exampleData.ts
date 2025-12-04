/**
 * Generate example CSV data for users to download
 */
export const generateExampleCSV = (): string => {
    const headers = ['Date', 'Tipe', 'Vaule'];

    const exampleData = [
        ['2024-01-15', 'Deposit', '50.00'],
        ['2024-01-20', 'Withdrawal', '75.50'],
        ['2024-02-05', 'Deposit', '100.00'],
        ['2024-02-12', 'Withdrawal', '150.00'],
        ['2024-03-01', 'Deposit', '80.00'],
        ['2024-03-10', 'Withdrawal', '120.75'],
        ['2024-03-25', 'Deposit', '60.00']
    ];

    return [headers.join(';'), ...exampleData.map(row => row.join(';'))].join('\n');
};

/**
 * Download example CSV file
 */
export const downloadExampleCSV = (): void => {
    const csvContent = generateExampleCSV();
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'betano_transactions_example.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

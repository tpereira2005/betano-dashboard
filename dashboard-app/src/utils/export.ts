import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Utility to yield to the main thread, allowing UI updates
 */
const yieldToMain = (): Promise<void> => {
    return new Promise(resolve => {
        requestAnimationFrame(() => {
            setTimeout(resolve, 0);
        });
    });
};

/**
 * Prepare element for export by adding export class
 */
const prepareForExport = (): void => {
    document.body.classList.add('exporting');
    // Scroll to top
    window.scrollTo(0, 0);
};

/**
 * Cleanup after export by removing export class
 */
const cleanupAfterExport = (): void => {
    document.body.classList.remove('exporting');
};

/**
 * Wait for charts to fully render
 */
const waitForChartsToRender = async (): Promise<void> => {
    await yieldToMain();
    // Give Recharts time to render all SVG elements
    await new Promise(resolve => setTimeout(resolve, 800));
};

/**
 * Export an element as PNG
 */
export const exportAsPNG = async (elementId: string, filename: string): Promise<void> => {
    try {
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error(`Element with id "${elementId}" not found`);
        }

        // Prepare for export
        prepareForExport();

        // Wait for charts to render
        await waitForChartsToRender();

        const canvas = await html2canvas(element, {
            backgroundColor: '#F0F2F5',
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
            imageTimeout: 15000,
            removeContainer: true,
            width: element.scrollWidth,
            height: element.scrollHeight,
            scrollX: 0,
            scrollY: -window.scrollY,
            x: 0,
            y: 0,
            onclone: (clonedDoc, clonedElement) => {
                clonedDoc.body.classList.add('exporting');
                // Force charts to be fully visible
                const charts = clonedElement.querySelectorAll('.recharts-wrapper, .recharts-surface');
                charts.forEach(chart => {
                    const el = chart as HTMLElement;
                    el.style.overflow = 'visible';
                });
            }
        });

        // Cleanup
        cleanupAfterExport();

        await yieldToMain();

        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL('image/png', 0.95);
        link.click();
    } catch (error) {
        cleanupAfterExport();
        console.error('Failed to export as PNG:', error);
        throw error;
    }
};

/**
 * Export dashboard as PDF
 */
export const exportDashboardAsPDF = async (elementId: string, filename: string): Promise<void> => {
    try {
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error(`Element with id "${elementId}" not found`);
        }

        // Prepare for export
        prepareForExport();

        // Wait for charts to render
        await waitForChartsToRender();

        const canvas = await html2canvas(element, {
            backgroundColor: '#F0F2F5',
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
            imageTimeout: 15000,
            removeContainer: true,
            width: element.scrollWidth,
            height: element.scrollHeight,
            scrollX: 0,
            scrollY: -window.scrollY,
            x: 0,
            y: 0,
            onclone: (clonedDoc, clonedElement) => {
                clonedDoc.body.classList.add('exporting');
                // Force charts to be fully visible
                const charts = clonedElement.querySelectorAll('.recharts-wrapper, .recharts-surface');
                charts.forEach(chart => {
                    const el = chart as HTMLElement;
                    el.style.overflow = 'visible';
                });
            }
        });

        // Cleanup
        cleanupAfterExport();

        await yieldToMain();

        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        });

        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Add additional pages if content is longer
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        await yieldToMain();

        pdf.save(`${filename}.pdf`);
    } catch (error) {
        cleanupAfterExport();
        console.error('Failed to export as PDF:', error);
        throw error;
    }
};

/**
 * Export a specific chart as PNG
 */
export const exportChartAsPNG = async (chartId: string, filename: string): Promise<void> => {
    return exportAsPNG(chartId, filename);
};

/**
 * Export transactions as CSV file
 */
export const exportTransactionsAsCSV = (
    transactions: Array<{ date: string; type: string; value: number; cumulative: number }>,
    filename: string
): void => {
    try {
        // CSV Headers
        const headers = ['Date', 'Type', 'Value', 'Cumulative Balance'];

        // Convert transactions to CSV rows
        const rows = transactions.map(t => [
            t.date,
            t.type === 'Deposit' ? 'Deposit' : 'Withdrawal',
            t.value.toFixed(2),
            t.cumulative.toFixed(2)
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(';'),
            ...rows.map(row => row.join(';'))
        ].join('\n');

        // Add UTF-8 BOM for Excel compatibility
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

        // Create download link
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Failed to export CSV:', error);
        throw error;
    }
};

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
 * Selectors for elements to hide during export
 */
const HIDE_DURING_EXPORT = [
    '.btn-theme-toggle',
    '.btn-signout',
    '.export-dropdown',
    '.header-separator',
    '.social-links',
    '.footer-social',
    '.version-badge',
    '.filter-controls',
    '.chart-download-btn',
    '[class*="download-btn"]'
];

/**
 * Hide elements before export and return restore function
 */
const hideElementsForExport = (container: HTMLElement): (() => void) => {
    const hiddenElements: { el: HTMLElement; originalDisplay: string }[] = [];

    HIDE_DURING_EXPORT.forEach(selector => {
        const elements = container.querySelectorAll(selector);
        elements.forEach(el => {
            const htmlEl = el as HTMLElement;
            hiddenElements.push({
                el: htmlEl,
                originalDisplay: htmlEl.style.display
            });
            htmlEl.style.display = 'none';
        });
    });

    // Return restore function
    return () => {
        hiddenElements.forEach(({ el, originalDisplay }) => {
            el.style.display = originalDisplay;
        });
    };
};

/**
 * Fix charts for export - ensure they are fully visible
 */
const fixChartsForExport = (container: HTMLElement): (() => void) => {
    const fixedElements: { el: HTMLElement; originalOverflow: string }[] = [];

    // Fix all Recharts wrapper elements
    const chartSelectors = [
        '.recharts-wrapper',
        '.recharts-surface',
        '.recharts-layer',
        '[class*="chart"]'
    ];

    chartSelectors.forEach(selector => {
        const elements = container.querySelectorAll(selector);
        elements.forEach(el => {
            const htmlEl = el as HTMLElement;
            fixedElements.push({
                el: htmlEl,
                originalOverflow: htmlEl.style.overflow
            });
            htmlEl.style.overflow = 'visible';
        });
    });

    // Also fix SVG elements
    const svgs = container.querySelectorAll('svg');
    svgs.forEach(svg => {
        fixedElements.push({
            el: svg as unknown as HTMLElement,
            originalOverflow: svg.style.overflow
        });
        svg.style.overflow = 'visible';
    });

    // Return restore function
    return () => {
        fixedElements.forEach(({ el, originalOverflow }) => {
            el.style.overflow = originalOverflow;
        });
    };
};

/**
 * Add padding to sections to help avoid page breaks cutting them
 * This adds a page-break-inside: avoid style to major sections
 */
const addPageBreakPadding = (container: HTMLElement): (() => void) => {
    const modifiedElements: { el: HTMLElement; originalStyles: { paddingBottom: string; marginBottom: string } }[] = [];

    // Find the insights section
    const insightsSection = container.querySelector('.insights-section, [class*="insights-"]');

    if (insightsSection) {
        // Get the previous sibling element and add padding to it
        const previousElement = insightsSection.previousElementSibling as HTMLElement;
        if (previousElement) {
            modifiedElements.push({
                el: previousElement,
                originalStyles: {
                    paddingBottom: previousElement.style.paddingBottom,
                    marginBottom: previousElement.style.marginBottom
                }
            });
            // Add large padding/margin to the element BEFORE insights
            // This creates gray background space, not white space in the card
            previousElement.style.paddingBottom = '300px';
            previousElement.style.marginBottom = '0px';
        }
    }

    // Return restore function
    return () => {
        modifiedElements.forEach(({ el, originalStyles }) => {
            el.style.paddingBottom = originalStyles.paddingBottom;
            el.style.marginBottom = originalStyles.marginBottom;
        });
    };
};

/**
 * Export an element as PNG
 */
export const exportAsPNG = async (elementId: string, filename: string): Promise<void> => {
    let restoreElements: (() => void) | null = null;
    let restoreCharts: (() => void) | null = null;

    try {
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error(`Element with id "${elementId}" not found`);
        }

        // Hide elements and fix charts before export
        restoreElements = hideElementsForExport(element);
        restoreCharts = fixChartsForExport(element);

        // Yield to let UI update
        await yieldToMain();

        const canvas = await html2canvas(element, {
            backgroundColor: '#F0F2F5',
            scale: 1.5,
            logging: false,
            useCORS: true,
            allowTaint: true,
            imageTimeout: 5000,
            removeContainer: true
        });

        // Restore elements and charts
        restoreElements();
        restoreCharts();
        restoreElements = null;
        restoreCharts = null;

        // Yield again before creating blob
        await yieldToMain();

        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL('image/png', 0.9);
        link.click();
    } catch (error) {
        // Restore elements on error
        if (restoreElements) restoreElements();
        if (restoreCharts) restoreCharts();
        console.error('Failed to export as PNG:', error);
        throw error;
    }
};

/**
 * Export dashboard as PDF
 */
export const exportDashboardAsPDF = async (elementId: string, filename: string): Promise<void> => {
    let restoreElements: (() => void) | null = null;
    let restoreCharts: (() => void) | null = null;
    let restorePageBreak: (() => void) | null = null;

    try {
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error(`Element with id "${elementId}" not found`);
        }

        // Hide elements, fix charts, and add page break padding before export
        restoreElements = hideElementsForExport(element);
        restoreCharts = fixChartsForExport(element);
        restorePageBreak = addPageBreakPadding(element);

        // Yield to let UI update (show loading indicator)
        await yieldToMain();

        const canvas = await html2canvas(element, {
            backgroundColor: '#F0F2F5',
            scale: 1.5,
            logging: false,
            useCORS: true,
            allowTaint: true,
            imageTimeout: 5000,
            removeContainer: true
        });

        // Restore elements, charts, and page breaks
        restoreElements();
        restoreCharts();
        restorePageBreak();
        restoreElements = null;
        restoreCharts = null;
        restorePageBreak = null;

        // Yield before PDF generation
        await yieldToMain();

        const imgData = canvas.toDataURL('image/jpeg', 0.85);
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

        // Yield before save
        await yieldToMain();

        pdf.save(`${filename}.pdf`);
    } catch (error) {
        // Restore elements on error
        if (restoreElements) restoreElements();
        if (restoreCharts) restoreCharts();
        if (restorePageBreak) restorePageBreak();
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
            t.type === 'Deposit' ? 'Deposit' : 'With drawal',
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


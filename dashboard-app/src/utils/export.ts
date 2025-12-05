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
    '.header-right',  // Hide entire right section (Export, New File, Theme, Signout buttons)
    '.chevron',       // Hide dropdown arrow from profile selector
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
 * Fix footer styling for export - remove shadows and gradient text effects
 * html2canvas doesn't support -webkit-background-clip: text and -webkit-text-fill-color
 */
const fixFooterForExport = (container: HTMLElement): (() => void) => {
    const modifiedElements: { el: HTMLElement; originalStyles: Record<string, string> }[] = [];

    // Find footer and its text elements
    const footerSelectors = ['.footer', '.footer-content', '.footer-text', '.footer-author'];

    footerSelectors.forEach(selector => {
        const elements = container.querySelectorAll(selector);
        elements.forEach(el => {
            const htmlEl = el as HTMLElement;
            const computed = window.getComputedStyle(htmlEl);

            modifiedElements.push({
                el: htmlEl,
                originalStyles: {
                    background: htmlEl.style.background,
                    backgroundClip: htmlEl.style.backgroundClip,
                    webkitBackgroundClip: (htmlEl.style as CSSStyleDeclaration & { webkitBackgroundClip: string }).webkitBackgroundClip || '',
                    webkitTextFillColor: (htmlEl.style as CSSStyleDeclaration & { webkitTextFillColor: string }).webkitTextFillColor || '',
                    color: htmlEl.style.color,
                    boxShadow: htmlEl.style.boxShadow,
                    textShadow: htmlEl.style.textShadow
                }
            });

            // Remove shadow effects
            htmlEl.style.boxShadow = 'none';
            htmlEl.style.textShadow = 'none';

            // Fix gradient text - set solid colors instead
            if (htmlEl.classList.contains('footer-text')) {
                htmlEl.style.background = 'none';
                (htmlEl.style as CSSStyleDeclaration & { webkitBackgroundClip: string }).webkitBackgroundClip = 'unset';
                (htmlEl.style as CSSStyleDeclaration & { webkitTextFillColor: string }).webkitTextFillColor = '#374151';
                htmlEl.style.color = '#374151';
            }

            if (htmlEl.classList.contains('footer-author')) {
                htmlEl.style.background = 'none';
                (htmlEl.style as CSSStyleDeclaration & { webkitBackgroundClip: string }).webkitBackgroundClip = 'unset';
                (htmlEl.style as CSSStyleDeclaration & { webkitTextFillColor: string }).webkitTextFillColor = '#FF3D00';
                htmlEl.style.color = '#FF3D00';
            }

            // Clean footer background
            if (htmlEl.classList.contains('footer')) {
                htmlEl.style.background = '#F0F2F5';
            }
        });
    });

    // Return restore function
    return () => {
        modifiedElements.forEach(({ el, originalStyles }) => {
            el.style.background = originalStyles.background;
            el.style.backgroundClip = originalStyles.backgroundClip;
            (el.style as CSSStyleDeclaration & { webkitBackgroundClip: string }).webkitBackgroundClip = originalStyles.webkitBackgroundClip;
            (el.style as CSSStyleDeclaration & { webkitTextFillColor: string }).webkitTextFillColor = originalStyles.webkitTextFillColor;
            el.style.color = originalStyles.color;
            el.style.boxShadow = originalStyles.boxShadow;
            el.style.textShadow = originalStyles.textShadow;
        });
    };
};

/**
 * Fix header layout for export:
 * 1. Replace date inputs with formatted text (html2canvas doesn't render native inputs well)
 * 2. Move dates to the right side
 */
const fixHeaderForExport = (container: HTMLElement): (() => void) => {
    const restoreActions: (() => void)[] = [];

    // Find elements
    const header = container.querySelector('.header-redesigned') as HTMLElement;
    const headerLeft = container.querySelector('.header-left') as HTMLElement;
    const headerCenter = container.querySelector('.header-center') as HTMLElement;
    const dateInputs = container.querySelectorAll('.date-input') as NodeListOf<HTMLInputElement>;

    // Set min-height on header to maintain height when we use absolute positioning
    // Capture actual height before any changes
    if (header) {
        const actualHeight = header.offsetHeight;
        const originalMinHeight = header.style.minHeight;
        header.style.minHeight = `${actualHeight}px`;
        restoreActions.push(() => {
            header.style.minHeight = originalMinHeight;
        });
    }

    // Push header-left to grow and push center to the right
    if (headerLeft) {
        const originalFlexGrow = headerLeft.style.flexGrow;
        headerLeft.style.flexGrow = '1';
        restoreActions.push(() => {
            headerLeft.style.flexGrow = originalFlexGrow;
        });
    }

    // Position header-center absolute right to flush it to the edge
    if (headerCenter) {
        const originalPosition = headerCenter.style.position;
        const originalRight = headerCenter.style.right;
        const originalTop = headerCenter.style.top;
        const originalTransform = headerCenter.style.transform;

        headerCenter.style.position = 'absolute';
        headerCenter.style.right = '24px'; // Match header's right padding
        headerCenter.style.top = '50%';
        headerCenter.style.transform = 'translateY(-50%)';

        restoreActions.push(() => {
            headerCenter.style.position = originalPosition;
            headerCenter.style.right = originalRight;
            headerCenter.style.top = originalTop;
            headerCenter.style.transform = originalTransform;
        });
    }

    // Replace each date input with a styled span showing the formatted date
    dateInputs.forEach(input => {
        const value = input.value; // format: yyyy-mm-dd
        if (value) {
            // Parse and format date as dd/mm/yyyy
            const [year, month, day] = value.split('-');
            const formattedDate = `${day}/${month}/${year}`;

            // Create span to replace input
            const span = document.createElement('span');
            span.textContent = formattedDate;
            span.className = 'date-input-export';
            span.style.cssText = `
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 8px;
                padding: 8px 12px;
                color: white;
                font-size: 0.875rem;
                font-weight: 500;
                font-family: Inter, system-ui, -apple-system, sans-serif;
                display: inline-block;
                min-width: 90px;
                text-align: center;
            `;

            // Hide input, insert span
            const originalDisplay = input.style.display;
            input.style.display = 'none';
            input.parentNode?.insertBefore(span, input.nextSibling);

            restoreActions.push(() => {
                input.style.display = originalDisplay;
                span.remove();
            });
        }
    });

    // Return restore function
    return () => {
        restoreActions.forEach(action => action());
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
    const modifiedElements: { el: HTMLElement; originalMarginTop: string }[] = [];

    // Find the insights card using the specific class we added
    const insightsCard = container.querySelector('.insights-card') as HTMLElement;

    if (insightsCard) {
        modifiedElements.push({
            el: insightsCard,
            originalMarginTop: insightsCard.style.marginTop
        });
        // Add large margin-top to push the entire card to the next page
        // margin-top creates space BEFORE the card using the app's background color (gray)
        insightsCard.style.marginTop = '180px';
    }

    // Return restore function
    return () => {
        modifiedElements.forEach(({ el, originalMarginTop }) => {
            el.style.marginTop = originalMarginTop;
        });
    };
};

/**
 * Export an element as PNG
 */
export const exportAsPNG = async (elementId: string, filename: string): Promise<void> => {
    let restoreElements: (() => void) | null = null;
    let restoreCharts: (() => void) | null = null;
    let restoreFooter: (() => void) | null = null;
    let restoreHeader: (() => void) | null = null;

    try {
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error(`Element with id "${elementId}" not found`);
        }

        // Hide elements, fix charts, footer and header before export
        restoreElements = hideElementsForExport(element);
        restoreCharts = fixChartsForExport(element);
        restoreFooter = fixFooterForExport(element);
        restoreHeader = fixHeaderForExport(element);

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

        // Restore elements, charts, footer and header
        restoreElements();
        restoreCharts();
        restoreFooter();
        restoreHeader();
        restoreElements = null;
        restoreCharts = null;
        restoreFooter = null;
        restoreHeader = null;

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
        if (restoreFooter) restoreFooter();
        if (restoreHeader) restoreHeader();
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
    let restoreFooter: (() => void) | null = null;
    let restoreHeader: (() => void) | null = null;

    try {
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error(`Element with id "${elementId}" not found`);
        }

        // Hide elements, fix charts, footer, header and add page break padding before export
        restoreElements = hideElementsForExport(element);
        restoreCharts = fixChartsForExport(element);
        restorePageBreak = addPageBreakPadding(element);
        restoreFooter = fixFooterForExport(element);
        restoreHeader = fixHeaderForExport(element);

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

        // Restore elements, charts, page breaks, footer and header
        restoreElements();
        restoreCharts();
        restorePageBreak();
        restoreFooter();
        restoreHeader();
        restoreElements = null;
        restoreCharts = null;
        restorePageBreak = null;
        restoreFooter = null;
        restoreHeader = null;

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
        if (restoreFooter) restoreFooter();
        if (restoreHeader) restoreHeader();
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


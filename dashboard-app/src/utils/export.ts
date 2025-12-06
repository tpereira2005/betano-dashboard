import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Export Event Types for coordinating with UI overlay
 */
export type ExportEventType = 'export-start' | 'export-progress' | 'export-complete' | 'export-error';

export interface ExportEventDetail {
    type: 'pdf' | 'png' | 'csv';
    progress?: number;
    error?: string;
}

/**
 * Dispatch export event for overlay coordination
 */
export const dispatchExportEvent = (eventType: ExportEventType, detail: ExportEventDetail): void => {
    window.dispatchEvent(new CustomEvent(eventType, { detail }));
};

/**
 * Subscribe to export events
 */
export const onExportEvent = (
    eventType: ExportEventType,
    handler: (event: CustomEvent<ExportEventDetail>) => void
): (() => void) => {
    const listener = (e: Event) => handler(e as CustomEvent<ExportEventDetail>);
    window.addEventListener(eventType, listener);
    return () => window.removeEventListener(eventType, listener);
};

/**
 * Utility to yield to the main thread, allowing UI updates
 * Uses longer delay to give browser time to process events
 */
const yieldToMain = (delay: number = 50): Promise<void> => {
    return new Promise(resolve => {
        requestAnimationFrame(() => {
            setTimeout(resolve, delay);
        });
    });
};

/**
 * Get the correct background color based on current theme
 */
const getExportBackgroundColor = (): string => {
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    return isDarkMode ? '#0D0E1A' : '#F0F2F5';
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

            // Detect dark mode
            const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';

            // Fix gradient text - set solid colors based on theme
            if (htmlEl.classList.contains('footer-text')) {
                htmlEl.style.background = 'none';
                (htmlEl.style as CSSStyleDeclaration & { webkitBackgroundClip: string }).webkitBackgroundClip = 'unset';
                const textColor = isDarkMode ? '#B0B8C4' : '#374151';
                (htmlEl.style as CSSStyleDeclaration & { webkitTextFillColor: string }).webkitTextFillColor = textColor;
                htmlEl.style.color = textColor;
            }

            if (htmlEl.classList.contains('footer-author')) {
                htmlEl.style.background = 'none';
                (htmlEl.style as CSSStyleDeclaration & { webkitBackgroundClip: string }).webkitBackgroundClip = 'unset';
                (htmlEl.style as CSSStyleDeclaration & { webkitTextFillColor: string }).webkitTextFillColor = '#FF3D00';
                htmlEl.style.color = '#FF3D00';
            }

            // Clean footer background - use correct theme color
            if (htmlEl.classList.contains('footer')) {
                htmlEl.style.background = getExportBackgroundColor();
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
 * Add page break avoidance to sections to prevent them from being cut
 * Uses CSS break-inside: avoid and page-break-inside: avoid
 */
const addPageBreakPadding = (container: HTMLElement): (() => void) => {
    const modifiedElements: { el: HTMLElement; originalStyles: Record<string, string> }[] = [];

    // Selectors for sections that should not be split across pages
    const sectionsToProtect = [
        '.insights-card',       // Insights section
        '.insights-grid',       // Insights grid
        '.insight-card',        // Individual insight cards
        '.kpi-section',         // KPI cards
        '.charts-section',      // Charts section
        '.chart-card',          // Individual chart cards
        '.table-section',       // Transaction table
        '.mom-chart-wrapper',   // Month over month chart
        '[class*="stat-card"]'  // Stat cards
    ];

    sectionsToProtect.forEach(selector => {
        const elements = container.querySelectorAll(selector);
        elements.forEach(el => {
            const htmlEl = el as HTMLElement;
            modifiedElements.push({
                el: htmlEl,
                originalStyles: {
                    breakInside: htmlEl.style.breakInside || '',
                    pageBreakInside: (htmlEl.style as CSSStyleDeclaration & { pageBreakInside: string }).pageBreakInside || '',
                    webkitColumnBreakInside: (htmlEl.style as CSSStyleDeclaration & { webkitColumnBreakInside: string }).webkitColumnBreakInside || ''
                }
            });

            // Apply break avoidance properties
            htmlEl.style.breakInside = 'avoid';
            (htmlEl.style as CSSStyleDeclaration & { pageBreakInside: string }).pageBreakInside = 'avoid';
            (htmlEl.style as CSSStyleDeclaration & { webkitColumnBreakInside: string }).webkitColumnBreakInside = 'avoid';
        });
    });

    // Special handling for insights section - add margin to push to new page if needed
    const insightsCard = container.querySelector('.insights-card') as HTMLElement;
    if (insightsCard) {
        modifiedElements.push({
            el: insightsCard,
            originalStyles: {
                marginTop: insightsCard.style.marginTop,
                paddingTop: insightsCard.style.paddingTop,
                breakBefore: insightsCard.style.breakBefore || ''
            }
        });
        // Force page break before insights if it would be cut
        insightsCard.style.marginTop = '50px';
        insightsCard.style.paddingTop = '20px';
        insightsCard.style.breakBefore = 'auto';
    }

    // Return restore function
    return () => {
        modifiedElements.forEach(({ el, originalStyles }) => {
            Object.entries(originalStyles).forEach(([key, value]) => {
                (el.style as Record<string, string>)[key] = value;
            });
        });
    };
};

/**
 * Export an element as PNG
 */
export const exportAsPNG = async (elementId: string, filename: string): Promise<void> => {
    // Dispatch start event for overlay
    dispatchExportEvent('export-start', { type: 'png' });

    let restoreElements: (() => void) | null = null;
    let restoreCharts: (() => void) | null = null;
    let restoreFooter: (() => void) | null = null;
    let restoreHeader: (() => void) | null = null;

    try {
        // Small initial yield to allow overlay to render
        await yieldToMain(100);

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
            backgroundColor: getExportBackgroundColor(),
            scale: 1.2, // Reduced for better performance
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

        // Dispatch complete event
        dispatchExportEvent('export-complete', { type: 'png' });
    } catch (error) {
        // Restore elements on error
        if (restoreElements) restoreElements();
        if (restoreCharts) restoreCharts();
        if (restoreFooter) restoreFooter();
        if (restoreHeader) restoreHeader();
        console.error('Failed to export as PNG:', error);

        // Dispatch error event
        dispatchExportEvent('export-error', {
            type: 'png',
            error: error instanceof Error ? error.message : 'Export failed'
        });
        throw error;
    }
};

/**
 * Export dashboard as PDF
 */
export const exportDashboardAsPDF = async (elementId: string, filename: string): Promise<void> => {
    // Dispatch start event for overlay
    dispatchExportEvent('export-start', { type: 'pdf' });

    let restoreElements: (() => void) | null = null;
    let restoreCharts: (() => void) | null = null;
    let restorePageBreak: (() => void) | null = null;
    let restoreFooter: (() => void) | null = null;
    let restoreHeader: (() => void) | null = null;

    try {
        // Small initial yield to allow overlay to render
        await yieldToMain(100);

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
            backgroundColor: getExportBackgroundColor(),
            scale: 1.2, // Reduced for better performance
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

        // Get background color for filling pages
        const bgColor = getExportBackgroundColor();
        // Convert hex to RGB for jsPDF
        const hexToRgb = (hex: string) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : { r: 240, g: 242, b: 245 };
        };
        const rgb = hexToRgb(bgColor);

        // Fill first page with background color
        pdf.setFillColor(rgb.r, rgb.g, rgb.b);
        pdf.rect(0, 0, imgWidth, pageHeight, 'F');

        // Add first page image
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Add additional pages if content is longer
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            // Fill each new page with background color
            pdf.setFillColor(rgb.r, rgb.g, rgb.b);
            pdf.rect(0, 0, imgWidth, pageHeight, 'F');
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // Yield before save
        await yieldToMain();

        pdf.save(`${filename}.pdf`);

        // Dispatch complete event
        dispatchExportEvent('export-complete', { type: 'pdf' });
    } catch (error) {
        // Restore elements on error
        if (restoreElements) restoreElements();
        if (restoreCharts) restoreCharts();
        if (restorePageBreak) restorePageBreak();
        if (restoreFooter) restoreFooter();
        if (restoreHeader) restoreHeader();
        console.error('Failed to export as PDF:', error);

        // Dispatch error event
        dispatchExportEvent('export-error', {
            type: 'pdf',
            error: error instanceof Error ? error.message : 'Export failed'
        });
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


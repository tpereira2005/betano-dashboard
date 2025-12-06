/**
 * Export Web Worker
 * 
 * Handles heavy processing off the main thread:
 * - Converts ImageData to PNG blob using OffscreenCanvas
 * - Generates PDF from image data using jspdf
 * 
 * This keeps the UI responsive during export operations.
 */

import jsPDF from 'jspdf';

// Message types
interface ExportWorkerMessage {
    type: 'GENERATE_PNG' | 'GENERATE_PDF';
    imageData: ImageData;
    width: number;
    height: number;
    filename: string;
    pdfOptions?: {
        pageWidth: number;
        pageHeight: number;
        backgroundColor: string;
    };
}

interface ExportWorkerResponse {
    type: 'SUCCESS' | 'ERROR';
    blobUrl?: string;
    error?: string;
}

/**
 * Convert ImageData to PNG blob using OffscreenCanvas
 */
const imageDataToPngBlob = async (
    imageData: ImageData,
    width: number,
    height: number
): Promise<Blob> => {
    const offscreen = new OffscreenCanvas(width, height);
    const ctx = offscreen.getContext('2d');

    if (!ctx) {
        throw new Error('Could not get 2d context from OffscreenCanvas');
    }

    ctx.putImageData(imageData, 0, 0);

    const blob = await offscreen.convertToBlob({
        type: 'image/png',
        quality: 0.95
    });

    return blob;
};

/**
 * Generate PDF from image blob
 */
const generatePdfFromBlob = async (
    imageBlob: Blob,
    width: number,
    height: number,
    options: ExportWorkerMessage['pdfOptions']
): Promise<Blob> => {
    const imgWidth = options?.pageWidth || 210; // A4 width in mm
    const pageHeight = options?.pageHeight || 297; // A4 height in mm
    const imgHeight = (height * imgWidth) / width;

    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
    });

    // Convert blob to base64
    const arrayBuffer = await imageBlob.arrayBuffer();
    const base64 = btoa(
        new Uint8Array(arrayBuffer)
            .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    const imgData = `data:image/png;base64,${base64}`;

    // Get background color
    const bgColor = options?.backgroundColor || '#F0F2F5';
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
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if content is longer
    while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.setFillColor(rgb.r, rgb.g, rgb.b);
        pdf.rect(0, 0, imgWidth, pageHeight, 'F');
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
    }

    // Return as blob
    return pdf.output('blob');
};

/**
 * Worker message handler
 */
self.onmessage = async (e: MessageEvent<ExportWorkerMessage>) => {
    const { type, imageData, width, height, pdfOptions } = e.data;

    try {
        if (type === 'GENERATE_PNG') {
            const pngBlob = await imageDataToPngBlob(imageData, width, height);
            const blobUrl = URL.createObjectURL(pngBlob);

            const response: ExportWorkerResponse = {
                type: 'SUCCESS',
                blobUrl
            };
            self.postMessage(response);
        }
        else if (type === 'GENERATE_PDF') {
            // First generate PNG
            const pngBlob = await imageDataToPngBlob(imageData, width, height);

            // Then convert to PDF
            const pdfBlob = await generatePdfFromBlob(pngBlob, width, height, pdfOptions);
            const blobUrl = URL.createObjectURL(pdfBlob);

            const response: ExportWorkerResponse = {
                type: 'SUCCESS',
                blobUrl
            };
            self.postMessage(response);
        }
    } catch (error) {
        const response: ExportWorkerResponse = {
            type: 'ERROR',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        self.postMessage(response);
    }
};

export { };

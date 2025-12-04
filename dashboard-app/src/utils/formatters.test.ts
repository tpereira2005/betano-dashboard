import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatDateForInput, parseDate } from './formatters';

describe('formatCurrency', () => {
    it('should format positive numbers with EUR symbol', () => {
        const result = formatCurrency(100);
        expect(result).toContain('100');
        expect(result).toContain('€');
    });

    it('should format negative numbers correctly', () => {
        const result = formatCurrency(-50.5);
        expect(result).toContain('50');
        expect(result).toContain('€');
    });

    it('should format zero', () => {
        const result = formatCurrency(0);
        expect(result).toContain('0');
        expect(result).toContain('€');
    });

    it('should format decimal values correctly', () => {
        const result = formatCurrency(123.45);
        expect(result).toContain('123');
        expect(result).toContain('45');
    });

    it('should format large numbers', () => {
        const result = formatCurrency(1000000);
        // Portuguese locale uses spaces/dots for thousands
        expect(result).toContain('€');
    });
});

describe('formatDate', () => {
    it('should format ISO date to Portuguese locale', () => {
        const result = formatDate('2024-12-25');
        // Portuguese format: DD/MM/YYYY
        expect(result).toMatch(/25.*12.*2024/);
    });

    it('should handle full ISO datetime', () => {
        const result = formatDate('2024-06-15T10:30:00Z');
        expect(result).toMatch(/15.*06.*2024/);
    });
});

describe('formatDateForInput', () => {
    it('should format Date to YYYY-MM-DD string', () => {
        const date = new Date('2024-03-15T12:00:00Z');
        const result = formatDateForInput(date);
        expect(result).toBe('2024-03-15');
    });

    it('should handle different dates correctly', () => {
        const date = new Date('2023-01-01T00:00:00Z');
        const result = formatDateForInput(date);
        expect(result).toBe('2023-01-01');
    });
});

describe('parseDate', () => {
    it('should parse ISO date string to Date object', () => {
        const result = parseDate('2024-06-15');
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2024);
        expect(result.getMonth()).toBe(5); // 0-indexed
        expect(result.getDate()).toBe(15);
    });

    it('should parse full datetime string', () => {
        const result = parseDate('2024-12-25T10:30:00Z');
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2024);
    });
});

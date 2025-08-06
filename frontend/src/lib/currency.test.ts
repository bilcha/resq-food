import { describe, it, expect } from 'vitest';
import { formatPrice, formatPriceWithCurrency, CURRENCY } from './currency';

describe('currency utilities', () => {
  describe('CURRENCY constant', () => {
    it('should have correct currency properties', () => {
      expect(CURRENCY.CODE).toBe('UAH');
      expect(CURRENCY.SYMBOL).toBe('₴');
      expect(CURRENCY.NAME).toBe('Ukrainian Hryvna');
    });
  });

  describe('formatPrice', () => {
    it('should format regular price with currency symbol', () => {
      expect(formatPrice(100)).toBe('₴100.00');
      expect(formatPrice(50.5)).toBe('₴50.50');
      expect(formatPrice(0.99)).toBe('₴0.99');
    });

    it('should return "Безкоштовно" for free items', () => {
      expect(formatPrice(0, true)).toBe('Безкоштовно');
      expect(formatPrice(100, true)).toBe('Безкоштовно');
    });

    it('should handle zero price as regular price by default', () => {
      expect(formatPrice(0)).toBe('₴0.00');
    });
  });

  describe('formatPriceWithCurrency', () => {
    it('should format regular price with currency code', () => {
      expect(formatPriceWithCurrency(100)).toBe('100.00 UAH');
      expect(formatPriceWithCurrency(50.5)).toBe('50.50 UAH');
      expect(formatPriceWithCurrency(0.99)).toBe('0.99 UAH');
    });

    it('should return "Безкоштовно" for free items', () => {
      expect(formatPriceWithCurrency(0, true)).toBe('Безкоштовно');
      expect(formatPriceWithCurrency(100, true)).toBe('Безкоштовно');
    });

    it('should handle zero price as regular price by default', () => {
      expect(formatPriceWithCurrency(0)).toBe('0.00 UAH');
    });
  });
}); 
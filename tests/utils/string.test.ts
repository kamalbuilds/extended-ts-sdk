import { isHexString, ensureHexPrefix, removeHexPrefix, padHexString } from '../../utils/string';

describe('String utilities', () => {
  describe('isHexString', () => {
    test('should return true for valid hex strings', () => {
      expect(isHexString('0x123abc')).toBe(true);
      expect(isHexString('123abc')).toBe(true);
      expect(isHexString('0x0')).toBe(true);
      expect(isHexString('ABCDEF')).toBe(true);
    });

    test('should return false for invalid hex strings', () => {
      expect(isHexString('0xG')).toBe(false);
      expect(isHexString('xyz')).toBe(false);
      expect(isHexString('')).toBe(false);
      expect(isHexString('0x')).toBe(false);
    });
  });

  describe('ensureHexPrefix', () => {
    test('should add 0x prefix if missing', () => {
      expect(ensureHexPrefix('123abc')).toBe('0x123abc');
      expect(ensureHexPrefix('0')).toBe('0x0');
    });

    test('should not add 0x prefix if already present', () => {
      expect(ensureHexPrefix('0x123abc')).toBe('0x123abc');
      expect(ensureHexPrefix('0x0')).toBe('0x0');
    });
  });

  describe('removeHexPrefix', () => {
    test('should remove 0x prefix if present', () => {
      expect(removeHexPrefix('0x123abc')).toBe('123abc');
      expect(removeHexPrefix('0x0')).toBe('0');
    });

    test('should not change string if no 0x prefix', () => {
      expect(removeHexPrefix('123abc')).toBe('123abc');
      expect(removeHexPrefix('0')).toBe('0');
    });
  });

  describe('padHexString', () => {
    test('should pad hex string to specified length', () => {
      expect(padHexString('0x123', 6)).toBe('0x000123');
      expect(padHexString('abc', 6)).toBe('0x000abc');
    });

    test('should not change string if already correct length', () => {
      expect(padHexString('0x123abc', 6)).toBe('0x123abc');
    });

    test('should not truncate longer strings', () => {
      expect(padHexString('0x123abcdef', 6)).toBe('0x123abcdef');
    });
  });
});
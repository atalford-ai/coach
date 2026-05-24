import { describe, it, expect, vi } from 'vitest';
import { generateCode } from '../../utils/generateCode';

describe('generateCode', () => {
  it('returns a 6-character string', () => {
    const code = generateCode();
    expect(code).toHaveLength(6);
    expect(typeof code).toBe('string');
  });

  it('only contains valid characters', () => {
    const validChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const code = generateCode();
    for (const char of code) {
      expect(validChars).toContain(char);
    }
  });

  it('does not contain forbidden characters (0, 1, I, O)', () => {
    const code = generateCode();
    expect(code).not.toMatch(/[0IOUI]/);
  });

  it('generates different codes on multiple calls', () => {
    const codes = new Set();
    for (let i = 0; i < 10; i++) {
      codes.add(generateCode());
    }
    // Should have more than 1 unique code from 10 attempts
    expect(codes.size).toBeGreaterThan(1);
  });
});

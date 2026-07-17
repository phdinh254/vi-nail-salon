import { normalizeVietnamesePhone } from './phone';

describe('normalizeVietnamesePhone', () => {
  it('leaves an already-domestic number unchanged', () => {
    expect(normalizeVietnamesePhone('0909111222')).toBe('0909111222');
  });

  it('converts the +84 international form to the domestic 0-prefixed form', () => {
    expect(normalizeVietnamesePhone('+84909111222')).toBe('0909111222');
  });

  it('trims surrounding whitespace before normalizing', () => {
    expect(normalizeVietnamesePhone('  +84909111222  ')).toBe('0909111222');
  });

  it('makes the domestic and international forms of the same number equal', () => {
    expect(normalizeVietnamesePhone('0909111222')).toBe(normalizeVietnamesePhone('+84909111222'));
  });

  it('returns an invalid number as-is rather than mangling it', () => {
    expect(normalizeVietnamesePhone('123')).toBe('123');
    expect(normalizeVietnamesePhone('0109111222')).toBe('0109111222');
  });
});

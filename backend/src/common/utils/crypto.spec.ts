import { hashToken } from './crypto';

describe('hashToken', () => {
  it('is deterministic — the same input always hashes to the same output', () => {
    expect(hashToken('my-raw-token')).toBe(hashToken('my-raw-token'));
  });

  it('produces different hashes for different inputs', () => {
    expect(hashToken('token-a')).not.toBe(hashToken('token-b'));
  });

  it('never returns the raw input (the hash cannot be reversed to it)', () => {
    const raw = 'super-secret-refresh-token';
    expect(hashToken(raw)).not.toContain(raw);
  });

  it('produces a 64-character hex string (SHA-256)', () => {
    expect(hashToken('anything')).toMatch(/^[0-9a-f]{64}$/);
  });
});

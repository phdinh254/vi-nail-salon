import { createHash } from 'crypto';

/** Deterministic one-way hash used for refresh tokens and guest-access tokens — only the hash
 * is ever persisted, never the raw token, so a DB read alone can't be replayed as a credential. */
export function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

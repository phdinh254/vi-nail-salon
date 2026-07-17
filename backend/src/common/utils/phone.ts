import { VIETNAM_PHONE_REGEX } from '../constants';

/**
 * The DB stores phone as the unique key linking guests, customers, and staff accounts, but the
 * regex accepts both the domestic "0xxxxxxxxx" and international "+84xxxxxxxxx" forms as
 * distinct strings — without normalizing, the same person using both forms across visits would
 * silently become two different "customers" with no shared history. Always store/compare the
 * domestic form.
 */
export function normalizeVietnamesePhone(phone: string): string {
  const trimmed = phone.trim();
  if (!VIETNAM_PHONE_REGEX.test(trimmed)) return trimmed;
  return trimmed.startsWith('+84') ? `0${trimmed.slice(3)}` : trimmed;
}

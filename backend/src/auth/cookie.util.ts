import type { Response } from 'express';
import {
  ACCESS_TOKEN_COOKIE,
  CSRF_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '../common/constants';
import type { TokenPair } from './auth.service';

const isProd = process.env.NODE_ENV === 'production';

/** `/api/auth` scope so the browser only ever sends the refresh token to the refresh/logout routes. */
const REFRESH_COOKIE_PATH = '/api/auth';

export function setAuthCookies(res: Response, tokens: TokenPair) {
  res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    expires: tokens.accessTokenExpiresAt,
  });
  res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: REFRESH_COOKIE_PATH,
    expires: tokens.refreshTokenExpiresAt,
  });
  // Not httpOnly — the frontend reads this and echoes it back via a custom header
  // (double-submit pattern) to prove the request came from same-site JS, not a forged form.
  res.cookie(CSRF_TOKEN_COOKIE, tokens.csrfToken, {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    expires: tokens.refreshTokenExpiresAt,
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_TOKEN_COOKIE, { path: '/' });
  res.clearCookie(REFRESH_TOKEN_COOKIE, { path: REFRESH_COOKIE_PATH });
  res.clearCookie(CSRF_TOKEN_COOKIE, { path: '/' });
}

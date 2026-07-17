import { ForbiddenException, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { CSRF_TOKEN_COOKIE, CSRF_TOKEN_HEADER } from '../constants';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Double-submit CSRF check for cookie-authenticated mutating requests. Public routes are
 * exempt: they either don't rely on the auth cookie (guest booking uses an explicit Bearer
 * token, which a forged cross-site request can't attach) or don't mutate protected state.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (SAFE_METHODS.has(request.method)) return true;

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const cookieToken = request.cookies?.[CSRF_TOKEN_COOKIE] as string | undefined;
    const headerToken = request.headers[CSRF_TOKEN_HEADER];
    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      throw new ForbiddenException('Thiếu hoặc sai CSRF token.');
    }
    return true;
  }
}

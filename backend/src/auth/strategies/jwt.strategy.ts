import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { ACCESS_TOKEN_COOKIE } from '../../common/constants';
import type { AuthenticatedUser, JwtPayload } from '../jwt.types';

/** Reads the access token from the httpOnly cookie — never from a header the frontend sets. */
function extractFromCookie(req: Request): string | null {
  const token = req.cookies?.[ACCESS_TOKEN_COOKIE] as string | undefined;
  return token ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: extractFromCookie,
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('Tài khoản không còn tồn tại.');
    // Re-checked on every request (not cached in the token) so a lock takes effect immediately.
    if (!user.isActive) throw new ForbiddenException('Tài khoản đã bị khóa.');
    return { id: user.id, phone: user.phone, name: user.name, role: user.role };
  }
}

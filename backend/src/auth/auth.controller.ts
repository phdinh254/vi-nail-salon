import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ExchangeGuestTokenDto } from './dto/exchange-guest-token.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { REFRESH_TOKEN_COOKIE } from '../common/constants';
import { setAuthCookies, clearAuthCookies } from './cookie.util';
import type { AuthenticatedUser } from './jwt.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, ...tokens } = await this.authService.login(dto.phone, dto.password);
    setAuthCookies(res, tokens);
    return { user: { id: user.sub, name: user.name, phone: user.phone, role: user.role } };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { user, ...tokens } = await this.authService.registerCustomer(
      dto.name,
      dto.phone,
      dto.password,
    );
    setAuthCookies(res, tokens);
    return { user: { id: user.sub, name: user.name, phone: user.phone, role: user.role } };
  }

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rawRefreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;
    if (!rawRefreshToken) {
      clearAuthCookies(res);
      return { user: null };
    }
    try {
      const { user, ...tokens } = await this.authService.refresh(rawRefreshToken);
      setAuthCookies(res, tokens);
      return { user: { id: user.sub, name: user.name, phone: user.phone, role: user.role } };
    } catch (err) {
      // Expired, already-revoked, reuse-detected, or the account got locked mid-session — in
      // every failure case the client's cookies (including the non-httpOnly CSRF marker) are
      // now stale. Clear them here so the frontend stops treating "might have a session" as
      // true and retrying refresh on every subsequent 401 forever.
      clearAuthCookies(res);
      throw err;
    }
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rawRefreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;
    await this.authService.logout(rawRefreshToken);
    clearAuthCookies(res);
    return { ok: true };
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestOtp(dto.phone);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.phone, dto.code);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('guest-access/exchange')
  @HttpCode(HttpStatus.OK)
  exchangeGuestAccess(@Body() dto: ExchangeGuestTokenDto) {
    return this.authService.exchangeGuestAccessToken(dto.token);
  }

  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}

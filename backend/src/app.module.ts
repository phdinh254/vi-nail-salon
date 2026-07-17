import { Injectable, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { CsrfGuard } from './common/guards/csrf.guard';
import { ServicesModule } from './services/services.module';
import { StaffModule } from './staff/staff.module';
import { NailDesignsModule } from './nail-designs/nail-designs.module';
import { FavoritesModule } from './favorites/favorites.module';
import { PromotionsModule } from './promotions/promotions.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { AvailabilityModule } from './availability/availability.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { TimeOffModule } from './time-off/time-off.module';
import { HealthModule } from './health/health.module';
import { TestingModule } from './testing/testing.module';

const isTestEnv = process.env.NODE_ENV === 'test';

/**
 * `.overrideGuard(ThrottlerGuard)` in Nest's testing module does not reliably intercept
 * guards registered via the multi-provider `APP_GUARD` token, so e2e tests that log in more
 * than a few times end up 429'd by the real throttler. Swap in a no-op class instead —
 * gated on NODE_ENV=test (which Jest sets automatically) so production/dev are unaffected.
 */
@Injectable()
class NoopThrottlerGuard {
  canActivate() {
    return true;
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Global default for unauthenticated-endpoint browsing (catalog pages, session checks,
    // etc.) — public read endpoints can be hit several times per page view, so this only needs
    // to guard against real abuse, not normal browsing. Sensitive endpoints (login, OTP,
    // register, refresh) carry their own much stricter @Throttle() overrides regardless.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 200 }]),
    PrismaModule,
    AuthModule,
    ServicesModule,
    StaffModule,
    NailDesignsModule,
    FavoritesModule,
    PromotionsModule,
    ReviewsModule,
    AppointmentsModule,
    AvailabilityModule,
    PaymentsModule,
    NotificationsModule,
    AuditLogModule,
    TimeOffModule,
    HealthModule,
    // Only registered when NODE_ENV=test — the /test-only/* routes don't exist at all
    // (true 404, not a runtime check) in development or production.
    ...(isTestEnv ? [TestingModule] : []),
  ],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: isTestEnv ? NoopThrottlerGuard : ThrottlerGuard },
    { provide: APP_GUARD, useClass: CsrfGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}

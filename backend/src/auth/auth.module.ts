import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SMS_PROVIDER } from './sms/sms-provider.interface';
import { ConsoleSmsProvider } from './sms/console-sms.provider';
import { TestSmsProvider } from './sms/test.sms-provider';

const isTestEnv = process.env.NODE_ENV === 'test';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    ...(isTestEnv
      ? [TestSmsProvider, { provide: SMS_PROVIDER, useExisting: TestSmsProvider }]
      : [{ provide: SMS_PROVIDER, useClass: ConsoleSmsProvider }]),
  ],
  exports: [AuthService, ...(isTestEnv ? [TestSmsProvider] : [])],
})
export class AuthModule {}

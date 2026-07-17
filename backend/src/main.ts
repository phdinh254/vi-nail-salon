import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

function resolveCorsOrigins(): string[] | boolean {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (raw) {
    return raw.split(',').map((origin) => origin.trim()).filter(Boolean);
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'CORS_ORIGIN chưa được cấu hình. Production bắt buộc phải khai báo danh sách origin hợp lệ (phân tách bằng dấu phẩy).',
    );
  }
  // Mặc định cho dev: chỉ cho phép frontend chạy trên localhost.
  return ['http://localhost:3000'];
}

function assertRequiredEnv() {
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Thiếu biến môi trường bắt buộc: ${missing.join(', ')}`);
  }
}

async function bootstrap() {
  assertRequiredEnv();
  const corsOrigins = resolveCorsOrigins();

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.enableCors({ origin: corsOrigins, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3001);
}

bootstrap().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error('Không thể khởi động backend:', message);
  process.exit(1);
});

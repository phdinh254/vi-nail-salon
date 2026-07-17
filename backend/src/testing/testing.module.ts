import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TestOnlyController } from './test-only.controller';

/** Only ever imported by AppModule when NODE_ENV=test — see app.module.ts. */
@Module({
  imports: [AuthModule],
  controllers: [TestOnlyController],
})
export class TestingModule {}

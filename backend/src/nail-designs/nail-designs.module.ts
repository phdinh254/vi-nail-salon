import { Module } from '@nestjs/common';
import { NailDesignsController } from './nail-designs.controller';
import { NailDesignsService } from './nail-designs.service';

@Module({
  controllers: [NailDesignsController],
  providers: [NailDesignsService],
  exports: [NailDesignsService],
})
export class NailDesignsModule {}

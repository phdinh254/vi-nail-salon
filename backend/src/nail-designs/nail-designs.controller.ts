import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { NailDesignsService } from './nail-designs.service';
import { CreateNailDesignDto } from './dto/create-nail-design.dto';
import { UpdateNailDesignDto } from './dto/update-nail-design.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('nail-designs')
export class NailDesignsController {
  constructor(private readonly nailDesignsService: NailDesignsService) {}

  @Public()
  @Get()
  findAll() {
    return this.nailDesignsService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nailDesignsService.findById(id);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateNailDesignDto) {
    return this.nailDesignsService.create(dto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateNailDesignDto) {
    return this.nailDesignsService.update(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nailDesignsService.remove(id);
  }
}

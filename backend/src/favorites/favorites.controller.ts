import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { FavoritesService } from './favorites.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt.types';

@Controller('favorites')
@Roles(UserRole.CUSTOMER)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.favoritesService.findAllForUser(user.id);
  }

  @Post(':nailDesignId')
  add(@CurrentUser() user: AuthenticatedUser, @Param('nailDesignId') nailDesignId: string) {
    return this.favoritesService.add(user.id, nailDesignId);
  }

  @Delete(':nailDesignId')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('nailDesignId') nailDesignId: string) {
    return this.favoritesService.remove(user.id, nailDesignId);
  }
}

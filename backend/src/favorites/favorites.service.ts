import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForUser(userId: string) {
    const favorites = await this.prisma.favoriteNailDesign.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { nailDesign: true },
    });
    return favorites.map((f) => f.nailDesign);
  }

  async add(userId: string, nailDesignId: string) {
    const design = await this.prisma.nailDesign.findUnique({ where: { id: nailDesignId } });
    if (!design) throw new NotFoundException('Không tìm thấy mẫu nail.');

    // Idempotent: favoriting an already-favorited design just confirms the current state
    // instead of erroring — the unique (userId, nailDesignId) PK makes this a safe upsert.
    await this.prisma.favoriteNailDesign.upsert({
      where: { userId_nailDesignId: { userId, nailDesignId } },
      create: { userId, nailDesignId },
      update: {},
    });
    return { favorited: true };
  }

  async remove(userId: string, nailDesignId: string) {
    // Idempotent: removing a favorite that doesn't exist (or was never the caller's) is a
    // no-op rather than a 404 — the where clause scopes deletion to this user's own row only,
    // so it's impossible to delete another customer's favorite via this path.
    await this.prisma.favoriteNailDesign.deleteMany({ where: { userId, nailDesignId } });
    return { favorited: false };
  }
}

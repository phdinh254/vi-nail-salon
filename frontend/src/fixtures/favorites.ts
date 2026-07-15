export type FavoriteEntry = { customerPhone: string; nailDesignId: string };

export const favoriteNailDesigns: FavoriteEntry[] = [
  { customerPhone: "0909111222", nailDesignId: "nd-french-ombre-ket-hop" },
  { customerPhone: "0909111222", nailDesignId: "nd-chrome-anh-bac" },
  { customerPhone: "0909111222", nailDesignId: "nd-dinh-da-3d-sang-trong" },
];

export function getFavoriteDesignIds(phone: string): string[] {
  return favoriteNailDesigns.filter((f) => f.customerPhone === phone).map((f) => f.nailDesignId);
}

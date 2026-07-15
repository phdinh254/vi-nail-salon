export const NAIL_DESIGN_STYLES = [
  "MINIMALIST",
  "FRENCH",
  "OMBRE",
  "CHROME",
  "3D_ART",
  "SEASONAL",
] as const;

export type NailDesignStyle = (typeof NAIL_DESIGN_STYLES)[number];

export const nailDesignStyleLabel: Record<NailDesignStyle, string> = {
  MINIMALIST: "Tối giản",
  FRENCH: "French",
  OMBRE: "Ombré",
  CHROME: "Chrome",
  "3D_ART": "Đính đá 3D",
  SEASONAL: "Theo mùa",
};

export type NailDesignColor =
  | "NUDE"
  | "RED"
  | "PINK"
  | "WHITE"
  | "BLACK"
  | "GOLD"
  | "PASTEL";

export const nailDesignColorLabel: Record<NailDesignColor, string> = {
  NUDE: "Nude",
  RED: "Đỏ",
  PINK: "Hồng",
  WHITE: "Trắng",
  BLACK: "Đen",
  GOLD: "Ánh kim",
  PASTEL: "Pastel",
};

export type NailDesign = {
  id: string;
  name: string;
  style: NailDesignStyle;
  colors: NailDesignColor[];
  serviceId: string;
  description: string;
  isNew: boolean;
};

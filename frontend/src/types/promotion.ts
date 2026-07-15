export type Promotion = {
  id: string;
  title: string;
  description: string;
  discountLabel: string;
  validFrom: string;
  validTo: string;
  conditions: string[];
  isActive: boolean;
};

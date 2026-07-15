export type Review = {
  id: string;
  customerName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  content: string;
  serviceName: string;
  createdAt: string;
  isVerified: boolean;
};

export interface Order {
  id: string;
  table: number;
  name?: string;
  status: 'WAITING' | 'IN_PRODUCTION' | 'DONE';
  description?: string;
  createdAt: string,
  paid: boolean;
  products: {
    id: string;
    quantity: number;
    size: string;
    product: {
      id: string; //
      imagePath: string;
      name: string;
      price: number;
      category: {
        name: string;
      };
    };
  }[];
  lead?: {
    id: string,
    name: string;
  },
}

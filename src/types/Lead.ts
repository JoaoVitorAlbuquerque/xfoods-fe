export interface Lead {
  id: string,
  name: string,
  phone: string,
  address: string,
  email: string,
  orders: {
    id: string;
    paid: boolean;
    createdAt: string;
    products: {
      product: {
        id: string;
        name: string;
        imagePath: string;
        price: string;
      },
      quantity: number;
      size: string;
    }[];
  }[],
}

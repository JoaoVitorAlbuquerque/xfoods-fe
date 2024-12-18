// export interface History {
//   _id: string;
//   table: number;
//   status: 'WAITING' | 'IN_PRODUCTION' | 'DONE';
//   description?: string;
//   read: boolean;
//   createdAt: string,
//   paid: boolean;
//   products: {
//     _id: string;
//     quantity: number;
//     size: string;
//     product: {
//       _id: string;
//       imagePath: string;
//       name: string;
//       price: number;
//     };
//   }[];
// }

export interface History {
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
    id: string;
    name: string;
  },
}

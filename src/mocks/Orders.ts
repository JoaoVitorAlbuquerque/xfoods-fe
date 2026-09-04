import { Order } from "../types/Order";

export const orders: Order[] = [
  {
    id: '123',
    table: 12,
    status: 'WAITING',
    description: '',
    createdAt: new Date('2026-09-04T18:30:00.000Z').toISOString(),
    paid: false,
    read: false,
    products: [
      {
        id: '456',
        product: {
          id: 'a0fe66a8-e0eb-427d-a3ca-feb03f9637f7',
          imagePath: '1719441215442-marguerita.png',
          name: 'Pizza Marguerita',
          price: 50,
          category: { name: 'Pizza' },
        },
        quantity: 2,
        size: 'METER',
      },
      {
        id: '789',
        product: {
          id: '6ccb41f0-8213-492d-bf3b-c373646f2de0',
          imagePath: '1719441420024-coca-cola.png',
          name: 'Coca cola',
          price: 7,
          category: { name: 'Bebidas' },
        },
        quantity: 4,
        size: 'MEAN',
      },
    ],
  },
];

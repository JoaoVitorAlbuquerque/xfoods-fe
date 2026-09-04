import { MenuProduct } from "../types/MenuProduct";

export const products: MenuProduct[] = [
  {
    id: "a0fe66a8-e0eb-427d-a3ca-feb03f9637f7",
    name: "Pizza Marguerita",
    description: "Molho de tomate, mussarela, tomate e manjericão",
    imagePath: "1719441215442-marguerita.png",
    price: 50,
    category: {
      id: "5f6f4e0e-1f2a-4a7a-9a5b-9a2f4b7c1d10",
      icon: "🍕",
      name: "Pizza",
    },
    ingredients: [],
  },
  {
    id: "6ccb41f0-8213-492d-bf3b-c373646f2de0",
    name: "Coca Cola",
    description: "Lata 350ml",
    imagePath: "1719441420024-coca-cola.png",
    price: 7,
    category: {
      id: "0b1c2d3e-4f5a-4b6c-8d7e-9f0a1b2c3d4e",
      icon: "🍹",
      name: "Bebidas",
    },
    ingredients: [],
  },
];

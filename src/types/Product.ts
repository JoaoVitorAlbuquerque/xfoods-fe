export interface Product {
  id: string,
  name: string,
  imagePath: File,
  // imagePath: string,
  description?: string;
  price: string,
  category: string;
  // category: {
  //   icon: string;
  //   name: string;
  // };
  ingredients: Array<string>;
}

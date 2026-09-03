export interface Supplier {
  id: string;
  userId: string;
  name: string;
  document: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  /** Quantas compras já foram lançadas para este fornecedor. */
  _count: { purchases: number };
}

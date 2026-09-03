import { httpClient } from "../httpClient";

export async function remove(categoryId: string) {
  const { data } = await httpClient.delete(`/supply-categories/${categoryId}`);

  return data;
}

import { formatCurrency } from "../../../../../../app/utils/formatCurrency";
import { MenuProduct } from "../../../../../../types/MenuProduct";
import { Button } from "../../../../../components/Button";
import { Modal } from "../../../../../components/Modal";
import { ModalOverlay } from "../../../../../components/ModalOverlay";
import { ProductImage } from "./ProductImage";

interface ProductModalProps {
  product: MenuProduct | null;
  onClose(): void;
  onAddToCart(product: MenuProduct): void;
}

export function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  if (!product) {
    return null;
  }

  function handleAddToCart() {
    onAddToCart(product!);
    onClose();
  }

  const ingredients = product.ingredients?.map(({ ingredient }) => ingredient) ?? [];

  return (
    <ModalOverlay>
      <Modal visible title={product.name} onClose={onClose}>
        <div className="space-y-6">
          <ProductImage
            imagePath={product.imagePath}
            name={product.name}
            className="h-40 w-full md:h-52"
          />

          {product.description && (
            <p className="text-gray-400">{product.description}</p>
          )}

          <div>
            <strong className="text-sm font-semibold text-gray-500">
              Ingredientes
            </strong>

            {ingredients.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {ingredients.map(ingredient => (
                  <li key={ingredient.id} className="flex items-center gap-3">
                    <span>{ingredient.icon}</span>

                    <span className="text-sm text-gray-400">{ingredient.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-gray-400">
                Este produto não tem ingredientes cadastrados.
              </p>
            )}
          </div>

          <footer className="flex flex-col gap-4 border-t border-gray-600/40 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="block text-sm text-gray-400">Preço</span>

              <strong className="text-xl font-semibold text-gray-800">
                {formatCurrency(product.price)}
              </strong>
            </div>

            <Button type="button" onClick={handleAddToCart} className="w-full sm:w-auto">
              Adicionar ao pedido
            </Button>
          </footer>
        </div>
      </Modal>
    </ModalOverlay>
  );
}

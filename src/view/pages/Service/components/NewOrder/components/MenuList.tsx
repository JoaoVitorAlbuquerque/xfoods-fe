import { PlusCircledIcon } from "@radix-ui/react-icons";

import { formatCurrency } from "../../../../../../app/utils/formatCurrency";
import { MenuProduct } from "../../../../../../types/MenuProduct";
import { ProductImage } from "./ProductImage";

interface MenuListProps {
  products: MenuProduct[];
  onOpenProduct(product: MenuProduct): void;
  onAddToCart(product: MenuProduct): void;
}

export function MenuList({ products, onOpenProduct, onAddToCart }: MenuListProps) {
  return (
    <ul className="divide-y divide-gray-600/40">
      {products.map(product => (
        <li key={product.id} className="flex items-center gap-3 py-4">
          {/* O card inteiro abre o detalhe; o "+" só adiciona — foi assim que o
              aplicativo separou as duas ações. */}
          <button
            type="button"
            onClick={() => onOpenProduct(product)}
            className="flex min-w-0 flex-1 items-center gap-3 text-left"
          >
            <ProductImage
              imagePath={product.imagePath}
              name={product.name}
              className="h-16 w-24 md:h-20 md:w-32"
            />

            <div className="min-w-0">
              <strong className="block truncate font-semibold text-gray-800">
                {product.name}
              </strong>

              {product.description && (
                <span className="mt-1 line-clamp-2 block text-sm text-gray-400">
                  {product.description}
                </span>
              )}

              <span className="mt-1 block text-sm font-semibold text-gray-800">
                {formatCurrency(product.price)}
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onAddToCart(product)}
            aria-label={`Adicionar ${product.name} ao pedido`}
            className="shrink-0 p-2 text-red-800 transition-colors hover:text-red-600"
          >
            <PlusCircledIcon className="size-7" />
          </button>
        </li>
      ))}
    </ul>
  );
}

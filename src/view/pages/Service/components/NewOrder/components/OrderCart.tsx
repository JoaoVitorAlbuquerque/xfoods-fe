import { MinusCircledIcon, PlusCircledIcon, TrashIcon } from "@radix-ui/react-icons";

import { formatCurrency } from "../../../../../../app/utils/formatCurrency";
import { applySizePrice } from "../../../../../../app/utils/sizePrice";
import { CartItem } from "../../../../../../types/CartItem";
import { SizeType, sizeTypeLabels, sizeTypes } from "../../../../../../types/Recipe";
import { Button } from "../../../../../components/Button";
import { hasSizeChoice } from "../useNewOrderController";
import { ProductImage } from "./ProductImage";

interface OrderCartProps {
  cartItems: CartItem[];
  selectedTable: string;
  total: number;
  onAdd(productId: string): void;
  onDecrement(productId: string): void;
  onRemove(productId: string): void;
  onChangeSize(productId: string, size: SizeType): void;
  onChangeTable(): void;
  onCancelOrder(): void;
  onConfirm(): void;
}

export function OrderCart({
  cartItems,
  selectedTable,
  total,
  onAdd,
  onDecrement,
  onRemove,
  onChangeSize,
  onChangeTable,
  onCancelOrder,
  onConfirm,
}: OrderCartProps) {
  return (
    <div className="rounded-2xl border border-gray-600/40 bg-white p-4">
      <header className="flex items-center justify-between gap-2 border-b border-gray-600/40 pb-3">
        <div>
          <strong className="block font-semibold text-gray-800">Comanda</strong>

          <button
            type="button"
            onClick={onChangeTable}
            className="text-sm text-gray-400 underline underline-offset-2"
          >
            {selectedTable ? `Mesa ${selectedTable}` : 'Escolher a mesa'}
          </button>
        </div>

        {cartItems.length > 0 && (
          <button
            type="button"
            onClick={onCancelOrder}
            className="text-sm font-semibold text-red-800"
          >
            cancelar pedido
          </button>
        )}
      </header>

      {cartItems.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">
          Nenhum item ainda. Toque no <strong>+</strong> de um produto para
          começar a comanda.
        </p>
      ) : (
        // A comanda fica acima do cardápio no celular: sem o teto de altura,
        // uma mesa com muitos itens empurraria a lista de produtos para fora
        // da tela. Era o mesmo motivo do `maxHeight` no aplicativo.
        <ul className="max-h-72 divide-y divide-gray-600/40 overflow-y-auto">
          {cartItems.map(({ product, quantity, size }) => (
            <li key={product.id} className="py-3">
              <div className="flex items-start gap-3">
                <ProductImage
                  imagePath={product.imagePath}
                  name={product.name}
                  className="h-12 w-16"
                />

                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-sm font-semibold text-gray-800">
                    {quantity}x {product.name}
                  </strong>

                  <span className="text-sm text-gray-400">
                    {formatCurrency(applySizePrice(product.price * quantity, size))}
                  </span>

                  {hasSizeChoice(product) && (
                    <label className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                      Tamanho

                      <select
                        value={size}
                        onChange={event => onChangeSize(
                          product.id,
                          event.target.value as SizeType,
                        )}
                        className="rounded-lg border border-gray-600 bg-white px-2 py-1 text-xs text-gray-800 outline-none focus:border-gray-800"
                      >
                        {sizeTypes.map(sizeType => (
                          <option key={sizeType} value={sizeType}>
                            {sizeTypeLabels[sizeType]}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onDecrement(product.id)}
                    aria-label={`Remover uma unidade de ${product.name}`}
                    className="p-1 text-red-800"
                  >
                    <MinusCircledIcon className="size-6" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onAdd(product.id)}
                    aria-label={`Adicionar uma unidade de ${product.name}`}
                    className="p-1 text-red-800"
                  >
                    <PlusCircledIcon className="size-6" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemove(product.id)}
                    aria-label={`Tirar ${product.name} da comanda`}
                    className="p-1 text-gray-400"
                  >
                    <TrashIcon className="size-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <footer className="mt-3 space-y-3 border-t border-gray-600/40 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Total</span>

          <strong className="text-lg font-semibold text-gray-800">
            {formatCurrency(total)}
          </strong>
        </div>

        <Button
          type="button"
          onClick={onConfirm}
          disabled={cartItems.length === 0}
          className="w-full"
        >
          Confirmar pedido
        </Button>
      </footer>
    </div>
  );
}

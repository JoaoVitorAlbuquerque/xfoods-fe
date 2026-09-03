import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { CheckIcon, CopyIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import toast from "react-hot-toast";

import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatPercentPlain } from "../../../../../app/utils/formatPercent";
import { Button } from "../../../../components/Button";
import { Modal } from "../../../../components/Modal";

interface ApplyPriceModalProps {
  visible: boolean;
  onClose(): void;
  productName: string;
  price: number;
  /** A margem que ESTE preço entrega, não a pedida. */
  marginPercent: number | null;
  targetMarginPercent: number;
  currentPrice: number | null;
  /** De onde veio o preço: o recomendado ou uma sugestão de arredondamento. */
  source: string;
}

/**
 * Aplicar um preço é ação deliberada (regra 4.3).
 *
 * Nenhuma rota de `/pricing` escreve em `products.price` — e a API não tem, hoje,
 * rota alguma que altere o preço de um produto (o `PATCH /products/:id` está
 * comentado no controller). Então esta tela faz o que pode fazer com honestidade:
 * confirma a decisão, entrega o número pronto para colar e leva ao cadastro do
 * produto, que é onde o preço muda. Inventar uma chamada que a API não atende
 * seria pior: a tela diria "aplicado" sem nada ter mudado.
 */
export function ApplyPriceModal({
  visible,
  onClose,
  productName,
  price,
  marginPercent,
  targetMarginPercent,
  currentPrice,
  source,
}: ApplyPriceModalProps) {
  const [isCopied, setIsCopied] = useState(false);

  /** No formato que o campo de preço do produto espera: ponto decimal. */
  const priceToPaste = price.toFixed(2);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(priceToPaste);

      setIsCopied(true);
      toast.success(`${priceToPaste} copiado.`);
    } catch {
      // Área de transferência bloqueada (contexto não seguro, permissão
      // negada). O número está visível na tela — dá para digitar.
      toast.error('Não foi possível copiar. O valor está na tela para digitar.');
    }
  }, [priceToPaste]);

  if (!visible) {
    return null;
  }

  return (
    <div className="left-0 top-0 bg-black/80 backdrop-blur-sm size-full fixed flex items-center justify-center z-10 p-4">
      <Modal visible onClose={onClose} title="Aplicar este preço">
        <div className="space-y-6 sm:max-w-[460px]">
          <div className="rounded-lg border border-gray-600 p-4 text-center">
            <span className="block text-xs text-gray-400">{source}</span>

            <strong className="mt-1 block text-3xl font-bold text-gray-500">
              {formatCurrency(price)}
            </strong>

            <span className="mt-2 block text-sm text-gray-400">
              entrega margem de{' '}
              <strong className="text-gray-500">
                {formatPercentPlain(marginPercent)}
              </strong>{' '}
              (pedida: {formatPercentPlain(targetMarginPercent)})
            </span>
          </div>

          <div className="text-sm text-gray-500">
            <strong className="block">{productName}</strong>

            <span className="text-gray-400">
              preço atual{' '}
              {currentPrice === null ? 'não cadastrado' : formatCurrency(currentPrice)}
            </span>
          </div>

          <p className="flex items-start gap-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
            <InfoCircledIcon className="mt-0.5 shrink-0" />

            <span>
              Nenhuma tela de preços altera o cardápio: o recomendado é sugestão,
              e trocar o preço é uma decisão sua. Copie o valor e altere o prato
              no cadastro do produto — o preço novo passa a valer nas próximas
              vendas, e as vendas antigas continuam com o preço e o custo daquele
              dia.
            </span>
          </p>
        </div>

        <footer className="mt-8 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={onClose} className="py-3 font-bold text-red-800">
            Manter o preço atual
          </button>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Button onClick={handleCopy} className="w-full sm:w-auto">
              {isCopied ? <CheckIcon className="mr-2" /> : <CopyIcon className="mr-2" />}

              Copiar {priceToPaste}
            </Button>

            <Link
              to="/menu/products"
              className="flex h-12 items-center justify-center rounded-[44px] border border-gray-600 px-7 font-semibold text-gray-500"
            >
              Abrir o cardápio
            </Link>
          </div>
        </footer>
      </Modal>
    </div>
  );
}

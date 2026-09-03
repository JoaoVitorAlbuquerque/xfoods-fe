import { Link } from "react-router-dom";
import { CheckCircledIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";

import { PaidResult, SaleAlertType } from "../../types/OrderStock";
import { Button } from "./Button";
import { Modal } from "./Modal";

interface SaleStockResultModalProps {
  visible: boolean;
  /** Mensagem do 409: a conta NÃO foi fechada. */
  conflictMessage?: string | null;
  /** Retorno do pagamento, quando ele foi concluído. */
  result?: PaidResult | null;
  onClose(): void;
}

const alertTitles: Record<SaleAlertType, string> = {
  NO_RECIPE: 'Prato vendido sem ficha técnica',
  MISSING_COST: 'Custo do prato está subestimado',
};

const alertExplanations: Record<SaleAlertType, string> = {
  NO_RECIPE:
    'Nenhum insumo foi consumido por este item: o saldo do estoque continua o mesmo, mesmo com o produto tendo saído da prateleira.',
  MISSING_COST:
    'A ficha usa insumo que nunca foi comprado, e insumo sem custo entra como zero. O custo congelado nesta venda ficou menor do que o real.',
};

/**
 * Fechar a conta pode ser recusado por falta de insumo, e isso acontece com um
 * cliente esperando na mesa: o tratamento não pode ser um toast vermelho
 * genérico. E quando a conta fecha com ressalvas, elas precisam aparecer.
 */
export function SaleStockResultModal({
  visible,
  conflictMessage,
  result,
  onClose,
}: SaleStockResultModalProps) {
  if (!visible) {
    return null;
  }

  const isConflict = Boolean(conflictMessage);

  return (
    <div className="left-0 top-0 bg-black/80 backdrop-blur-sm size-full fixed flex items-center justify-center z-[100] p-4">
      <Modal
        visible
        onClose={onClose}
        title={isConflict ? 'A conta NÃO foi fechada' : 'Conta fechada com avisos'}
      >
        <div className="space-y-4 sm:w-[460px]">
          {isConflict ? (
            <>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-2 text-red-900">
                  <ExclamationTriangleIcon className="mt-0.5 shrink-0" />

                  <div>
                    <strong className="block text-sm">
                      O pagamento não foi confirmado.
                    </strong>

                    <span className="mt-1 block text-xs">
                      Faltou insumo para dar baixa e a transação inteira voltou
                      atrás. Nenhum pedido foi marcado como pago e nada saiu do
                      estoque.
                    </span>
                  </div>
                </div>

                <p className="mt-3 whitespace-pre-line rounded-lg bg-white p-3 text-xs text-red-900">
                  {conflictMessage}
                </p>
              </div>

              <div className="space-y-2">
                <strong className="text-sm text-gray-500">Caminhos de saída</strong>

                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    Reponha o saldo com uma entrada ou corrija por ajuste no{' '}
                    <Link to="/stock" className="font-bold text-red-600">
                      painel de estoque
                    </Link>
                    .
                  </li>

                  <li>
                    Ou permita saldo negativo em{' '}
                    <Link to="/settings/stock" className="font-bold text-red-600">
                      Configurações › Estoque
                    </Link>{' '}
                    — a conta passa a fechar e o saldo abaixo de zero fica como
                    sinal de conferência pendente.
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-2 rounded-lg bg-green-50 p-4 text-green-900">
                <CheckCircledIcon className="mt-0.5 shrink-0" />

                <span className="text-sm">
                  {result?.updated ?? 0} pedido(s) marcado(s) como pago(s) e{' '}
                  {result?.stockMovements ?? 0} movimentação(ões) de estoque
                  geradas.
                </span>
              </div>

              <div className="space-y-3">
                <strong className="text-sm text-gray-500">
                  Avisos desta venda ({result?.alerts.length ?? 0})
                </strong>

                {result?.alerts.map(alert => (
                  <div
                    key={`${alert.productOrderId}-${alert.type}`}
                    className="rounded-lg border border-yellow-200 bg-yellow-50 p-3"
                  >
                    <div className="flex items-start gap-2 text-yellow-900">
                      <ExclamationTriangleIcon className="mt-0.5 shrink-0" />

                      <div>
                        <strong className="block text-sm">
                          {alertTitles[alert.type]}: {alert.productName}
                        </strong>

                        <span className="mt-1 block text-xs">
                          {alertExplanations[alert.type]}
                        </span>

                        <span className="mt-2 block text-xs italic opacity-80">
                          {alert.message}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2">
                      {alert.type === 'NO_RECIPE' ? (
                        <Link
                          to={`/menu/recipes/new?productId=${alert.productId}`}
                          className="text-xs font-bold text-red-600"
                        >
                          Criar ficha técnica deste prato
                        </Link>
                      ) : (
                        <Link to="/purchases/new" className="text-xs font-bold text-red-600">
                          Lançar a compra do insumo sem custo
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <footer className="mt-8 flex justify-end">
          <Button onClick={onClose} className="w-full sm:w-auto">
            Entendi
          </Button>
        </footer>
      </Modal>
    </div>
  );
}

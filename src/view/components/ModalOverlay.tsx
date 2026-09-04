/**
 * O `Modal` compartilhado só desenha a caixa branca — o fundo escurecido fica
 * por conta de quem o usa. Este invólucro centraliza a caixa e dá o respiro
 * lateral que falta no celular.
 */
export function ModalOverlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      {children}
    </div>
  );
}

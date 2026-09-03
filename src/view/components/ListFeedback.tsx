import { Spinner } from "./Spinner";

interface ListFeedbackProps {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  emptyMessage: string;
  errorMessage?: string;
  onRetry?(): void;
  children: React.ReactNode;
}

/** Vazio, carregando e erro — os três estados que toda lista precisa ter. */
export function ListFeedback({
  isLoading,
  isError,
  isEmpty,
  emptyMessage,
  errorMessage = 'Não foi possível carregar os dados.',
  onRetry,
  children,
}: ListFeedbackProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-gray-600 bg-white p-8 text-center">
        <span className="text-gray-400">{errorMessage}</span>

        {onRetry && (
          <button type="button" onClick={onRetry} className="text-sm font-bold text-red-600">
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-gray-600 bg-white p-8 text-center">
        <span className="text-gray-400">{emptyMessage}</span>
      </div>
    );
  }

  return <>{children}</>;
}

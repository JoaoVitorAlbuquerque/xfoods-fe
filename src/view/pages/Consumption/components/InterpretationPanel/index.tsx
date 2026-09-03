import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

import { ConsumptionInterpretation } from "../../../../../types/Consumption";
import { NotesPanel } from "../../../../components/NotesPanel";

interface InterpretationPanelProps {
  interpretation: ConsumptionInterpretation | undefined;
  className?: string;
}

/**
 * Regra 4.6, na tela e não atrás de um "?".
 *
 * A diferença entre estimado e real não é desperdício: pode ser perda, mas
 * também erro de lançamento, inventário, produção ou consumo não registrado.
 * As sete causas ficam abertas de propósito — quem abre o relatório precisa
 * vê-las antes de concluir qualquer coisa sobre a cozinha.
 */
export function InterpretationPanel({
  interpretation,
  className,
}: InterpretationPanelProps) {
  if (!interpretation) {
    return null;
  }

  return (
    <div className={className}>
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 md:p-6">
        <div className="flex items-start gap-2 text-yellow-900">
          <ExclamationTriangleIcon className="mt-0.5 shrink-0" />

          <div className="min-w-0">
            <strong className="block text-sm">
              Desvio não é automaticamente desperdício
            </strong>

            <p className="mt-1 text-xs">{interpretation.warning}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-yellow-200 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          {interpretation.possibleCauses.map(cause => (
            <div key={cause.code}>
              <strong className="block text-xs text-yellow-900">
                {cause.label}
              </strong>

              <span className="mt-1 block text-xs text-gray-500">
                {cause.description}
              </span>
            </div>
          ))}
        </div>
      </div>

      <NotesPanel
        className="mt-4"
        title="Ressalvas desta leitura"
        notes={interpretation.caveats}
      />
    </div>
  );
}

import { ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons";

import { cn } from "../../app/utils/cn";

interface NotesPanelProps {
  title: string;
  /** `caveats`, `warnings`, `notes` ou `alerts` devolvidos pela API. */
  notes: string[] | undefined;
  variant?: 'warning' | 'info';
  className?: string;
}

const variants = {
  warning: {
    box: 'border-yellow-200 bg-yellow-50 text-yellow-900',
    Icon: ExclamationTriangleIcon,
  },
  info: {
    box: 'border-gray-600/40 bg-gray-50 text-gray-500',
    Icon: InfoCircledIcon,
  },
};

/**
 * Ressalvas da API são conteúdo, não metadado: elas dizem o que ficou de fora,
 * o que foi estimado ou o que mudou. Uma tela que as descarta passa a mentir
 * com a autoridade de um número bem formatado.
 */
export function NotesPanel({ title, notes, variant = 'warning', className }: NotesPanelProps) {
  if (!notes || notes.length === 0) {
    return null;
  }

  const { box, Icon } = variants[variant];

  return (
    <div className={cn('rounded-lg border p-4', box, className)}>
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 shrink-0" />

        <div>
          <strong className="block text-sm">{title}</strong>

          <ul className="mt-2 space-y-1 text-xs">
            {notes.map(note => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

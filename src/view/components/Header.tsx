import { ResetIcon } from "./icons/ResetIcon";
import { Input } from "./Input";

interface HeaderProps {
  icon: React.ReactNode;
  children: string;
  description: string;
  isDashboard?: boolean;
  onOpenResetModal?(): void;
  isFinx?: boolean;
}

export function Header({ icon, children, description, isDashboard, onOpenResetModal, isFinx }: HeaderProps) {
  return (
    <header className="flex items-center justify-between mt-10 mb-12">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 items-center">
          <div>{icon}</div>

          <span className="text-2xl font-semibold text-gray-500">
            {children}
          </span>
        </div>

        <span className="font-medium text-gray-400">
          {description}
        </span>
      </div>

      {isDashboard && (
        <button
          className="px-4 py-[14px] flex items-center gap-2 text-red-600 font-semibold"
          onClick={onOpenResetModal}
        >
          <ResetIcon className="w-6 h-6" />

          Reiniciar o dia
        </button>
      )}

      {isFinx && (
        <div>
          <span></span>

          <Input
            type="text"
            name="search"
            placeholder="Busque a mesa do cliente"
            value={''}
            onChange={() => {}}
          />
        </div>
      )}
    </header>
  );
}

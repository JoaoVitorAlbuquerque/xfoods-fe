import { NavLink } from "react-router-dom";

import { cn } from "../../app/utils/cn";

export interface SectionTab {
  to: string;
  label: string;
  /** Só marca ativo no caminho exato — para a aba raiz da seção. */
  end?: boolean;
  /** Contador ao lado do rótulo. Some quando é zero ou indefinido. */
  badge?: number;
}

interface SectionTabsProps {
  tabs: SectionTab[];
}

/**
 * Abas da seção. No celular rolam na horizontal em vez de quebrar a linha;
 * a partir de `md` ficam com o mesmo desenho das abas do cardápio.
 */
export function SectionTabs({ tabs }: SectionTabsProps) {
  return (
    <div className="-mx-4 mb-6 overflow-x-auto border-b border-b-gray-600/40 px-4 py-2 md:mx-0 md:mb-8 md:px-0 md:py-4">
      <div className="flex w-max gap-1 md:gap-0">
        {tabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => cn(
              'flex shrink-0 items-center gap-2 rounded-t-lg px-4 py-3 text-sm font-normal text-gray-400 md:px-10 md:py-4',
              isActive && 'bg-white font-bold text-red-600 md:px-16',
            )}
          >
            {tab.label}

            {!!tab.badge && (
              <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">
                {tab.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

import { NavLink } from "react-router-dom";
import { HomeIcon } from "./icons/HomeIcon";
import { HistoryIcon } from "./icons/HistoryIcon";
import { MenuIcon } from "./icons/MenuIcon";
import { StockIcon } from "./icons/StockIcon";
import { UserIcon } from "./icons/UserIcon";
import { SettingsIcon } from "./icons/SettingsIcon";
import { ExitIcon } from "./icons/ExitIcon";
import { useAuth } from "../../app/hooks/useAuth";
import { cn } from "../../app/utils/cn";

interface NavItem {
  to: string;
  label: string;
  icon(props: { className?: string; isActive?: string }): JSX.Element;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/history', label: 'Histórico', icon: HistoryIcon },
  { to: '/menu/products', label: 'Cardápio', icon: MenuIcon },
  { to: '/stock', label: 'Estoque', icon: StockIcon },
  { to: '/users', label: 'Leads', icon: UserIcon },
  { to: '/settings/measurement-units', label: 'Ajustes', icon: SettingsIcon },
];

export function Aside() {
  const { signout } = useAuth();

  function getIconClasses(isActive: boolean) {
    return isActive ? '#f00' : '#333333';
  }

  return (
    <>
      {/* Desktop: barra lateral. Some no celular, onde a navegação vai para o rodapé. */}
      <aside className="hidden md:flex flex-col items-center justify-between w-1/12 bg-white h-full pt-10">
        <div className="flex justify-center text-2xl font-bold w-full text-gray-400">
          X<span className="font-light">F</span>
        </div>

        <div className="flex flex-col w-full items-center justify-center">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => isActive
                ? 'flex flex-col items-center w-full gap-2 p-6 text-sm font-medium text-red-800'
                : 'flex flex-col items-center w-full gap-2 p-6 text-sm font-medium text-gray-400'
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-6 h-6" isActive={getIconClasses(isActive)} />

                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="flex flex-col w-full items-center justify-center">
          <NavLink
            className={({ isActive }) =>
              isActive
                ? 'p-6 text-sm font-medium text-slate-700 text-center'
                : 'p-6 text-sm font-medium text-gray-400 text-center'
            }
            to="/financial"
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  'flex justify-center text-2xl font-bold w-full text-gray-400',
                  isActive && 'flex justify-center text-2xl font-bold w-full text-slate-700',
                )}>
                  Pay<span className="font-light">X</span>
                </div>

                <span>Financeiro</span>
              </>
            )}
          </NavLink>

          <button
            className="p-6 flex flex-col items-center gap-2 w-full text-sm font-medium text-gray-400"
            onClick={signout}
          >
            <ExitIcon className="w-6 h-6" />

            Sair
          </button>
        </div>
      </aside>

      {/* Celular: barra fixa no rodapé, rolável na horizontal quando não cabe. */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 flex items-stretch gap-1 overflow-x-auto border-t border-gray-600/40 bg-white px-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => cn(
              'flex shrink-0 flex-col items-center gap-1 px-3 py-2 text-[11px] font-medium text-gray-400',
              isActive && 'text-red-800',
            )}
          >
            {({ isActive }) => (
              <>
                <Icon className="w-5 h-5" isActive={getIconClasses(isActive)} />

                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}

        <NavLink
          to="/financial"
          className={({ isActive }) => cn(
            'flex shrink-0 flex-col items-center gap-1 px-3 py-2 text-[11px] font-medium text-gray-400',
            isActive && 'text-slate-700',
          )}
        >
          <span className="text-base font-bold leading-5">
            Pay<span className="font-light">X</span>
          </span>

          <span>Financeiro</span>
        </NavLink>

        <button
          type="button"
          onClick={signout}
          className="flex shrink-0 flex-col items-center gap-1 px-3 py-2 text-[11px] font-medium text-gray-400"
        >
          <ExitIcon className="w-5 h-5" />

          Sair
        </button>
      </nav>
    </>
  );
}

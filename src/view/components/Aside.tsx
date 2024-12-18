import { NavLink } from "react-router-dom";
import { HomeIcon } from "./icons/HomeIcon";
import { HistoryIcon } from "./icons/HistoryIcon";
import { MenuIcon } from "./icons/MenuIcon";
import { UserIcon } from "./icons/UserIcon";
import { ExitIcon } from "./icons/ExitIcon";
import { useAuth } from "../../app/hooks/useAuth";
import { cn } from "../../app/utils/cn";

export function Aside() {
  const { signout } = useAuth();

  // function getNavLinkClasses(isActive: boolean) {
  //   return isActive
  //     ? 'flex flex-col items-center w-full gap-2 p-6 text-sm font-medium text-red-800'
  //     : 'flex flex-col items-center w-full gap-2 p-6 text-sm font-medium text-gray-400';
  // }

  function getIconClasses(isActive: boolean) {
    return isActive ? '#f00' : '#333333';
  }

  return (
    // <aside className="flex flex-col items-center justify-between w-1/12 bg-white h-full pt-10 fixed top-0 left-0">
    <aside className="flex flex-col items-center justify-between w-1/12 bg-white h-full pt-10">
      <div className="flex justify-center text-2xl font-bold w-full text-gray-400">
        X<span className="font-light">F</span>
      </div>

      <div className="flex flex-col w-full items-center justify-center">
        <NavLink
          to="/"
          className={({ isActive }) => isActive
            ? 'flex flex-col items-center w-full gap-2 p-6 text-sm font-medium text-red-800'
            : 'flex flex-col items-center w-full gap-2 p-6 text-sm font-medium text-gray-400'
          }
        >
          {({ isActive }) => (
            <>
              <HomeIcon className="w-6 h-6" isActive={getIconClasses(isActive)} />

              <span>Home</span>
            </>
          )}
        </NavLink>

        <NavLink
          className={({ isActive }) => isActive
            ? 'flex flex-col items-center w-full gap-2 p-6 text-sm font-medium text-red-800'
            : 'flex flex-col items-center w-full gap-2 p-6 text-sm font-medium text-gray-400'
          }
          to="/history"
        >
          {({ isActive }) => (
            <>
              <HistoryIcon className="w-6 h-6" isActive={getIconClasses(isActive)} />

              <span>Histórico</span>
            </>
          )}
        </NavLink>

        <NavLink
          className={({ isActive }) => isActive
            ? 'flex flex-col items-center w-full gap-2 p-6 text-sm font-medium text-red-800'
            : 'flex flex-col items-center w-full gap-2 p-6 text-sm font-medium text-gray-400'
          }
          to="/menu/products"
        >
          {({ isActive }) => (
            <>
              <MenuIcon className="w-6 h-6" isActive={getIconClasses(isActive)} />

              <span>Cardápio</span>
            </>
          )}

        </NavLink>

        <NavLink
          className={({ isActive }) => isActive
            ? 'flex flex-col items-center w-full gap-2 p-6 text-sm font-medium text-red-800'
            : 'flex flex-col items-center w-full gap-2 p-6 text-sm font-medium text-gray-400'
          }
          to="/users"
        >
          {({ isActive }) => (
            <>
              <UserIcon className="w-6 h-6" isActive={getIconClasses(isActive)} />
              <span>Leads</span>
            </>
          )}
        </NavLink>
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
  );
}

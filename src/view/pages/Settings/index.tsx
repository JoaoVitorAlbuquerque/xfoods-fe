import { NavLink, Outlet } from "react-router-dom";

import { Header } from "../../components/Header";
import { SettingsIcon } from "../../components/icons/SettingsIcon";
import { cn } from "../../../app/utils/cn";

export function Settings() {
  return (
    <>
      <Header
        icon={<SettingsIcon className="w-8 h-8" />}
        description="Ajustes do seu estabelecimento"
      >
        Configurações
      </Header>

      <div className="flex-1">
        <div className="py-4 border-b border-b-gray-600/40 mb-8">
          <NavLink
            to="/settings/measurement-units"
            className={({ isActive }) => cn(
              'px-10 py-4 text-sm font-normal text-gray-400 rounded-t-lg',
              isActive && 'px-16 bg-white text-red-600 font-bold pointer-events-none',
            )}
          >
            Unidades de medida
          </NavLink>
        </div>

        <Outlet />
      </div>
    </>
  );
}

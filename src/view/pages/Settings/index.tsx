import { Outlet } from "react-router-dom";

import { Header } from "../../components/Header";
import { SettingsIcon } from "../../components/icons/SettingsIcon";
import { SectionTabs } from "../../components/SectionTabs";

const tabs = [
  { to: '/settings/measurement-units', label: 'Unidades de medida' },
  { to: '/settings/stock', label: 'Estoque' },
];

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
        <SectionTabs tabs={tabs} />

        <Outlet />
      </div>
    </>
  );
}

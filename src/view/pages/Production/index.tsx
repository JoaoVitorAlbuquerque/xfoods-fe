import { Outlet } from "react-router-dom";

import { Header } from "../../components/Header";
import { ProductionIcon } from "../../components/icons/ProductionIcon";
import { SectionTabs } from "../../components/SectionTabs";

const tabs = [
  { to: '/production', label: 'Lotes', end: true },
  { to: '/production/yield', label: 'Rendimento' },
];

export function Production() {
  return (
    <>
      <Header
        icon={<ProductionIcon className="w-8 h-8" />}
        description="Lotes que transformam insumos em subproduto estocado"
      >
        Produção
      </Header>

      <div className="flex-1">
        <SectionTabs tabs={tabs} />

        <Outlet />
      </div>
    </>
  );
}

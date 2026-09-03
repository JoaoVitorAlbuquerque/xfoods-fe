import { Outlet } from "react-router-dom";

import { Header } from "../../components/Header";
import { ConsumptionIcon } from "../../components/icons/ConsumptionIcon";
import { SectionTabs } from "../../components/SectionTabs";

const tabs = [
  { to: '/consumption', label: 'Painel', end: true },
  { to: '/consumption/by-supply', label: 'Por insumo' },
  { to: '/consumption/by-product', label: 'Por prato' },
  { to: '/consumption/deviations', label: 'Maiores desvios' },
  { to: '/consumption/losses', label: 'Maiores perdas' },
  { to: '/consumption/waste', label: 'No tempo' },
];

export function Consumption() {
  return (
    <>
      <Header
        icon={<ConsumptionIcon className="w-8 h-8" />}
        description="O que as fichas previam contra o que saiu do estoque"
      >
        Estimado × Real
      </Header>

      <div className="flex-1">
        <SectionTabs tabs={tabs} />

        <Outlet />
      </div>
    </>
  );
}

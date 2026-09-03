import { Outlet } from "react-router-dom";

import { Header } from "../../components/Header";
import { PricingIcon } from "../../components/icons/PricingIcon";
import { SectionTabs } from "../../components/SectionTabs";

const tabs = [
  { to: '/pricing', label: 'Cardápio', end: true },
  { to: '/pricing/simulate', label: 'Simulador' },
];

export function Pricing() {
  return (
    <>
      <Header
        icon={<PricingIcon className="w-8 h-8" />}
        description="Preço atual contra o recomendado, e a margem que cada um entrega"
      >
        Preços
      </Header>

      <div className="flex-1">
        <SectionTabs tabs={tabs} />

        <Outlet />
      </div>
    </>
  );
}

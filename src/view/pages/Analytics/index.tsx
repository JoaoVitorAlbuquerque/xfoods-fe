import { Outlet } from "react-router-dom";

import { Header } from "../../components/Header";
import { AnalyticsIcon } from "../../components/icons/AnalyticsIcon";
import { SectionTabs } from "../../components/SectionTabs";

const tabs = [
  { to: '/analytics', label: 'Painel', end: true },
  { to: '/analytics/products', label: 'Rankings' },
  { to: '/analytics/alerts', label: 'Alertas' },
  { to: '/analytics/stock', label: 'Estoque' },
  { to: '/analytics/costs', label: 'Custos' },
];

export function Analytics() {
  return (
    <>
      <Header
        icon={<AnalyticsIcon className="w-8 h-8" />}
        description="Faturamento, custo, margem e o que precisa de atenção"
      >
        Indicadores
      </Header>

      <div className="flex-1">
        <SectionTabs tabs={tabs} />

        <Outlet />
      </div>
    </>
  );
}

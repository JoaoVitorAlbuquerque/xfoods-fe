import { Outlet } from "react-router-dom";

import { Header } from "../../components/Header";
import { ExpensesIcon } from "../../components/icons/ExpensesIcon";
import { SectionTabs } from "../../components/SectionTabs";

const tabs = [
  { to: '/expenses', label: 'Despesas', end: true },
  { to: '/expenses/occurrences', label: 'Competências' },
  { to: '/expenses/categories', label: 'Categorias' },
  { to: '/expenses/allocation', label: 'Custos operacionais' },
  { to: '/expenses/full-cost', label: 'Custo completo' },
];

export function Expenses() {
  return (
    <>
      <Header
        icon={<ExpensesIcon className="w-8 h-8" />}
        description="Despesas operacionais e quanto cada prato carrega delas"
      >
        Despesas
      </Header>

      <div className="flex-1">
        <SectionTabs tabs={tabs} />

        <Outlet />
      </div>
    </>
  );
}

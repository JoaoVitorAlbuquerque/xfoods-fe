import { Outlet } from "react-router-dom";

import { Header } from "../../components/Header";
import { PurchasesIcon } from "../../components/icons/PurchasesIcon";
import { SectionTabs } from "../../components/SectionTabs";

const tabs = [
  { to: '/purchases', label: 'Compras', end: true },
  { to: '/purchases/suppliers', label: 'Fornecedores' },
  { to: '/purchases/cost-report', label: 'Variação de preço' },
];

export function Purchases() {
  return (
    <>
      <Header
        icon={<PurchasesIcon className="w-8 h-8" />}
        description="Notas de compra, fornecedores e o custo dos seus insumos"
      >
        Compras
      </Header>

      <div className="flex-1">
        <SectionTabs tabs={tabs} />

        <Outlet />
      </div>
    </>
  );
}

import { Outlet } from "react-router-dom";

import { Header } from "../../components/Header";
import { StockIcon } from "../../components/icons/StockIcon";
import { SectionTabs } from "../../components/SectionTabs";

const tabs = [
  { to: '/stock', label: 'Painel', end: true },
  { to: '/stock/supplies', label: 'Insumos' },
  { to: '/stock/movements', label: 'Movimentações' },
  { to: '/stock/counts', label: 'Inventários' },
  { to: '/stock/categories', label: 'Categorias' },
];

export function Stock() {
  return (
    <>
      <Header
        icon={<StockIcon className="w-8 h-8" />}
        description="Insumos, saldo e movimentações do seu estabelecimento"
      >
        Estoque
      </Header>

      <div className="flex-1">
        <SectionTabs tabs={tabs} />

        <Outlet />
      </div>
    </>
  );
}

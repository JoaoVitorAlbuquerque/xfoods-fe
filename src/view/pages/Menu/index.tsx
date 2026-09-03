import { Outlet } from "react-router-dom";

import { Header } from "../../components/Header";
import { MenuIcon } from "../../components/icons/MenuIcon";
import { SectionTabs } from "../../components/SectionTabs";

const tabs = [
  { to: '/menu/products', label: 'Produtos' },
  { to: '/menu/categories', label: 'Categorias' },
  { to: '/menu/recipes', label: 'Fichas técnicas', end: true },
  { to: '/menu/sub-recipes', label: 'Sub-receitas' },
  { to: '/menu/recipes-cost', label: 'Custo direto' },
  { to: '/menu/recipes-coverage', label: 'Cobertura' },
];

export function Menu() {
  return (
    <>
      <Header
        icon={<MenuIcon className="w-8 h-8" />}
        description="Gerencie os produtos do seu estabelecimento"
      >
        Cardápio
      </Header>

      <div className="flex-1">
        <SectionTabs tabs={tabs} />

        <Outlet />
      </div>
    </>
  );
}

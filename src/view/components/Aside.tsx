import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDownIcon, ChevronRightIcon } from "@radix-ui/react-icons";

import { HomeIcon } from "./icons/HomeIcon";
import { HistoryIcon } from "./icons/HistoryIcon";
import { MenuIcon } from "./icons/MenuIcon";
import { StockIcon } from "./icons/StockIcon";
import { PurchasesIcon } from "./icons/PurchasesIcon";
import { ExpensesIcon } from "./icons/ExpensesIcon";
import { PricingIcon } from "./icons/PricingIcon";
import { AnalyticsIcon } from "./icons/AnalyticsIcon";
import { ConsumptionIcon } from "./icons/ConsumptionIcon";
import { ProductionIcon } from "./icons/ProductionIcon";
import { UserIcon } from "./icons/UserIcon";
import { SettingsIcon } from "./icons/SettingsIcon";
import { ExitIcon } from "./icons/ExitIcon";
import { useAuth } from "../../app/hooks/useAuth";
import { cn } from "../../app/utils/cn";

type NavIcon = (props: { className?: string; isActive?: string }) => JSX.Element;

interface NavItem {
  to: string;
  label: string;
  icon: NavIcon;
  /**
   * Prefixo que marca o item como ativo. O `to` aponta para a primeira aba da
   * seção, mas o item continua sendo o mesmo em `/menu/recipes` ou
   * `/settings/stock` — sem isto, navegar entre abas apagaria o destaque.
   */
  match?: string;
}

interface NavGroup {
  id: string;
  label: string;
  icon: NavIcon;
  items: NavItem[];
}

/** Home, PayX e Sair ficam fora dos grupos: são os atalhos do dia a dia. */
const homeItem: NavItem = { to: '/', label: 'Home', icon: HomeIcon };

const navGroups: NavGroup[] = [
  {
    id: 'operacao',
    label: 'Operação',
    icon: MenuIcon,
    items: [
      { to: '/history', label: 'Histórico', icon: HistoryIcon },
      { to: '/menu/products', label: 'Cardápio', icon: MenuIcon, match: '/menu' },
    ],
  },
  {
    id: 'suprimentos',
    label: 'Suprimentos',
    icon: StockIcon,
    items: [
      { to: '/stock', label: 'Estoque', icon: StockIcon },
      { to: '/purchases', label: 'Compras', icon: PurchasesIcon },
      { to: '/production', label: 'Produção', icon: ProductionIcon },
    ],
  },
  {
    id: 'custos',
    label: 'Custos',
    icon: PricingIcon,
    items: [
      { to: '/expenses', label: 'Despesas', icon: ExpensesIcon },
      { to: '/pricing', label: 'Preços', icon: PricingIcon },
    ],
  },
  {
    id: 'analises',
    label: 'Análises',
    icon: AnalyticsIcon,
    items: [
      { to: '/analytics', label: 'Indicadores', icon: AnalyticsIcon },
      { to: '/consumption', label: 'Estimado × Real', icon: ConsumptionIcon },
    ],
  },
  {
    id: 'sistema',
    label: 'Sistema',
    icon: SettingsIcon,
    items: [
      { to: '/users', label: 'Leads', icon: UserIcon },
      {
        to: '/settings/measurement-units',
        label: 'Ajustes',
        icon: SettingsIcon,
        match: '/settings',
      },
    ],
  },
];

/** No celular a navegação continua plana: acordeão em barra de rodapé só atrapalha. */
const flatItems: NavItem[] = [homeItem, ...navGroups.flatMap(group => group.items)];

function isItemActive(pathname: string, item: NavItem) {
  const prefix = item.match ?? item.to;

  if (prefix === '/') {
    return pathname === '/';
  }

  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function iconColor(isActive: boolean) {
  return isActive ? '#f00' : '#333333';
}

const rowClasses =
  'flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-left text-[11px] font-medium transition-colors';

export function Aside() {
  const { signout } = useAuth();
  const { pathname } = useLocation();

  const activeGroupId = navGroups.find(group =>
    group.items.some(item => isItemActive(pathname, item)),
  )?.id;

  /** Só o que o usuário abriu ou fechou à mão; o resto segue a rota atual. */
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  // Ao entrar numa rota de outro grupo, o registro manual dele é descartado —
  // é o que garante que o grupo da rota aberta apareça expandido, mesmo que
  // tenha sido fechado numa visita anterior.
  useEffect(() => {
    if (!activeGroupId) {
      return;
    }

    setToggled(current => {
      if (current[activeGroupId] === undefined) {
        return current;
      }

      const next = { ...current };
      delete next[activeGroupId];

      return next;
    });
  }, [activeGroupId]);

  function isGroupOpen(group: NavGroup) {
    return toggled[group.id] ?? group.id === activeGroupId;
  }

  function handleToggleGroup(group: NavGroup) {
    setToggled(current => ({ ...current, [group.id]: !isGroupOpen(group) }));
  }

  const isHomeActive = isItemActive(pathname, homeItem);
  const isFinancialActive = pathname === '/financial';

  return (
    <>
      {/*
        Desktop: barra lateral. As seções ficam em grupos recolhíveis para toda
        a navegação caber sem rolagem — era ela que escondia as últimas rotas.
        O `overflow-y-auto` fica como rede de segurança para telas muito baixas
        com vários grupos abertos; no uso normal nenhuma barra aparece.
      */}
      {/* `pb-12` dá respiro embaixo do botão de sair — e cobre a altura da
          faixa fixa da DevLand, caso ela volte a ser exibida. */}
      <aside className="hidden md:flex w-1/12 flex-col overflow-y-auto bg-white h-full px-2 pb-12 pt-8">
        <div className="flex justify-center text-2xl font-bold w-full text-gray-400">
          X<span className="font-light">F</span>
        </div>

        <nav className="mt-6 flex flex-col gap-0.5">
          <NavLink
            to="/"
            end
            className={cn(rowClasses, isHomeActive ? 'text-red-800' : 'text-gray-400')}
          >
            <HomeIcon className="w-5 h-5 shrink-0" isActive={iconColor(isHomeActive)} />

            <span className="leading-tight">Home</span>
          </NavLink>

          {navGroups.map(group => {
            const isOpen = isGroupOpen(group);
            const hasActiveItem = group.id === activeGroupId;
            const Icon = group.icon;

            return (
              <div key={group.id}>
                <button
                  type="button"
                  onClick={() => handleToggleGroup(group)}
                  aria-expanded={isOpen}
                  aria-controls={`aside-group-${group.id}`}
                  className={cn(
                    rowClasses,
                    hasActiveItem ? 'text-red-800' : 'text-gray-400',
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" isActive={iconColor(hasActiveItem)} />

                  <span className="min-w-0 flex-1 leading-tight">{group.label}</span>

                  {isOpen
                    ? <ChevronDownIcon className="shrink-0" />
                    : <ChevronRightIcon className="shrink-0" />}
                </button>

                {isOpen && (
                  <div
                    id={`aside-group-${group.id}`}
                    className="mb-1 ml-3.5 flex flex-col gap-0.5 border-l border-gray-600/40 pl-2"
                  >
                    {group.items.map(item => {
                      const isActive = isItemActive(pathname, item);

                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className={cn(
                            'rounded px-2 py-1.5 text-[11px] leading-tight transition-colors',
                            isActive
                              ? 'bg-red-50 font-bold text-red-800'
                              : 'text-gray-400',
                          )}
                        >
                          {item.label}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-0.5 pt-4">
          <NavLink
            to="/financial"
            className={cn(
              'flex w-full flex-col items-center gap-1 rounded-lg px-2 py-2.5 text-[11px] font-medium transition-colors',
              isFinancialActive ? 'text-slate-700' : 'text-gray-400',
            )}
          >
            <span className={cn(
              'text-lg font-bold leading-none',
              isFinancialActive ? 'text-slate-700' : 'text-gray-400',
            )}>
              Pay<span className="font-light">X</span>
            </span>

            <span>Financeiro</span>
          </NavLink>

          <button
            type="button"
            className={cn(rowClasses, 'text-gray-400')}
            onClick={signout}
          >
            <ExitIcon className="w-5 h-5 shrink-0" />

            <span className="leading-tight">Sair</span>
          </button>
        </div>
      </aside>

      {/* Celular: barra fixa no rodapé, rolável na horizontal quando não cabe. */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 flex items-stretch gap-1 overflow-x-auto border-t border-gray-600/40 bg-white px-2">
        {flatItems.map(({ to, label, icon: Icon, match }) => {
          const isActive = isItemActive(pathname, { to, label, icon: Icon, match });

          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={cn(
                'flex shrink-0 flex-col items-center gap-1 px-3 py-2 text-[11px] font-medium text-gray-400',
                isActive && 'text-red-800',
              )}
            >
              <Icon className="w-5 h-5" isActive={iconColor(isActive)} />

              <span>{label}</span>
            </NavLink>
          );
        })}

        <NavLink
          to="/financial"
          className={({ isActive }) => cn(
            'flex shrink-0 flex-col items-center gap-1 px-3 py-2 text-[11px] font-medium text-gray-400',
            isActive && 'text-slate-700',
          )}
        >
          <span className="text-base font-bold leading-5">
            Pay<span className="font-light">X</span>
          </span>

          <span>Financeiro</span>
        </NavLink>

        <button
          type="button"
          onClick={signout}
          className="flex shrink-0 flex-col items-center gap-1 px-3 py-2 text-[11px] font-medium text-gray-400"
        >
          <ExitIcon className="w-5 h-5" />

          Sair
        </button>
      </nav>
    </>
  );
}

import { Routes, Route, BrowserRouter } from 'react-router-dom';

import { AuthGuard } from './AuthGuard';
import { Login } from '../view/pages/Login';
import { Dashboard } from '../view/pages/Dashboard';
import { History } from '../view/pages/History';
import { Menu } from '../view/pages/Menu';
import { Users } from '../view/pages/Users';
import { PageLayout } from '../view/layouts/PageLayout';
import { MenuProducts } from '../view/pages/Menu/components/MenuProducts';
import { MenuCategories } from '../view/pages/Menu/components/MenuCategories';
import { Financial } from '../view/pages/Financial';
import { Settings } from '../view/pages/Settings';
import { SettingsUnits } from '../view/pages/Settings/components/SettingsUnits';
import { SettingsStock } from '../view/pages/Settings/components/SettingsStock';
import { Stock } from '../view/pages/Stock';
import { StockPanel } from '../view/pages/Stock/components/StockPanel';
import { StockSupplies } from '../view/pages/Stock/components/StockSupplies';
import { SupplyDetail } from '../view/pages/Stock/components/SupplyDetail';
import { StockMovements } from '../view/pages/Stock/components/StockMovements';
import { StockCounts } from '../view/pages/Stock/components/StockCounts';
import { StockCountDetail } from '../view/pages/Stock/components/StockCountDetail';
import { SupplyCategories } from '../view/pages/Stock/components/SupplyCategories';

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthGuard isPrivate={false} />}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<AuthGuard isPrivate />}>
          <Route element={<PageLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route element={<Menu />}>
              <Route path="/menu/products" element={<MenuProducts />} />
              <Route path="/menu/categories" element={<MenuCategories />} />
            </Route>
            <Route path="/users" element={<Users />} />
            <Route path="/financial" element={<Financial />} />
            <Route element={<Stock />}>
              <Route path="/stock" element={<StockPanel />} />
              <Route path="/stock/supplies" element={<StockSupplies />} />
              <Route path="/stock/supplies/:supplyId" element={<SupplyDetail />} />
              <Route path="/stock/movements" element={<StockMovements />} />
              <Route path="/stock/counts" element={<StockCounts />} />
              <Route path="/stock/counts/:stockCountId" element={<StockCountDetail />} />
              <Route path="/stock/categories" element={<SupplyCategories />} />
            </Route>
            <Route element={<Settings />}>
              <Route path="/settings/measurement-units" element={<SettingsUnits />} />
              <Route path="/settings/stock" element={<SettingsStock />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

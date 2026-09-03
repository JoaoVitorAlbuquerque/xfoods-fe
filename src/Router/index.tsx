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
import { ProductRecipes, SubRecipes } from '../view/pages/Menu/components/Recipes/RecipesList';
import { RecipeDetail } from '../view/pages/Menu/components/RecipeDetail';
import { NewRecipe } from '../view/pages/Menu/components/RecipeForm/NewRecipe';
import { EditRecipe } from '../view/pages/Menu/components/RecipeForm/EditRecipe';
import { RecipeCostReport } from '../view/pages/Menu/components/RecipeCostReport';
import { RecipeCoverage } from '../view/pages/Menu/components/RecipeCoverage';
import { Financial } from '../view/pages/Financial';
import { Settings } from '../view/pages/Settings';
import { SettingsUnits } from '../view/pages/Settings/components/SettingsUnits';
import { SettingsStock } from '../view/pages/Settings/components/SettingsStock';
import { SettingsAllocation } from '../view/pages/Settings/components/SettingsAllocation';
import { Expenses } from '../view/pages/Expenses';
import { ExpensesList } from '../view/pages/Expenses/components/ExpensesList';
import { ExpenseOccurrences } from '../view/pages/Expenses/components/ExpenseOccurrences';
import { ExpenseCategories } from '../view/pages/Expenses/components/ExpenseCategories';
import { CostAllocationView } from '../view/pages/Expenses/components/CostAllocationView';
import { FullCostReport } from '../view/pages/Expenses/components/FullCostReport';
import { Stock } from '../view/pages/Stock';
import { StockPanel } from '../view/pages/Stock/components/StockPanel';
import { StockSupplies } from '../view/pages/Stock/components/StockSupplies';
import { SupplyDetail } from '../view/pages/Stock/components/SupplyDetail';
import { StockMovements } from '../view/pages/Stock/components/StockMovements';
import { StockCounts } from '../view/pages/Stock/components/StockCounts';
import { StockCountDetail } from '../view/pages/Stock/components/StockCountDetail';
import { SupplyCategories } from '../view/pages/Stock/components/SupplyCategories';
import { Purchases } from '../view/pages/Purchases';
import { PurchasesList } from '../view/pages/Purchases/components/PurchasesList';
import { NewPurchase } from '../view/pages/Purchases/components/NewPurchase';
import { PurchaseDetail } from '../view/pages/Purchases/components/PurchaseDetail';
import { Suppliers } from '../view/pages/Purchases/components/Suppliers';
import { CostVariationReport } from '../view/pages/Purchases/components/CostVariationReport';
import { SupplyCostHistory } from '../view/pages/Purchases/components/SupplyCostHistory';

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
              <Route path="/menu/recipes" element={<ProductRecipes />} />
              <Route path="/menu/sub-recipes" element={<SubRecipes />} />
              <Route path="/menu/recipes-cost" element={<RecipeCostReport />} />
              <Route path="/menu/recipes-coverage" element={<RecipeCoverage />} />
              <Route path="/menu/recipes/new" element={<NewRecipe />} />
              <Route path="/menu/recipes/:recipeId" element={<RecipeDetail />} />
              <Route path="/menu/recipes/:recipeId/edit" element={<EditRecipe />} />
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
            <Route element={<Purchases />}>
              <Route path="/purchases" element={<PurchasesList />} />
              <Route path="/purchases/new" element={<NewPurchase />} />
              <Route path="/purchases/suppliers" element={<Suppliers />} />
              <Route path="/purchases/cost-report" element={<CostVariationReport />} />
              <Route
                path="/purchases/supplies/:supplyId/history"
                element={<SupplyCostHistory />}
              />
              <Route path="/purchases/:purchaseId" element={<PurchaseDetail />} />
            </Route>
            <Route element={<Expenses />}>
              <Route path="/expenses" element={<ExpensesList />} />
              <Route path="/expenses/occurrences" element={<ExpenseOccurrences />} />
              <Route path="/expenses/categories" element={<ExpenseCategories />} />
              <Route path="/expenses/allocation" element={<CostAllocationView />} />
              <Route path="/expenses/full-cost" element={<FullCostReport />} />
            </Route>
            <Route element={<Settings />}>
              <Route path="/settings/measurement-units" element={<SettingsUnits />} />
              <Route path="/settings/stock" element={<SettingsStock />} />
              <Route path="/settings/allocation" element={<SettingsAllocation />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

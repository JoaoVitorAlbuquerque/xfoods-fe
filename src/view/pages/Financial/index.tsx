import { Header } from "../../components/Header";
import { TableCard } from "./components/TableCard";
// import { useFinancialController } from "./useFinancialController";

export function Financial() {
  // const { groupedOrders } = useFinancialController();

  return (
    <>
      <Header
        icon={<div className="flex justify-center text-2xl font-bold w-full text-gray-400">
          Pay<span className="font-light text-gray-800">X</span>
        </div>}
        description="Gerencie os pagamentos do seu estabelecimento"
        isFinx
      >
        Financeiro
      </Header>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-6 gap-4">
          <TableCard />
        </div>
      </div>
    </>
  );
}

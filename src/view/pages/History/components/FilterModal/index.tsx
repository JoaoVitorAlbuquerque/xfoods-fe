import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Modal } from "../../../../components/Modal";
import { Button } from "../../../../components/Button";
import { months } from "../../../../../app/utils/months";
// import { useFilterModalController } from "./useFilterModalController";

interface FilterModalProps {
  visible: boolean;
  onClose(): void;
  selectedMonth: number;
  selectedYear: number;
  onChangeMonth(step: number): void;
  onChangeYear(step: number): void;
  onApplyFilters({ month, year }: { month: number; year: number }): void;
}

export function FilterModal({
  visible,
  onClose,
  selectedMonth,
  selectedYear,
  onChangeMonth,
  onChangeYear,
  // onApplyFilters,
}: FilterModalProps) {
  // const {
  //   selectedMonth,
  //   selectedYear,
  //   handleChangeMonth,
  //   handleChangeYear,
  // } = useFilterModalController();

  if (!visible) {
    return null;
  }

  return (
    <div
      className="left-0 top-0 bg-black/80 backdrop-blur-sm size-full fixed flex items-center justify-center z-[99]"
    >
      <Modal
        visible={visible}
        title="Filtre pela data"
        onClose={onClose}
      >
        <div className="space-y-10">
          <div className="text-gray-800">
            <span className="text-lg tracking-[-1px] font-bold">
              Mês
            </span>

            <div className="mt-2 w-52 flex items-center justify-between">
              <button
                onClick={() => onChangeMonth(-1)}
                className="size-12 flex items-center justify-center"
              >
                <ChevronLeftIcon className="size-6" />
              </button>

              <div className="flex-1 text-center">
                <span className="text-sm font-medium tracking-[-0.5px]">
                  {months(selectedMonth)}
                </span>
              </div>

              <button
                onClick={() => onChangeMonth(1)}
                className="size-12 flex items-center justify-center"
              >
                <ChevronRightIcon className="size-6" />
              </button>
            </div>
          </div>

          <div className="text-gray-800">
            <span className="text-lg tracking-[-1px] font-bold">
              Ano
            </span>

            <div className="mt-2 w-52 flex items-center justify-between">
              <button
                onClick={() => onChangeYear(-1)}
                className="size-12 flex items-center justify-center"
              >
                <ChevronLeftIcon className="size-6" />
              </button>

              <div className="flex-1 text-center">
                <span className="text-sm font-medium tracking-[-0.5px]">
                  {selectedYear}
                </span>
              </div>

              <button
                onClick={() => onChangeYear(1)}
                className="size-12 flex items-center justify-center"
              >
                <ChevronRightIcon className="size-6" />
              </button>
            </div>
          </div>

          <Button
            className="w-full"
            // onClick={() => onApplyFilters({ month: selectedMonth, year: selectedYear })}
            onClick={onClose}
          >
            Aplicar Filtros
          </Button>
        </div>
      </Modal>
    </div>
  );
}

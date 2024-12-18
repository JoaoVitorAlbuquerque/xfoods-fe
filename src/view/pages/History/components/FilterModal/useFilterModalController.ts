import { useState } from "react";

export function useFilterModalController() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  function handleChangeMonth(step: number) {
    setSelectedMonth(prevState => prevState + step);
  }

  function handleChangeYear(step: number) {
    setSelectedYear(prevState => prevState + step);
  }

  return {
    selectedMonth,
    selectedYear,
    handleChangeMonth,
    handleChangeYear,
  };
}

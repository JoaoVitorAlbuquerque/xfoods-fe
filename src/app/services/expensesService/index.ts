import { getAll } from "./getAll";
import { activate, create, deactivate, remove, update } from "./mutations";
import { getById, getOccurrences, getSummary } from "./reports";

export const expensesService = {
  getAll,
  getById,
  getOccurrences,
  getSummary,
  create,
  update,
  activate,
  deactivate,
  remove,
};

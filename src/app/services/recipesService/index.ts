import { getAll } from "./getAll";
import { getById } from "./getById";
import {
  activate,
  create,
  deactivate,
  newVersion,
  update,
} from "./mutations";
import { getActiveByProduct, getCostReport, getMissing } from "./reports";

export const recipesService = {
  getAll,
  getById,
  getCostReport,
  getMissing,
  getActiveByProduct,
  create,
  update,
  newVersion,
  activate,
  deactivate,
};

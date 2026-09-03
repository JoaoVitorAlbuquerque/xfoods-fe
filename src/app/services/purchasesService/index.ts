import { cancel } from "./cancel";
import { confirm } from "./confirm";
import { create } from "./create";
import { getAll } from "./getAll";
import { getById } from "./getById";

export const purchasesService = {
  getAll,
  getById,
  create,
  confirm,
  cancel,
};

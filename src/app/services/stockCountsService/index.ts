import { apply } from "./apply";
import { cancel } from "./cancel";
import { create } from "./create";
import { getAll } from "./getAll";
import { getById } from "./getById";

export const stockCountsService = {
  getAll,
  getById,
  create,
  apply,
  cancel,
};

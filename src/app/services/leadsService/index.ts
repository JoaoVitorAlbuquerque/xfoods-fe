import { create } from "./create";
import { getAll } from "./getAll";
import { getAllOrdersByLead } from "./getAllOrdersByLead";
import { me } from "./me";
import { remove } from "./remove";
import { update } from "./update";

export const leadsService = {
  me,
  create,
  getAll,
  getAllOrdersByLead,
  update,
  remove,
};

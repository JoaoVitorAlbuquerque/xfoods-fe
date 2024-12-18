import { create } from "./create";
import { getAllDashboard } from "./getAllDashboard";
import { update } from "./update";
import { remove } from "./remove";
import { updateRestarted } from "./updateRestarted";
import { updatePaid } from "./updatePaid";
import { getOrdersByLead } from "./getOrdersByLead";

export const ordersService = {
  create,
  getAllDashboard,
  update,
  remove,
  updateRestarted,
  updatePaid,
  getOrdersByLead,
};

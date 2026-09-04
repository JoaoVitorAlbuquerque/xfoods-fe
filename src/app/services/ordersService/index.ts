import { cancel } from "./cancel";
import { create } from "./create";
import { getAllDashboard } from "./getAllDashboard";
import { getConsumption } from "./getConsumption";
import { markAsRead } from "./markAsRead";
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
  cancel,
  getConsumption,
  markAsRead,
  updateRestarted,
  updatePaid,
  getOrdersByLead,
};

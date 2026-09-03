import { getAlerts } from "./getAlerts";
import { getMovements } from "./getMovements";
import { getOverview } from "./getOverview";
import { getSettings } from "./getSettings";
import {
  createAdjustment,
  createEntry,
  createExit,
  createLoss,
} from "./operations";
import { updateSettings } from "./updateSettings";

export const stockService = {
  getOverview,
  getAlerts,
  getMovements,
  getSettings,
  updateSettings,
  createEntry,
  createExit,
  createLoss,
  createAdjustment,
};

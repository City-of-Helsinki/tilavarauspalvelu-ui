import { promotionHandlers } from "./handlers/promotions";
import { reservationUnitHandlers } from "./handlers/reservationUnit";
import { reservationUnitSearchHandlers } from "./handlers/singleSearch";
import { applicationRoundHandlers } from "./handlers/applicationRound";
import { reservationHandlers } from "./handlers/reservation";
import { userHandlers } from "./handlers/user";
import { applicationHandlers } from "./handlers/application";

export const handlers = [
  ...reservationUnitSearchHandlers,
  ...promotionHandlers,
  ...reservationUnitHandlers,
  ...applicationRoundHandlers,
  ...reservationHandlers,
  ...userHandlers,
  ...applicationRoundHandlers,
  ...applicationHandlers,
];

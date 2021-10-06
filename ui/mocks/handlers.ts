import { promotionHandlers } from "./handlers/promotions";
import { recommendationHandlers } from "./handlers/recommendations";
import { reservationUnitHandlers } from "./handlers/reservationUnit";
import { reservationUnitSearchHandlers } from "./handlers/singleSearch";

export const handlers = [
  ...reservationUnitSearchHandlers,
  ...promotionHandlers,
  ...recommendationHandlers,
  ...reservationUnitHandlers,
];

import { rest } from "msw";

const activeApplicationRounds = rest.get(
  "/v1/application_round/",
  (req, res, ctx) => {
    return res(ctx.json([]));
  }
);

export const applicationRoundHandlers = [activeApplicationRounds];

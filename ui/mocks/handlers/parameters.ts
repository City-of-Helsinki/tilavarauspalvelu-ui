import { rest } from "msw";
import { apiBaseUrl, parametersPrefix } from "../../modules/const";

import getAbilityGroupJSONResponse from "../../cypress/fixtures/v1/parameters/ability_group.json";
import getAgeGroupJSONResponse from "../../cypress/fixtures/v1/parameters/age_group.json";
import getCityJSONResponse from "../../cypress/fixtures/v1/parameters/city.json";
import getTypeJSONResponse from "../../cypress/fixtures/v1/parameters/reservation_unit_type.json";

const parametersREST = [
  rest.get(
    `${apiBaseUrl}/v1${parametersPrefix}/ability_group/*`,
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(getAbilityGroupJSONResponse));
    }
  ),

  rest.get(
    `${apiBaseUrl}/v1${parametersPrefix}/age_group/*`,
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(getAgeGroupJSONResponse));
    }
  ),

  rest.get(`${apiBaseUrl}/v1${parametersPrefix}/city/*`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(getCityJSONResponse));
  }),

  rest.get(
    `${apiBaseUrl}/v1${parametersPrefix}/reservation_unit_type/*`,
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(getTypeJSONResponse));
    }
  ),
];

export const parameterHandlers = [...parametersREST];

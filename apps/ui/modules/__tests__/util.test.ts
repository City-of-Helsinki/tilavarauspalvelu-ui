import { ApolloError } from "@apollo/client";
import { printErrorMessages } from "../util";

jest.mock("next-i18next", () => ({
  i18n: {
    t: (str: string, options: { count: number }) => {
      const countStr = options?.count > 1 ? "plural" : "singular";
      return options?.count ? `${options.count} ${countStr}` : str;
    },
  },
}));

test("printErrorMessages", () => {
  expect(
    printErrorMessages({
      graphQLErrors: [
        {
          extensions: { error_code: "RESERVATION_UNITS_MAX_DURATION_EXCEEDED" },
        },
      ],
    } as unknown as ApolloError)
  ).toEqual("errors:RESERVATION_UNITS_MAX_DURATION_EXCEEDED");

  expect(
    printErrorMessages({
      graphQLErrors: [
        {
          extensions: { error_code: "SOMETHING" },
        },
        {
          extensions: { error_code: "SOMETHING_ELSE" },
        },
      ],
    } as unknown as ApolloError)
  ).toEqual("errors:SOMETHING\nerrors:SOMETHING_ELSE");
});

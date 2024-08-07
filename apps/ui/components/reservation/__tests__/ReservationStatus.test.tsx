import * as React from "react";
import { get as mockGet } from "lodash";
import { ReservationStateChoice } from "@gql/gql-types";
import { render, screen } from "../../../test/testUtils";
import { ReservationStatus, type Props } from "../ReservationStatus";
import mockTranslations from "../../../public/locales/fi/reservations.json";

// TODO use a proper mocking solution in setup
jest.mock("next-i18next", () => ({
  useTranslation: () => {
    return {
      t: (str: string, params?: Record<string, string | number>) => {
        const path = str.replace("reservations:", "");
        const key =
          // @ts-expect-error -- TODO replace with mocks
          mockGet(mockTranslations, `${path}_other`) && params?.count > 1
            ? `${path}_other`
            : path;
        return mockGet(mockTranslations, key)?.replace(
          /{{(.*?)}}/g,
          // @ts-expect-error -- TODO replace with mocks
          (val, paramKey) => (params[paramKey] ? params[paramKey] : val)
        );
      },
    };
  },
}));

const defaultProps: Props = {
  state: "" as ReservationStateChoice,
};

const renderComponent = (props?: Partial<Props>) =>
  render(<ReservationStatus {...defaultProps} {...props} />);

[
  {
    status: ReservationStateChoice.Cancelled,
    label: "Peruttu",
  },
  {
    status: ReservationStateChoice.Confirmed,
    label: "Hyväksytty",
  },
  {
    status: ReservationStateChoice.Denied,
    label: "Hylätty",
  },
  {
    status: ReservationStateChoice.Created,
    label: "Luonnos",
  },
  {
    status: ReservationStateChoice.RequiresHandling,
    label: "Käsiteltävänä",
  },
  {
    status: ReservationStateChoice.WaitingForPayment,
    label: "Odottaa maksua",
  },
].forEach((state) => {
  test(`should render ${state.status}`, () => {
    renderComponent({
      state: state.status,
    });

    expect(screen.getByText(state.label)).toHaveAttribute("title", state.label);
  });
});

import * as React from "react";
import { get as mockGet } from "lodash";
import { render, screen } from "../../../test/testUtils";
import { ReservationOrderStatus, type Props } from "../ReservationOrderStatus";
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
  orderStatus: "",
};

const renderComponent = (props?: Partial<Props>) =>
  render(<ReservationOrderStatus {...defaultProps} {...props} />);

[
  { status: "DRAFT", label: "Odottaa maksua" },
  { status: "PAID", label: "Maksettu" },
  { status: "PAID_MANUALLY", label: "Paikan päällä" },
  { status: "CANCELLED", label: "Peruttu" },
  { status: "EXPIRED", label: "Maksamatta" },
  { status: "REFUNDED", label: "Hyvitetty" },
].forEach((state) => {
  test(`should render ${state.status}`, () => {
    renderComponent({ orderStatus: state.status });

    expect(screen.getByText(state.label)).toHaveAttribute("title", state.label);
  });
});

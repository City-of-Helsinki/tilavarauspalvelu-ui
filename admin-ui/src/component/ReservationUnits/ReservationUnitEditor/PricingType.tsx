import React from "react";
import { get } from "lodash";
import { useTranslation } from "react-i18next";
import { format, parse } from "date-fns";
import {
  Checkbox,
  DateInput,
  IconAlertCircleFill,
  NumberInput,
  RadioButton,
} from "hds-react";
import { Grid, Span3, Span4, VerticalFlex } from "../../../styles/layout";
import { Error } from "./modules/reservationUnitEditor";
import EnumSelect from "./EnumSelect";
import Select from "./Select";
import SortedSelect from "./SortedSelect";

import { Action, State } from "./types";
import {
  ReservationUnitPricingCreateSerializerInput,
  ReservationUnitsReservationUnitPriceUnitChoices,
} from "../../../common/gql-types";
import { OptionType } from "../../../common/types";

type Props = {
  getValidationError: (key: string) => string | undefined;
  state: State;
  dispatch: React.Dispatch<Action>;
  type: "PAST" | "ACTIVE" | "FUTURE";
  hasPrice: boolean;
  getSelectedOptions: (
    state: State,
    optionsPropertyName: string,
    valuePropName: string
  ) => OptionType[];
};

const hdsDate = (apiDate: string): string =>
  format(parse(apiDate, "yyyy-MM-dd", new Date()), "dd.MM.yyyy");

const PricingType = ({
  getValidationError,
  state,
  dispatch,
  getSelectedOptions,
  type,
  hasPrice,
}: Props): JSX.Element | null => {
  console.log(hasPrice);
  const { t } = useTranslation();

  const pricingType = (state.reservationUnitEdit.pricings || []).find(
    (pt) => pt?.status === type
  );

  if (!pricingType) {
    if (type === "FUTURE") {
      return (
        <VerticalFlex>
          <Checkbox
            id="priceChange"
            label={t("ReservationUnitEditor.label.priceChange")}
            onChange={() => dispatch({ type: "toggleFuturePrice" })}
          />
        </VerticalFlex>
      );
    }
    return null;
  }

  const setPricingTypeValue = (
    value: Partial<ReservationUnitPricingCreateSerializerInput>
  ) =>
    dispatch({
      type: "updatePricingType",
      pricingType: {
        ...pricingType,
        ...value,
      },
    });

  return (
    <>
      <VerticalFlex>
        {pricingType.status === "FUTURE" && (
          <>
            <Checkbox
              id="priceChange"
              label={t("ReservationUnitEditor.label.priceChange")}
              checked
              onChange={() => dispatch({ type: "toggleFuturePrice" })}
            />
            <Grid>
              <Span3>
                <DateInput
                  id="futureDate"
                  value={hdsDate(pricingType.begins)}
                  onChange={(e) =>
                    setPricingTypeValue({
                      begins: format(
                        parse(e, "dd.MM.yyyy", new Date()),
                        "yyyy-MM-yyyy"
                      ),
                    })
                  }
                />
              </Span3>
            </Grid>
          </>
        )}
        <Grid>
          {["FREE", "PAID"].map((typeName, index) => {
            const checked = pricingType.pricingType === typeName;

            return (
              <Span4 key={typeName}>
                <RadioButton
                  id={`pricingType.${pricingType.status}.${typeName}`}
                  name={`pricingType.${pricingType.status}`}
                  label={t(
                    `ReservationUnitEditor.label.pricingTypes.${typeName}`
                  )}
                  value={typeName}
                  checked={checked}
                  onChange={() =>
                    setPricingTypeValue({ pricingType: typeName })
                  }
                />
                {index === 0 && getValidationError("pricingType") && (
                  <Error>
                    <IconAlertCircleFill />
                    <span>{getValidationError("pricingType")}</span>
                  </Error>
                )}
              </Span4>
            );
          })}
        </Grid>
        <Grid>
          {pricingType.pricingType === "PAID" && (
            <>
              <Span3>
                <NumberInput
                  value={pricingType.lowestPrice || 0}
                  id="lowestPrice"
                  required
                  label={t("ReservationUnitEditor.label.lowestPrice")}
                  minusStepButtonAriaLabel={t("common.decreaseByOneAriaLabel")}
                  plusStepButtonAriaLabel={t("common.increaseByOneAriaLabel")}
                  onChange={(e) => {
                    setPricingTypeValue({
                      lowestPrice: Number(e.target.value),
                      highestPrice: Math.max(
                        Number(e.target.value),
                        pricingType.highestPrice || 0
                      ),
                    });
                  }}
                  step={1}
                  type="number"
                  min={0}
                  errorText={getValidationError("lowestPrice")}
                  invalid={!!getValidationError("lowestPrice")}
                  tooltipText={t("ReservationUnitEditor.tooltip.lowestPrice")}
                />
              </Span3>
              <Span3>
                <NumberInput
                  required
                  value={pricingType.highestPrice || 0}
                  id="highestPrice"
                  label={t("ReservationUnitEditor.label.highestPrice")}
                  minusStepButtonAriaLabel={t("common.decreaseByOneAriaLabel")}
                  plusStepButtonAriaLabel={t("common.increaseByOneAriaLabel")}
                  onChange={(e) => {
                    setPricingTypeValue({
                      highestPrice: Number(e.target.value),
                      lowestPrice: Math.min(
                        Number(e.target.value),
                        pricingType.lowestPrice || 0
                      ),
                    });
                  }}
                  step={1}
                  type="number"
                  min={0}
                  errorText={getValidationError("highestPrice")}
                  invalid={!!getValidationError("highestPrice")}
                  tooltipText={t("ReservationUnitEditor.tooltip.highestPrice")}
                />
              </Span3>
              <Span3>
                <EnumSelect
                  id="priceUnit"
                  required
                  value={pricingType.priceUnit as string}
                  label={t("ReservationUnitEditor.priceUnitLabel")}
                  type={ReservationUnitsReservationUnitPriceUnitChoices}
                  onChange={(priceUnit) => setPricingTypeValue({ priceUnit })}
                  tooltipText={t("ReservationUnitEditor.tooltip.priceUnit")}
                />
              </Span3>
              <Span3>
                <Select
                  required
                  id="taxPercentage"
                  label={t(`ReservationUnitEditor.taxPercentageLabel`)}
                  options={state.taxPercentageOptions}
                  onChange={(selectedVat) => {
                    setPricingTypeValue({
                      taxPercentagePk: selectedVat as number,
                    });
                  }}
                  value={get(pricingType, "taxPercentagePk") as number}
                />
              </Span3>
              <Span3 id="paymentTypes">
                <SortedSelect
                  id="paymentTypesSelect"
                  sort
                  multiselect
                  required
                  placeholder={t("common.select")}
                  options={state.paymentTypeOptions}
                  value={[
                    ...getSelectedOptions(
                      state,
                      "paymentTypeOptions",
                      "paymentTypes"
                    ),
                  ]}
                  label={t("ReservationUnitEditor.label.paymentTypes")}
                  onChange={(paymentTypes) =>
                    dispatch({ type: "setPaymentTypes", paymentTypes })
                  }
                  tooltipText={t("ReservationUnitEditor.tooltip.paymentTypes")}
                />
              </Span3>
            </>
          )}
        </Grid>
      </VerticalFlex>
    </>
  );
};

export default PricingType;

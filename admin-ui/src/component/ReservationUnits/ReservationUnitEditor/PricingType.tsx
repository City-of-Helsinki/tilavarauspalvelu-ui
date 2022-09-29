import React from "react";
import { get } from "lodash";
import { useTranslation } from "react-i18next";
import { format, parse, startOfDay } from "date-fns";
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
  const labelIndex = type === "ACTIVE" ? 0 : 1;

  const { t } = useTranslation();

  const pricingType = (state.reservationUnitEdit.pricings || []).find(
    (pt) => pt?.status === type
  );

  let pricing: ReservationUnitPricingCreateSerializerInput =
    pricingType as ReservationUnitPricingCreateSerializerInput;

  if (!pricing) {
    if (type === "FUTURE") {
      return hasPrice ? (
        <VerticalFlex>
          <Checkbox
            id="priceChange"
            label={t("ReservationUnitEditor.label.priceChange")}
            onChange={() => dispatch({ type: "toggleFuturePrice" })}
          />
        </VerticalFlex>
      ) : null;
    }
  }

  if (!pricing) {
    pricing = {
      status: "ACTIVE",
      begins: format(startOfDay(new Date()), "yyyy-MM-dd"),
    } as ReservationUnitPricingCreateSerializerInput;
  }

  const setPricingTypeValue = (
    value: Partial<ReservationUnitPricingCreateSerializerInput>
  ) =>
    dispatch({
      type: "updatePricingType",
      pricingType: {
        ...(pricing as ReservationUnitPricingCreateSerializerInput),
        ...value,
      },
    });

  return (
    <>
      <VerticalFlex>
        {hasPrice && pricing.status === "FUTURE" && (
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
                  value={hdsDate(pricing.begins)}
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
            const checked = pricing.pricingType === typeName;

            return (
              <Span4 key={typeName}>
                <RadioButton
                  id={`pricingType.${pricing.status}.${typeName}`}
                  name={`pricingType.${pricing.status}`}
                  label={t(
                    `ReservationUnitEditor.label.pricingTypes.${typeName}`
                  )}
                  value={typeName}
                  checked={checked}
                  onChange={() =>
                    setPricingTypeValue({ pricingType: typeName })
                  }
                />
                {index === 0 && getValidationError("pricings") && (
                  <Error>
                    <IconAlertCircleFill />
                    <span>{getValidationError("pricings")}</span>
                  </Error>
                )}
              </Span4>
            );
          })}
        </Grid>
        <Grid>
          {pricing.pricingType === "PAID" && (
            <>
              <Span3>
                <NumberInput
                  value={pricing.lowestPrice || 0}
                  id={`pricings,${labelIndex},lowestPrice`}
                  required
                  label={t("ReservationUnitEditor.label.lowestPrice")}
                  minusStepButtonAriaLabel={t("common.decreaseByOneAriaLabel")}
                  plusStepButtonAriaLabel={t("common.increaseByOneAriaLabel")}
                  onChange={(e) => {
                    setPricingTypeValue({
                      lowestPrice: Number(e.target.value),
                      highestPrice: Math.max(
                        Number(e.target.value),
                        pricing.highestPrice || 0
                      ),
                    });
                  }}
                  step={1}
                  type="number"
                  min={0}
                  errorText={getValidationError(
                    `pricings,${labelIndex},lowestPrice`
                  )}
                  invalid={
                    !!getValidationError(`pricings,${labelIndex},lowestPrice`)
                  }
                  tooltipText={t("ReservationUnitEditor.tooltip.lowestPrice")}
                />
              </Span3>
              <Span3>
                <NumberInput
                  required
                  value={pricing.highestPrice || ""}
                  id="highestPrice"
                  label={t("ReservationUnitEditor.label.highestPrice")}
                  minusStepButtonAriaLabel={t("common.decreaseByOneAriaLabel")}
                  plusStepButtonAriaLabel={t("common.increaseByOneAriaLabel")}
                  onChange={(e) => {
                    setPricingTypeValue({
                      highestPrice: Number(e.target.value),
                      lowestPrice: Math.min(
                        Number(e.target.value),
                        pricing.lowestPrice || 0
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
                  optionPrefix="priceUnit"
                  id={`pricings,${labelIndex},priceUnit`}
                  required
                  value={pricing.priceUnit as string}
                  label={t("ReservationUnitEditor.label.priceUnit")}
                  type={ReservationUnitsReservationUnitPriceUnitChoices}
                  onChange={(priceUnit) => setPricingTypeValue({ priceUnit })}
                  tooltipText={t("ReservationUnitEditor.tooltip.priceUnit")}
                  errorText={getValidationError(
                    `pricings,${labelIndex},priceUnit`
                  )}
                />
              </Span3>
              <Span3>
                <Select
                  required
                  id={`pricings,${labelIndex},taxPercentagePk`}
                  label={t(`ReservationUnitEditor.label.taxPercentagePk`)}
                  options={state.taxPercentageOptions}
                  onChange={(selectedVat) => {
                    setPricingTypeValue({
                      taxPercentagePk: selectedVat as number,
                    });
                  }}
                  value={get(pricingType, "taxPercentagePk") as number}
                  errorText={getValidationError(
                    `pricings,${labelIndex},taxPercentagePk`
                  )}
                />
              </Span3>
              {type === "ACTIVE" && (
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
                    tooltipText={t(
                      "ReservationUnitEditor.tooltip.paymentTypes"
                    )}
                  />
                </Span3>
              )}
            </>
          )}
        </Grid>
      </VerticalFlex>
    </>
  );
};

export default PricingType;

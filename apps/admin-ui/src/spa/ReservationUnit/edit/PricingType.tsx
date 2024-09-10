import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { IconAlertCircleFill, RadioButton } from "hds-react";
import { PriceUnit } from "@gql/gql-types";
import { Controller, UseFormReturn } from "react-hook-form";
import { addDays } from "date-fns";
import { AutoGrid } from "@/styles/layout";
import { getTranslatedError } from "@/common/util";
import { type ReservationUnitEditFormValues, PaymentTypes } from "./form";
import { ControlledDateInput } from "common/src/components/form";
import { fromUIDate } from "common/src/common/util";
import { ControlledSelect } from "common/src/components/form/ControlledSelect";
import { ControlledNumberInput } from "common/src/components/form/ControlledNumberInput";

const Error = styled.div`
  margin-top: var(--spacing-3-xs);
  color: var(--color-error);
  display: flex;
  gap: var(--spacing-2-xs);
  svg {
    flex-shrink: 0;
  }
  white-space: nowrap;
`;

type Props = {
  pk: number;
  form: UseFormReturn<ReservationUnitEditFormValues>;
  taxPercentageOptions: { label: string; value: number }[];
};

// TODO this creates problems with 0 tax percentage
function removeTax(price: number, taxPercentage: number) {
  const tmp = (price * 100) / (100 + taxPercentage);
  const tmp2 = Math.round(tmp * 100) / 100;
  return tmp2;
}

// TODO this creates problems with 0 tax percentage
function addTax(price: number, taxPercentage: number) {
  const tmp = price * ((100 + taxPercentage) / 100);
  const tmp2 = Math.round(tmp * 100) / 100;
  return tmp2;
}

export type PricingOption = {
  label: string;
  pk: number;
  value: number;
};

function PaidPricingPart({
  form,
  index,
  taxPercentageOptions,
}: {
  form: UseFormReturn<ReservationUnitEditFormValues>;
  index: number;
  taxPercentageOptions: PricingOption[];
}) {
  const { t } = useTranslation();
  const { control, setValue, formState, watch } = form;
  const { errors } = formState;

  const unitPriceOptions = Object.values(PriceUnit).map((choice) => ({
    value: choice,
    label: t(`priceUnit.${choice}`),
  }));

  const paymentTypeOptions = PaymentTypes.map((value: string) => ({
    label: t(`paymentType.${value}`),
    value,
  }));

  const pricing = watch(`pricings.${index}`);
  const taxPercentagePk = watch(`pricings.${index}.taxPercentage`);
  const taxPercentage =
    taxPercentageOptions.find((x) => x.pk === taxPercentagePk)?.value ?? 0;

  // TODO mobile number keyboard?
  return (
    <>
      <ControlledSelect
        name={`pricings.${index}.priceUnit`}
        control={control}
        placeholder={t("common.select")}
        label={t("ReservationUnitEditor.label.priceUnit")}
        style={{ gridColumnStart: "1" }}
        required
        options={unitPriceOptions}
        tooltip={t("ReservationUnitEditor.tooltip.priceUnit")}
        error={getTranslatedError(
          t,
          errors.pricings?.[index]?.priceUnit?.message
        )}
      />
      <ControlledSelect
        name={`pricings.${index}.taxPercentage`}
        control={control}
        placeholder={t("common.select")}
        required
        label={t(`ReservationUnitEditor.label.taxPercentage`)}
        options={taxPercentageOptions.map((x) => ({
          label: x.label,
          value: x.pk,
        }))}
        afterChange={(_value) => {
          const low = pricing.lowestPrice;
          const high = pricing.highestPrice;
          const tax = pricing.taxPercentage;
          if (!Number.isNaN(low)) {
            const lowNet = removeTax(low, tax);
            setValue(`pricings.${index}.lowestPriceNet`, lowNet);
          }
          if (!Number.isNaN(high)) {
            const highNet = removeTax(high, tax);
            setValue(`pricings.${index}.highestPriceNet`, highNet);
          }
        }}
        error={getTranslatedError(
          t,
          errors.pricings?.[index]?.taxPercentage?.message
        )}
      />
      <ControlledNumberInput
        name={`pricings.${index}.lowestPriceNet`}
        required
        control={control}
        afterChange={(value) => {
          if (value != null) {
            setValue(
              `pricings.${index}.lowestPrice`,
              addTax(value, taxPercentage)
            );
          }
        }}
        label={t("ReservationUnitEditor.label.lowestPriceNet")}
        min={0}
        errorText={getTranslatedError(
          t,
          errors.pricings?.[index]?.lowestPriceNet?.message
        )}
      />
      <ControlledNumberInput
        required
        name={`pricings.${index}.lowestPrice`}
        control={control}
        afterChange={(value) => {
          if (value != null) {
            setValue(
              `pricings.${index}.lowestPriceNet`,
              removeTax(value, taxPercentage)
            );
          }
        }}
        label={t("ReservationUnitEditor.label.lowestPrice")}
        min={0}
        errorText={getTranslatedError(
          t,
          errors.pricings?.[index]?.lowestPrice?.message
        )}
        tooltipText={t("ReservationUnitEditor.tooltip.lowestPrice")}
      />
      <ControlledNumberInput
        name={`pricings.${index}.highestPriceNet`}
        required
        control={control}
        afterChange={(value) => {
          if (value != null) {
            setValue(
              `pricings.${index}.highestPrice`,
              addTax(value, taxPercentage)
            );
          }
        }}
        label={t("ReservationUnitEditor.label.highestPriceNet")}
        min={0}
        errorText={getTranslatedError(
          t,
          errors.pricings?.[index]?.highestPriceNet?.message
        )}
      />
      <ControlledNumberInput
        name={`pricings.${index}.highestPrice`}
        required
        control={control}
        afterChange={(value) => {
          if (value != null) {
            setValue(
              `pricings.${index}.highestPriceNet`,
              removeTax(value, taxPercentage)
            );
          }
        }}
        label={t("ReservationUnitEditor.label.highestPrice")}
        min={0}
        errorText={getTranslatedError(
          t,
          errors.pricings?.[index]?.highestPrice?.message
        )}
        tooltipText={t("ReservationUnitEditor.tooltip.highestPrice")}
      />
      <ControlledSelect
        // This is not pricing type specific
        name="paymentTypes"
        control={control}
        multiselect
        required
        placeholder={t("common.select")}
        options={paymentTypeOptions}
        label={t("ReservationUnitEditor.label.paymentTypes")}
        tooltip={t("ReservationUnitEditor.tooltip.paymentTypes")}
        error={getTranslatedError(t, errors.paymentTypes?.message)}
      />
    </>
  );
}

export function PricingTypeView({
  pk,
  form,
  taxPercentageOptions,
}: Props): JSX.Element | null {
  const { t } = useTranslation();

  const { control, formState, watch } = form;
  const { errors } = formState;

  const index = watch("pricings").findIndex((pricing) => pricing.pk === pk);
  // TODO error handling for index === -1
  if (index === -1) {
    return null;
  }

  const isPaid = watch(`pricings.${index}.isPaid`);
  // TODO this is not good
  // the first pricing should always be without the date picker
  // it doesn't need any logic
  // the second (and rest) should always have the date picker
  const begins = fromUIDate(watch(`pricings.${index}.begins`));
  const isFuture = begins != null && begins > new Date();
  const priceOptions = ["free", "paid"];

  return (
    <AutoGrid>
      {/* TODO this is only for future pricing */}
      {isFuture && (
        <ControlledDateInput
          name={`pricings.${index}.begins`}
          control={control}
          label={t("ReservationUnitEditor.label.begins")}
          minDate={addDays(new Date(), 1)}
          error={getTranslatedError(
            t,
            errors.pricings?.[index]?.begins?.message
          )}
        />
      )}
      <Controller
        name={`pricings.${index}.isPaid`}
        control={control}
        render={({ field: { value, onChange } }) => (
          <>
            {priceOptions.map((type) => (
              <RadioButton
                key={`pricings.${index}.pricingType.${type}`}
                id={`pricingType.${index}.${type}`}
                name={`pricingType.${index}`}
                label={t(`ReservationUnitEditor.label.pricingTypes.${type}`)}
                value={type}
                checked={type === (value ? "paid" : "free")}
                onChange={(val) => {
                  if (val.target.value === "paid") {
                    onChange(true);
                  } else {
                    onChange(false);
                  }
                }}
              />
            ))}
          </>
        )}
      />
      {errors.pricings?.message != null && (
        <Error>
          <IconAlertCircleFill />
          <span>{getTranslatedError(t, errors.pricings.message)}</span>
        </Error>
      )}
      {isPaid && (
        <PaidPricingPart
          form={form}
          index={index}
          taxPercentageOptions={taxPercentageOptions}
        />
      )}
    </AutoGrid>
  );
}

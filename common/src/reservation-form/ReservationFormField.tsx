import { Checkbox, NumberInput, Select, TextArea, TextInput } from "hds-react";
import get from "lodash/get";
import React, { useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import styled from "styled-components";
import { fontMedium, fontRegular, Strongish } from "../common/typography";
import { ReservationsReservationReserveeTypeChoices } from "../../types/gql-types";
import { Inputs, Reservation } from "./types";
import { CheckboxWrapper } from "./components";
import { OptionType } from "../../types/common";

type Props = {
  field: keyof Inputs;
  options: Record<string, OptionType[]>;
  reserveeType?: ReservationsReservationReserveeTypeChoices | "COMMON";
  reservation: Reservation;
  required: boolean;
  // Not good to pass the translation function here but this is because this is shared between ui and admin
  // and admin is lacking translation namespaces
  t: (key: string) => string;
  params?: Record<string, Record<string, string | number>>;
  data?: Record<string, string>;
};

const StyledCheckboxWrapper = styled(CheckboxWrapper)<{
  $isWide?: boolean;
  $break?: boolean;
}>`
  ${({ $isWide }) => $isWide && "grid-column: 1 / -1"};
  ${({ $break }) => $break && "margin-top: 0"}
`;

type TextAreaProps = {
  $isWide?: boolean;
  $hidden?: boolean;
  $break?: boolean;
  $height?: string;
};

const Subheading = styled(Strongish)`
  display: block;
  margin-bottom: var(--spacing-s);
`;

const StyledSelect = styled(Select)<{ $isWide?: boolean }>`
  ${({ $isWide }) => $isWide && "grid-column: 1 / -1"};
`;

const StyledTextInput = styled(TextInput)<{
  $isWide?: boolean;
  $hidden?: boolean;
  $break?: boolean;
}>`
  ${({ $isWide }) => $isWide && "grid-column: 1 / -1"};
  ${({ $hidden }) => $hidden && "display: none"};
  ${({ $break }) => $break && "grid-column: 1 / -2"};

  label {
    ${fontMedium};
  }
`;

const StyledTextArea = styled(TextArea).attrs(({ $height }: TextAreaProps) => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  style: { "--textarea-height": $height },
}))<TextAreaProps>`
  ${({ $isWide }) => $isWide && "grid-column: 1 / -1"};
  ${({ $hidden }) => $hidden && "display: none"};
  ${({ $break }) => $break && "grid-column: 1 / -2"};

  label {
    ${fontMedium};
  }
`;

const StyledCheckbox = styled(Checkbox)`
  && label {
    ${fontRegular};
    line-height: var(--lineheight-l);

    a {
      text-decoration: underline;
      color: var(--color-black);
    }
  }
`;

// TODO duplicated in RecurringReservation
function removeRefParam<Type>(
  params: Type & { ref: unknown }
): Omit<Type, "ref"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { ref, ...rest } = params;
  return rest;
}

const ReservationFormField = ({
  field,
  options,
  reserveeType,
  required,
  reservation,
  t,
  params = {},
  data = {},
}: Props) => {
  const normalizedReserveeType =
    reserveeType?.toLocaleLowerCase() || "individual";

  const isWideRow = useMemo(
    (): boolean =>
      [
        "name",
        "description",
        "reserveeAddressStreet",
        "applyingForFreeOfCharge",
        // "reserveeOrganisationName",
        "billingAddressStreet",
        "purpose",
      ].includes(field),
    [field]
  );

  const {
    watch,
    register,
    control,
    formState: { errors },
  } = useFormContext();

  const isTextArea = useMemo(
    (): boolean => ["description"].includes(field),
    [field]
  );

  const isNumField = useMemo(
    (): boolean => ["numPersons"].includes(field),
    [field]
  );

  const isEmailField = useMemo(
    (): boolean => ["reserveeEmail", "billingEmail"].includes(field),
    [field]
  );

  const isBreakingColumn = useMemo(
    (): boolean =>
      [
        "showBillingAddress",
        "applyingForFreeOfCharge",
        "reserveeId",
        "reserveeIsUnregisteredAssociation",
      ].includes(field),
    [field]
  );

  const isReserveeIdRequired =
    field === "reserveeId" &&
    watch("reserveeIsUnregisteredAssociation") !== undefined
      ? watch("reserveeIsUnregisteredAssociation") !== true
      : required;

  const isFreeOfChargeReasonRequired =
    field === "freeOfChargeReason" && watch("applyingForFreeOfCharge") === true;

  const label = `${t(
    `reservationApplication:label.${normalizedReserveeType}.${field}`
  )}${required ? " * " : ""}`;

  const errorText = get(errors, field) && t("forms:requiredField");

  return Object.keys(options).includes(field) ? (
    <Controller
      name={field}
      control={control}
      key={field}
      rules={{ required }}
      render={({ field: formField }) => (
        <StyledSelect
          label={label}
          id={field}
          options={options[field]}
          defaultValue={options[field].find(
            (n) => n.value === get(reservation, field)
          )}
          {...removeRefParam(formField)}
          value={formField.value || null}
          error={errorText}
          required={required}
          invalid={!!get(errors, field)}
          $isWide={isWideRow}
        />
      )}
    />
  ) : field === "applyingForFreeOfCharge" ? (
    <StyledCheckboxWrapper
      key={field}
      $isWide={isWideRow}
      $break={isBreakingColumn}
    >
      <Subheading>
        {t("reservationApplication:label.subHeadings.subvention") as string}
      </Subheading>{" "}
      <Controller
        name={field}
        control={control}
        defaultValue={get(reservation, field)}
        rules={{ required }}
        render={({ field: formField }) => (
          <StyledCheckbox
            id={field}
            onChange={(e) => formField.onChange(e.target.checked)}
            checked={formField.value}
            label={data?.subventionLabel ?? label}
            errorText={errorText}
          />
        )}
      />
    </StyledCheckboxWrapper>
  ) : field === "reserveeIsUnregisteredAssociation" ? (
    <StyledCheckboxWrapper key={field} $break={isBreakingColumn}>
      <Controller
        name={field}
        control={control}
        defaultValue={get(reservation, field)}
        rules={{ required }}
        render={({ field: formField }) => (
          <Checkbox
            id={field}
            onChange={(e) => formField.onChange(e.target.checked)}
            checked={formField.value}
            defaultChecked={watch("reserveeIsUnregisteredAssociation")}
            label={label}
            errorText={errorText}
          />
        )}
      />
    </StyledCheckboxWrapper>
  ) : field === "showBillingAddress" ? (
    <StyledCheckboxWrapper key={field} $break={isBreakingColumn}>
      <Controller
        name={field}
        control={control}
        defaultValue={get(reservation, field)}
        rules={{ required }}
        render={({ field: formField }) => (
          <Checkbox
            id={field}
            onChange={(e) => formField.onChange(e.target.checked)}
            checked={formField.value}
            defaultChecked={get(reservation, field)}
            label={label}
            errorText={errorText}
          />
        )}
      />
    </StyledCheckboxWrapper>
  ) : field === "freeOfChargeReason" ? (
    <StyledTextArea
      // TODO this needs to be separated or use required like all the other components
      label={`${t(
        `reservationApplication:label.${normalizedReserveeType}.${field}`
      )}${isFreeOfChargeReasonRequired ? " * " : ""}`}
      id={field}
      key={field}
      {...register(field, { required: isFreeOfChargeReasonRequired })}
      defaultValue={get(reservation, field) || ""}
      errorText={errorText}
      invalid={!!get(errors, field)}
      $hidden={!watch("applyingForFreeOfCharge")}
      $isWide
      $height="92px"
    />
  ) : isNumField ? (
    <NumberInput
      label={`${label}`}
      id={field}
      {...register(field, {
        valueAsNumber: true,
        required,
        ...(required && {
          min: 1,
        }),
      })}
      key={field}
      errorText={errorText}
      invalid={!!get(errors, field)}
      step={1}
      minusStepButtonAriaLabel={t("common:decrease") || "Decrease"}
      plusStepButtonAriaLabel={t("common:increase") || "Increase"}
      min={
        get(params, field)?.min != null && !Number.isNaN(get(params, field).min)
          ? Number(get(params, field)?.min)
          : undefined
      }
      max={
        get(params, field)?.max != null && !Number.isNaN(get(params, field).max)
          ? Number(get(params, field)?.max)
          : undefined
      }
    />
  ) : isTextArea ? (
    <StyledTextArea
      label={label}
      id={field}
      {...register(field, {
        required,
        ...(isEmailField && {
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "email",
          },
        }),
      })}
      key={field}
      defaultValue={get(reservation, field)}
      errorText={
        get(errors, field) &&
        t(
          `forms:${
            get(errors, field)?.message === "email"
              ? "invalidEmail"
              : "requiredField"
          }`
        )
      }
      invalid={!!get(errors, field)}
      $isWide={isWideRow}
      $hidden={
        field.includes("billing") && watch("showBillingAddress") !== true
      }
      $break={isBreakingColumn}
      $height="119px"
    />
  ) : field === "reserveeId" ? (
    <StyledTextInput
      label={label}
      id={field}
      {...register(field, {
        required: isReserveeIdRequired,
      })}
      key={field}
      type="text"
      defaultValue={get(reservation, field)}
      errorText={errorText}
      invalid={!!get(errors, field)}
      $isWide={isWideRow}
      $hidden={
        watch("reserveeIsUnregisteredAssociation") === undefined
          ? get(reservation, "reserveeIsUnregisteredAssociation") === true
          : watch("reserveeIsUnregisteredAssociation") === true
      }
      $break={isBreakingColumn}
    />
  ) : (
    <StyledTextInput
      label={label}
      id={field}
      {...register(field, {
        required,
        ...(isEmailField && {
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "email",
          },
        }),
      })}
      key={field}
      type="text"
      errorText={
        get(errors, field) &&
        String(
          t(
            `forms:${
              get(errors, field)?.message === "email"
                ? "invalidEmail"
                : "requiredField"
            }`
          )
        )
      }
      invalid={!!get(errors, field)}
      $isWide={isWideRow}
      $hidden={
        field.includes("billing") && watch("showBillingAddress") !== true
      }
      $break={isBreakingColumn}
    />
  );
};

export default ReservationFormField;

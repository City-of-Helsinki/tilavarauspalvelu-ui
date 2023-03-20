import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { RadioButton, SelectionGroup, TextArea } from "hds-react";
import type { ReservationUnitType } from "common/types/gql-types";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import { ReservationTypes } from "./create-reservation/validator";
import MetadataSetForm from "./MetadataSetForm";
import BufferToggles from "./BufferToggles";

const CommentsTextArea = styled(TextArea)`
  max-width: var(--prose-width);
  margin: 1rem 0;
`;

// TODO are buffers in different places for Recurring and Single reservations? Check the UI spec
const ReservationTypeForm = ({
  reservationUnit,
  children,
}: {
  reservationUnit: ReservationUnitType;
  children?: React.ReactNode;
}) => {
  const { t } = useTranslation();

  const {
    watch,
    control,
    register,
    formState: { errors },
  } = useFormContext();

  const type = watch("type");

  return (
    <>
      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <SelectionGroup
            required
            disabled={reservationUnit == null}
            label={t("ReservationDialog.type")}
            errorText={
              errors.type?.message != null
                ? t(`ReservationDialog.validation.${errors.type?.message}`)
                : ""
            }
          >
            {ReservationTypes.map((v) => (
              <RadioButton
                key={v}
                id={v}
                checked={v === field.value}
                label={t(`ReservationDialog.reservationType.${v}`)}
                onChange={() => field.onChange(v)}
              />
            ))}
          </SelectionGroup>
        )}
      />
      {type === "BLOCKED" && (
        <CommentsTextArea
          label={t("ReservationDialog.comment")}
          id="ReservationDialog.comment"
          {...register("comments")}
        />
      )}
      {(type === "STAFF" || type === "NORMAL") && (
        <>
          {reservationUnit.bufferTimeBefore ||
            (reservationUnit.bufferTimeAfter && (
              <BufferToggles
                before={reservationUnit.bufferTimeBefore ?? undefined}
                after={reservationUnit.bufferTimeAfter ?? undefined}
              />
            ))}
          {children}
          <CommentsTextArea
            id="ReservationDialog.comment"
            label={t("ReservationDialog.comment")}
            {...register("comments")}
          />
          <MetadataSetForm reservationUnit={reservationUnit} />
        </>
      )}
    </>
  );
};

export default ReservationTypeForm;

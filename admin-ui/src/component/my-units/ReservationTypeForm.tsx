import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Accordion, RadioButton, SelectionGroup, TextArea } from "hds-react";
import type { ReservationUnitType } from "common/types/gql-types";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import { ReservationTypes } from "./create-reservation/validator";
import {
  ReservationMetadataSetForm,
  ReserverMetadataSetForm,
} from "./MetadataSetForm";
import BufferToggles from "./BufferToggles";
import { Element } from "./MyUnitRecurringReservation/commonStyling";
import ShowTOS from "./ShowTOS";
import { HR } from "../lists/components";

const CommentsTextArea = styled(TextArea)`
  grid-column: 1 / -1;
  max-width: var(--prose-width);
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
      <Element $wide>
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
                  ? t(
                      `MyUnits.RecurringReservationForm.errors.${errors.type?.message}`
                    )
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
      </Element>
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
          <HR style={{ gridColumn: "1 / -1" }} />
          <Element $wide>
            <ReservationMetadataSetForm reservationUnit={reservationUnit} />
            {/* TODO styling for this (and don't use heading) */}
            {type === "STAFF" ? (
              <Accordion heading="Näytä varaajan tiedot ja ehdot">
                <ReserverMetadataSetForm reservationUnit={reservationUnit} />
                <HR style={{ gridColumn: "1 / -1" }} />
                <ShowTOS reservationUnit={reservationUnit} />
              </Accordion>
            ) : (
              <>
                <ReserverMetadataSetForm reservationUnit={reservationUnit} />
                <HR style={{ gridColumn: "1 / -1" }} />
                <ShowTOS reservationUnit={reservationUnit} />
              </>
            )}
          </Element>
        </>
      )}
    </>
  );
};

export default ReservationTypeForm;

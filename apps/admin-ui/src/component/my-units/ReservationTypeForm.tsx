import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Notification, RadioButton, SelectionGroup, TextArea } from "hds-react";
import {
  Authentication,
  ReservationTypeChoice,
  type ReservationQuery,
} from "@gql/gql-types";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { type ReservationFormType, ReservationTypes } from "@/schemas";
import { ShowAllContainer } from "common/src/components/";
import {
  ReservationMetadataSetForm,
  ReserverMetadataSetForm,
} from "./MetadataSetForm";
import { BufferToggles } from "./BufferToggles";
import { Element } from "./MyUnitRecurringReservation/commonStyling";
import ShowTOS from "./ShowTOS";
import { HR } from "@/component/Table";

// TODO use a fragment
type ReservationType = NonNullable<ReservationQuery["reservation"]>;
type ReservationUnitType = Omit<
  NonNullable<ReservationType["reservationUnit"]>[0],
  "pricings"
>;

const CommentsTextArea = styled(TextArea)`
  grid-column: 1 / -1;
  max-width: var(--prose-width);
`;

const StyledShowAllContainer = styled(ShowAllContainer)`
  .ShowAllContainer__ToggleButton {
    color: var(--color-bus);
  }
`;

const TypeSelect = ({
  reservationUnit,
}: {
  reservationUnit: ReservationUnitType;
}) => {
  const {
    watch,
    control,
    formState: { errors },
  } = useFormContext<ReservationFormType>();
  const { t } = useTranslation();

  const type = watch("type");

  if (type === ReservationTypeChoice.Normal) {
    return <p>{t("reservationApplication:clientReservationCantBeChanged")}</p>;
  }

  const allowedTypesChoices = ReservationTypes.filter(
    (x) =>
      x !== ReservationTypeChoice.Normal && x !== ReservationTypeChoice.Seasonal
  );

  return (
    <Controller
      name="type"
      control={control}
      render={({ field }) => (
        <SelectionGroup
          required
          disabled={reservationUnit == null}
          label={t("reservationApplication:type")}
          errorText={
            errors.type?.message != null
              ? t(`reservationForm:errors.${errors.type?.message}`)
              : ""
          }
          tooltipText={t("reservationApplication:typeSelection.tooltip")}
        >
          {allowedTypesChoices.map((v) => (
            <RadioButton
              key={v}
              id={v}
              checked={v === field.value}
              label={t(`reservationApplication:reservationType.${v}`)}
              onChange={() => field.onChange(v)}
            />
          ))}
        </SelectionGroup>
      )}
    />
  );
};

// TODO are buffers in different places for Recurring and Single reservations? Check the UI spec
const ReservationTypeForm = ({
  reservationUnit,
  children,
  disableBufferToggle,
}: {
  reservationUnit: ReservationUnitType;
  children?: React.ReactNode;
  disableBufferToggle?: boolean;
}) => {
  const { t } = useTranslation();

  const { watch, register } = useFormContext<ReservationFormType>();

  const type = watch("type");

  return (
    <>
      <Element $wide>
        <TypeSelect reservationUnit={reservationUnit} />
      </Element>
      {type === ReservationTypeChoice.Blocked && (
        <CommentsTextArea
          label={t("reservationApplication:comment")}
          id="reservationApplication:comment"
          {...register("comments")}
        />
      )}
      {type !== ReservationTypeChoice.Blocked && (
        <>
          {type === ReservationTypeChoice.Behalf &&
            reservationUnit.authentication === Authentication.Strong && (
              <Element $wide>
                <Notification
                  label={t("reservationApplication:strongAuthentication.label")}
                  type="info"
                >
                  {t("reservationApplication:strongAuthentication.info")}
                </Notification>
              </Element>
            )}
          {!disableBufferToggle && (
            <BufferToggles
              before={reservationUnit.bufferTimeBefore ?? 0}
              after={reservationUnit.bufferTimeAfter ?? 0}
            />
          )}
          {children}
          <CommentsTextArea
            id="reservationApplication:comment"
            label={t("reservationApplication:comment")}
            {...register("comments")}
          />
          <HR style={{ gridColumn: "1 / -1" }} />
          <Element $wide>
            <div style={{ marginBottom: 48 }}>
              <ReservationMetadataSetForm reservationUnit={reservationUnit} />
            </div>
            {type === "STAFF" ? (
              <StyledShowAllContainer
                showAllLabel={t("MyUnits.ReservationForm.showReserver")}
                maximumNumber={0}
              >
                <ReserverMetadataSetForm reservationUnit={reservationUnit} />
                <HR style={{ gridColumn: "1 / -1" }} />
                <ShowTOS reservationUnit={reservationUnit} />
              </StyledShowAllContainer>
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

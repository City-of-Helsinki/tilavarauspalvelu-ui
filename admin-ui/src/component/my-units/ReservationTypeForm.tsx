import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { RadioButton, SelectionGroup } from "hds-react";
import type { ReservationUnitType } from "common/types/gql-types";
import { useTranslation } from "react-i18next";

// TODO fix paths
import {
  ReservationFormType,
  ReservationType,
} from "./create-reservation/types";
import BlockedReservation from "./create-reservation/BlockedReservation";
import StaffReservation from "./create-reservation/StaffReservation";

/* TODO from this point on this is same as the Recurring unit
 * Except buffers are in different places? Check the UI spec
 */
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
    formState: { errors },
    // FIXME use a common interface for this and recurring here
  } = useFormContext<ReservationFormType>();
  const type = watch("type");

  // TODO remove the Object.values
  // TODO set default value (in the form to avoid console.log errors)
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
            errorText={errors.type?.message}
          >
            {Object.values(ReservationType)
              .filter((v) => typeof v === "string")
              .map((v) => (
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
      {type === ReservationType.BLOCKED && <BlockedReservation />}
      {type === ReservationType.STAFF || type === ReservationType.NORMAL ? (
        <StaffReservation reservationUnit={reservationUnit}>
          {children}
        </StaffReservation>
      ) : null}
    </>
  );
};

export default ReservationTypeForm;

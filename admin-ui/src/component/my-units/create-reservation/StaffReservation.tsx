import React from "react";
import { Checkbox, SelectionGroup, TextArea } from "hds-react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ReservationUnitType } from "common/types/gql-types";
import { ReservationForm } from "./types";
import { HR } from "../../lists/components";
import MetadataSetForm from "./MetadataSetForm";

type Props = {
  form: UseFormReturn<ReservationForm>;
  reservationUnit: ReservationUnitType;
};

const StaffReservation = ({ form, reservationUnit }: Props): JSX.Element => {
  const { t } = useTranslation();

  const hasBuffer =
    !!reservationUnit.bufferTimeBefore || reservationUnit.bufferTimeAfter;
  return (
    <>
      {hasBuffer && (
        <SelectionGroup label={t("ReservationDialog.buffers")}>
          {reservationUnit.bufferTimeBefore && (
            <Controller
              name="bufferTimeBefore"
              control={form.control}
              render={({ field }) => (
                <Checkbox
                  id="bufferTimeBefore"
                  checked={String(field.value) === "true"}
                  label={t(`ReservationDialog.bufferTimeBefore`, {
                    minutes: reservationUnit.bufferTimeBefore / 60,
                  })}
                  {...field}
                  value={String(field.value)}
                  onChange={() => {
                    form.setValue("bufferTimeBefore", !field.value);
                  }}
                />
              )}
            />
          )}
          {reservationUnit.bufferTimeAfter && (
            <Controller
              name="bufferTimeAfter"
              control={form.control}
              render={({ field }) => (
                <Checkbox
                  id="bufferTimeAfter"
                  checked={String(field.value) === "true"}
                  label={t(`ReservationDialog.bufferTimeAfter`, {
                    minutes: reservationUnit.bufferTimeAfter / 60,
                  })}
                  {...field}
                  value={String(field.value)}
                  onChange={() => {
                    form.setValue("bufferTimeAfter", !field.value);
                  }}
                />
              )}
            />
          )}
        </SelectionGroup>
      )}
      <TextArea
        label={t("ReservationDialog.comment")}
        id="ReservationDialog.comment"
        {...form.register("workingMemo")}
      />
      <HR />
      <MetadataSetForm reservationUnit={reservationUnit} form={form} />
    </>
  );
};

StaffReservation.displayName = "StaffResedrvation";
export default StaffReservation;

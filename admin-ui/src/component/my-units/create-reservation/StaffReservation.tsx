import React from "react";
import { Checkbox, SelectionGroup, TextArea } from "hds-react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ReservationUnitType } from "common/types/gql-types";
import { ReservationFormType } from "./types";
import { HR } from "../../lists/components";
import MetadataSetForm from "./MetadataSetForm";

type Props = {
  form: UseFormReturn<ReservationFormType>;
  reservationUnit: ReservationUnitType;
};

const StaffReservation = ({ form, reservationUnit }: Props): JSX.Element => {
  const { t } = useTranslation();

  const bufferControllers = [] as JSX.Element[];

  if (reservationUnit.bufferTimeBefore > 0) {
    bufferControllers.push(
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
    );
  }

  if (reservationUnit.bufferTimeAfter > 0) {
    bufferControllers.push(
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
    );
  }

  return (
    <>
      {bufferControllers.length > 0 && (
        <SelectionGroup label={t("ReservationDialog.buffers")}>
          {bufferControllers}
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

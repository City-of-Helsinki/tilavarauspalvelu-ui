import React from "react";
import { Checkbox, SelectionGroup, TextArea } from "hds-react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ReservationUnitType } from "common/types/gql-types";
import { ReservationFormType } from "./types";
import { HR } from "../../lists/components";
import MetadataSetForm from "./MetadataSetForm";

const BufferController = (
  name: "bufferTimeBefore" | "bufferTimeAfter",
  seconds: number,
  form: UseFormReturn<ReservationFormType>
) => {
  const { t } = useTranslation();

  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field }) => (
        <Checkbox
          id={name}
          checked={String(field.value) === "true"}
          label={t(`ReservationDialog.${name}`, {
            minutes: seconds / 60,
          })}
          {...field}
          value={String(field.value)}
          onChange={() => {
            form.setValue(name, !field.value);
          }}
        />
      )}
    />
  );
};

type Props = {
  form: UseFormReturn<ReservationFormType>;
  reservationUnit: ReservationUnitType;
};

const StaffReservation = ({ form, reservationUnit }: Props) => {
  const { t } = useTranslation();

  const bufferControllers = [] as JSX.Element[];

  if (reservationUnit.bufferTimeBefore) {
    bufferControllers.push(
      BufferController(
        "bufferTimeBefore",
        reservationUnit.bufferTimeBefore,
        form
      )
    );
  }

  if (reservationUnit.bufferTimeAfter) {
    bufferControllers.push(
      BufferController("bufferTimeAfter", reservationUnit.bufferTimeAfter, form)
    );
  }

  return (
    <>
      {bufferControllers.length > 0 ? (
        <SelectionGroup label={t("ReservationDialog.buffers")}>
          {bufferControllers}
        </SelectionGroup>
      ) : null}
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

export default StaffReservation;

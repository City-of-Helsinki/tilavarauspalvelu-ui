import React from "react";
import { Checkbox, SelectionGroup, TextArea } from "hds-react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ReservationUnitType } from "common/types/gql-types";
import { HR } from "../../lists/components";
import MetadataSetForm from "./MetadataSetForm";

type BufferControllerProps = {
  name: "bufferTimeBefore" | "bufferTimeAfter";
  seconds: number;
};
const BufferController = ({ name, seconds }: BufferControllerProps) => {
  const { t } = useTranslation();

  const { control, setValue } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
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
            setValue(name, !field.value);
          }}
        />
      )}
    />
  );
};

type Props = {
  reservationUnit: ReservationUnitType;
};

const StaffReservation = ({ reservationUnit }: Props) => {
  const { t } = useTranslation();

  const { register } = useFormContext();

  return (
    <>
      {reservationUnit.bufferTimeAfter ||
        (reservationUnit.bufferTimeAfter && (
          <SelectionGroup label={t("ReservationDialog.buffers")}>
            {reservationUnit.bufferTimeBefore && (
              <BufferController
                name="bufferTimeBefore"
                seconds={reservationUnit.bufferTimeBefore}
              />
            )}
            {reservationUnit.bufferTimeAfter && (
              <BufferController
                name="bufferTimeAfter"
                seconds={reservationUnit.bufferTimeAfter}
              />
            )}
          </SelectionGroup>
        ))}
      <TextArea
        label={t("ReservationDialog.comment")}
        id="ReservationDialog.comment"
        {...register("workingMemo")}
      />
      <HR />
      <MetadataSetForm reservationUnit={reservationUnit} />
    </>
  );
};

export default StaffReservation;

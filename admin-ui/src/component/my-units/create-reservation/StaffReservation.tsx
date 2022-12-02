import React from "react";
import { Checkbox, SelectionGroup, TextArea } from "hds-react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ReservationForm } from "./types";

const StaffReservation = ({
  form,
}: {
  form: UseFormReturn<ReservationForm>;
}): JSX.Element => {
  const { t } = useTranslation();
  console.log("rendering with", form.getValues());

  return (
    <>
      <SelectionGroup
        label={t("ReservationDialog.buffers")}
        errorText={form.formState.errors.type?.message}
      >
        <Controller
          name="date"
          control={form.control}
          render={({ field }) => {
            console.log("rendering with", field);
            return (
              <Checkbox
                id="bufferTimeBefore"
                checked={String(field.value) === "true"}
                label={t(`ReservationDialog.bufferTimeBefore`)}
                {...field}
                onChange={() => {
                  form.setValue("bufferTimeBefore", false);
                }}
              />
            );
          }}
        />
        <Checkbox
          id="bufferTimeAfter"
          checked={form.getValues("bufferTimeAfter")}
          label={t(`ReservationDialog.bufferTimeAfter`)}
          {...form.register("bufferTimeAfter")}
        />
      </SelectionGroup>
      <TextArea
        label={t("ReservationDialog.comment")}
        id="ReservationDialog.comment"
        {...form.register("workingMemo")}
        errorText={form.formState.errors.workingMemo?.message}
      />
    </>
  );
};

export default StaffReservation;

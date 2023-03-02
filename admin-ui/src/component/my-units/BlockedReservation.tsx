import React from "react";
import { TextArea } from "hds-react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

const BlockedReservation = (): JSX.Element => {
  const { t } = useTranslation();

  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <TextArea
      label={t("ReservationDialog.comment")}
      id="ReservationDialog.comment"
      {...register("workingMemo")}
      errorText={String(errors.workingMemo?.message)}
    />
  );
};

export default BlockedReservation;

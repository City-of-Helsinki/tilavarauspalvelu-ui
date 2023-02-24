import React from "react";
import { TextArea } from "hds-react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ReservationUnitType } from "common/types/gql-types";
import { HR } from "../../lists/components";
import MetadataSetForm from "./MetadataSetForm";
import BufferToggles from "./BufferToggles";

type Props = {
  reservationUnit: ReservationUnitType;
};

const StaffReservation = ({ reservationUnit }: Props) => {
  const { t } = useTranslation();

  const { register } = useFormContext();

  return (
    <>
      {reservationUnit.bufferTimeBefore ||
        (reservationUnit.bufferTimeAfter && (
          <BufferToggles
            before={reservationUnit.bufferTimeBefore ?? undefined}
            after={reservationUnit.bufferTimeAfter ?? undefined}
          />
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

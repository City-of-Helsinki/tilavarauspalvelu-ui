import React from "react";
import { ReservationUnitType } from "common/types/gql-types";
import MetadataSetForm from "./MetadataSetForm";
import BufferToggles from "./BufferToggles";

type Props = {
  reservationUnit: ReservationUnitType;
  children?: React.ReactNode;
};

// TODO move to the parent directory
// TODO rename this to Reservation Form or something?
const StaffReservation = ({ reservationUnit, children }: Props) => {
  return (
    <>
      {reservationUnit.bufferTimeBefore ||
        (reservationUnit.bufferTimeAfter && (
          <BufferToggles
            before={reservationUnit.bufferTimeBefore ?? undefined}
            after={reservationUnit.bufferTimeAfter ?? undefined}
          />
        ))}
      {children != null && children}
      <MetadataSetForm reservationUnit={reservationUnit} />
    </>
  );
};

export default StaffReservation;

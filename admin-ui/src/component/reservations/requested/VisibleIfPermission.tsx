import React from "react";
import { type Query, type ReservationType } from "common/types/gql-types";
import { useQuery } from "@apollo/client";
import { useAuthState } from "../../../context/AuthStateContext";
import { CURRENT_USER } from "../../../context/queries";

const VisibleIfOwnOrPermission = ({
  reservation,
  permissionName,
  children,
}: {
  reservation: ReservationType;
  permissionName: "can_manage_reservations" | "can_comment_reservations";
  children: React.ReactNode;
}) => {
  const serviceSectorPks =
    reservation?.reservationUnits?.[0]?.unit?.serviceSectors
      ?.map((x) => x?.pk)
      ?.filter((x): x is number => x != null) ?? [];

  const unitPk = reservation?.reservationUnits?.[0]?.unit?.pk ?? undefined;

  const { data: user } = useQuery<Query>(CURRENT_USER);

  const { hasPermission } = useAuthState().authState;
  const permission = hasPermission(permissionName, unitPk, serviceSectorPks);

  const isUsersOwnReservation = reservation?.user?.pk === user?.currentUser?.pk;

  const ownPermissions = isUsersOwnReservation
    ? hasPermission("can_create_staff_reservations", unitPk, serviceSectorPks)
    : false;

  const userIsAllowToModify = permission || ownPermissions;
  if (!userIsAllowToModify) {
    return null;
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};

export default VisibleIfOwnOrPermission;

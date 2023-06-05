import React from "react";
import { type ReservationType } from "common/types/gql-types";
import { usePermission } from "./hooks";

const VisibleIfPermission = ({
  reservation,
  permissionName,
  children,
  otherwise,
}: {
  reservation: ReservationType;
  permissionName:
    | "can_manage_reservations"
    | "can_comment_reservations"
    | "can_view_reservations";
  children: React.ReactNode;
  otherwise?: React.ReactNode;
}) => {
  const { hasPermission } = usePermission();

  if (!hasPermission(reservation, permissionName)) {
    return otherwise ? <>{otherwise}</> : null;
  }

  return <>{children}</>;
};

export default VisibleIfPermission;

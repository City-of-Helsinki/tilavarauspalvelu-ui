import React from "react";
import { type Query, type ReservationType } from "common/types/gql-types";
import { useQuery } from "@apollo/client";
import { useAuthState } from "../../../context/AuthStateContext";
import { CURRENT_USER } from "../../../context/queries";

type Props = {
  unitPk: number;
  serviceSectorPks: number[];
  permissionName: string;
  children: React.ReactNode;
  otherwise?: React.ReactNode;
};

const VisibleIfPermission = ({
  unitPk,
  serviceSectorPks,
  permissionName,
  children,
  otherwise,
}: Props): JSX.Element => {
  const { hasPermission } = useAuthState().authState;
  const permission = hasPermission(permissionName, unitPk, serviceSectorPks);

  return (
    <>
      {permission && children}
      {!permission && otherwise}
    </>
  );
};

const VisibleIfPermissionWrapper = (props: {
  unitPk?: number;
  serviceSectorPks: number[];
  permissionName: string;
  children: React.ReactNode;
  otherwise?: React.ReactNode;
}) => {
  const { unitPk } = props;

  if (!unitPk) {
    return null;
  }
  if (props.serviceSectorPks.length === 0) {
    return null;
  }

  return <VisibleIfPermission {...props} unitPk={unitPk} />;
};

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

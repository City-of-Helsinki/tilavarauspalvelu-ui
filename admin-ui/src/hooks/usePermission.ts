import { useSuspenseQuery, useQuery } from "@apollo/client";
import { useSession } from "next-auth/react";
import { type Query, type ReservationType } from "common/types/gql-types";
import {
  hasPermission as baseHasPermission,
  hasSomePermission as baseHasSomePermission,
  hasAnyPermission as baseHasAnyPermission,
  Permission,
} from "app/modules/permissionHelper";
import { CURRENT_USER } from "app/context/queries";

/// @param enableSuspense - if true, the apollo query allows wrapping inside a Suspense component.
/// Don't suspend unless you need to, because it breaks some things.
/// @returns {user, hasPermission, hasSomePermission, hasAnyPermission}
const usePermission = (enableSuspense = false) => {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const { data, error: qError } = useQuery<Query>(CURRENT_USER, {
    skip: !isAuthenticated && enableSuspense,
    fetchPolicy: "cache-and-network",
    errorPolicy: "none",
  });
  const { data: suspendedData, error: suspendedError } =
    useSuspenseQuery<Query>(CURRENT_USER, {
      skip: !isAuthenticated && !enableSuspense,
      fetchPolicy: "cache-and-network",
      errorPolicy: "none",
    });

  const user = enableSuspense ? suspendedData : data;
  const error = enableSuspense ? suspendedError : qError;

  const hasSomePermission = (permissionName: Permission) => {
    if (!isAuthenticated || error || !user?.currentUser) return false;
    return baseHasSomePermission(user?.currentUser, permissionName);
  };

  const hasAnyPermission = () => {
    if (!isAuthenticated || error || !user?.currentUser) return false;
    return baseHasAnyPermission(user?.currentUser);
  };

  const hasPermission = (
    reservation: ReservationType,
    permissionName: Permission,
    includeOwn = true
  ) => {
    if (!isAuthenticated || error || !user?.currentUser) return false;

    const serviceSectorPks =
      reservation?.reservationUnits?.[0]?.unit?.serviceSectors
        ?.map((x) => x?.pk)
        ?.filter((x): x is number => x != null) ?? [];

    const unitPk = reservation?.reservationUnits?.[0]?.unit?.pk ?? undefined;

    const permissionCheck = baseHasPermission(user?.currentUser);
    const permission = permissionCheck(
      permissionName,
      unitPk,
      serviceSectorPks
    );

    const isUsersOwnReservation =
      reservation?.user?.pk === user?.currentUser?.pk;

    const ownPermissions =
      includeOwn && isUsersOwnReservation
        ? permissionCheck(
            Permission.CAN_CREATE_STAFF_RESERVATIONS,
            unitPk,
            serviceSectorPks
          )
        : false;

    return permission || ownPermissions;
  };

  const actualUser =
    isAuthenticated && user?.currentUser ? user.currentUser : undefined;
  return {
    user: actualUser,
    hasPermission,
    hasSomePermission,
    hasAnyPermission,
  };
};

export default usePermission;

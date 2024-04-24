import { useSession } from "app/hooks/auth";
import type {
  UnitNode,
  ReservationNode,
  UserNode,
  ApplicationRoundNode,
} from "common/types/gql-types";
import {
  hasPermission as baseHasPermission,
  hasSomePermission as baseHasSomePermission,
  hasAnyPermission as baseHasAnyPermission,
  Permission,
} from "@/modules/permissionHelper";
import { filterNonNullable } from "common/src/helpers";

const hasUnitPermission = (
  user: UserNode | undefined,
  permissionName: Permission,
  unit: UnitNode | undefined
): boolean => {
  if (user == null || unit?.pk == null) {
    return false;
  }

  const serviceSectorPks =
    unit?.serviceSectors
      ?.map((x) => x?.pk)
      ?.filter((x): x is number => x != null) ?? [];

  const permission = baseHasPermission(user)(
    permissionName,
    unit.pk,
    serviceSectorPks
  );

  return permission;
};

const hasPermission = (
  user: UserNode | undefined,
  reservation: ReservationNode,
  permissionName: Permission,
  includeOwn = true
) => {
  if (!user) {
    return false;
  }

  const { unit } = reservation?.reservationUnit?.[0] ?? {};
  const serviceSectorPks = filterNonNullable(
    unit?.serviceSectors?.map((x) => x?.pk)
  );

  const unitPk = unit?.pk ?? undefined;

  const permissionCheck = baseHasPermission(user);
  const permission = permissionCheck(permissionName, unitPk, serviceSectorPks);

  const isUsersOwnReservation = reservation?.user?.pk === user?.pk;

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

/// @returns {user, hasPermission, hasSomePermission, hasAnyPermission}
const usePermission = () => {
  const { user } = useSession();

  const hasSomePermission = (permissionName: Permission) => {
    if (!user) return false;
    return baseHasSomePermission(user, permissionName);
  };

  const hasAnyPermission = () => {
    if (!user) return false;
    return baseHasAnyPermission(user);
  };

  // TODO restrict the Permission type to only those that are applicable to application rounds
  const hasApplicationRoundPermission = (
    applicationRound: ApplicationRoundNode,
    permission: Permission
  ) => {
    if (!user) return false;
    const units = filterNonNullable(
      applicationRound.reservationUnits.flatMap((ru) => ru.unit)
    );
    for (const unit of units) {
      if (hasUnitPermission(user, permission, unit)) {
        return true;
      }
    }
    return false;
  };

  // TODO this is becoming convoluted with the addition of a new function for each object type
  return {
    user,
    hasPermission: (
      reservation: ReservationNode,
      permissionName: Permission,
      includeOwn = true
    ) => hasPermission(user, reservation, permissionName, includeOwn),
    hasSomePermission,
    hasAnyPermission,
    hasUnitPermission: (permission: Permission, unit: UnitNode) =>
      hasUnitPermission(user, permission, unit),
    hasApplicationRoundPermission,
  };
};

// NOTE duplicated code from usePermission, because react hooks break if we do some conditional magic
// Suspended version should be used sparingly because it has to be wrapped in a Suspense component
// and if not it can go to infinite loops or crash.
const usePermissionSuspended = () => {
  // TODO should this be suspended? doesn't seem to need it
  const { user } = useSession();

  const hasSomePermission = (permissionName: Permission) => {
    if (!user) return false;
    return baseHasSomePermission(user, permissionName);
  };

  const hasAnyPermission = () => {
    if (!user) return false;
    return baseHasAnyPermission(user);
  };

  return {
    user,
    hasPermission: (
      reservation: ReservationNode,
      permissionName: Permission,
      includeOwn = true
    ) => hasPermission(user, reservation, permissionName, includeOwn),
    hasSomePermission,
    hasAnyPermission,
  };
};

export { usePermissionSuspended };

export default usePermission;

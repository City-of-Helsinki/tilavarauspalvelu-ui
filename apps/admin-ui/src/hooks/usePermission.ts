import { useSession } from "app/hooks/auth";
import {
  UnitType,
  type ReservationType,
  type UserType,
} from "common/types/gql-types";
import {
  hasPermission as baseHasPermission,
  hasSomePermission as baseHasSomePermission,
  hasAnyPermission as baseHasAnyPermission,
  Permission,
} from "app/modules/permissionHelper";

const hasUnitPermission = (
  user: UserType | undefined,
  permissionName: Permission,
  unit: UnitType | undefined
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
  user: UserType | undefined,
  reservation: ReservationType,
  permissionName: Permission,
  includeOwn = true
) => {
  if (!user) {
    return false;
  }

  const serviceSectorPks =
    reservation?.reservationUnits?.[0]?.unit?.serviceSectors
      ?.map((x) => x?.pk)
      ?.filter((x): x is number => x != null) ?? [];

  const unitPk = reservation?.reservationUnits?.[0]?.unit?.pk ?? undefined;

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

  return {
    user,
    hasPermission: (
      reservation: ReservationType,
      permissionName: Permission,
      includeOwn = true
    ) => hasPermission(user, reservation, permissionName, includeOwn),
    hasSomePermission,
    hasAnyPermission,
    hasUnitPermission: (permission: Permission, unit: UnitType) =>
      hasUnitPermission(user, permission, unit),
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
      reservation: ReservationType,
      permissionName: Permission,
      includeOwn = true
    ) => hasPermission(user, reservation, permissionName, includeOwn),
    hasSomePermission,
    hasAnyPermission,
  };
};

export { usePermissionSuspended };

export default usePermission;
